import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Users, Calendar, Shield } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  // Get stats
  const [usersResult, eventsResult, adminsResult, bannedResult] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_admin', true),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_banned', true),
  ])

  const stats = [
    {
      label: 'Total Users',
      value: usersResult.count ?? 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Total Events',
      value: eventsResult.count ?? 0,
      icon: Calendar,
      color: 'text-green-500',
    },
    {
      label: 'Admins',
      value: adminsResult.count ?? 0,
      icon: Shield,
      color: 'text-purple-500',
    },
    {
      label: 'Banned Users',
      value: bannedResult.count ?? 0,
      icon: Users,
      color: 'text-red-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="text-zinc-400 mt-1">Monitor and manage your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-lg bg-zinc-800', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
