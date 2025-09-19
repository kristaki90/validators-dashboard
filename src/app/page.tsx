import InfoComponent from "@/components/InfoComponent";
import TableComponent from "@/components/TableComponent";
import TitleComponent from "@/components/TitleComponent";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-400">
      <div className=" bg-slate-500">
        <TitleComponent /></div>
      <div className="container mx-auto p-7">
        <InfoComponent />
        <TableComponent />
      </div>
    </div>

  );
}
