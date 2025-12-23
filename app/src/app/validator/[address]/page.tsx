"use client"

import StakingRewardsComponent from "@/app/components/StakingRewardsComponent";
import TitleComponent from "@/app/components/TitleComponent";
import ValidatorInfoComponent from "@/app/components/ValidatorInfoComponent";
import ApyChartComponent from "@/app/components/ApyChartComponent";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { HiInformationCircle } from "react-icons/hi2";
import { HiChartBar } from "react-icons/hi2";

export default function ValidatorView() {
    const params = useParams();
    const [activeTab, setActiveTab] = useState("info");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [params.address]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#faf5ff] to-[#fef3ff]">
            <div>
                <TitleComponent title="Validator View" />
            </div>
            <div className="container mx-auto p-7">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex gap-6">
                    <TabsList className="flex-shrink-0 bg-white/60 backdrop-blur rounded-2xl p-2 shadow-lg border border-slate-200/50">
                        <TabsTrigger value="info" title="Validator Information">
                            <HiInformationCircle className="w-6 h-6" />
                        </TabsTrigger>
                        <TabsTrigger value="analytics" title="Analytics & Charts">
                            <HiChartBar className="w-6 h-6" />
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="min-w-0 flex-1">
                        <ValidatorInfoComponent address={params.address as string} />
                        <StakingRewardsComponent address={params.address as string} />
                    </TabsContent>
                    <TabsContent value="analytics" className="min-w-0 flex-1">
                        <ApyChartComponent address={params.address as string} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
