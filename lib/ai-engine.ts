import type { AttemptRecord } from "@/types";

// ============================================================
// AI FEEDBACK ENGINE (Gemini-style rule simulation)
// In production this would call Gemini via Supabase Edge Functions.
// ============================================================
export interface AIRecommendation {
  message: string;
  activity: string;
  estTime: number;
  weakTopic: string | null;
}

const topicToActivity: Record<string, { activity: string; time: number; tip: string }> = {
  Fabric: { activity: "Fabric Material Review", time: 7, tip: "Kamu sering tertukar antara polyester dan rayon." },
  Tools: { activity: "Sewing Tools Review", time: 5, tip: "Kamu masih bingung dengan nama alat jahit." },
  Garment: { activity: "Garment Names Review", time: 6, tip: "Latih lagi nama-nama pakaian." },
  Reading: { activity: "Reading Comprehension Review", time: 8, tip: "Tingkatkan pemahaman membaca teks." },
  Catalogue: { activity: "Catalogue Reading Review", time: 6, tip: "Latih membaca informasi produk." },
  Technical: { activity: "Technical Steps Review", time: 7, tip: "Pahami urutan langkah teknis." },
  Measurement: { activity: "Size Chart Review", time: 5, tip: "Pelajari membaca tabel ukuran." },
};

export function getAIRecommendation(attempts: AttemptRecord[]): AIRecommendation {
  const wrong = attempts.filter((a) => !a.correct);
  if (wrong.length === 0) {
    return {
      message: "Kerja bagus! Belum ada kelemahan yang terdeteksi. Terus pertahankan! 🎉",
      activity: "Vocabulary Quiz",
      estTime: 5,
      weakTopic: null,
    };
  }
  const counts: Record<string, number> = {};
  wrong.forEach((a) => (counts[a.topic] = (counts[a.topic] || 0) + 1));
  const weakTopic = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const rec = topicToActivity[weakTopic] || topicToActivity.Reading;
  return {
    message: rec.tip,
    activity: rec.activity,
    estTime: rec.time,
    weakTopic,
  };
}
