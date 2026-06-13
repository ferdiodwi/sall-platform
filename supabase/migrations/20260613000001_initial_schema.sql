-- ============================================================
-- Migration 1: Initial Schema
-- SALL — Self-Access Language Learning Platform
-- Urutan: dependency-first (tabel yang direferensikan dibuat duluan)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users (profil publik, mirror dari auth.users)
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  class_id      TEXT,
  level         TEXT CHECK (level IN ('beginner', 'intermediate')),
  photo_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: students (data gamifikasi & progress siswa)
-- ============================================================
CREATE TABLE students (
  id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp              INTEGER NOT NULL DEFAULT 0,
  streak          INTEGER NOT NULL DEFAULT 0,
  last_active     TIMESTAMPTZ,
  level           TEXT CHECK (level IN ('beginner', 'intermediate')),
  placement_score INTEGER,
  placement_date  TIMESTAMPTZ,
  modules_completed TEXT[] DEFAULT '{}',
  vocab_mastered  INTEGER DEFAULT 0,
  badges          TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: teachers (data spesifik guru)
-- ============================================================
CREATE TABLE teachers (
  id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  subjects   TEXT[] DEFAULT '{}',
  classes    TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: modules (5 modul pembelajaran)
-- ============================================================
CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number      INTEGER NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  tagline     TEXT,
  emoji       TEXT,
  "order"     INTEGER NOT NULL,
  published   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: levels (konten modul per level — content_html dari WYSIWYG)
-- ============================================================
CREATE TABLE levels (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  level        TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate')),
  content_html TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, level)
);

-- ============================================================
-- TABLE: quizzes (kuis per modul per level)
-- ============================================================
CREATE TABLE quizzes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id      UUID REFERENCES modules(id) ON DELETE CASCADE,
  level          TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'placement')),
  title          TEXT NOT NULL,
  activity_type  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: questions (soal kuis)
-- ============================================================
CREATE TABLE questions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id    UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('vocab', 'reading', 'true_false', 'fill_blank', 'matching')),
  prompt     TEXT NOT NULL,
  passage    TEXT,
  options    JSONB,        -- ["A. ...", "B. ...", "C. ...", "D. ..."]
  topic      TEXT NOT NULL,
  "order"    INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: answers (jawaban benar — ANTI-CHEAT: tidak bisa dibaca client)
-- ============================================================
CREATE TABLE answers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id           UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_index          INTEGER NOT NULL,   -- index of correct option (0-based)
  explanation_correct   TEXT NOT NULL,
  explanation_wrong     TEXT NOT NULL,
  related_vocab         JSONB,              -- [{ word, meaning }]
  review_activity       TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: feedback (riwayat jawaban siswa per soal)
-- ============================================================
CREATE TABLE feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  correct     BOOLEAN NOT NULL,
  shown_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: reviews (review modul dari siswa)
-- ============================================================
CREATE TABLE reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id      UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  author_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT CHECK (char_length(comment) <= 500),
  emoji          TEXT,
  pinned         BOOLEAN NOT NULL DEFAULT FALSE,
  teacher_reply  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, author_id)
);

-- ============================================================
-- TABLE: journals (jurnal digital harian — 3 prompt, privat)
-- ============================================================
CREATE TABLE journals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learned    TEXT CHECK (char_length(learned) <= 300),
  difficult  TEXT CHECK (char_length(difficult) <= 300),
  goal       TEXT CHECK (char_length(goal) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: word_wall (koleksi kosakata siswa, privat)
-- ============================================================
CREATE TABLE word_wall (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word            TEXT NOT NULL,
  meaning         TEXT NOT NULL,
  example         TEXT,
  image_url       TEXT,
  status          TEXT NOT NULL DEFAULT 'baru'
                    CHECK (status IN ('baru', 'sedang dipelajari', 'dikuasai')),
  review_history  JSONB DEFAULT '[]',  -- [{ reviewedAt, status }]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: badges (definisi badge yang tersedia)
-- ============================================================
CREATE TABLE badges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL UNIQUE,
  emoji        TEXT NOT NULL,
  description  TEXT NOT NULL,
  requirement  JSONB NOT NULL,   -- { type: 'streak', value: 7 }
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: leaderboards (XP per minggu, ISO week)
-- ============================================================
CREATE TABLE leaderboards (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id   TEXT NOT NULL,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  xp         INTEGER NOT NULL DEFAULT 0,
  week_id    TEXT NOT NULL,   -- format: "2026-W24"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_id)
);

-- ============================================================
-- TABLE: resources (file resource per modul)
-- ============================================================
CREATE TABLE resources (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id  UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('video', 'audio', 'worksheet', 'reading', 'pdf', 'docx', 'pptx')),
  title      TEXT NOT NULL,
  url        TEXT NOT NULL,
  format     TEXT,
  meta       JSONB,           -- { duration, fileSize, description }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: worksheets (worksheet per modul)
-- ============================================================
CREATE TABLE worksheets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  file_url    TEXT,
  format      TEXT CHECK (format IN ('PDF', 'DOCX', 'PPTX', 'HTML')),
  interactive BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: worksheet_submissions (submission siswa)
-- ============================================================
CREATE TABLE worksheet_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worksheet_id  UUID NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url      TEXT,
  html_content  TEXT,
  grade         NUMERIC(5,2),
  teacher_note  TEXT,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  graded_at     TIMESTAMPTZ,
  UNIQUE (worksheet_id, user_id)
);

-- ============================================================
-- TABLE: ai_feedback (hasil Smart Feedback Engine per sesi kuis)
-- Schema kompatibel untuk upgrade ke Gemini AI di iterasi berikutnya
-- ============================================================
CREATE TABLE ai_feedback (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weak_topic            TEXT NOT NULL,
  message               TEXT NOT NULL,
  recommended_activity  TEXT,
  est_time_minutes      INTEGER,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: analytics (data analitik per kelas per modul)
-- ============================================================
CREATE TABLE analytics (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id         TEXT NOT NULL,
  module_id        UUID REFERENCES modules(id) ON DELETE CASCADE,
  completion_rate  NUMERIC(5,2),
  avg_score        NUMERIC(5,2),
  hard_vocab       TEXT[] DEFAULT '{}',
  hard_texts       TEXT[] DEFAULT '{}',
  recorded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: notifications (notifikasi in-app)
-- ============================================================
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: challenges (weekly challenge gamifikasi)
-- ============================================================
CREATE TABLE challenges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  target_type  TEXT NOT NULL,   -- 'modules_complete', 'quiz_score', dll
  target_value INTEGER NOT NULL,
  bonus_xp     INTEGER NOT NULL DEFAULT 50,
  week_id      TEXT NOT NULL,   -- format: "2026-W24"
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCTION: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Terapkan trigger updated_at ke semua tabel yang relevan
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_teachers_updated_at
  BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_modules_updated_at
  BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_levels_updated_at
  BEFORE UPDATE ON levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_quizzes_updated_at
  BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_answers_updated_at
  BEFORE UPDATE ON answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_word_wall_updated_at
  BEFORE UPDATE ON word_wall FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_leaderboards_updated_at
  BEFORE UPDATE ON leaderboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_resources_updated_at
  BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_worksheets_updated_at
  BEFORE UPDATE ON worksheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_students_level_updated_at
  BEFORE UPDATE ON worksheet_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
