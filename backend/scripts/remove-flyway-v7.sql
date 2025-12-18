-- =============================================
-- Remove Flyway migration version 7 from history
-- =============================================
-- Migration này để xóa record version 7 trong flyway_schema_history
-- Vì migration V7 đã được đổi tên thành V8

-- First, check if V7 exists
SELECT * FROM flyway_schema_history 
WHERE version = 7;

-- Delete all records with version 7
DELETE FROM flyway_schema_history 
WHERE version = 7;

-- Verify deletion (should return 0 rows)
SELECT * FROM flyway_schema_history 
WHERE version = 7;

-- Show all migrations
SELECT version, description, type, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank;

