"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden border-r border-slate-100 lg:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar onClose={() => setDrawer(false)} />
          </div>
        </div>
      )}

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setDrawer(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🪡</span>
          <span className="font-extrabold">SALL Fashion English</span>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl pb-10">{children}</div>
      </main>
    </div>
  );
}
