'use client'

import { SharedAppLayout } from 'rased-shared-ui'
import { useAuthStore } from '../store/authStore'

const BASE_PATH = '/users'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const userName = user ? `${user.firstName} ${user.lastName}` : 'test User'

  return (
    <SharedAppLayout userName={userName} logoutHref={`${BASE_PATH}/api/auth/logout`}>
      {children}
    </SharedAppLayout>
  )
}
