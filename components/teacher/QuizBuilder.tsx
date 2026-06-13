'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Save, 
  Edit3, 
  Check, 
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react'

interface QuizBuilderProps {
  moduleId: string
}

interface QuestionItem {
  id: string
  quiz_id: string
  type: 'vocab' | 'reading' | 'true_false' | 'fill_blank' | 'matching'
  prompt: string
  passage: string | null
  options: string[]
  topic: string
  order: number
  // Answer details
  answer_index: number
  explanation_correct: string
  explanation_wrong: string
  related_vocab: Array<{ word: string; meaning: string }>
  review_activity: string
}

export function QuizBuilder({ moduleId }: QuizBuilderProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Quiz Levels
  const [quizLevel, setQuizLevel] = useState<'beginner' | 'intermediate'>('beginner')
  const [quizId, setQuizId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuestionItem[]>([])

  // Editor State
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null)
  const [isNewQuestion, setIsNewQuestion] = useState(false)

  // Options input temp
  const [newOption, setNewOption] = useState('')
  // Related vocab temp
  const [newVocabWord, setNewVocabWord] = useState('')
  const [newVocabMeaning, setNewVocabMeaning] = useState('')

  useEffect(() => {
    fetchQuizAndQuestions()
  }, [moduleId, quizLevel])

  const fetchQuizAndQuestions = async () => {
    try {
      setLoading(true)
      setEditingQuestion(null)

      // 1. Ambil atau buat kuis untuk modul & level ini
      let { data: quizData, error: quizErr } = await supabase
        .from('quizzes')
        .select('id')
        .eq('module_id', moduleId)
        .eq('level', quizLevel)
        .single() as any

      if (quizErr && quizErr.code === 'PGRST116') {
        // Buat kuis jika belum ada
        const { data: newQuiz, error: createErr } = await (supabase.from('quizzes') as any)
          .insert({
            module_id: moduleId,
            level: quizLevel,
            title: `Kuis Modul - ${quizLevel.toUpperCase()}`,
            activity_type: 'quiz'
          })
          .select()
          .single()

        if (createErr) throw createErr
        quizData = newQuiz
      } else if (quizErr) {
        throw quizErr
      }

      setQuizId(quizData.id)

      // 2. Ambil list pertanyaan
      const { data: questionsData, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizData.id)
        .order('order', { ascending: true }) as any

      if (qErr) throw qErr
      const questionList = (questionsData || []) as any[]

      // 3. Ambil data kunci jawaban (answers) untuk masing-masing question
      const questionIds = questionList.map(q => q.id)
      
      let answersList: any[] = []
      if (questionIds.length > 0) {
        const { data: ansData, error: ansErr } = await supabase
          .from('answers')
          .select('*')
          .in('question_id', questionIds) as any
        
        if (ansErr) throw ansErr
        answersList = ansData || []
      }

      const formattedQuestions = questionList.map(q => {
        const ans = answersList.find(a => a.question_id === q.id) || {}
        
        // Parse options
        let parsedOptions: string[] = []
        if (q.options) {
          parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }

        // Parse related vocab
        let parsedVocab: any[] = []
        if (ans.related_vocab) {
          parsedVocab = typeof ans.related_vocab === 'string' ? JSON.parse(ans.related_vocab) : ans.related_vocab
        }

        return {
          id: q.id,
          quiz_id: q.quiz_id,
          type: q.type || 'vocab',
          prompt: q.prompt || '',
          passage: q.passage || null,
          options: parsedOptions,
          topic: q.topic || 'vocabulary_general',
          order: q.order || 0,
          answer_index: ans.answer_index ?? 0,
          explanation_correct: ans.explanation_correct || '',
          explanation_wrong: ans.explanation_wrong || '',
          related_vocab: parsedVocab,
          review_activity: ans.review_activity || ''
        }
      })

      setQuestions(formattedQuestions)
    } catch (err) {
      console.error('Error loading quiz questions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (q: QuestionItem) => {
    setEditingQuestion({ ...q })
    setIsNewQuestion(false)
  }

  const handleAddNewClick = () => {
    if (!quizId) return
    const nextOrder = questions.length + 1
    setEditingQuestion({
      id: '',
      quiz_id: quizId,
      type: 'vocab',
      prompt: '',
      passage: '',
      options: [],
      topic: 'vocabulary_general',
      order: nextOrder,
      answer_index: 0,
      explanation_correct: 'Kerja bagus! Jawaban kamu benar.',
      explanation_wrong: 'Oops, jawaban kamu masih kurang tepat.',
      related_vocab: [],
      review_activity: 'Tinjau kembali daftar kata di Word Wall.'
    })
    setIsNewQuestion(true)
  }

  const handleSaveQuestion = async () => {
    if (!editingQuestion || !quizId) return
    if (!editingQuestion.prompt || !editingQuestion.topic) {
      alert('Pertanyaan dan Topik wajib diisi!')
      return
    }

    try {
      setSaving(true)

      let savedQuestionId = editingQuestion.id

      if (isNewQuestion) {
        // Insert Question
        const { data: newQ, error: qErr } = await (supabase.from('questions') as any)
          .insert({
            quiz_id: quizId,
            type: editingQuestion.type,
            prompt: editingQuestion.prompt,
            passage: editingQuestion.passage || null,
            options: editingQuestion.options,
            topic: editingQuestion.topic,
            order: editingQuestion.order
          })
          .select()
          .single()

        if (qErr) throw qErr
        savedQuestionId = newQ.id

        // Insert Answer Key
        const { error: ansErr } = await (supabase.from('answers') as any)
          .insert({
            question_id: savedQuestionId,
            answer_index: editingQuestion.answer_index,
            explanation_correct: editingQuestion.explanation_correct,
            explanation_wrong: editingQuestion.explanation_wrong,
            related_vocab: editingQuestion.related_vocab,
            review_activity: editingQuestion.review_activity
          })

        if (ansErr) throw ansErr

      } else {
        // Update Question
        const { error: qErr } = await (supabase.from('questions') as any)
          .update({
            type: editingQuestion.type,
            prompt: editingQuestion.prompt,
            passage: editingQuestion.passage || null,
            options: editingQuestion.options,
            topic: editingQuestion.topic,
            order: editingQuestion.order,
            updated_at: new Date().toISOString()
          })
          .eq('id', savedQuestionId)

        if (qErr) throw qErr

        // Update Answer Key (using upsert in case answer is missing)
        const { error: ansErr } = await (supabase.from('answers') as any)
          .upsert({
            question_id: savedQuestionId,
            answer_index: editingQuestion.answer_index,
            explanation_correct: editingQuestion.explanation_correct,
            explanation_wrong: editingQuestion.explanation_wrong,
            related_vocab: editingQuestion.related_vocab,
            review_activity: editingQuestion.review_activity,
            updated_at: new Date().toISOString()
          }, { onConflict: 'question_id' })

        if (ansErr) throw ansErr
      }

      await fetchQuizAndQuestions()
      setEditingQuestion(null)
    } catch (err) {
      console.error('Error saving question:', err)
      alert('Gagal menyimpan soal.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return

    try {
      const { error } = await (supabase.from('questions') as any)
        .delete()
        .eq('id', qId)

      if (error) throw error
      await fetchQuizAndQuestions()
    } catch (err) {
      console.error('Error deleting question:', err)
    }
  }

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= questions.length) return

    try {
      const current = questions[index]
      const target = questions[targetIndex]

      // Swap order
      const { error: err1 } = await (supabase.from('questions') as any)
        .update({ order: target.order })
        .eq('id', current.id)
      
      const { error: err2 } = await (supabase.from('questions') as any)
        .update({ order: current.order })
        .eq('id', target.id)

      if (err1 || err2) throw new Error('Swap order failed')

      await fetchQuizAndQuestions()
    } catch (err) {
      console.error('Error changing question order:', err)
    }
  }

  // Helper Option editor
  const addOption = () => {
    if (!newOption.trim() || !editingQuestion) return
    setEditingQuestion(prev => {
      if (!prev) return null
      return {
        ...prev,
        options: [...prev.options, newOption.trim()]
      }
    })
    setNewOption('')
  }

  const removeOption = (idx: number) => {
    if (!editingQuestion) return
    setEditingQuestion(prev => {
      if (!prev) return null
      const updated = prev.options.filter((_, i) => i !== idx)
      let correctIdx = prev.answer_index
      if (correctIdx >= updated.length) {
        correctIdx = 0
      }
      return {
        ...prev,
        options: updated,
        answer_index: correctIdx
      }
    })
  }

  // Helper related vocab editor
  const addVocab = () => {
    if (!newVocabWord.trim() || !newVocabMeaning.trim() || !editingQuestion) return
    setEditingQuestion(prev => {
      if (!prev) return null
      return {
        ...prev,
        related_vocab: [
          ...prev.related_vocab,
          { word: newVocabWord.trim().toLowerCase(), meaning: newVocabMeaning.trim() }
        ]
      }
    })
    setNewVocabWord('')
    setNewVocabMeaning('')
  }

  const removeVocab = (idx: number) => {
    if (!editingQuestion) return
    setEditingQuestion(prev => {
      if (!prev) return null
      return {
        ...prev,
        related_vocab: prev.related_vocab.filter((_, i) => i !== idx)
      }
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-pulse">
        <div className="h-12 w-48 bg-rose-50 rounded-lg" />
        <div className="h-64 bg-white rounded-3xl border border-rose-100/40" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-start">
      {/* Kolom Kiri: Daftar Soal */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Toggle Level */}
        <div className="flex border border-rose-100 bg-white p-1 rounded-2xl shadow-sm gap-1">
          <button
            onClick={() => setQuizLevel('beginner')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              quizLevel === 'beginner'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-rose-500'
            }`}
          >
            Beginner Quiz
          </button>
          <button
            onClick={() => setQuizLevel('intermediate')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              quizLevel === 'intermediate'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-rose-500'
            }`}
          >
            Intermediate Quiz
          </button>
        </div>

        {/* List Pertanyaan */}
        <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">Daftar Pertanyaan</h3>
            <button
              onClick={handleAddNewClick}
              className="flex items-center gap-1 text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer"
            >
              <Plus size={12} /> Tambah Soal
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 font-medium">
              Belum ada soal kuis untuk level ini.
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-3.5 border rounded-2xl flex items-center justify-between gap-3 transition-all ${
                    editingQuestion?.id === q.id
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-rose-50 hover:border-rose-100 bg-white'
                  }`}
                >
                  <div className="min-w-0 cursor-pointer flex-1" onClick={() => handleEditClick(q)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] uppercase font-extrabold tracking-wider bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">
                        {q.type}
                      </span>
                      <span className="text-[9px] text-gray-400 font-semibold truncate max-w-[80px]">
                        {q.topic}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-700 line-clamp-1 leading-normal">
                      {idx + 1}. {q.prompt}
                    </p>
                  </div>

                  {/* Reordering & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-lg disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(idx, 'down')}
                      disabled={idx === questions.length - 1}
                      className="p-1 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-lg disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Kolom Kanan: Form Editor */}
      <div className="lg:col-span-2">
        {editingQuestion ? (
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-rose-50 pb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-base">
                  {isNewQuestion ? 'Buat Soal Baru' : 'Edit Detail Soal'}
                </h3>
                <p className="text-xs text-gray-400">Susun jenis soal, kunci jawaban, dan pembahasan AI.</p>
              </div>
              <button
                onClick={handleSaveQuestion}
                disabled={saving}
                className="flex items-center gap-1.5 px-4.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all min-h-[38px] cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? 'Menyimpan...' : 'Simpan Soal'}
              </button>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Tipe Soal *</label>
                <select
                  value={editingQuestion.type}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as any })}
                  className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-rose-50/10 min-h-[44px]"
                >
                  <option value="vocab">Pilihan Ganda Kosakata</option>
                  <option value="reading">Pemahaman Membaca (Reading)</option>
                  <option value="true_false">Benar / Salah (True/False)</option>
                  <option value="fill_blank">Isian Rumpang (Fill in the Blank)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Topik Kategori *</label>
                <input
                  type="text"
                  value={editingQuestion.topic}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                  placeholder="Contoh: vocabulary_general atau sewing_steps"
                  className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-rose-50/10 min-h-[44px]"
                />
              </div>

              {/* Teks passage bacaan (khusus tipe reading) */}
              {(editingQuestion.type === 'reading' || editingQuestion.type === 'vocab') && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Teks Bacaan (Passage) — Opsional</label>
                  <textarea
                    value={editingQuestion.passage || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, passage: e.target.value || null })}
                    rows={4}
                    placeholder="Masukkan paragraf deskripsi busana / petunjuk pola jika soal membutuhkan teks bacaan pendukung..."
                    className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-rose-50/10 font-normal"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Pertanyaan / Perintah (Prompt) *</label>
                <input
                  type="text"
                  value={editingQuestion.prompt}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, prompt: e.target.value })}
                  placeholder="Contoh: What is the primary tool used for measuring the body?"
                  className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-rose-50/10 min-h-[44px]"
                />
              </div>

              {/* Kelola Pilihan Jawaban */}
              {editingQuestion.type !== 'fill_blank' && (
                <div className="md:col-span-2 border border-rose-50 rounded-2xl p-4 bg-rose-50/5 flex flex-col gap-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Pilihan Ganda (Options)</label>
                  
                  {/* List Options */}
                  <div className="flex flex-col gap-2">
                    {editingQuestion.options.map((opt, oIdx) => {
                      const isCorrect = editingQuestion.answer_index === oIdx
                      return (
                        <div key={oIdx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-rose-50">
                          <button
                            type="button"
                            onClick={() => setEditingQuestion({ ...editingQuestion, answer_index: oIdx })}
                            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                              isCorrect 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-200 text-transparent hover:border-green-300'
                            }`}
                          >
                            <Check size={12} />
                          </button>
                          <span className="text-xs font-bold text-gray-400 uppercase w-4">{String.fromCharCode(65 + oIdx)}</span>
                          <p className="text-xs text-gray-700 flex-1 leading-normal">{opt}</p>
                          <button
                            type="button"
                            onClick={() => removeOption(oIdx)}
                            className="p-1 hover:bg-red-50 text-red-500 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Tambah Option Baru */}
                  {editingQuestion.options.length < 5 && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Ketik pilihan jawaban..."
                        className="flex-1 px-3.5 py-2 border border-rose-150 rounded-lg text-xs focus:outline-none bg-white min-h-[36px]"
                      />
                      <button
                        type="button"
                        onClick={addOption}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                      >
                        Tambah
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Input isian rumpang (kunci jawaban) */}
              {editingQuestion.type === 'fill_blank' && (
                <div className="md:col-span-2 border border-rose-50 rounded-2xl p-4 bg-rose-50/5 flex flex-col gap-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Jawaban Benar (Case Insensitive)</label>
                  <div className="flex flex-wrap gap-2">
                    {editingQuestion.options.map((opt, oIdx) => (
                      <span key={oIdx} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                        {opt}
                        <button type="button" onClick={() => removeOption(oIdx)} className="hover:text-red-500">
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  {editingQuestion.options.length < 3 && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Ketik kata kunci jawaban benar..."
                        className="flex-1 px-3.5 py-2 border border-rose-150 rounded-lg text-xs focus:outline-none bg-white min-h-[36px]"
                      />
                      <button
                        type="button"
                        onClick={addOption}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                      >
                        Tambah
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400">
                    Siswa akan dinyatakan benar jika jawaban mereka mencocoki salah satu kata kunci di atas.
                  </p>
                </div>
              )}

              {/* Explanations */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Penjelasan Jawaban Benar</label>
                <textarea
                  value={editingQuestion.explanation_correct}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation_correct: e.target.value })}
                  rows={2}
                  placeholder="Ketik feedback positif..."
                  className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-rose-50/10 font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Penjelasan Jawaban Salah</label>
                <textarea
                  value={editingQuestion.explanation_wrong}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation_wrong: e.target.value })}
                  rows={2}
                  placeholder="Beri petunjuk kesalahan..."
                  className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-rose-50/10 font-normal"
                />
              </div>

              {/* Rekomendasi aktivitas jika salah */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Rekomendasi Aktivitas Belajar (Smart Feedback)</label>
                <input
                  type="text"
                  value={editingQuestion.review_activity}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, review_activity: e.target.value })}
                  placeholder="Contoh: Baca kembali instruksi Sewing the Seam Allowance di Modul 2 halaman 4."
                  className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-rose-50/10 min-h-[44px]"
                />
              </div>

              {/* Kelola Kosakata Terkait */}
              <div className="md:col-span-2 border border-rose-50 rounded-2xl p-4 bg-rose-50/5 flex flex-col gap-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 text-rose-600">
                  <Sparkles size={14} /> Kosakata Terkait (Related Vocab)
                </label>
                
                {/* List Vocab */}
                <div className="flex flex-col gap-2">
                  {editingQuestion.related_vocab.map((v, vIdx) => (
                    <div key={vIdx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-rose-50">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-xs text-rose-500 capitalize">{v.word}</span>
                        <span className="text-[10px] text-gray-400 font-medium">artinya:</span>
                        <span className="text-xs text-gray-600 font-medium">{v.meaning}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVocab(vIdx)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new Vocab */}
                <div className="flex gap-2 flex-col sm:flex-row">
                  <input
                    type="text"
                    value={newVocabWord}
                    onChange={(e) => setNewVocabWord(e.target.value)}
                    placeholder="Kata (e.g. measuring tape)"
                    className="flex-1 px-3.5 py-2 border border-rose-150 rounded-lg text-xs focus:outline-none bg-white min-h-[36px]"
                  />
                  <input
                    type="text"
                    value={newVocabMeaning}
                    onChange={(e) => setNewVocabMeaning(e.target.value)}
                    placeholder="Arti (e.g. pita pengukur)"
                    className="flex-1 px-3.5 py-2 border border-rose-150 rounded-lg text-xs focus:outline-none bg-white min-h-[36px]"
                  />
                  <button
                    type="button"
                    onClick={addVocab}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50/20 border border-dashed border-rose-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[400px]">
            <BookOpen className="w-12 h-12 text-rose-300 animate-pulse" />
            <div>
              <h4 className="font-bold text-gray-700 text-sm">Pilih atau Tambah Soal</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                Klik salah satu pertanyaan di panel kiri untuk mulai menyunting, atau klik "Tambah Soal" untuk membuat soal kuis baru.
              </p>
            </div>
            <button
              onClick={handleAddNewClick}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all min-h-[38px] cursor-pointer"
            >
              <Plus size={14} /> Buat Soal Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
