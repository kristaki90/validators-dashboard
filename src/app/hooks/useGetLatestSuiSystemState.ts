import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { Validator } from "../types/Validator";
import { mapValidator } from "../mappers/mapValidator";
import { SuiSystemState } from "../types/SuiSystemState";
import { mistToSui } from "../helpers/suiConversion";
import { ValidatorApy } from "@mysten/sui/client";
import { useGetValidatorsApy } from "./useGetValidatorsApy";


export const useGetLatestSuiSystemState = () => {
  const { suiClient } = useSui();

  const [validators, setValidators] = useState<Validator[]>([]);
  const [suiSystemState, setSuiSystemState] = useState<SuiSystemState>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getValidators();
  }, [!validators]);

  const getValidators = async () => {
    console.log("Getting validators...");
    setIsLoading(true);
    suiClient
      .getLatestSuiSystemState({})
      .then((resp) => {

        suiClient.getValidatorsApy({}).then((apyResp) => {
          const validatorObjects = resp.activeValidators.map(
            (data) => mapValidator(data, apyResp.apys),
          );

          const suiSystemState: SuiSystemState = {
            epoch: resp.epoch,
            avgAPY: null,
            totalStaked: mistToSui(Number(resp.totalStake)),
            nextEpochReferenceGasPrice: Number(resp.referenceGasPrice),
            activeValidators: validatorObjects,
          };
          setSuiSystemState(suiSystemState);
          setValidators(validatorObjects);
          
          setIsLoading(false);
        });
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  return {
    suiSystemState,
    validators,
    isLoading,
  };
};