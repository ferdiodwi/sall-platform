import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareClient(request)
  const { pathname } = request.nextUrl

  // Refresh session agar tidak expired
  const { data: { user } } = await supabase.auth.getUser()

  // ---------------------------------------------------------
  // 1. Halaman auth (login/register) saat sudah login
  //    → redirect ke halaman sesuai role
  // ---------------------------------------------------------
  if ((pathname === '/login' || pathname === '/register') && user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>()

    const role = profile?.role ?? 'student'
    const redirectUrl = new URL(role === 'teacher' ? '/teacher/dashboard' : '/home', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // ---------------------------------------------------------
  // 2. Route protected (home/*) → wajib login
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
  // ---------------------------------------------------------
  if (pathname.startsWith('/teacher')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>()

    if (profile?.role !== 'teacher') {
      // Siswa yang coba akses /teacher → redirect ke /home
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
