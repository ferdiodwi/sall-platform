import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SALL — Fashion English Learning Platform",
  description:
    "Platform belajar Bahasa Inggris Fashion secara mandiri untuk siswa Tata Busana. Self-Access Language Learning · SMKN 2 Bondowoso.",
  keywords: [
    "fashion english",
    "learning platform",
    "SALL",
    "tata busana",
    "SMKN 2 Bondowoso",
    "vocabulary",
    "reading",
  ],
  openGraph: {
    title: "SALL — Fashion English Learning Platform",
    description:
      "Belajar Bahasa Inggris Fashion secara mandiri: kosakata, membaca label, katalog produk, dan instruksi teknis.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={font.variable}>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
