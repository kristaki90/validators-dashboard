import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { Validator } from "../types/Validator";
import { mapValidator } from "../mappers/mapValidator";
import { SuiSystemState } from "../types/SuiSystemState";
import { mistToSui } from "../helpers/suiConversion";
import { mapSystemContext } from "../mappers/mapSystemContext";
import { SystemContext } from "../types/SystemContext";
export const useGetLatestSuiSystemState = () => {
  const { suiClient } = useSui();

  const [validators, setValidators] = useState<Validator[]>([]);
  const [suiSystemState, setSuiSystemState] = useState<SuiSystemState>();
  const [systemContext, setSystemContext] = useState<SystemContext>();
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

        const systemContext = mapSystemContext(resp);

        console.log("Mapped system context: ", systemContext);

        // get APYs

        suiClient.getValidatorsApy({}).then((apyResp) => {
          const validatorObjects = resp.activeValidators.map(
            (data) => mapValidator(data, apyResp.apys, systemContext),
          );

          const rankedValidators = (() => {
            const sortedByScore = [...validatorObjects].sort(
              (a, b) => Number(b.scoring) - Number(a.scoring),
            );

            const rankByAddress = new Map<string, number>();
            sortedByScore.forEach((validator, index) => {
              rankByAddress.set(validator.address, index + 1);
            });

            return validatorObjects.map((validator) => ({
              ...validator,
              rank: rankByAddress.get(validator.address) ?? 0,
            }));
          })();

          const sumApy: number = apyResp.apys.reduce((sum, apy) => sum + apy.apy, 0);
          const avgApy: number = sumApy / apyResp.apys.length;

          const suiSystemState: SuiSystemState = {
            epoch: resp.epoch,
            avgAPY: avgApy,
            totalStaked: mistToSui(Number(resp.totalStake)),
            nextEpochReferenceGasPrice: Number(resp.referenceGasPrice),
            activeValidators: rankedValidators,
          };

          setSuiSystemState(suiSystemState);
          setValidators(rankedValidators);
          setSystemContext(systemContext);

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
    systemContext,
    isLoading,
  };
};