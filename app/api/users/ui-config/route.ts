import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import { hasPermission } from '@/lib/rbac'
import { DEFAULT_USER_DIRECTORY_UI_CONFIG } from '@/lib/userDirectoryUiConfig'

export async function GET() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)

  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasPermission(session.user.roles, 'users:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json(DEFAULT_USER_DIRECTORY_UI_CONFIG)
  }

  try {
    const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1'
    const backendResponse = await fetch(`${BACKEND_URL}/users/ui-config`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    if (!backendResponse.ok) {
      throw new Error('Backend error')
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user directory UI config' }, { status: 500 })
  }
}
