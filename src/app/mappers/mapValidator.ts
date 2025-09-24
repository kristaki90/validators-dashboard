import { SuiValidatorSummary } from "@mysten/sui/client";
import { Validator } from "../types/Validator";
import { ValidatorApy } from "@mysten/sui/client";

export const mapValidator = (validator: SuiValidatorSummary, apys: ValidatorApy[]): Validator => {
  const validatorApy = apys.filter((apy) =>
    apy.address == validator.suiAddress);
  if (validator.suiAddress.startsWith("0x44b1b319")) {
    console.log("validator", validator);
  }
  return {
    address: validator.suiAddress,
    stake: validator.stakingPoolSuiBalance,
    nextEpochStake: validator.nextEpochStake,
    currentEpochGasPrice: null,
    nextEpochGasPrice: validator.nextEpochGasPrice,
    apy: validatorApy[0].apy,
    commissionRate: validator.commissionRate,
  };
};
