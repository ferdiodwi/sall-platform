'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, Clock } from 'lucide-react'

interface ProgressBarProps {
  moduleNumber: number
  moduleTitle: string
  completedActivitiesCount: number
  totalActivitiesCount: number
}

export default function ProgressBar({
  moduleNumber,
  moduleTitle,
  completedActivitiesCount,
  totalActivitiesCount,
}: ProgressBarProps) {
  const percentage = totalActivitiesCount > 0 
    ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100) 
    : 0

  const getStatusInfo = () => {
    if (completedActivitiesCount === totalActivitiesCount && totalActivitiesCount > 0) {
      return {
        label: 'Selesai',
        colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        progressClass: '[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500',
        icon: <CheckCircle2 size={12} className="text-emerald-500" />,
      }
    }
    if (completedActivitiesCount > 0) {
      return {
        label: 'Sedang Dipelajari',
        colorClass: 'text-rose-600 bg-rose-50 border-rose-150',
        progressClass: '[&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-pink-500',
        icon: <Clock size={12} className="text-rose-500" />,
      }
    }
    return {
      label: 'Belum Mulai',
      colorClass: 'text-gray-400 bg-gray-50 border-gray-200',
      progressClass: 'bg-gray-100',
      icon: <Circle size={12} className="text-gray-300" />,
    }
  }

  const status = getStatusInfo()

  return (
    <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-300">
      
      {/* Title & Status */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Modul {moduleNumber}
          </span>
          <h4 className="font-extrabold text-sm text-gray-800 leading-snug">
            {moduleTitle}
          </h4>
        </div>

        <span className={`inline-flex items-center gap-1 text-[9px] border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${status.colorClass}`}>
          {status.icon}
          <span>{status.label}</span>
        </span>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-semibold text-gray-500">
          <span>Aktivitas Belajar</span>
          <span>
            {completedActivitiesCount} / {totalActivitiesCount} ({percentage}%)
          </span>
        </div>

        <Progress 
          value={percentage} 
          className={`h-2.5 bg-gray-100 ${status.progressClass}`} 
        />
      </div>

    </div>
  )
}
