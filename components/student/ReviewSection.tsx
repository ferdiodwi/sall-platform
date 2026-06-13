'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, MessageSquare, Edit2, Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Review {
  id: string
  module_id: string
  author_id: string
  rating: number
  comment: string | null
  emoji: string | null
  pinned: boolean
  teacher_reply: string | null
  created_at: string
  // Ditambahkan secara join dari users
  author_name?: string
}

interface ReviewSectionProps {
  moduleId: string
  initialReviews: Review[]
}

const EMOJI_OPTIONS = ['😊', '😐', '😕', '🤔', '🎉']

export default function ReviewSection({ moduleId, initialReviews }: ReviewSectionProps) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Form States
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('😊')
  const [isEditing, setIsEditing] = useState(false)
  
  const [submitting, setSubmitting] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)

  // 1. Dapatkan user ID & review milik sendiri (jika ada)
  useEffect(() => {
    const fetchUserAndReview = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        // Filter untuk review milik sendiri
        const existingReview = reviews.find((r) => r.author_id === user.id)
        if (existingReview) {
          setMyReview(existingReview)
          setRating(existingReview.rating)
          setComment(existingReview.comment || '')
          setSelectedEmoji(existingReview.emoji || '😊')
        } else {
          // Cari detail profil user sendiri untuk author_name
          setIsEditing(true) // Buka form review jika belum ada review
        }
      } catch (err) {
        console.error('Error fetching user for review:', err)
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUserAndReview()
  }, [supabase, reviews])

  // 2. Submit Review (Insert atau Update)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || submitting) return

    try {
      setSubmitting(true)

      const payload = {
        module_id: moduleId,
        author_id: userId,
        rating,
        comment: comment.substring(0, 500),
        emoji: selectedEmoji,
        updated_at: new Date().toISOString(),
      }

      // Ambil nama user untuk ditambahkan ke UI review secara lokal
      const { data: userProfile } = await supabase
        .from('users')
        .select('name')
        .eq('id', userId)
        .single() as any

      const authorName = userProfile?.name || 'Siswa'

      if (myReview) {
        // UPDATE review yang sudah ada
        const { error } = await (supabase
          .from('reviews') as any)
          .update(payload)
          .eq('id', myReview.id)

        if (error) throw error

        const updatedReviews = reviews.map((r) =>
          r.id === myReview.id
            ? { ...r, ...payload, author_name: authorName }
            : r
        )
        setReviews(updatedReviews)
        setMyReview({ ...myReview, ...payload } as any)
      } else {
        // INSERT review baru
        const { data, error } = await (supabase
          .from('reviews') as any)
          .insert({
            ...payload,
            pinned: false,
          })
          .select() as any

        if (error) throw error

        const newReviewObj = {
          ...data[0],
          author_name: authorName,
        }

        setReviews([newReviewObj, ...reviews])
        setMyReview(newReviewObj)
      }

      setIsEditing(false)
    } catch (err) {
      console.error('Error submitting review:', err)
      alert('Gagal mengirim ulasan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  // Hitung stats
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0

  // Urutkan review: pinned di atas, sisanya berdasarkan tanggal terbaru
  const sortedReviews = [...reviews].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      {/* Left Column: Stats & Review Input Form */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        {/* Rating Stats Card */}
        <div className="bg-rose-50/20 border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
          <h4 className="font-extrabold text-gray-800 text-sm md:text-base uppercase tracking-wider mb-2">
            Rating Modul
          </h4>
          <span className="text-5xl font-black text-rose-500 tracking-tight mb-2">
            {averageRating > 0 ? averageRating : '0.0'}
          </span>
          <div className="flex items-center gap-1 text-amber-400 mb-2.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={22}
                fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}
                strokeWidth={2}
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-gray-400">
            Total {totalReviews} Ulasan Siswa
          </p>
        </div>

        {/* Form Ulasan */}
        {!loadingUser && userId && (
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-rose-500" />
              {myReview ? 'Ulasan Kamu' : 'Tulis Ulasan'}
            </h4>

            {isEditing ? (
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                {/* Rating Input */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Rating Bintang
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-amber-400 hover:scale-115 transition-transform"
                      >
                        <Star
                          size={24}
                          fill={star <= rating ? 'currentColor' : 'none'}
                          strokeWidth={2}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emoji Reaction Selector */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Reaksi Kamu
                  </label>
                  <div className="flex items-center gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`text-2xl p-2 rounded-xl border transition-all duration-150 cursor-pointer select-none
                          ${selectedEmoji === emoji
                            ? 'bg-rose-50 border-rose-400 scale-110 shadow-sm'
                            : 'border-gray-200 hover:border-rose-200 bg-white'
                          }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Komentar / Catatan
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.substring(0, 500))}
                    placeholder="Apa pendapatmu mengenai materi modul ini? (maks 500 karakter)..."
                    className="w-full h-24 p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none font-normal"
                    required
                  ></textarea>
                  <div className="text-right text-xs text-gray-400 font-semibold mt-1">
                    {comment.length} / 500
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
                    <Send size={12} />
                  </Button>
                  
                  {myReview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setRating(myReview.rating)
                        setComment(myReview.comment || '')
                        setSelectedEmoji(myReview.emoji || '😊')
                      }}
                      className="rounded-xl text-xs font-bold border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              // Display mode of own review
              <div className="flex flex-col gap-3.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{myReview?.emoji || '😊'}</span>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          fill={star <= (myReview?.rating || 5) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:border-rose-200 text-gray-500 hover:text-rose-500 transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 italic bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 font-normal leading-relaxed">
                  "{myReview?.comment || ''}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: List of Reviews */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h4 className="font-extrabold text-gray-800 text-base mb-1">
          Daftar Ulasan Siswa ({totalReviews})
        </h4>

        {sortedReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 text-sm text-gray-500 font-medium">
            Belum ada ulasan untuk modul ini. Jadilah yang pertama memberikan ulasan!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedReviews.map((review) => (
              <div
                key={review.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col gap-3 bg-white
                  ${review.pinned 
                    ? 'border-rose-300 ring-2 ring-rose-500/10 shadow-sm' 
                    : 'border-rose-100/60 shadow-sm'
                  }`}
              >
                {/* Author Info */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1 bg-gray-50 rounded-xl border border-gray-100 select-none">
                      {review.emoji || '😊'}
                    </span>
                    <div>
                      <h5 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                        {review.author_name || 'Siswa ALIP'}
                        {review.pinned && (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Pinned
                          </span>
                        )}
                      </h5>
                      {/* Star Display */}
                      <div className="flex items-center text-amber-400 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            fill={star <= review.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Date */}
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(review.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>

                {/* Comment Text */}
                {review.comment && (
                  <p className="text-sm text-gray-600 font-normal leading-relaxed pl-1">
                    {review.comment}
                  </p>
                )}

                {/* Teacher Reply */}
                {review.teacher_reply && (
                  <div className="mt-2.5 p-3.5 bg-rose-50/30 rounded-xl border border-rose-100/30 text-xs text-gray-600 pl-4 relative">
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-rose-400 rounded-full"></div>
                    <p className="font-bold text-rose-600 mb-1">Balasan Guru:</p>
                    <p className="font-normal italic leading-relaxed">"{review.teacher_reply}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
