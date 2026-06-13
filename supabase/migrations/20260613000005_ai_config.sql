-- ============================================================
-- Migration 5: AI Config Table
-- Menyimpan konfigurasi prompt Gemini untuk guru
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_template TEXT NOT NULL CHECK (char_length(prompt_template) <= 2000),
  max_tokens      INTEGER NOT NULL DEFAULT 1000,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger untuk update updated_at
CREATE OR REPLACE TRIGGER trg_ai_config_updated_at
  BEFORE UPDATE ON public.ai_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya teacher yang bisa baca dan edit
CREATE POLICY "Allow teachers to read AI config" ON public.ai_config
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid() AND public.users.role = 'teacher'
    )
  );

CREATE POLICY "Allow teachers to modify AI config" ON public.ai_config
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid() AND public.users.role = 'teacher'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid() AND public.users.role = 'teacher'
    )
  );

-- Insert default configuration
INSERT INTO public.ai_config (id, prompt_template, max_tokens)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Anda adalah asisten AI guru bahasa Inggris yang ahli. Analisis kesalahan kuis tata busana/fashion siswa berikut dan berikan feedback yang dipersonalisasi serta rekomendasi belajar yang terukur.',
  1000
) ON CONFLICT (id) DO NOTHING;
