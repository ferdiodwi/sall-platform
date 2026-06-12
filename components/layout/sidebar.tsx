"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { menuItems } from "@/data/content";
import { useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { X, LogOut } from "lucide-react";

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore();

  return (
    <aside className="flex h-full w-72 flex-col bg-white">
      {/* Brand */}
      <Link
        href="/"
        onClick={onClose}
        className="flex items-center gap-3 px-5 py-5 text-left"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-xl shadow-lg shadow-rose-200">
          🪡
        </div>
        <div>
          <p className="text-lg font-extrabold leading-tight text-slate-900">
            SALL
          </p>
          <p className="text-[11px] font-semibold text-rose-600">
            Fashion English
          </p>
        </div>
        {onClose && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="ml-auto rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </Link>

      {/* User mini card */}
      {user.role === "teacher" && (
        <div className="mx-4 mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
          <p className="text-sm font-semibold opacity-90">SALL</p>
          <p className="text-lg font-extrabold">Teacher Portal 👩‍🏫</p>
        </div>
      )}

      {user.role === "student" && (
        <div className="mx-4 mb-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-4 text-white">
          <p className="text-sm font-semibold opacity-90">Halo,</p>
          <p className="text-lg font-extrabold">{user.name} 👋</p>
          <div className="mt-2 flex items-center gap-3 text-xs font-bold">
            <span>⭐ {user.xp} XP</span>
            <span>🔥 {user.streak} hari</span>
            {user.level && (
              <span className="rounded-full bg-white/25 px-2 py-0.5">
                {user.level === "beginner" ? "🟢 Beginner" : "🔵 Intermediate"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6 flex flex-col">
        {user.role === "teacher" ? (
          <Link
            href="/teacher"
            onClick={onClose}
            className={cn(
              "mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all duration-200",
              pathname === "/teacher"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-slate-600 hover:bg-blue-50"
            )}
          >
            <span className="text-lg">👩‍🏫</span>
            <span className="leading-tight">Teacher Dashboard</span>
          </Link>
        ) : null}

        <div className={user.role === "teacher" ? "mt-4 mb-2 px-4 text-xs font-bold text-slate-400" : "hidden"}>
          {user.role === "teacher" ? "STUDENT PREVIEW" : ""}
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all duration-200",
                isActive
                  ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                  : "text-slate-600 hover:bg-rose-50"
              )}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="leading-tight">{item.label}</span>
            </Link>
          );
        })}

        <div className="mt-auto pt-6">
          <button
            onClick={() => {
              user.logout();
              router.push("/login");
              onClose?.();
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-red-600 transition-all duration-200 hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
