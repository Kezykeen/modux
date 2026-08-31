import 'dotenv/config'
import { z } from 'zod'

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CLIENT_ORIGIN: z.url(),
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    LOCAL_STORAGE_PATH: z.string().default('./data/uploads'),
    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    /** Public CDN / bucket URL (no trailing slash). If unset, assets are served via the API. */
    ASSETS_PUBLIC_URL: z.string().url().optional(),
    MAX_SNAPSHOT_BYTES: z.coerce.number().int().positive().default(2_000_000),
  })
  .superRefine((data, ctx) => {
    if (data.STORAGE_DRIVER === 's3') {
      if (!data.S3_BUCKET) {
        ctx.addIssue({ code: 'custom', message: 'S3_BUCKET required when STORAGE_DRIVER=s3', path: ['S3_BUCKET'] })
      }
      if (!data.S3_REGION) {
        ctx.addIssue({ code: 'custom', message: 'S3_REGION required when STORAGE_DRIVER=s3', path: ['S3_REGION'] })
      }
      if (!data.S3_ACCESS_KEY_ID) {
        ctx.addIssue({
          code: 'custom',
          message: 'S3_ACCESS_KEY_ID required when STORAGE_DRIVER=s3',
          path: ['S3_ACCESS_KEY_ID'],
        })
      }
      if (!data.S3_SECRET_ACCESS_KEY) {
        ctx.addIssue({
          code: 'custom',
          message: 'S3_SECRET_ACCESS_KEY required when STORAGE_DRIVER=s3',
          path: ['S3_SECRET_ACCESS_KEY'],
        })
      }
    }
  })

export type Env = z.infer<typeof envSchema>

/** Neon CLI writes AWS_* vars; map them to our S3 config. */
function normalizeProcessEnv(): Record<string, string | undefined> {
  const e = process.env
  const hasNeonStorage = Boolean(e.AWS_ENDPOINT_URL_S3 && e.AWS_ACCESS_KEY_ID)
  return {
    ...e,
    STORAGE_DRIVER: e.STORAGE_DRIVER ?? (hasNeonStorage ? 's3' : e.STORAGE_DRIVER),
    S3_BUCKET: e.S3_BUCKET ?? 'modux',
    S3_REGION: e.S3_REGION ?? e.AWS_REGION,
    S3_ACCESS_KEY_ID: e.S3_ACCESS_KEY_ID ?? e.AWS_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: e.S3_SECRET_ACCESS_KEY ?? e.AWS_SECRET_ACCESS_KEY,
    S3_ENDPOINT: e.S3_ENDPOINT ?? e.AWS_ENDPOINT_URL_S3,
  }
}

function loadEnv(): Env {
  const parsed = envSchema.safeParse(normalizeProcessEnv())
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid environment:\n${message}`)
  }
  return parsed.data
}

export const env = loadEnv()
