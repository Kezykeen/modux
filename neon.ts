import { defineConfig } from '@neon/config/v1'

/**
 * Modux Neon branch config — Postgres ships with every project;
 * buckets branch with the database for snapshot storage.
 */
export default defineConfig({
  preview: {
    buckets: {
      modux: {
        access: 'private',
      },
    },
  },
})
