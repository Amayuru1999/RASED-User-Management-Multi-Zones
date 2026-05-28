import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
const POSTGRES_TIMEOUT_MS = parseInt(process.env.POSTGRES_TIMEOUT_MS || '2000', 10)

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

declare global {
  var rasedPostgresPool: Pool | undefined
}

export const pool =
  global.rasedPostgresPool ??
  new Pool({
    connectionString: DATABASE_URL,
    connectionTimeoutMillis: POSTGRES_TIMEOUT_MS,
  })

if (process.env.NODE_ENV !== 'production') {
  global.rasedPostgresPool = pool
}
