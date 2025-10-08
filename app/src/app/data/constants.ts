interface WeightsProps {
    [key: string]: number;
}

export const DEFAULT_WEIGHTS: WeightsProps = {
    apy: 0.35,
    commission: 0.22,
    stakeSweetSpot: 0.20,
    lowStakeBuffer: 0.10,
    veryLowStakeBuffer: 0.25,
    withdrawChurn: 0.06,
    growthPending: 0.04,
    dominance: 0.06,
    atRiskEpochs: 0.10,
};