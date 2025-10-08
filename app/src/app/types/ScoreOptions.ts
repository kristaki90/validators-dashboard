import { Weights } from "./Weights";

export type ScoreOptions = {
    // If not provided, idealStake defaults to equal share: totalStake / activeValidatorCount
    idealStake?: bigint;
    // If not provided, maxStake defaults to 3x idealStake (discourages dominance)
    maxStake?: bigint;
    // Expected APY top of range for normalization; 0.10 means 10% → score 1.0
    apyTop?: number;
    // Weight knobs (sum doesn’t need to be 1; they’re relative)
    weights?: Partial<Weights>;
};