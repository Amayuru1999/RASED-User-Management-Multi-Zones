import { SessionOptions } from 'iron-session'

export interface RasedUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: RasedRole[]
  department?: string
  stationCode?: string
}

export type RasedRole =
  | 'SUPER_ADMIN'
  | 'EXCISE_OFFICER'
  | 'DATA_ENTRY_OPERATOR'
  | 'AUDITOR'

export interface SessionData {
  accessToken?: string
  refreshToken?: string
  idToken?: string
  accessTokenExpiresAt?: number
  user?: RasedUser
  codeVerifier?: string
  oauthState?: string
  returnUrl?: string
}

const sharedSessionSecret = process.env.SHARED_SESSION_SECRET || process.env.SESSION_SECRET
const sharedSessionCookieName =
  process.env.SHARED_SESSION_COOKIE_NAME || process.env.SESSION_COOKIE_NAME || 'rased_shell_sid'
const sharedSessionCookieDomain =
  process.env.SHARED_SESSION_COOKIE_DOMAIN || process.env.SESSION_COOKIE_DOMAIN

export const SESSION_OPTIONS: SessionOptions = {
  password: sharedSessionSecret!,
  cookieName: sharedSessionCookieName,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: parseInt(process.env.SESSION_MAX_AGE_SECONDS || '3600', 10),
    path: '/',
    ...(sharedSessionCookieDomain ? { domain: sharedSessionCookieDomain } : {}),
  },
}
