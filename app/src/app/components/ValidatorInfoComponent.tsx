"use client"

import * as React from "react"
import { useGetValidatorInfo } from "../hooks/useGetValidatorInfo";
import { Spinner } from "./ui/spinner";
import { ValidatorInfo } from "../types/ValidatorInfo";
import { useEffect } from "react";
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function ValidatorInfoComponent(props: { address: string }) {
    const { validatorInfo, isLoading } = useGetValidatorInfo(props.address);
    console.log(validatorInfo);
    let data: ValidatorInfo | null = validatorInfo;

    useEffect(() => {
        data = validatorInfo;
    }, [!validatorInfo]);


    return (
        <div className="my-7">
            {(!data && isLoading) && <Spinner />}
            {!isLoading && data &&
                <div className="w-full">
                    <div className="w-full mb-2 overflow-hidden">
                        <div className="p-2 text-2xl font-bold">  {data.name} </div>
                    </div>


                    <div className="flex flex-row xl:flex-row w-full justify-between space-x-4">
                        <div className="flex flex-col md:flex-col w-full justify-between space-x-4">
                            <div className="p-2 text-gray-500 text-sm font-bold">  All Time </div>
                            <div className="flex flex-row md:flex-row w-full justify-between space-x-4">
                                <div className="flex flex-row md:flex-row w-full mb-2 overflow-hidden rounded-md border p-7 bg-white shadow-lg">
                                    <div className="flex flex-col md:flex-col w-full justify-between space-x-4">
                                        <div className="p-2 text-gray-500 text-sm font-bold">  Ranking</div>
                                        <div className="p-2 text-2xl font-bold">  #{data.rankingOverall} </div>
                                    </div>
                                    <div className="flex flex-col md:flex-col w-full justify-between space-x-4">
                                        <div className="p-2  text-gray-500 text-sm font-bold">  Score</div>
                                        <div className="p-2 text-2xl font-bold"> {(Number(data.historicalScore)).toFixed(2)}% </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row xl:flex-row w-full justify-between space-x-4">
                        <div className="flex flex-col md:flex-col w-full justify-between space-x-4">
                            <div className="p-2 text-gray-500 text-sm font-bold">  Last 30 Epochs </div>
                            <div className="w-full mb-2 overflow-hidden rounded-md border p-7 bg-white shadow-lg">
                                <div>
                                    <div className="p-2 text-gray-500 text-sm font-bold">  Ranking</div>
                                    <div className="p-2 text-2xl font-bold">  #{data.rankingLast30Epochs} </div>

                                    <div className="p-2  text-gray-500 text-sm font-bold">  Score</div>
                                    <div className="p-2 text-2xl font-bold"> {(Number(data.scoreLast30Epochs)).toFixed(2)}% </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-col w-full justify-between space-x-4">
                            <div className="p-2 text-gray-500 text-sm font-bold"> Last 180 Epochs </div>
                            <div className="flex flex-col md:flex-row w-full justify-between space-x-4">
                                <div className="w-full mb-2 overflow-hidden rounded-md border p-7 bg-white shadow-lg">
                                    <div>
                                        <div className="p-2 text-gray-500 text-sm font-bold">  Ranking</div>
                                        <div className="p-2 text-2xl font-bold">  #{data.rankingLast180Epochs} </div>

                                        <div className="p-2  text-gray-500 text-sm font-bold">  Score</div>
                                        <div className="p-2 text-2xl font-bold"> {(Number(data.scoreLast180Epochs)).toFixed(2)}% </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}