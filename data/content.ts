import type { Module, VocabWord, QuizQuestion, Badge, Review, MenuItem } from "@/types";

// ============================================================
// PLACEMENT QUIZ — 10 questions (Reading + Vocabulary)
// Score >= 6 => Intermediate, else Beginner
// ============================================================
export const placementQuestions: QuizQuestion[] = [
  {
    id: "p1", type: "vocab", topic: "Garment",
    prompt: "What is 'kemeja' in English?",
    options: ["Shirt", "Shoes", "Hat", "Belt"],
    answerIndex: 0,
    explanationCorrect: "Benar! 'Shirt' artinya kemeja.",
    explanationWrong: "Kemeja dalam bahasa Inggris adalah 'Shirt'.",
    relatedVocab: "Shirt = Kemeja",
  },
  {
    id: "p2", type: "vocab", topic: "Fabric",
    prompt: "Which word means 'kain katun'?",
    options: ["Silk", "Cotton", "Leather", "Wool"],
    answerIndex: 1,
    explanationCorrect: "Tepat! 'Cotton' artinya katun.",
    explanationWrong: "Kain katun dalam bahasa Inggris adalah 'Cotton'.",
    relatedVocab: "Cotton = Katun",
  },
  {
    id: "p3", type: "vocab", topic: "Tools",
    prompt: "A tool to cut fabric is called...",
    options: ["Needle", "Scissors", "Button", "Zipper"],
    answerIndex: 1,
    explanationCorrect: "Benar! 'Scissors' artinya gunting.",
    explanationWrong: "Alat untuk memotong kain adalah 'Scissors' (gunting).",
    relatedVocab: "Scissors = Gunting",
  },
  {
    id: "p4", type: "reading", topic: "Reading",
    passage: "This dress is made of 100% cotton. Wash it with cold water.",
    prompt: "What is the dress made of?",
    options: ["Polyester", "Cotton", "Silk", "Wool"],
    answerIndex: 1,
    explanationCorrect: "Benar! Teks menyebut '100% cotton'.",
    explanationWrong: "Pada kalimat tertulis 'made of 100% cotton' (katun).",
  },
  {
    id: "p5", type: "vocab", topic: "Garment",
    prompt: "'Trousers' means...",
    options: ["Topi", "Celana panjang", "Rok", "Dasi"],
    answerIndex: 1,
    explanationCorrect: "Benar! 'Trousers' artinya celana panjang.",
    explanationWrong: "'Trousers' artinya celana panjang.",
    relatedVocab: "Trousers = Celana panjang",
  },
  {
    id: "p6", type: "reading", topic: "Reading",
    passage: "Do not bleach. Iron on low heat. Hand wash only.",
    prompt: "Can you use bleach on this garment?",
    options: ["Yes", "No", "Sometimes", "Only with hot water"],
    answerIndex: 1,
    explanationCorrect: "Benar! 'Do not bleach' artinya jangan diputihkan.",
    explanationWrong: "'Do not bleach' artinya dilarang menggunakan pemutih.",
  },
  {
    id: "p7", type: "vocab", topic: "Fabric",
    prompt: "Which fabric is shiny and smooth?",
    options: ["Denim", "Silk", "Canvas", "Felt"],
    answerIndex: 1,
    explanationCorrect: "Benar! 'Silk' (sutra) terkenal halus dan berkilau.",
    explanationWrong: "'Silk' (sutra) adalah kain yang halus dan berkilau.",
    relatedVocab: "Silk = Sutra",
  },
  {
    id: "p8", type: "vocab", topic: "Measurement",
    prompt: "'Size chart' is used to find your...",
    options: ["Color", "Price", "Size", "Brand"],
    answerIndex: 2,
    explanationCorrect: "Benar! 'Size chart' = tabel ukuran.",
    explanationWrong: "'Size chart' adalah tabel untuk menemukan ukuran (size).",
    relatedVocab: "Size chart = Tabel ukuran",
  },
  {
    id: "p9", type: "reading", topic: "Reading",
    passage: "The jacket is available in S, M, L, and XL. Price: Rp250.000.",
    prompt: "How much is the jacket?",
    options: ["Rp25.000", "Rp250.000", "Rp2.500.000", "Free"],
    answerIndex: 1,
    explanationCorrect: "Benar! Harganya Rp250.000.",
    explanationWrong: "Pada teks tertulis 'Price: Rp250.000'.",
  },
  {
    id: "p10", type: "vocab", topic: "Tools",
    prompt: "A 'sewing machine' is used to...",
    options: ["Cut paper", "Sew clothes", "Wash clothes", "Dry clothes"],
    answerIndex: 1,
    explanationCorrect: "Benar! 'Sewing machine' = mesin jahit.",
    explanationWrong: "'Sewing machine' (mesin jahit) digunakan untuk menjahit pakaian.",
    relatedVocab: "Sewing machine = Mesin jahit",
  },
];

