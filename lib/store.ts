"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserState, JournalEntry, WordWallItem, Review, AttemptRecord, Level } from "@/types";
import { badges, seedReviews } from "@/data/content";

const todayStr = () => new Date().toISOString().slice(0, 10);

// ============================================================
// USER STORE
// ============================================================
interface UserStore extends UserState {
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

function checkBadges(state: UserState): string[] {
  const earned = new Set(state.badges);
  if (state.placementDone) earned.add("b1");
  if (state.vocabMastered >= 5) earned.add("b2");
  if (state.vocabMastered >= 10) earned.add("b3");
  if (state.modulesCompleted.includes("mod3")) earned.add("b4");
  if (state.modulesCompleted.includes("mod2")) earned.add("b5");
  if (state.modulesCompleted.includes("mod5")) earned.add("b6");
  if (state.streak >= 3) earned.add("b7");
  return Array.from(earned);
}

const defaultUser: UserState = {
  name: "",
  role: null,
  level: null,
  placementDone: false,
  xp: 0,
  streak: 1,
  lastActive: todayStr(),
  modulesCompleted: [],
  vocabMastered: 0,
  badges: [],
  attempts: [],
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...defaultUser,
      setName: (n) => set({ name: n }),
      login: (role, name) => set({ role, name }),
      logout: () => set(defaultUser),
      completePlacement: (level, xp) =>
        set((s) => {
          const next = { ...s, level, placementDone: true, xp: s.xp + xp };
          return { ...next, badges: checkBadges(next) };
        }),
      addXp: (amount) =>
        set((s) => {
          const next = { ...s, xp: s.xp + amount };
          return { ...next, badges: checkBadges(next) };
        }),
      recordAttempt: (a) =>
        set((s) => {
          const next = { ...s, attempts: [...s.attempts, a].slice(-100) };
          return { ...next, badges: checkBadges(next) };
        }),
      masterVocab: (count) =>
        set((s) => {
          const next = { ...s, vocabMastered: s.vocabMastered + count };
          return { ...next, badges: checkBadges(next) };
        }),
      completeModule: (id) =>
        set((s) => {
          const next = {
            ...s,
            modulesCompleted: s.modulesCompleted.includes(id)
              ? s.modulesCompleted
              : [...s.modulesCompleted, id],
          };
          return { ...next, badges: checkBadges(next) };
        }),
      awardBadge: (id) =>
        set((s) => ({ badges: Array.from(new Set([...s.badges, id])) })),
      resetAll: () => set(defaultUser),
    }),
    { name: "sall-user" }
  )
);

// ============================================================
// JOURNAL STORE
// ============================================================
interface JournalStore {
  entries: JournalEntry[];
  addEntry: (e: Omit<JournalEntry, "id" | "date">) => void;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (e) =>
        set((s) => ({
          entries: [
            { ...e, id: crypto.randomUUID(), date: todayStr() },
            ...s.entries,
          ],
        })),
    }),
    { name: "sall-journal" }
  )
);

// ============================================================
// WORD WALL STORE
// ============================================================
interface WordWallStore {
  words: WordWallItem[];
  addWord: (w: Omit<WordWallItem, "id" | "addedAt" | "status">) => void;
  setWordStatus: (id: string, status: WordWallItem["status"]) => void;
  removeWord: (id: string) => void;
}

export const useWordWallStore = create<WordWallStore>()(
  persist(
    (set) => ({
      words: [],
      addWord: (w) =>
        set((s) => ({
          words: [
            { ...w, id: crypto.randomUUID(), addedAt: todayStr(), status: "new" },
            ...s.words,
          ],
        })),
      setWordStatus: (id, status) =>
        set((s) => ({
          words: s.words.map((w) => (w.id === id ? { ...w, status } : w)),
        })),
      removeWord: (id) =>
        set((s) => ({ words: s.words.filter((w) => w.id !== id) })),
    }),
    { name: "sall-wordwall" }
  )
);

// ============================================================
// REVIEW STORE
// ============================================================
interface ReviewStore {
  reviews: Review[];
  addReview: (r: Omit<Review, "id" | "date">) => void;
  replyReview: (id: string, reply: string) => void;
  pinReview: (id: string) => void;
  deleteReview: (id: string) => void;
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set) => ({
      reviews: seedReviews,
      addReview: (r) =>
        set((s) => ({
          reviews: [{ ...r, id: crypto.randomUUID(), date: todayStr() }, ...s.reviews],
        })),
      replyReview: (id, reply) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id ? { ...r, teacherReply: reply } : r
          ),
        })),
      pinReview: (id) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id ? { ...r, pinned: !r.pinned } : r
          ),
        })),
      deleteReview: (id) =>
        set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),
    }),
    { name: "sall-reviews" }
  )
);

export { badges };
