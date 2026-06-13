-- ============================================================
-- Seed Data Awal SALL Platform
-- Jalankan setelah semua migrasi berhasil
-- ============================================================

-- ============================================================
-- 1. SEED: 5 Modul Pembelajaran (published=true)
-- ============================================================
INSERT INTO modules (id, number, title, tagline, emoji, "order", published) VALUES
  ('00000000-0000-0000-0000-000000000001', 1, 'Fashion Vocabulary Builder',
   'Kuasai kosakata fashion dasar dalam bahasa Inggris',
   '👗', 1, true),
  ('00000000-0000-0000-0000-000000000002', 2, 'Reading Station',
   'Latih kemampuan membaca teks fashion umum',
   '📖', 2, true),
  ('00000000-0000-0000-0000-000000000003', 3, 'Fashion Label Reader',
   'Pahami setiap simbol dan tulisan di label pakaian',
   '🏷️', 3, true),
  ('00000000-0000-0000-0000-000000000004', 4, 'Catalogue & Product Description Reader',
   'Baca dan pahami katalog serta deskripsi produk fashion',
   '📋', 4, true),
  ('00000000-0000-0000-0000-000000000005', 5, 'Technical Instructions Reader',
   'Kuasai instruksi teknis menjahit dalam bahasa Inggris',
   '🔧', 5, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. SEED: Level records (beginner + intermediate per modul)
-- ============================================================
INSERT INTO levels (module_id, level, content_html) VALUES
  ('00000000-0000-0000-0000-000000000001', 'beginner', 
   '<h3>Garment Construction Basics</h3><p>Let''s learn the core parts of a piece of clothing. Every shirt, dress, and jacket is made up of distinct parts. The <b>collar</b> is the band of fabric around the neck. The <b>sleeve</b> is the part that covers your arm. The <b>hemline</b> is the bottom edge of the garment. Knowing these terms helps you understand garment construction.</p>'),
  ('00000000-0000-0000-0000-000000000001', 'intermediate', 
   '<h3>Fabric Properties & Composition</h3><p>Understanding fabric properties is essential for fashion design. Fabric <b>composition</b> describes the fibers used, such as cotton, polyester, or rayon. The <b>weave</b> refers to how the threads are interlaced (plain, twill, satin). The <b>drape</b> is how the fabric hangs or flows on a model. High drape fabrics like silk flow softly, while low drape fabrics like heavy denim are stiff.</p>'),
  
  ('00000000-0000-0000-0000-000000000002', 'beginner', 
   '<h3>Selecting Cotton Clothes</h3><p>Cotton is a popular choice for daily clothing. It is a <b>natural</b> fiber harvested from plants. Cotton fabric is highly <b>breathable</b>, which means it allows air to circulate, keeping you cool. It is also <b>durable</b> and can withstand many washes without wearing out easily.</p>'),
  ('00000000-0000-0000-0000-000000000002', 'intermediate', 
   '<h3>Sustainable Fashion and Textiles</h3><p>The fashion industry is shifting towards sustainability. Designers are choosing <b>organic</b> fibers grown without synthetic pesticides. Using <b>sustainable</b> practices helps reduce textile waste. Many modern clothes use eco-friendly <b>dye</b> to color fabrics without using harmful chemicals that harm the environment.</p>'),
  
  ('00000000-0000-0000-0000-000000000003', 'beginner', 
   '<h3>Understanding Care Labels</h3><p>Before you wash your new shirt, look at the care label. It tells you the proper <b>temperature</b> to use (e.g. wash cold at 30°C). It warns you if you should not use <b>bleach</b>, which can discolor the fabric. Always check if you need to <b>iron</b> the garment to remove wrinkles.</p>'),
  ('00000000-0000-0000-0000-000000000003', 'intermediate', 
   '<h3>Specialized Garment Care</h3><p>Delicate garments made of wool or silk require specialized care. Some blends cannot be washed in water and must be cleaned with a chemical <b>solvent</b> via professional dry cleaning. When machine washing, use a <b>delicate</b> cycle and avoid high heat in the <b>tumble</b> dryer to prevent shrinkage.</p>'),
  
  ('00000000-0000-0000-0000-000000000004', 'beginner', 
   '<h3>Denim Jacket Specifications</h3><p>This classic denim jacket is made of sturdy cotton <b>denim</b>. It features two chest <b>pockets</b> for storing small items. It has a regular <b>fit</b> that is comfortable for daily wear. Refer to the size chart to find your correct <b>chest</b> size.</p>'),
  ('00000000-0000-0000-0000-000000000004', 'intermediate', 
   '<h3>High-Performance Activewear Specs</h3><p>Performance activewear utilizes technical materials. The fabric is <b>moisture-wicking</b>, keeping the athlete dry by pulling sweat away from the body. It blends polyester with <b>spandex</b>, a highly <b>elastic</b> synthetic fiber that provides maximum stretch and flexibility during exercise.</p>'),
  
  ('00000000-0000-0000-0000-000000000005', 'beginner', 
   '<h3>How to Sew a Straight Stitch</h3><p>To start sewing, set up your sewing <b>machine</b>. Thread the <b>needle</b> with a strong sewing <b>thread</b>. Place the fabric under the foot and press the pedal gently to create a clean, <b>straight</b> line of stitches.</p>'),
  ('00000000-0000-0000-0000-000000000005', 'intermediate', 
   '<h3>Inserting a Hidden Zipper</h3><p>To insert a hidden <b>zipper</b>, first press the <b>seam-allowance</b> open with an iron. Align the zipper teeth along the seam line. Cut the fabric on the <b>bias</b> if you need extra flexibility in curved seams. Always check the <b>alignment</b> before sewing the final stitch.</p>')
ON CONFLICT (module_id, level) DO NOTHING;

-- ============================================================
-- 3. SEED: 6 Badge Definitions
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
   '{"type": "journal_count", "value": 10}')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 4. SEED: 50 Vocabulary Words (10 per Modul: 5 Beginner, 5 Intermediate)
-- ============================================================

