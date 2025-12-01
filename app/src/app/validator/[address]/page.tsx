"use client"

import StakingRewardsComponent from "@/app/components/StakingRewardsComponent";
import TitleComponent from "@/app/components/TitleComponent";
import ValidatorInfoComponent from "@/app/components/ValidatorInfoComponent";
import { useParams } from "next/navigation";

export default function ValidatorView() {
    const params = useParams();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#faf5ff] to-[#fef3ff]">
            <div>
                <TitleComponent title="Validator View" /></div>
            <div className="container mx-auto p-7">
                <ValidatorInfoComponent address={params.address as string} />
                <StakingRewardsComponent address={params.address as string} />
            </div>
        </div>

    );
}
