import { supabase, handleSupabaseError } from '../utils/supabase.js';

export interface VoteData {
  exampleId: string;
  userId: string;
  voteType: 'accurate' | 'inaccurate' | 'helpful' | 'unhelpful';
  confidence?: number; // 1-5 scale
  comment?: string;
}

export interface VoteResult {
  id: string;
  exampleId: string;
  userId: string;
  voteType: string;
  confidence: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoteStats {
  totalVotes: number;
  accurateVotes: number;
  inaccurateVotes: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  voteScore: number;
  qualityScore: number;
  userVote?: VoteResult;
}

export interface ManualTagData {
  exampleId: string;
  userId: string;
  switchPoints: number[];
  segments: Array<{
    text: string;
    language: string;
    startIndex: number;
    endIndex: number;
    confidence: number;
    userTagged?: boolean;
  }>;
  notes?: string;
  confidenceScore?: number;
}

export interface ManualTagResult {
  id: string;
  exampleId: string;
  userId: string;
  switchPoints: number[];
  segments: any[];
  notes?: string;
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export class VotingService {
  /**
   * Submit or update a vote for an example
   */
  static async submitVote(voteData: VoteData): Promise<{ success: boolean; data?: VoteResult; error?: string }> {
    try {
      // Check if user has already voted with this type
      const { data: existingVote, error: checkError } = await supabase
        .from('example_votes')
        .select('*')
        .eq('example_id', voteData.exampleId)
        .eq('user_id', voteData.userId)
        .eq('vote_type', voteData.voteType)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Supabase checking existing vote error:', checkError);
        return { success: false, error: checkError.message || 'Failed to check existing vote' };
      }

      let result;
      
      if (existingVote) {
        // Update existing vote
        const { data: updatedVote, error: updateError } = await supabase
          .from('example_votes')
          .update({
            confidence: voteData.confidence || 3,
            comment: voteData.comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVote.id)
          .select()
          .single();

        if (updateError) {
          console.error('Supabase updating vote error:', updateError);
          return { success: false, error: updateError.message || 'Failed to update vote' };
        }

        result = updatedVote;
      } else {
        // Insert new vote
        const { data: newVote, error: insertError } = await supabase
          .from('example_votes')
          .insert({
            example_id: voteData.exampleId,
            user_id: voteData.userId,
            vote_type: voteData.voteType,
            confidence: voteData.confidence || 3,
            comment: voteData.comment
          })
          .select()
          .single();

        if (insertError) {
          console.error('Supabase creating vote error:', insertError);
          return { success: false, error: insertError.message || 'Failed to create vote' };
        }

        result = newVote;
      }

      // Record contribution points
      await this.recordContribution(voteData.userId, 'vote', voteData.exampleId, 1);

      return { success: true, data: result };
    } catch (error) {
      console.error('Vote submission error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Remove a vote
   */
  static async removeVote(exampleId: string, userId: string, voteType: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error: deleteError } = await supabase
        .from('example_votes')
        .delete()
        .eq('example_id', exampleId)
        .eq('user_id', userId)
        .eq('vote_type', voteType);

      if (deleteError) {
        console.error('Supabase removing vote error:', deleteError);
        return { success: false, error: deleteError.message || 'Failed to remove vote' };
      }

      return { success: true };
    } catch (error) {
      console.error('Vote removal error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get vote statistics for an example
   */
  static async getVoteStats(exampleId: string, userId?: string): Promise<{ success: boolean; data?: VoteStats; error?: string }> {
    try {
      // Get all votes for the example
      const { data: votes, error: votesError } = await supabase
        .from('example_votes')
        .select('*')
        .eq('example_id', exampleId);

      if (votesError) {
        console.error('Supabase fetching votes error:', votesError);
        return { success: false, error: votesError.message || 'Failed to fetch votes' };
      }

      // Get example data for current scores
      const { data: example, error: exampleError } = await supabase
        .from('examples')
        .select('vote_score, quality_score')
        .eq('id', exampleId)
        .single();

      if (exampleError) {
        console.error('Supabase fetching example error:', exampleError);
        return { success: false, error: exampleError.message || 'Failed to fetch example' };
      }

      // Calculate vote statistics
      const stats: VoteStats = {
        totalVotes: votes.length,
        accurateVotes: votes.filter(v => v.vote_type === 'accurate').length,
        inaccurateVotes: votes.filter(v => v.vote_type === 'inaccurate').length,
        helpfulVotes: votes.filter(v => v.vote_type === 'helpful').length,
        unhelpfulVotes: votes.filter(v => v.vote_type === 'unhelpful').length,
        voteScore: example.vote_score || 0,
        qualityScore: example.quality_score || 0
      };

      // Include user's vote if userId provided
      if (userId) {
        const userVote = votes.find(v => v.user_id === userId);
        if (userVote) {
          stats.userVote = userVote;
        }
      }

      return { success: true, data: stats };
    } catch (error) {
      console.error('Vote stats error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Submit manual tags for an example
   */
  static async submitManualTag(tagData: ManualTagData): Promise<{ success: boolean; data?: ManualTagResult; error?: string }> {
    try {
      // Check if user has already tagged this example
      const { data: existingTag, error: checkError } = await supabase
        .from('manual_tags')
        .select('*')
        .eq('example_id', tagData.exampleId)
        .eq('user_id', tagData.userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Supabase checking existing tag error:', checkError);
        return { success: false, error: checkError.message || 'Failed to check existing tag' };
      }

      let result;

      if (existingTag) {
        // Update existing tag
        const { data: updatedTag, error: updateError } = await supabase
          .from('manual_tags')
          .update({
            switch_points: tagData.switchPoints,
            segments: tagData.segments,
            notes: tagData.notes,
            confidence_score: tagData.confidenceScore || 0.8,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTag.id)
          .select()
          .single();

        if (updateError) {
          console.error('Supabase updating tag error:', updateError);
          return { success: false, error: updateError.message || 'Failed to update tag' };
        }

        result = updatedTag;
      } else {
        // Insert new tag
        const { data: newTag, error: insertError } = await supabase
          .from('manual_tags')
          .insert({
            example_id: tagData.exampleId,
            user_id: tagData.userId,
            switch_points: tagData.switchPoints,
            segments: tagData.segments,
            notes: tagData.notes,
            confidence_score: tagData.confidenceScore || 0.8
          })
          .select()
          .single();

        if (insertError) {
          console.error('Supabase creating tag error:', insertError);
          return { success: false, error: insertError.message || 'Failed to create tag' };
        }

        result = newTag;
      }

      // Record contribution points (more points for manual tagging)
      await this.recordContribution(tagData.userId, 'tag', tagData.exampleId, 5);

      return { success: true, data: result };
    } catch (error) {
      console.error('Manual tag submission error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get manual tags for an example
   */
  static async getManualTags(exampleId: string): Promise<{ success: boolean; data?: ManualTagResult[]; error?: string }> {
    try {
      const { data: tags, error: tagsError } = await supabase
        .from('manual_tags')
        .select('*')
        .eq('example_id', exampleId)
        .order('confidence_score', { ascending: false });

      if (tagsError) {
        console.error('Supabase fetching manual tags error:', tagsError);
        return { success: false, error: tagsError.message || 'Failed to fetch manual tags' };
      }

      return { success: true, data: tags || [] };
    } catch (error) {
      console.error('Manual tags fetch error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get user's voting and tagging history
   */
  static async getUserContributions(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data: contributions, error: contribError } = await supabase
        .from('user_contributions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (contribError) {
        console.error('Supabase fetching contributions error:', contribError);
        return { success: false, error: contribError.message || 'Failed to fetch contributions' };
      }

      // Get summary stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('id', userId)
        .single();

      if (statsError) {
        console.error('Supabase fetching user stats error:', statsError);
        return { success: false, error: statsError.message || 'Failed to fetch user stats' };
      }

      return { 
        success: true, 
        data: {
          contributions: contributions || [],
          stats: stats || {}
        }
      };
    } catch (error) {
      console.error('User contributions fetch error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get community leaderboard
   */
  static async getLeaderboard(limit: number = 10): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data: leaderboard, error: leaderError } = await supabase
        .from('user_stats')
        .select('id, name, examples_submitted, votes_cast, tags_contributed, total_points')
        .order('total_points', { ascending: false })
        .limit(limit);

      if (leaderError) {
        console.error('Supabase fetching leaderboard error:', leaderError);
        return { success: false, error: leaderError.message || 'Failed to fetch leaderboard' };
      }

      return { success: true, data: leaderboard || [] };
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Record user contribution for points
   */
  private static async recordContribution(userId: string, type: string, targetId: string, points: number): Promise<void> {
    try {
      await supabase
        .from('user_contributions')
        .insert({
          user_id: userId,
          contribution_type: type,
          target_id: targetId,
          points: points
        });
    } catch (error) {
      console.error('Error recording contribution:', error);
      // Non-blocking error - don't fail the main operation
    }
  }

  /**
   * Update verification status based on community votes
   */
  static async updateVerificationStatus(exampleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: example, error: exampleError } = await supabase
        .from('examples')
        .select('vote_score, quality_score')
        .eq('id', exampleId)
        .single();

      if (exampleError) {
        console.error('Supabase fetching example for verification error:', exampleError);
        return { success: false, error: exampleError.message || 'Failed to fetch example for verification' };
      }

      let verificationStatus = 'pending';
      
      // Determine verification status based on scores
      if (example.vote_score >= 5 && example.quality_score >= 0.7) {
        verificationStatus = 'verified';
      } else if (example.vote_score <= -3 || example.quality_score <= 0.3) {
        verificationStatus = 'rejected';
      } else if (example.vote_score >= 2 && example.quality_score >= 0.5) {
        verificationStatus = 'community_verified';
      }

      // Update verification status
      const { error: updateError } = await supabase
        .from('examples')
        .update({
          verification_status: verificationStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', exampleId);

      if (updateError) {
        console.error('Supabase updating verification status error:', updateError);
        return { success: false, error: updateError.message || 'Failed to update verification status' };
      }

      return { success: true };
    } catch (error) {
      console.error('Verification status update error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}