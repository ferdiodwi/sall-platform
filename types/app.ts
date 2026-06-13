// ============================================================
// types/app.ts
// Custom app types untuk SALL Platform
// ============================================================

// --- Role & Level ---
export type UserRole = 'student' | 'teacher'
export type LearningLevel = 'beginner' | 'intermediate'

// --- Quiz ---
export type QuestionType = 'vocab' | 'reading' | 'true_false' | 'fill_blank' | 'matching'

// --- Word Wall ---
export type WordStatus = 'baru' | 'sedang dipelajari' | 'dikuasai'

// --- Gamification ---
export type BadgeName =
  | 'first_step'
  | 'on_fire'
  | 'bookworm'
  | 'vocabulary_master'
  | 'quiz_champion'
  | 'journaling_pro'

export type XPEventType =
  | 'module_complete'
  | 'correct_answer'
  | 'streak_bonus'
  | 'worksheet_submit'
  | 'journal_write'
  | 'placement_quiz'
  | 'badge_check'

// --- XP Level Thresholds ---
export const XP_LEVELS = {
  pemula: { min: 0, max: 99, emoji: '🌱', label: 'Pemula' },
  pelajar: { min: 100, max: 299, emoji: '📚', label: 'Pelajar' },
  mahir: { min: 300, max: 599, emoji: '⭐', label: 'Mahir' },
  ahli: { min: 600, max: 999, emoji: '🏆', label: 'Ahli' },
  master: { min: 1000, max: Infinity, emoji: '👑', label: 'Master Fashion' },
} as const

// --- XP Awards ---
export const XP_AWARDS: Record<XPEventType, number> = {
  module_complete: 10,
  correct_answer: 5,
  streak_bonus: 50, // hari ke-7
  worksheet_submit: 15,
  journal_write: 10,
  placement_quiz: 10,
  badge_check: 0,
}

// --- Interfaces ---
export interface StudentProfile {
  id: string
  name: string
  email: string
  class_id: string | null
  photo_url: string | null
  xp: number
  streak: number
  level: LearningLevel | null
  placement_score: number | null
  placement_date: string | null
  modules_completed: string[]
  vocab_mastered: number
  badges: BadgeName[]
}

export interface ModuleCard {
  id: string
  number: number
  title: string
  tagline: string | null
  emoji: string | null
  order: number
  published: boolean
  avgRating?: number
  studentStatus?: 'not_started' | 'in_progress' | 'completed'
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  type: QuestionType
  prompt: string
  passage: string | null
  options: string[] | null
  topic: string
  order: number | null
}

export interface AnswerPayload {
  questionId: string
  selectedIndex: number
}

export interface FeedbackResult {
  questionId: string
  correct: boolean
  explanationCorrect: string
  explanationWrong: string
  correctAnswer: number
  relatedVocab: Array<{ word: string; meaning: string }> | null
  reviewActivity: string | null
}

export interface SmartFeedbackResult {
  weakTopic: string
  message: string
  recommendedActivity: string
  estTimeMinutes: number
}
