export interface FeedbackResult {
  weakTopic: string           // topik yang paling lemah
  message: string             // pesan motivasi (Bahasa Indonesia, maks 2 kalimat)
  recommendedActivity: string // nama modul/aktivitas yang disarankan
  estTimeMinutes: number      // estimasi waktu belajar
  tipsCount: number           // jumlah soal salah di topik ini
}

const TOPIC_RECOMMENDATIONS: Record<string, Omit<FeedbackResult, 'weakTopic' | 'tipsCount'>> = {
  fabric_types: {
    message: 'Kamu sering tertukar antara nama-nama jenis kain. Yuk review lagi dengan latihan flashcard!',
    recommendedActivity: 'Fashion Vocabulary Builder — Bab Kain',
    estTimeMinutes: 7,
  },
  reading_comprehension: {
    message: 'Kemampuan membaca teksmu perlu ditingkatkan. Coba baca kalimat per kalimat secara perlahan!',
    recommendedActivity: 'Reading Station — Latihan Pemahaman',
    estTimeMinutes: 10,
  },
  label_reading: {
    message: 'Membaca label pakaian butuh ketelitian ekstra. Perhatikan simbol dan singkatan pada label!',
    recommendedActivity: 'Fashion Label Reader',
    estTimeMinutes: 8,
  },
  catalogue_reading: {
    message: 'Deskripsi produk dalam katalog punya pola tersendiri. Latih lagi dengan contoh katalog nyata!',
    recommendedActivity: 'Catalogue & Product Description Reader',
    estTimeMinutes: 9,
  },
  technical_instructions: {
    message: 'Instruksi teknis menjahit memiliki kosakata khusus. Fokus pada kata kerja teknis ya!',
    recommendedActivity: 'Technical Instructions Reader',
    estTimeMinutes: 12,
  },
  vocabulary_general: {
    message: 'Perbendaharaan kata fashionmu perlu diperkaya. Tambahkan kata baru ke Word Wall setiap hari!',
    recommendedActivity: 'Fashion Vocabulary Builder',
    estTimeMinutes: 7,
  },
}

export function getRuleBasedFeedback(wrongAnswers: { topic: string }[]): FeedbackResult {
  if (wrongAnswers.length === 0) {
    return {
      weakTopic: 'none',
      message: 'Sempurna! Kamu sudah sangat memahami materi ini.',
      recommendedActivity: 'Review Modul Terakhir',
      estTimeMinutes: 5,
      tipsCount: 0,
    }
  }

  // Count errors per topic
  const counts: Record<string, number> = {}
  wrongAnswers.forEach((item) => {
    const topic = item.topic || 'vocabulary_general'
    counts[topic] = (counts[topic] || 0) + 1
  })

  // Find darkest/weakest topic (highest error count)
  let weakestTopic = 'vocabulary_general'
  let maxErrors = 0

  Object.entries(counts).forEach(([topic, count]) => {
    if (count > maxErrors) {
      maxErrors = count
      weakestTopic = topic
    }
  })

  // Get recommendation from table or fallback to default vocabulary_general
  const recommendation = TOPIC_RECOMMENDATIONS[weakestTopic] || TOPIC_RECOMMENDATIONS['vocabulary_general']

  return {
    weakTopic: weakestTopic,
    message: recommendation.message,
    recommendedActivity: recommendation.recommendedActivity,
    estTimeMinutes: recommendation.estTimeMinutes,
    tipsCount: maxErrors,
  }
}
