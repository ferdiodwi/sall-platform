import { describe, it, expect, vi, beforeEach } from 'vitest'
import { awardXp, updateStreak, checkAndAwardBadges, getISOWeekId } from '@/lib/xp'
import { SupabaseClient } from '@supabase/supabase-js'

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

describe('XP and Gamification Engine', () => {
  let mockSupabase: any
  let mockChains: any[]

  beforeEach(() => {
    let callIndex = 0
    mockChains = []

    mockSupabase = {
      from: vi.fn(() => {
        const chain = mockChains[callIndex] || createQueryChain(null, null)
        callIndex++
        return chain
      }),
      mockResult: (data: any, error: any, count?: number) => {
        mockChains.push(createQueryChain(data, error, count))
      }
    }
  })

  describe('getISOWeekId', () => {
    it('should return week id in YYYY-Www format', () => {
      const weekId = getISOWeekId()
      expect(weekId).to.match(/^\d{4}-W\d{2}$/)
    })
  })

  describe('awardXp', () => {
    it('should retrieve student details, update student XP and create leaderboard entry', async () => {
      // 1. users select
      mockSupabase.mockResult({ class_id: 'class-1', students: { xp: 100 } }, null)
      // 2. students update
      mockSupabase.mockResult(null, null)
      // 3. leaderboards select (not found)
      mockSupabase.mockResult(null, { code: 'PGRST116' })
      // 4. leaderboards insert
      mockSupabase.mockResult(null, null)

      await awardXp(
        { userId: 'user-123', xpAmount: 20, event: 'quiz_completed' },
        mockSupabase as unknown as SupabaseClient
      )

      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(mockSupabase.from).toHaveBeenCalledWith('students')
      expect(mockSupabase.from).toHaveBeenCalledWith('leaderboards')
      
      const studentsChain = mockChains[1]
      expect(studentsChain.update).toHaveBeenCalledWith({ xp: 120 })
      
      const lbInsertChain = mockChains[3]
      expect(lbInsertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          xp: 20,
        })
      )
    })
  })

  describe('updateStreak', () => {
    it('should increase streak if last_active was exactly yesterday', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      // 1. students select
      mockSupabase.mockResult({ streak: 3, last_active: yesterday.toISOString() }, null)
      // 2. students update
      mockSupabase.mockResult(null, null)

      const newStreak = await updateStreak('user-123', mockSupabase as unknown as SupabaseClient)
      expect(newStreak).toBe(4)

      const updateChain = mockChains[1]
      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          streak: 4,
        })
      )
    })

    it('should reset streak to 1 if last_active was older than 1 day', async () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      // 1. students select
      mockSupabase.mockResult({ streak: 12, last_active: threeDaysAgo.toISOString() }, null)
      // 2. students update
      mockSupabase.mockResult(null, null)

      const newStreak = await updateStreak('user-123', mockSupabase as unknown as SupabaseClient)
      expect(newStreak).toBe(1)
    })

    it('should trigger awardXp bonus when streak reaches 7 days', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      // 1. updateStreak: student select
      mockSupabase.mockResult({ streak: 6, last_active: yesterday.toISOString() }, null)
      
      // 2. awardXp (inside updateStreak bonus): users select details
      mockSupabase.mockResult({ class_id: 'class-1', students: { xp: 100 } }, null)
      // 3. awardXp: update student XP
      mockSupabase.mockResult(null, null)
      // 4. awardXp: select leaderboard
      mockSupabase.mockResult(null, { code: 'PGRST116' })
      // 5. awardXp: insert leaderboard
      mockSupabase.mockResult(null, null)
      
      // 6. updateStreak (inside bonus): notifications insert
      mockSupabase.mockResult(null, null)
      
      // 7. updateStreak: student update
      mockSupabase.mockResult(null, null)

      const newStreak = await updateStreak('user-123', mockSupabase as unknown as SupabaseClient)
      expect(newStreak).toBe(7)
    })
  })

  describe('checkAndAwardBadges', () => {
    it('should award first_step if placement_date is set', async () => {
      // 1. students select profile
      mockSupabase.mockResult({ badges: [], streak: 1, placement_date: '2026-06-13', modules_completed: [] }, null)
      // 2. word_wall count
      mockSupabase.mockResult(null, null, 2)
      // 3. journals count
      mockSupabase.mockResult(null, null, 1)
      // 4. students update badges
      mockSupabase.mockResult(null, null)
      // 5. notifications insert
      mockSupabase.mockResult(null, null)

      const newBadges = await checkAndAwardBadges('user-123', mockSupabase as unknown as SupabaseClient)
      expect(newBadges).toContain('first_step')
    })

    it('should award bookworm if 3 or more modules completed', async () => {
      // 1. students select profile
      mockSupabase.mockResult({ badges: [], streak: 1, placement_date: null, modules_completed: ['mod1', 'mod2', 'mod3'] }, null)
      // 2. word_wall count
      mockSupabase.mockResult(null, null, 0)
      // 3. journals count
      mockSupabase.mockResult(null, null, 0)
      // 4. students update badges
      mockSupabase.mockResult(null, null)
      // 5. notifications insert
      mockSupabase.mockResult(null, null)

      const newBadges = await checkAndAwardBadges('user-123', mockSupabase as unknown as SupabaseClient)
      expect(newBadges).toContain('bookworm')
    })

    it('should award quiz_champion if perfect quiz completion is true', async () => {
      // 1. students select profile
      mockSupabase.mockResult({ badges: [], streak: 1, placement_date: null, modules_completed: [] }, null)
      // 2. word_wall count
      mockSupabase.mockResult(null, null, 0)
      // 3. journals count
      mockSupabase.mockResult(null, null, 0)
      // 4. students update badges
      mockSupabase.mockResult(null, null)
      // 5. notifications insert
      mockSupabase.mockResult(null, null)

      const newBadges = await checkAndAwardBadges('user-123', mockSupabase as unknown as SupabaseClient, true)
      expect(newBadges).toContain('quiz_champion')
    })
  })
})