// ============================================================
// VOCABULARY — Fashion words
// ============================================================
export const vocabWords: VocabWord[] = [
  { id: "v1", word: "Cotton", meaning: "Katun", example: "This t-shirt is made of cotton.", emoji: "🧵", category: "Fabric" },
  { id: "v2", word: "Polyester", meaning: "Poliester", example: "Polyester dries quickly.", emoji: "🧴", category: "Fabric" },
  { id: "v3", word: "Silk", meaning: "Sutra", example: "The silk scarf feels soft.", emoji: "🎀", category: "Fabric" },
  { id: "v4", word: "Wool", meaning: "Wol", example: "Wool keeps you warm in winter.", emoji: "🐑", category: "Fabric" },
  { id: "v5", word: "Denim", meaning: "Denim/Jeans", example: "Denim is strong and durable.", emoji: "👖", category: "Fabric" },
  { id: "v6", word: "Rayon", meaning: "Rayon", example: "Rayon feels cool on the skin.", emoji: "🌫️", category: "Fabric" },
  { id: "v7", word: "Shirt", meaning: "Kemeja", example: "He wears a white shirt.", emoji: "👔", category: "Garment" },
  { id: "v8", word: "Dress", meaning: "Gaun", example: "She bought a new dress.", emoji: "👗", category: "Garment" },
  { id: "v9", word: "Trousers", meaning: "Celana panjang", example: "These trousers are too long.", emoji: "👖", category: "Garment" },
  { id: "v10", word: "Skirt", meaning: "Rok", example: "The skirt has a floral pattern.", emoji: "👗", category: "Garment" },
  { id: "v11", word: "Jacket", meaning: "Jaket", example: "Wear a jacket when it is cold.", emoji: "🧥", category: "Garment" },
  { id: "v12", word: "Scissors", meaning: "Gunting", example: "Cut the fabric with scissors.", emoji: "✂️", category: "Tools" },
  { id: "v13", word: "Needle", meaning: "Jarum", example: "Thread the needle carefully.", emoji: "🪡", category: "Tools" },
  { id: "v14", word: "Thread", meaning: "Benang", example: "Use blue thread for this seam.", emoji: "🧵", category: "Tools" },
  { id: "v15", word: "Button", meaning: "Kancing", example: "Sew the button onto the shirt.", emoji: "🔘", category: "Tools" },
  { id: "v16", word: "Zipper", meaning: "Resleting", example: "The zipper is stuck.", emoji: "🤐", category: "Tools" },
  { id: "v17", word: "Sewing machine", meaning: "Mesin jahit", example: "Turn on the sewing machine.", emoji: "🪡", category: "Tools" },
  { id: "v18", word: "Seam", meaning: "Jahitan/sambungan", example: "The seam is very neat.", emoji: "📏", category: "Tools" },
  { id: "v19", word: "Pattern", meaning: "Pola", example: "Cut along the paper pattern.", emoji: "📐", category: "Tools" },
  { id: "v20", word: "Size chart", meaning: "Tabel ukuran", example: "Check the size chart before buying.", emoji: "📊", category: "Measurement" },
];

