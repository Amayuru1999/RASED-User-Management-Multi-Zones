import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import { hasPermission } from '@/lib/rbac'
import { DEFAULT_USER_DIRECTORY_UI_CONFIG, type UserDirectoryUiConfig } from '@/lib/userDirectoryUiConfig'

export async function getUserDirectoryUiConfig(): Promise<UserDirectoryUiConfig> {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)

  if (!session.user) {
    return DEFAULT_USER_DIRECTORY_UI_CONFIG
  }

  if (!hasPermission(session.user.roles, 'users:read')) {
    return DEFAULT_USER_DIRECTORY_UI_CONFIG
  }

  const backendUrl = process.env.BACKEND_API_URL

  if (!backendUrl) {
    return DEFAULT_USER_DIRECTORY_UI_CONFIG
  }

  try {
    const backendResponse = await fetch(`${backendUrl.replace(/\/$/, '')}/users/ui-config`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`)
    }

    return (await backendResponse.json()) as UserDirectoryUiConfig
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Falling back to default user directory UI config', error)
    }

    return DEFAULT_USER_DIRECTORY_UI_CONFIG
  }
}
