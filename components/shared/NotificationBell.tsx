'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  title: string
  body: string
  read: boolean
  created_at: string
}

interface NotificationBellProps {
  userId: string | null
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!userId) return

    const fetchNotifications = async () => {
      try {
        const { data } = await (supabase
          .from('notifications') as any)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (data) {
          setNotifications(data)
        }
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }

    fetchNotifications()

    // Realtime Postgres Changes Subscription
    const channel = supabase
      .channel(`notifications-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification
          setNotifications((prev) => [newNotif, ...prev.slice(0, 9)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleToggle = async () => {
    setIsOpen(!isOpen)
    if (!isOpen && notifications.some((n) => !n.read)) {
      await handleMarkAllAsRead()
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!userId) return
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return

    try {
      await (supabase
        .from('notifications') as any)
        .update({ read: true })
        .in('id', unreadIds)

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="text-gray-500 hover:text-rose-500 relative min-h-[44px] min-w-[44px] cursor-pointer"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-rose-50 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-rose-50 flex items-center justify-between">
            <span className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">Notifikasi</span>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full font-extrabold">
                {unreadCount} baru
              </span>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8 font-semibold">Tidak ada notifikasi baru</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-rose-50/50 hover:bg-rose-50/20 transition-colors ${
                    !n.read ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <h4 className="text-xs font-bold text-gray-800">{n.title}</h4>
                  <p className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed">{n.body}</p>
                  <span className="text-[9px] text-gray-400 font-semibold block mt-1">
                    {new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
