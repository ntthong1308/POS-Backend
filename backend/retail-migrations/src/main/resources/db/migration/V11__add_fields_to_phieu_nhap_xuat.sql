-- =============================================
-- Add fields to phieu_nhap_xuat_nguyen_lieu for adjustment and tracking
-- =============================================

-- Thêm các cột mới để hỗ trợ điều chỉnh số lượng và tracking
ALTER TABLE phieu_nhap_xuat_nguyen_lieu
    ADD so_luong_truoc INT NULL,
        so_luong_con_lai INT NULL;

