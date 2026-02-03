"use client"

import TitleComponent from "../components/TitleComponent"
import AllValidatorsPredictionsComponent from "../components/AllValidatorsPredictionsComponent"

export default function Predictions() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#faf5ff] to-[#fef3ff]">
            <div>
                <TitleComponent title="All Validators Predictions" subtitle="View predicted APY values for all validators." />
            </div>
            <div className="container mx-auto p-7">
                <AllValidatorsPredictionsComponent />
            </div>
        </div>
    )
}

