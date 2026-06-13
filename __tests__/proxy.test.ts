import { describe, it, expect, vi, beforeEach } from 'vitest'
import proxy from '@/proxy'
import { NextRequest, NextResponse } from 'next/server'

// Mock createMiddlewareClient
vi.mock('@/lib/supabase/middleware', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  }
  const mockResponse = { headers: new Map() }
  return {
    createMiddlewareClient: vi.fn(() => ({
      supabase: mockSupabase,
      supabaseResponse: mockResponse,
    })),
  }
})

// Mock NextResponse
vi.spyOn(NextResponse, 'redirect').mockImplementation((url: any) => {
  return { status: 307, headers: { get: () => url.toString() } } as any
})

import { createMiddlewareClient } from '@/lib/supabase/middleware'

describe('Proxy Middleware Router Guard', () => {
  let mockSupabase: any
  let mockResponse: any

  beforeEach(() => {
    vi.clearAllMocks()
    const client = createMiddlewareClient({} as any)
    mockSupabase = client.supabase
    mockResponse = client.supabaseResponse
  })

  const createMockRequest = (pathname: string) => {
    return {
      nextUrl: { pathname },
      url: `http://localhost:3000${pathname}`,
    } as unknown as NextRequest
  };

  it('should redirect already logged in students from /login to /home', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'student-1' } },
      error: null,
    })

    const selectMock = vi.fn().mockReturnThis()
    const eqMock = vi.fn().mockReturnThis()
    const singleMock = vi.fn().mockResolvedValueOnce({
      data: { role: 'student' },
      error: null,
    })
    mockSupabase.from.mockReturnValueOnce({
      select: selectMock,
      eq: eqMock,
      single: singleMock,
    })

    const request = createMockRequest('/login')
    const response = await proxy(request)

    expect(response.status).toBe(307)
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:3000/home',
      })
    )
  })

  it('should redirect already logged in teachers from /login to /teacher/dashboard', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'teacher-1' } },
      error: null,
    })

    const selectMock = vi.fn().mockReturnThis()
    const eqMock = vi.fn().mockReturnThis()
    const singleMock = vi.fn().mockResolvedValueOnce({
      data: { role: 'teacher' },
      error: null,
    })
    mockSupabase.from.mockReturnValueOnce({
      select: selectMock,
      eq: eqMock,
      single: singleMock,
    })

    const request = createMockRequest('/login')
    const response = await proxy(request)

    expect(response.status).toBe(307)
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:3000/teacher/dashboard',
      })
    )
  })

  it('should redirect guest access to student protected routes to /login', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const request = createMockRequest('/home')
    const response = await proxy(request)

    expect(response.status).toBe(307)
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:3000/login?redirect=%2Fhome',
      })
    )
  })

  it('should redirect student role access attempting to load teacher routes to /home', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'student-2' } },
      error: null,
    })

    const selectMock = vi.fn().mockReturnThis()
    const eqMock = vi.fn().mockReturnThis()
    const singleMock = vi.fn().mockResolvedValueOnce({
      data: { role: 'student' },
      error: null,
    })
    mockSupabase.from.mockReturnValueOnce({
      select: selectMock,
      eq: eqMock,
      single: singleMock,
    })

    const request = createMockRequest('/teacher/dashboard')
    const response = await proxy(request)

    expect(response.status).toBe(307)
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:3000/home',
      })
    )
  })

  it('should allow teacher access to teacher routes without redirection', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'teacher-2' } },
      error: null,
    })

    const selectMock = vi.fn().mockReturnThis()
    const eqMock = vi.fn().mockReturnThis()
    const singleMock = vi.fn().mockResolvedValueOnce({
      data: { role: 'teacher' },
      error: null,
    })
    mockSupabase.from.mockReturnValueOnce({
      select: selectMock,
      eq: eqMock,
      single: singleMock,
    })

    const request = createMockRequest('/teacher/dashboard')
    const response = await proxy(request)

    expect(response).toBe(mockResponse)
  })
})
