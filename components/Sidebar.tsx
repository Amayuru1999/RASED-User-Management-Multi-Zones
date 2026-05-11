'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { ChevronDown, ChevronRight, Users, ShieldAlert, Building, FileKey, ClipboardList, CheckSquare, Package, Layers } from 'lucide-react'

const NAV_ITEMS = [
  { 
    name: 'User Management', 
    href: '/users',
    subItems: [
      { name: 'User Directory', href: '/users', icon: Users },
      { name: 'Roles & Permissions', href: '/users/roles', icon: ShieldAlert },
      { name: 'Departments', href: '/users/departments', icon: Building },
      { name: 'Audit Logs', href: '/users/audit', icon: FileKey },
    ]
  },
  { 
    name: 'License Management', 
    href: '/licenses',
    subItems: [
      { name: 'License Dashboard', href: '/licenses', icon: ClipboardList },
      { name: 'Applications', href: '/licenses/applications', icon: CheckSquare },
    ]
  },
  { 
    name: 'Product and Raw Material Management', 
    href: '/production',
    subItems: [
      { name: 'Production Dashboard', href: '/production', icon: Package },
      { name: 'Raw Materials', href: '/production/materials', icon: Layers },
    ]
  },
]

export function Sidebar() {
  const [currentPath] = useState(() => (
    typeof window === 'undefined' ? '' : window.location.pathname
  ))
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const path = typeof window === 'undefined' ? '' : window.location.pathname

    return {
      'User Management': path ? path.startsWith('/users') : true,
      'License Management': path ? path.startsWith('/licenses') : true,
      'Product and Raw Material Management': path ? path.startsWith('/production') : true,
    }
  })

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }))
  }

  return (
    <aside className="w-80 flex-shrink-0 p-6 flex flex-col gap-4 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        return (
          <div key={item.name} className="flex flex-col gap-2">
            <div className="w-full flex items-center justify-between rounded-xl border-2 shadow-sm bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md transition-all overflow-hidden group">
              <a 
                href={item.href} 
                className="flex-1 px-5 py-4 text-left text-lg font-bold group-hover:text-[#1e90ff] transition-colors"
              >
                {item.name}
              </a>
              <button 
                onClick={() => toggleMenu(item.name)} 
                className="px-4 py-4 hover:bg-slate-50 flex items-center justify-center border-l border-slate-100 transition-colors"
                aria-label={`Toggle ${item.name}`}
              >
                {openMenus[item.name] ? (
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                )}
              </button>
            </div>

            {/* Foldable Sub-menu */}
            {item.subItems && openMenus[item.name] && (
              <div className="flex flex-col gap-1.5 mt-1 ml-2 pl-4 border-l-2 border-slate-200/60 animate-in slide-in-from-top-2 fade-in duration-200">
                {item.subItems.map(subItem => {
                  const isSubActive = currentPath === subItem.href || (subItem.href !== item.href && currentPath.startsWith(subItem.href))
                  const Icon = subItem.icon

                  return (
                    <a
                      key={subItem.name}
                      href={subItem.href}
                      className={clsx(
                        'flex items-center px-4 py-3 rounded-lg font-medium transition-all text-sm',
                        isSubActive
                          ? 'bg-blue-50 text-[#1e90ff] shadow-sm font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <Icon className={clsx('h-4 w-4 mr-3', isSubActive ? 'text-[#1e90ff]' : 'text-slate-400')} />
                      {subItem.name}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      
      {/* Dashed placeholder buttons as shown in wireframe */}
      <div className="w-full h-16 border-2 border-dashed border-slate-400 rounded-xl bg-transparent mt-4 opacity-70" />
      <div className="w-full h-16 border-2 border-dashed border-slate-400 rounded-xl bg-transparent opacity-70" />
    </aside>
  )
}
