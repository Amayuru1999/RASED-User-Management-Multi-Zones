import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import { hasPermission } from '@/lib/rbac'
import { getUsers } from '@/lib/userRepository'
import type { UserFilters } from '@/lib/userTypes'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)

  // Verify authentication
  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // RBAC Enforcement
  if (!hasPermission(session.user.roles, 'users:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse filters from URL
  const searchParams = request.nextUrl.searchParams
  const filters: UserFilters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'ALL',
    role: searchParams.get('role') || 'ALL',
    page: parseInt(searchParams.get('page') || '1', 10),
    pageSize: parseInt(searchParams.get('pageSize') || '10', 10),
  }

  try {
    const data = await getUsers(filters)
    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users from database' }, { status: 500 })
  }
}
