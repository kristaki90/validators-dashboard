import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { Validator } from "../types/Validator";
import { mapValidator } from "../mappers/mapValidator";
import { SuiSystemState } from "../types/SuiSystemState";
import { mistToSui } from "../helpers/suiConversion";

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
        console.log("Got latest sui system state: ", resp);

        suiClient.getValidatorsApy({}).then((apyResp) => {
          const validatorObjects = resp.activeValidators.map(
            (data) => mapValidator(data, apyResp.apys),
          );

          const sumApy: number = apyResp.apys.reduce((sum, apy) => sum + apy.apy, 0);
          const avgApy: number = sumApy / apyResp.apys.length;

          const suiSystemState: SuiSystemState = {
            epoch: resp.epoch,
            avgAPY: avgApy,
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
        console.log("Error getting validators: ", err);
        setIsLoading(false);
      });
  };

  return {
    suiSystemState,
    validators,
    isLoading,
  };
};