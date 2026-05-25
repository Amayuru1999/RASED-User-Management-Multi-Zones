import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import { exchangeCodeForTokens, extractUserFromToken } from '@/lib/keycloak'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost'
const ZONE_URL = process.env.NEXT_PUBLIC_ZONE_URL || `${GATEWAY_URL}/users`
const SHELL_URL = process.env.NEXT_PUBLIC_SHELL_URL || GATEWAY_URL

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(error)}`, SHELL_URL))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/error?message=Invalid+callback+parameters', SHELL_URL))
  }

  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)

  if (session.oauthState !== state) {
    return NextResponse.redirect(new URL('/error?message=Invalid+OAuth+state', SHELL_URL))
  }

  if (!session.codeVerifier) {
    return NextResponse.redirect(new URL('/error?message=Missing+code+verifier', SHELL_URL))
  }

  try {
    const redirectUri = `${ZONE_URL}/api/auth/callback`
    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier: session.codeVerifier,
      redirectUri,
    })

    session.accessToken = tokens.access_token
    session.refreshToken = tokens.refresh_token
    // Omit idToken to prevent "Cookie length is too big" error
    session.accessTokenExpiresAt = Date.now() + tokens.expires_in * 1000
    session.user = extractUserFromToken(tokens.access_token)
    session.codeVerifier = undefined
    session.oauthState = undefined

    const returnUrl = session.returnUrl || '/users'
    session.returnUrl = undefined

    await session.save()

    // Redirect relative to the shell routing
    return NextResponse.redirect(new URL(returnUrl, SHELL_URL))
  } catch (err) {
    console.error('[Auth Callback] Token exchange error:', err)
    return NextResponse.redirect(new URL('/error?message=Authentication+failed', SHELL_URL))
  }
}
