import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { SessionData, SESSION_OPTIONS } from './lib/session'
import { refreshAccessToken } from './lib/keycloak'

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
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
    const refreshed = await refreshAccessToken(session)
    if (!refreshed) {
      session.destroy()
      if (isApi) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }
      const loginUrl = new URL(`${BASE_PATH}/api/auth/login`, request.url)
      const returnPath = withBasePath(pathname)
      loginUrl.searchParams.set('returnUrl', returnPath)
      return NextResponse.redirect(loginUrl)
    }
    await session.save()
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
