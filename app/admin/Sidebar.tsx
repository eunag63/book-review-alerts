"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BarChart3, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const menus = [
  {
    href: "/admin/dashboard/review",
    label: "서평단",
    icon: BookOpen,
  },
  {
    href: "/admin/dashboard/analytics",
    label: "통계",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-60 shrink-0 border-r border-zinc-800 bg-black">
      <div className="flex h-16 items-center border-b border-zinc-800 px-6">
        <h1 className="text-xl font-bold text-white">Freebook Admin</h1>
      </div>

      <nav className="px-3 py-4">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`mb-2 flex h-11 items-center rounded-lg px-4 transition-all ${
                active
                  ? "bg-[#80FD8F] text-black"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="ml-3 font-medium">{menu.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-3 right-3">
        <button
          onClick={handleLogout}
          className="flex h-11 w-full items-center rounded-lg px-4 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        >
          <LogOut size={18} />
          <span className="ml-3">로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
