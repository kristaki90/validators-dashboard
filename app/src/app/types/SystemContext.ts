export type SystemContext = {
    totalStake: bigint;                          // u64
    validatorLowStakeThreshold: bigint;          // u64
    validatorVeryLowStakeThreshold: bigint;      // u64
    validatorLowStakeGracePeriod: bigint;        // u64 (epochs)
    atRiskValidators: Record<string, bigint>;    // address -> epochs below low threshold
    activeValidatorCount: number;                // number of active validators
};