-- Modul 1 Beginner
INSERT INTO vocab_words (id, module_id, level, word, meaning, example, emoji, category, "order") VALUES
  ('00000000-0000-0000-0005-000000000101', '00000000-0000-0000-0000-000000000001', 'beginner', 'collar', 'kerah pakaian', 'The shirt has a white collar around the neck.', '👔', 'Parts', 1),
  ('00000000-0000-0000-0005-000000000102', '00000000-0000-0000-0000-000000000001', 'beginner', 'sleeve', 'lengan baju', 'The long sleeve covers my arm completely.', '🧥', 'Parts', 2),
  ('00000000-0000-0000-0005-000000000103', '00000000-0000-0000-0000-000000000001', 'beginner', 'hemline', 'keliman bawah', 'She adjusted the hemline of the dress.', '👗', 'Parts', 3),
  ('00000000-0000-0000-0005-000000000104', '00000000-0000-0000-0000-000000000001', 'beginner', 'pocket', 'saku, kantong', 'I put my keys inside my front pocket.', '👖', 'Parts', 4),
  ('00000000-0000-0000-0005-000000000105', '00000000-0000-0000-0000-000000000001', 'beginner', 'seam', 'garis jahitan', 'The seam where the fabrics join is straight.', '🧵', 'Construction', 5)
ON CONFLICT (id) DO NOTHING;

-- Modul 1 Intermediate
INSERT INTO vocab_words (id, module_id, level, word, meaning, example, emoji, category, "order") VALUES
  ('00000000-0000-0000-0005-000000000106', '00000000-0000-0000-0000-000000000001', 'intermediate', 'composition', 'komposisi bahan', 'Check the tag for the composition of the fabric.', '🏷️', 'Properties', 1),
  ('00000000-0000-0000-0005-000000000107', '00000000-0000-0000-0000-000000000001', 'intermediate', 'weave', 'tenunan', 'Twill weave creates diagonal lines on denim.', '🕸️', 'Structure', 2),
  ('00000000-0000-0000-0005-000000000108', '00000000-0000-0000-0000-000000000001', 'intermediate', 'drape', 'jatuh kain', 'Silk fabric has a beautiful drape when worn.', '🧣', 'Properties', 3),
  ('00000000-0000-0000-0005-000000000109', '00000000-0000-0000-0000-000000000001', 'intermediate', 'shrinkage', 'penyusutan kain', 'Hot water causes high shrinkage in wool clothes.', '🔥', 'Properties', 4),
  ('00000000-0000-0000-0005-000000000110', '00000000-0000-0000-0000-000000000001', 'intermediate', 'thread', 'benang jahit', 'The sewing thread is made of polyester.', '🧵', 'Materials', 5)
ON CONFLICT (id) DO NOTHING;

-- Modul 2 Beginner
INSERT INTO vocab_words (id, module_id, level, word, meaning, example, emoji, category, "order") VALUES
  ('00000000-0000-0000-0005-000000000201', '00000000-0000-0000-0000-000000000002', 'beginner', 'natural', 'alami', 'Cotton is a natural fiber from plants.', '🌱', 'General', 1),
  ('00000000-0000-0000-0005-000000000202', '00000000-0000-0000-0000-000000000002', 'beginner', 'breathable', 'tembus udara, adem', 'Linen is a breathable fabric for hot weather.', '💨', 'Properties', 2),
  ('00000000-0000-0000-0005-000000000203', '00000000-0000-0000-0000-000000000002', 'beginner', 'durable', 'awet, tahan lama', 'Leather is a durable material for jackets.', '🛡️', 'Properties', 3),
  ('00000000-0000-0000-0005-000000000204', '00000000-0000-0000-0000-000000000002', 'beginner', 'cotton', 'katun', 'This cotton t-shirt is very soft.', '👕', 'Materials', 4),
  ('00000000-0000-0000-0005-000000000205', '00000000-0000-0000-0000-000000000002', 'beginner', 'fiber', 'serat kain', 'Wool is a warm animal fiber.', '🐑', 'Materials', 5)
ON CONFLICT (id) DO NOTHING;

-- Modul 2 Intermediate
INSERT INTO vocab_words (id, module_id, level, word, meaning, example, emoji, category, "order") VALUES
  ('00000000-0000-0000-0005-000000000206', '00000000-0000-0000-0000-000000000002', 'intermediate', 'organic', 'organik', 'We use organic cotton grown without chemicals.', '🌿', 'Materials', 1),
  ('00000000-0000-0000-0005-000000000207', '00000000-0000-0000-0000-000000000002', 'intermediate', 'sustainable', 'ramah lingkungan', 'Eco-friendly fashion supports sustainable production.', '🌍', 'General', 2),
  ('00000000-0000-0000-0005-000000000208', '00000000-0000-0000-0000-000000000002', 'intermediate', 'textile', 'tekstil', 'The factory produces high-quality textile goods.', '🏭', 'Materials', 3),
  ('00000000-0000-0000-0005-000000000209', '00000000-0000-0000-0000-000000000002', 'intermediate', 'dye', 'pewarna pakaian', 'Natural dye is used to color the organic cloth.', '🎨', 'Chemicals', 4),
  ('00000000-0000-0000-0005-000000000210', '00000000-0000-0000-0000-000000000002', 'intermediate', 'biodegrade', 'terurai secara alami', 'Natural fibers biodegrade easily in soil.', '🍂', 'Properties', 5)
ON CONFLICT (id) DO NOTHING;

-- Modul 3 Beginner
INSERT INTO vocab_words (id, module_id, level, word, meaning, example, emoji, category, "order") VALUES
  ('00000000-0000-0000-0005-000000000301', '00000000-0000-0000-0000-000000000003', 'beginner', 'temperature', 'suhu cuci', 'Wash the shirt at a low temperature of 30°C.', '🌡️', 'Care', 1),
  ('00000000-0000-0000-0005-000000000302', '00000000-0000-0000-0000-000000000003', 'beginner', 'bleach', 'pemutih pakaian', 'Do not use bleach on colored clothing.', '🧪', 'Care', 2),
  ('00000000-0000-0000-0005-000000000303', '00000000-0000-0000-0000-000000000003', 'beginner', 'iron', 'setrika', 'Use a hot iron to remove fabric wrinkles.', '💨', 'Care', 3),
  ('00000000-0000-0000-0005-000000000304', '00000000-0000-0000-0000-000000000003', 'beginner', 'wash', 'mencuci', 'You should wash dark colors separately.', '🧼', 'Care', 4),
  ('00000000-0000-0000-0005-000000000305', '00000000-0000-0000-0000-000000000003', 'beginner', 'dry', 'mengeringkan', 'Hang the wet dress outside to dry.', '☀️', 'Care', 5)
ON CONFLICT (id) DO NOTHING;

