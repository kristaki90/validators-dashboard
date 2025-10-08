export interface Validator {
    name: string
    imageUrl: string
    address: string
    stake: string
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
