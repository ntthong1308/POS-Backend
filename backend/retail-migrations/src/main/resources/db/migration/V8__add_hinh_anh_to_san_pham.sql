-- =============================================
-- Add hinh_anh column to san_pham table
-- =============================================
-- Migration để thêm field hình ảnh cho sản phẩm

-- Check if column exists before adding
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'san_pham' 
    AND COLUMN_NAME = 'hinh_anh'
)
BEGIN
    ALTER TABLE san_pham
    ADD hinh_anh NVARCHAR(MAX) NULL;
END

-- Add comment
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'URL hoặc path của hình ảnh sản phẩm', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'san_pham', 
    @level2type = N'COLUMN', @level2name = N'hinh_anh';

