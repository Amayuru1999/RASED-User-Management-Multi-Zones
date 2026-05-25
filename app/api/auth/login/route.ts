import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import {
  generateRandomString,
  generateCodeChallenge,
  buildAuthorizationUrl,
} from '@/lib/keycloak'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost'
const ZONE_URL = process.env.NEXT_PUBLIC_ZONE_URL || `${GATEWAY_URL}/users`

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)

  const codeVerifier = generateRandomString(64)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(32)

  session.codeVerifier = codeVerifier
  session.oauthState = state
  session.returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/users'
  await session.save()

  const redirectUri = `${ZONE_URL}/api/auth/callback`
  const authUrl = buildAuthorizationUrl({ codeChallenge, state, redirectUri })

  return NextResponse.redirect(authUrl)
}
