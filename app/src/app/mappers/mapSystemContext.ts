import { SuiSystemStateSummary } from "@mysten/sui/client";
import { SystemContext } from "../types/SystemContext";

const B = (x: string | number | bigint) => BigInt(x);

function tuplesToMap(tuples: readonly (readonly [string, string])[] | undefined) {
    const out: Record<string, bigint> = {};
    for (const [addr, epochs] of tuples ?? []) {
        out[addr] = B(epochs);
    }
    return out;
}
export function mapSystemContext(s: SuiSystemStateSummary): SystemContext {
    console.log("Mapping SuiSystemStateSummary:", s);
    return {
        totalStake: B(s.totalStake),
        validatorLowStakeThreshold: B(s.validatorLowStakeThreshold),
        validatorVeryLowStakeThreshold: B(s.validatorVeryLowStakeThreshold),
        validatorLowStakeGracePeriod: B(s.validatorLowStakeGracePeriod),
        atRiskValidators: tuplesToMap(s.atRiskValidators),
        activeValidatorCount: s.activeValidators?.length ?? 0,
    };
}