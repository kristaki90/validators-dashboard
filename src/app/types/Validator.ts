export interface Validator {
    address: string
    stake: string | null
    nextEpochStake: string
    currentEpochGasPrice: string | null
    nextEpochGasPrice: string
    apy: string | null
}
