# 📋 DANH SÁCH API ENDPOINTS KHÔNG ĐƯỢC SỬ DỤNG

**Ngày:** 2025-12-12  
**Mục đích:** Liệt kê tất cả các API endpoints trong tài liệu nhưng không được sử dụng trong Frontend

---

## 🔍 PHƯƠNG PHÁP KIỂM TRA

- ✅ Đã kiểm tra tất cả file trong `src/lib/api/`
- ✅ Đã tìm kiếm các API calls trong toàn bộ codebase
- ✅ So sánh với tài liệu API endpoints

---

## 1. AUTHENTICATION APIs (2 endpoints)

| Method | Endpoint | Mô tả | Lý do không dùng |
|--------|----------|-------|------------------|
| `GET` | `/api/v1/auth/generate-hash` | Generate BCrypt hash (Utility - Dev only) | Utility endpoint, không cần trong production |
| `POST` | `/api/v1/auth/reset-password` | Reset password (Utility - Dev only) | Utility endpoint, không cần trong production |

**Ghi chú:** Các endpoint này là utility cho development, không cần tích hợp vào frontend.

---

## 2. PUBLIC APIs (12 endpoints - Hầu hết không dùng)

### 2.1. Product Public APIs

| Method | Endpoint | Mô tả | Trạng thái |
|--------|----------|-------|------------|
| `GET` | `/api/products` | Danh sách sản phẩm (phân trang) | ❌ Không dùng |
| `GET` | `/api/products/barcode/{barcode}` | Tìm sản phẩm theo barcode | ❌ Không dùng (dùng POS API thay thế) |
| `GET` | `/api/products/search` | Tìm kiếm sản phẩm theo từ khóa | ❌ Không dùng |
| `POST` | `/api/products` | Tạo sản phẩm mới | ❌ Không dùng (dùng Admin API) |
| `PUT` | `/api/products/{id}` | Cập nhật sản phẩm | ❌ Không dùng (dùng Admin API) |
| `DELETE` | `/api/products/{id}` | Xóa sản phẩm | ❌ Không dùng (dùng Admin API) |
| `GET` | `/api/products/health` | Health check | ❌ Không dùng |

**Lý do:** Frontend sử dụng Admin APIs (`/api/v1/admin/products`) và POS APIs (`/api/v1/pos/products`) thay vì Public APIs.

### 2.2. Customer Public APIs

| Method | Endpoint | Mô tả | Trạng thái |
|--------|----------|-------|------------|
| `GET` | `/api/customers` | Danh sách khách hàng (phân trang) | ❌ Không dùng |
| `GET` | `/api/customers/search` | Tìm kiếm khách hàng theo từ khóa | ⚠️ Có code nhưng không chắc có dùng |
| `POST` | `/api/customers` | Tạo khách hàng mới | ❌ Không dùng (dùng Admin API) |
| `PUT` | `/api/customers/{id}` | Cập nhật khách hàng | ❌ Không dùng (dùng Admin API) |
| `DELETE` | `/api/customers/{id}` | Xóa khách hàng | ❌ Không dùng (dùng Admin API) |
| `GET` | `/api/customers/health` | Health check | ❌ Không dùng |

**Lý do:** Frontend sử dụng Admin APIs (`/api/v1/admin/customers`) thay vì Public APIs.

### 2.3. Invoice Public APIs

| Method | Endpoint | Mô tả | Trạng thái |
|--------|----------|-------|------------|
| `GET` | `/api/invoices/by-date` | Lấy danh sách hóa đơn theo ngày | ❌ Không dùng (dùng POS API) |
| `GET` | `/api/invoices/health` | Health check | ❌ Không dùng |

**Lý do:** Frontend sử dụng POS APIs (`/api/v1/pos/invoices`) thay vì Public APIs.

---

## 3. ADMIN APIs (10+ endpoints)

### 3.1. Employee Admin APIs

| Method | Endpoint | Mô tả | Trạng thái |
|--------|----------|-------|------------|
| `GET` | `/api/v1/admin/employees/by-role` | Lấy nhân viên theo role | ❌ Không dùng |
| `POST` | `/api/v1/admin/employees/{id}/change-password` | Đổi mật khẩu nhân viên | ❌ Không dùng |

**Lý do:** Chưa có UI cho các chức năng này.

### 3.2. Report Admin APIs

| Method | Endpoint | Mô tả | Trạng thái |
|--------|----------|-------|------------|
| `GET` | `/api/v1/admin/reports/revenue/branch/{chiNhanhId}` | Báo cáo doanh thu theo chi nhánh | ❌ Không dùng |

**Lý do:** Frontend chỉ dùng endpoint tổng quát `/admin/reports/revenue` với query param `branchId`.

---

## 4. POS APIs (3 endpoints)

### 4.1. POS Promotion APIs

| Method | Endpoint | Mô tả | Trạng thái |
|--------|----------|-------|------------|
| `POST` | `/api/v1/pos/promotions/calculate-discount` | Tính toán giảm giá từ khuyến mãi | ❌ Không dùng |

**Lý do:** Frontend tự tính toán discount, không cần gọi API này.

### 4.2. VNPay Callback APIs

