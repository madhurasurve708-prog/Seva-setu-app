-- Prompt 4 Schema Changes
-- Add user management flags to Citizen, Nagarsevak, and Department Officer models
-- Add announcement management fields to Announcement model

-- Add user management flags to citizens table
ALTER TABLE citizens 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add user management flags to nagarsevaks table
ALTER TABLE nagarsevaks 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add user management flags to department_officers table
ALTER TABLE department_officers 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add announcement management fields to announcements table
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(512),
ADD COLUMN IF NOT EXISTS target_department VARCHAR(200),
ADD COLUMN IF NOT EXISTS created_by VARCHAR(150),
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for filtering non-deleted announcements
CREATE INDEX IF NOT EXISTS idx_announcements_not_deleted ON announcements(is_deleted) WHERE is_deleted = FALSE;

-- Add index for filtering non-archived announcements
CREATE INDEX IF NOT EXISTS idx_announcements_not_archived ON announcements(is_archived) WHERE is_archived = FALSE;

-- Add indexes for user management
CREATE INDEX IF NOT EXISTS idx_citizens_not_deleted ON citizens(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_citizens_is_active ON citizens(is_active);
CREATE INDEX IF NOT EXISTS idx_citizens_is_blocked ON citizens(is_blocked);

CREATE INDEX IF NOT EXISTS idx_nagarsevaks_not_deleted ON nagarsevaks(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_nagarsevaks_is_active ON nagarsevaks(is_active);
CREATE INDEX IF NOT EXISTS idx_nagarsevaks_is_blocked ON nagarsevaks(is_blocked);

CREATE INDEX IF NOT EXISTS idx_department_officers_not_deleted ON department_officers(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_department_officers_is_active ON department_officers(is_active);
CREATE INDEX IF NOT EXISTS idx_department_officers_is_blocked ON department_officers(is_blocked);
