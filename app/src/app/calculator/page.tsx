import AllValidatorsCalculatorComponent from "@/app/components/AllValidatorsCalculatorComponent";
import TitleComponent from "@/app/components/TitleComponent";

export default function Calculator() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#faf5ff] to-[#fef3ff]">
            <div>
                <TitleComponent title="Rewards Calculator" />
            </div>
            <div className="container mx-auto p-7">
                <AllValidatorsCalculatorComponent />
            </div>
        </div>
    );
}