// ============================================================
// QUIZ POOLS
// ============================================================
export const vocabQuiz: QuizQuestion[] = [
  {
    id: "q1", type: "vocab", topic: "Fabric",
    prompt: "Which fabric is breathable and natural?",
    options: ["Polyester", "Cotton", "Nylon", "Acrylic"],
    answerIndex: 1,
    explanationCorrect: "Benar! Cotton (katun) adalah serat alami yang menyerap keringat.",
    explanationWrong: "Cotton (katun) adalah kain alami yang sejuk dan menyerap keringat.",
    relatedVocab: "Cotton = Katun (serat alami)",
    reviewActivity: "Fabric Material Review",
  },
  {
    id: "q2", type: "vocab", topic: "Fabric",
    prompt: "Polyester and Rayon are both...",
    options: ["Natural fibers", "Man-made / synthetic-style fibers", "Metals", "Colors"],
    answerIndex: 1,
    explanationCorrect: "Benar! Keduanya termasuk serat buatan, bukan alami.",
    explanationWrong: "Polyester & Rayon adalah serat buatan manusia (man-made), berbeda dari katun.",
    relatedVocab: "Polyester & Rayon = serat buatan",
    reviewActivity: "Fabric Material Review",
  },
  {
    id: "q3", type: "vocab", topic: "Tools",
    prompt: "Which tool joins two pieces of fabric?",
    options: ["Scissors", "Sewing machine", "Iron", "Ruler"],
    answerIndex: 1,
    explanationCorrect: "Benar! Mesin jahit menyatukan dua bagian kain.",
    explanationWrong: "Sewing machine (mesin jahit) digunakan untuk menyatukan kain.",
    relatedVocab: "Sewing machine = Mesin jahit",
    reviewActivity: "Sewing Tools Review",
  },
  {
    id: "q4", type: "vocab", topic: "Garment",
    prompt: "Choose the correct meaning of 'skirt'.",
    options: ["Topi", "Rok", "Sepatu", "Sarung tangan"],
    answerIndex: 1,
    explanationCorrect: "Benar! 'Skirt' artinya rok.",
    explanationWrong: "'Skirt' artinya rok.",
    relatedVocab: "Skirt = Rok",
    reviewActivity: "Garment Names Review",
  },
  {
    id: "q5", type: "vocab", topic: "Tools",
    prompt: "'Needle and thread' are used to...",
    options: ["Iron clothes", "Sew by hand", "Measure size", "Wash fabric"],
    answerIndex: 1,
    explanationCorrect: "Benar! Jarum dan benang dipakai untuk menjahit dengan tangan.",
    explanationWrong: "Needle (jarum) & thread (benang) dipakai untuk menjahit tangan.",
    relatedVocab: "Needle = Jarum, Thread = Benang",
    reviewActivity: "Sewing Tools Review",
  },
];

