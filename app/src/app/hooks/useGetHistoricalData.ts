import { useEffect, useState } from "react";
export const useGetHistoricalData = () => {

    const [historicalData, setHistoricalData] = useState<[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getHistoricalData();
    }, [!historicalData]);

    const getHistoricalData = async () => {
        console.log("Getting Historical Data...");
        setIsLoading(true);

        fetch('https://sui-validators-dashboard.onrender.com/api/validator-scores')
            .then((response) => response.json())
            .then((data) => {
                setIsLoading(false);
                setHistoricalData(data);
            })
            .catch((err) => {
                setIsLoading(false);
                console.log(err.message);
            });
    };

    return {
        historicalData,
        isLoading,
    };
};