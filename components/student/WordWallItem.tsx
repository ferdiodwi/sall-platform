'use client'

import React, { useState } from 'react'
import { Trash2, Check, BookOpen, Clock, Award, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WordWallItemProps {
  item: {
    id: string
    word: string
    meaning: string
    example: string | null
    image_url: string | null
    status: string
    review_history: any
  }
  onStatusChange: (id: string, newStatus: string, currentHistory: any[]) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function WordWallItem({ item, onStatusChange, onDelete }: WordWallItemProps) {
  const [updating, setUpdating] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Get status details
  const getStatusBadge = (status: string) => {
    if (status === 'dikuasai') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-250 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          <Award size={10} />
          <span>Dikuasai</span>
        </span>
      )
    }
    if (status === 'sedang dipelajari') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 border border-amber-250 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          <Clock size={10} />
          <span>Mempelajari</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] bg-purple-50 text-purple-600 border border-purple-250 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
        <HelpCircle size={10} />
        <span>Baru</span>
      </span>
    )
  }

  // Handle status update
  const handleStatusSelect = async (newStatus: string) => {
    if (newStatus === item.status || updating) return
    try {
      setUpdating(true)
      const currentHistory = Array.isArray(item.review_history) ? item.review_history : []
      const newHistory = [...currentHistory, { reviewedAt: new Date().toISOString(), status: newStatus }]
      await onStatusChange(item.id, newStatus, newHistory)
    } catch (err) {
      console.error('Failed to change status:', err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-white border border-rose-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      
      {/* Visual Header Image (if exists) */}
      {item.image_url ? (
        <div className="w-full h-32 overflow-hidden relative border-b border-rose-50/50">
          <img 
            src={item.image_url} 
            alt={item.word} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-550"
          />
          <div className="absolute top-3 right-3">
            {getStatusBadge(item.status)}
          </div>
        </div>
      ) : (
        <div className="p-4 pb-0 flex justify-between items-center">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-400 flex items-center justify-center">
            <BookOpen size={16} />
          </div>
          {getStatusBadge(item.status)}
        </div>
      )}

      {/* Word and Meaning Body */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div>
          <h4 className="text-lg font-black text-gray-800 tracking-tight leading-none">
            {item.word}
          </h4>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1.5">
            Artinya: <span className="text-rose-500 lowercase font-extrabold">{item.meaning}</span>
          </p>
        </div>

        {item.example && (
          <p className="text-xs text-gray-500 italic bg-rose-50/20 border border-rose-100/30 p-2.5 rounded-xl leading-relaxed">
            "{item.example}"
          </p>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-gray-50 border-t border-rose-50/50 flex flex-col gap-2.5">
        {showConfirmDelete ? (
          <div className="flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Hapus kata ini?</span>
            <div className="flex gap-1.5">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowConfirmDelete(false)}
                className="text-xs font-semibold py-1 px-2.5 h-7 rounded-lg"
              >
                Batal
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onDelete(item.id)}
                className="text-xs font-bold py-1 px-2.5 h-7 rounded-lg cursor-pointer"
              >
                Ya, Hapus
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            {/* Status cycling tabs */}
            <div className="flex bg-gray-200/60 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                disabled={updating}
                onClick={() => handleStatusSelect('baru')}
                className={`px-2 py-1 rounded-md transition-all ${
                  item.status === 'baru' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-650'
                }`}
              >
                Baru
              </button>
              <button
                disabled={updating}
                onClick={() => handleStatusSelect('sedang dipelajari')}
                className={`px-2 py-1 rounded-md transition-all ${
                  item.status === 'sedang dipelajari' 
                    ? 'bg-white text-amber-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-650'
                }`}
              >
                Belajar
              </button>
              <button
                disabled={updating}
                onClick={() => handleStatusSelect('dikuasai')}
                className={`px-2 py-1 rounded-md transition-all ${
                  item.status === 'dikuasai' 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-650'
                }`}
              >
                Kuasai
              </button>
            </div>

            {/* Trash button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirmDelete(true)}
              className="text-gray-400 hover:text-red-500 h-8 w-8 rounded-lg cursor-pointer shrink-0"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>

    </div>
  )
}
