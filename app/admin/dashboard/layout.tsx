"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    name: "서평단",
    href: "/admin/dashboard/reviews",
  },
  {
    name: "통계",
    href: "/admin/dashboard/analytics",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      <aside className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950">
        <div className="flex h-16 items-center border-b border-zinc-800 px-6">
          <span className="text-lg font-semibold">관리자</span>
        </div>

        <nav className="p-3">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`mb-1 flex h-11 items-center rounded-lg px-4 transition-colors ${
                pathname === menu.href
                  ? "bg-[#80FD8F] text-black"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {menu.name}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-zinc-800 px-8">
          <h1 className="text-xl font-semibold">
            {pathname.includes("/analytics") ? "통계" : "서평단"}
          </h1>
        </header>

        <main className="min-w-0 flex-1 overflow-auto bg-black px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
