export type Weights = {
    apy: number;                // + higher APY
    commission: number;         // - higher commission (bps)
    stakeSweetSpot: number;     // + near ideal stake, - too small / too big
    lowStakeBuffer: number;     // - near/below low threshold
    veryLowStakeBuffer: number; // - near/below very-low threshold (heavier)
    withdrawChurn: number;      // - large pending withdrawals
    growthPending: number;      // + pendingStake ratio (mild)
    dominance: number;          // - oversized voting power share (decentralization)
    atRiskEpochs: number;       // - how many epochs flagged in atRiskValidators
};