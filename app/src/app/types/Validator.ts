export interface Validator {
    name: string
    imageUrl: string | null
    address: string
    stake: string | null
    nextEpochStake: string
    currentEpochGasPrice: string | null
    nextEpochGasPrice: string
    apy: number
    commissionRate: string
}