-- Modul 3 Intermediate
INSERT INTO vocab_words (id, module_id, level, word, meaning, example, emoji, category, "order") VALUES
  ('00000000-0000-0000-0005-000000000306', '00000000-0000-0000-0000-000000000003', 'intermediate', 'solvent', 'cairan pelarut kimia', 'Dry cleaning uses a chemical solvent instead of water.', '🧪', 'Dry Cleaning', 1),
  ('00000000-0000-0000-0005-000000000307', '00000000-0000-0000-0000-000000000003', 'intermediate', 'delicate', 'halus, rapuh', 'Lace is a delicate fabric that tears easily.', '🕸️', 'Properties', 2),
  ('00000000-0000-0000-0005-000000000308', '00000000-0000-0000-0000-000000000003', 'intermediate', 'tumble', 'putaran mesin pengering', 'Do not tumble dry this woolen sweater.', '🔄', 'Care', 3),
  ('00000000-0000-0000-0005-000000000309', '00000000-0000-0000-0000-000000000003', 'intermediate', 'blend', 'campuran serat', 'This fabric is a cotton-polyester blend.', '🌾', 'Materials', 4),
  ('00000000-0000-0000-0005-000000000310', '00000000-0000-0000-0000-000000000003', 'intermediate', 'chemical', 'bahan kimia', 'Synthetic dyes contain strong chemical compounds.', '⚗️', 'General', 5)
ON CONFLICT (id) DO NOTHING;

-- Modul 4 Beginner
INSERT INTO vocab_words (id, module_id, level, word, meaning, example, emoji, category, "order") VALUES
  ('00000000-0000-0000-0005-000000000401', '00000000-0000-0000-0000-000000000004', 'beginner', 'denim', 'denim, jeans', 'Blue jeans are made of denim fabric.', '👖', 'Materials', 1),
  ('00000000-0000-0000-0005-000000000402', '00000000-0000-0000-0000-000000000004', 'beginner', 'pockets', 'kantong-kantong', 'This jacket has four pockets on the front.', '🧥', 'Parts', 2),
  ('00000000-0000-0000-0005-000000000403', '00000000-0000-0000-0000-000000000004', 'beginner', 'fit', 'kesesuaian pakaian', 'The shirt has a slim fit style.', '👕', 'Style', 3),
  ('00000000-0000-0000-0005-000000000404', '00000000-0000-0000-0000-000000000004', 'beginner', 'chest', 'lingkar dada', 'Measure your chest circumference before ordering.', '📏', 'Sizing', 4),
  ('00000000-0000-0000-0005-000000000405', '00000000-0000-0000-0000-000000000004', 'beginner', 'size', 'ukuran', 'What size of pants do you wear?', '🏷️', 'Sizing', 5)
ON CONFLICT (id) DO NOTHING;

-- Modul 4 Intermediate
INSERT INTO vocab_words (id, module_id, level, word, meaning, example, emoji, category, "order") VALUES
  ('00000000-0000-0000-0005-000000000406', '00000000-0000-0000-0000-000000000004', 'intermediate', 'moisture-wicking', 'menyerap keringat', 'Athletic wear uses moisture-wicking technology.', '💦', 'Properties', 1),
  ('00000000-0000-0000-0005-000000000407', '00000000-0000-0000-0000-000000000004', 'intermediate', 'spandex', 'spandeks, serat elastis', 'Sportswear has spandex for high flexibility.', '🏃', 'Materials', 2),
  ('00000000-0000-0000-0005-000000000408', '00000000-0000-0000-0000-000000000004', 'intermediate', 'elastic', 'elastis', 'The waistband has an elastic band inside.', '🎗️', 'Materials', 3),
  ('00000000-0000-0000-0005-000000000409', '00000000-0000-0000-0000-000000000004', 'intermediate', 'stretch', 'meregang', 'This fabric can stretch in four directions.', '↔️', 'Properties', 4),
  ('00000000-0000-0000-0005-000000000410', '00000000-0000-0000-0000-000000000004', 'intermediate', 'synthetic', 'sintetis, buatan', 'Nylon is a synthetic polymer material.', '🧬', 'Materials', 5)
ON CONFLICT (id) DO NOTHING;

-- Modul 5 Beginner
INSERT INTO vocab_words (id, module_id, level, word, meaning, example, emoji, category, "order") VALUES
  ('00000000-0000-0000-0005-000000000501', '00000000-0000-0000-0000-000000000005', 'beginner', 'machine', 'mesin jahit', 'Turn on the sewing machine before starting.', '🔌', 'Tools', 1),
  ('00000000-0000-0000-0005-000000000502', '00000000-0000-0000-0000-000000000005', 'beginner', 'needle', 'jarum jahit', 'Insert the thread through the needle eye.', '📍', 'Tools', 2),
  ('00000000-0000-0000-0005-000000000503', '00000000-0000-0000-0000-000000000005', 'beginner', 'thread', 'benang jahit', 'The sewing thread is wound on a bobbin.', '🧵', 'Materials', 3),
  ('00000000-0000-0000-0005-000000000504', '00000000-0000-0000-0000-000000000005', 'beginner', 'straight', 'lurus', 'Sew a straight line along the edge.', '📏', 'Technique', 4),
  ('00000000-0000-0000-0005-000000000505', '00000000-0000-0000-0000-000000000005', 'beginner', 'stitch', 'tusuk jahitan', 'Make a tight stitch to join the fabrics.', '🧵', 'Technique', 5)
ON CONFLICT (id) DO NOTHING;

