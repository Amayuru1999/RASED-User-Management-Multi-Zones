import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'rased_user_management'

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required')
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function getMongoDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  const client = cachedClient ?? new MongoClient(MONGODB_URI)
  if (!cachedClient) {
    await client.connect()
    cachedClient = client
  }

  cachedDb = client.db(MONGODB_DB_NAME)
  return cachedDb
}
