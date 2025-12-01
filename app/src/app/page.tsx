import InfoComponent from "@/app/components/InfoComponent";
import TableComponent from "@/app/components/TableComponent";
import TitleComponent from "@/app/components/TitleComponent";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-400">
      <div className=" bg-slate-500">
        <TitleComponent title="Current Validator Data" /></div>
      <div className="container mx-auto p-7">
        <InfoComponent />
        <TableComponent />
      </div>
    </div>

  );
}
