import { supabase, tables, handleSupabaseError, ResearchApplication } from '../utils/supabase.js'

export interface CreateResearchApplicationData {
  userId: string
  requestedTools: string[]
  justification: string
  institution?: string
  researchArea?: string
}

export interface UpdateApplicationStatusData {
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewNotes?: string
  reviewedBy: string
}

export class ResearchApplicationService {
  
  async createApplication(data: CreateResearchApplicationData): Promise<ResearchApplication> {
    const { data: application, error } = await supabase
      .from(tables.researchApplications)
      .insert({
        user_id: data.userId,
        requested_tools: data.requestedTools,
        justification: data.justification,
        institution: data.institution,
        research_area: data.researchArea,
        status: 'PENDING',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      handleSupabaseError(error, 'research application creation')
    }

    return application
  }

  async getApplicationById(id: string): Promise<ResearchApplication | null> {
    const { data: application, error } = await supabase
      .from(tables.researchApplications)
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      handleSupabaseError(error, 'research application lookup')
    }

    return application
  }

  async getApplicationsByUserId(userId: string): Promise<ResearchApplication[]> {
    const { data: applications, error } = await supabase
      .from(tables.researchApplications)
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })

    if (error) {
      handleSupabaseError(error, 'user applications lookup')
    }

    return applications || []
  }

  async getAllApplications(status?: string): Promise<ResearchApplication[]> {
    let query = supabase
      .from(tables.researchApplications)
      .select('*')

    if (status) {
      query = query.eq('status', status)
    }

    const { data: applications, error } = await query
      .order('submitted_at', { ascending: false })

    if (error) {
      handleSupabaseError(error, 'applications lookup')
    }

    return applications || []
  }

  async updateApplicationStatus(
    applicationId: string, 
    updateData: UpdateApplicationStatusData
  ): Promise<ResearchApplication> {
    const { data: application, error } = await supabase
      .from(tables.researchApplications)
      .update({
        status: updateData.status,
        review_notes: updateData.reviewNotes,
        reviewed_by: updateData.reviewedBy,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      handleSupabaseError(error, 'application status update')
    }

    // If approved, update user tier to RESEARCHER
    if (updateData.status === 'APPROVED') {
      const { error: userUpdateError } = await supabase
        .from(tables.users)
        .update({ tier: 'RESEARCHER' })
        .eq('id', application.user_id)

      if (userUpdateError) {
        console.error('Failed to update user tier:', userUpdateError)
      }
    }

    return application
  }

  async hasActiveApplication(userId: string): Promise<boolean> {
    const { data: application, error } = await supabase
      .from(tables.researchApplications)
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'PENDING')
      .single()

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'active application check')
    }

    return !!application
  }

  async getApplicationStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
  }> {
    // Get total count
    const { count: total, error: totalError } = await supabase
      .from(tables.researchApplications)
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error fetching total applications:', totalError)
    }

    // Get pending count
    const { count: pending, error: pendingError } = await supabase
      .from(tables.researchApplications)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING')

    if (pendingError) {
      console.error('Error fetching pending applications:', pendingError)
    }

    // Get approved count
    const { count: approved, error: approvedError } = await supabase
      .from(tables.researchApplications)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'APPROVED')

    if (approvedError) {
      console.error('Error fetching approved applications:', approvedError)
    }

    // Get rejected count
    const { count: rejected, error: rejectedError } = await supabase
      .from(tables.researchApplications)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'REJECTED')

    if (rejectedError) {
      console.error('Error fetching rejected applications:', rejectedError)
    }

    return {
      total: total || 0,
      pending: pending || 0,
      approved: approved || 0,
      rejected: rejected || 0
    }
  }
}

export const researchApplicationService = new ResearchApplicationService()