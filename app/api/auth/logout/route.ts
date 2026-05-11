import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import { buildLogoutUrl } from '@/lib/keycloak'

const SHELL_URL = process.env.NEXT_PUBLIC_SHELL_URL || 'http://localhost:3000'

export async function GET() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)

  session.destroy()

  const logoutUrl = buildLogoutUrl(`${SHELL_URL}/`)
  return NextResponse.redirect(logoutUrl)
}
