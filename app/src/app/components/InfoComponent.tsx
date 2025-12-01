"use client"

import { useGetLatestSuiSystemState } from "@/app/hooks/useGetLatestSuiSystemState";
import * as React from "react"

const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
        ...options,
    }).format(value);

export default function InfoComponent() {
    const { suiSystemState, isLoading } = useGetLatestSuiSystemState();

    const metricCards = React.useMemo(() => {
        if (!suiSystemState) {
            return [];
        }

        return [
            {
                label: "Active Validators",
                value: formatNumber(suiSystemState.activeValidators.length),
                hint: "Currently participating in consensus",
            },
            {
                label: "Total Staked",
                value: `${formatNumber(suiSystemState.totalStaked)} SUI`,
                hint: "Sum of delegated stake",
            },
        ];
    }, [suiSystemState]);

    if (isLoading || !suiSystemState) {
        return (
            <section className="my-10">
                <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 text-center text-slate-500 shadow-2xl">
                    Loading live network stats...
                </div>
            </section>
        );
    }

    return (
        <section className="my-10">
            <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl">
                <div className="space-y-6 p-6">
                    <div className="flex flex-col gap-6 px-2 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Network Snapshot</p>
                            <h3 className="mt-1 text-3xl font-extrabold tracking-tight">
                                Epoch #{suiSystemState.epoch}
                            </h3>
                            <p className="mt-2 text-sm text-white/85">
                                Monitoring validator performance and rewards in real time.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:gap-6">
                            <div className="rounded-2xl bg-white/10 px-6 py-4 backdrop-blur">
                                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Avg APY</p>
                                <p className="text-2xl font-semibold">{(suiSystemState.avgAPY * 100).toFixed(2)}%</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 px-6 py-4 backdrop-blur">
                                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Next Gas Price</p>
                                <p className="text-2xl font-semibold">{suiSystemState.nextEpochReferenceGasPrice.toLocaleString()} MIST</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {metricCards.map((card) => (
                            <div
                                key={card.label}
                                className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                            >
                                <p className="text-xs uppercase tracking-wide text-white/70">{card.label}</p>
                                <p className="mt-2 text-3xl font-bold">{card.value}</p>
                                <p className="mt-1 text-sm text-white/80">{card.hint}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