export const readingQuiz: QuizQuestion[] = [
  {
    id: "r1", type: "reading", topic: "Reading",
    passage: "The blouse is made of 80% cotton and 20% polyester. Machine wash cold. Do not tumble dry.",
    prompt: "What is the main material of the blouse?",
    options: ["Polyester", "Cotton", "Silk", "Wool"],
    answerIndex: 1,
    explanationCorrect: "Benar! 80% cotton lebih besar daripada 20% polyester.",
    explanationWrong: "Bahan utama adalah cotton (80%), lebih banyak dari polyester (20%).",
    reviewActivity: "Reading Labels Review",
  },
  {
    id: "r2", type: "reading", topic: "Reading",
    passage: "The blouse is made of 80% cotton and 20% polyester. Machine wash cold. Do not tumble dry.",
    prompt: "How should you wash it?",
    options: ["Hot water", "Machine wash cold", "Tumble dry", "Bleach"],
    answerIndex: 1,
    explanationCorrect: "Benar! Tertulis 'Machine wash cold'.",
    explanationWrong: "Petunjuknya adalah 'Machine wash cold' (cuci mesin air dingin).",
    reviewActivity: "Reading Labels Review",
  },
  {
    id: "r3", type: "reading", topic: "Catalogue",
    passage: "Product: Casual Hoodie. Color: Navy Blue. Sizes: M, L, XL. Price: Rp180.000. Free shipping.",
    prompt: "Which size is NOT available?",
    options: ["M", "L", "S", "XL"],
    answerIndex: 2,
    explanationCorrect: "Benar! Ukuran 'S' tidak terdaftar.",
    explanationWrong: "Ukuran yang tersedia hanya M, L, XL. 'S' tidak ada.",
    reviewActivity: "Catalogue Reading Review",
  },
  {
    id: "r4", type: "reading", topic: "Technical",
    passage: "Step 1: Place fabric pieces together. Step 2: Pin the edges. Step 3: Sew along the seam line. Step 4: Remove the pins.",
    prompt: "What do you do BEFORE sewing?",
    options: ["Remove pins", "Pin the edges", "Cut buttons", "Iron"],
    answerIndex: 1,
    explanationCorrect: "Benar! Pin the edges dilakukan sebelum menjahit.",
    explanationWrong: "Sebelum menjahit (Step 3), kita 'Pin the edges' (Step 2).",
    reviewActivity: "Technical Steps Review",
  },
];

// ============================================================
// MODULES
// ============================================================
export const modules: Module[] = [
  {
    id: "mod1", number: 1, title: "Fashion Vocabulary Builder",
    tagline: "Kuasai kosakata fashion dengan kartu & permainan.",
    emoji: "🧵",
    features: [
      { name: "Flashcards", icon: "🃏" },
      { name: "Visual Dictionary", icon: "📖" },
      { name: "Image Matching", icon: "🖼️" },
      { name: "Word Matching", icon: "🔤" },
      { name: "Fill in Blank", icon: "✏️" },
      { name: "Vocabulary Quiz", icon: "❓" },
    ],
    resources: [
      { type: "video", title: "Fashion Materials 101", format: "YouTube", meta: "5 min" },
      { type: "audio", title: "Vocabulary Pronunciation", format: "MP3", meta: "3 min" },
      { type: "worksheet", title: "Vocab Worksheet A", format: "PDF", meta: "2 pages" },
      { type: "reading", title: "Common Fabric Names", format: "Reading", meta: "Easy" },
    ],
  },
  {
    id: "mod2", number: 2, title: "Reading Station",
    tagline: "Latihan membaca teks fashion sederhana & autentik.",
    emoji: "📖",
    features: [
      { name: "Simplified Reading", icon: "📄" },
      { name: "Authentic Reading", icon: "📰" },
      { name: "Reading Questions", icon: "❓" },
      { name: "Highlight Vocabulary", icon: "🖍️" },
    ],
    resources: [
      { type: "reading", title: "My First Fashion Store", format: "Reading", meta: "Beginner" },
      { type: "video", title: "Reading Strategies", format: "YouTube", meta: "6 min" },
      { type: "worksheet", title: "Reading Worksheet B", format: "DOCX", meta: "3 pages" },
    ],
  },
  {
    id: "mod3", number: 3, title: "Fashion Label Reader",
    tagline: "Pahami label pakaian, simbol cuci, dan komposisi bahan.",
    emoji: "🏷️",
    features: [
      { name: "Interactive Labels", icon: "🏷️" },
      { name: "Washing Symbols", icon: "🧼" },
      { name: "Fabric Composition", icon: "🧪" },
      { name: "Size Charts", icon: "📊" },
    ],
    resources: [
      { type: "reading", title: "Understanding Care Labels", format: "Reading", meta: "Easy" },
      { type: "audio", title: "Label Vocabulary", format: "MP3", meta: "4 min" },
      { type: "worksheet", title: "Label Worksheet C", format: "PDF", meta: "2 pages" },
    ],
  },
  {
    id: "mod4", number: 4, title: "Catalogue & Product Description Reader",
    tagline: "Baca katalog produk dan deskripsi pakaian online.",
    emoji: "🛍️",
    features: [
      { name: "Product Cards", icon: "🪪" },
      { name: "Product Descriptions", icon: "📝" },
      { name: "Information Identification", icon: "🔍" },
    ],
    resources: [
      { type: "reading", title: "Online Shop Descriptions", format: "Reading", meta: "Easy" },
      { type: "video", title: "Reading Product Pages", format: "YouTube", meta: "4 min" },
      { type: "worksheet", title: "Catalogue Worksheet D", format: "PPTX", meta: "8 slides" },
    ],
  },
  {
    id: "mod5", number: 5, title: "Technical Instructions Reader",
    tagline: "Pahami instruksi menjahit dan manual mesin.",
    emoji: "⚙️",
    features: [
      { name: "Sewing Instructions", icon: "🪡" },
      { name: "Machine Manuals", icon: "📘" },
      { name: "Technical Activities", icon: "🧩" },
      { name: "Skimming & Scanning", icon: "👀" },
    ],
    resources: [
      { type: "reading", title: "How to Sew a Straight Seam", format: "Reading", meta: "Step-by-step" },
      { type: "video", title: "Using a Sewing Machine", format: "YouTube", meta: "7 min" },
      { type: "worksheet", title: "Technical Worksheet E", format: "PDF", meta: "4 pages" },
    ],
  },
];

