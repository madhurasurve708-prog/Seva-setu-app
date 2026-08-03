-- Prompt 4 Final Cleanup SQL Migration
-- Add is_restricted flag to user tables for proper restriction logic

-- Add is_restricted to citizens table
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add is_restricted to nagarsevaks table
ALTER TABLE nagarsevaks ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add is_restricted to department_officers table
ALTER TABLE department_officers ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for is_restricted filtering on citizens
CREATE INDEX IF NOT EXISTS idx_citizens_is_restricted ON citizens(is_restricted);

-- Add index for is_restricted filtering on nagarsevaks
CREATE INDEX IF NOT EXISTS idx_nagarsevaks_is_restricted ON nagarsevaks(is_restricted);

-- Add index for is_restricted filtering on department_officers
CREATE INDEX IF NOT EXISTS idx_department_officers_is_restricted ON department_officers(is_restricted);

-- Add composite index for status-based filtering (for efficient Status filter in search)
CREATE INDEX IF NOT EXISTS idx_citizens_status_filter ON citizens(is_deleted, is_archived, is_blocked, is_restricted, is_active);
CREATE INDEX IF NOT EXISTS idx_nagarsevaks_status_filter ON nagarsevaks(is_deleted, is_archived, is_blocked, is_restricted, is_active);
CREATE INDEX IF NOT EXISTS idx_department_officers_status_filter ON department_officers(is_deleted, is_archived, is_blocked, is_restricted, is_active);
