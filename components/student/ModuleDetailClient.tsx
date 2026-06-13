'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  BookOpen, HelpCircle, FileText, MessageSquare, FileCheck,
  ArrowRight, Download, Upload, Plus, Check, Eye,
  RefreshCw, ChevronLeft, ChevronRight as ChevronRightIcon,
} from 'lucide-react'
import ResourcePlayer from './ResourcePlayer'
import ReviewSection from './ReviewSection'
import { Button } from '@/components/ui/button'

interface LevelContent { level: 'beginner' | 'intermediate'; content_html: string }
interface Worksheet { id: string; title: string; file_url: string | null; format: string | null; interactive: boolean }
interface Resource { id: string; type: 'video' | 'audio' | 'worksheet' | 'reading' | 'pdf' | 'docx' | 'pptx'; title: string; url: string; format?: string | null; meta?: any }
interface Review { id: string; module_id: string; author_id: string; rating: number; comment: string | null; emoji: string | null; pinned: boolean; teacher_reply: string | null; created_at: string; author_name?: string }
interface VocabWord { id: string; word: string; meaning: string; example: string; emoji: string; category: string; order: number; level: 'beginner' | 'intermediate' }

interface ModuleDetailClientProps {
  module: { id: string; number: number; title: string; tagline: string | null; emoji: string | null }
  levels: LevelContent[]
  worksheets: Worksheet[]
  resources: Resource[]
  reviews: Review[]
}

type ActivityTab = 'flashcards' | 'dictionary' | 'matching' | 'fillblank' | 'quiz' | 'reading' | 'review'

const ACTIVITY_TABS: { key: ActivityTab; label: string; icon: string }[] = [
  { key: 'flashcards', label: 'Flashcards', icon: '🃏' },
  { key: 'dictionary', label: 'Kamus', icon: '📖' },
  { key: 'matching', label: 'Matching', icon: '🔤' },
  { key: 'fillblank', label: 'Fill Blank', icon: '✏️' },
  { key: 'quiz', label: 'Quiz', icon: '❓' },
  { key: 'reading', label: 'Materi', icon: '📚' },
  { key: 'review', label: 'Ulasan', icon: '💬' },
]

