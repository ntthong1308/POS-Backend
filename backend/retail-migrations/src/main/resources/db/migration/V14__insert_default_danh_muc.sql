-- =============================================
-- Insert default categories: Đồ ăn, Đồ uống
-- =============================================

-- Insert "Đồ ăn" category
INSERT INTO danh_muc (ma_danh_muc, ten_danh_muc, mo_ta, trang_thai, created_at)
VALUES ('DM001', N'Đồ ăn', N'Danh mục các loại đồ ăn, thức ăn', 'ACTIVE', GETDATE());

-- Insert "Đồ uống" category
INSERT INTO danh_muc (ma_danh_muc, ten_danh_muc, mo_ta, trang_thai, created_at)
VALUES ('DM002', N'Đồ uống', N'Danh mục các loại đồ uống, nước giải khát', 'ACTIVE', GETDATE());

