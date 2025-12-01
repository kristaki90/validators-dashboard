export interface Validator {
    name: string
    imageUrl: string
    address: string
    rank: number
    stake: string
    stakeSharePercentage: number
    nextEpochStake: string
    currentEpochGasPrice: string
    nextEpochGasPrice: string
    apy: number
    commissionRate: string
    votingPower: string
    pendingStake: string
    pendingTotalSuiWithdraw: string
    scoring: number
}
