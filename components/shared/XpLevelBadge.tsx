import React from 'react'

export interface XpLevelInfo {
  levelName: string
  emoji: string
  nextLevelXp: number
  prevLevelXp: number
}

export function getXpLevelInfo(xp: number): XpLevelInfo {
  if (xp < 100) return { levelName: 'Pemula', emoji: '🌱', prevLevelXp: 0, nextLevelXp: 100 }
  if (xp < 300) return { levelName: 'Pelajar', emoji: '📚', prevLevelXp: 100, nextLevelXp: 300 }
  if (xp < 600) return { levelName: 'Mahir', emoji: '⭐', prevLevelXp: 300, nextLevelXp: 600 }
  if (xp < 1000) return { levelName: 'Ahli', emoji: '🏆', prevLevelXp: 600, nextLevelXp: 1000 }
  return { levelName: 'Master Fashion', emoji: '👑', prevLevelXp: 1000, nextLevelXp: 999999 } // Cap level max
}

export function XpLevelBadge({ xp, className = '' }: { xp: number; className?: string }) {
  const { levelName, emoji } = getXpLevelInfo(xp)

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full bg-rose-50 border border-rose-200 text-rose-700 shadow-sm ${className}`}>
      <span>{emoji}</span>
      <span>{levelName}</span>
    </span>
  )
}
