import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import { hasPermission } from '@/lib/rbac'
import { getMockUsers } from '@/lib/mockData'

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
  const filters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'ALL',
    role: searchParams.get('role') || 'ALL',
    page: parseInt(searchParams.get('page') || '1', 10),
    pageSize: parseInt(searchParams.get('pageSize') || '10', 10),
  }

  // In development, return mock data. In production, proxy to actual backend API.
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json(getMockUsers(filters))
  }

  try {
    const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1'
    const backendResponse = await fetch(`${BACKEND_URL}/users?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
    
    if (!backendResponse.ok) {
      throw new Error('Backend error')
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
