"use client"

import * as React from "react"
import { useGetValidatorInfo } from "../hooks/useGetValidatorInfo";
import { Spinner } from "./ui/spinner";
import { ValidatorInfo } from "../types/ValidatorInfo";
import { useEffect, useMemo } from "react";
import { useGetLatestSuiSystemState } from "../hooks/useGetLatestSuiSystemState";
import { mistToSui } from "../helpers/suiConversion";
import { safetyIssues } from "../helpers/safetyIssues";

export default function ValidatorInfoComponent(props: { address: string }) {
    const { validatorInfo, isLoading } = useGetValidatorInfo(props.address);
    const { validators, isLoading: isSystemStateLoading, systemContext } = useGetLatestSuiSystemState();

    console.log(validatorInfo);
    let data: ValidatorInfo | null = validatorInfo;

    useEffect(() => {
        data = validatorInfo;
    }, [!validatorInfo]);

    const validatorStakeInfo = useMemo(() => {
        if (!validators?.length) {
            return null;
        }

        return validators.find((validator) => validator.address === props.address) ?? null;
    }, [validators, props.address]);

    const formattedStake = validatorStakeInfo
        ? `${Math.round(mistToSui(Number(validatorStakeInfo.stake))).toLocaleString()} SUI`
        : null;

    const formattedStakeShare = validatorStakeInfo
        ? `${(Number(validatorStakeInfo.stakeSharePercentage) * 100).toFixed(2)}% Pool Share`
        : null;

    const safety = useMemo(() => {
        if (!validatorStakeInfo || !systemContext) {
            return { hasIssues: false, issues: [], messages: [] };
        }
        return safetyIssues(validatorStakeInfo, systemContext);
    }, [validatorStakeInfo, systemContext]);

    return (
        <div className="my-7">
            {(!data && isLoading) && <Spinner />}
            {!isLoading && data && (
                <div className="space-y-6">
                    {safety.hasIssues && (
                        <section className="rounded-2xl border-2 border-red-600 bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-xl">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="rounded-full bg-gradient-to-br from-red-600 to-red-700 p-2.5 shadow-lg border border-red-800/30">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-red-900 mb-2">⚠️ Safety Alert</h3>
                                    <p className="text-sm text-red-800 mb-2 font-medium">This validator has the following safety concerns:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {safety.messages.map((message, index) => (
                                            <li key={index} className="text-sm text-red-800 font-medium">{message}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}
                    <section className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl">
                        <div className="p-6 md:p-8 flex flex-col gap-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <p className="uppercase text-xs tracking-[0.2em] text-white/70">Validator</p>
                                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{data.name}</h1>
                                    <p className="mt-2 text-sm font-mono text-white/80 break-all">{props.address}</p>
                                </div>
                                {(validatorStakeInfo && !isSystemStateLoading) && (
                                    <div className="rounded-xl bg-white/15 px-6 py-4 backdrop-blur">
                                        <p className="text-xs uppercase tracking-wide text-white/80">Stake</p>
                                        <p className="text-2xl font-bold">{formattedStake}</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                                    <p className="text-xs uppercase tracking-wide text-white/70">Overall Rank</p>
                                    <p className="text-3xl font-bold mt-2">#{data.rankingOverall}</p>
                                </div>
                                <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                                    <p className="text-xs uppercase tracking-wide text-white/70">Historical Score</p>
                                    <p className="text-3xl font-bold mt-2">{(Number(data.historicalScore)).toFixed(2)}%</p>
                                </div>
                                {(validatorStakeInfo && !isSystemStateLoading) && (
                                    <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                                        <p className="text-xs uppercase tracking-wide text-white/70">Pool Share</p>
                                        <p className="text-3xl font-bold mt-2">{(Number(validatorStakeInfo.stakeSharePercentage) * 100).toFixed(2)}%</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Last 30 Epochs</p>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Ranking</p>
                                    <p className="text-2xl font-bold mt-1">#{data.rankingLast30Epochs}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Score</p>
                                    <p className="text-2xl font-bold mt-1">{(Number(data.scoreLast30Epochs)).toFixed(2)}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Last 180 Epochs</p>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Ranking</p>
                                    <p className="text-2xl font-bold mt-1">#{data.rankingLast180Epochs}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Score</p>
                                    <p className="text-2xl font-bold mt-1">{(Number(data.scoreLast180Epochs)).toFixed(2)}%</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}