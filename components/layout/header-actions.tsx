'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { CurrentTime } from './current-time'
import { UserMenu } from '@/components/auth/user-menu'
import { NotificationBell } from './notification-bell'

export function HeaderActions() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <CurrentTime />
        <div className="h-9 w-9 animate-pulse rounded-full bg-white/20" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <CurrentTime />
        <Button
          onClick={signIn}
          variant="ghost"
          className="text-white hover:bg-white/10 hover:text-white"
        >
          Sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <CurrentTime />

      {/* Create Event Link */}
      <Button
        asChild
        variant="ghost"
        className="text-white hover:bg-white/10 hover:text-white"
      >
        <Link href="/events/new" className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <span className="hidden md:inline">Create Event</span>
        </Link>
      </Button>

      {/* Notifications */}
      <NotificationBell />

      {/* User Menu */}
      <UserMenu user={user} onSignOut={signOut} />
    </div>
  )
}
