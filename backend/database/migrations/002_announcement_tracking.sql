-- Run this manually against an existing PostgreSQL database.
-- It is intentionally not executed by the application or this refactor.

BEGIN;

CREATE TABLE IF NOT EXISTS announcement_reads (
    id SERIAL PRIMARY KEY,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    reader_role VARCHAR(50) NOT NULL,
    reader_id INTEGER NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_announcement_read UNIQUE (announcement_id, reader_role, reader_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_reader
    ON announcement_reads(reader_role, reader_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement_id
    ON announcement_reads(announcement_id);

-- Preserve legacy Nagarsevak reads before removing the role-specific table.
DO $$
BEGIN
    IF to_regclass('public.nagarsevak_announcement_reads') IS NOT NULL THEN
        INSERT INTO announcement_reads (
            announcement_id,
            reader_role,
            reader_id,
            read_at
        )
        SELECT
            announcement_id,
            'NAGARSEVAK',
            nagarsevak_id,
            read_at
        FROM nagarsevak_announcement_reads
        ON CONFLICT (announcement_id, reader_role, reader_id) DO NOTHING;

        DROP TABLE nagarsevak_announcement_reads;
    END IF;
END $$;

COMMIT;