-- Modul 5 Intermediate
INSERT INTO vocab_words (id, module_id, level, word, meaning, example, emoji, category, "order") VALUES
  ('00000000-0000-0000-0005-000000000506', '00000000-0000-0000-0000-000000000005', 'intermediate', 'zipper', 'risleting', 'The dress has a hidden zipper at the back.', '🤐', 'Parts', 1),
  ('00000000-0000-0000-0005-000000000507', '00000000-0000-0000-0000-000000000005', 'intermediate', 'seam-allowance', 'kampuh jahitan', 'Leave a 1.5 cm seam-allowance when cutting.', '📏', 'Technique', 2),
  ('00000000-0000-0000-0005-000000000508', '00000000-0000-0000-0000-000000000005', 'intermediate', 'hem', 'kelim bawah', 'Fold the hem twice and sew it.', '👗', 'Technique', 3),
  ('00000000-0000-0000-0005-000000000509', '00000000-0000-0000-0000-000000000005', 'intermediate', 'bias', 'potongan serong', 'Cutting on the bias makes the fabric stretchier.', '✂️', 'Technique', 4),
  ('00000000-0000-0000-0005-000000000510', '00000000-0000-0000-0000-000000000005', 'intermediate', 'alignment', 'keselarasan jahitan', 'Ensure proper alignment of the collar before sewing.', '📐', 'Technique', 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. SEED: Placement Quiz
-- ============================================================
INSERT INTO quizzes (id, module_id, level, title, activity_type) VALUES
  ('00000000-0000-0000-0001-000000000001', NULL, 'placement', 'Placement Quiz — Tes Kemampuan Awal', 'placement')
ON CONFLICT (id) DO NOTHING;

-- Soal 1: Vocabulary — fabric types
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'vocab', 'What does the word "cotton" mean in fashion?', '["A. Wool fabric", "B. Natural fiber from plants", "C. Synthetic material", "D. Silk material"]', 'fabric_types', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0002-000000000001', 1, 'Benar! Cotton (kapas) adalah serat alami yang berasal dari tanaman kapas.', 'Salah. Cotton bukan wol, bukan sintetis, dan bukan sutra.', '[{"word": "cotton", "meaning": "kapas, serat alami"}]')
ON CONFLICT (id) DO NOTHING;

-- Soal 2: Vocabulary — fabric types
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', 'vocab', 'Which of the following is a synthetic fabric?', '["A. Silk", "B. Linen", "C. Polyester", "D. Wool"]', 'fabric_types', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0002-000000000002', 2, 'Benar! Polyester adalah kain sintetis (buatan manusia) yang terbuat dari bahan kimia.', 'Salah. Silk (sutra), Linen (rami), dan Wool (wol) adalah serat alami.', '[{"word": "synthetic", "meaning": "sintetis"}, {"word": "polyester", "meaning": "poliester"}]')
ON CONFLICT (id) DO NOTHING;

-- Soal 3: Reading comprehension
INSERT INTO questions (id, quiz_id, type, prompt, passage, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001', 'reading', 'Based on the label, what temperature should this garment be washed at?', 'Care Instructions: Machine wash cold (30°C). Do not bleach. Tumble dry low. Iron on low heat. Do not dry clean.', '["A. 60°C", "B. 40°C", "C. 30°C", "D. 50°C"]', 'label_reading', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0002-000000000003', 2, 'Benar! Label tersebut menyatakan "Machine wash cold (30°C)".', 'Salah. Label menyatakan "Machine wash cold (30°C)" — suhunya adalah 30°C.', '[{"word": "garment", "meaning": "pakaian"}]')
ON CONFLICT (id) DO NOTHING;

-- Soal 4: True/False — label reading
INSERT INTO questions (id, quiz_id, type, prompt, passage, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000001', 'true_false', 'The label says this garment can be dry cleaned.', 'Care Instructions: Machine wash cold (30°C). Do not bleach. Tumble dry low. Iron on low heat. Do not dry clean.', '["A. True", "B. False"]', 'label_reading', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0002-000000000004', 1, 'Benar! Pernyataan tersebut SALAH (False). Label jelas menyatakan "Do not dry clean".', 'Salah. Baca label lagi — tertulis "Do not dry clean".', '[{"word": "dry clean", "meaning": "cuci kering"}]')
ON CONFLICT (id) DO NOTHING;

-- Soal 5: Vocabulary — general fashion
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000001', 'vocab', 'What is the meaning of "hemline" in fashion?', '["A. The collar of a shirt", "B. The bottom edge of a garment", "C. The sleeve of a jacket", "D. The waistband of pants"]', 'vocabulary_general', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0002-000000000005', 1, 'Benar! Hemline adalah tepi bawah dari sebuah pakaian (gaun, rok, atau celana).', 'Salah. Hemline bukan kerah, lengan, atau ikat pinggang. Hemline adalah tepi bawah pakaian.', '[{"word": "hemline", "meaning": "tepi bawah pakaian"}]')
ON CONFLICT (id) DO NOTHING;

-- Soal 6: Reading — catalogue
INSERT INTO questions (id, quiz_id, type, prompt, passage, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000001', 'reading', 'What material is this jacket made of?', 'Product: Classic Denim Jacket. Material: 100% Cotton Denim. Color: Indigo Blue. Features: Button front closure, two chest pockets, two side pockets. Care: Machine wash cold.', '["A. Polyester", "B. Silk", "C. Cotton Denim", "D. Linen"]', 'catalogue_reading', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0002-000000000006', 2, 'Benar! Deskripsi produk menyatakan "Material: 100% Cotton Denim".', 'Salah. Bacalah bagian "Material" pada deskripsi produk. Tertulis "100% Cotton Denim".', '[{"word": "denim", "meaning": "denim, kain jeans"}]')
ON CONFLICT (id) DO NOTHING;

-- Soal 7: Vocabulary — technical
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000001', 'vocab', 'What does "seam" mean in sewing instructions?', '["A. The pattern printed on fabric", "B. The line where two pieces of fabric are sewn together", "C. The button on a shirt", "D. The zipper of a jacket"]', 'technical_instructions', 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0002-000000000007', 1, 'Benar! Seam adalah garis jahitan di mana dua potongan kain dijahit bersama.', 'Salah. Seam bukan motif kain, kancing, atau risleting.', '[{"word": "seam", "meaning": "jahitan, sambungan"}]')
ON CONFLICT (id) DO NOTHING;

-- Soal 8: Reading — technical instructions
INSERT INTO questions (id, quiz_id, type, prompt, passage, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000001', 'reading', 'What is the seam allowance mentioned in the instructions?', 'Sewing Instructions: Step 1 — Cut fabric pieces according to pattern. Step 2 — Pin pieces right sides together. Step 3 — Sew along marked line with 1.5 cm seam allowance. Step 4 — Press seams open with iron.', '["A. 1 cm", "B. 2 cm", "C. 1.5 cm", "D. 2.5 cm"]', 'technical_instructions', 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000008', '00000000-0000-0000-0002-000000000008', 2, 'Benar! Instruksi menyatakan "with 1.5 cm seam allowance".', 'Salah. Bacalah instruksi dengan teliti. Tertulis "1.5 cm seam allowance".', '[{"word": "seam allowance", "meaning": "kampuh jahitan"}]')
ON CONFLICT (id) DO NOTHING;

