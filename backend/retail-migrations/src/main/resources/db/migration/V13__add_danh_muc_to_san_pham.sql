-- =============================================
-- Add danh_muc_id column to san_pham table
-- =============================================

-- Thêm column danh_muc_id vào bảng san_pham
ALTER TABLE san_pham
ADD danh_muc_id BIGINT;

-- Thêm foreign key constraint
ALTER TABLE san_pham
ADD CONSTRAINT FK_san_pham_danh_muc
FOREIGN KEY (danh_muc_id) REFERENCES danh_muc(id);

-- Thêm index cho column mới
CREATE INDEX idx_danh_muc_id ON san_pham(danh_muc_id);

