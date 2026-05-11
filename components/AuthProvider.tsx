'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '../store/authStore'

const BASE_PATH = '/users'

function normalizeReturnUrl(pathname: string) {
  const duplicatedBasePath = `${BASE_PATH}${BASE_PATH}`

  while (pathname.startsWith(duplicatedBasePath)) {
    pathname = pathname.slice(BASE_PATH.length)
  }

  return pathname || BASE_PATH
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser, setLoading, isLoading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${BASE_PATH}/api/auth/session`)
        
        if (!res.ok) {
          throw new Error('Session fetch failed')
        }
        
        const data = await res.json()

        if (data.authenticated && data.user) {
          setUser(data.user)
        } else {
          clearUser()
          // Enforce redirect for all paths, not just non-root paths
          if (!pathname.startsWith('/api/auth')) {
            const returnUrl = normalizeReturnUrl(window.location.pathname)
            router.push(`/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`)
          }
        }
      } catch (err) {
        console.error('Session check failed', err)
        clearUser()
        // Ensure we still redirect on error so the user isn't stuck in a broken state
        if (!pathname.startsWith('/api/auth')) {
          const returnUrl = normalizeReturnUrl(window.location.pathname)
          router.push(`/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`)
        }
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [pathname, router, setUser, clearUser, setLoading])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium text-slate-600">Verifying session...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