-- Soal 9: Vocabulary — fashion general
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000001', 'vocab', 'What is a "collar" in fashion terminology?', '["A. The part that covers the shoulders", "B. The part around the neck of a garment", "C. The bottom part of a shirt", "D. The front opening of a jacket"]', 'vocabulary_general', 9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000009', '00000000-0000-0000-0002-000000000009', 1, 'Benar! Collar (kerah) adalah bagian pakaian yang melingkari leher.', 'Salah. Collar bukan bahu, hemline, atau bukaan depan.', '[{"word": "collar", "meaning": "kerah pakaian"}]')
ON CONFLICT (id) DO NOTHING;

-- Soal 10: True/False — reading comprehension
INSERT INTO questions (id, quiz_id, type, prompt, passage, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000001', 'true_false', 'According to the product description, this jacket has four pockets in total.', 'Product: Classic Denim Jacket. Material: 100% Cotton Denim. Color: Indigo Blue. Features: Button front closure, two chest pockets, two side pockets. Care: Machine wash cold.', '["A. True", "B. False"]', 'reading_comprehension', 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000010', '00000000-0000-0000-0002-000000000010', 0, 'Benar! Deskripsi menyebutkan "two chest pockets, two side pockets" — total 4 kantong.', 'Salah. Hitung kantong yang disebutkan: "two chest pockets" + "two side pockets" = 4 kantong total.', '[{"word": "pocket", "meaning": "saku"}]')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 6. SEED: Quizzes untuk Level Modul (10 Quizzes: 5 Modul * 2 Level)
-- ============================================================

-- Modul 1
INSERT INTO quizzes (id, module_id, level, title, activity_type) VALUES
  ('00000000-0000-0000-0001-000000000101', '00000000-0000-0000-0000-000000000001', 'beginner', 'Kuis Modul 1: Bagian Pakaian Dasar', 'quiz'),
  ('00000000-0000-0000-0001-000000000102', '00000000-0000-0000-0000-000000000001', 'intermediate', 'Kuis Modul 1: Sifat & Tenunan Kain', 'quiz')
ON CONFLICT (id) DO NOTHING;

-- Modul 2
INSERT INTO quizzes (id, module_id, level, title, activity_type) VALUES
  ('00000000-0000-0000-0001-000000000201', '00000000-0000-0000-0000-000000000002', 'beginner', 'Kuis Modul 2: Serat Alami & Kain', 'quiz'),
  ('00000000-0000-0000-0001-000000000202', '00000000-0000-0000-0000-000000000002', 'intermediate', 'Kuis Modul 2: Eco-Fashion & Tekstil', 'quiz')
ON CONFLICT (id) DO NOTHING;

-- Modul 3
INSERT INTO quizzes (id, module_id, level, title, activity_type) VALUES
  ('00000000-0000-0000-0001-000000000301', '00000000-0000-0000-0000-000000000003', 'beginner', 'Kuis Modul 3: Instruksi Label Cuci', 'quiz'),
  ('00000000-0000-0000-0001-000000000302', '00000000-0000-0000-0000-000000000003', 'intermediate', 'Kuis Modul 3: Perawatan Khusus Wool & Sutra', 'quiz')
ON CONFLICT (id) DO NOTHING;

-- Modul 4
INSERT INTO quizzes (id, module_id, level, title, activity_type) VALUES
  ('00000000-0000-0000-0001-000000000401', '00000000-0000-0000-0000-000000000004', 'beginner', 'Kuis Modul 4: Membaca Detail Katalog', 'quiz'),
  ('00000000-0000-0000-0001-000000000402', '00000000-0000-0000-0000-000000000004', 'intermediate', 'Kuis Modul 4: Spesifikasi Activewear Teknis', 'quiz')
ON CONFLICT (id) DO NOTHING;

-- Modul 5
INSERT INTO quizzes (id, module_id, level, title, activity_type) VALUES
  ('00000000-0000-0000-0001-000000000501', '00000000-0000-0000-0000-000000000005', 'beginner', 'Kuis Modul 5: Dasar Jahitan Mesin', 'quiz'),
  ('00000000-0000-0000-0001-000000000502', '00000000-0000-0000-0000-000000000005', 'intermediate', 'Kuis Modul 5: Pemasangan Zipper Tersembunyi', 'quiz')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 7. SEED: Soal-soal Kuis Modul (3 Soal per Kuis * 10 Kuis = 30 Soal)
-- ============================================================

-- --- MODUL 1 BEGINNER QUIZ QUESTIONS ---
-- Q1: collar
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000101', '00000000-0000-0000-0001-000000000101', 'multiple_choice', 'Which part of a shirt wraps around the neck?', '["A. Sleeve", "B. Hemline", "C. Collar", "D. Pocket"]', 'garment_parts', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000101', '00000000-0000-0000-0002-000000000101', 2, 'Benar! Collar (kerah) adalah bagian kain yang melingkari leher.', 'Salah. Sleeve membungkus lengan, Hemline di ujung bawah, Pocket adalah saku.', '[{"word": "collar", "meaning": "kerah pakaian"}]')
ON CONFLICT (id) DO NOTHING;

-- Q2: sleeve
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000102', '00000000-0000-0000-0001-000000000101', 'multiple_choice', 'What is the part of a garment that covers the arm?', '["A. Collar", "B. Sleeve", "C. Seam", "D. Hemline"]', 'garment_parts', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000102', '00000000-0000-0000-0002-000000000102', 1, 'Benar! Sleeve (lengan baju) adalah bagian pakaian yang menutupi lengan.', 'Salah. Collar adalah kerah, Seam adalah garis jahitan, Hemline adalah ujung bawah.', '[{"word": "sleeve", "meaning": "lengan baju"}]')
ON CONFLICT (id) DO NOTHING;

-- Q3: hemline
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000103', '00000000-0000-0000-0001-000000000101', 'true_false', 'The bottom edge of a dress is called the hemline.', '["A. True", "B. False"]', 'garment_parts', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000103', '00000000-0000-0000-0002-000000000103', 0, 'Benar! Ujung garis bawah pakaian disebut hemline.', 'Salah. Pernyataan tersebut BENAR. Ujung bawah pakaian memang disebut hemline.', '[{"word": "hemline", "meaning": "keliman bawah"}]')
ON CONFLICT (id) DO NOTHING;


