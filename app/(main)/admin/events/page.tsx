import { getAdminEvents } from '@/actions/admin'
import { EventTable } from '@/components/admin/event-table'

export default async function AdminEventsPage() {
  const events = await getAdminEvents()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Event Management</h2>
        <p className="text-zinc-400 mt-1">View and manage all events</p>
      </div>

      <EventTable events={events} />
    </div>
  )
}
