-- =============================================
-- Add ngay_bat_dau (Start Date) to nhan_vien table
-- =============================================

-- Thêm cột ngày bắt đầu làm việc cho nhân viên
ALTER TABLE nhan_vien
ADD ngay_bat_dau DATE NULL;

-- Tạo index để tối ưu truy vấn theo ngày bắt đầu
CREATE INDEX idx_ngay_bat_dau ON nhan_vien(ngay_bat_dau);

