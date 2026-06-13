'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Email wajib diisi.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Format email tidak valid.'); return }

    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    setLoading(false)

    if (resetError) {
      setError('Terjadi kesalahan. Pastikan email terdaftar dan coba lagi.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <MailCheck className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">Email Terkirim!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Link reset password sudah dikirim ke <strong>{email}</strong>. 
            Cek inbox atau folder spam kamu.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full border-rose-200 text-rose-500 hover:bg-rose-50">
              <ArrowLeft size={16} className="mr-2" />
              Kembali ke Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl text-gray-800">Lupa Password?</CardTitle>
        <CardDescription>Masukkan email dan kami akan kirim link reset</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@sekolah.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              disabled={loading}
              className="border-rose-200 focus:ring-rose-400"
              autoComplete="email"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 font-semibold h-11"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</>
            ) : (
              'Kirim Link Reset'
            )}
          </Button>
        </form>

        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-rose-500 transition-colors mt-6">
          <ArrowLeft size={14} />
          Kembali ke Login
        </Link>
      </CardContent>
    </Card>
  )
}
