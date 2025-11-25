import HistoricalDataTableComponent from "@/app/components/HistoricalDataTableComponent";
import TitleComponent from "@/app/components/TitleComponent";

export default function HistoricalData() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-400">
            <div className=" bg-slate-500">
                <TitleComponent title="Historical Data" /></div>
            <div className="container mx-auto p-7">
                <HistoricalDataTableComponent />
            </div>
        </div>

    );
}
