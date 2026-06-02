import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import {
  generateRandomString,
  generateCodeChallenge,
  buildAuthorizationUrl,
} from '@/lib/keycloak'
import { sanitizeReturnUrl } from '@/lib/authRedirect'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost'
const ZONE_URL = process.env.NEXT_PUBLIC_ZONE_URL || `${GATEWAY_URL}/users`

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)
  const returnUrl = sanitizeReturnUrl(request.nextUrl.searchParams.get('returnUrl'), '/users')

  if (session.accessToken && session.user && (session.accessTokenExpiresAt || 0) > Date.now()) {
    return NextResponse.redirect(new URL(returnUrl, GATEWAY_URL))
  }

  session.accessToken = undefined
  session.refreshToken = undefined
  session.idToken = undefined
  session.accessTokenExpiresAt = undefined
  session.user = undefined

  const codeVerifier = generateRandomString(64)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(32)

  session.codeVerifier = codeVerifier
  session.oauthState = state
  session.returnUrl = returnUrl
  await session.save()

  const redirectUri = `${ZONE_URL}/api/auth/callback`
  const authUrl = buildAuthorizationUrl({ codeChallenge, state, redirectUri })

  return NextResponse.redirect(authUrl)
}
