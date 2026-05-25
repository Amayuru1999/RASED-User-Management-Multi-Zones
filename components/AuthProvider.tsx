'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
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
  const { setUser, clearUser, setLoading } = useAuthStore()
  const pathname = usePathname()

  useEffect(() => {
    const controller = new AbortController()

    const checkSession = async () => {
      try {
        const timeoutId = window.setTimeout(() => controller.abort(), 8000)

        const res = await fetch(`${BASE_PATH}/api/auth/session`, {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        window.clearTimeout(timeoutId)

        if (!res.ok) {
          throw new Error(`Session fetch failed with status ${res.status}`)
        }

        const data = await res.json()

        if (data.authenticated && data.user) {
          setUser(data.user)
        } else {
          clearUser()
          if (!pathname.startsWith('/api/auth')) {
            const returnUrl = normalizeReturnUrl(window.location.pathname)
            window.location.assign(`/users/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`)
          }
        }
      } catch (err) {
        console.error('Session check failed', err)
        clearUser()
        if (!pathname.startsWith('/api/auth')) {
          const returnUrl = normalizeReturnUrl(window.location.pathname)
          window.location.assign(`/users/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`)
        }
      } finally {
        setLoading(false)
      }
    }

    checkSession()
    return () => controller.abort()
  }, [pathname, setUser, clearUser, setLoading])

  return <>{children}</>
}
