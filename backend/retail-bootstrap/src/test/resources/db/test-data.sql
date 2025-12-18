-- =============================================
-- Test Data for E2E Tests
-- =============================================

-- Clean up existing data
DELETE FROM chi_tiet_hoa_don;
DELETE FROM hoa_don;
DELETE FROM chi_tiet_khuyen_mai;
DELETE FROM khuyen_mai;
DELETE FROM san_pham;
DELETE FROM khach_hang;
DELETE FROM nhan_vien;
DELETE FROM nha_cung_cap;
DELETE FROM chi_nhanh;

-- Insert Chi nhánh
SET IDENTITY_INSERT chi_nhanh ON;
INSERT INTO chi_nhanh (id, ma_chi_nhanh, ten_chi_nhanh, dia_chi, so_dien_thoai, trang_thai, created_at)
VALUES
    (1, 'CN001', N'Chi nhánh Trung tâm', N'123 Nguyễn Huệ, Quận 1, TP.HCM', '0281234567', 'ACTIVE', GETDATE());
SET IDENTITY_INSERT chi_nhanh OFF;

-- Insert Nhà cung cấp
SET IDENTITY_INSERT nha_cung_cap ON;
INSERT INTO nha_cung_cap (id, ma_ncc, ten_ncc, dia_chi, so_dien_thoai, email, trang_thai, created_at)
VALUES
    (1, 'NCC001', N'Công ty TNHH ABC', N'789 Cách Mạng Tháng 8', '0289876543', 'abc@example.com', 'ACTIVE', GETDATE());
SET IDENTITY_INSERT nha_cung_cap OFF;

-- Insert Nhan vien (password: admin123)
SET IDENTITY_INSERT nhan_vien ON;
INSERT INTO nhan_vien (id, ma_nhan_vien, ten_nhan_vien, username, password, email, so_dien_thoai, role, chi_nhanh_id, trang_thai, created_at)
VALUES
    (3, 'NV003', N'Trần Thị B', 'cashier1', '$2a$10$xQx0YKPGx8F7LGhFBsGJe.UDxXLHg3lQnYDJHN1JxXjYNxYhXBjES', 'cashier1@retail.com', '0903456789', 'CASHIER', 1, 'ACTIVE', GETDATE());
SET IDENTITY_INSERT nhan_vien OFF;

-- Insert San pham
SET IDENTITY_INSERT san_pham ON;
INSERT INTO san_pham (id, ma_san_pham, barcode, ten_san_pham, mo_ta, don_vi_tinh, gia_ban, gia_nhap, ton_kho, ton_kho_toi_thieu, chi_nhanh_id, nha_cung_cap_id, trang_thai, created_at)
VALUES
    (1, 'SP001', '8934567890123', N'Nước ngọt Coca Cola 330ml', N'Nước ngọt có ga', N'Lon', 10000, 7000, 100, 20, 1, 1, 'ACTIVE', GETDATE()),
    (2, 'SP002', '8934567890124', N'Snack Oishi 50g', N'Snack vị tôm', N'Gói', 8000, 5500, 150, 30, 1, 1, 'ACTIVE', GETDATE());
SET IDENTITY_INSERT san_pham OFF;

-- Insert Khach hang
SET IDENTITY_INSERT khach_hang ON;
INSERT INTO khach_hang (id, ma_khach_hang, ten_khach_hang, so_dien_thoai, email, dia_chi, diem_tich_luy, trang_thai, created_at)
VALUES
    (1, 'KH001', N'Nguyễn Thị C', '0911111111', 'customer1@example.com', N'123 ABC, Quận 1', 0, 'ACTIVE', GETDATE());
SET IDENTITY_INSERT khach_hang OFF;

