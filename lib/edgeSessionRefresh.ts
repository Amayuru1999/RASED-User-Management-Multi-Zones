import type { SessionData } from './session'

type RasedRole = NonNullable<SessionData['user']>['roles'][number]

interface RefreshTokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
}

interface AccessTokenPayload {
  sub?: string
  preferred_username?: string
  email?: string
  given_name?: string
  family_name?: string
  realm_access?: { roles?: string[] }
  resource_access?: Record<string, { roles?: string[] }>
  department?: string
  station_code?: string
}

function decodeJwtPayload(token: string): AccessTokenPayload {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT')
  }

  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))

  return JSON.parse(new TextDecoder().decode(bytes)) as AccessTokenPayload
}

function normalizeRole(role: string): RasedRole | undefined {
  const normalized = role.trim().toUpperCase().replace(/[-\s]/g, '_')

  if (normalized === 'SUPER_ADMIN' || normalized === 'SUPERADMIN' || normalized === 'ADMIN') {
    return 'SUPER_ADMIN'
  }
  if (normalized === 'EXCISE_OFFICER' || normalized === 'EXCISEOFFICER') {
    return 'EXCISE_OFFICER'
  }
  if (
    normalized === 'DATA_ENTRY_OPERATOR' ||
    normalized === 'DATA_ENTRY' ||
    normalized === 'DATAENTRYOPERATOR'
  ) {
    return 'DATA_ENTRY_OPERATOR'
  }
  if (normalized === 'AUDITOR' || normalized === 'AUDIT') {
    return 'AUDITOR'
  }
  if (normalized.includes('SUPER') && normalized.includes('ADMIN')) {
    return 'SUPER_ADMIN'
  }
  if (normalized.includes('EXCISE') && (normalized.includes('OFFICER') || normalized.includes('USER'))) {
    return 'EXCISE_OFFICER'
  }
  if (normalized.includes('DATA') && normalized.includes('ENTRY')) {
    return 'DATA_ENTRY_OPERATOR'
  }
  if (normalized.includes('AUDIT')) {
    return 'AUDITOR'
  }

  return undefined
}

function extractUserFromToken(accessToken: string): NonNullable<SessionData['user']> {
  const payload = decodeJwtPayload(accessToken)
  const realmRoles = payload.realm_access?.roles || []
  const clientRoles = Object.values(payload.resource_access || {}).flatMap((client) => client.roles || [])
  const roles = Array.from(
    new Set([...realmRoles, ...clientRoles].map(normalizeRole).filter((role): role is RasedRole => Boolean(role))),
  )

  return {
    id: payload.sub || '',
    username: payload.preferred_username || '',
    email: payload.email || '',
    firstName: payload.given_name || '',
    lastName: payload.family_name || '',
    roles,
    department: payload.department,
    stationCode: payload.station_code,
  }
}

export async function refreshAccessTokenForEdge(session: SessionData): Promise<boolean> {
  const keycloakUrl = process.env.KEYCLOAK_INTERNAL_URL || process.env.KEYCLOAK_URL
  const realm = process.env.KEYCLOAK_REALM
  const clientId = process.env.KEYCLOAK_CLIENT_ID
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET

  if (!session.refreshToken || !keycloakUrl || !realm || !clientId || !clientSecret) {
    return false
  }

  try {
    const response = await fetch(`${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!response.ok) {
      return false
    }

    const tokens = (await response.json()) as RefreshTokenResponse
    if (!tokens.access_token || !tokens.expires_in) {
      return false
    }

    session.accessToken = tokens.access_token
    session.refreshToken = tokens.refresh_token || session.refreshToken
    session.accessTokenExpiresAt = Date.now() + tokens.expires_in * 1000
    session.user = extractUserFromToken(tokens.access_token)

    return true
  } catch {
    return false
  }
}
