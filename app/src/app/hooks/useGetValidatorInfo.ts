import { useEffect, useState } from "react";
import { ValidatorInfo } from "../types/ValidatorInfo";
export const useGetValidatorInfo = (address: string) => {

    const [validatorInfo, setValidatorInfo] = useState<ValidatorInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getValidatorScores();
    }, [!validatorInfo]);

    const getValidatorScores = async () => {
        console.log("Getting Validator Data...");
        setIsLoading(true);

        fetch(`https://sui-validators-dashboard.onrender.com/api/validator-score-by-address/${address}`)
            .then((response) => response.json())
            .then((data) => {
                setIsLoading(false);
                setValidatorInfo(data);
            })
            .catch((err) => {
                setIsLoading(false);
                console.log(err.message);
            });
    };

    return {
        validatorInfo,
        isLoading,
    };
};