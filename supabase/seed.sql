-- ============================================================
-- Seed Data Awal SALL Platform
-- Jalankan setelah semua migrasi berhasil
-- ============================================================

-- ============================================================
-- 1. SEED: 5 Modul Pembelajaran (published=false dulu)
-- ============================================================
INSERT INTO modules (id, number, title, tagline, emoji, "order", published) VALUES
  ('11111111-0001-0001-0001-000000000001', 1, 'Fashion Vocabulary Builder',
   'Kuasai kosakata fashion dasar dalam bahasa Inggris',
   '👗', 1, false),
  ('11111111-0002-0002-0002-000000000002', 2, 'Reading Station',
   'Latih kemampuan membaca teks fashion umum',
   '📖', 2, false),
  ('11111111-0003-0003-0003-000000000003', 3, 'Fashion Label Reader',
   'Pahami setiap simbol dan tulisan di label pakaian',
   '🏷️', 3, false),
  ('11111111-0004-0004-0004-000000000004', 4, 'Catalogue & Product Description Reader',
   'Baca dan pahami katalog serta deskripsi produk fashion',
   '📋', 4, false),
  ('11111111-0005-0005-0005-000000000005', 5, 'Technical Instructions Reader',
   'Kuasai instruksi teknis menjahit dalam bahasa Inggris',
   '🔧', 5, false);

-- ============================================================
-- 2. SEED: Level records (beginner + intermediate per modul)
-- content_html dikosongkan dulu — diisi via Teacher CMS
-- ============================================================
INSERT INTO levels (module_id, level, content_html) VALUES
  ('11111111-0001-0001-0001-000000000001', 'beginner', ''),
  ('11111111-0001-0001-0001-000000000001', 'intermediate', ''),
  ('11111111-0002-0002-0002-000000000002', 'beginner', ''),
  ('11111111-0002-0002-0002-000000000002', 'intermediate', ''),
  ('11111111-0003-0003-0003-000000000003', 'beginner', ''),
  ('11111111-0003-0003-0003-000000000003', 'intermediate', ''),
  ('11111111-0004-0004-0004-000000000004', 'beginner', ''),
  ('11111111-0004-0004-0004-000000000004', 'intermediate', ''),
  ('11111111-0005-0005-0005-000000000005', 'beginner', ''),
  ('11111111-0005-0005-0005-000000000005', 'intermediate', '');

-- ============================================================
-- 3. SEED: 6 Badge Definitions (FR07.3)
-- ============================================================
INSERT INTO badges (name, emoji, description, requirement) VALUES
  ('first_step',        '🎯', 'Langkah Pertama — Selesaikan Placement Quiz',
   '{"type": "placement_quiz", "value": 1}'),
  ('on_fire',           '🔥', 'On Fire — Streak belajar 7 hari berturut-turut',
   '{"type": "streak", "value": 7}'),
  ('bookworm',          '📖', 'Kutu Buku — Selesaikan 3 modul pembelajaran',
   '{"type": "modules_completed", "value": 3}'),
  ('vocabulary_master', '💎', 'Vocabulary Master — Tambahkan 50 kata ke Word Wall',
   '{"type": "word_wall_count", "value": 50}'),
  ('quiz_champion',     '🏅', 'Quiz Champion — Raih skor sempurna di 1 kuis',
   '{"type": "perfect_quiz", "value": 1}'),
  ('journaling_pro',    '✍️', 'Journaling Pro — Tulis jurnal sebanyak 10 kali',
   '{"type": "journal_count", "value": 10}');

-- ============================================================
-- 4. SEED: Placement Quiz
-- module_id = NULL karena placement tidak terikat modul
-- ============================================================
INSERT INTO quizzes (id, module_id, level, title, activity_type) VALUES
  ('22222222-0001-0001-0001-000000000001',
   NULL, 'placement',
   'Placement Quiz — Tes Kemampuan Awal',
   'placement');

-- ============================================================
-- 5. SEED: 10 Soal Placement Quiz (contoh soal dasar)
-- Soal ini akan diganti/ditambah oleh guru via CMS
-- ============================================================

-- Soal 1: Vocabulary — fabric types
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('33333333-0001-0001-0001-000000000001',
   '22222222-0001-0001-0001-000000000001',
   'vocab',
   'What does the word "cotton" mean in fashion?',
   '["A. Wool fabric", "B. Natural fiber from plants", "C. Synthetic material", "D. Silk material"]',
   'fabric_types', 1);

