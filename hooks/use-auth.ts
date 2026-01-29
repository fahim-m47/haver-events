'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Create client only on client-side
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createClient()
  }, [])

  useEffect(() => {
    if (!supabase) return

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      // Check admin status if user is logged in
      if (session?.user) {
        try {
          const { data } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()
          setIsAdmin(data?.is_admin ?? false)
        } catch {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }

      setLoading(false)
    }

    getInitialSession()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)

        // Check admin status if user is logged in
        if (session?.user) {
          try {
            const { data } = await supabase
              .from('users')
              .select('is_admin')
              .eq('id', session.user.id)
              .single()
            setIsAdmin(data?.is_admin ?? false)
          } catch {
            setIsAdmin(false)
          }
        } else {
          setIsAdmin(false)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = useCallback(() => {
    router.push('/login')
  }, [router])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.refresh()
  }, [supabase, router])

  return {
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
  }
}
