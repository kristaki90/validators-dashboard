import { Validator } from "./Validator"

export interface SuiSystemState {
    epoch: string,
    avgAPY: string | null,
    totalStaked: number,
    nextEpochReferenceGasPrice: number,
    activeValidators: Validator[],
}
