-- =============================================
-- DAY 5: DATABASE OPTIMIZATION
-- Performance Indexes Migration
-- =============================================
-- Mục đích: Thêm composite indexes và indexes cho các query thường dùng
-- Để tối ưu hóa hiệu suất truy vấn

-- ========== HOA_DON TABLE OPTIMIZATION ==========

-- Index cho query theo chi nhánh và ngày tạo (thường dùng trong báo cáo)
CREATE NONCLUSTERED INDEX idx_hoa_don_chi_nhanh_ngay_tao 
ON hoa_don(chi_nhanh_id, ngay_tao DESC)
INCLUDE (trang_thai, tong_tien, thanh_tien);

-- Index cho query theo khách hàng và trạng thái
CREATE NONCLUSTERED INDEX idx_hoa_don_khach_hang_trang_thai 
ON hoa_don(khach_hang_id, trang_thai)
INCLUDE (ngay_tao, thanh_tien);

-- Index cho query theo ngày tạo và trạng thái (báo cáo doanh thu)
CREATE NONCLUSTERED INDEX idx_hoa_don_ngay_tao_trang_thai 
ON hoa_don(ngay_tao, trang_thai)
INCLUDE (tong_tien, thanh_tien, giam_gia);

-- Index cho foreign key nhan_vien_id (thường JOIN trong queries)
CREATE NONCLUSTERED INDEX idx_hoa_don_nhan_vien_id 
ON hoa_don(nhan_vien_id);

-- ========== CHI_TIET_HOA_DON TABLE OPTIMIZATION ==========

-- Index cho query top selling products (JOIN với hoa_don để lọc theo ngày)
CREATE NONCLUSTERED INDEX idx_chi_tiet_hoa_don_san_pham_id 
ON chi_tiet_hoa_don(san_pham_id)
INCLUDE (so_luong, thanh_tien);

-- Index composite cho hoa_don_id và san_pham_id (thường query cùng lúc)
CREATE NONCLUSTERED INDEX idx_chi_tiet_hoa_don_composite 
ON chi_tiet_hoa_don(hoa_don_id, san_pham_id)
INCLUDE (so_luong, don_gia, thanh_tien);

-- ========== SAN_PHAM TABLE OPTIMIZATION ==========

-- Index cho query theo chi nhánh và trạng thái (inventory report)
CREATE NONCLUSTERED INDEX idx_san_pham_chi_nhanh_trang_thai 
ON san_pham(chi_nhanh_id, trang_thai)
INCLUDE (ton_kho, ten_san_pham);

-- Index cho query low stock products (ton_kho < ton_kho_toi_thieu)
CREATE NONCLUSTERED INDEX idx_san_pham_ton_kho_trang_thai 
ON san_pham(trang_thai, ton_kho)
INCLUDE (ton_kho_toi_thieu, ten_san_pham);

-- Index cho foreign key nha_cung_cap_id
CREATE NONCLUSTERED INDEX idx_san_pham_nha_cung_cap_id 
ON san_pham(nha_cung_cap_id);

-- ========== KHACH_HANG TABLE OPTIMIZATION ==========

-- Index cho query search (đã có idx_sdt và idx_email, nhưng có thể tối ưu thêm)
-- Index composite cho trạng thái và tên (khi filter + search)
CREATE NONCLUSTERED INDEX idx_khach_hang_trang_thai_ten 
ON khach_hang(trang_thai, ten_khach_hang);

-- ========== NHAP_HANG TABLE OPTIMIZATION ==========

-- Index cho query theo chi nhánh và ngày nhập
CREATE NONCLUSTERED INDEX idx_nhap_hang_chi_nhanh_ngay_nhap 
ON nhap_hang(chi_nhanh_id, ngay_nhap DESC)
INCLUDE (trang_thai, tong_tien);

-- Index cho query theo nhà cung cấp và ngày nhập
CREATE NONCLUSTERED INDEX idx_nhap_hang_nha_cung_cap_ngay_nhap 
ON nhap_hang(nha_cung_cap_id, ngay_nhap DESC)
INCLUDE (trang_thai);

-- ========== CHI_TIET_NHAP_HANG TABLE OPTIMIZATION ==========

-- Index cho san_pham_id (thường query để xem lịch sử nhập hàng của sản phẩm)
CREATE NONCLUSTERED INDEX idx_chi_tiet_nhap_hang_san_pham_id 
ON chi_tiet_nhap_hang(san_pham_id)
INCLUDE (so_luong, don_gia);

-- ========== PHIEU_TRA_HANG TABLE OPTIMIZATION ==========

-- Index cho query theo hóa đơn gốc (thường query để xem các phiếu trả của 1 hóa đơn)
CREATE NONCLUSTERED INDEX idx_phieu_tra_hang_hoa_don_goc_id 
ON phieu_tra_hang(hoa_don_goc_id)
INCLUDE (ngay_tra, trang_thai);

-- Index cho query theo sản phẩm (xem lịch sử trả hàng của sản phẩm)
CREATE NONCLUSTERED INDEX idx_phieu_tra_hang_san_pham_id 
ON phieu_tra_hang(san_pham_id)
INCLUDE (ngay_tra, so_luong_tra);

-- ========== AUDIT_LOG TABLE OPTIMIZATION ==========

-- Index composite cho entity_name và action_time (thường query cùng lúc)
CREATE NONCLUSTERED INDEX idx_audit_log_entity_action_time 
ON audit_log(entity_name, action_time DESC)
INCLUDE (entity_id, action, username);

-- Index cho user_id (xem lịch sử thao tác của user)
CREATE NONCLUSTERED INDEX idx_audit_log_user_id 
ON audit_log(user_id, action_time DESC);

-- =============================================
-- Ghi chú về indexes:
-- - NONCLUSTERED: Không làm thay đổi thứ tự vật lý của data
-- - INCLUDE: Thêm columns vào index để tránh key lookup (covering index)
-- - DESC: Tối ưu cho ORDER BY DESC
-- =============================================



