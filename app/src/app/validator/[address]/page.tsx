"use client"

import TitleComponent from "@/app/components/TitleComponent";
import ValidatorInfoComponent from "@/app/components/ValidatorInfoComponent";
import { useParams } from "next/navigation";

export default function ValidatorView() {
    const params = useParams();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-400">
            <div className=" bg-slate-500">
                <TitleComponent title="Validator View" /></div>
            <div className="container mx-auto p-7">
                <ValidatorInfoComponent address={params.address as string} />
            </div>
        </div>

    );
}