-- --- MODUL 1 INTERMEDIATE QUIZ QUESTIONS ---
-- Q1: composition
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000104', '00000000-0000-0000-0001-000000000102', 'multiple_choice', 'Which word refers to the percentage of different fibers used to make a fabric?', '["A. Weave", "B. Composition", "C. Drape", "D. Shrinkage"]', 'fabric_properties', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000104', '00000000-0000-0000-0002-000000000104', 1, 'Benar! Composition adalah persentase jenis serat pembentuk kain (misal: 60% katun, 40% poliester).', 'Salah. Weave adalah tenunan, Drape adalah kejatuhan kain, Shrinkage adalah penyusutan.', '[{"word": "composition", "meaning": "komposisi bahan"}]')
ON CONFLICT (id) DO NOTHING;

-- Q2: drape
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000105', '00000000-0000-0000-0001-000000000102', 'multiple_choice', 'How a fabric flows and hangs on a body or mannequin is called its _____.', '["A. Weave", "B. Drape", "C. Thread", "D. Composition"]', 'fabric_properties', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000105', '00000000-0000-0000-0002-000000000105', 1, 'Benar! Drape mengacu pada kelenturan kain saat digantung atau dipakai.', 'Salah. Weave adalah pola silangan benang, Thread adalah benang jahit, Composition adalah persentase kandungan serat.', '[{"word": "drape", "meaning": "jatuh kain"}]')
ON CONFLICT (id) DO NOTHING;

-- Q3: shrinkage
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000106', '00000000-0000-0000-0001-000000000102', 'true_false', 'Wool garments usually have lower shrinkage rates than synthetic materials when washed in hot water.', '["A. True", "B. False"]', 'fabric_properties', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000106', '00000000-0000-0000-0002-000000000106', 1, 'Benar! Wool memiliki tingkat penyusutan (shrinkage) yang sangat tinggi di air panas dibanding serat sintetis.', 'Salah. Pernyataan tersebut SALAH. Serat wol menyusut jauh lebih banyak daripada serat sintetis.', '[{"word": "shrinkage", "meaning": "penyusutan kain"}]')
ON CONFLICT (id) DO NOTHING;


-- --- MODUL 2 BEGINNER QUIZ QUESTIONS ---
-- Q1: natural
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000201', '00000000-0000-0000-0001-000000000201', 'multiple_choice', 'Which type of fiber comes directly from plants or animals?', '["A. Synthetic", "B. Polyester", "C. Natural", "D. Nylon"]', 'fiber_origins', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000201', '00000000-0000-0000-0002-000000000201', 2, 'Benar! Serat Natural (alami) berasal langsung dari alam (tanaman/hewan).', 'Salah. Synthetic, Polyester, dan Nylon adalah serat buatan manusia dari zat kimia.', '[{"word": "natural", "meaning": "alami"}]')
ON CONFLICT (id) DO NOTHING;

-- Q2: breathable
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000202', '00000000-0000-0000-0001-000000000201', 'multiple_choice', 'What fabric quality allows air to pass through easily, keeping you cool?', '["A. Durable", "B. Stiff", "C. Breathable", "D. Heavy"]', 'fabric_properties', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000202', '00000000-0000-0000-0002-000000000202', 2, 'Benar! Breathable (tembus udara/adem) memungkinkan sirkulasi udara yang baik.', 'Salah. Durable berarti awet, Stiff berarti kaku, Heavy berarti berat.', '[{"word": "breathable", "meaning": "tembus udara, adem"}]')
ON CONFLICT (id) DO NOTHING;

-- Q3: durable
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000203', '00000000-0000-0000-0001-000000000201', 'true_false', 'A durable fabric is one that wears out very quickly after one wash.', '["A. True", "B. False"]', 'fabric_properties', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000203', '00000000-0000-0000-0002-000000000203', 1, 'Benar! Pernyataan tersebut SALAH. Durable berarti kuat dan tahan lama, tidak mudah rusak.', 'Salah. Durable berarti awet, bukan cepat rusak.', '[{"word": "durable", "meaning": "awet, tahan lama"}]')
ON CONFLICT (id) DO NOTHING;


-- --- MODUL 2 INTERMEDIATE QUIZ QUESTIONS ---
-- Q1: sustainable
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000204', '00000000-0000-0000-0001-000000000202', 'multiple_choice', 'Fashion practices that support environmental safety and reuse of resources are called _____.', '["A. Chemical", "B. Sustainable", "C. Synthetic", "D. Fast fashion"]', 'eco_fashion', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000204', '00000000-0000-0000-0002-000000000204', 1, 'Benar! Sustainable fashion adalah gerakan mode ramah lingkungan berkelanjutan.', 'Salah. Fast fashion dan bahan kimia merusak lingkungan.', '[{"word": "sustainable", "meaning": "ramah lingkungan"}]')
ON CONFLICT (id) DO NOTHING;

-- Q2: organic
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000205', '00000000-0000-0000-0001-000000000202', 'multiple_choice', 'Fibers grown without using harmful chemicals or synthetic fertilizers are called _____.', '["A. Polyester", "B. Organic", "C. Acrylic", "D. Nylon"]', 'eco_materials', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000205', '00000000-0000-0000-0002-000000000205', 1, 'Benar! Organic (organik) ditanam secara alami bebas pupuk kimia buatan.', 'Salah. Polyester, Nylon, dan Acrylic adalah serat buatan berbasis plastik kimia.', '[{"word": "organic", "meaning": "organik"}]')
ON CONFLICT (id) DO NOTHING;

-- Q3: biodegrade
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000206', '00000000-0000-0000-0001-000000000202', 'true_false', 'Natural fibers such as cotton and wool cannot biodegrade when discarded.', '["A. True", "B. False"]', 'eco_properties', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000206', '00000000-0000-0000-0002-000000000206', 1, 'Benar! Serat alami seperti kapas dan wol BISA terurai secara hayati (biodegrade) dengan mudah.', 'Salah. Pernyataan tersebut SALAH. Serat alami dapat hancur menyatu dengan tanah.', '[{"word": "biodegrade", "meaning": "terurai secara alami"}]')
ON CONFLICT (id) DO NOTHING;


