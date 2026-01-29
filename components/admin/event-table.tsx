'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { MoreHorizontal, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { adminDeleteEvent } from '@/actions/admin'
import type { EventWithCreator } from '@/types'

interface EventTableProps {
  events: EventWithCreator[]
}

export function EventTable({ events }: EventTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventWithCreator | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!selectedEvent) return

    setIsLoading(true)
    try {
      await adminDeleteEvent(selectedEvent.id)
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsLoading(false)
      setSelectedEvent(null)
    }
  }

  return (
    <>
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-900">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-zinc-400">Event</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-zinc-400 hidden sm:table-cell">Creator</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-zinc-400 hidden md:table-cell">Date</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium line-clamp-1">{event.title}</p>
                    <p className="text-sm text-zinc-400 line-clamp-1">{event.location}</p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <p className="text-sm text-zinc-400">{event.creator?.email || 'Unknown'}</p>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell">
                  {format(new Date(event.start_time), 'MMM d, yyyy h:mm a')}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/events/${event.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Event
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSelectedEvent(event)}
                        className="text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && (
          <div className="py-12 text-center text-zinc-400">
            No events found
          </div>
        )}
      </div>

      <AlertDialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedEvent?.title}&quot;? This action cannot be undone.
              The event and all associated data (favorites, blasts) will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
