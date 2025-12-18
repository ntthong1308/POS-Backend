-- =============================================
-- Create Nguyen Lieu (Raw Materials) Tables
-- =============================================

-- Bảng nguyên liệu
CREATE TABLE nguyen_lieu (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_nguyen_lieu VARCHAR(50) NOT NULL UNIQUE,
    ten_nguyen_lieu NVARCHAR(200) NOT NULL,
    don_vi_tinh NVARCHAR(50),
    so_luong INT NOT NULL DEFAULT 0,
    chi_nhanh_id BIGINT,
    trang_thai VARCHAR(20) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (chi_nhanh_id) REFERENCES chi_nhanh(id)
);

CREATE INDEX idx_ma_nguyen_lieu ON nguyen_lieu(ma_nguyen_lieu);
CREATE INDEX idx_ten_nguyen_lieu ON nguyen_lieu(ten_nguyen_lieu);

-- Bảng phiếu nhập/xuất nguyên liệu
CREATE TABLE phieu_nhap_xuat_nguyen_lieu (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_phieu VARCHAR(50) NOT NULL UNIQUE,
    nguyen_lieu_id BIGINT NOT NULL,
    ngay_nhap_xuat DATETIME2 NOT NULL,
    loai_phieu VARCHAR(20) NOT NULL, -- NHAP hoặc XUAT
    so_luong INT NOT NULL,
    nhan_vien_id BIGINT NOT NULL,
    ghi_chu NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (nguyen_lieu_id) REFERENCES nguyen_lieu(id),
    FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id)
);

CREATE INDEX idx_nguyen_lieu_id ON phieu_nhap_xuat_nguyen_lieu(nguyen_lieu_id);
CREATE INDEX idx_ngay_nhap_xuat ON phieu_nhap_xuat_nguyen_lieu(ngay_nhap_xuat);
CREATE INDEX idx_loai_phieu ON phieu_nhap_xuat_nguyen_lieu(loai_phieu);

