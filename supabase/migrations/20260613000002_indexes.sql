-- ============================================================
-- Migration 2: Database Indexes
-- Optimasi query yang paling sering digunakan
-- ============================================================

-- Feedback: query by user dan question
CREATE INDEX idx_feedback_user_id      ON feedback(user_id);
CREATE INDEX idx_feedback_question_id  ON feedback(question_id);
CREATE INDEX idx_feedback_user_quiz    ON feedback(user_id, question_id);

-- Journals: query by user, urut terbaru
CREATE INDEX idx_journals_user_id      ON journals(user_id);
CREATE INDEX idx_journals_user_date    ON journals(user_id, created_at DESC);

-- Word Wall: query by user dan status
CREATE INDEX idx_word_wall_user_id     ON word_wall(user_id);
CREATE INDEX idx_word_wall_user_status ON word_wall(user_id, status);

-- Leaderboard: ranking per minggu
CREATE INDEX idx_leaderboards_week     ON leaderboards(week_id, xp DESC);
CREATE INDEX idx_leaderboards_user     ON leaderboards(user_id);

-- Reviews: query by modul, urut pinned dulu
CREATE INDEX idx_reviews_module_id     ON reviews(module_id);
CREATE INDEX idx_reviews_module_pinned ON reviews(module_id, pinned DESC, created_at DESC);

-- AI/Smart Feedback: query by user, terbaru
CREATE INDEX idx_ai_feedback_user_id   ON ai_feedback(user_id);
CREATE INDEX idx_ai_feedback_user_date ON ai_feedback(user_id, created_at DESC);

-- Notifications: query by user, filter unread
CREATE INDEX idx_notifications_user_id ON notifications(user_id, read);
CREATE INDEX idx_notifications_user_date ON notifications(user_id, created_at DESC);

-- Worksheet submissions: query by user dan worksheet
CREATE INDEX idx_worksheet_submissions_user      ON worksheet_submissions(user_id);
CREATE INDEX idx_worksheet_submissions_worksheet ON worksheet_submissions(worksheet_id);

-- Questions: query by quiz, urut sesuai order
CREATE INDEX idx_questions_quiz_id     ON questions(quiz_id, "order");

-- Modules: query published modules
CREATE INDEX idx_modules_published     ON modules(published, "order");

-- Levels: query by module
CREATE INDEX idx_levels_module_id      ON levels(module_id);

-- Students: leaderboard + streak query
CREATE INDEX idx_students_xp           ON students(xp DESC);
CREATE INDEX idx_students_last_active  ON students(last_active);

-- Challenges: query by week
CREATE INDEX idx_challenges_week_id    ON challenges(week_id);
