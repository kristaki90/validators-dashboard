"use client"

import { useGetLatestSuiSystemState } from "@/app/hooks/useGetLatestSuiSystemState";
import * as React from "react"

export default function InfoComponent() {
    const { suiSystemState, isLoading } = useGetLatestSuiSystemState();

    return (
        <div className="my-7">
            {!isLoading && suiSystemState &&
                <div className="w-full">
                    <div className="flex flex-col xl:flex-row w-full justify-between space-x-4">
                        <div className="flex flex-col md:flex-row w-full justify-between space-x-4">
                            <div className="w-full mb-2 min-h-40 overflow-hidden rounded-md border p-7 bg-white shadow-lg">
                                <div className="p-2 text-gray-500 text-sm font-bold">  Epoch </div>
                                <div className="p-2 text-2xl font-bold">  {suiSystemState?.epoch} </div>
                            </div>
                            <div className="w-full mb-2 min-h-40 overflow-hidden rounded-md border p-7 bg-white shadow-lg">
                                <div className="p-2  text-gray-500 text-sm font-bold">  Avg. APY </div>
                                <div className="p-2 text-2xl font-bold">  {(suiSystemState.avgAPY * 100).toFixed(3)}% </div>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row w-full justify-between space-x-4">
                            <div className="w-full mb-2 min-h-40 overflow-hidden rounded-md border p-7 bg-white shadow-lg">
                                <div className="p-2 text-gray-500 text-sm font-bold">  Total Staked </div>

                                <div className="p-2 flex flex-row w-full justify-left items-end">
                                    <div className=" text-2xl font-bold">  {Math.floor(suiSystemState.totalStaked).toLocaleString()} </div>
                                    <div className=" text-gray-500 text-sm font-bold">  .{(suiSystemState.totalStaked % 2).toFixed(2).substring(2)} SUI </div>
                                </div>
                            </div>
                            <div className="w-full mb-2 min-h-40 overflow-hidden rounded-md border p-7 bg-white shadow-lg text-align-left">
                                <div className="p-2 text-gray-500 text-sm font-bold">  Next Epoch Reference Gas Price </div>

                                <div className="p-2 flex flex-row w-full justify-left items-end">
                                    <div className="text-2xl font-bold ">  {suiSystemState?.nextEpochReferenceGasPrice.toLocaleString()} </div>
                                    <div className="pl-1 text-gray-500 text-sm font-bold">  MIST </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}