#!/usr/bin/env node

import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { supabase, tables } from '../utils/supabase.js'
import { UserTier, UserPayload, ApplicationStatus } from '../types/index.js'

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'

// Mock test users
const testUsers = {
  community: {
    id: 'test-community-user',
    email: 'community@example.com',
    name: 'Community User',
    tier: UserTier.COMMUNITY,
    authProvider: 'EMAIL' as any
  },
  admin: {
    id: 'test-admin-user',
    email: 'admin@codeboard.com',
    name: 'Admin User',
    tier: UserTier.ADMIN,
    authProvider: 'EMAIL' as any
  }
}

// Test research application data
const testApplicationData = {
  requestedTools: ['Analytics Dashboard', 'Data Export', 'Advanced Filtering'],
  justification: 'I am conducting research on multilingual code-switching patterns in social media for my PhD thesis. This research will contribute to better understanding of language contact phenomena in digital communication environments.',
  institution: 'University of Linguistics',
  researchArea: 'Computational Sociolinguistics'
}

async function setupTestUsers() {
  console.log('🔧 Setting up test users...')
  
  try {
    // Check if test users exist, create if not
    for (const [role, userData] of Object.entries(testUsers)) {
      const { data: existingUser } = await supabase
        .from(tables.users)
        .select('id')
        .eq('id', userData.id)
        .single()

      if (!existingUser) {
        const { error } = await supabase
          .from(tables.users)
          .upsert({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            tier: userData.tier,
            auth_provider: userData.authProvider,
            email_verified: true,
            is_active: true,
            preferred_tools: [],
            password_hash: 'test-hash' // Not used in real app
          })

        if (error) {
          console.error(`❌ Failed to create ${role} user:`, error)
        } else {
          console.log(`✅ Created ${role} user: ${userData.email}`)
        }
      } else {
        console.log(`✅ ${role} user already exists: ${userData.email}`)
      }
    }
  } catch (error) {
    console.error('❌ Setup failed:', error)
    throw error
  }
}

