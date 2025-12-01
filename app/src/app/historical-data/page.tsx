import HistoricalDataTableComponent from "@/app/components/HistoricalDataTableComponent";
import TitleComponent from "@/app/components/TitleComponent";

export default function HistoricalData() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#faf5ff] to-[#fef3ff]">
            <div>
                <TitleComponent title="Historical Data" /></div>
            <div className="container mx-auto p-7">
                <HistoricalDataTableComponent />
            </div>
        </div>

    );
}
