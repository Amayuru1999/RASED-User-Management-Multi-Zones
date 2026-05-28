import { randomUUID } from 'node:crypto'
import { pool } from '@/lib/postgres'
import { USER_SEED_DATA } from '@/lib/userSeedData'
import type { CreateUserInput, User, UserFilters, UsersResponse, UserStatus } from '@/lib/userTypes'

type UserRow = {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  roles: string[]
  status: UserStatus
  nic: string | null
  phone: string | null
  department: string | null
  station_code: string | null
  national_id_document_ref: string | null
  national_id_document_bucket: string | null
  national_id_document_uploaded_at: Date | string | null
}

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    roles: row.roles,
    status: row.status,
    nic: row.nic || undefined,
    phone: row.phone || undefined,
    department: row.department || undefined,
    stationCode: row.station_code || undefined,
    nationalIdDocumentRef: row.national_id_document_ref || undefined,
    nationalIdDocumentBucket: row.national_id_document_bucket || undefined,
    nationalIdDocumentUploadedAt: row.national_id_document_uploaded_at
      ? new Date(row.national_id_document_uploaded_at).toISOString()
      : undefined,
  }
}

function buildWhereClause(filters: UserFilters): { clause: string; values: unknown[] } {
  const conditions: string[] = []
  const values: unknown[] = []

  if (filters.search) {
    values.push(`%${filters.search}%`)
    const param = `$${values.length}`
    conditions.push(
      `(first_name ILIKE ${param} OR last_name ILIKE ${param} OR email ILIKE ${param} OR username ILIKE ${param})`,
    )
  }

  if (filters.status && filters.status !== 'ALL') {
    values.push(filters.status)
    conditions.push(`status = $${values.length}`)
  }

  if (filters.role && filters.role !== 'ALL') {
    values.push(filters.role)
    conditions.push(`$${values.length} = ANY(roles)`)
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  }
}

function matchesFilters(user: User, filters: UserFilters): boolean {
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i')
    const matchesSearch =
      searchRegex.test(user.firstName) ||
      searchRegex.test(user.lastName) ||
      searchRegex.test(user.email) ||
      searchRegex.test(user.username)

    if (!matchesSearch) {
      return false
    }
  }

  if (filters.status && filters.status !== 'ALL' && user.status !== filters.status) {
    return false
  }

  if (filters.role && filters.role !== 'ALL' && !user.roles.includes(filters.role)) {
    return false
  }

  return true
}

function sortUsers(users: User[]): User[] {
  return [...users].sort((left, right) => {
    const firstNameCompare = left.firstName.localeCompare(right.firstName)
    if (firstNameCompare !== 0) {
      return firstNameCompare
    }

    return left.lastName.localeCompare(right.lastName)
  })
}

function getSeedUsers(filters: UserFilters): UsersResponse {
  const filteredUsers = sortUsers(USER_SEED_DATA.filter((user) => matchesFilters(user, filters)))
  const skip = (filters.page - 1) * filters.pageSize
  const paginatedUsers = filteredUsers.slice(skip, skip + filters.pageSize)
  const total = filteredUsers.length

  return {
    users: paginatedUsers,
    total,
    totalPages: Math.ceil(total / filters.pageSize) || 1,
  }
}

export async function ensureSeedUsers(): Promise<void> {
  await ensureUsersTable()

  const usersCountResult = await pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM users')
  const usersCount = Number(usersCountResult.rows[0]?.count || 0)
  if (usersCount > 0) {
    return
  }

  await insertSeedUsers(USER_SEED_DATA)
}

export async function seedUsers(force = false): Promise<{ inserted: number; total: number }> {
  await ensureUsersTable()

  if (force) {
    await pool.query('DELETE FROM users')
  }

  const existingIdsResult = await pool.query<{ id: string }>('SELECT id FROM users')
  const existingIds = new Set(existingIdsResult.rows.map((row) => row.id))

  const usersToInsert = USER_SEED_DATA.filter((user) => !existingIds.has(user.id))
  const inserted = await insertSeedUsers(usersToInsert)

  const totalResult = await pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM users')
  return { inserted, total: Number(totalResult.rows[0]?.count || 0) }
}

