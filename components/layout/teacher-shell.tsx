"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, BookOpen, Upload, MessageSquare, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store";

export function TeacherShell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore();

  const menu = [
    { href: "/teacher", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  ];

  const SidebarContent = () => (
    <aside className="flex h-full w-72 flex-col bg-slate-900 text-slate-300">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 text-left">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white text-xl shadow-lg shadow-blue-900">
          👩‍🏫
        </div>
        <div>
          <p className="text-lg font-extrabold leading-tight text-white">SALL</p>
          <p className="text-[11px] font-semibold text-blue-400">Teacher Portal</p>
        </div>
      </div>

      <div className="mx-5 mb-4 rounded-xl bg-slate-800 p-4 border border-slate-700">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Logged in as</p>
        <p className="text-base font-bold text-white">{user.name || "Guru"}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawer(false)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all duration-200",
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              {item.icon}
              <span className="leading-tight">{item.label}</span>
            </Link>
          );
        })}

        <div className="mt-8 mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Student Preview
        </div>
        <Link
          href="/"
          onClick={() => setDrawer(false)}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all duration-200 hover:bg-slate-800 hover:text-white"
        >
          <span className="text-lg">👀</span>
          <span className="leading-tight">Lihat Web Siswa</span>
        </Link>
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={() => {
            user.logout();
            // Clear mock cookie
            document.cookie = "sall_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push("/login");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-400 transition-all duration-200 hover:bg-red-950/50"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block shadow-xl">
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 shadow-2xl animate-in slide-in-from-left duration-300">
            <SidebarContent />
            <button onClick={() => setDrawer(false)} className="absolute top-4 -right-12 p-2 text-white bg-slate-800 rounded-full">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
        <button onClick={() => setDrawer(true)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">👩‍🏫</span>
          <span className="font-extrabold text-slate-800">Teacher Portal</span>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl pb-10">{children}</div>
      </main>
    </div>
  );
}