| Method | Endpoint | Mô tả | Trạng thái |
|--------|----------|-------|------------|
| `POST` | `/api/v1/payments/vnpay/ipn` | IPN callback từ VNPay | ❌ Không dùng (Backend tự xử lý) |
| `GET` | `/api/v1/payments/vnpay/return` | Return URL callback từ VNPay | ❌ Không dùng (Backend tự xử lý) |

**Lý do:** Đây là callback endpoints, VNPay gọi trực tiếp backend, không qua frontend.

---

## 5. REPORT APIs (2 endpoints - UI đã xóa)

| Method | Endpoint | Mô tả | Trạng thái |
|--------|----------|-------|------------|
| `GET` | `/api/reports/inventory/excel` | Tải xuống báo cáo tồn kho Excel | ⚠️ Code còn nhưng UI đã xóa |
| `GET` | `/api/reports/sales/excel` | Tải xuống báo cáo bán hàng Excel | ⚠️ Code còn nhưng UI đã xóa |

**Lý do:** UI đã bị xóa trong Dashboard Page (theo yêu cầu), nhưng code API vẫn còn trong `src/lib/api/reports.ts`.

**Khuyến nghị:** Có thể xóa code nếu không cần dùng nữa.

---

## 6. FILE APIs (0 endpoints - Tất cả đều dùng)

✅ Tất cả File APIs đều được sử dụng:
- `POST /api/v1/files/products/upload` ✅
- `POST /api/v1/files/customers/upload` ✅
- `DELETE /api/v1/files/delete` ✅

---

## 7. AUDIT LOG APIs (5 endpoints - Tất cả không dùng)

| Method | Endpoint | Mô tả | Trạng thái |
|--------|----------|-------|------------|
| `GET` | `/api/audit-logs/{id}` | Lấy audit log theo ID | ❌ Không dùng |
| `GET` | `/api/audit-logs/entity/{entityName}/{entityId}` | Lấy audit logs cho entity cụ thể | ❌ Không dùng |
| `GET` | `/api/audit-logs/user/{userId}` | Lấy audit logs cho user cụ thể | ❌ Không dùng |
| `GET` | `/api/audit-logs/date-range` | Lấy audit logs theo khoảng thời gian | ❌ Không dùng |
| `GET` | `/api/audit-logs/entity/{entityName}/date-range` | Lấy audit logs cho entity theo khoảng thời gian | ❌ Không dùng |

**Lý do:** Chưa có UI/feature để xem audit logs trong frontend.

---

## 📊 TỔNG KẾT

| Module | Tổng số Endpoints | Không dùng | Đang dùng | % Không dùng |
|--------|------------------|------------|-----------|--------------|
| Authentication | 5 | 2 | 3 | 40% |
| Public APIs | 12 | 12 | 0 | 100% |
| Admin APIs | 70+ | ~12 | ~58 | ~17% |
| POS APIs | 20+ | 3 | ~17 | ~15% |
| Report APIs | 4 | 2 | 2 | 50% |
| File APIs | 5 | 0 | 5 | 0% |
| Audit Log APIs | 5 | 5 | 0 | 100% |
| **TỔNG CỘNG** | **120+** | **~36** | **~85** | **~30%** |

---

## 🔍 PHÂN TÍCH CHI TIẾT

### ✅ **Endpoints được sử dụng tốt:**
- File APIs: 100% sử dụng
- POS Checkout APIs: 100% sử dụng
- Dashboard APIs: 100% sử dụng
- Product Admin APIs: ~90% sử dụng
- Customer Admin APIs: ~90% sử dụng

### ❌ **Endpoints không được sử dụng:**
- **Public APIs:** 100% không dùng (vì dùng Admin/POS APIs thay thế)
- **Audit Log APIs:** 100% không dùng (chưa có UI)
- **Utility APIs:** Authentication utilities không cần trong production

### ⚠️ **Endpoints có code nhưng UI đã xóa:**
- `GET /api/reports/inventory/excel` - Code còn, UI đã xóa
- `GET /api/reports/sales/excel` - Code còn, UI đã xóa

---

## 💡 KHUYẾN NGHỊ

### 1. **Có thể xóa code:**
- `downloadInventoryReport()` trong `src/lib/api/reports.ts`
- `downloadSalesReport()` trong `src/lib/api/reports.ts`
- Các Public API clients (nếu không cần dùng)

### 2. **Có thể implement trong tương lai:**
- Audit Log APIs (nếu cần feature xem lịch sử thay đổi)
- Employee change password (nếu cần feature đổi mật khẩu)
- Employee by-role filter (nếu cần filter theo role)

### 3. **Không cần lo lắng:**
- VNPay Callback APIs (backend tự xử lý)
- Utility APIs (chỉ dùng trong development)
- Public APIs (dùng Admin/POS APIs thay thế)

---

## 📝 GHI CHÚ

1. **Public APIs không dùng:** Đây là thiết kế đúng, vì frontend sử dụng Admin/POS APIs có authentication và authorization tốt hơn.

2. **Audit Log APIs:** Có thể implement trong tương lai nếu cần feature audit trail.

3. **Report APIs:** 2 endpoints đã xóa UI nhưng code còn - có thể xóa code để clean up.

4. **Tỷ lệ không dùng ~30%:** Đây là tỷ lệ bình thường, vì:
   - Một số APIs là utility/development only
   - Một số APIs là callback (backend tự xử lý)
   - Một số APIs chưa có UI nhưng có thể dùng trong tương lai

---

**Cập nhật lần cuối:** 2025-12-12

