-- ============================================================
-- Migration 3: Row Level Security (RLS) Policies
-- Sesuai SRS Bab 11.1
-- ============================================================

-- ============================================================
-- AKTIFKAN RLS pada semua tabel
-- ============================================================
ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE students              ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules               ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels                ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_wall             ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges                ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources             ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheet_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback           ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: cek apakah user yang login adalah teacher
-- ============================================================
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- POLICY: users — baca & update profil sendiri saja
-- ============================================================
CREATE POLICY "users: read own"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users: update own"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- POLICY: students — hanya pemilik yang bisa baca & update
-- ============================================================
CREATE POLICY "students: owner only"
  ON students
  USING (auth.uid() = id);

CREATE POLICY "students: teacher read"
  ON students FOR SELECT
  USING (is_teacher());

-- ============================================================
-- POLICY: teachers — hanya teacher sendiri yang bisa baca
-- ============================================================
CREATE POLICY "teachers: owner only"
  ON teachers
  USING (auth.uid() = id);

-- ============================================================
-- POLICY: modules
-- Siswa: hanya baca yang published
-- Guru: akses penuh (baca semua termasuk draft, bisa tulis)
-- ============================================================
CREATE POLICY "modules: student read published"
  ON modules FOR SELECT
  USING (published = TRUE AND auth.role() = 'authenticated');

CREATE POLICY "modules: teacher full access"
  ON modules
  USING (is_teacher());

-- ============================================================
-- POLICY: levels — sama seperti modules
-- ============================================================
CREATE POLICY "levels: student read"
  ON levels FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM modules WHERE id = levels.module_id AND published = TRUE)
  );

CREATE POLICY "levels: teacher full access"
  ON levels
  USING (is_teacher());

-- ============================================================
-- POLICY: quizzes — authenticated read; teacher write
-- ============================================================
CREATE POLICY "quizzes: authenticated read"
  ON quizzes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "quizzes: teacher write"
  ON quizzes
  USING (is_teacher());

-- ============================================================
-- POLICY: questions — authenticated read; teacher write
-- ============================================================
CREATE POLICY "questions: authenticated read"
  ON questions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "questions: teacher write"
  ON questions
  USING (is_teacher());

-- ============================================================
-- POLICY: answers — TIDAK BISA dibaca siswa (ANTI-CHEAT)
-- Hanya teacher yang bisa baca
-- Server-side API Routes menggunakan service_role (bypass RLS)
-- ============================================================
CREATE POLICY "answers: teacher only"
  ON answers FOR SELECT
  USING (is_teacher());

CREATE POLICY "answers: teacher write"
  ON answers FOR ALL
  USING (is_teacher());

-- ============================================================
-- POLICY: feedback (riwayat jawaban)
-- Siswa hanya bisa insert + baca milik sendiri
-- Teacher bisa baca semua
-- ============================================================
CREATE POLICY "feedback: owner read"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "feedback: owner insert"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedback: teacher read"
  ON feedback FOR SELECT
  USING (is_teacher());

-- ============================================================
-- POLICY: reviews
-- Semua authenticated bisa baca
-- Siswa hanya bisa insert & update milik sendiri
-- Teacher bisa update semua (reply, pin, hapus)
-- ============================================================
CREATE POLICY "reviews: authenticated read"
  ON reviews FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "reviews: owner insert"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "reviews: owner update"
  ON reviews FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "reviews: owner delete"
  ON reviews FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "reviews: teacher moderate"
  ON reviews FOR UPDATE
  USING (is_teacher());

CREATE POLICY "reviews: teacher delete"
  ON reviews FOR DELETE
  USING (is_teacher());

-- ============================================================
-- POLICY: journals — privat, hanya pemilik
-- ============================================================
CREATE POLICY "journals: owner only"
  ON journals
  USING (auth.uid() = user_id);

CREATE POLICY "journals: owner insert"
  ON journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- POLICY: word_wall — privat, hanya pemilik
-- ============================================================
CREATE POLICY "word_wall: owner only"
  ON word_wall
  USING (auth.uid() = user_id);

CREATE POLICY "word_wall: owner insert"
  ON word_wall FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- POLICY: badges — semua authenticated bisa baca (definisi badge)
-- ============================================================
CREATE POLICY "badges: authenticated read"
  ON badges FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "badges: teacher write"
  ON badges FOR ALL
  USING (is_teacher());

-- ============================================================
-- POLICY: leaderboards — semua authenticated bisa baca
-- ============================================================
CREATE POLICY "leaderboard: authenticated read"
  ON leaderboards FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert/update hanya via service role (API Route /api/award-xp)

-- ============================================================
-- POLICY: resources — semua authenticated bisa baca
-- Teacher bisa write
-- ============================================================
CREATE POLICY "resources: authenticated read"
  ON resources FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "resources: teacher write"
  ON resources FOR ALL
  USING (is_teacher());

-- ============================================================
-- POLICY: worksheets — semua authenticated bisa baca
-- Teacher bisa write
-- ============================================================
CREATE POLICY "worksheets: authenticated read"
  ON worksheets FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "worksheets: teacher write"
  ON worksheets FOR ALL
  USING (is_teacher());

-- ============================================================
-- POLICY: worksheet_submissions
-- Siswa bisa insert & baca milik sendiri
-- Teacher bisa baca semua + update (untuk nilai)
-- ============================================================
CREATE POLICY "worksheet_submissions: owner read"
  ON worksheet_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "worksheet_submissions: owner insert"
  ON worksheet_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "worksheet_submissions: teacher read"
  ON worksheet_submissions FOR SELECT
  USING (is_teacher());

CREATE POLICY "worksheet_submissions: teacher update"
  ON worksheet_submissions FOR UPDATE
  USING (is_teacher());

-- ============================================================
-- POLICY: ai_feedback — hanya pemilik yang bisa baca
-- Insert via service role (API Route)
-- ============================================================
CREATE POLICY "ai_feedback: owner read"
  ON ai_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ai_feedback: teacher read"
  ON ai_feedback FOR SELECT
  USING (is_teacher());

-- ============================================================
-- POLICY: analytics — teacher only
-- ============================================================
CREATE POLICY "analytics: teacher only"
  ON analytics
  USING (is_teacher());

-- ============================================================
-- POLICY: notifications — hanya pemilik
-- ============================================================
CREATE POLICY "notifications: owner only"
  ON notifications
  USING (auth.uid() = user_id);

CREATE POLICY "notifications: owner update read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- POLICY: challenges — semua authenticated bisa baca
-- ============================================================
CREATE POLICY "challenges: authenticated read"
  ON challenges FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "challenges: teacher write"
  ON challenges FOR ALL
  USING (is_teacher());
