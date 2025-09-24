import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { ValidatorsApy } from "@mysten/sui/client";


export const useGetValidatorsApy = () => {
  const { suiClient } = useSui();

  const [validatorsApy, setValidatorsApy] = useState<ValidatorsApy | null>(null);
  const [isLoadingApy, setIsLoadingApy] = useState(false);

  useEffect(() => {
    getValidatorsApy();
  }, [!validatorsApy]);

  const getValidatorsApy = async () => {
    console.log("Getting validators APY...");
    setIsLoadingApy(true);
    suiClient
      .getValidatorsApy({})
      .then((resp) => {
        console.log("ValidatorsApy: ", resp);
        setValidatorsApy(resp);
      })
      .catch((err) => {
        setIsLoadingApy(false);
      });
  };

  return {
    validatorsApy,
    isLoadingApy,
  };
};