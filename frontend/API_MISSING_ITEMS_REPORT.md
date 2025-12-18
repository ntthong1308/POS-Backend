# 📋 Báo cáo các mục không có trong hệ thống (so với FRONTEND_API_REFERENCE.md)

## ❌ API Endpoints chưa có trong hệ thống

### 1. Dashboard APIs
- ❌ `GET /api/v1/admin/reports/dashboard/stats` - Thống kê dashboard
- ❌ `GET /api/v1/admin/reports/dashboard/order-chart` - Dữ liệu biểu đồ đơn hàng
- ❌ `GET /api/v1/admin/reports/dashboard/sales-overview` - Dữ liệu tổng quan doanh số

**Ghi chú:** Đã tạo `dashboard.ts` API client nhưng các endpoint này chưa có trong backend.

### 2. Reports APIs (một phần)
- ✅ `GET /api/v1/admin/reports/revenue` - Đã có trong `reports.ts`
- ✅ `GET /api/v1/admin/reports/top-products` - Đã có trong `reports.ts`
- ❌ `GET /api/reports/revenue/excel` - Download Excel (có trong code nhưng chưa chắc có trong backend)
- ❌ `GET /api/reports/inventory/excel` - Download Excel (có trong code nhưng chưa chắc có trong backend)
- ❌ `GET /api/reports/sales/excel` - Download Excel (có trong code nhưng chưa chắc có trong backend)

### 3. POS Promotion APIs
- ❌ `GET /api/v1/pos/promotions/active?chiNhanhId=1` - Lấy khuyến mãi active (theo tài liệu)
- ⚠️ Hiện tại đang dùng: `/api/v1/pos/promotions/branch/{branchId}/active` (khác với tài liệu)

**Cần kiểm tra:** Endpoint nào đúng?

### 4. POS Product APIs
- ❌ `GET /api/v1/pos/products/search` - Tìm kiếm sản phẩm (có trong code nhưng chưa chắc có trong backend)
- ❌ `GET /api/v1/pos/products/scan/{barcode}` - Scan barcode (có trong code nhưng chưa chắc có trong backend)
- ❌ `GET /api/v1/pos/products/{id}` - Lấy sản phẩm theo ID (có trong code nhưng chưa chắc có trong backend)

**Theo tài liệu chỉ có:**
- ✅ `GET /api/v1/pos/products?page=0&size=20` - Đã có

### 5. Payment APIs
Các API sau có trong code nhưng không có trong tài liệu:
- ❌ `POST /api/v1/pos/payments/process` - Xử lý thanh toán
- ❌ `GET /api/v1/pos/payments/verify/{transactionId}` - Xác minh thanh toán
- ❌ `POST /api/v1/pos/payments/refund` - Hoàn tiền
- ❌ `GET /api/v1/pos/payments/{transactionId}` - Lấy giao dịch
- ❌ `GET /api/v1/pos/payments/invoice/{invoiceId}` - Lấy danh sách giao dịch theo hóa đơn
- ❌ `POST /api/v1/pos/payments/reconcile/{transactionId}` - Đối soát

**Cần kiểm tra:** Các API này có trong backend không?

## ⚠️ DTO/Type không khớp với tài liệu

### 1. Product
- ✅ Đã cập nhật: Bỏ `danhMuc` khi gửi lên backend (chỉ dùng cho frontend)
- ✅ Đã cập nhật: `giaVon` → `giaNhap`
- ✅ Đã cập nhật: Thêm các field theo ProductDTO

### 2. Customer
- ✅ Đã cập nhật: `soDienThoai` và `diemTichLuy` là optional
- ✅ Đã cập nhật: Thêm `DELETED` vào Status enum

### 3. Invoice
- ✅ Đã cập nhật: `tienGiam` → `giamGia`, `thanhToan` → `thanhTien`
- ✅ Đã cập nhật: Thêm các field theo InvoiceDTO
- ⚠️ **Cần kiểm tra:** Payment methods: `TIEN_MAT`, `CHUYEN_KHOAN`, `THE`, `VI_DIEN_TU` (theo tài liệu) vs `CASH`, `VISA`, `MASTER`, `JCB`, `BANK_TRANSFER` (trong code)

