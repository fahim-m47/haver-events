import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getNotifications, markNotificationsAsSeen } from '@/actions/notifications'
import { NotificationList } from '@/components/notifications'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch notifications and mark as seen
  const [notifications] = await Promise.all([getNotifications(), markNotificationsAsSeen()])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Updates from events you&apos;ve saved
        </p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  )
}
