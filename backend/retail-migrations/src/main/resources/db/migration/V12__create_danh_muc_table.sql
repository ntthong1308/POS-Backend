-- =============================================
-- Create Danh Muc (Category) Table
-- =============================================

-- Bảng danh mục
CREATE TABLE danh_muc (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_danh_muc VARCHAR(50) NOT NULL UNIQUE,
    ten_danh_muc NVARCHAR(200) NOT NULL,
    mo_ta NVARCHAR(MAX),
    trang_thai VARCHAR(20) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX idx_ma_danh_muc ON danh_muc(ma_danh_muc);
CREATE INDEX idx_ten_danh_muc ON danh_muc(ten_danh_muc);

