'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  hasUnseenNotifications,
  getFavoritedEventIdsForNotifications,
} from '@/actions/notifications'

export function NotificationBell() {
  const [hasUnseen, setHasUnseen] = useState(false)
  const [favoritedEventIds, setFavoritedEventIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const isOnNotificationsPage = pathname === '/notifications'

  // Fetch initial state
  const fetchInitialState = useCallback(async () => {
    try {
      const [unseenResult, eventIds] = await Promise.all([
        hasUnseenNotifications(),
        getFavoritedEventIdsForNotifications(),
      ])
      setHasUnseen(unseenResult)
      setFavoritedEventIds(eventIds)
    } catch (error) {
      console.error('Error fetching notification state:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refetch when pathname changes (to detect navigation to/from notifications)
  useEffect(() => {
    fetchInitialState()
  }, [pathname, fetchInitialState])

  // Set up real-time subscription
  useEffect(() => {
    // If no favorited events, no need to subscribe
    if (favoritedEventIds.length === 0) return

    const supabase = createClient()

    // Subscribe to new blasts on favorited events
    const channel = supabase
      .channel('notification-blasts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blasts',
        },
        (payload) => {
          // Check if the new blast is for a favorited event
          if (favoritedEventIds.includes(payload.new.event_id as string)) {
            setHasUnseen(true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [favoritedEventIds])

  // Don't show anything while loading to avoid flash
  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
        disabled
      >
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative text-white hover:bg-white/10 hover:text-white"
      aria-label="Notifications"
    >
      <Link href="/notifications">
        <Bell className="h-5 w-5" />
        {hasUnseen && !isOnNotificationsPage && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-black" />
        )}
      </Link>
    </Button>
  )
}
