'use client'

import React from 'react'
import { Award, Lock, Sparkles } from 'lucide-react'

interface BadgeGridProps {
  earnedBadges: string[]
}

const ALL_BADGES = [
  {
    id: 'first_step',
    name: 'First Step',
    emoji: '🎯',
    description: 'Selesaikan placement kuis pertama kali.',
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    emoji: '🔥',
    description: 'Pertahankan streak belajar selama 7 hari berturut-turut.',
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    emoji: '📚',
    description: 'Selesaikan minimal 3 modul pembelajaran.',
  },
  {
    id: 'vocabulary_master',
    name: 'Vocabulary Master',
    emoji: '💎',
    description: 'Kumpulkan minimal 50 kosakata di Word Wall kamu.',
  },
  {
    id: 'journaling_pro',
    name: 'Journaling Pro',
    emoji: '✍️',
    description: 'Tulis minimal 10 entri di Jurnal Digital.',
  },
  {
    id: 'quiz_champion',
    name: 'Quiz Champion',
    emoji: '👑',
    description: 'Raih skor sempurna (100%) di salah satu kuis modul.',
  },
]

export default function BadgeGrid({ earnedBadges = [] }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {ALL_BADGES.map((badge) => {
        const isEarned = earnedBadges.includes(badge.id)

        return (
          <div
            key={badge.id}
            className={`border rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 relative overflow-hidden
              ${
                isEarned
                  ? 'bg-gradient-to-br from-rose-50/20 via-white to-rose-50/5 border-rose-200 shadow-sm hover:shadow-md'
                  : 'bg-gray-50/50 border-gray-200 opacity-60'
              }`}
          >
            {/* Background sparkle for earned badges */}
            {isEarned && (
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 text-gray-500">
                <Award size={80} />
              </div>
            )}

            {/* Badge Icon bubble */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform duration-500
                ${isEarned ? 'bg-rose-100/70 text-rose-600 scale-100' : 'bg-gray-200/50 grayscale'}`}
            >
              {isEarned ? (
                <span>{badge.emoji}</span>
              ) : (
                <Lock className="text-gray-400" size={20} />
              )}
            </div>

            {/* Description Info */}
            <div className="text-left space-y-1 z-10">
              <div className="flex items-center gap-1.5">
                <h4 className={`text-xs md:text-sm font-black tracking-tight ${isEarned ? 'text-gray-800' : 'text-gray-500'}`}>
                  {badge.name}
                </h4>
                {isEarned && (
                  <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-full scale-90 flex items-center gap-0.5 uppercase tracking-wider">
                    <Sparkles size={8} className="fill-white" />
                    <span>Peroleh</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] md:text-xs text-gray-450 leading-relaxed font-semibold">
                {badge.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
