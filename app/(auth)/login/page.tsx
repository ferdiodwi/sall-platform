"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/lib/store";
import { Card, Button, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login, role } = useUserStore();
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | null>(null);
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    if (selectedRole === "student" && !name.trim()) return;
    
    // Set fallback cookie for middleware
    const expires = new Date();
    expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `sall_role=${selectedRole}; expires=${expires.toUTCString()}; path=/`;

    if (selectedRole === "teacher") {
      login("teacher", email.split("@")[0] || "Guru");
      router.push("/teacher");
    } else if (selectedRole === "student") {
      login("student", name.trim());
      router.push("/");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-rose-500 to-pink-600 rounded-b-[40%] shadow-xl opacity-90 -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 text-white">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-4xl shadow-xl shadow-rose-900/20 mb-4">
            🪡
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">SALL Platform</h1>
          <p className="mt-2 text-rose-100">Fashion English Learning</p>
        </div>

        <Card className="p-6 md:p-8 shadow-2xl shadow-slate-200/50">
          <h2 className="text-xl font-extrabold text-center text-slate-800 mb-6">
            Pilih Peran Anda
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setSelectedRole("student")}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                selectedRole === "student"
                  ? "border-rose-500 bg-rose-50 text-rose-600 shadow-md shadow-rose-100"
                  : "border-slate-100 bg-white text-slate-500 hover:border-rose-200"
              }`}
            >
              <span className="text-4xl">🧑‍🎓</span>
              <span className="font-bold">Siswa</span>
            </button>
            <button
              onClick={() => setSelectedRole("teacher")}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                selectedRole === "teacher"
                  ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md shadow-blue-100"
                  : "border-slate-100 bg-white text-slate-500 hover:border-blue-200"
              }`}
            >
              <span className="text-4xl">👩‍🏫</span>
              <span className="font-bold">Guru</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {selectedRole === "student" && (
              <motion.div
                key="student"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Siapa nama kamu?
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ketik nama lengkap..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                />
              </motion.div>
            )}
            
            {selectedRole === "teacher" && (
              <motion.div
                key="teacher"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 text-left">
                      Email Guru
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="guru@smkn2.sch.id"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 text-left">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleLogin();
                      }}
                    />
                  </div>
                  <div className="text-center text-xs text-blue-500 bg-blue-50 p-2 rounded-xl mt-3 font-semibold">
                    <p>Demo Mode: Masukkan email & password apa saja.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            className="w-full"
            disabled={!selectedRole || (selectedRole === "student" && !name.trim())}
            onClick={handleLogin}
            variant={selectedRole === "teacher" ? "outline" : "primary"}
          >
            Masuk
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
