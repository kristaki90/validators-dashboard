import InfoComponent from "@/app/components/InfoComponent";
import HistoricalDataTableComponent from "@/app/components/HistoricalDataTableComponent";
import TitleComponent from "@/app/components/TitleComponent";
import { NavMenu } from "../components/NavigationMenu";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-400">
            <NavMenu />
            <div className=" bg-slate-500">
                <TitleComponent title="Historical Data" /></div>
            <div className="container mx-auto p-7">
                <HistoricalDataTableComponent />
            </div>
        </div>

    );
}
