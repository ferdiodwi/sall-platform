// ============================================================
// SALL Platform — Shared Type Definitions
// Models mirror the planned Supabase tables so the demo
// can be wired to Supabase with minimal changes.
// ============================================================

export type Level = "beginner" | "intermediate";

export interface VocabWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  emoji: string;
  category: string;
}

export interface QuizQuestion {
  id: string;
  type: "vocab" | "reading";
  prompt: string;
  passage?: string;
  options: string[];
  answerIndex: number;
  explanationCorrect: string;
  explanationWrong: string;
  relatedVocab?: string;
  reviewActivity?: string;
  topic: string;
}

export interface ModuleFeature {
  name: string;
  icon: string;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  tagline: string;
  emoji: string;
  features: ModuleFeature[];
  resources: Resource[];
}

export interface Resource {
  type: "video" | "audio" | "worksheet" | "reading";
  title: string;
  format: string;
  meta: string;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  requirement: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  learned: string;
  difficult: string;
  goal: string;
}

export interface WordWallItem {
  id: string;
  word: string;
  meaning: string;
  example: string;
  emoji: string;
  status: "new" | "learning" | "mastered";
  addedAt: string;
}

export interface Review {
  id: string;
  moduleId: string;
  author: string;
  rating: number;
  comment: string;
  emoji: string;
  date: string;
  pinned?: boolean;
  teacherReply?: string;
}

export interface AttemptRecord {
  topic: string;
  correct: boolean;
}

export interface UserStore extends UserState {
  setName: (n: string) => void;
  login: (role: "student" | "teacher", name: string) => void;
  logout: () => void;
  completePlacement: (level: Level, xp: number) => void;
  addXp: (amount: number) => void;
  recordAttempt: (a: AttemptRecord) => void;
  masterVocab: (count: number) => void;
  completeModule: (id: string) => void;
  awardBadge: (id: string) => void;
  resetAll: () => void;
}

export interface UserState {
  name: string;
  role: "student" | "teacher" | null;
  level: Level | null;
  placementDone: boolean;
  xp: number;
  streak: number;
  lastActive: string;
  modulesCompleted: string[];
  vocabMastered: number;
  badges: string[];
  attempts: AttemptRecord[];
}

export interface MenuItem {
  key: string;
  label: string;
  emoji: string;
  href: string;
}
