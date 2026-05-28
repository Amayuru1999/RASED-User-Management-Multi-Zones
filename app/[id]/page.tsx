'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ShieldAlert, Mail, Phone, CreditCard, Building, Edit2, Key, History } from 'lucide-react'
import type { User } from '@/lib/userTypes'

export default function UserDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/users/api/users/${id}`)
        if (response.ok) {
          const data = await response.json()
          setUser(data)
        }
      } catch (error) {
        console.error('Failed to fetch user', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800">User not found</h2>
        <button onClick={() => router.push('/')} className="mt-4 text-primary hover:underline">
          Return to directory
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-3 sm:gap-4">
        <button 
          onClick={() => router.push('/')}
          className="p-2 bg-white text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">User Profile</h1>
          <p className="text-slate-500">View and manage details for {user.firstName} {user.lastName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Summary */}
        <Card className="lg:col-span-1 shadow-sm border-slate-200/60 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[#1e3a5f] to-[#2a5082]"></div>
          <CardContent className="pt-0 relative px-6 pb-6">
            <div className="absolute -top-16 left-6 h-24 w-24 rounded-2xl bg-white p-1 shadow-md">
              <div className="h-full w-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-[#1e3a5f]">
                {user.firstName[0]}{user.lastName[0]}
              </div>
            </div>
            
            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-900">{user.firstName} {user.lastName}</h2>
                <p className="text-slate-500 font-medium">@{user.username}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                user.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                user.status === 'INACTIVE' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                user.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}>
                {user.status}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {user.roles.map(role => (
                <span key={role} className="px-3 py-1.5 text-xs font-bold bg-[#e6effb] text-[#1e3a5f] rounded-lg border border-blue-200 flex items-center shadow-sm">
                  {role === 'SUPER_ADMIN' && <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-accent" />}
                  {role.replace('_', ' ')}
                </span>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start text-slate-600">
                <Mail className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-slate-400" />
                <span className="min-w-0 break-words text-sm font-medium">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-start text-slate-600">
                  <Phone className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-slate-400" />
                  <span className="min-w-0 break-words text-sm font-medium">{user.phone}</span>
                </div>
              )}
              {user.nic && (
                <div className="flex items-start text-slate-600">
                  <CreditCard className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-slate-400" />
                  <span className="min-w-0 break-words text-sm font-medium">NIC: {user.nic}</span>
                </div>
              )}
              {user.department && (
                <div className="flex items-start text-slate-600">
                  <Building className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-slate-400" />
                  <span className="min-w-0 break-words text-sm font-medium">{user.department}</span>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
              <button className="flex-1 flex justify-center items-center py-2.5 px-4 bg-[#1e90ff] hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-sm active:scale-[0.98]">
                <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Details & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200/60">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <ShieldAlert className="h-5 w-5 mr-2 text-[#c8902a]" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">Password</h3>
                    <p className="text-sm text-slate-500 mt-1">Last changed 45 days ago</p>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm flex items-center justify-center">
                    <Key className="h-4 w-4 mr-2" /> Reset Password
                  </button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-slate-500 mt-1">Currently enabled via Authenticator App</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold text-xs rounded-lg border border-green-200">
                    ENABLED
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200/60">
            <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <History className="h-5 w-5 mr-2 text-[#1e90ff]" />
                Recent Activity
              </CardTitle>
              <button className="text-sm text-[#1e90ff] font-medium hover:underline">View All</button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {[
                  { action: 'Logged in successfully', time: '2 hours ago', ip: '192.168.1.1' },
                  { action: 'Updated License #LIC-2026-001', time: '1 day ago', ip: '192.168.1.1' },
                  { action: 'Exported User Report', time: '3 days ago', ip: '192.168.1.45' },
                ].map((log, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm">{log.action}</p>
                      <p className="text-xs text-slate-500 mt-1">IP: {log.ip}</p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