INSERT INTO answers (question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('33333333-0001-0001-0001-000000000001',
   1,
   'Benar! Cotton (kapas) adalah serat alami yang berasal dari tanaman kapas. Ini adalah bahan pakaian yang paling umum digunakan.',
   'Salah. Cotton bukan wol, bukan sintetis, dan bukan sutra. Cotton adalah serat alami dari tanaman kapas (cotton plant).',
   '[{"word": "cotton", "meaning": "kapas, serat alami dari tanaman kapas"}, {"word": "fiber", "meaning": "serat"}]');

-- Soal 2: Vocabulary — fabric types
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('33333333-0002-0002-0002-000000000002',
   '22222222-0001-0001-0001-000000000001',
   'vocab',
   'Which of the following is a synthetic fabric?',
   '["A. Silk", "B. Linen", "C. Polyester", "D. Wool"]',
   'fabric_types', 2);

INSERT INTO answers (question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('33333333-0002-0002-0002-000000000002',
   2,
   'Benar! Polyester adalah kain sintetis (buatan manusia) yang terbuat dari bahan kimia. Polyester banyak digunakan karena tahan lama dan mudah dirawat.',
   'Salah. Silk (sutra), Linen (rami), dan Wool (wol) adalah serat alami, bukan sintetis. Polyester adalah satu-satunya kain sintetis di pilihan ini.',
   '[{"word": "synthetic", "meaning": "sintetis, buatan manusia"}, {"word": "polyester", "meaning": "poliester, kain sintetis"}]');

-- Soal 3: Reading comprehension
INSERT INTO questions (id, quiz_id, type, prompt, passage, options, topic, "order") VALUES
  ('33333333-0003-0003-0003-000000000003',
   '22222222-0001-0001-0001-000000000001',
   'reading',
   'Based on the label, what temperature should this garment be washed at?',
   'Care Instructions: Machine wash cold (30°C). Do not bleach. Tumble dry low. Iron on low heat. Do not dry clean.',
   '["A. 60°C", "B. 40°C", "C. 30°C", "D. 50°C"]',
   'label_reading', 3);

INSERT INTO answers (question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('33333333-0003-0003-0003-000000000003',
   2,
   'Benar! Label tersebut menyatakan "Machine wash cold (30°C)" yang berarti cuci dengan mesin pada suhu 30°C.',
   'Salah. Bacalah label dengan teliti. Label menyatakan "Machine wash cold (30°C)" — suhunya adalah 30°C, bukan 40°C, 50°C, atau 60°C.',
   '[{"word": "garment", "meaning": "pakaian"}, {"word": "temperature", "meaning": "suhu"}]');

-- Soal 4: True/False — label reading
INSERT INTO questions (id, quiz_id, type, prompt, passage, options, topic, "order") VALUES
  ('33333333-0004-0004-0004-000000000004',
   '22222222-0001-0001-0001-000000000001',
   'true_false',
   'The label says this garment can be dry cleaned.',
   'Care Instructions: Machine wash cold (30°C). Do not bleach. Tumble dry low. Iron on low heat. Do not dry clean.',
   '["A. True", "B. False"]',
   'label_reading', 4);

INSERT INTO answers (question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('33333333-0004-0004-0004-000000000004',
   1,
   'Benar! Pernyataan tersebut SALAH (False). Label jelas menyatakan "Do not dry clean" yang berarti pakaian ini TIDAK boleh di-dry clean.',
   'Salah. Baca label lagi — tertulis "Do not dry clean". Ini berarti pakaian tidak bisa di-dry clean.',
   '[{"word": "dry clean", "meaning": "cuci kering, pembersihan khusus tanpa air"}, {"word": "do not", "meaning": "jangan, tidak boleh"}]');

-- Soal 5: Vocabulary — general fashion
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('33333333-0005-0005-0005-000000000005',
   '22222222-0001-0001-0001-000000000001',
   'vocab',
   'What is the meaning of "hemline" in fashion?',
   '["A. The collar of a shirt", "B. The bottom edge of a garment", "C. The sleeve of a jacket", "D. The waistband of pants"]',
   'vocabulary_general', 5);

INSERT INTO answers (question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('33333333-0005-0005-0005-000000000005',
   1,
   'Benar! Hemline adalah tepi bawah dari sebuah pakaian (gaun, rok, atau celana). Hemline sering menjadi fokus dalam desain fashion.',
   'Salah. Hemline bukan kerah (collar), bukan lengan (sleeve), dan bukan ikat pinggang (waistband). Hemline adalah tepi bawah pakaian.',
   '[{"word": "hemline", "meaning": "tepi bawah pakaian"}, {"word": "edge", "meaning": "tepi, pinggiran"}]');

-- Soal 6: Reading — catalogue
INSERT INTO questions (id, quiz_id, type, prompt, passage, options, topic, "order") VALUES
  ('33333333-0006-0006-0006-000000000006',
   '22222222-0001-0001-0001-000000000001',
   'reading',
   'What material is this jacket made of?',
   'Product: Classic Denim Jacket. Material: 100% Cotton Denim. Color: Indigo Blue. Features: Button front closure, two chest pockets, two side pockets. Care: Machine wash cold.',
   '["A. Polyester", "B. Silk", "C. Cotton Denim", "D. Linen"]',
   'catalogue_reading', 6);

INSERT INTO answers (question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('33333333-0006-0006-0006-000000000006',
   2,
   'Benar! Deskripsi produk menyatakan "Material: 100% Cotton Denim" yang berarti jaket ini terbuat dari 100% Cotton Denim.',
   'Salah. Bacalah bagian "Material" pada deskripsi produk. Tertulis "100% Cotton Denim" — bukan polyester, bukan sutra, bukan linen.',
   '[{"word": "material", "meaning": "bahan, material"}, {"word": "denim", "meaning": "denim, kain jeans"}]');

-- Soal 7: Vocabulary — technical
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('33333333-0007-0007-0007-000000000007',
   '22222222-0001-0001-0001-000000000001',
   'vocab',
   'What does "seam" mean in sewing instructions?',
   '["A. The pattern printed on fabric", "B. The line where two pieces of fabric are sewn together", "C. The button on a shirt", "D. The zipper of a jacket"]',
   'technical_instructions', 7);

INSERT INTO answers (question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('33333333-0007-0007-0007-000000000007',
   1,
   'Benar! Seam adalah garis jahitan di mana dua potongan kain dijahit bersama. Seam allowance adalah jarak antara tepi kain dan garis jahitan.',
   'Salah. Seam bukan motif kain, bukan kancing, dan bukan risleting. Seam adalah sambungan jahitan antara dua lembar kain.',
   '[{"word": "seam", "meaning": "jahitan, sambungan kain"}, {"word": "sew", "meaning": "menjahit"}]');

-- Soal 8: Reading — technical instructions
INSERT INTO questions (id, quiz_id, type, prompt, passage, options, topic, "order") VALUES
  ('33333333-0008-0008-0008-000000000008',
   '22222222-0001-0001-0001-000000000001',
   'reading',
   'What is the seam allowance mentioned in the instructions?',
   'Sewing Instructions: Step 1 — Cut fabric pieces according to pattern. Step 2 — Pin pieces right sides together. Step 3 — Sew along marked line with 1.5 cm seam allowance. Step 4 — Press seams open with iron.',
   '["A. 1 cm", "B. 2 cm", "C. 1.5 cm", "D. 2.5 cm"]',
   'technical_instructions', 8);

INSERT INTO answers (question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('33333333-0008-0008-0008-000000000008',
   2,
   'Benar! Instruksi menyatakan "with 1.5 cm seam allowance" yang berarti seam allowance-nya adalah 1.5 cm.',
   'Salah. Bacalah instruksi dengan teliti. Tertulis "1.5 cm seam allowance" — bukan 1 cm, 2 cm, atau 2.5 cm.',
   '[{"word": "seam allowance", "meaning": "kelonggaran jahitan, jarak tepi kain ke garis jahit"}, {"word": "press", "meaning": "menyetrika, menekan"}]');

-- Soal 9: Vocabulary — fashion general
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('33333333-0009-0009-0009-000000000009',
   '22222222-0001-0001-0001-000000000001',
   'vocab',
   'What is a "collar" in fashion terminology?',
   '["A. The part that covers the shoulders", "B. The part around the neck of a garment", "C. The bottom part of a shirt", "D. The front opening of a jacket"]',
   'vocabulary_general', 9);

INSERT INTO answers (question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('33333333-0009-0009-0009-000000000009',
   1,
   'Benar! Collar (kerah) adalah bagian pakaian yang melingkari leher. Ada banyak jenis kerah seperti collar button-down, turtleneck, dan V-neck.',
   'Salah. Collar bukan bahu (shoulder), bukan bagian bawah (hem), dan bukan bukaan depan (front opening). Collar adalah kerah yang melingkari leher.',
   '[{"word": "collar", "meaning": "kerah pakaian"}, {"word": "neck", "meaning": "leher"}]');

-- Soal 10: True/False — reading comprehension
INSERT INTO questions (id, quiz_id, type, prompt, passage, options, topic, "order") VALUES
  ('33333333-0010-0010-0010-000000000010',
   '22222222-0001-0001-0001-000000000001',
   'true_false',
   'According to the product description, this jacket has four pockets in total.',
   'Product: Classic Denim Jacket. Material: 100% Cotton Denim. Color: Indigo Blue. Features: Button front closure, two chest pockets, two side pockets. Care: Machine wash cold.',
   '["A. True", "B. False"]',
   'reading_comprehension', 10);

INSERT INTO answers (question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('33333333-0010-0010-0010-000000000010',
   0,
   'Benar! Pernyataan tersebut BENAR (True). Deskripsi menyebutkan "two chest pockets, two side pockets" — total 2 + 2 = 4 kantong.',
   'Salah. Hitung kantong yang disebutkan: "two chest pockets" (2 kantong dada) + "two side pockets" (2 kantong samping) = 4 kantong total.',
   '[{"word": "pocket", "meaning": "kantong, saku"}, {"word": "chest", "meaning": "dada"}]');

-- ============================================================
-- 6. SEED: Weekly Challenge pertama
-- ============================================================
INSERT INTO challenges (title, description, target_type, target_value, bonus_xp, week_id)
VALUES (
  'Mulai Perjalananmu! 🚀',
  'Selesaikan Placement Quiz dan 1 modul pembelajaran minggu ini untuk mendapatkan bonus XP!',
  'modules_complete',
  1,
  50,
  TO_CHAR(NOW(), 'IYYY"-W"IW')  -- ISO week format: "2026-W24"
);
