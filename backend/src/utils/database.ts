import { PrismaClient } from '@prisma/client'

// Create a single instance of PrismaClient
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database connection...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database connection...')
  await prisma.$disconnect()
  process.exit(0)
})

export { prisma }