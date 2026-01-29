import { getAllUsers } from '@/actions/admin'
import { UserTable } from '@/components/admin/user-table'

export default async function AdminUsersPage() {
  const users = await getAllUsers()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-zinc-400 mt-1">View and manage all users</p>
      </div>

      <UserTable users={users} />
    </div>
  )
}
