import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '@/lib/session'
import { hasPermission } from '@/lib/rbac'
import { createUser, getUsers } from '@/lib/userRepository'
import {
  ensureBucketExists,
  getObjectStorageBucket,
  getObjectStorageClient,
} from '@/lib/objectStorage'
import type { UserFilters } from '@/lib/userTypes'

export const runtime = 'nodejs'

const NATIONAL_ID_UPLOAD_EXPIRY_SECONDS = parseInt(
  process.env.NATIONAL_ID_UPLOAD_EXPIRY_SECONDS || '900',
  10,
)

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

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function buildNationalIdObjectKey(fileName: string) {
  const extension = fileName.toLowerCase().endsWith('.pdf') ? '.pdf' : ''
  return `national-id-cards/${Date.now()}-${randomUUID()}${extension}`
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)

  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasPermission(session.user.roles, 'users:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid user payload' }, { status: 400 })
  }

  const input = {
    username: normalizeString(payload.username),
    email: normalizeString(payload.email),
    firstName: normalizeString(payload.firstName),
    lastName: normalizeString(payload.lastName),
    role: normalizeString(payload.role),
    nic: normalizeString(payload.nic) || undefined,
    phone: normalizeString(payload.phone) || undefined,
    department: normalizeString(payload.department) || undefined,
    stationCode: normalizeString(payload.stationCode) || undefined,
  }
  const nationalIdFileName = normalizeString(payload.nationalIdFileName)

  if (!input.username || !input.email || !input.firstName || !input.lastName || !input.role) {
    return NextResponse.json({ error: 'Username, email, name, and role are required' }, { status: 400 })
  }

  if (!nationalIdFileName.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'National ID card PDF is required' }, { status: 400 })
  }

  const bucket = getObjectStorageBucket()
  const nationalIdDocumentRef = buildNationalIdObjectKey(nationalIdFileName)

  try {
    await ensureBucketExists()

    const user = await createUser(input, nationalIdDocumentRef, bucket)
    const uploadUrl = await getObjectStorageClient().presignedPutObject(
      bucket,
      nationalIdDocumentRef,
      NATIONAL_ID_UPLOAD_EXPIRY_SECONDS,
    )

    return NextResponse.json(
      {
        user,
        nationalIdUpload: {
          bucket,
          ref: nationalIdDocumentRef,
          uploadUrl,
          expiresInSeconds: NATIONAL_ID_UPLOAD_EXPIRY_SECONDS,
          contentType: 'application/pdf',
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Failed to create user with national ID upload link', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
