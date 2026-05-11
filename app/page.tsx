'use client'

import { useEffect } from 'react'
import { useUserManagementStore } from '@/store/userManagementStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Search, Filter, Plus, Edit2, ShieldAlert, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function UserManagement() {
  const {
    users,
    filters,
    isLoading,
    setUsers,
    setLoading,
    setFilters,
  } = useUserManagementStore()

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams({
          search: filters.search,
          status: filters.status,
          role: filters.role,
          page: filters.page.toString(),
          pageSize: filters.pageSize.toString(),
        })

        const response = await fetch(`/users/api/users?${queryParams}`)
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Failed to fetch users', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [filters, setLoading, setUsers])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value, page: 1 })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-primary" />
            User Management
          </h1>
          <p className="text-slate-500 mt-2">
            Manage system users, roles, and access permissions.
          </p>
        </div>
        <Link 
          href="/new"
          className="flex items-center px-5 py-2.5 bg-[#1e90ff] text-white font-medium rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New User
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg font-medium text-slate-700">User Directory</CardTitle>
            
            <div className="flex items-center w-full sm:w-auto gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary border-transparent"
                  value={filters.search}
                  onChange={handleSearch}
                />
              </div>
              <button className="p-2 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Department</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      <div className="flex items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="bg-white border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium mr-3">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                            <div className="text-slate-500 text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(role => (
                            <span key={role} className="px-2 py-1 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200 flex items-center">
                              {role === 'SUPER_ADMIN' && <ShieldAlert className="h-3 w-3 mr-1" />}
                              {role.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          user.status === 'INACTIVE' ? 'bg-slate-100 text-slate-800' :
                          user.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {user.department || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/${user.id}`} 
                            className="inline-flex items-center p-2 text-slate-500 hover:text-[#1e90ff] hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 font-medium text-xs"
                          >
                            <Eye className="h-4 w-4 mr-1.5" /> View
                          </Link>
                          <button className="inline-flex items-center p-2 text-slate-500 hover:text-accent hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100 font-medium text-xs">
                            <Edit2 className="h-4 w-4 mr-1.5" /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{users.length}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={filters.page === 1}
                onClick={() => setFilters({ page: filters.page - 1 })}
                className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-slate-600 font-medium rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </button>
              <div className="flex items-center px-3 py-1.5 border border-slate-200 bg-white font-semibold text-slate-700 rounded-lg text-sm shadow-sm">
                {filters.page}
              </div>
              <button 
                onClick={() => setFilters({ page: filters.page + 1 })}
                className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors shadow-sm"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
