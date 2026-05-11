'use client'

import { useAuthStore } from '../store/authStore'
import { LogOut } from 'lucide-react'

const BASE_PATH = '/users'

export function Header() {
  const { user } = useAuthStore()
  
  const userName = user ? `${user.firstName} ${user.lastName}` : 'test User'

  return (
    <header className="w-full bg-white pt-6 pb-4 px-8 border-b-2 border-slate-300">
      <div className="flex flex-col max-w-[1600px] mx-auto w-full">
        {/* Top welcome text */}
        <div className="text-slate-600 font-medium text-sm mb-2">
          Welcome {userName}!
        </div>
        
        {/* Main Header row */}
        <div className="flex items-end justify-between">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            RASED - Web Application
          </h1>
          
          <a
            href={`${BASE_PATH}/api/auth/logout`}
            className="group flex items-center text-lg font-medium text-slate-800 hover:text-red-600 transition-colors"
          >
            Log out
            <LogOut className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </header>
  )
}