// ─── Flashcards ───────────────────────────────────────────────────────────────
function Flashcards({ words, onSaveWord }: { words: VocabWord[]; onSaveWord: (w: VocabWord) => void }) {
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  if (words.length === 0) return <EmptyVocab />
  const w = words[i]
  const prev = () => { setI(n => (n - 1 + words.length) % words.length); setFlipped(false) }
  const next = () => { setI(n => (n + 1) % words.length); setFlipped(false) }
  const save = () => { onSaveWord(w); setSaved(s => new Set(s).add(w.id)) }
  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-xs font-semibold text-gray-400">Kartu {i + 1} / {words.length}</p>
      <button onClick={() => setFlipped(f => !f)}
        className="w-full max-w-sm min-h-56 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-100 ring-2 ring-rose-200 flex flex-col items-center justify-center gap-3 p-8 transition active:scale-95 cursor-pointer select-none shadow-md hover:shadow-lg">
        {!flipped ? (
          <><span className="text-6xl">{w.emoji}</span><span className="text-3xl font-extrabold text-gray-900 mt-2">{w.word}</span><span className="text-xs text-gray-400 mt-1">(ketuk untuk arti)</span></>
        ) : (
          <><span className="text-2xl font-extrabold text-rose-600">{w.meaning}</span><span className="text-sm italic text-gray-500 mt-2 text-center">"{w.example}"</span><span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full mt-1">{w.category}</span></>
        )}
      </button>
      <div className="flex items-center gap-3">
        <button onClick={prev} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition"><ChevronLeft size={18} /></button>
        <button onClick={save} disabled={saved.has(w.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${saved.has(w.id) ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-500 text-white hover:bg-rose-600'}`}>
          {saved.has(w.id) ? <><Check size={14} /> Tersimpan</> : <>+ Word Wall</>}
        </button>
        <button onClick={next} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition"><ChevronRightIcon size={18} /></button>
      </div>
    </div>
  )
}

// ─── Visual Dictionary ────────────────────────────────────────────────────────
function VisualDictionary({ words }: { words: VocabWord[] }) {
  if (words.length === 0) return <EmptyVocab />
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {words.map(w => (
        <div key={w.id} className="bg-white border border-rose-100 rounded-2xl p-4 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200">
          <div className="text-4xl mb-2">{w.emoji}</div>
          <p className="font-extrabold text-gray-900 text-sm">{w.word}</p>
          <p className="text-rose-600 text-xs mt-0.5 font-medium">{w.meaning}</p>
          <p className="text-gray-400 text-xs mt-1 italic leading-snug line-clamp-2">"{w.example}"</p>
          <span className="inline-block mt-1.5 text-[10px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">{w.category}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Word Matching ────────────────────────────────────────────────────────────
function WordMatching({ words }: { words: VocabWord[] }) {
  const pairs = useMemo(() => words.slice(0, Math.min(6, words.length)), [words])
  const shuffled = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [pairs])
  const [selected, setSelected] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState('')
  const [xpEarned, setXpEarned] = useState(0)

  if (words.length < 2) return <EmptyVocab message="Tambahkan minimal 2 kosakata untuk aktivitas ini." />

  const tryMatch = (id: string) => {
    if (!selected) { setSelected(id); return }
    if (selected === id) { setMatched(m => new Set(m).add(id)); setXpEarned(p => p + 5); setFeedback('✅ Cocok! +5 XP'); }
    else setFeedback('❌ Belum cocok, coba lagi.')
    setSelected(null)
    setTimeout(() => setFeedback(''), 1500)
  }

  const isComplete = matched.size === pairs.length
  return (
    <div className="bg-white border border-rose-100 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">🔤 Cocokkan kata dengan artinya</h3>
        {xpEarned > 0 && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">+{xpEarned} XP</span>}
      </div>
      {feedback && <p className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded-xl">{feedback}</p>}
      {isComplete ? (
        <div className="text-center py-6"><p className="text-2xl font-black text-emerald-600">🎉 Semua Cocok!</p><p className="text-gray-500 text-sm mt-1">Kamu mendapat +{xpEarned} XP</p><Button className="mt-4" onClick={() => { setMatched(new Set()); setXpEarned(0) }}>Main Lagi</Button></div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {pairs.map(w => <button key={w.id} disabled={matched.has(w.id)} onClick={() => setSelected(w.id)}
              className={`w-full flex items-center gap-2 rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition ${matched.has(w.id) ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : selected === w.id ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-rose-200'}`}>
              {w.emoji} {w.word} {matched.has(w.id) && '✅'}
            </button>)}
          </div>
          <div className="space-y-2">
            {shuffled.map(w => <button key={w.id} disabled={matched.has(w.id)} onClick={() => tryMatch(w.id)}
              className={`w-full rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition ${matched.has(w.id) ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-rose-300'}`}>
              {w.meaning} {matched.has(w.id) && '✅'}
            </button>)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Fill in Blank ────────────────────────────────────────────────────────────
function FillInBlank({ words }: { words: VocabWord[] }) {
  const items = useMemo(() => words.filter(w => w.example.toLowerCase().includes(w.word.toLowerCase())).slice(0, 8), [words])
  const [i, setI] = useState(0)
  const [val, setVal] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')

  if (items.length === 0) return <EmptyVocab message="Pastikan kolom 'Contoh Kalimat' guru mengandung kata kosakatanya." />

  const item = items[i]
  const sentence = item.example.replace(new RegExp(item.word, 'i'), '_____')

  const check = () => { if (val.trim().toLowerCase() === item.word.toLowerCase()) setStatus('correct'); else setStatus('wrong') }
  const next = () => { setI(n => (n + 1) % items.length); setVal(''); setStatus('idle') }

  return (
    <div className="bg-white border border-rose-100 rounded-2xl p-6 space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">✏️ Lengkapi Kalimat</h3>
        <span className="text-xs text-gray-400">{i + 1} / {items.length}</span>
      </div>
      <div className="bg-rose-50 rounded-2xl p-4 text-base font-semibold text-gray-800">{item.emoji} {sentence}</div>
      <p className="text-sm text-gray-500">Petunjuk: artinya "<b>{item.meaning}</b>"</p>
      <input value={val} onChange={e => { setVal(e.target.value); setStatus('idle') }}
        onKeyDown={e => e.key === 'Enter' && status === 'idle' && check()}
        placeholder="Ketik kata bahasa Inggris..."
        className="w-full border-2 border-gray-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-base focus:outline-none" />
      {status === 'idle' && <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white" onClick={check}>Periksa</Button>}
      {status === 'correct' && <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4"><p className="font-bold text-emerald-700">✅ Benar! Jawabannya "{item.word}"</p><Button className="mt-2 w-full" onClick={next}>Lanjut →</Button></div>}
      {status === 'wrong' && <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4"><p className="font-bold text-amber-700">💡 Belum tepat. Jawaban: <b>{item.word}</b></p><Button className="mt-2 w-full" onClick={next}>Lanjut →</Button></div>}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyVocab({ message }: { message?: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-5xl mb-3">📭</div>
      <p className="font-medium text-gray-500">{message || 'Guru belum menambahkan kosakata untuk modul ini.'}</p>
    </div>
  )
}

// ─── Quiz Link Section ────────────────────────────────────────────────────────
function QuizSection({ module, level }: { module: { id: string; title: string }; level: 'beginner' | 'intermediate' }) {
  return (
    <div className="max-w-xl mx-auto text-center py-8 space-y-4">
      <div className="text-5xl">❓</div>
      <h3 className="text-xl font-bold text-gray-800">Kuis Modul</h3>
      <p className="text-gray-500 text-sm">Uji pemahamanmu dari materi yang telah kamu pelajari.</p>
      <Link href={`/modules/${module.id}/quiz?level=${level}`}>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold text-base flex items-center gap-2 mx-auto">
          Mulai Kuis <ArrowRight size={18} />
        </Button>
      </Link>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ModuleDetailClient({ module, levels, worksheets, resources, reviews }: ModuleDetailClientProps) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<ActivityTab>('flashcards')
  const [studentLevel, setStudentLevel] = useState<'beginner' | 'intermediate'>('beginner')
  const [allVocabs, setAllVocabs] = useState<VocabWord[]>([])
  const [loadingVocab, setLoadingVocab] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState<Record<string, boolean>>({})

  const vocabWords = useMemo(() => {
    return allVocabs.filter(v => v.level === studentLevel)
  }, [allVocabs, studentLevel])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: student }, { data: vocab }] = await Promise.all([
        supabase.from('students').select('level').eq('id', user.id).single() as any,
        supabase.from('vocab_words').select('*').eq('module_id', module.id).order('order', { ascending: true }) as any,
      ])
      const initialLevel = student?.level || 'beginner'
      setStudentLevel(initialLevel)
      setAllVocabs(vocab || [])
      setLoadingVocab(false)
    }
    init()
  }, [module.id])

  const handleSaveWord = async (w: VocabWord) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase.from('word_wall') as any).upsert({ user_id: user.id, word: w.word, meaning: w.meaning, example: w.example, emoji: w.emoji }, { onConflict: 'user_id,word' })
  }

  const levelContent = levels.find(l => l.level === studentLevel)

  const DEFAULT_VOCAB = [
    { word: 'measurement', meaning: 'ukuran, pengukuran' },
    { word: 'pattern', meaning: 'pola baju' },
    { word: 'sewing machine', meaning: 'mesin jahit' },
    { word: 'fabric', meaning: 'kain, bahan pakaian' },
    { word: 'hemline', meaning: 'tepi bawah pakaian' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Module Header */}
      <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="text-5xl shrink-0">{module.emoji || '📖'}</span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Modul {module.number}</span>
            <h1 className="text-2xl font-extrabold text-gray-800 mt-1">{module.title}</h1>
            {module.tagline && <p className="text-gray-500 text-sm mt-1">{module.tagline}</p>}
            
            {/* Level Selector Tabs */}
            <div className="flex border border-rose-100/60 gap-1 bg-rose-50/20 p-1 rounded-2xl w-fit mt-3">
              <button
                type="button"
                onClick={() => setStudentLevel('beginner')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  studentLevel === 'beginner'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/20'
                }`}
              >
                🟢 Beginner
              </button>
              <button
                type="button"
                onClick={() => setStudentLevel('intermediate')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  studentLevel === 'intermediate'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/20'
                }`}
              >
                🔵 Intermediate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="flex gap-1 bg-white border border-rose-100 rounded-2xl p-1.5 shadow-sm overflow-x-auto scrollbar-none">
        {ACTIVITY_TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${activeTab === t.key ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50/40'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Activity Content */}
      <div className="min-h-[400px]">
        {loadingVocab && activeTab !== 'reading' && activeTab !== 'review' ? (
          <div className="flex items-center justify-center h-40 gap-3">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Memuat kosakata...</p>
          </div>
        ) : (
          <>
            {activeTab === 'flashcards' && <Flashcards words={vocabWords} onSaveWord={handleSaveWord} />}
            {activeTab === 'dictionary' && <VisualDictionary words={vocabWords} />}
            {activeTab === 'matching' && <WordMatching words={vocabWords} />}
            {activeTab === 'fillblank' && <FillInBlank words={vocabWords} />}
            {activeTab === 'quiz' && <QuizSection module={module} level={studentLevel} />}

            {activeTab === 'reading' && (
              <div className="space-y-6">
                {levelContent?.content_html ? (
                  <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm prose prose-rose max-w-none"
                    dangerouslySetInnerHTML={{ __html: levelContent.content_html }} />
                ) : (
                  <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">📄</div><p>Materi bacaan belum tersedia.</p></div>
                )}
                {resources.length > 0 && <ResourcePlayer resources={resources} />}
                {worksheets.length > 0 && (
                  <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileCheck size={18} className="text-rose-500" /> Worksheet</h3>
                    <div className="space-y-2">
                      {worksheets.map(ws => (
                        <div key={ws.id} className="flex items-center justify-between p-3 bg-rose-50/30 rounded-xl border border-rose-100/50">
                          <span className="text-sm font-medium text-gray-700">{ws.title}</span>
                          {ws.file_url && <a href={ws.file_url} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="h-8 text-xs"><Download size={12} className="mr-1" /> Unduh</Button></a>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Default vocab table */}
                <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">📝 Kosakata Kunci</h3>
                  <div className="space-y-2">
                    {(vocabWords.length > 0 ? vocabWords : DEFAULT_VOCAB as any[]).map((v: any, idx: number) => (
                      <div key={v.id || idx} className="flex items-center gap-3 p-3 bg-rose-50/30 rounded-xl">
                        {v.emoji && <span className="text-xl">{v.emoji}</span>}
                        <span className="font-semibold text-gray-800 text-sm">{v.word}</span>
                        <span className="text-gray-400 text-xs">—</span>
                        <span className="text-rose-600 text-sm">{v.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'review' && <ReviewSection moduleId={module.id} initialReviews={reviews} />}
          </>
        )}
      </div>
    </div>
  )
}
