"use client"

import TitleComponent from "../components/TitleComponent"
import AverageApyPerEpochComponent from "../components/AverageApyPerEpochComponent"

export default function AverageApy() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#faf5ff] to-[#fef3ff]">
            <div>
                <TitleComponent title="Average APY Per Epoch" subtitle="View the average APY across all validators for each epoch." />
            </div>
            <div className="container mx-auto p-7">
                <AverageApyPerEpochComponent />
            </div>
        </div>
    )
}

