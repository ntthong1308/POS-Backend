-- Fix barcode unique constraint to allow multiple NULL values
-- SQL Server does not allow multiple NULLs in UNIQUE constraint by default
-- Solution: Drop existing constraint and create filtered unique index

-- Drop existing unique constraint on barcode (if exists by specific name)
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ__san_pham__C16E36F8A3840545' AND object_id = OBJECT_ID('san_pham'))
BEGIN
    ALTER TABLE san_pham DROP CONSTRAINT UQ__san_pham__C16E36F8A3840545;
END

-- Drop any other unique constraints on barcode column
-- Join sys.key_constraints with sys.index_columns to find constraints on barcode column
DECLARE @constraint_name NVARCHAR(200);
DECLARE @sql_constraint NVARCHAR(500);

SELECT TOP 1 @constraint_name = kc.name
FROM sys.key_constraints kc
INNER JOIN sys.indexes i ON kc.parent_object_id = i.object_id AND kc.unique_index_id = i.index_id
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE kc.parent_object_id = OBJECT_ID('san_pham')
  AND kc.type = 'UQ'
  AND c.name = 'barcode';

IF @constraint_name IS NOT NULL
BEGIN
    SET @sql_constraint = 'ALTER TABLE san_pham DROP CONSTRAINT ' + QUOTENAME(@constraint_name);
    EXEC sp_executesql @sql_constraint;
END

-- Also check and drop unique indexes directly on barcode (not constraints)
DECLARE @index_name NVARCHAR(200);
DECLARE @sql_index NVARCHAR(500);

SELECT TOP 1 @index_name = i.name
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID('san_pham')
  AND i.is_unique = 1
  AND c.name = 'barcode'
  AND i.name NOT LIKE 'PK_%'  -- Don't drop primary key
  AND NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE unique_index_id = i.index_id AND parent_object_id = i.object_id);

IF @index_name IS NOT NULL
BEGIN
    SET @sql_index = 'DROP INDEX ' + QUOTENAME(@index_name) + ' ON san_pham';
    EXEC sp_executesql @sql_index;
END

-- Create filtered unique index that allows multiple NULLs
-- This index only enforces uniqueness for non-NULL values
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_san_pham_barcode_unique' AND object_id = OBJECT_ID('san_pham'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_san_pham_barcode_unique 
    ON san_pham(barcode) 
    WHERE barcode IS NOT NULL;
END

