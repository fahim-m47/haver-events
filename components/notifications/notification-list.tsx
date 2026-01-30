'use client'

import { Bell } from 'lucide-react'
import { NotificationItem } from './notification-item'
import type { NotificationWithEvent } from '@/types'

interface NotificationListProps {
  notifications: NotificationWithEvent[]
}

export function NotificationList({ notifications }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-zinc-800 p-4 mb-4">
          <Bell className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-100">No notifications yet</h3>
        <p className="text-sm text-zinc-500 mt-1 max-w-sm">
          Save events to receive updates from hosts. When a host posts an update, you&apos;ll see it
          here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
