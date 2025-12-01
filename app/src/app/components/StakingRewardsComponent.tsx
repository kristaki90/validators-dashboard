"use client"

import * as React from "react"
import { Spinner } from "./ui/spinner";
import { StakingRewards } from "../types/StakingRewards";
import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function StakingRewardsComponent(props: { address: string }) {
    const [stakingRewards, setStakingRewards] = useState<StakingRewards>();
    const [isLoading, setIsLoading] = useState(false);
    const [stakeInput, setStakeInput] = useState<string>("");

    const normalizedStake = useMemo(() => {
        const numericStake = Number(stakeInput);
        return Number.isFinite(numericStake) && numericStake > 0 ? numericStake : null;
    }, [stakeInput]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStakeInput(e.target.value);
    };

    const calculateRewards = () => {
        if (!normalizedStake) {
            return;
        }

        setIsLoading(true);
        fetch(`https://sui-validators-dashboard.onrender.com/api/simulate-staking-rewards/${props.address}/${normalizedStake}`)
            .then((response) => response.json())
            .then((data) => {
                setIsLoading(false);
                setStakingRewards(data);
            })
            .catch((err) => {
                setIsLoading(false);
                console.log(err.message);
            });
    };

    const rewardCards = stakingRewards ? [
        {
            label: "Initial Stake",
            value: `${Number(stakingRewards.initialStake).toLocaleString()} SUI`,
            hint: "What you started with",
        },
        {
            label: "Current Epoch",
            value: `#${stakingRewards.epochNow}`,
            hint: "Simulation resolves here",
        },
        {
            label: "Start Epoch",
            value: `#${stakingRewards.epochStart}`,
            hint: "Simulation begins here",
        },
        {
            label: "SUI Gain",
            value: `${(Number(stakingRewards.gainSui)).toFixed(2)} SUI`,
            hint: "Estimated rewards",
        },
        {
            label: "Reward %",
            value: `${(Number(stakingRewards.returnPercent)).toFixed(2)}%`,
            hint: "APY-equivalent return",
        },
        {
            label: "Final Amount",
            value: `${(Number(stakingRewards.finalAmount)).toFixed(2)} SUI`,
            hint: "Stake + rewards",
        },
    ] : [];

    return (
        <section className="my-10">
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
                <div className="p-6 md:p-10 space-y-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Rewards Simulator</p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight">Calculate Potential SUI Earnings</h2>
                        <p className="mt-2 text-sm text-white/80 max-w-2xl">
                            Enter a stake amount to model projected rewards for this validator based on recent network data.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label htmlFor="stake" className="text-xs font-semibold uppercase tracking-wide text-white/80">
                                    Stake Amount (SUI)
                                </label>
                                <Input
                                    id="stake"
                                    type="number"
                                    min="0"
                                    step="any"
                                    disabled={!props.address}
                                    value={stakeInput}
                                    onChange={handleChange}
                                    placeholder="e.g. 10,000"
                                    className="mt-1 text-base bg-white/95 text-slate-900"
                                />
                            </div>
                            <Button
                                size="lg"
                                className="md:w-auto bg-white text-slate-900 hover:bg-slate-100"
                                onClick={calculateRewards}
                                disabled={isLoading || !normalizedStake}
                            >
                                {isLoading ? "Calculating..." : "Calculate rewards"}
                            </Button>
                        </div>

                        <div className="mt-6 min-h-[120px]">
                            {isLoading && (
                                <div className="flex justify-center py-6">
                                    <Spinner />
                                </div>
                            )}

                            {!isLoading && stakingRewards && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {rewardCards.map((card) => (
                                        <div key={card.label} className="rounded-2xl bg-white text-slate-900 p-4 shadow-md">
                                            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
                                            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
                                            <p className="text-xs text-slate-500 mt-1">{card.hint}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isLoading && !stakingRewards && (
                                <div className="rounded-xl bg-white/20 p-6 text-center text-white/80">
                                    Enter a stake amount to see projected rewards.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}