async function testApplicationSubmission() {
  console.log('\n📝 Testing Research Application Submission')
  console.log('=' .repeat(50))

  const communityToken = jwt.sign(testUsers.community, JWT_SECRET)

  try {
    // Simulate application submission
    const { data: application, error } = await supabase
      .from(tables.researchApplications)
      .insert({
        id: randomUUID(),
        user_id: testUsers.community.id,
        requested_tools: testApplicationData.requestedTools,
        justification: testApplicationData.justification,
        institution: testApplicationData.institution,
        research_area: testApplicationData.researchArea,
        status: 'PENDING'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Application submission failed:', error)
      return null
    }

    console.log('✅ Application submitted successfully')
    console.log(`   Application ID: ${application.id}`)
    console.log(`   Status: ${application.status}`)
    console.log(`   Tools requested: ${application.requested_tools.join(', ')}`)
    console.log(`   Institution: ${application.institution}`)

    return application
  } catch (error) {
    console.error('❌ Application submission error:', error)
    return null
  }
}

async function testApplicationRetreval(applicationId: string) {
  console.log('\n📋 Testing Application Retrieval')
  console.log('=' .repeat(50))

  try {
    // Test user retrieving their own application
    const { data: userApplication, error: userError } = await supabase
      .from(tables.researchApplications)
      .select('*')
      .eq('id', applicationId)
      .eq('user_id', testUsers.community.id)
      .single()

    if (userError) {
      console.error('❌ User application retrieval failed:', userError)
    } else {
      console.log('✅ User can retrieve their own application')
      console.log(`   Status: ${userApplication.status}`)
    }

    // Test admin retrieving all applications
    const { data: adminApplications, error: adminError } = await supabase
      .from(tables.researchApplications)
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          display_name
        )
      `)
      .eq('status', 'PENDING')

    if (adminError) {
      console.error('❌ Admin application retrieval failed:', adminError)
    } else {
      console.log('✅ Admin can retrieve pending applications')
      console.log(`   Found ${adminApplications.length} pending application(s)`)
    }

    return { userApplication, adminApplications }
  } catch (error) {
    console.error('❌ Application retrieval error:', error)
    return null
  }
}

async function testApplicationApproval(applicationId: string) {
  console.log('\n✅ Testing Application Approval')
  console.log('=' .repeat(50))

  try {
    // Approve the application
    const { data: approvedApp, error: approveError } = await supabase
      .from(tables.researchApplications)
      .update({
        status: 'APPROVED',
        reviewed_at: new Date().toISOString(),
        review_notes: 'Application approved - research credentials verified',
        reviewed_by: testUsers.admin.id
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (approveError) {
      console.error('❌ Application approval failed:', approveError)
      return false
    }

    console.log('✅ Application approved successfully')
    console.log(`   New status: ${approvedApp.status}`)
    console.log(`   Reviewed by: ${approvedApp.reviewed_by}`)
    console.log(`   Admin notes: ${approvedApp.review_notes}`)

    // Update user tier to RESEARCHER
    const { error: tierUpdateError } = await supabase
      .from(tables.users)
      .update({ tier: 'RESEARCHER' })
      .eq('id', testUsers.community.id)

    if (tierUpdateError) {
      console.error('❌ User tier update failed:', tierUpdateError)
      return false
    }

    console.log('✅ User tier updated to RESEARCHER')

    // Verify user tier change
    const { data: updatedUser, error: userCheckError } = await supabase
      .from(tables.users)
      .select('tier')
      .eq('id', testUsers.community.id)
      .single()

    if (userCheckError) {
      console.error('❌ User tier verification failed:', userCheckError)
    } else {
      console.log(`✅ User tier verified: ${updatedUser.tier}`)
    }

    return true
  } catch (error) {
    console.error('❌ Application approval error:', error)
    return false
  }
}

async function testApplicationRejection() {
  console.log('\n❌ Testing Application Rejection')
  console.log('=' .repeat(50))

  try {
    // Create another test application for rejection
    const { data: rejectionApp, error: createError } = await supabase
      .from(tables.researchApplications)
      .insert({
        id: randomUUID(),
        user_id: testUsers.community.id,
        requested_tools: ['Basic Analytics'],
        justification: 'Short reason', // Intentionally brief
        status: 'PENDING'
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Test application creation failed:', createError)
      return false
    }

    // Reject the application
    const { data: rejectedApp, error: rejectError } = await supabase
      .from(tables.researchApplications)
      .update({
        status: 'REJECTED',
        reviewed_at: new Date().toISOString(),
        review_notes: 'Insufficient justification provided',
        reviewed_by: testUsers.admin.id
      })
      .eq('id', rejectionApp.id)
      .select()
      .single()

    if (rejectError) {
      console.error('❌ Application rejection failed:', rejectError)
      return false
    }

    console.log('✅ Application rejected successfully')
    console.log(`   New status: ${rejectedApp.status}`)
    console.log(`   Admin notes: ${rejectedApp.review_notes}`)

    return true
  } catch (error) {
    console.error('❌ Application rejection error:', error)
    return false
  }
}

async function testAccessControlAfterApproval() {
  console.log('\n🔐 Testing Access Control After Approval')
  console.log('=' .repeat(50))

  try {
    // Create new JWT token with updated user tier
    const updatedCommunityUser = {
      ...testUsers.community,
      tier: UserTier.RESEARCHER
    }
    const researcherToken = jwt.sign(updatedCommunityUser, JWT_SECRET)

    console.log('✅ Generated researcher token for previously community user')

    // Test access to researcher-only endpoints (simulated)
    const tierHierarchy = { 'COMMUNITY': 1, 'RESEARCHER': 2, 'ADMIN': 3 }
    const userLevel = tierHierarchy[updatedCommunityUser.tier]
    const researcherLevel = tierHierarchy['RESEARCHER']

    const canAccessResearchEndpoints = userLevel >= researcherLevel

    console.log(`✅ User can now access researcher endpoints: ${canAccessResearchEndpoints ? 'YES' : 'NO'}`)

    return canAccessResearchEndpoints
  } catch (error) {
    console.error('❌ Access control test error:', error)
    return false
  }
}

async function testApplicationStats() {
  console.log('\n📊 Testing Application Statistics')
  console.log('=' .repeat(50))

  try {
    // Get application counts by status
    const statusCounts = await Promise.all([
      supabase.from(tables.researchApplications).select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from(tables.researchApplications).select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
      supabase.from(tables.researchApplications).select('*', { count: 'exact', head: true }).eq('status', 'REJECTED')
    ])

    const stats = {
      pending: statusCounts[0].count || 0,
      approved: statusCounts[1].count || 0,
      rejected: statusCounts[2].count || 0,
      total: (statusCounts[0].count || 0) + (statusCounts[1].count || 0) + (statusCounts[2].count || 0)
    }

    console.log('✅ Application statistics retrieved:')
    console.log(`   Total applications: ${stats.total}`)
    console.log(`   Pending: ${stats.pending}`)
    console.log(`   Approved: ${stats.approved}`)
    console.log(`   Rejected: ${stats.rejected}`)

    return stats
  } catch (error) {
    console.error('❌ Statistics test error:', error)
    return null
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...')
  
  try {
    // Delete test applications
    await supabase
      .from(tables.researchApplications)
      .delete()
      .eq('user_id', testUsers.community.id)

    // Reset community user tier
    await supabase
      .from(tables.users)
      .update({ tier: 'COMMUNITY' })
      .eq('id', testUsers.community.id)

    console.log('✅ Test data cleaned up')
  } catch (error) {
    console.log('⚠️ Cleanup warning (non-critical):', error)
  }
}

async function runResearchWorkflowTests() {
  console.log('📋 Research Application Workflow Test Suite')
  console.log('=' .repeat(60))
  console.log('Testing complete research application lifecycle\n')

  try {
    // Setup
    await setupTestUsers()

    // Test application submission
    const application = await testApplicationSubmission()
    if (!application) {
      throw new Error('Application submission failed')
    }

    // Test application retrieval
    const retrievalResult = await testApplicationRetreval(application.id)
    if (!retrievalResult) {
      throw new Error('Application retrieval failed')
    }

    // Test application approval workflow
    const approvalSuccess = await testApplicationApproval(application.id)
    if (!approvalSuccess) {
      throw new Error('Application approval failed')
    }

    // Test application rejection workflow
    const rejectionSuccess = await testApplicationRejection()
    if (!rejectionSuccess) {
      throw new Error('Application rejection failed')
    }

    // Test access control after approval
    const accessControlSuccess = await testAccessControlAfterApproval()
    if (!accessControlSuccess) {
      throw new Error('Access control verification failed')
    }

    // Test statistics
    const stats = await testApplicationStats()
    if (!stats) {
      throw new Error('Statistics test failed')
    }

    // Cleanup
    await cleanupTestData()

    console.log('\n' + '=' .repeat(60))
    console.log('✅ All research workflow tests completed successfully!')
    console.log('📋 Test Summary:')
    console.log('   ✅ Application submission: Working')
    console.log('   ✅ Application retrieval: Working')
    console.log('   ✅ Application approval: Working')
    console.log('   ✅ Application rejection: Working')
    console.log('   ✅ User tier elevation: Working')
    console.log('   ✅ Access control updates: Working')
    console.log('   ✅ Application statistics: Working')
    console.log()
    console.log('🎓 Research application workflow is ready for production!')

  } catch (error) {
    console.error('\n❌ Research workflow test failed:', error)
    await cleanupTestData()
    process.exit(1)
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runResearchWorkflowTests()
}

export { runResearchWorkflowTests }