export async function getUsers(filters: UserFilters): Promise<UsersResponse> {
  try {
    await ensureSeedUsers()

    const { clause, values } = buildWhereClause(filters)
    const skip = (filters.page - 1) * filters.pageSize
    const pageValues = [...values, filters.pageSize, skip]
    const limitParam = `$${values.length + 1}`
    const offsetParam = `$${values.length + 2}`

    const [usersResult, totalResult] = await Promise.all([
      pool.query<UserRow>(
        `
          SELECT
            id,
            username,
            email,
            first_name,
            last_name,
            roles,
            status,
            nic,
            phone,
            department,
            station_code,
            national_id_document_ref,
            national_id_document_bucket,
            national_id_document_uploaded_at
          FROM users
          ${clause}
          ORDER BY first_name ASC, last_name ASC
          LIMIT ${limitParam}
          OFFSET ${offsetParam}
        `,
        pageValues,
      ),
      pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM users ${clause}`, values),
    ])
    const total = Number(totalResult.rows[0]?.count || 0)

    return {
      users: usersResult.rows.map(mapRowToUser),
      total,
      totalPages: Math.ceil(total / filters.pageSize) || 1,
    }
  } catch (error) {
    console.error('Falling back to seed users because Postgres is unavailable', error)
    return getSeedUsers(filters)
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    await ensureSeedUsers()

    const result = await pool.query<UserRow>(
      `
        SELECT
          id,
          username,
          email,
          first_name,
          last_name,
          roles,
          status,
          nic,
          phone,
          department,
          station_code,
          national_id_document_ref,
          national_id_document_bucket,
          national_id_document_uploaded_at
        FROM users
        WHERE id = $1
      `,
      [id],
    )
    const user = result.rows[0]

    if (!user) {
      return null
    }

    return mapRowToUser(user)
  } catch (error) {
    console.error('Falling back to seed user lookup because Postgres is unavailable', error)
    return USER_SEED_DATA.find((user) => user.id === id) || null
  }
}

export async function createUser(
  input: CreateUserInput,
  nationalIdDocumentRef: string,
  nationalIdDocumentBucket: string,
): Promise<User> {
  await ensureUsersTable()

  const id = `u-${randomUUID()}`
  const result = await pool.query<UserRow>(
    `
      INSERT INTO users (
        id,
        username,
        email,
        first_name,
        last_name,
        roles,
        status,
        nic,
        phone,
        department,
        station_code,
        national_id_document_ref,
        national_id_document_bucket
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, $8, $9, $10, $11, $12)
      RETURNING
        id,
        username,
        email,
        first_name,
        last_name,
        roles,
        status,
        nic,
        phone,
        department,
        station_code,
        national_id_document_ref,
        national_id_document_bucket,
        national_id_document_uploaded_at
    `,
    [
      id,
      input.username,
      input.email,
      input.firstName,
      input.lastName,
      [input.role],
      input.nic || null,
      input.phone || null,
      input.department || null,
      input.stationCode || null,
      nationalIdDocumentRef,
      nationalIdDocumentBucket,
    ],
  )

  return mapRowToUser(result.rows[0])
}

export async function markNationalIdDocumentUploaded(userId: string): Promise<void> {
  await ensureUsersTable()

  await pool.query(
    `
      UPDATE users
      SET national_id_document_uploaded_at = NOW()
      WHERE id = $1
    `,
    [userId],
  )
}

async function ensureUsersTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      roles TEXT[] NOT NULL DEFAULT '{}',
      status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING')),
      nic TEXT,
      phone TEXT,
      department TEXT,
      station_code TEXT,
      national_id_document_ref TEXT,
      national_id_document_bucket TEXT,
      national_id_document_uploaded_at TIMESTAMPTZ
    )
  `)

  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id_document_ref TEXT')
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id_document_bucket TEXT')
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id_document_uploaded_at TIMESTAMPTZ')
  await pool.query('CREATE INDEX IF NOT EXISTS users_name_idx ON users (first_name, last_name)')
  await pool.query('CREATE INDEX IF NOT EXISTS users_status_idx ON users (status)')
  await pool.query('CREATE INDEX IF NOT EXISTS users_roles_idx ON users USING GIN (roles)')
  await pool.query('CREATE INDEX IF NOT EXISTS users_national_id_document_ref_idx ON users (national_id_document_ref)')
}

async function insertSeedUsers(users: User[]): Promise<number> {
  let inserted = 0

  for (const user of users) {
    const result = await pool.query(
      `
        INSERT INTO users (
          id,
          username,
          email,
          first_name,
          last_name,
          roles,
          status,
          nic,
          phone,
          department,
          station_code,
          national_id_document_ref,
          national_id_document_bucket
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING
      `,
      [
        user.id,
        user.username,
        user.email,
        user.firstName,
        user.lastName,
        user.roles,
        user.status,
        user.nic || null,
        user.phone || null,
        user.department || null,
        user.stationCode || null,
        user.nationalIdDocumentRef || null,
        user.nationalIdDocumentBucket || null,
      ],
    )

    inserted += result.rowCount || 0
  }

  return inserted
}
