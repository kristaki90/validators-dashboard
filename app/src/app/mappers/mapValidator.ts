import { SuiValidatorSummary } from "@mysten/sui/client";
import { Validator } from "../types/Validator";
import { ValidatorApy } from "@mysten/sui/client";
import { scoreValidatorSui } from "../helpers/scoring";
import { SystemContext } from "../types/SystemContext";

export const mapValidator = (validator: SuiValidatorSummary, apys: ValidatorApy[], systemContext: SystemContext): Validator => {
  const validatorApy = apys.filter((apy) =>
    apy.address == validator.suiAddress);

  const mappedValidator = {
    name: validator.name,
    imageUrl: validator.imageUrl,
    address: validator.suiAddress,
    stake: validator.stakingPoolSuiBalance,
    nextEpochStake: validator.nextEpochStake,
    currentEpochGasPrice: validator.gasPrice,
    nextEpochGasPrice: validator.nextEpochGasPrice,
    apy: validatorApy[0].apy,
    commissionRate: validator.commissionRate,
    votingPower: validator.votingPower,
    pendingStake: validator.pendingStake,
    pendingTotalSuiWithdraw: validator.pendingTotalSuiWithdraw,
    scoring: 0, // to be filled later by scoreValidatorSui
  }


  const apyByAddress: Record<string, number> = {};
  apyByAddress[mappedValidator.address] = mappedValidator.apy;

  const scoring = scoreValidatorSui(mappedValidator, systemContext, apyByAddress);

  mappedValidator.scoring = scoring;

  return mappedValidator;
};
