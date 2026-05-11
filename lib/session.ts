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

export const SESSION_OPTIONS: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: process.env.SESSION_COOKIE_NAME || 'rased_shell_sid',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: parseInt(process.env.SESSION_MAX_AGE_SECONDS || '3600', 10),
    path: '/',
  },
}