// ============================================================
// BADGES
// ============================================================
export const badges: Badge[] = [
  { id: "b1", name: "Fashion Rookie", emoji: "🌟", desc: "Selesaikan placement quiz", requirement: 0 },
  { id: "b2", name: "Fabric Explorer", emoji: "🧪", desc: "Kuasai 5 kosakata bahan", requirement: 5 },
  { id: "b3", name: "Vocabulary Hero", emoji: "🦸", desc: "Kuasai 10 kosakata", requirement: 10 },
  { id: "b4", name: "Label Master", emoji: "🏷️", desc: "Selesaikan Modul Label", requirement: 0 },
  { id: "b5", name: "Reading Expert", emoji: "📚", desc: "Selesaikan Reading Station", requirement: 0 },
  { id: "b6", name: "Technical Reader", emoji: "⚙️", desc: "Selesaikan Modul Teknis", requirement: 0 },
  { id: "b7", name: "Consistent Learner", emoji: "🔥", desc: "Streak 3 hari", requirement: 3 },
];

// ============================================================
// LEADERBOARD SEED
// ============================================================
export const leaderboardSeed = [
  { name: "Aisyah P.", xp: 1240, avatar: "🧕" },
  { name: "Bagus S.", xp: 1110, avatar: "🧑" },
  { name: "Citra D.", xp: 980, avatar: "👩" },
  { name: "Dewi R.", xp: 870, avatar: "👧" },
  { name: "Eka W.", xp: 760, avatar: "🧑‍🎓" },
  { name: "Faziru M.", xp: 690, avatar: "🧑‍💻" },
  { name: "Gita N.", xp: 540, avatar: "👩‍🎓" },
];

// ============================================================
// WASHING SYMBOLS (Module 3)
// ============================================================
export const washingSymbols = [
  { symbol: "🌡️", name: "Wash 30°C", meaning: "Cuci dengan air dingin (maks 30°C)" },
  { symbol: "🚫", name: "Do not bleach", meaning: "Jangan gunakan pemutih" },
  { symbol: "🔁", name: "Tumble dry low", meaning: "Boleh dikeringkan mesin suhu rendah" },
  { symbol: "♨️", name: "Iron low heat", meaning: "Setrika dengan suhu rendah" },
  { symbol: "✋", name: "Hand wash", meaning: "Cuci dengan tangan saja" },
  { symbol: "⭕", name: "Dry clean", meaning: "Cuci kering (dry clean)" },
];

export const sizeChart = [
  { size: "S", chest: "88 cm", length: "66 cm" },
  { size: "M", chest: "96 cm", length: "69 cm" },
  { size: "L", chest: "104 cm", length: "72 cm" },
  { size: "XL", chest: "112 cm", length: "75 cm" },
];

