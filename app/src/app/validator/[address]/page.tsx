"use client"

import StakingRewardsComponent from "@/app/components/StakingRewardsComponent";
import TitleComponent from "@/app/components/TitleComponent";
import ValidatorInfoComponent from "@/app/components/ValidatorInfoComponent";
import { useParams } from "next/navigation";

export default function ValidatorView() {
    const params = useParams();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <div>
                <TitleComponent title="Validator View" /></div>
            <div className="container mx-auto p-7">
                <ValidatorInfoComponent address={params.address as string} />
                <StakingRewardsComponent address={params.address as string} />
            </div>
        </div>

    );
}
