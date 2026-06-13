import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareClient(request)
  const { pathname } = request.nextUrl

  // Refresh session agar tidak expired
  const { data: { user } } = await supabase.auth.getUser()

  // Baca role dari cookie (di-set saat login) — tanpa query DB
  const cachedRole = request.cookies.get('user-role')?.value

  // Helper: ambil role dari DB jika cookie belum ada
  const getRole = async (): Promise<string> => {
    if (cachedRole) return cachedRole
    if (!user) return 'student'
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>()
    return profile?.role ?? 'student'
  }

  // ---------------------------------------------------------
  // 1. Halaman auth (login/register) saat sudah login
  //    → redirect ke halaman sesuai role
  // ---------------------------------------------------------
  if ((pathname === '/login' || pathname === '/register') && user) {
    const role = await getRole()
    const redirectUrl = new URL(role === 'teacher' ? '/teacher/dashboard' : '/home', request.url)
    const res = NextResponse.redirect(redirectUrl)
    // Pastikan cookie role selalu tersimpan
    if (!cachedRole) res.cookies.set('user-role', role, { path: '/', sameSite: 'lax' })
    return res
  }

  // ---------------------------------------------------------
  // 2. Route protected (student) → wajib login
  // ---------------------------------------------------------
  if (pathname.startsWith('/home') || pathname.startsWith('/leaderboard') ||
      pathname.startsWith('/modules') || pathname.startsWith('/placement-quiz') ||
      pathname.startsWith('/journal') || pathname.startsWith('/word-wall') ||
      pathname.startsWith('/progress') || pathname.startsWith('/help')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // ---------------------------------------------------------
  // 3. Route teacher/* → wajib login DAN role teacher
  //    Membaca dari cookie — tidak ada DB query!
  // ---------------------------------------------------------
  if (pathname.startsWith('/teacher')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const role = await getRole()
    if (role !== 'teacher') {
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/home/:path*',
    '/teacher/:path*',
    '/leaderboard/:path*',
    '/modules/:path*',
    '/placement-quiz/:path*',
    '/journal/:path*',
    '/word-wall/:path*',
    '/progress/:path*',
    '/help/:path*',
    '/login',
    '/register',
  ],
}
