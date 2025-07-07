import bcrypt from 'bcrypt'
import { createPrismaClient } from '../utils/database.js'
import { UserTier, AuthProvider } from '../types/index'

async function setupAdminUsers() {
  const prisma = createPrismaClient()
  
  try {
    console.log('🔧 Setting up admin users...')

    const adminEmails = [
      'aahadvakani@gmail.com',
      'avakani_2026@depauw.edu'
    ]

    for (const email of adminEmails) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        // Update existing user to admin
        const updated = await prisma.user.update({
          where: { email },
          data: { tier: UserTier.ADMIN }
        })
        console.log(`✅ Updated ${email} to ADMIN tier`)
      } else {
        // Create new admin user
        const defaultPassword = 'admin123!' // Change this in production
        const passwordHash = await bcrypt.hash(defaultPassword, 12)

        const newAdmin = await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0],
            displayName: email.split('@')[0],
            tier: UserTier.ADMIN,
            authProvider: AuthProvider.EMAIL,
            passwordHash,
            emailVerified: true,
            isActive: true
          }
        })
        console.log(`✅ Created admin user: ${email}`)
        console.log(`   Default password: ${defaultPassword}`)
      }
    }

    console.log('🎉 Admin setup completed successfully!')
  } catch (error) {
    console.error('❌ Error setting up admin users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdminUsers()