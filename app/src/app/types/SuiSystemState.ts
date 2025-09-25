import { Validator } from "./Validator"

export interface SuiSystemState {
    epoch: string,
    avgAPY: number,
    totalStaked: number,
    nextEpochReferenceGasPrice: number,
    activeValidators: Validator[],
}
