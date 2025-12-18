-- =============================================
-- Insert Initial Data
-- =============================================

-- Insert Chi nhánh
INSERT INTO chi_nhanh (ma_chi_nhanh, ten_chi_nhanh, dia_chi, so_dien_thoai, trang_thai, created_at)
VALUES
    ('CN001', N'Chi nhánh Trung tâm', N'123 Nguyễn Huệ, Quận 1, TP.HCM', '0281234567', 'ACTIVE', GETDATE()),
    ('CN002', N'Chi nhánh Quận 3', N'456 Lê Văn Sỹ, Quận 3, TP.HCM', '0287654321', 'ACTIVE', GETDATE());

-- Insert Nhà cung cấp
INSERT INTO nha_cung_cap (ma_ncc, ten_ncc, dia_chi, so_dien_thoai, email, trang_thai, created_at)
VALUES
    ('NCC001', N'Công ty TNHH ABC', N'789 Cách Mạng Tháng 8, Quận 10, TP.HCM', '0289876543', 'abc@example.com', 'ACTIVE', GETDATE()),
    ('NCC002', N'Công ty CP XYZ', N'321 Trần Hưng Đạo, Quận 5, TP.HCM', '0283456789', 'xyz@example.com', 'ACTIVE', GETDATE());

-- Insert Admin User (password: admin123 - BCrypt encoded)
INSERT INTO nhan_vien (ma_nhan_vien, ten_nhan_vien, username, password, email, so_dien_thoai, role, chi_nhanh_id, trang_thai, created_at)
VALUES
    ('NV001', N'Quản trị viên', 'admin', '$2a$10$xQx0YKPGx8F7LGhFBsGJe.UDxXLHg3lQnYDJHN1JxXjYNxYhXBjES', 'admin@retail.com', '0901234567', 'ADMIN', 1, 'ACTIVE', GETDATE()),
    ('NV002', N'Nguyễn Văn A', 'manager1', '$2a$10$xQx0YKPGx8F7LGhFBsGJe.UDxXLHg3lQnYDJHN1JxXjYNxYhXBjES', 'manager1@retail.com', '0902345678', 'MANAGER', 1, 'ACTIVE', GETDATE()),
    ('NV003', N'Trần Thị B', 'cashier1', '$2a$10$xQx0YKPGx8F7LGhFBsGJe.UDxXLHg3lQnYDJHN1JxXjYNxYhXBjES', 'cashier1@retail.com', '0903456789', 'CASHIER', 1, 'ACTIVE', GETDATE());

-- Insert Sample Products
INSERT INTO san_pham (ma_san_pham, barcode, ten_san_pham, mo_ta, don_vi_tinh, gia_ban, gia_nhap, ton_kho, ton_kho_toi_thieu, chi_nhanh_id, nha_cung_cap_id, trang_thai, created_at)
VALUES
    ('SP001', '8934567890123', N'Nước ngọt Coca Cola 330ml', N'Nước ngọt có ga', N'Lon', 10000, 7000, 100, 20, 1, 1, 'ACTIVE', GETDATE()),
    ('SP002', '8934567890124', N'Snack Oishi 50g', N'Snack vị tôm', N'Gói', 8000, 5500, 150, 30, 1, 1, 'ACTIVE', GETDATE()),
    ('SP003', '8934567890125', N'Mì Hảo Hảo tôm chua cay', N'Mì ăn liền', N'Gói', 4000, 3000, 200, 50, 1, 2, 'ACTIVE', GETDATE()),
    ('SP004', '8934567890126', N'Bánh Chocopie', N'Bánh socola', N'Hộp', 25000, 18000, 80, 15, 1, 2, 'ACTIVE', GETDATE()),
    ('SP005', '8934567890127', N'Nước suối Lavie 500ml', N'Nước khoáng', N'Chai', 5000, 3500, 300, 50, 1, 1, 'ACTIVE', GETDATE());

-- Insert Sample Customers
INSERT INTO khach_hang (ma_khach_hang, ten_khach_hang, so_dien_thoai, email, dia_chi, diem_tich_luy, trang_thai, created_at)
VALUES
    ('KH001', N'Nguyễn Thị C', '0911111111', 'customer1@example.com', N'123 ABC, Quận 1', 0, 'ACTIVE', GETDATE()),
    ('KH002', N'Lê Văn D', '0922222222', 'customer2@example.com', N'456 DEF, Quận 3', 0, 'ACTIVE', GETDATE());