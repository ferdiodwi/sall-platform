// ============================================================
// types/database.ts
// File ini akan di-generate ulang menggunakan:
//   npx supabase gen types typescript --local > types/database.ts
// setelah schema database selesai dibuat di Tahap 2
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Placeholder — akan di-replace dengan generated types dari Supabase CLI
export interface Database {
  public: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
  }
}
