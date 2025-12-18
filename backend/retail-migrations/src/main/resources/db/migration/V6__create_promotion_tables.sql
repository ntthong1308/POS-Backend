-- =============================================
-- Create Promotion Tables
-- =============================================

-- Khuyến mãi
CREATE TABLE khuyen_mai (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_khuyen_mai VARCHAR(50) NOT NULL UNIQUE,
    ten_khuyen_mai NVARCHAR(200) NOT NULL,
    mo_ta NVARCHAR(MAX),
    loai_khuyen_mai VARCHAR(50) NOT NULL,
    chi_nhanh_id BIGINT,
    ngay_bat_dau DATETIME2 NOT NULL,
    ngay_ket_thuc DATETIME2 NOT NULL,
    gia_tri_khuyen_mai DECIMAL(18,2),
    gia_tri_toi_thieu DECIMAL(18,2),
    giam_toi_da DECIMAL(18,2),
    so_luong_mua INT,
    so_luong_tang INT,
    so_lan_su_dung_toi_da INT,
    tong_so_lan_su_dung_toi_da INT,
    so_lan_da_su_dung INT DEFAULT 0,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    anh_khuyen_mai VARCHAR(500),
    dieu_kien NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    CONSTRAINT fk_khuyen_mai_chi_nhanh 
        FOREIGN KEY (chi_nhanh_id) 
        REFERENCES chi_nhanh(id)
);

-- Chi tiết khuyến mãi (liên kết với sản phẩm)
CREATE TABLE chi_tiet_khuyen_mai (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    khuyen_mai_id BIGINT NOT NULL,
    san_pham_id BIGINT NOT NULL,
    ap_dung BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    CONSTRAINT fk_chi_tiet_khuyen_mai_khuyen_mai 
        FOREIGN KEY (khuyen_mai_id) 
        REFERENCES khuyen_mai(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_chi_tiet_khuyen_mai_san_pham 
        FOREIGN KEY (san_pham_id) 
        REFERENCES san_pham(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT uk_chi_tiet_khuyen_mai 
        UNIQUE (khuyen_mai_id, san_pham_id)
);

-- Indexes
CREATE INDEX idx_ma_khuyen_mai ON khuyen_mai(ma_khuyen_mai);
CREATE INDEX idx_ngay_bat_dau ON khuyen_mai(ngay_bat_dau);
CREATE INDEX idx_ngay_ket_thuc ON khuyen_mai(ngay_ket_thuc);
CREATE INDEX idx_trang_thai ON khuyen_mai(trang_thai);
CREATE INDEX idx_khuyen_mai_id ON chi_tiet_khuyen_mai(khuyen_mai_id);
CREATE INDEX idx_san_pham_id ON chi_tiet_khuyen_mai(san_pham_id);

