import { SuiValidatorSummary } from "@mysten/sui/client";
import { Validator } from "../types/Validator";
import { ValidatorApy } from "@mysten/sui/client";

export const mapValidator = (validator: SuiValidatorSummary, apys: ValidatorApy[]): Validator => {
  const validatorApy = apys.filter((apy) =>
    apy.address == validator.suiAddress);

  return {
    name: validator.name,
    imageUrl: validator.imageUrl,
    address: validator.suiAddress,
    stake: validator.stakingPoolSuiBalance,
    nextEpochStake: validator.nextEpochStake,
    currentEpochGasPrice: validator.gasPrice,
    nextEpochGasPrice: validator.nextEpochGasPrice,
    apy: validatorApy[0].apy,
    commissionRate: validator.commissionRate,
  };
};
