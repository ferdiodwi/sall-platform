"use client";

import type { Resource } from "@/types";
import { Card, SectionTitle, Pill } from "@/components/ui";
import { Video, Headphones, FileText, BookOpen } from "lucide-react";

const iconMap = {
  video: Video,
  audio: Headphones,
  worksheet: FileText,
  reading: BookOpen,
};

const colorMap = {
  video: "text-red-500 bg-red-50",
  audio: "text-purple-500 bg-purple-50",
  worksheet: "text-blue-500 bg-blue-50",
  reading: "text-emerald-500 bg-emerald-50",
};

export function ResourceList({ resources }: { resources: Resource[] }) {
  return (
    <div className="mt-8">
      <SectionTitle className="mb-3">📁 Sumber Belajar</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {resources.map((r) => {
          const Icon = iconMap[r.type];
          const color = colorMap[r.type];
          return (
            <Card key={r.title} className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{r.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Pill color="slate">{r.format}</Pill>
                  <span className="text-xs text-slate-400">{r.meta}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
