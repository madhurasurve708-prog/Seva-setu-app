-- Prompt 5 Analytics & Audit Logs SQL Migration
-- Create audit_logs table and add indexes for analytics queries

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_name VARCHAR(150) NOT NULL,
    admin_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    remarks VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for audit log filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_name ON audit_logs(admin_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Add composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_action ON audit_logs(admin_name, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date_range ON audit_logs(created_at DESC, action);

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_ward_id ON complaints(ward_id);
CREATE INDEX IF NOT EXISTS idx_complaints_category_id ON complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_complaints_updated_at ON complaints(updated_at);

-- Add index for complaint escalation queries
CREATE INDEX IF NOT EXISTS idx_complaint_escalations_complaint_id ON complaint_escalations(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_escalations_escalated_at ON complaint_escalations(escalated_at);

-- Add composite index for ward performance queries
CREATE INDEX IF NOT EXISTS idx_complaints_ward_status ON complaints(ward_id, status);

-- Add composite index for category analytics
CREATE INDEX IF NOT EXISTS idx_complaints_category_status ON complaints(category_id, status);
