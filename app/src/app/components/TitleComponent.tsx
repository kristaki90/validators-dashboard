"use client"

import * as React from "react"

interface TitleComponentProps {
    title: string
    subtitle?: string
}

export default function TitleComponent({ title, subtitle }: TitleComponentProps) {
    return (
        <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow">
            <div className="relative container mx-auto flex w-full items-center justify-between px-7 py-2">
                <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/70">Sui Validators</p>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
                    {subtitle && (
                        <p className="text-xs text-white/85 max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">Network</p>
                    <p className="text-base font-semibold">Mainnet</p>
                </div>
            </div>
        </div>
    );
}