-- --- MODUL 3 BEGINNER QUIZ QUESTIONS ---
-- Q1: temperature
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000301', '00000000-0000-0000-0001-000000000301', 'multiple_choice', 'What does the number like "30°C" or "40°C" on care labels indicate?', '["A. Iron heat", "B. Washing temperature", "C. Air drying time", "D. Bleaching level"]', 'care_labels', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000301', '00000000-0000-0000-0002-000000000301', 1, 'Benar! Suhu tersebut menunjukkan batas temperatur air maksimum saat mencuci.', 'Salah. Angka derajat Celsius menunjukkan temperatur air pencuci, bukan menyetrika.', '[{"word": "temperature", "meaning": "suhu cuci"}]')
ON CONFLICT (id) DO NOTHING;

-- Q2: bleach
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000302', '00000000-0000-0000-0001-000000000301', 'multiple_choice', 'Which chemical is used to whiten garments but can damage colored fabric?', '["A. Vinegar", "B. Softener", "C. Bleach", "D. Starch"]', 'care_chemicals', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000302', '00000000-0000-0000-0002-000000000302', 2, 'Benar! Bleach (pemutih/klorin) merusak zat warna kain non-putih.', 'Salah. Softener melembutkan, Bleach adalah pemutih pakaian.', '[{"word": "bleach", "meaning": "pemutih pakaian"}]')
ON CONFLICT (id) DO NOTHING;

-- Q3: dry
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000303', '00000000-0000-0000-0001-000000000301', 'true_false', '"Hang to dry" means you should put the wet garment in the washing machine spin-dryer.', '["A. True", "B. False"]', 'care_methods', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000303', '00000000-0000-0000-0002-000000000303', 1, 'Benar! Pernyataan tersebut SALAH. "Hang to dry" berarti menggantung pakaian basah di tempat berangin sampai kering alami.', 'Salah. Hang to dry berarti digantung, bukan dikeringkan di mesin putar.', '[{"word": "dry", "meaning": "mengeringkan"}]')
ON CONFLICT (id) DO NOTHING;


-- --- MODUL 3 INTERMEDIATE QUIZ QUESTIONS ---
-- Q1: solvent
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000304', '00000000-0000-0000-0001-000000000302', 'multiple_choice', 'Professional dry cleaning uses a liquid chemical _____ instead of water.', '["A. Bleach", "B. Solvent", "C. Softener", "D. Starch"]', 'dry_cleaning', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000304', '00000000-0000-0000-0002-000000000304', 1, 'Benar! Solvent (pelarut kimia non-air) melarutkan noda tanpa merusak serat sensitif.', 'Salah. Bleach memutihkan, Solvent digunakan untuk dry cleaning.', '[{"word": "solvent", "meaning": "cairan pelarut kimia"}]')
ON CONFLICT (id) DO NOTHING;

-- Q2: delicate
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000305', '00000000-0000-0000-0001-000000000302', 'multiple_choice', 'Lace, silk, and wool are examples of _____ fabrics that require low agitation cycles.', '["A. Durable", "B. Stiff", "C. Heavy", "D. Delicate"]', 'care_methods', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000305', '00000000-0000-0000-0002-000000000305', 3, 'Benar! Delicate (sensitif/halus) mudah sobek dan menyusut jika dicuci terlalu kuat.', 'Salah. Serat-serat tersebut tipis dan halus (delicate).', '[{"word": "delicate", "meaning": "halus, rapuh"}]')
ON CONFLICT (id) DO NOTHING;

-- Q3: tumble
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000306', '00000000-0000-0000-0001-000000000302', 'true_false', '"Do not tumble dry" means you can dry the garment in a hot spinning dryer.', '["A. True", "B. False"]', 'care_labels', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000306', '00000000-0000-0000-0002-000000000306', 1, 'Benar! Pernyataan tersebut SALAH. "Do not tumble dry" melarang penggunaan mesin pengering berputar.', 'Salah. Do not tumble dry melarang penggunaan pengering mesin jahit / mesin cuci.', '[{"word": "tumble", "meaning": "putaran mesin pengering"}]')
ON CONFLICT (id) DO NOTHING;


-- --- MODUL 4 BEGINNER QUIZ QUESTIONS ---
-- Q1: pockets
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000401', '00000000-0000-0000-0001-000000000401', 'multiple_choice', 'Which feature is used to store small objects like coins or keys in a jacket?', '["A. Collar", "B. Sleeve", "C. Pockets", "D. Buttons"]', 'product_details', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000401', '00000000-0000-0000-0002-000000000401', 2, 'Benar! Pockets (saku/kantong) digunakan untuk menyimpan benda-benda kecil.', 'Salah. Collar adalah kerah, Sleeve lengan, Pockets kantong.', '[{"word": "pockets", "meaning": "kantong-kantong"}]')
ON CONFLICT (id) DO NOTHING;

-- Q2: fit
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000402', '00000000-0000-0000-0001-000000000401', 'multiple_choice', 'The style or shape that dictates how clothing sits closely or loosely on a body is its _____.', '["A. Size", "B. Fit", "C. Color", "D. Print"]', 'product_details', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000402', '00000000-0000-0000-0002-000000000402', 1, 'Benar! Fit (pola potongan baju, misal: regular fit, slim fit) menentukan kelonggaran pakaian.', 'Salah. Size menentukan dimensi ukuran angka/huruf.', '[{"word": "fit", "meaning": "kesesuaian pakaian"}]')
ON CONFLICT (id) DO NOTHING;

-- Q3: size
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000403', '00000000-0000-0000-0001-000000000401', 'true_false', '"S, M, L, XL" are examples of fabric weave styles.', '["A. True", "B. False"]', 'sizing', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000403', '00000000-0000-0000-0002-000000000403', 1, 'Benar! S, M, L, XL adalah ukuran pakaian (size), bukan tipe tenunan kain.', 'Salah. Itu adalah kode ukuran (size) pakaian.', '[{"word": "size", "meaning": "ukuran"}]')
ON CONFLICT (id) DO NOTHING;


-- --- MODUL 4 INTERMEDIATE QUIZ QUESTIONS ---
-- Q1: moisture-wicking
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000404', '00000000-0000-0000-0001-000000000402', 'multiple_choice', 'Activewear fabric designed to pull sweat away from your body is described as _____.', '["A. Heavyweight", "B. Moisture-wicking", "C. Stiff", "D. Non-elastic"]', 'activewear_specs', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000404', '00000000-0000-0000-0002-000000000404', 1, 'Benar! Moisture-wicking menyerap keringat dari kulit dan menguapkannya dengan cepat.', 'Salah. Heavyweight membuat berat, Moisture-wicking menjaga tetap kering.', '[{"word": "moisture-wicking", "meaning": "menyerap keringat"}]')
ON CONFLICT (id) DO NOTHING;

