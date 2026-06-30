import Sidebar from "@/app/admin/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 overflow-auto bg-[#0a0a0a]">{children}</main>
    </div>
  );
}
