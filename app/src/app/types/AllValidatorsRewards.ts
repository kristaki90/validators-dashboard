import { StakingRewards } from "./StakingRewards";

export interface ValidatorRewardsResult {
    address: string;
    name?: string;
    rewards: StakingRewards;
}

export interface AllValidatorsRewards {
    results: ValidatorRewardsResult[];
}

