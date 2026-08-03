-- =============================================================================
-- Seva Setu — Nagarsevak Escalation + Announcements Schema Changes
-- =============================================================================

-- -----------------------------------------------------------------------------
-- COMPLAINT ESCALATIONS
-- Stores the escalation entries for complaints.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_escalations (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    escalated_by_role VARCHAR(50) NOT NULL,
    escalated_by_id INTEGER NOT NULL,
    escalated_by_name VARCHAR(150) NOT NULL,
    escalated_to VARCHAR(100) NOT NULL,
    escalation_note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_complaint_escalations_complaint_id ON complaint_escalations(complaint_id);

-- -----------------------------------------------------------------------------
-- ANNOUNCEMENTS
-- Stores announcements targeted to different audiences.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL, -- Emergency, High, Medium, Low
    target_type VARCHAR(50) NOT NULL, -- everyone, all_nagarsevaks, ward_nagarsevaks
    target_ward_id INTEGER REFERENCES wards(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- -----------------------------------------------------------------------------
-- ANNOUNCEMENT READS
-- Tracks read status for every portal role.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcement_reads (
    id SERIAL PRIMARY KEY,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    reader_role VARCHAR(50) NOT NULL,
    reader_id INTEGER NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_announcement_read UNIQUE (announcement_id, reader_role, reader_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_reader ON announcement_reads(reader_role, reader_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement_id ON announcement_reads(announcement_id);

-- -----------------------------------------------------------------------------
-- NOTIFICATIONS
-- Generic in-app notification foundation for all portal roles. Delivery and
-- push-notification behavior are intentionally outside this schema.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_role VARCHAR(50) NOT NULL,
    recipient_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient
    ON notifications(recipient_role, recipient_id, is_read, created_at DESC);
