'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Helper: Check if current user is admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from('users')
    .select('is_admin, is_banned')
    .eq('id', user.id)
    .single()

  return data?.is_admin === true && data?.is_banned === false
}

// Get all users (admin only)
export async function getAllUsers() {
  const supabase = await createServerSupabaseClient()

  if (!(await isCurrentUserAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Ban user (admin only)
export async function banUser(userId: string, reason?: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) redirect('/login')
  if (!(await isCurrentUserAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  // Prevent self-ban
  if (userId === currentUser.id) {
    return { error: 'Cannot ban yourself' }
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      is_banned: true,
      banned_at: new Date().toISOString(),
      banned_by: currentUser.id
    })
    .eq('id', userId)

  if (error) {
    console.error('Ban user error:', error)
    return { error: 'Failed to ban user' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { success: true }
}

// Unban user (admin only)
export async function unbanUser(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) redirect('/login')
  if (!(await isCurrentUserAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      is_banned: false,
      banned_at: null,
      banned_by: null
    })
    .eq('id', userId)

  if (error) {
    console.error('Unban user error:', error)
    return { error: 'Failed to unban user' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { success: true }
}

// Grant admin status (admin only)
export async function grantAdminStatus(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) redirect('/login')
  if (!(await isCurrentUserAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_admin: true })
    .eq('id', userId)

  if (error) {
    console.error('Grant admin error:', error)
    return { error: 'Failed to grant admin status' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { success: true }
}

// Revoke admin status (admin only)
export async function revokeAdminStatus(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) redirect('/login')
  if (!(await isCurrentUserAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  // Prevent self-revoke
  if (userId === currentUser.id) {
    return { error: 'Cannot revoke your own admin status' }
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_admin: false })
    .eq('id', userId)

  if (error) {
    console.error('Revoke admin error:', error)
    return { error: 'Failed to revoke admin status' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { success: true }
}

// Get all events for admin (admin only)
export async function getAdminEvents() {
  const supabase = await createServerSupabaseClient()

  if (!(await isCurrentUserAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      creator:users(*)
    `)
    .order('start_time', { ascending: false })

  if (error) throw error
  return data
}

// Admin delete any event
export async function adminDeleteEvent(eventId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!(await isCurrentUserAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  // Get event for image cleanup
  const { data: event } = await supabase
    .from('events')
    .select('image_url')
    .eq('id', eventId)
    .single()

  if (!event) {
    return { error: 'Event not found' }
  }

  // Delete image if exists
  if (event.image_url) {
    const urlParts = event.image_url.split('/event-images/')
    if (urlParts.length > 1) {
      await supabaseAdmin.storage.from('event-images').remove([urlParts[1]])
    }
  }

  // Delete event
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error('Admin delete event error:', error)
    return { error: 'Failed to delete event' }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/events')
  return { success: true }
}
