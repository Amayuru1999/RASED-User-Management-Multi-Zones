import { Client } from 'minio'

const bucketName = process.env.MINIO_BUCKET || 'rased-documents'
const minioRegion = process.env.MINIO_REGION || 'us-east-1'

let bucketEnsured = false

function getMinioPort() {
  const port = parseInt(process.env.MINIO_PORT || '9000', 10)
  if (Number.isNaN(port)) {
    throw new Error('Invalid MINIO_PORT')
  }
  return port
}

function getMinioClient() {
  const endPoint = process.env.MINIO_ENDPOINT || 'localhost'
  const accessKey = process.env.MINIO_ACCESS_KEY
  const secretKey = process.env.MINIO_SECRET_KEY

  if (!accessKey || !secretKey) {
    throw new Error('MINIO_ACCESS_KEY and MINIO_SECRET_KEY are required')
  }

  return new Client({
    endPoint,
    port: getMinioPort(),
    useSSL: (process.env.MINIO_USE_SSL || 'false') === 'true',
    accessKey,
    secretKey,
    region: minioRegion,
  })
}

const minioClient = getMinioClient()

export async function ensureBucketExists() {
  if (bucketEnsured) {
    return
  }

  const exists = await minioClient.bucketExists(bucketName)
  if (!exists) {
    await minioClient.makeBucket(bucketName, minioRegion)
  }

  bucketEnsured = true
}

export function getObjectStorageClient() {
  return minioClient
}

export function getObjectStorageBucket() {
  return bucketName
}