// ============================================================
// PRODUCT CATALOGUE (Module 4)
// ============================================================
export const products = [
  {
    id: "pr1", emoji: "👕", name: "Basic Cotton T-Shirt",
    desc: "Soft cotton t-shirt for daily use. Available in 4 colors.",
    color: "White, Black, Navy, Grey", sizes: "S, M, L, XL", price: "Rp95.000", material: "100% Cotton",
  },
  {
    id: "pr2", emoji: "👗", name: "Floral Summer Dress",
    desc: "Lightweight dress with floral pattern. Perfect for warm days.",
    color: "Pink, Yellow", sizes: "M, L", price: "Rp210.000", material: "Rayon",
  },
  {
    id: "pr3", emoji: "🧥", name: "Denim Jacket",
    desc: "Classic denim jacket with button front and two pockets.",
    color: "Light Blue, Dark Blue", sizes: "S, M, L, XL", price: "Rp320.000", material: "100% Denim",
  },
];

// ============================================================
// READING PASSAGES (Module 2)
// ============================================================
export const readingPassages = {
  beginner: {
    title: "My First Fashion Store",
    text: `Sari opens a small fashion store. She sells shirts, dresses, and skirts. Most clothes are made of cotton. Cotton is soft and cool. The prices are cheap. Many students buy clothes from her store.`,
    highlights: ["shirts", "dresses", "skirts", "cotton"],
  },
  intermediate: {
    title: "Sustainable Fashion",
    text: `Sustainable fashion means making clothes in a way that protects the environment. Designers choose natural fabrics like organic cotton and linen instead of synthetic materials. They also reuse old fabric to reduce waste. Many young customers now prefer brands that care about the planet.`,
    highlights: ["sustainable", "fabrics", "organic cotton", "linen", "synthetic"],
  },
};

// ============================================================
// SEED REVIEWS
// ============================================================
export const seedReviews: Review[] = [
  {
    id: "rev1", moduleId: "mod3", author: "Aisyah P.", rating: 5,
    comment: "Modul ini membantu saya memahami label pakaian. Simbol cucinya jelas!",
    emoji: "😍", date: "2026-01-10", pinned: true,
    teacherReply: "Bagus sekali, Aisyah! Lanjut ke Modul 4 ya.",
  },
  {
    id: "rev2", moduleId: "mod1", author: "Bagus S.", rating: 4,
    comment: "Flashcard-nya seru, jadi gampang hafal kosakata bahan.",
    emoji: "😊", date: "2026-01-11",
  },
  {
    id: "rev3", moduleId: "mod2", author: "Citra D.", rating: 5,
    comment: "Teks bacaannya pendek dan mudah dimengerti. Terima kasih!",
    emoji: "🤩", date: "2026-01-12",
  },
];

// ============================================================
// NAVIGATION MENU
// ============================================================
export const menuItems: MenuItem[] = [
  { key: "placement", label: "Placement Quiz", emoji: "🎯", href: "/placement" },
  { key: "vocab", label: "Fashion Vocabulary Builder", emoji: "🧵", href: "/modules/vocabulary" },
  { key: "reading", label: "Reading Station", emoji: "📖", href: "/modules/reading" },
  { key: "label", label: "Fashion Label Reader", emoji: "🏷️", href: "/modules/label" },
  { key: "catalogue", label: "Catalogue & Product Reader", emoji: "🛍️", href: "/modules/catalogue" },
  { key: "technical", label: "Technical Instructions Reader", emoji: "⚙️", href: "/modules/technical" },
  { key: "journal", label: "Digital Journal", emoji: "📔", href: "/journal" },
  { key: "wordwall", label: "My Word Wall", emoji: "🧱", href: "/wordwall" },
  { key: "leaderboard", label: "Leaderboard", emoji: "🏆", href: "/leaderboard" },
  { key: "progress", label: "Progress Tracker", emoji: "📈", href: "/progress" },
  { key: "help", label: "Help Center", emoji: "❓", href: "/help" },
];
