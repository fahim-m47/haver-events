'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { MoreHorizontal, Shield, ShieldOff, Ban, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { banUser, unbanUser, grantAdminStatus, revokeAdminStatus } from '@/actions/admin'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<'ban' | 'unban' | 'grantAdmin' | 'revokeAdmin' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async () => {
    if (!selectedUser || !actionType) return

    setIsLoading(true)
    try {
      switch (actionType) {
        case 'ban':
          await banUser(selectedUser.id)
          break
        case 'unban':
          await unbanUser(selectedUser.id)
          break
        case 'grantAdmin':
          await grantAdminStatus(selectedUser.id)
          break
        case 'revokeAdmin':
          await revokeAdminStatus(selectedUser.id)
          break
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setIsLoading(false)
      setSelectedUser(null)
      setActionType(null)
    }
  }

  const getDialogContent = () => {
    if (!selectedUser || !actionType) return { title: '', description: '' }

    const actions = {
      ban: {
        title: 'Ban User',
        description: `Are you sure you want to ban ${selectedUser.email}? They will be signed out and unable to access the app.`,
      },
      unban: {
        title: 'Unban User',
        description: `Are you sure you want to unban ${selectedUser.email}? They will be able to sign in again.`,
      },
      grantAdmin: {
        title: 'Grant Admin Status',
        description: `Are you sure you want to make ${selectedUser.email} an admin? They will have full control over users and events.`,
      },
      revokeAdmin: {
        title: 'Revoke Admin Status',
        description: `Are you sure you want to remove admin status from ${selectedUser.email}?`,
      },
    }

    return actions[actionType]
  }

  const dialogContent = getDialogContent()

  return (
    <>
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-900">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-zinc-400">User</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-zinc-400 hidden sm:table-cell">Joined</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-zinc-400">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{user.name || 'Unknown'}</p>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400 hidden sm:table-cell">
                  {format(new Date(user.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.is_admin && (
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Admin
                      </Badge>
                    )}
                    {user.is_banned && (
                      <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                        Banned
                      </Badge>
                    )}
                    {!user.is_admin && !user.is_banned && (
                      <Badge variant="outline" className="text-zinc-400 border-zinc-700">
                        User
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.is_admin ? (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            setActionType('revokeAdmin')
                          }}
                          className="text-orange-400"
                        >
                          <ShieldOff className="mr-2 h-4 w-4" />
                          Remove Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            setActionType('grantAdmin')
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {user.is_banned ? (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            setActionType('unban')
                          }}
                          className="text-green-400"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Unban User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            setActionType('ban')
                          }}
                          className="text-red-400"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Ban User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!selectedUser && !!actionType} onOpenChange={() => { setSelectedUser(null); setActionType(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogContent.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
