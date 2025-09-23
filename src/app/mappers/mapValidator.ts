import { SuiValidatorSummary } from "@mysten/sui/client";
import { Validator } from "../types/Validator";

export const mapValidator = (validator: SuiValidatorSummary): Validator => {
  return {
    address: validator.suiAddress,
    stake: null,
    nextEpochStake: validator.nextEpochStake,
    currentEpochGasPrice: null,
    nextEpochGasPrice: validator.nextEpochGasPrice,
    apy: null,
  };
};
