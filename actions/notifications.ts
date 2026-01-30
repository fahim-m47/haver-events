'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { NotificationWithEvent } from '@/types'

// Get all notifications for current user (blasts from favorited events)
export async function getNotifications(): Promise<NotificationWithEvent[]> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // First, get the user's favorited event IDs
  const { data: favorites, error: favError } = await supabase
    .from('favorites')
    .select('event_id')
    .eq('user_id', user.id)

  if (favError) {
    console.error('Error fetching favorites:', favError)
    return []
  }

  const favoritedEventIds = favorites.map((f) => f.event_id)

  // If no favorited events, return empty
  if (favoritedEventIds.length === 0) {
    return []
  }

  // Get blasts from favorited events
  const { data, error } = await supabase
    .from('blasts')
    .select(`
      *,
      creator:users(*),
      event:events!inner(id, title)
    `)
    .in('event_id', favoritedEventIds)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data as unknown as NotificationWithEvent[]
}

// Mark all notifications as seen (update last_read_at)
export async function markNotificationsAsSeen(): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  // Upsert notification_reads record
  const { error } = await supabase
    .from('notification_reads')
    .upsert(
      {
        user_id: user.id,
        last_read_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )

  if (error) {
    console.error('Error marking notifications as seen:', error)
  }

  revalidatePath('/notifications')
}

// Check if user has unseen notifications
export async function hasUnseenNotifications(): Promise<boolean> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  // First, get the user's favorited event IDs
  const { data: favorites, error: favError } = await supabase
    .from('favorites')
    .select('event_id')
    .eq('user_id', user.id)

  if (favError) {
    console.error('Error fetching favorites:', favError)
    return false
  }

  const favoritedEventIds = favorites.map((f) => f.event_id)

  // If no favorited events, no notifications
  if (favoritedEventIds.length === 0) {
    return false
  }

  // Get user's last read timestamp
  const { data: readData } = await supabase
    .from('notification_reads')
    .select('last_read_at')
    .eq('user_id', user.id)
    .single()

  const lastReadAt = readData?.last_read_at || '1970-01-01T00:00:00Z'

  // Check if there are any blasts from favorited events created after last_read_at
  const { data: unreadBlasts, error } = await supabase
    .from('blasts')
    .select('id')
    .in('event_id', favoritedEventIds)
    .gt('created_at', lastReadAt)
    .limit(1)

  if (error) {
    console.error('Error checking unseen notifications:', error)
    return false
  }

  return (unreadBlasts?.length ?? 0) > 0
}

// Get favorited event IDs for the current user (for real-time subscription)
export async function getFavoritedEventIdsForNotifications(): Promise<string[]> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('favorites')
    .select('event_id')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching favorited event IDs:', error)
    return []
  }

  return data.map((f) => f.event_id)
}
