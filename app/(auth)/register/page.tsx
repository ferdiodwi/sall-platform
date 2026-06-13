'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ name: '', email: '', password: '', classId: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!form.name.trim()) return 'Nama lengkap wajib diisi.'
    if (!form.email.trim()) return 'Email wajib diisi.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Format email tidak valid.'
    if (form.password.length < 8) return 'Password minimal 8 karakter.'
    if (!form.classId.trim()) return 'Nomor kelas wajib diisi.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          role: 'student',
          class_id: form.classId,
        },
      },
    })

    setLoading(false)

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Email ini sudah terdaftar. Silakan login atau gunakan email lain.')
      } else {
        setError('Terjadi kesalahan. Coba lagi dalam beberapa saat.')
      }
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">Registrasi Berhasil!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Cek email kamu untuk verifikasi akun. Setelah terverifikasi, kamu bisa langsung login.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0"
          >
            Ke Halaman Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl text-gray-800">Daftar Akun</CardTitle>
        <CardDescription>Buat akun baru untuk mulai belajar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-gray-700">Nama Lengkap</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Contoh: Siti Nurhaliza"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              className="border-rose-200 focus:ring-rose-400"
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-gray-700">Email Sekolah</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@smkn2bondowoso.sch.id"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              className="border-rose-200 focus:ring-rose-400"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                className="border-rose-200 focus:ring-rose-400 pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Nomor Kelas */}
          <div className="space-y-1.5">
            <Label htmlFor="classId" className="text-gray-700">Nomor Kelas</Label>
            <Input
              id="classId"
              name="classId"
              type="text"
              placeholder="Contoh: XI TB 1"
              value={form.classId}
              onChange={handleChange}
              disabled={loading}
              className="border-rose-200 focus:ring-rose-400"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 font-semibold h-11 mt-2"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendaftar...</>
            ) : (
              'Daftar Sekarang'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-rose-500 hover:text-rose-600 font-medium">
            Login di sini
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
