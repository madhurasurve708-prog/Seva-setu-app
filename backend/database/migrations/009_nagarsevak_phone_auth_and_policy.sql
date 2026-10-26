-- =============================================================================
-- Migration 009: Nagarsevak Mobile Authentication & Password Policy
-- =============================================================================
-- Description:
-- 1. Enforces uniqueness on nagarsevaks.phone_number to support independent
--    account lookup and authentication by registered mobile number.
-- 2. Adds must_change_password column (default FALSE) to safely support
--    temporary onboarding password policy without breaking existing accounts.
-- =============================================================================

-- 1. Unique index for phone number lookup across all Nagarsevak accounts
CREATE UNIQUE INDEX IF NOT EXISTS uq_nagarsevaks_phone_number ON nagarsevaks(phone_number);

-- 2. Onboarding password change requirement column
-- Existing accounts default to FALSE so they are not disrupted.
ALTER TABLE nagarsevaks
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE NOT NULL;

-- Index to support quick lookups on accounts requiring password changes
CREATE INDEX IF NOT EXISTS idx_nagarsevaks_must_change_password ON nagarsevaks(must_change_password);
