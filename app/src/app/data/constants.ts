interface WeightsProps {
    [key: string]: number;
}

export const DEFAULT_WEIGHTS: WeightsProps = {
    // positives
    apy: 0.35,
    stakeSweetSpot: 0.20,
    growthPending: 0.04,
    // penalties
    commission: 0.22,
    lowStakeBuffer: 0.10,
    veryLowStakeBuffer: 0.25,
    withdrawChurn: 0.06,
    dominance: 0.06,
    atRiskEpochs: 0.10,
};