### 4. Employee
- ✅ Đã cập nhật: Theo EmployeeDTO trong tài liệu
- ⚠️ **Cần kiểm tra:** Status enum: `ACTIVE`/`INACTIVE`/`DELETED` (theo tài liệu) vs `active`/`onboarding`/`off-boarding`/`dismissed` (trong code)

### 5. Promotion
- ✅ Đã cập nhật: Theo PromotionDTO trong tài liệu
- ✅ Đã thêm: Các loại khuyến mãi mới (`BOGO`, `BUNDLE`, `FREE_SHIPPING`, `BUY_X_GET_Y`)

### 6. CheckoutRequest
- ✅ Đã cập nhật: Thêm `donGia` vào items (required theo tài liệu)
- ⚠️ **Cần kiểm tra:** Payment methods enum

## 📝 Response Format

### Đã cập nhật:
- ✅ `ApiResponse<T>` theo format trong tài liệu (có `success`, `data`, `message`, `errorCode`, `pageInfo`)
- ✅ `PaginatedResponse<T>` theo format Spring Data (có `content`, `totalElements`, `totalPages`, etc.)

## 🔧 Cần làm tiếp

### 1. Backend cần implement:
- [ ] Dashboard statistics API
- [ ] Dashboard order chart API
- [ ] Dashboard sales overview API
- [ ] Xác nhận các Payment APIs có tồn tại không
- [ ] Xác nhận các POS Product APIs (search, scan, getById) có tồn tại không

### 2. Frontend cần cập nhật:
- [ ] Cập nhật Dashboard page để sử dụng API thực (khi backend có)
- [ ] Cập nhật Reports page để sử dụng `getRevenueReport` và `getTopProducts`
- [ ] Kiểm tra và cập nhật payment methods enum
- [ ] Kiểm tra và cập nhật employee status enum
- [ ] Cập nhật CheckoutRequest để luôn gửi `donGia` trong items

### 3. Cần xác nhận với backend:
- [ ] Payment methods enum chính xác là gì?
- [ ] Employee status enum chính xác là gì?
- [ ] POS Promotion endpoint: `/pos/promotions/active` hay `/pos/promotions/branch/{id}/active`?
- [ ] Các Payment APIs có tồn tại không?
- [ ] Các POS Product APIs (search, scan, getById) có tồn tại không?

## ✅ Đã hoàn thành

1. ✅ Cập nhật Reports API client với `getRevenueReport` và `getTopProducts`
2. ✅ Cập nhật Product type - bỏ `danhMuc` khi gửi lên backend
3. ✅ Cập nhật tất cả types để phù hợp với DTO trong tài liệu
4. ✅ Tạo Dashboard API client (sẵn sàng khi backend có)
5. ✅ Cập nhật CheckoutRequest để phù hợp với tài liệu
6. ✅ Cập nhật ApiResponse và PaginatedResponse theo format trong tài liệu

## 📌 Lưu ý quan trọng

1. **Field `danhMuc` trong Product**: Không có trong backend, chỉ dùng cho frontend display. Đã thêm comment cảnh báo.

2. **Payment Methods**: Có sự khác biệt giữa tài liệu (`TIEN_MAT`, `CHUYEN_KHOAN`, `THE`, `VI_DIEN_TU`) và code hiện tại (`CASH`, `VISA`, `MASTER`, `JCB`, `BANK_TRANSFER`). Cần xác nhận với backend.

3. **Tương thích ngược**: Đã thêm các alias fields để tương thích với code cũ, nhưng nên cập nhật code để dùng field mới.

4. **Dashboard APIs**: Chưa có trong backend, cần implement trước khi có thể kết nối.

---

**Ngày tạo:** 2025-01-06  
**Phiên bản:** 1.0.0

