-- CodeBoard Database Schema for Supabase
-- Community voting and tagging features

-- Add voting-related columns to examples table
ALTER TABLE examples ADD COLUMN IF NOT EXISTS manual_tags JSONB DEFAULT '[]';
ALTER TABLE examples ADD COLUMN IF NOT EXISTS user_votes JSONB DEFAULT '[]';
ALTER TABLE examples ADD COLUMN IF NOT EXISTS vote_score INTEGER DEFAULT 0;
ALTER TABLE examples ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE examples ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE examples ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create example_votes table for tracking individual votes
CREATE TABLE IF NOT EXISTS example_votes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    example_id TEXT NOT NULL REFERENCES examples(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('accurate', 'inaccurate', 'helpful', 'unhelpful')),
    confidence INTEGER DEFAULT 3 CHECK (confidence >= 1 AND confidence <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(example_id, user_id, vote_type)
);

-- Create manual_tags table for user-contributed tags
CREATE TABLE IF NOT EXISTS manual_tags (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    example_id TEXT NOT NULL REFERENCES examples(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    switch_points INTEGER[] DEFAULT '{}',
    segments JSONB DEFAULT '[]',
    notes TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_contributions table for tracking user activity
CREATE TABLE IF NOT EXISTS user_contributions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contribution_type VARCHAR(20) NOT NULL CHECK (contribution_type IN ('example', 'vote', 'tag', 'comment')),
    target_id TEXT NOT NULL, -- references examples.id or other relevant table
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quality_assessments table for tracking quality metrics
CREATE TABLE IF NOT EXISTS quality_assessments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    example_id TEXT NOT NULL REFERENCES examples(id) ON DELETE CASCADE,
    assessor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    assessment_type VARCHAR(20) NOT NULL CHECK (assessment_type IN ('automated', 'community', 'expert')),
    quality_score DECIMAL(3,2) NOT NULL CHECK (quality_score >= 0.00 AND quality_score <= 1.00),
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    feedback JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_example_votes_example_id ON example_votes(example_id);
CREATE INDEX IF NOT EXISTS idx_example_votes_user_id ON example_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_tags_example_id ON manual_tags(example_id);
CREATE INDEX IF NOT EXISTS idx_manual_tags_user_id ON manual_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contributions_user_id ON user_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_quality_assessments_example_id ON quality_assessments(example_id);
CREATE INDEX IF NOT EXISTS idx_examples_verification_status ON examples(verification_status);
CREATE INDEX IF NOT EXISTS idx_examples_quality_score ON examples(quality_score);

-- Note: RLS policies disabled for JWT authentication
-- Since we're using JWT tokens (not Supabase Auth), we handle security at the application level
-- RLS would require auth.uid() which only works with Supabase Auth

-- Uncomment these if you switch to Supabase Auth:
-- ALTER TABLE example_votes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE manual_tags ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_contributions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE quality_assessments ENABLE ROW LEVEL SECURITY;

-- Functions for vote aggregation
CREATE OR REPLACE FUNCTION calculate_vote_score(example_uuid TEXT)
RETURNS INTEGER AS $$
DECLARE
    accurate_votes INTEGER;
    inaccurate_votes INTEGER;
    helpful_votes INTEGER;
    unhelpful_votes INTEGER;
    total_score INTEGER;
BEGIN
    -- Count votes by type
    SELECT 
        COUNT(CASE WHEN vote_type = 'accurate' THEN 1 END),
        COUNT(CASE WHEN vote_type = 'inaccurate' THEN 1 END),
        COUNT(CASE WHEN vote_type = 'helpful' THEN 1 END),
        COUNT(CASE WHEN vote_type = 'unhelpful' THEN 1 END)
    INTO accurate_votes, inaccurate_votes, helpful_votes, unhelpful_votes
    FROM example_votes
    WHERE example_id = example_uuid;
    
    -- Calculate score: accurate(+2) + helpful(+1) - inaccurate(-2) - unhelpful(-1)
    total_score := (accurate_votes * 2) + helpful_votes - (inaccurate_votes * 2) - unhelpful_votes;
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate quality score based on votes and tags
CREATE OR REPLACE FUNCTION calculate_quality_score(example_uuid TEXT)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    vote_score INTEGER;
    tag_count INTEGER;
    total_votes INTEGER;
    quality_score DECIMAL(3,2);
BEGIN
    -- Get vote score and counts
    SELECT calculate_vote_score(example_uuid) INTO vote_score;
    
    SELECT COUNT(*) INTO total_votes
    FROM example_votes
    WHERE example_id = example_uuid;
    
    SELECT COUNT(*) INTO tag_count
    FROM manual_tags
    WHERE example_id = example_uuid;
    
    -- Calculate quality score (0.00 to 1.00)
    -- Base score from vote ratio, bonus for manual tags
    IF total_votes > 0 THEN
        quality_score := GREATEST(0.00, LEAST(1.00, 
            0.5 + (vote_score::DECIMAL / (total_votes * 4)) + (tag_count::DECIMAL * 0.1)
        ));
    ELSE
        quality_score := 0.5; -- Neutral score for no votes
    END IF;
    
    RETURN quality_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update scores when votes change
CREATE OR REPLACE FUNCTION update_example_scores()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE examples 
        SET 
            vote_score = calculate_vote_score(NEW.example_id),
            quality_score = calculate_quality_score(NEW.example_id),
            updated_at = NOW()
        WHERE id = NEW.example_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE examples 
        SET 
            vote_score = calculate_vote_score(OLD.example_id),
            quality_score = calculate_quality_score(OLD.example_id),
            updated_at = NOW()
        WHERE id = OLD.example_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_example_scores ON example_votes;
CREATE TRIGGER trigger_update_example_scores
    AFTER INSERT OR UPDATE OR DELETE ON example_votes
    FOR EACH ROW EXECUTE FUNCTION update_example_scores();

DROP TRIGGER IF EXISTS trigger_update_example_scores_tags ON manual_tags;
CREATE TRIGGER trigger_update_example_scores_tags
    AFTER INSERT OR UPDATE OR DELETE ON manual_tags
    FOR EACH ROW EXECUTE FUNCTION update_example_scores();

-- Views for easy querying
CREATE OR REPLACE VIEW example_stats AS
SELECT 
    e.id,
    e.text,
    e.languages,
    e.vote_score,
    e.quality_score,
    e.verification_status,
    COUNT(DISTINCT ev.id) as total_votes,
    COUNT(DISTINCT CASE WHEN ev.vote_type = 'accurate' THEN ev.id END) as accurate_votes,
    COUNT(DISTINCT CASE WHEN ev.vote_type = 'inaccurate' THEN ev.id END) as inaccurate_votes,
    COUNT(DISTINCT mt.id) as manual_tags_count,
    e.created_at,
    e.updated_at
FROM examples e
LEFT JOIN example_votes ev ON e.id = ev.example_id
LEFT JOIN manual_tags mt ON e.id = mt.example_id
GROUP BY e.id, e.text, e.languages, e.vote_score, e.quality_score, e.verification_status, e.created_at, e.updated_at;

-- View for user contribution statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.tier,
    COUNT(DISTINCT e.id) as examples_submitted,
    COUNT(DISTINCT ev.id) as votes_cast,
    COUNT(DISTINCT mt.id) as tags_contributed,
    SUM(COALESCE(uc.points, 0)) as total_points,
    u.created_at,
    MAX(COALESCE(e.created_at, ev.created_at, mt.created_at)) as last_activity
FROM users u
LEFT JOIN examples e ON u.id = e.user_id
LEFT JOIN example_votes ev ON u.id = ev.user_id
LEFT JOIN manual_tags mt ON u.id = mt.user_id
LEFT JOIN user_contributions uc ON u.id = uc.user_id
GROUP BY u.id, u.name, u.email, u.tier, u.created_at;