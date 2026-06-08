import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from './lib/session'
import { refreshAccessTokenForEdge } from './lib/edgeSessionRefresh'

const sharedSessionSecret = process.env.SHARED_SESSION_SECRET || process.env.SESSION_SECRET
const sharedSessionCookieName =
  process.env.SHARED_SESSION_COOKIE_NAME || process.env.SESSION_COOKIE_NAME || 'rased_shell_sid'
const sharedSessionCookieDomain =
  process.env.SHARED_SESSION_COOKIE_DOMAIN || process.env.SESSION_COOKIE_DOMAIN

const SESSION_OPTIONS = {
  password: sharedSessionSecret!,
  cookieName: sharedSessionCookieName,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: parseInt(process.env.SESSION_MAX_AGE_SECONDS || '3600', 10),
    path: '/',
    ...(sharedSessionCookieDomain ? { domain: sharedSessionCookieDomain } : {}),
  },
}

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/api/auth/session',
  '/_next',
  '/favicon.ico',
]

const BASE_PATH = '/users'

function removeBasePath(pathname: string) {
  if (!pathname.startsWith(BASE_PATH)) {
    return pathname
  }

  return pathname.slice(BASE_PATH.length) || '/'
}

function withBasePath(pathname: string) {
  if (pathname === '/') {
    return BASE_PATH
  }

  return pathname.startsWith(BASE_PATH) ? pathname : `${BASE_PATH}${pathname}`
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_OPTIONS.cookieName, '', {
    ...SESSION_OPTIONS.cookieOptions,
    maxAge: 0,
  })
  return response
}

function noStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    return NextResponse.redirect(new URL(BASE_PATH, request.url))
  }

  const zonePathname = removeBasePath(pathname)

  if (PUBLIC_PATHS.some((p) => zonePathname.startsWith(p))) {
    return NextResponse.next()
  }

  const isApi = zonePathname.startsWith('/api/') && !PUBLIC_PATHS.some((p) => zonePathname.startsWith(p))
  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, SESSION_OPTIONS)

  if (!session.accessToken) {
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL(`${BASE_PATH}/api/auth/login`, request.url)
    const returnPath = withBasePath(pathname)
    loginUrl.searchParams.set('returnUrl', returnPath)
    return NextResponse.redirect(loginUrl)
  }

  const now = Date.now()
  const expiresAt = session.accessTokenExpiresAt || 0
  const twoMinutes = 2 * 60 * 1000

  if (expiresAt - now < twoMinutes) {
    const refreshed = await refreshAccessTokenForEdge(session)
    if (!refreshed) {
      if (isApi) {
        return clearSessionCookie(NextResponse.json({ error: 'Session expired' }, { status: 401 }))
      }
      const loginUrl = new URL(`${BASE_PATH}/api/auth/login`, request.url)
      const returnPath = withBasePath(pathname)
      loginUrl.searchParams.set('returnUrl', returnPath)
      return clearSessionCookie(NextResponse.redirect(loginUrl))
    }
    await session.save()
  }

  return noStore(response)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
