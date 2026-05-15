import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import { hasPermission } from '@/lib/rbac'
import { getUserById } from '@/lib/userRepository'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)

  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasPermission(session.user.roles, 'users:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  try {
    const user = await getUserById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json(user, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user from database' }, { status: 500 })
  }
}
