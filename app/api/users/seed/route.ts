import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import { hasPermission } from '@/lib/rbac'
import { seedUsers } from '@/lib/userRepository'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)

  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasPermission(session.user.roles, 'users:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let force = false
  try {
    const payload = await request.json()
    force = Boolean(payload?.force)
  } catch {
    force = false
  }

  try {
    const result = await seedUsers(force)
    return NextResponse.json({
      message: force ? 'Users reseeded successfully' : 'Users seeded successfully',
      inserted: result.inserted,
      total: result.total,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to seed users' }, { status: 500 })
  }
}
