import InfoComponent from "@/app/components/InfoComponent";
import TableComponent from "@/app/components/TableComponent";
import TitleComponent from "@/app/components/TitleComponent";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#faf5ff] to-[#fef3ff]">
      <div>
        <TitleComponent title="Current Validator Data" /></div>
      <div className="container mx-auto p-7">
        <InfoComponent />
        <TableComponent />
      </div>
    </div>

  );
}
