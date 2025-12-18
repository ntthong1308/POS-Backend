-- =============================================
-- Remove diem_su_dung column from hoa_don table
-- =============================================
-- Migration: V16__remove_diem_su_dung.sql
-- Date: 2025-12-07
-- Description: Xóa column diem_su_dung vì không còn sử dụng điểm để giảm giá

-- SQL Server requires dropping the default constraint before dropping the column
-- Find and drop the default constraint if it exists
DECLARE @constraintName NVARCHAR(200)
SELECT @constraintName = name 
FROM sys.default_constraints 
WHERE parent_object_id = OBJECT_ID('hoa_don') 
AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('hoa_don'), 'diem_su_dung', 'ColumnId')

IF @constraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE hoa_don DROP CONSTRAINT ' + @constraintName)
END

-- Now drop the column
ALTER TABLE hoa_don DROP COLUMN diem_su_dung;

