"use client";

import type { Level } from "@/types";
import { cn } from "@/lib/utils";

export function LevelTabs({
  level,
  setLevel,
}: {
  level: Level;
  setLevel: (l: Level) => void;
}) {
  return (
    <div className="mb-5 flex gap-2">
      {(["beginner", "intermediate"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLevel(l)}
          className={cn(
            "rounded-2xl px-5 py-2.5 text-sm font-bold transition-all duration-200",
            level === l
              ? l === "beginner"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                : "bg-blue-500 text-white shadow-md shadow-blue-200"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          )}
        >
          {l === "beginner" ? "🟢 Beginner" : "🔵 Intermediate"}
        </button>
      ))}
    </div>
  );
}
