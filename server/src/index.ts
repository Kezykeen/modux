import { buildApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './lib/prisma.js'

async function main() {
  const app = await buildApp()

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    app.log.info(`Modux API listening on ${env.BETTER_AUTH_URL}`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down`)
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main()
