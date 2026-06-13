'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  BookOpen, 
  HelpCircle, 
  FileText, 
  MessageSquare, 
  FileCheck, 
  ArrowRight, 
  Download, 
  Upload, 
  Plus, 
  Check, 
  Eye 
} from 'lucide-react'
import ResourcePlayer from './ResourcePlayer'
import ReviewSection from './ReviewSection'
import { Button } from '@/components/ui/button'

interface LevelContent {
  level: 'beginner' | 'intermediate'
  content_html: string
}

interface Worksheet {
  id: string
  title: string
  file_url: string | null
  format: string | null
  interactive: boolean
}

interface Resource {
  id: string
  type: 'video' | 'audio' | 'worksheet' | 'reading' | 'pdf' | 'docx' | 'pptx'
  title: string
  url: string
  format?: string | null
  meta?: any | null
}

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
  author_name?: string
}

interface ModuleDetailClientProps {
  module: {
    id: string
    number: number
    title: string
    tagline: string | null
    emoji: string | null
  }
  levels: LevelContent[]
  worksheets: Worksheet[]
  resources: Resource[]
  reviews: Review[]
}

const DEFAULT_VOCAB = [
  { word: 'measurement', meaning: 'ukuran, pengukuran' },
  { word: 'pattern', meaning: 'pola baju' },
  { word: 'sewing machine', meaning: 'mesin jahit' },
  { word: 'fabric', meaning: 'kain, bahan pakaian' },
  { word: 'hemline', meaning: 'tepi bawah pakaian' },
]

