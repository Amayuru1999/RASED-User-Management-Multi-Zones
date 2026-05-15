import type { Filter, WithId } from 'mongodb'
import { getMongoDb } from '@/lib/mongodb'
import { USER_SEED_DATA } from '@/lib/userSeedData'
import type { User, UserFilters, UsersResponse } from '@/lib/userTypes'

const USERS_COLLECTION = 'users'

type UserDocument = User

function mapDocToUser(doc: WithId<UserDocument>): User {
  const { _id, ...user } = doc
  void _id
  return user
}

function buildUserQuery(filters: UserFilters): Filter<UserDocument> {
  const andFilters: Filter<UserDocument>[] = []

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i')
    andFilters.push({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { username: searchRegex },
      ],
    })
  }

  if (filters.status && filters.status !== 'ALL') {
    andFilters.push({ status: filters.status as User['status'] })
  }

  if (filters.role && filters.role !== 'ALL') {
    andFilters.push({ roles: { $in: [filters.role] } })
  }

  if (andFilters.length === 0) {
    return {}
  }

  return { $and: andFilters }
}

export async function ensureSeedUsers(): Promise<void> {
  const db = await getMongoDb()
  const usersCollection = db.collection<UserDocument>(USERS_COLLECTION)

  await usersCollection.createIndex({ id: 1 }, { unique: true })
  await usersCollection.createIndex({ username: 1 }, { unique: true })
  await usersCollection.createIndex({ email: 1 }, { unique: true })

  const usersCount = await usersCollection.estimatedDocumentCount()
  if (usersCount > 0) {
    return
  }

  await usersCollection.insertMany(USER_SEED_DATA, { ordered: true })
}

export async function seedUsers(force = false): Promise<{ inserted: number; total: number }> {
  const db = await getMongoDb()
  const usersCollection = db.collection<UserDocument>(USERS_COLLECTION)

  await usersCollection.createIndex({ id: 1 }, { unique: true })
  await usersCollection.createIndex({ username: 1 }, { unique: true })
  await usersCollection.createIndex({ email: 1 }, { unique: true })

  if (force) {
    await usersCollection.deleteMany({})
  }

  const existingIds = new Set(
    (await usersCollection.find({}, { projection: { _id: 0, id: 1 } }).toArray()).map((doc) => doc.id),
  )

  const docsToInsert = USER_SEED_DATA.filter((user) => !existingIds.has(user.id))
  if (docsToInsert.length > 0) {
    await usersCollection.insertMany(docsToInsert, { ordered: true })
  }

  const total = await usersCollection.estimatedDocumentCount()
  return { inserted: docsToInsert.length, total }
}

export async function getUsers(filters: UserFilters): Promise<UsersResponse> {
  await ensureSeedUsers()

  const db = await getMongoDb()
  const usersCollection = db.collection<UserDocument>(USERS_COLLECTION)

  const query = buildUserQuery(filters)
  const skip = (filters.page - 1) * filters.pageSize

  const [usersDocs, total] = await Promise.all([
    usersCollection.find(query).sort({ firstName: 1, lastName: 1 }).skip(skip).limit(filters.pageSize).toArray(),
    usersCollection.countDocuments(query),
  ])

  return {
    users: usersDocs.map(mapDocToUser),
    total,
    totalPages: Math.ceil(total / filters.pageSize) || 1,
  }
}

export async function getUserById(id: string): Promise<User | null> {
  await ensureSeedUsers()

  const db = await getMongoDb()
  const usersCollection = db.collection<UserDocument>(USERS_COLLECTION)
  const user = await usersCollection.findOne({ id })

  if (!user) {
    return null
  }

  return mapDocToUser(user)
}
