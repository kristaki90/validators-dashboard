"use client"

import * as React from "react"
import { Spinner } from "./ui/spinner";
import { StakingRewards } from "../types/StakingRewards";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function StakingRewardsComponent(props: { address: string }) {
    const [stakingRewards, setStakingRewards] = useState<StakingRewards>();
    const [isLoading, setIsLoading] = useState(false);
    const [stake, setStake] = useState<number | undefined>();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStake(Number(e.target.value));
    };

    const calculateRewards = () => {
        console.log(stake)
        setIsLoading(true);
        fetch(`https://sui-validators-dashboard.onrender.com/api/simulate-staking-rewards/${props.address}/${stake}`)
            .then((response) => response.json())
            .then((data) => {
                setIsLoading(false);
                console.log(data);
                setStakingRewards(data);
            })
            .catch((err) => {
                setIsLoading(false);
                console.log(err.message);
            });
    };

    return (
        <div className="my-7">
            <div className="w-full">
                <div className="flex flex-row xl:flex-row w-full justify-between space-x-4">
                    <div className="flex flex-col md:flex-col w-full justify-between space-x-4">
                        <div className="p-2 text-gray-500 text-sm font-bold">  Calculate Rewards </div>
                        <div className="flex flex-row md:flex-row w-full justify-between space-x-4">
                            <div className="w-full mb-2 overflow-hidden rounded-md border p-7 bg-white shadow-lg">
                                <div className="flex flex-col md:flex-col w-full justify-between space-y-6">
                                    <div className="flex flex-col md:flex-col w-full justify-between space-x-4">
                                        <div className="flex w-full max-w-sm items-center gap-2">
                                            <Input
                                                disabled={!props.address}
                                                value={stake}
                                                onChange={handleChange}
                                                placeholder="Stake"
                                                id="stake"
                                            />
                                            <Button
                                                variant={"outline"}
                                                onClick={() => calculateRewards()}
                                                disabled={isLoading}
                                            > Calculate </Button>
                                        </div>
                                    </div>

                                    {(isLoading) && <Spinner />}
                                    {(!isLoading) && stakingRewards && <div className="flex flex-col md:flex-col w-full justify-between space-x-4">
                                        <div className="flex flex-col md:flex-row w-full justify-between space-x-4">
                                            <div>
                                                <div className="flex flex-row md:flex-row w-full justify-between space-x-4">
                                                    <div className="p-2 text-gray-500 text-sm font-bold">  Initial Stake:</div>
                                                    <div className="p-2 text-md font-bold">  #{stakingRewards.initialStake} </div>
                                                </div>
                                                <div className="flex flex-row md:flex-row w-full justify-between space-x-4">
                                                    <div className="p-2 text-gray-500 text-sm font-bold">  Epoch Now:</div>
                                                    <div className="p-2 text-md font-bold">  #{stakingRewards.epochNow} </div>
                                                </div>
                                                <div className="flex flex-row md:flex-row w-full justify-between space-x-4">
                                                    <div className="p-2  text-gray-500 text-sm font-bold">  Starting Epoch:</div>
                                                    <div className="p-2 text-md font-bold"> #{stakingRewards.epochStart} </div>
                                                </div>
                                                <div className="flex flex-row md:flex-row w-full justify-between space-x-4">
                                                    <div className="p-2  text-gray-500 text-sm font-bold">  Final Amount:</div>
                                                    <div className="p-2 text-md font-bold"> {(Number(stakingRewards.finalAmount)).toFixed(2)} </div>
                                                </div>
                                                <div className="flex flex-row md:flex-row w-full justify-between space-x-4">
                                                    <div className="p-2  text-gray-500 text-sm font-bold">  SUI Gain:</div>
                                                    <div className="p-2 text-md font-bold"> {(Number(stakingRewards.gainSui)).toFixed(2)} </div>
                                                </div>
                                                <div className="flex flex-row md:flex-row w-full justify-between space-x-4">
                                                    <div className="p-2  text-gray-500 text-sm font-bold">  Return Percent:</div>
                                                    <div className="p-2 text-md font-bold"> {(Number(stakingRewards.returnPercent)).toFixed(2)}% </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}