'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { Building, ShieldAlert, Users } from 'lucide-react'

const NAV_ITEMS = [
  { name: 'User Directory', href: '/', icon: Users },
  { name: 'Roles & Permissions', href: '/roles', icon: ShieldAlert },
  { name: 'Departments', href: '/departments', icon: Building },
]

function normalizePath(pathname: string): string {
  if (!pathname) {
    return '/'
  }

  if (pathname === '/users') {
    return '/'
  }

  if (pathname.startsWith('/users/')) {
    return pathname.replace('/users', '')
  }

  return pathname
}

export function UserManagementNavbar() {
  const pathname = usePathname()
  const normalizedPath = normalizePath(pathname || '/')

  return (
    <nav className="grid grid-cols-1 gap-2 rounded-2xl border border-blue-100 bg-white/80 p-2 shadow-sm sm:flex sm:flex-wrap sm:items-center">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive =
          normalizedPath === item.href ||
          (item.href !== '/' && normalizedPath.startsWith(item.href))

        return (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:justify-start',
              isActive
                ? 'bg-blue-50 text-[#1e90ff] border border-blue-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent',
            )}
          >
            <Icon className={clsx('mr-2 h-4 w-4', isActive ? 'text-[#1e90ff]' : 'text-slate-400')} />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
