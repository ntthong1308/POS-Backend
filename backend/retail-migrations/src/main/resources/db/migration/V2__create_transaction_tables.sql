-- =============================================
-- Create Transaction Tables
-- =============================================

-- Hóa đơn
CREATE TABLE hoa_don (
                         id BIGINT IDENTITY(1,1) PRIMARY KEY,
                         ma_hoa_don VARCHAR(50) NOT NULL UNIQUE,
                         khach_hang_id BIGINT,
                         nhan_vien_id BIGINT NOT NULL,
                         chi_nhanh_id BIGINT NOT NULL,
                         ngay_tao DATETIME2 NOT NULL,
                         tong_tien DECIMAL(18,2) NOT NULL,
                         giam_gia DECIMAL(18,2) DEFAULT 0,
                         thanh_tien DECIMAL(18,2) NOT NULL,
                         phuong_thuc_thanh_toan VARCHAR(50),
                         diem_su_dung DECIMAL(10,2) DEFAULT 0,
                         diem_tich_luy DECIMAL(10,2) DEFAULT 0,
                         ghi_chu NVARCHAR(MAX),
                         trang_thai VARCHAR(20) NOT NULL,
                         created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                         updated_at DATETIME2,
                         created_by VARCHAR(50),
                         updated_by VARCHAR(50),
                         FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id),
                         FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id),
                         FOREIGN KEY (chi_nhanh_id) REFERENCES chi_nhanh(id)
);

CREATE INDEX idx_ma_hoa_don ON hoa_don(ma_hoa_don);
CREATE INDEX idx_ngay_tao ON hoa_don(ngay_tao);

-- Chi tiết hóa đơn
CREATE TABLE chi_tiet_hoa_don (
                                  id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                  hoa_don_id BIGINT NOT NULL,
                                  san_pham_id BIGINT NOT NULL,
                                  so_luong INT NOT NULL,
                                  don_gia DECIMAL(18,2) NOT NULL,
                                  thanh_tien DECIMAL(18,2) NOT NULL,
                                  ghi_chu NVARCHAR(500),
                                  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                  updated_at DATETIME2,
                                  created_by VARCHAR(50),
                                  updated_by VARCHAR(50),
                                  FOREIGN KEY (hoa_don_id) REFERENCES hoa_don(id),
                                  FOREIGN KEY (san_pham_id) REFERENCES san_pham(id)
);

CREATE INDEX idx_hoa_don_id ON chi_tiet_hoa_don(hoa_don_id);

-- Nhập hàng
CREATE TABLE nhap_hang (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           ma_nhap_hang VARCHAR(50) NOT NULL UNIQUE,
                           nha_cung_cap_id BIGINT NOT NULL,
                           chi_nhanh_id BIGINT NOT NULL,
                           nhan_vien_id BIGINT NOT NULL,
                           ngay_nhap DATETIME2 NOT NULL,
                           tong_tien DECIMAL(18,2) NOT NULL,
                           ghi_chu NVARCHAR(MAX),
                           trang_thai VARCHAR(20) NOT NULL,
                           created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                           updated_at DATETIME2,
                           created_by VARCHAR(50),
                           updated_by VARCHAR(50),
                           FOREIGN KEY (nha_cung_cap_id) REFERENCES nha_cung_cap(id),
                           FOREIGN KEY (chi_nhanh_id) REFERENCES chi_nhanh(id),
                           FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id)
);

CREATE INDEX idx_ma_nhap_hang ON nhap_hang(ma_nhap_hang);
CREATE INDEX idx_ngay_nhap ON nhap_hang(ngay_nhap);

-- Chi tiết nhập hàng
CREATE TABLE chi_tiet_nhap_hang (
                                    id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                    nhap_hang_id BIGINT NOT NULL,
                                    san_pham_id BIGINT NOT NULL,
                                    so_luong INT NOT NULL,
                                    don_gia DECIMAL(18,2) NOT NULL,
                                    thanh_tien DECIMAL(18,2) NOT NULL,
                                    ghi_chu NVARCHAR(500),
                                    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                    updated_at DATETIME2,
                                    created_by VARCHAR(50),
                                    updated_by VARCHAR(50),
                                    FOREIGN KEY (nhap_hang_id) REFERENCES nhap_hang(id),
                                    FOREIGN KEY (san_pham_id) REFERENCES san_pham(id)
);

CREATE INDEX idx_nhap_hang_id ON chi_tiet_nhap_hang(nhap_hang_id);

-- Phiếu trả hàng
CREATE TABLE phieu_tra_hang (
                                id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                ma_phieu_tra VARCHAR(50) NOT NULL UNIQUE,
                                hoa_don_goc_id BIGINT NOT NULL,
                                san_pham_id BIGINT NOT NULL,
                                so_luong_tra INT NOT NULL,
                                don_gia DECIMAL(18,2) NOT NULL,
                                tong_tien_tra DECIMAL(18,2) NOT NULL,
                                nhan_vien_id BIGINT NOT NULL,
                                ngay_tra DATETIME2 NOT NULL,
                                ly_do_tra NVARCHAR(MAX),
                                trang_thai VARCHAR(20) NOT NULL,
                                created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                updated_at DATETIME2,
                                created_by VARCHAR(50),
                                updated_by VARCHAR(50),
                                FOREIGN KEY (hoa_don_goc_id) REFERENCES hoa_don(id),
                                FOREIGN KEY (san_pham_id) REFERENCES san_pham(id),
                                FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id)
);

CREATE INDEX idx_ma_tra_hang ON phieu_tra_hang(ma_phieu_tra);
CREATE INDEX idx_ngay_tra ON phieu_tra_hang(ngay_tra);

-- Audit log
CREATE TABLE audit_log (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           entity_name VARCHAR(100) NOT NULL,
                           entity_id BIGINT NOT NULL,
                           action VARCHAR(50) NOT NULL,
                           user_id BIGINT,
                           username VARCHAR(50),
                           old_value NVARCHAR(MAX),
                           new_value NVARCHAR(MAX),
                           action_time DATETIME2 NOT NULL,
                           ip_address VARCHAR(50)
);

CREATE INDEX idx_entity_name ON audit_log(entity_name);
CREATE INDEX idx_action_time ON audit_log(action_time);