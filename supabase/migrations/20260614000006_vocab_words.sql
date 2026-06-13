-- ============================================================
-- Migration: vocab_words table
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Buat tabel vocab_words
CREATE TABLE IF NOT EXISTS vocab_words (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id  UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  level      TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate')),
  word       TEXT NOT NULL,
  meaning    TEXT NOT NULL,
  example    TEXT NOT NULL DEFAULT '',
  emoji      TEXT NOT NULL DEFAULT '✨',
  category   TEXT NOT NULL DEFAULT 'General',
  "order"    INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index untuk performa query per modul + level
CREATE INDEX IF NOT EXISTS idx_vocab_words_module_level ON vocab_words (module_id, level);
CREATE INDEX IF NOT EXISTS idx_vocab_words_order ON vocab_words (module_id, level, "order");

-- 3. RLS Policies
ALTER TABLE vocab_words ENABLE ROW LEVEL SECURITY;

-- Siswa: bisa baca semua vocab_words (untuk aktivitas modul)
CREATE POLICY "students_select_vocab_words"
  ON vocab_words FOR SELECT
  TO authenticated
  USING (true);

-- Guru (role = teacher): bisa insert, update, delete vocab_words
CREATE POLICY "teachers_insert_vocab_words"
  ON vocab_words FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "teachers_update_vocab_words"
  ON vocab_words FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "teachers_delete_vocab_words"
  ON vocab_words FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher'
    )
  );
