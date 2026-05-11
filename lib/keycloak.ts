import { SessionData } from './session'

const KEYCLOAK_URL = process.env.KEYCLOAK_URL!
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM!
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID!
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET!

/** Generate a cryptographically secure random string */
export function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => charset[byte % charset.length]).join('')
}

/** Generate PKCE S256 code challenge from verifier */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Buffer.from(digest).toString('base64url')
}

/** Decode JWT payload without verification (server-side use only) */
export function decodeJwt(token: string): Record<string, unknown> {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT')
  const payload = Buffer.from(parts[1], 'base64url').toString('utf-8')
  return JSON.parse(payload)
}

/** Extract RASED user info from Keycloak access token */
export function extractUserFromToken(accessToken: string) {
  const payload = decodeJwt(accessToken) as {
    sub?: string
    preferred_username?: string
    email?: string
    given_name?: string
    family_name?: string
    realm_access?: { roles?: string[] }
    department?: string
    station_code?: string
  }

  const RASED_ROLES = ['SUPER_ADMIN', 'EXCISE_OFFICER', 'DATA_ENTRY_OPERATOR', 'AUDITOR']
  const allRoles = payload.realm_access?.roles || []
  const rasedRoles = allRoles.filter((r) => RASED_ROLES.includes(r)) as SessionData['user'] extends undefined ? never : NonNullable<SessionData['user']>['roles']

  return {
    id: payload.sub || '',
    username: payload.preferred_username || '',
    email: payload.email || '',
    firstName: payload.given_name || '',
    lastName: payload.family_name || '',
    roles: rasedRoles,
    department: payload.department as string | undefined,
    stationCode: payload.station_code as string | undefined,
  }
}

/** Build the Keycloak authorization URL for PKCE flow */
export function buildAuthorizationUrl(params: {
  codeChallenge: string
  state: string
  redirectUri: string
}): string {
  const url = new URL(
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`,
  )
  url.searchParams.set('client_id', KEYCLOAK_CLIENT_ID)
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid profile email offline_access')
  url.searchParams.set('state', params.state)
  url.searchParams.set('code_challenge', params.codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}

/** Exchange authorization code for tokens */
export async function exchangeCodeForTokens(params: {
  code: string
  codeVerifier: string
  redirectUri: string
}): Promise<{
  access_token: string
  refresh_token?: string
  id_token?: string
  expires_in: number
}> {
  const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      code: params.code,
      code_verifier: params.codeVerifier,
      redirect_uri: params.redirectUri,
    }),
  })
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Token exchange failed: ${err}`)
  }
  return response.json()
}

/** Silently refresh the access token using the refresh token */
export async function refreshAccessToken(session: SessionData): Promise<boolean> {
  if (!session.refreshToken) return false
  try {
    const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
      }),
    })
    if (!response.ok) return false
    const tokens = await response.json()
    session.accessToken = tokens.access_token
    session.refreshToken = tokens.refresh_token || session.refreshToken
    session.accessTokenExpiresAt = Date.now() + tokens.expires_in * 1000
    if (tokens.access_token) {
      session.user = extractUserFromToken(tokens.access_token)
    }
    return true
  } catch {
    return false
  }
}

/** Build Keycloak logout URL */
export function buildLogoutUrl(redirectUri: string): string {
  const url = new URL(
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`,
  )
  url.searchParams.set('client_id', KEYCLOAK_CLIENT_ID)
  url.searchParams.set('post_logout_redirect_uri', redirectUri)
  return url.toString()
}
