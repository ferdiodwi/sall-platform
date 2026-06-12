"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

// ============================================================
// BUTTON
// ============================================================
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "success" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200/50 hover:shadow-rose-300/50 hover:brightness-110 active:scale-[0.98]",
  outline:
    "border-2 border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50 active:scale-[0.98]",
  ghost:
    "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 active:scale-[0.98]",
  success:
    "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 hover:brightness-110 active:scale-[0.98]",
  danger:
    "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200/50 hover:brightness-110 active:scale-[0.98]",
};

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-200",
        variantClasses[variant],
        sizeClasses[size],
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================
// CARD
// ============================================================
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export function Card({ children, className, hover = false, glass = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-100/80 p-1 transition-all duration-300",
        glass
          ? "bg-white/70 backdrop-blur-xl shadow-lg"
          : "bg-white shadow-sm",
        hover && "hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-100/30 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================
// PROGRESS BAR
// ============================================================
interface ProgressBarProps {
  value: number;
  color?: "rose" | "emerald" | "blue" | "amber";
  size?: "sm" | "md";
}

const barColors: Record<string, string> = {
  rose: "from-rose-400 to-pink-500",
  emerald: "from-emerald-400 to-teal-500",
  blue: "from-blue-400 to-indigo-500",
  amber: "from-amber-400 to-orange-500",
};

export function ProgressBar({ value, color = "rose", size = "md" }: ProgressBarProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-slate-100",
        size === "sm" ? "h-2" : "h-3"
      )}
    >
      <motion.div
        className={cn("h-full rounded-full bg-gradient-to-r", barColors[color])}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

// ============================================================
// PILL / BADGE
// ============================================================
interface PillProps {
  children: ReactNode;
  color?: "rose" | "emerald" | "blue" | "amber" | "slate";
  className?: string;
}

const pillColors: Record<string, string> = {
  rose: "bg-rose-100 text-rose-700",
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-100 text-slate-600",
};

export function Pill({ children, color = "rose", className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
        pillColors[color],
        className
      )}
    >
      {children}
    </span>
  );
}

// ============================================================
// SECTION TITLE
// ============================================================
export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-lg font-extrabold tracking-tight text-slate-900",
        className
      )}
    >
      {children}
    </h2>
  );
}

// ============================================================
// PAGE HEADER
// ============================================================
interface PageHeaderProps {
  emoji: string;
  title: string;
  subtitle: string;
}

export function PageHeader({ emoji, title, subtitle }: PageHeaderProps) {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// INPUT
// ============================================================
export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none transition-all duration-200",
        "placeholder:text-slate-400",
        "focus:border-rose-400 focus:ring-4 focus:ring-rose-100",
        className
      )}
      {...props}
    />
  );
}

// ============================================================
// TEXTAREA
// ============================================================
export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none transition-all duration-200",
        "placeholder:text-slate-400",
        "focus:border-rose-400 focus:ring-4 focus:ring-rose-100",
        "resize-none",
        className
      )}
      {...props}
    />
  );
}

// ============================================================
// STAT CARD (animated number)
// ============================================================
interface StatCardProps {
  label: string;
  value: string | number;
  emoji: string;
}

export function StatCard({ label, value, emoji }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 text-center">
        <div className="text-2xl">{emoji}</div>
        <div className="mt-1 text-2xl font-extrabold text-slate-900">{value}</div>
        <div className="text-xs font-semibold text-slate-500">{label}</div>
      </Card>
    </motion.div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
export function EmptyState({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="py-12 text-center">
      <div className="text-5xl">{emoji}</div>
      <h3 className="mt-3 text-lg font-extrabold text-slate-700">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