export default function ModuleDetailClient({
  module,
  levels,
  worksheets,
  resources,
  reviews,
}: ModuleDetailClientProps) {
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<'content' | 'resources' | 'worksheet' | 'reviews'>('content')
  const [userProfile, setUserProfile] = useState<any>(null)
  
  // Level selection state (default ke level siswa, bisa di-toggle)
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate'>('beginner')
  
  // Vocab Word Wall states
  const [addedVocab, setAddedVocab] = useState<string[]>([])
  
  // Worksheet submission states
  const [submissions, setSubmissions] = useState<any[]>([])
  const [submitUrl, setSubmitUrl] = useState('')
  const [submittingFile, setSubmittingFile] = useState(false)
  
  // Fetch user profile and existing submissions client-side
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserProfile(user)

        // Ambil level siswa
        const { data: student } = await supabase
          .from('students')
          .select('level')
          .eq('id', user.id)
          .single() as any

        if (student?.level) {
          setSelectedLevel(student.level)
        }

        // Ambil submission worksheet siswa untuk modul ini
        const worksheetIds = worksheets.map(w => w.id)
        if (worksheetIds.length > 0) {
          const { data: subData } = await supabase
            .from('worksheet_submissions')
            .select('*')
            .in('worksheet_id', worksheetIds)
            .eq('user_id', user.id) as any

          if (subData) {
            setSubmissions(subData)
          }
        }
      } catch (err) {
        console.error('Error fetching user data in detail:', err)
      }
    }

    fetchUserData()
  }, [supabase, worksheets])

  // Tambah kata ke Word Wall
  const handleAddToWordWall = async (word: string, meaning: string) => {
    if (!userProfile) return
    try {
      // 1. Cek duplikat case-insensitive
      const { data: existing } = await (supabase
        .from('word_wall') as any)
        .select('id')
        .eq('user_id', userProfile.id)
        .eq('word', word)
        .maybeSingle()

      if (existing) {
        alert('Kosakata ini sudah ada di Word Wall Anda!')
        if (!addedVocab.includes(word)) {
          setAddedVocab(prev => [...prev, word])
        }
        return
      }

      // 2. Insert baru
      const { error } = await (supabase
        .from('word_wall') as any)
        .insert({
          user_id: userProfile.id,
          word,
          meaning,
          status: 'baru',
          review_history: [{ reviewedAt: new Date().toISOString(), status: 'baru' }],
        })

      if (error) throw error
      setAddedVocab(prev => [...prev, word])

      // 3. Cek total kata untuk award lencana Vocabulary Master jika >= 50
      const { count } = await (supabase
        .from('word_wall') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userProfile.id)

      if (count !== null && count >= 50) {
        await fetch('/api/award-xp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userProfile.id,
            event: 'badge_check',
          }),
        })
      }
    } catch (err) {
      console.error('Error adding to Word Wall:', err)
    }
  }

  // Kirim Submission Worksheet
  const handleWorksheetSubmit = async (e: React.FormEvent, worksheetId: string) => {
    e.preventDefault()
    if (!userProfile || !submitUrl || submittingFile) return

    try {
      setSubmittingFile(true)
      const payload = {
        worksheet_id: worksheetId,
        user_id: userProfile.id,
        file_url: submitUrl,
        submitted_at: new Date().toISOString(),
      }

      // Check if already submitted (should upsert)
      const existing = submissions.find(s => s.worksheet_id === worksheetId)
      if (existing) {
        const { error } = await (supabase
          .from('worksheet_submissions') as any)
          .update(payload)
          .eq('id', existing.id)

        if (error) throw error
        setSubmissions(prev => prev.map(s => s.id === existing.id ? { ...s, ...payload } : s))
      } else {
        const { data, error } = await (supabase
          .from('worksheet_submissions') as any)
          .insert(payload)
          .select()

        if (error) throw error
        setSubmissions(prev => [...prev, data[0]])
      }

      setSubmitUrl('')
      alert('Tugas Worksheet berhasil dikirim!')
    } catch (err) {
      console.error('Error submitting worksheet:', err)
      alert('Gagal mengirim worksheet.')
    } finally {
      setSubmittingFile(false)
    }
  }

  // Dapatkan content_html untuk level terpilih
  const activeLevelContent = levels.find((l) => l.level === selectedLevel)?.content_html || ''

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6">
      
      {/* Module Title Card */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-8 text-white shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{module.emoji || '👗'}</span>
            <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              Modul {module.number}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {module.title}
          </h1>
          <p className="text-white/85 text-sm md:text-base mt-2 max-w-xl font-medium leading-relaxed">
            {module.tagline || 'Pelajari materi bahasa Inggris tata busana terlengkap.'}
          </p>
        </div>
        
        {/* Level Toggle Indicator */}
        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
          <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Level Kompetensimu</span>
          <div className="bg-white/10 p-1.5 rounded-2xl flex gap-1 border border-white/15">
            <button
              onClick={() => setSelectedLevel('beginner')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer select-none
                ${selectedLevel === 'beginner' 
                  ? 'bg-white text-rose-600 shadow-sm' 
                  : 'text-white hover:bg-white/5'
                }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setSelectedLevel('intermediate')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer select-none
                ${selectedLevel === 'intermediate' 
                  ? 'bg-white text-rose-600 shadow-sm' 
                  : 'text-white hover:bg-white/5'
                }`}
            >
              Intermediate
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigator */}
      <div className="flex border-b border-rose-100 mb-8 overflow-x-auto gap-1">
        {[
          { id: 'content', label: 'Materi Pelajaran', icon: BookOpen },
          { id: 'resources', label: 'Materi Pendukung', icon: FileCheck },
          { id: 'worksheet', label: 'Lembar Kerja (Worksheet)', icon: FileText },
          { id: 'reviews', label: 'Ulasan Modul', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-sm whitespace-nowrap transition-all cursor-pointer select-none
                ${isActive 
                  ? 'border-rose-500 text-rose-600' 
                  : 'border-transparent text-gray-500 hover:text-rose-500 hover:border-rose-200'
                }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      <div className="animate-fade-in">
        
        {/* 1. Materi Pelajaran */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* HTML WYSIWYG Content Area */}
            <div className="lg:col-span-2 bg-white border border-rose-100 rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-extrabold text-gray-800 border-b border-rose-50 pb-4 mb-6 flex items-center gap-2.5">
                <BookOpen className="text-rose-500" />
                Materi Level: <span className="capitalize text-rose-500">{selectedLevel}</span>
              </h3>

              {activeLevelContent ? (
                <div 
                  className="prose prose-rose max-w-none text-gray-700 leading-relaxed font-normal whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: activeLevelContent }}
                />
              ) : (
                <div className="text-center py-16 text-gray-400 font-medium">
                  Materi untuk level ini belum diisi oleh guru. Silakan cek level lainnya.
                </div>
              )}
            </div>

            {/* Sidebar Widgets: Vocab Word Wall & Quiz CTA */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* Quiz CTA Card */}
              <div className="bg-rose-50/30 border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[200px]">
                <div>
                  <h4 className="font-extrabold text-gray-800 text-base mb-1.5 flex items-center gap-2">
                    <HelpCircle size={18} className="text-rose-500" />
                    Kuis Modul
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Uji pemahamanmu setelah membaca materi untuk mendapatkan XP tambahan dan badge menarik!
                  </p>
                </div>
                <Link href={`/modules/${module.id}/quiz`}>
                  <Button className="w-full py-4.5 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white text-xs shadow-sm flex items-center justify-center gap-1.5">
                    Mulai Kuis Modul
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>

              {/* Vocab Word Wall Card */}
              <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
                <h4 className="font-extrabold text-gray-800 text-base mb-3.5 flex items-center gap-2">
                  <Plus size={18} className="text-rose-500" />
                  Kosakata Utama
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-semibold mb-4">
                  Klik tombol <Plus size={12} className="inline" /> untuk menambahkan kosakata penting modul ini ke Word Wall privatmu.
                </p>

                <div className="flex flex-col gap-3">
                  {DEFAULT_VOCAB.map((vocab) => {
                    const isAdded = addedVocab.includes(vocab.word)
                    return (
                      <div 
                        key={vocab.word} 
                        className="flex justify-between items-center p-3 rounded-xl border border-rose-50 hover:bg-rose-50/20 transition-all"
                      >
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-800">{vocab.word}</p>
                          <p className="text-xs text-gray-400 font-semibold">{vocab.meaning}</p>
                        </div>
                        <button
                          onClick={() => handleAddToWordWall(vocab.word, vocab.meaning)}
                          disabled={isAdded}
                          className={`p-2 rounded-lg border transition-all cursor-pointer select-none
                            ${isAdded 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                              : 'bg-rose-50/30 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white'
                            }`}
                        >
                          {isAdded ? <Check size={14} /> : <Plus size={14} />}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. Materi Pendukung (Free Resources) */}
        {activeTab === 'resources' && (
          <div className="bg-white border border-rose-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-extrabold text-gray-800 border-b border-rose-50 pb-4 mb-6 flex items-center gap-2.5">
              <FileCheck className="text-rose-500" />
              Materi Pendukung (Free Resources)
            </h3>
            <ResourcePlayer resources={resources} />
          </div>
        )}

        {/* 3. Lembar Kerja (Worksheet) */}
        {activeTab === 'worksheet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List Worksheets */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {worksheets.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 text-sm text-gray-500 font-medium">
                  Belum ada Lembar Kerja (Worksheet) untuk modul ini.
                </div>
              ) : (
                worksheets.map((worksheet) => {
                  const submission = submissions.find(s => s.worksheet_id === worksheet.id)
                  
                  return (
                    <div 
                      key={worksheet.id}
                      className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5"
                    >
                      {/* Title & Format */}
                      <div className="flex justify-between items-start pb-4 border-b border-rose-50/50">
                        <div>
                          <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {worksheet.format || 'PDF'}
                          </span>
                          <h4 className="font-extrabold text-gray-800 text-base md:text-lg mt-1.5 leading-snug">
                            {worksheet.title}
                          </h4>
                        </div>

                        {/* Download link */}
                        {worksheet.file_url && (
                          <a 
                            href={worksheet.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Download size={14} />
                            Unduh Soal
                          </a>
                        )}
                      </div>

                      {/* Submission state */}
                      {submission ? (
                        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Tugas</p>
                            <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mt-1">
                              <Check size={16} className="text-emerald-500" />
                              Terkirim ({new Date(submission.submitted_at).toLocaleDateString('id-ID')})
                            </p>
                            
                            {submission.teacher_note && (
                              <div className="mt-3 text-xs text-gray-600 bg-white border border-gray-100 rounded-xl p-3 max-w-md">
                                <span className="font-bold text-rose-500">Catatan Guru:</span> {submission.teacher_note}
                              </div>
                            )}
                          </div>

                          {/* Grade display */}
                          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center shrink-0 min-w-[100px] shadow-sm">
                            <span className="text-xs font-bold text-gray-400 uppercase">Nilai</span>
                            <span className="text-2xl font-black text-rose-500 mt-1">
                              {submission.grade !== null ? submission.grade : '...'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-rose-50/20 border border-rose-100/50 rounded-2xl p-5 text-sm text-rose-800 font-medium">
                          Kamu belum mengirimkan jawaban untuk tugas ini.
                        </div>
                      )}

                      {/* Submission Upload Form */}
                      <form 
                        onSubmit={(e) => handleWorksheetSubmit(e, worksheet.id)}
                        className="flex flex-col gap-3 pt-2"
                      >
                        <label className="text-xs font-bold text-gray-500 uppercase">
                          Kirim Jawaban (Tautan / URL File)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={submitUrl}
                            onChange={(e) => setSubmitUrl(e.target.value)}
                            placeholder="https://drive.google.com/file/... atau tautan file tugasmu"
                            className="flex-1 p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-normal"
                            required
                          />
                          <Button
                            type="submit"
                            disabled={submittingFile}
                            className="px-5 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white text-xs shrink-0 flex items-center gap-1.5"
                          >
                            <Upload size={14} />
                            {submittingFile ? 'Mengirim...' : 'Kirim'}
                          </Button>
                        </div>
                      </form>

                    </div>
                  )
                })
              )}
            </div>

            {/* Sidebar Guide */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm text-sm text-gray-600 flex flex-col gap-3">
                <h4 className="font-extrabold text-gray-800 text-base mb-1 flex items-center gap-2">
                  <FileText size={18} className="text-rose-500" />
                  Panduan Lembar Kerja
                </h4>
                <ul className="list-disc pl-5 flex flex-col gap-2 font-medium leading-relaxed">
                  <li>Unduh file lembar kerja menggunakan tombol yang disediakan.</li>
                  <li>Kerjakan tugas sesuai instruksi guru di dalam dokumen tersebut.</li>
                  <li>Unggah hasil tugasmu ke Google Drive/OneDrive, pastikan akses file diubah menjadi <strong>Siapa saja yang memiliki link (Anyone with link)</strong>.</li>
                  <li>Masukkan tautan file tugasmu pada kolom yang disediakan lalu klik <strong>Kirim</strong>.</li>
                  <li>Guru akan memberikan nilai dan umpan balik yang dapat kamu lihat di halaman ini.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 4. Ulasan Modul */}
        {activeTab === 'reviews' && (
          <div className="bg-white border border-rose-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <ReviewSection moduleId={module.id} initialReviews={reviews} />
          </div>
        )}

      </div>
    </div>
  )
}
