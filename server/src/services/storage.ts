import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../config/env.js'

export type StoredObject = {
  body: Buffer
  contentType: string
}

export interface StorageService {
  put(key: string, body: Buffer, contentType: string): Promise<void>
  get(key: string): Promise<StoredObject | null>
  delete(key: string): Promise<void>
}

class LocalStorageService implements StorageService {
  private root: string

  constructor(root: string) {
    this.root = path.resolve(root)
  }

  private filePath(key: string) {
    const normalized = key.replace(/^\/+/, '')
    const full = path.join(this.root, normalized)
    if (!full.startsWith(this.root)) {
      throw new Error('Invalid storage key')
    }
    return full
  }

  async put(key: string, body: Buffer, _contentType: string): Promise<void> {
    const filePath = this.filePath(key)
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, body)
  }

  async get(key: string): Promise<StoredObject | null> {
    try {
      const body = await readFile(this.filePath(key))
      const ext = path.extname(key).toLowerCase()
      const contentType =
        ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
      return { body, contentType }
    } catch {
      return null
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(this.filePath(key))
    } catch {
      /* ignore missing */
    }
  }
}

class S3StorageService implements StorageService {
  private client: S3Client
  private bucket: string

  constructor() {
    this.bucket = env.S3_BUCKET!
    this.client = new S3Client({
      region: env.S3_REGION!,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    })
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )
  }

  async get(key: string): Promise<StoredObject | null> {
    try {
      const res = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      )
      const bytes = await res.Body?.transformToByteArray()
      if (!bytes) return null
      return {
        body: Buffer.from(bytes),
        contentType: res.ContentType ?? 'image/jpeg',
      }
    } catch {
      return null
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    } catch {
      /* ignore */
    }
  }
}

function createStorage(): StorageService {
  if (env.STORAGE_DRIVER === 's3') {
    return new S3StorageService()
  }
  return new LocalStorageService(env.LOCAL_STORAGE_PATH)
}

export const storage = createStorage()

export function snapshotKeyForUser(userId: string, ext: string) {
  const id = crypto.randomUUID()
  return `snapshots/${userId}/${id}.${ext}`
}

export function assertSnapshotAccess(key: string, userId: string) {
  const prefix = `snapshots/${userId}/`
  if (!key.startsWith(prefix)) {
    throw new Error('Forbidden')
  }
}
