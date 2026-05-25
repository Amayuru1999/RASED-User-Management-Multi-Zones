import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'rased_user_management'
const MONGODB_TIMEOUT_MS = parseInt(process.env.MONGODB_TIMEOUT_MS || '2000', 10)

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required')
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function getMongoDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  const client =
    cachedClient ??
    new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: MONGODB_TIMEOUT_MS,
      connectTimeoutMS: MONGODB_TIMEOUT_MS,
    })

  if (!cachedClient) {
    try {
      await client.connect()
      cachedClient = client
    } catch (error) {
      await client.close().catch(() => undefined)
      throw error
    }
  }

  cachedDb = client.db(MONGODB_DB_NAME)
  return cachedDb
}