-- Q2: spandex
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000405', '00000000-0000-0000-0001-000000000402', 'multiple_choice', 'Which synthetic fiber is blended in sportswear to provide elastic stretch?', '["A. Linen", "B. Spandex", "C. Wool", "D. Cotton"]', 'activewear_materials', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000405', '00000000-0000-0000-0002-000000000405', 1, 'Benar! Spandex (juga dikenal sebagai elastane/lycra) memberikan elastisitas tinggi.', 'Salah. Linen, Wool, dan Cotton adalah serat alami minim kelenturan.', '[{"word": "spandex", "meaning": "spandeks, serat elastis"}]')
ON CONFLICT (id) DO NOTHING;

-- Q3: synthetic
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000406', '00000000-0000-0000-0001-000000000402', 'true_false', 'Nylon is a synthetic fiber, meaning it is made from petrochemicals.', '["A. True", "B. False"]', 'materials_origin', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000406', '00000000-0000-0000-0002-000000000406', 0, 'Benar! Nylon adalah serat buatan sintetis hasil olahan polimer minyak bumi.', 'Salah. Pernyataan tersebut BENAR. Nylon bukan serat tanaman/hewan.', '[{"word": "synthetic", "meaning": "sintetis, buatan"}]')
ON CONFLICT (id) DO NOTHING;


-- --- MODUL 5 BEGINNER QUIZ QUESTIONS ---
-- Q1: needle
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000501', '00000000-0000-0000-0001-000000000501', 'multiple_choice', 'The sharp metal tool that carries thread through fabric in a machine is the _____.', '["A. Pedal", "B. Needle", "C. Bobbin", "D. Scissors"]', 'sewing_tools', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000501', '00000000-0000-0000-0002-000000000501', 1, 'Benar! Needle (jarum jahit) mengantarkan benang menembus lembaran kain.', 'Salah. Pedal mengontrol kecepatan, Bobbin menyimpan benang bawah.', '[{"word": "needle", "meaning": "jarum jahit"}]')
ON CONFLICT (id) DO NOTHING;

-- Q2: machine
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000502', '00000000-0000-0000-0001-000000000501', 'multiple_choice', 'Which mechanical device is used to stitch fabric pieces together?', '["A. Loom", "B. Spinning wheel", "C. Sewing machine", "D. Iron"]', 'sewing_tools', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000502', '00000000-0000-0000-0002-000000000502', 2, 'Benar! Sewing machine (mesin jahit) mempercepat proses penyambungan kain.', 'Salah. Loom untuk menenun benang menjadi kain, Sewing machine untuk menjahit.', '[{"word": "machine", "meaning": "mesin jahit"}]')
ON CONFLICT (id) DO NOTHING;

-- Q3: straight
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000503', '00000000-0000-0000-0001-000000000501', 'true_false', 'A straight stitch creates wavy and zig-zag lines on fabric.', '["A. True", "B. False"]', 'sewing_techniques', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000503', '00000000-0000-0000-0002-000000000503', 1, 'Benar! Pernyataan tersebut SALAH. Straight stitch menghasilkan jahitan lurus sempurna.', 'Salah. Straight stitch berarti jahitan lurus, bukan zig-zag.', '[{"word": "straight", "meaning": "lurus"}]')
ON CONFLICT (id) DO NOTHING;


-- --- MODUL 5 INTERMEDIATE QUIZ QUESTIONS ---
-- Q1: seam-allowance
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000504', '00000000-0000-0000-0001-000000000502', 'multiple_choice', 'The distance between the raw edge of fabric and the sewing stitch line is the _____.', '["A. Hemline", "B. Seam-allowance", "C. Bias", "D. Neckline"]', 'sewing_terminology', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000504', '00000000-0000-0000-0002-000000000504', 1, 'Benar! Seam-allowance (kampuh jahitan) adalah batas sisa guntingan di samping garis jahit.', 'Salah. Hemline adalah tepi bawah, Seam-allowance adalah ruang kelonggaran jahit.', '[{"word": "seam-allowance", "meaning": "kampuh jahitan"}]')
ON CONFLICT (id) DO NOTHING;

-- Q2: zipper
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000505', '00000000-0000-0000-0001-000000000502', 'multiple_choice', 'Which slide fastener device is used to close clothing openings, often hidden in dresses?', '["A. Button", "B. Hook and eye", "C. Zipper", "D. Velcro"]', 'garment_closures', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000505', '00000000-0000-0000-0002-000000000505', 2, 'Benar! Zipper (risleting) digunakan untuk menutup bukaan bagian belakang rok/gaun.', 'Salah. Button adalah kancing, Zipper adalah gesper pengunci geser.', '[{"word": "zipper", "meaning": "risleting"}]')
ON CONFLICT (id) DO NOTHING;

-- Q3: bias
INSERT INTO questions (id, quiz_id, type, prompt, options, topic, "order") VALUES
  ('00000000-0000-0000-0002-000000000506', '00000000-0000-0000-0001-000000000502', 'true_false', 'Cutting fabric on the bias means cutting it at a 45-degree angle to the grainline.', '["A. True", "B. False"]', 'cutting_techniques', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, answer_index, explanation_correct, explanation_wrong, related_vocab) VALUES
  ('00000000-0000-0000-0004-000000000506', '00000000-0000-0000-0002-000000000506', 0, 'Benar! Cutting on the bias (potong serong) memotong miring kain 45 derajat agar lebih elastis.', 'Salah. Pernyataan tersebut BENAR. Arah bias dibentuk dengan sudut serong 45 derajat.', '[{"word": "bias", "meaning": "potongan serong"}]')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 8. SEED: Weekly Challenge pertama
-- ============================================================
INSERT INTO challenges (id, title, description, target_type, target_value, bonus_xp, week_id)
VALUES (
  '00000000-0000-0000-0003-000000000001',
  'Mulai Perjalananmu! 🚀',
  'Selesaikan Placement Quiz dan 1 modul pembelajaran minggu ini untuk mendapatkan bonus XP!',
  'modules_complete',
  1,
  50,
  TO_CHAR(NOW(), 'IYYY"-W"IW')
)
ON CONFLICT (id) DO NOTHING;
