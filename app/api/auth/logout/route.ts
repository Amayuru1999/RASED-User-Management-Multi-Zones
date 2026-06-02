import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import { logoutFromKeycloak } from '@/lib/keycloak'

const SHELL_URL =
  process.env.NEXT_PUBLIC_SHELL_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost'

function noStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}

export async function POST() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)
  const refreshToken = session.refreshToken

  await logoutFromKeycloak(refreshToken)
  session.destroy()

  return noStore(NextResponse.redirect(new URL('/', SHELL_URL), { status: 303 }))
}
