-- =============================================================================
-- Seva Setu — Master Data Seed Script
-- =============================================================================
-- Safe to execute multiple times.
-- Uses INSERT ... ON CONFLICT DO NOTHING so re-running never duplicates rows
-- or raises errors.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- WARDS  (ward_number 1 – 10)
-- -----------------------------------------------------------------------------

INSERT INTO wards (ward_number, ward_name) VALUES
    ('1',  'Ward 1'),
    ('2',  'Ward 2'),
    ('3',  'Ward 3'),
    ('4',  'Ward 4'),
    ('5',  'Ward 5'),
    ('6',  'Ward 6'),
    ('7',  'Ward 7'),
    ('8',  'Ward 8'),
    ('9',  'Ward 9'),
    ('10', 'Ward 10')
ON CONFLICT (ward_number) DO NOTHING;


-- -----------------------------------------------------------------------------
-- CATEGORIES
-- -----------------------------------------------------------------------------

INSERT INTO categories (name, description) VALUES
    ('Water',         'Issues related to water supply, leakage, or contamination.'),
    ('Garbage',       'Uncollected garbage, overflowing bins, or illegal dumping.'),
    ('Gutter',        'Blocked or overflowing gutters causing unhygienic conditions.'),
    ('Drainage',      'Clogged or broken drainage lines leading to waterlogging.'),
    ('Road',          'Potholes, damaged road surface, or broken pavements.'),
    ('Street Lights', 'Non-functional, damaged, or missing street lights.'),
    ('Animals',       'Stray animals causing public nuisance or safety concerns.'),
    ('Tree',          'Fallen trees, dangerous branches, or encroaching vegetation.'),
    ('Traffic',       'Traffic signal faults, illegal parking, or road blockages.'),
    ('Other',         'Any civic issue that does not fall under the above categories.')
ON CONFLICT (name) DO NOTHING;
