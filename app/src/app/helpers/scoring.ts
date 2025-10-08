import { DEFAULT_WEIGHTS } from "../data/constants";
import { ApyMap } from "../types/ApyMap";
import { ScoreOptions } from "../types/ScoreOptions";
import { SystemContext } from "../types/SystemContext";
import { Validator } from "../types/Validator";
import { Weights } from "../types/Weights";

// ---------- helpers ----------
const bi = (x: bigint | string | number) => (typeof x === 'bigint' ? x : BigInt(x));

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Return a safe decimal ratio a/b as number (scaled via bigints to avoid precision loss). */
function ratio(a: bigint, b: bigint, scale: bigint = 1000000n): number {
    if (b <= 0n) return 0;
    return Number((a * scale) / b) / Number(scale);
}

/** Commission bps -> [0..1] penalty (0% = 0, 10% = ~0.67, 15% = 1.0) */
function commissionPenalty(commissionBps: number): number {
    return clamp01(commissionBps / 1500); // normalize to 15% = 1.0
}

/** APY -> [0..1] score; apyTop ~ 10% by default to cap at 1.0 */
function apyScore(apy: number | undefined, apyTop = 0.10): number {
    if (apy == null || apy <= 0) return 0.5; // neutral if unknown
    return clamp01(apy / apyTop);
}

/** Sweet spot around idealStake with soft penalty when too small/large; all as bigint. */
function stakeSweetSpotScore(total: bigint, ideal: bigint, max: bigint): number {
    if (ideal <= 0n || max <= 0n) return 0.5;
    // express relative to ideal
    const x = ratio(total, ideal);
    // smooth peak at x=1; drop off on both sides
    const left = 1 / (1 + Math.exp(-10 * (x - 0.6)));  // reward passing ~60% of ideal
    const center = Math.exp(-Math.pow((x - 1), 2) / 0.12); // bell around ideal
    const right = 1 - 1 / (1 + Math.exp(-6 * (x - Number(ratio(max, ideal))))); // discourage >> max
    const score = 0.55 * center + 0.35 * left + 0.10 * (1 - right);
    return clamp01(score);
}

/** Penalty for being below/near a threshold. Uses a soft buffer = 10% of threshold. */
function thresholdPenalty(current: bigint, threshold: bigint): number {
    if (threshold <= 0n) return 0;
    const soft = threshold / 10n; // 10%
    if (current < 0n) return 1;   // not expected, but guard
    const d = current - threshold;
    if (d < 0n) return 1;         // below threshold = max penalty
    if (soft <= 0n) return 0;
    // within the soft buffer above threshold → partial penalty
    const p = Number(soft - (d < soft ? d : soft)) / Number(soft);
    return clamp01(p);
}

/** Churn = share of stake being withdrawn (pendingTotalSuiWithdraw / poolBalance). */
function withdrawChurnPenalty(pendingWithdraw: bigint, pool: bigint): number {
    return clamp01(ratio(pendingWithdraw, pool) / 0.15); // ≥15% withdrawal queued ≈ max penalty
}

/** Pending growth = pendingStake / pool (mild positive). */
function growthScore(pending: bigint, pool: bigint): number {
    return clamp01(ratio(pending, pool) / 0.10); // 10% growth pending ≈ full score
}

/** Dominance = voting power share vs equal share; penalize if > 2x equal share. */
function dominancePenalty(votingPower: bigint, totalStake: bigint, n: number): number {
    if (n <= 0) return 0;
    const share = ratio(votingPower, totalStake);     // 0..1
    const equal = 1 / n;
    if (equal <= 0) return 0;
    const excess = share / equal;                     // 1 = equal share, 2 = 2x, etc.
    if (excess <= 2) return 0;
    // Map 2x→0, 4x→1 (cap)
    return clamp01((excess - 2) / 2);
}

/** atRisk epochs penalty scaled by grace period */
function atRiskPenalty(epochsAtRisk: bigint, grace: bigint): number {
    if (grace <= 0n) return 0;
    return clamp01(Number(epochsAtRisk) / Number(grace));
}

// ---------- main scorer ----------
export function scoreValidatorSui(
    v: Validator,
    sys: SystemContext,
    apyByAddress?: ApyMap,
    opts?: ScoreOptions
): number {
    const w = { ...DEFAULT_WEIGHTS, ...(opts?.weights ?? {}) } as Weights;

    const commissionBps = Number(v.commissionRate);
    const commission = commissionPenalty(commissionBps);

    const apy = apyByAddress?.[v.address];
    const sAPY = apyScore(apy, opts?.apyTop ?? 0.10);

    const totalStake = bi(v.nextEpochStake);
    const pool = bi(v.stake);
    const pending = bi(v.pendingStake);
    const pendingWithdraw = bi(v.pendingTotalSuiWithdraw);
    const voting = bi(v.votingPower);

    const ideal = opts?.idealStake ?? (bi(sys.totalStake) / BigInt(Math.max(sys.activeValidatorCount, 1)));
    const max = opts?.maxStake ?? (ideal * 3n);

    const sStake = stakeSweetSpotScore(totalStake, ideal, max);

    const lowPen = thresholdPenalty(totalStake, bi(sys.validatorLowStakeThreshold));
    const veryLowPen = thresholdPenalty(totalStake, bi(sys.validatorVeryLowStakeThreshold));

    const churnPen = withdrawChurnPenalty(pendingWithdraw, pool);
    const sGrowth = growthScore(pending, pool);

    const domPen = dominancePenalty(voting, bi(sys.totalStake), sys.activeValidatorCount);

    const riskEpochs = bi(sys.atRiskValidators?.[v.address] ?? 0n);
    const riskPen = atRiskPenalty(riskEpochs, bi(sys.validatorLowStakeGracePeriod));

    // Weighted linear combination (positives add; penalties subtract).
    const raw =
        w.apy * sAPY
        + w.stakeSweetSpot * sStake
        + w.growthPending * sGrowth
        - w.commission * commission
        - w.lowStakeBuffer * lowPen
        - w.veryLowStakeBuffer * veryLowPen
        - w.withdrawChurn * churnPen
        - w.dominance * domPen
        - w.atRiskEpochs * riskPen;

    // Normalize to [0..1] for friendly output
    return clamp01((raw + 1) / 2);
}