-- =============================================
-- Increase hinh_anh column to NVARCHAR(MAX)
-- =============================================
-- Migration để thay đổi column hinh_anh thành NVARCHAR(MAX)
-- Để hỗ trợ URL hình ảnh rất dài (base64 encoded images, long URLs, etc.)

-- Check if column exists
IF EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'san_pham' 
    AND COLUMN_NAME = 'hinh_anh'
)
BEGIN
    -- Check if column is not already NVARCHAR(MAX)
    IF EXISTS (
        SELECT 1 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'san_pham' 
        AND COLUMN_NAME = 'hinh_anh'
        AND (CHARACTER_MAXIMUM_LENGTH IS NOT NULL AND CHARACTER_MAXIMUM_LENGTH < 2147483647)
    )
    BEGIN
        ALTER TABLE san_pham
        ALTER COLUMN hinh_anh NVARCHAR(MAX) NULL;
        
        PRINT 'Column hinh_anh đã được cập nhật thành NVARCHAR(MAX)';
    END
    ELSE
    BEGIN
        PRINT 'Column hinh_anh đã là NVARCHAR(MAX), không cần cập nhật';
    END
END
ELSE
BEGIN
    PRINT 'Column hinh_anh không tồn tại, bỏ qua migration này';
END

