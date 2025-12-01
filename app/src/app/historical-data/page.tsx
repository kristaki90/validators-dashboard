import HistoricalDataTableComponent from "@/app/components/HistoricalDataTableComponent";
import TitleComponent from "@/app/components/TitleComponent";

export default function HistoricalData() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <div>
                <TitleComponent title="Historical Data" /></div>
            <div className="container mx-auto p-7">
                <HistoricalDataTableComponent />
            </div>
        </div>

    );
}
