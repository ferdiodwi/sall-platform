'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ClipboardCheck, 
  Upload, 
  FileText, 
  GraduationCap, 
  Save, 
  Users, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface WorksheetItem {
  id: string
  module_id: string
  title: string
  file_url: string | null
  format: 'PDF' | 'DOCX' | 'PPTX' | 'HTML'
  interactive: boolean
  module_title?: string
  module_number?: number
}

interface SubmissionItem {
  id: string
  worksheet_id: string
  user_id: string
  file_url: string | null
  html_content: string | null
  grade: number | null
  teacher_note: string | null
  submitted_at: string
  graded_at: string | null
  student_name: string
  student_class: string
}

export default function TeacherWorksheetsPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState<any[]>([])
  const [worksheets, setWorksheets] = useState<WorksheetItem[]>([])

  // Selected Worksheet for Grading
  const [selectedWorksheet, setSelectedWorksheet] = useState<WorksheetItem | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)

  // Upload Form State
  const [uploadModuleId, setUploadModuleId] = useState('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadFormat, setUploadFormat] = useState<'PDF' | 'DOCX' | 'PPTX' | 'HTML'>('PDF')
  const [uploadInteractive, setUploadInteractive] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Grading states (temporary buffer)
  const [gradingScores, setGradingScores] = useState<{ [key: string]: string }>({})
  const [gradingNotes, setGradingNotes] = useState<{ [key: string]: string }>({})
  const [savingGrades, setSavingGrades] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)

      // 1. Fetch modules
      const { data: modulesData, error: mErr } = await supabase
        .from('modules')
        .select('id, number, title')
        .order('order', { ascending: true }) as any

      if (mErr) throw mErr
      setModules(modulesData || [])
      if (modulesData && modulesData.length > 0) {
        setUploadModuleId(modulesData[0].id)
      }

      // 2. Fetch worksheets
      const { data: worksheetsData, error: wErr } = await supabase
        .from('worksheets')
        .select('*') as any

      if (wErr) throw wErr

      const list = (worksheetsData || []).map((w: any) => {
        const mod = (modulesData || []).find((m: any) => m.id === w.module_id)
        return {
          ...w,
          module_title: mod?.title,
          module_number: mod?.number
        }
      })

      setWorksheets(list)
    } catch (err) {
      console.error('Error loading worksheets:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load submissions for a specific worksheet
  const handleSelectWorksheet = async (ws: WorksheetItem) => {
    setSelectedWorksheet(ws)
    try {
      setSubmissionsLoading(true)

      const { data: subsData, error: sErr } = await supabase
        .from('worksheet_submissions')
        .select(`
          id,
          worksheet_id,
          user_id,
          file_url,
          html_content,
          grade,
          teacher_note,
          submitted_at,
          graded_at
        `)
        .eq('worksheet_id', ws.id) as any

      if (sErr) throw sErr

      const rawSubs = subsData || []

      // Fetch student profiles (name, class_id)
      const userIds = rawSubs.map((s: any) => s.user_id)
      let studentsList: any[] = []
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, class_id')
          .in('id', userIds) as any
        studentsList = usersData || []
      }

      const formattedSubs = rawSubs.map((s: any) => {
        const student = studentsList.find((u: any) => u.id === s.user_id)
        return {
          ...s,
          student_name: student?.name || 'Siswa SALL',
          student_class: student?.class_id || 'XI Tata Busana'
        }
      })

      // Pre-fill grading buffers
      const scores: { [key: string]: string } = {}
      const notes: { [key: string]: string } = {}
      formattedSubs.forEach((s: any) => {
        scores[s.id] = s.grade !== null ? s.grade.toString() : ''
        notes[s.id] = s.teacher_note || ''
      })

      setSubmissions(formattedSubs)
      setGradingScores(scores)
      setGradingNotes(notes)
    } catch (err) {
      console.error('Error fetching submissions:', err)
    } finally {
      setSubmissionsLoading(false)
    }
  }

  // Handle Worksheet File Upload
  const handleUploadWorksheet = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!uploadTitle) {
      alert('Judul worksheet wajib diisi!')
      return
    }
    if (!file && uploadFormat !== 'HTML') {
      alert('Silakan pilih file worksheet untuk diunggah!')
      return
    }

    try {
      setUploadingFile(true)
      let publicUrl = ''

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `worksheets/${fileName}`

        // Upload file to bucket 'worksheets'
        let { error: uploadError } = await supabase.storage
          .from('worksheets')
          .upload(filePath, file)

        // Fallback create bucket jika belum ada
        if (uploadError && uploadError.message.includes('Object not found')) {
          await supabase.storage.createBucket('worksheets', { public: true })
          const { error: retryError } = await supabase.storage
            .from('worksheets')
            .upload(filePath, file)
          uploadError = retryError
        }

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('worksheets')
          .getPublicUrl(filePath)

        publicUrl = urlData.publicUrl
      }

      // Simpan record worksheet ke database
      const { error: dbErr } = await (supabase.from('worksheets') as any)
        .insert({
          module_id: uploadModuleId,
          title: uploadTitle,
          file_url: publicUrl || null,
          format: uploadFormat,
          interactive: uploadInteractive
        })

      if (dbErr) throw dbErr

      alert('Worksheet berhasil dibuat!')
      setUploadTitle('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      
      await fetchInitialData()
    } catch (err) {
      console.error('Error creating worksheet:', err)
      alert('Gagal mengunggah worksheet.')
    } finally {
      setUploadingFile(false)
    }
  }

  // Toggle Interactive Mode
  const toggleInteractive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase.from('worksheets') as any)
        .update({ interactive: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setWorksheets(prev => prev.map(w => 
        w.id === id ? { ...w, interactive: !currentStatus } : w
      ))
      if (selectedWorksheet?.id === id) {
        setSelectedWorksheet(prev => prev ? { ...prev, interactive: !currentStatus } : null)
      }
    } catch (err) {
      console.error('Error toggling interactive mode:', err)
    }
  }

  // Submit Grade
  const handleSaveGrade = async (subId: string) => {
    const scoreStr = gradingScores[subId]
    const noteStr = gradingNotes[subId]

    if (scoreStr === '') {
      alert('Nilai harus diisi!')
      return
    }

    const scoreNum = parseFloat(scoreStr)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert('Nilai harus berupa angka antara 0 - 100!')
      return
    }

    try {
      setSavingGrades(prev => ({ ...prev, [subId]: true }))

      const { error } = await (supabase.from('worksheet_submissions') as any)
        .update({
          grade: scoreNum,
          teacher_note: noteStr || null,
          graded_at: new Date().toISOString()
        })
        .eq('id', subId)

      if (error) throw error

      setSubmissions(prev => prev.map(s => 
        s.id === subId ? { ...s, grade: scoreNum, teacher_note: noteStr, graded_at: new Date().toISOString() } : s
      ))

      // Kirim Notifikasi in-app ke siswa secara real-time
      const submission = submissions.find(s => s.id === subId)
      if (submission) {
        await (supabase.from('notifications') as any)
          .insert({
            user_id: submission.user_id,
            title: 'Tugas Selesai Dinilai! 📝',
            body: `Worksheet "${selectedWorksheet?.title}" Anda telah dinilai oleh Guru. Nilai: ${scoreNum}. Catatan: ${noteStr || '-'}`
          })
      }

    } catch (err) {
      console.error('Error saving grade:', err)
      alert('Gagal menyimpan nilai.')
    } finally {
      setSavingGrades(prev => ({ ...prev, [subId]: false }))
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
          Manajemen Worksheet & Penilaian
        </h2>
        <p className="text-sm text-gray-500">
          Kelola lembar kerja siswa, edit pengaturan interaktif, dan beri penilaian tugas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Kolom Kiri: Form Upload & List Worksheet */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Form Upload */}
          <form onSubmit={handleUploadWorksheet} className="bg-white border border-rose-100 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-gray-850 text-sm flex items-center gap-1.5 text-rose-600">
              <Upload size={16} /> Unggah Worksheet Baru
            </h3>
            
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Judul Tugas *</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Contoh: Sketsa Pola Celana Kulot"
                className="w-full px-3.5 py-2 border border-rose-100 rounded-xl text-xs focus:outline-none focus:border-rose-400 bg-rose-50/10 min-h-[38px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Untuk Modul *</label>
                <select
                  value={uploadModuleId}
                  onChange={(e) => setUploadModuleId(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-100 rounded-xl text-xs focus:outline-none focus:border-rose-400 bg-rose-50/10 min-h-[38px]"
                >
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>Modul {m.number}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Format File *</label>
                <select
                  value={uploadFormat}
                  onChange={(e) => setUploadFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-rose-100 rounded-xl text-xs focus:outline-none focus:border-rose-400 bg-rose-50/10 min-h-[38px]"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="PPTX">PPTX</option>
                  <option value="HTML">HTML Form</option>
                </select>
              </div>
            </div>

            {uploadFormat !== 'HTML' && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1.5">File Tugas *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.docx,.doc,.pptx,.ppt"
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100 cursor-pointer"
                />
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="interactive"
                checked={uploadInteractive}
                onChange={(e) => setUploadInteractive(e.target.checked)}
                className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-400"
              />
              <label htmlFor="interactive" className="text-xs text-gray-600 font-medium cursor-pointer">
                Aktifkan input Interaktif HTML
              </label>
            </div>

            <button
              type="submit"
              disabled={uploadingFile}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50 min-h-[40px] mt-1"
            >
              {uploadingFile ? 'Mengunggah...' : 'Unggah Worksheet'}
            </button>
          </form>

          {/* List Worksheets */}
          <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-gray-800 text-sm">Daftar Worksheet</h3>
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
              {worksheets.map(w => {
                const isSelected = selectedWorksheet?.id === w.id
                return (
                  <div
                    key={w.id}
                    className={`p-3.5 border rounded-2xl flex flex-col gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-rose-50 hover:border-rose-100 bg-white'
                    }`}
                    onClick={() => handleSelectWorksheet(w)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold tracking-wider bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded">
                          Modul {w.module_number}
                        </span>
                        <h4 className="font-bold text-xs text-gray-700 mt-1.5 line-clamp-1">{w.title}</h4>
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-150 px-2 py-0.5 rounded">
                        {w.format}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-rose-50/50 pt-2.5 mt-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleInteractive(w.id, w.interactive)
                        }}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          w.interactive 
                            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {w.interactive ? 'Interactive On' : 'Interactive Off'}
                      </button>

                      {w.file_url && (
                        <a
                          href={w.file_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-rose-500 hover:text-rose-600 flex items-center gap-1 text-[10px] font-bold"
                        >
                          Unduh <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Detail & Grading Submissions */}
        <div className="lg:col-span-2">
          {selectedWorksheet ? (
            <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 min-h-[500px]">
              {/* Worksheet Title Header */}
              <div className="border-b border-rose-50 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-rose-100 text-rose-600 px-2.5 py-1 rounded-md">
                    Lembar Kerja Penilaian
                  </span>
                  <h3 className="font-bold text-gray-800 text-base mt-2">{selectedWorksheet.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Format: {selectedWorksheet.format} | Interaktif: {selectedWorksheet.interactive ? 'Ya' : 'Tidak'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 font-medium text-xs text-gray-500 bg-rose-50/30 border border-rose-100/30 p-3 rounded-2xl">
                  <Users size={16} className="text-rose-500" />
                  <span>{submissions.length} Pengumpulan</span>
                </div>
              </div>

              {/* Submissions List */}
              {submissionsLoading ? (
                <div className="py-24 text-center text-xs text-gray-400 animate-pulse font-medium">
                  Memuat daftar pengumpulan tugas siswa...
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-24 text-center text-xs text-gray-400 font-medium flex flex-col items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-rose-300 animate-pulse" />
                  Belum ada siswa yang mengumpulkan tugas worksheet ini.
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {submissions.map(sub => {
                    const isGraded = sub.graded_at !== null
                    return (
                      <div
                        key={sub.id}
                        className="border border-rose-50 rounded-2xl p-5 hover:shadow-sm transition-shadow flex flex-col md:flex-row gap-5 items-start bg-rose-50/5"
                      >
                        {/* Student Details & Attachment */}
                        <div className="flex-1 flex flex-col gap-3 min-w-0">
                          <div>
                            <h4 className="font-bold text-sm text-gray-800 truncate">{sub.student_name}</h4>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                              Kelas: {sub.student_class} | Dikumpulkan: {new Date(sub.submitted_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {/* attachment */}
                          <div className="flex flex-wrap gap-2">
                            {sub.file_url ? (
                              <a
                                href={sub.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-50 shadow-sm"
                              >
                                <FileText size={14} />
                                Lihat File Lampiran
                                <ExternalLink size={12} />
                              </a>
                            ) : sub.html_content ? (
                              <div className="w-full bg-white border border-rose-100 rounded-xl p-3 text-xs text-gray-700 leading-normal max-h-[150px] overflow-y-auto whitespace-pre-wrap font-mono">
                                {sub.html_content}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Tidak ada attachment</span>
                            )}
                          </div>
                        </div>

                        {/* Grading Form */}
                        <div className="w-full md:w-64 shrink-0 flex flex-col gap-3.5 border-t md:border-t-0 md:border-l border-rose-50 pt-4 md:pt-0 md:pl-5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Input Nilai & Feedback</span>
                            {isGraded ? (
                              <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 size={10} /> Selesai Dinilai
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                                Belum Dinilai
                              </span>
                            )}
                          </div>

                          {/* Score Input */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">Nilai:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={gradingScores[sub.id] || ''}
                              onChange={(e) => setGradingScores({ ...gradingScores, [sub.id]: e.target.value })}
                              placeholder="0-100"
                              className="w-20 px-2.5 py-1.5 border border-rose-100 rounded-lg text-xs font-bold text-center focus:outline-none focus:border-rose-400 bg-white"
                            />
                            <span className="text-xs text-gray-400">/ 100</span>
                          </div>

                          {/* Teacher Note Input */}
                          <textarea
                            value={gradingNotes[sub.id] || ''}
                            onChange={(e) => setGradingNotes({ ...gradingNotes, [sub.id]: e.target.value })}
                            placeholder="Catatan umpan balik / perbaikan untuk siswa..."
                            rows={2}
                            className="w-full p-2.5 border border-rose-100 rounded-lg text-xs focus:outline-none focus:border-rose-400 bg-white font-normal"
                          />

                          {/* Save Grading Button */}
                          <button
                            onClick={() => handleSaveGrade(sub.id)}
                            disabled={savingGrades[sub.id]}
                            className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 min-h-[34px]"
                          >
                            <GraduationCap size={14} />
                            {savingGrades[sub.id] ? 'Menyimpan...' : 'Simpan Nilai'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-rose-50/20 border border-dashed border-rose-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[500px]">
              <ClipboardCheck className="w-12 h-12 text-rose-300 animate-pulse" />
              <div>
                <h4 className="font-bold text-gray-700 text-sm">Pilih Worksheet</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                  Klik salah satu worksheet di panel kiri untuk membuka lembar kerja penilaian, mengunduh lampiran tugas siswa, dan mengisi nilai beserta feedback.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
