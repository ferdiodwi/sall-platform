import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/grade-quiz/route'
import { NextRequest } from 'next/server'

// Mock createServerClient
vi.mock('@/lib/supabase/server', () => {
  const mockClient = {
    auth: {
      getUser: vi.fn(),
    },
  }
  return {
    createServerClient: vi.fn(() => Promise.resolve(mockClient)),
  }
})

const createQueryChain = (data: any, error: any, count?: number) => {
  const chain: any = {
    select: vi.fn(() => chain),
    update: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    upsert: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    in: vi.fn(() => chain),
    order: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve({ data, error, count })),
  }
  chain.then = (onfulfilled: any) => {
    return Promise.resolve({ data, error, count }).then(onfulfilled)
  }
  return chain
}

// Mock @supabase/supabase-js createClient
let mockChains: any[] = []
let callIndex = 0

vi.mock('@supabase/supabase-js', () => {
  const mockServiceClient = {
    from: vi.fn(() => {
      const chain = mockChains[callIndex] || createQueryChain(null, null)
      callIndex++
      return chain
    })
  }
  return {
    createClient: vi.fn(() => mockServiceClient),
  }
})

// Mock XP utilities
vi.mock('@/lib/xp', () => ({
  awardXp: vi.fn(() => Promise.resolve()),
  checkAndAwardBadges: vi.fn(() => Promise.resolve(['new_badge'])),
}))

import { createServerClient } from '@/lib/supabase/server'
import { awardXp, checkAndAwardBadges } from '@/lib/xp'

describe('grade-quiz API Route Handler', () => {
  let mockSupabase: any

  beforeEach(async () => {
    vi.clearAllMocks()
    mockChains = []
    callIndex = 0
    mockSupabase = await createServerClient()
  })

  const mockResult = (data: any, error: any, count?: number) => {
    mockChains.push(createQueryChain(data, error, count))
  }

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/grade-quiz', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  it('should return 401 if unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const request = createRequest({ quizId: 'quiz-id', answers: [] })
    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })

  it('should grade correct answers and award XP / badges for standard quizzes', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'student-user' } },
      error: null,
    })

    // 1. quizzes select
    mockResult({ id: 'quiz-1', level: 'beginner', module_id: 'module-1' }, null)

    // 2. answers select
    mockResult([
      {
        question_id: 'q1',
        answer_index: 0,
        explanation_correct: 'Correct!',
        explanation_wrong: 'Wrong!',
        related_vocab: [],
        review_activity: '',
        questions: { prompt: 'Q1', topic: 'vocab' },
      },
    ], null)

    // 3. students completed modules check select
    mockResult({ modules_completed: [] }, null)

    // 4. students update completed modules
    mockResult(null, null)

    // 5. feedback insert
    mockResult(null, null)

    const request = createRequest({
      quizId: 'quiz-1',
      answers: [{ questionId: 'q1', selectedIndex: 0 }],
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.score).toBe(1)
    expect(json.totalQuestions).toBe(1)
    expect(json.newBadges).toContain('new_badge')
    expect(awardXp).toHaveBeenCalled()
    expect(checkAndAwardBadges).toHaveBeenCalled()
  })

  it('should categorize level to intermediate on score >= 6 for placement quiz', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'student-user-2' } },
      error: null,
    })

    // 1. quizzes select
    mockResult({ id: 'placement-quiz', level: 'placement' }, null)

    // 2. answers select
    const mockDbAnswers = Array.from({ length: 10 }, (_, i) => ({
      question_id: `q${i}`,
      answer_index: 0,
      explanation_correct: 'Yes',
      explanation_wrong: 'No',
      related_vocab: [],
      review_activity: '',
      questions: { prompt: `Q${i}`, topic: 'placement' },
    }))
    mockResult(mockDbAnswers, null)

    // 3. students placement_date select
    mockResult({ placement_date: null }, null)

    // 4. students update level
    mockResult(null, null)

    // 5. users update level
    mockResult(null, null)

    // 6. feedback insert
    mockResult(null, null)

    const studentAnswers = Array.from({ length: 10 }, (_, i) => ({
      questionId: `q${i}`,
      selectedIndex: i < 7 ? 0 : 1,
    }))

    const request = createRequest({
      quizId: 'placement-quiz',
      answers: studentAnswers,
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.score).toBe(7)
    expect(json.level).toBe('intermediate')
  })

  it('should enforce 30-day limits on re-taking the placement quiz', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'student-user-3' } },
      error: null,
    })

    // 1. quizzes select
    mockResult({ id: 'placement-quiz', level: 'placement' }, null)

    // 2. answers select
    mockResult([], null)

    // 3. students placement_date select (recent, 2 days ago)
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - 2)
    mockResult({ placement_date: recentDate.toISOString() }, null)

    const request = createRequest({
      quizId: 'placement-quiz',
      answers: [],
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toContain('Limitasi 30 hari aktif')
  })
})
