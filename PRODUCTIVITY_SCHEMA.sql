-- ============================================
-- PRODUCTIVITY & ANALYTICS SCHEMA
-- ============================================
-- Run these SQL commands in your Supabase SQL Editor
-- to create tables for storing productivity metrics
-- ============================================

-- 1. Daily Productivity Stats Table
-- Stores aggregated daily statistics for each user
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    
    -- Task metrics
    tasks_completed INTEGER DEFAULT 0,
    tasks_created INTEGER DEFAULT 0,
    tasks_pending INTEGER DEFAULT 0,
    high_priority_completed INTEGER DEFAULT 0,
    medium_priority_completed INTEGER DEFAULT 0,
    low_priority_completed INTEGER DEFAULT 0,
    
    -- Study metrics
    notes_created INTEGER DEFAULT 0,
    subjects_studied INTEGER DEFAULT 0,
    study_sessions INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    
    -- Project/Goal metrics
    projects_worked_on INTEGER DEFAULT 0,
    goals_progress_updated INTEGER DEFAULT 0,
    
    -- Calculated scores (0-100)
    productivity_score INTEGER DEFAULT 0,
    consistency_score INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user per day
    UNIQUE(user_id, stat_date)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, stat_date DESC);


-- 2. Activity Log Table
-- Tracks individual user actions for audit trail and detailed analytics
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL, -- 'task_completed', 'note_created', 'subject_added', etc.
    activity_description TEXT,
    entity_type VARCHAR(50), -- 'task', 'note', 'subject', 'project', 'goal'
    entity_id UUID, -- ID of the related entity
    
    -- Metadata
    activity_date TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB, -- Store additional data like priority, subject_id, etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_log(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(activity_type);


-- 3. Study Sessions Table
-- Track focused study/work sessions with timer functionality
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Session details
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    
    -- Time tracking
    session_date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER, -- Calculated: (end_time - start_time) in minutes
    
    -- Session metadata
    session_type VARCHAR(20) DEFAULT 'study', -- 'study', 'focus', 'break', 'review'
    notes TEXT,
    completed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON study_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON study_sessions(subject_id);


-- 4. Streaks Table
-- Track user consistency streaks (daily tasks, study sessions, etc.)
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Streak details
    streak_type VARCHAR(50) NOT NULL, -- 'daily_task', 'study_session', 'note_taking', etc.
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    
    -- Date tracking
    last_activity_date DATE,
    streak_start_date DATE,
    longest_streak_start_date DATE,
    longest_streak_end_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One streak record per user per type
    UNIQUE(user_id, streak_type)
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_streaks_user ON user_streaks(user_id);


-- 5. Weekly Summary Table
-- Pre-calculated weekly statistics for faster dashboard loading
CREATE TABLE IF NOT EXISTS weekly_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Week identification
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    year INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    
    -- Aggregated metrics
    total_tasks_completed INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    total_notes_created INTEGER DEFAULT 0,
    avg_productivity_score INTEGER DEFAULT 0,
    
    -- Top performers
    most_productive_day DATE,
    most_studied_subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One record per user per week
    UNIQUE(user_id, week_start_date)
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_weekly_user_date ON weekly_summary(user_id, week_start_date DESC);


-- 6. Enable Row Level Security (RLS)
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summary ENABLE ROW LEVEL SECURITY;


-- 7. Create RLS Policies
-- Users can only access their own data

-- Daily Stats Policies
CREATE POLICY "Users can view their own daily stats"
    ON daily_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats"
    ON daily_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats"
    ON daily_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Activity Log Policies
CREATE POLICY "Users can view their own activity log"
    ON activity_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity log"
    ON activity_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Study Sessions Policies
CREATE POLICY "Users can view their own study sessions"
    ON study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
    ON study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
    ON study_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions"
    ON study_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Streaks Policies
CREATE POLICY "Users can view their own streaks"
    ON user_streaks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
    ON user_streaks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
    ON user_streaks FOR UPDATE
    USING (auth.uid() = user_id);

-- Weekly Summary Policies
CREATE POLICY "Users can view their own weekly summary"
    ON weekly_summary FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly summary"
    ON weekly_summary FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly summary"
    ON weekly_summary FOR UPDATE
    USING (auth.uid() = user_id);


-- 8. Create helper function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats(
    p_user_id UUID,
    p_stat_date DATE DEFAULT CURRENT_DATE
) RETURNS void AS $$
BEGIN
    INSERT INTO daily_stats (
        user_id,
        stat_date,
        tasks_completed,
        tasks_pending,
        high_priority_completed,
        medium_priority_completed,
        low_priority_completed,
        notes_created
    )
    SELECT
        p_user_id,
        p_stat_date,
        COUNT(CASE WHEN status = 'completed' AND DATE(completed_at) = p_stat_date THEN 1 END),
        COUNT(CASE WHEN status = 'pending' THEN 1 END),
        COUNT(CASE WHEN status = 'completed' AND priority = 'high' AND DATE(completed_at) = p_stat_date THEN 1 END),
        COUNT(CASE WHEN status = 'completed' AND priority = 'medium' AND DATE(completed_at) = p_stat_date THEN 1 END),
        COUNT(CASE WHEN status = 'completed' AND priority = 'low' AND DATE(completed_at) = p_stat_date THEN 1 END),
        (SELECT COUNT(*) FROM notes WHERE user_id = p_user_id AND DATE(created_at) = p_stat_date)
    FROM tasks
    WHERE user_id = p_user_id
    ON CONFLICT (user_id, stat_date)
    DO UPDATE SET
        tasks_completed = EXCLUDED.tasks_completed,
        tasks_pending = EXCLUDED.tasks_pending,
        high_priority_completed = EXCLUDED.high_priority_completed,
        medium_priority_completed = EXCLUDED.medium_priority_completed,
        low_priority_completed = EXCLUDED.low_priority_completed,
        notes_created = EXCLUDED.notes_created,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 9. Create trigger to auto-log activities
CREATE OR REPLACE FUNCTION log_task_completion() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
        INSERT INTO activity_log (
            user_id,
            activity_type,
            activity_description,
            entity_type,
            entity_id,
            metadata
        ) VALUES (
            NEW.user_id,
            'task_completed',
            'Completed task: ' || NEW.title,
            'task',
            NEW.id,
            jsonb_build_object(
                'priority', NEW.priority,
                'frequency', NEW.frequency,
                'subject_id', NEW.subject_id
            )
        );
        
        -- Update daily stats
        PERFORM update_daily_stats(NEW.user_id, CURRENT_DATE);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to tasks table
DROP TRIGGER IF EXISTS task_completion_trigger ON tasks;
CREATE TRIGGER task_completion_trigger
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_task_completion();


-- 10. Sample queries for analytics

-- Get user's productivity over last 30 days
-- SELECT stat_date, productivity_score, tasks_completed
-- FROM daily_stats
-- WHERE user_id = auth.uid()
--   AND stat_date >= CURRENT_DATE - INTERVAL '30 days'
-- ORDER BY stat_date DESC;

-- Get current streaks for user
-- SELECT streak_type, current_streak, longest_streak
-- FROM user_streaks
-- WHERE user_id = auth.uid();

-- Get recent activity
-- SELECT activity_type, activity_description, activity_date
-- FROM activity_log
-- WHERE user_id = auth.uid()
-- ORDER BY activity_date DESC
-- LIMIT 20;

-- Get weekly summary
-- SELECT week_start_date, total_tasks_completed, total_study_minutes, avg_productivity_score
-- FROM weekly_summary
-- WHERE user_id = auth.uid()
-- ORDER BY week_start_date DESC;
