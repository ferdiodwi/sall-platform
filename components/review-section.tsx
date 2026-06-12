"use client";

import { useState } from "react";
import { useReviewStore, useUserStore } from "@/lib/store";
import { Card, Button, SectionTitle, Pill, Textarea } from "@/components/ui";
import { Star, Send } from "lucide-react";

export function ReviewSection({ moduleId }: { moduleId: string }) {
  const { reviews, addReview } = useReviewStore();
  const user = useUserStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("😊");

  const moduleReviews = reviews.filter((r) => r.moduleId === moduleId);
  const emojis = ["😍", "😊", "🤩", "😎", "🥰"];

  function submit() {
    if (!comment.trim()) return;
    addReview({
      moduleId,
      author: user.name,
      rating,
      comment: comment.trim(),
      emoji: selectedEmoji,
    });
    setComment("");
    setRating(5);
  }

  return (
    <div className="mt-8">
      <SectionTitle className="mb-3">💬 Ulasan Modul</SectionTitle>

      {/* Review form */}
      <Card className="mb-4 p-5">
        <p className="mb-3 text-sm font-bold text-slate-700">Tulis ulasan kamu:</p>
        <div className="mb-3 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
              />
            </button>
          ))}
          <div className="ml-3 flex gap-1">
            {emojis.map((e) => (
              <button
                key={e}
                onClick={() => setSelectedEmoji(e)}
                className={`rounded-lg p-1 text-lg transition-all ${
                  selectedEmoji === e ? "bg-rose-100 scale-110" : "hover:bg-slate-100"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ceritakan pengalamanmu belajar modul ini..."
          rows={3}
        />
        <Button className="mt-3" onClick={submit} size="sm">
          <Send size={14} /> Kirim Ulasan
        </Button>
      </Card>

      {/* Reviews list */}
      <div className="space-y-3">
        {moduleReviews.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{r.emoji}</span>
              <span className="font-bold text-slate-800">{r.author}</span>
              {r.pinned && <Pill color="amber">📌 Pinned</Pill>}
              <span className="ml-auto text-xs text-amber-500">
                {"⭐".repeat(r.rating)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">&quot;{r.comment}&quot;</p>
            {r.teacherReply && (
              <div className="mt-2 rounded-xl bg-blue-50 p-2 text-sm text-blue-800">
                👩‍🏫 {r.teacherReply}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
