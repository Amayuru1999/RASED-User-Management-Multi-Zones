import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)

  if (!session.accessToken || !session.user) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }

  // Return ONLY metadata — never the actual JWT tokens
  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      roles: session.user.roles,
      department: session.user.department,
      stationCode: session.user.stationCode,
    },
    expiresAt: session.accessTokenExpiresAt,
  })
}
