-- =============================================
-- Create Base Tables
-- =============================================

-- Chi nhánh
CREATE TABLE chi_nhanh (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           ma_chi_nhanh VARCHAR(20) NOT NULL UNIQUE,
                           ten_chi_nhanh NVARCHAR(200) NOT NULL,
                           dia_chi NVARCHAR(500),
                           so_dien_thoai VARCHAR(20),
                           trang_thai VARCHAR(20) NOT NULL,
                           created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                           updated_at DATETIME2,
                           created_by VARCHAR(50),
                           updated_by VARCHAR(50)
);

-- Nhà cung cấp
CREATE TABLE nha_cung_cap (
                              id BIGINT IDENTITY(1,1) PRIMARY KEY,
                              ma_ncc VARCHAR(20) NOT NULL UNIQUE,
                              ten_ncc NVARCHAR(200) NOT NULL,
                              dia_chi NVARCHAR(500),
                              so_dien_thoai VARCHAR(20),
                              email VARCHAR(100),
                              trang_thai VARCHAR(20) NOT NULL,
                              created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                              updated_at DATETIME2,
                              created_by VARCHAR(50),
                              updated_by VARCHAR(50)
);

-- Sản phẩm
CREATE TABLE san_pham (
                          id BIGINT IDENTITY(1,1) PRIMARY KEY,
                          ma_san_pham VARCHAR(50) NOT NULL UNIQUE,
                          barcode VARCHAR(50) UNIQUE,
                          ten_san_pham NVARCHAR(200) NOT NULL,
                          mo_ta NVARCHAR(MAX),
                          don_vi_tinh NVARCHAR(50),
                          gia_ban DECIMAL(18,2) NOT NULL,
                          gia_nhap DECIMAL(18,2),
                          ton_kho INT NOT NULL DEFAULT 0,
                          ton_kho_toi_thieu INT,
                          chi_nhanh_id BIGINT,
                          nha_cung_cap_id BIGINT,
                          trang_thai VARCHAR(20) NOT NULL,
                          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                          updated_at DATETIME2,
                          created_by VARCHAR(50),
                          updated_by VARCHAR(50),
                          FOREIGN KEY (chi_nhanh_id) REFERENCES chi_nhanh(id),
                          FOREIGN KEY (nha_cung_cap_id) REFERENCES nha_cung_cap(id)
);

CREATE INDEX idx_barcode ON san_pham(barcode);
CREATE INDEX idx_ten_san_pham ON san_pham(ten_san_pham);

-- Khách hàng
CREATE TABLE khach_hang (
                            id BIGINT IDENTITY(1,1) PRIMARY KEY,
                            ma_khach_hang VARCHAR(20) NOT NULL UNIQUE,
                            ten_khach_hang NVARCHAR(200) NOT NULL,
                            so_dien_thoai VARCHAR(20),
                            email VARCHAR(100),
                            dia_chi NVARCHAR(500),
                            diem_tich_luy DECIMAL(10,2) DEFAULT 0,
                            trang_thai VARCHAR(20) NOT NULL,
                            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                            updated_at DATETIME2,
                            created_by VARCHAR(50),
                            updated_by VARCHAR(50)
);

CREATE INDEX idx_sdt ON khach_hang(so_dien_thoai);
CREATE INDEX idx_email ON khach_hang(email);

-- Nhân viên
CREATE TABLE nhan_vien (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           ma_nhan_vien VARCHAR(20) NOT NULL UNIQUE,
                           ten_nhan_vien NVARCHAR(200) NOT NULL,
                           username VARCHAR(50) NOT NULL UNIQUE,
                           password VARCHAR(255) NOT NULL,
                           email VARCHAR(100),
                           so_dien_thoai VARCHAR(20),
                           role VARCHAR(20) NOT NULL,
                           chi_nhanh_id BIGINT,
                           trang_thai VARCHAR(20) NOT NULL,
                           created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                           updated_at DATETIME2,
                           created_by VARCHAR(50),
                           updated_by VARCHAR(50),
                           FOREIGN KEY (chi_nhanh_id) REFERENCES chi_nhanh(id)
);

CREATE UNIQUE INDEX idx_username ON nhan_vien(username);