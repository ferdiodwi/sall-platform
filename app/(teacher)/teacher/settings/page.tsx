'use client'

import React, { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Save, 
  RotateCcw, 
  HelpCircle,
  BrainCircuit,
  MessageSquareWarning,
  Activity
} from 'lucide-react'

export default function TeacherSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [promptTemplate, setPromptTemplate] = useState('')
  const [maxTokens, setMaxTokens] = useState(1000)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/ai-config')
      const data = await res.json()
      if (res.ok) {
        setPromptTemplate(data.prompt_template)
        setMaxTokens(data.max_tokens)
      }
    } catch (err) {
      console.error('Error fetching AI config:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptTemplate.trim()) {
      alert('Prompt Template tidak boleh kosong!')
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/ai-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt_template: promptTemplate,
          max_tokens: maxTokens
        })
      })

      const data = await res.json()
      if (res.ok) {
        alert(data.message || 'Konfigurasi AI berhasil disimpan!')
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      console.error('Error saving AI config:', err)
      alert(err.message || 'Gagal menyimpan konfigurasi.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (!confirm('Apakah Anda yakin ingin menyetel ulang Prompt AI ke pengaturan standar?')) return

    const defaultPrompt = 'Anda adalah asisten AI guru bahasa Inggris yang ahli. Analisis kesalahan kuis tata busana/fashion siswa berikut dan berikan feedback yang dipersonalisasi serta rekomendasi belajar yang terukur.'
    setPromptTemplate(defaultPrompt)
    setMaxTokens(1000)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full animate-pulse">
        <div className="h-8 w-48 bg-rose-50 rounded-lg" />
        <div className="h-64 bg-white rounded-3xl border border-rose-100/40" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
            Konfigurasi Prompts AI
          </h2>
          <p className="text-sm text-gray-500">
            Sesuaikan perilaku sistem rekomendasi pembelajaran cerdas (Smart Feedback) berbasis AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50/30 rounded-xl text-xs font-semibold shadow-sm transition-all min-h-[44px] cursor-pointer"
          >
            <RotateCcw size={14} />
            Reset Default
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Kolom Kiri: Form Config */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-gray-850 text-base flex items-center gap-1.5 text-rose-600">
              <BrainCircuit size={18} /> Sistem Prompt Dasar (Base System Prompt)
            </h3>

            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase">Instruksi AI (Prompt Template)</label>
              <textarea
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                rows={8}
                placeholder="Tulis sistem instruksi untuk Gemini API..."
                className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-rose-50/10 font-normal leading-relaxed"
                required
              />
              <p className="text-[10px] text-gray-400 leading-normal">
                Prompt ini akan diinjeksikan sebagai instruksi utama (System Role) ke API Gemini sebelum menganalisis jawaban salah dan memberikan rekomendasi belajar kosakata Tata Busana untuk siswa.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Batas Karakter Maksimal (Max Tokens)</label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                min="100"
                max="4000"
                className="w-full max-w-xs px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-rose-50/10 min-h-[44px]"
                required
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Panduan Rekomendasi */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <HelpCircle size={14} className="text-rose-500" /> Variabel Dynamic Prompt
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed font-normal">
              Sistem SALL secara otomatis menyertakan konteks data dinamis berikut saat mengirimkan permintaan ke AI:
            </p>
            
            <div className="flex flex-col gap-2.5 pl-1.5 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <p><strong>Nama & Level:</strong> Profil siswa bersangkutan.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <p><strong>Kosakata Terkait:</strong> Log kata-kata busana yang salah dijawab.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <p><strong>Topik Kategori:</strong> Bidang fashion spesifik (e.g. sewing, cutting, styling).</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50/20 border border-orange-100 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
            <h4 className="font-bold text-orange-700 text-sm flex items-center gap-1.5">
              <MessageSquareWarning size={16} /> Perhatian
            </h4>
            <p className="text-xs text-orange-650 leading-relaxed font-normal">
              Perubahan pada prompt sistem dasar dapat memengaruhi kualitas rekomendasi belajar otomatis. Ujilah hasil rekomendasi setelah mengubah isi instruksi untuk memastikan ketepatan tata bahasa Inggris dan kosakata busana.
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
