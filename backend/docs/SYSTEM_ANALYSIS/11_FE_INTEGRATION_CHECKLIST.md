# 📋 Frontend Integration Checklist

> Checklist để Frontend developers tự kiểm tra tích hợp với Backend

---

## ✅ 1. Authentication & Authorization

### **Login**
- [ ] Gọi đúng endpoint: `POST /api/v1/auth/login`
- [ ] Request body có `username` và `password`
- [ ] Lưu `token` từ response vào localStorage/sessionStorage
- [ ] Lưu `id` làm `nhanVienId` (cho checkout)
- [ ] Lưu `chiNhanhId` (cho checkout và các API khác)
- [ ] Lưu `role` (cho permission checks)
- [ ] Gửi token trong header: `Authorization: Bearer {token}` cho tất cả protected requests

### **Token Management**
- [ ] Thêm token vào tất cả API calls (trừ public endpoints)
- [ ] Handle 401 Unauthorized → Redirect to login
- [ ] Clear token khi logout
- [ ] Refresh token nếu có (hiện tại chưa có refresh token API)

### **Role-Based Access**
- [ ] Check role trước khi hiển thị menu/buttons:
  - `ADMIN` → Tất cả features
  - `MANAGER` → Admin features + POS features
  - `CASHIER` → Chỉ POS features
- [ ] Disable/hide features không có quyền

---

## ✅ 2. POS - Checkout

### **Scan Product**
- [ ] Gọi đúng endpoint: `GET /api/v1/pos/products/barcode/{barcode}`
- [ ] Sử dụng `giaBan` từ response làm `donGia` trong cart
- [ ] Check `tonKho > 0` trước khi thêm vào cart
- [ ] Check `trangThai = "ACTIVE"` trước khi thêm vào cart
- [ ] Handle error: `404 NOT FOUND` → Show "Không tìm thấy sản phẩm"

### **Validate Cart**
- [ ] Gọi `POST /api/v1/pos/checkout/validate` trước khi checkout
- [ ] Request body có đầy đủ required fields:
  - `nhanVienId` - Từ login response (`id`)
  - `chiNhanhId` - Từ login response (`chiNhanhId`)
  - `phuongThucThanhToan` - User selection
  - `items[].sanPhamId` - Product ID
  - `items[].soLuong` - Quantity (> 0)
  - `items[].donGia` - Từ product scan (`giaBan`)
- [ ] Show validation errors nếu có
- [ ] Chỉ cho phép checkout nếu validation thành công

### **Checkout**
- [ ] Gọi `POST /api/v1/pos/checkout`
- [ ] Request body có đầy đủ required fields (giống validate)
- [ ] Optional fields:
  - `khachHangId` - null nếu walk-in customer
  - `giamGia` - Manual discount (default: 0)
  - `diemSuDung` - Points used (default: 0)
  - `ghiChu` - Notes
- [ ] Handle response:
  - Show invoice details
  - Display `maHoaDon`, `thanhTien`, `diemTichLuy`
  - Optionally print receipt
- [ ] Clear cart sau khi checkout thành công
- [ ] Handle errors:
  - `INSUFFICIENT_STOCK` → Show "Không đủ tồn kho"
  - `INACTIVE_PRODUCT` → Show "Sản phẩm đã ngừng hoạt động"

### **Get Invoices**
- [ ] Gọi `GET /api/v1/pos/invoices/by-date?date=2025-12-06` (single date)
- [ ] Hoặc `GET /api/v1/pos/invoices/by-date?fromDate=2025-12-01&toDate=2025-12-06` (date range)
- [ ] Date format: `YYYY-MM-DD`
- [ ] Display invoice list với chi tiết

---

## ✅ 3. Product Management

### **Create Product**
- [ ] Gọi `POST /api/v1/admin/products`
- [ ] Required fields:
  - `maSanPham` - Unique
  - `tenSanPham`
  - `giaBan` - > 0
  - `tonKho` - >= 0
- [ ] Optional fields:
  - `barcode` - Unique (nếu có)
  - `hinhAnh` - URL từ file upload
  - `chiNhanhId`, `nhaCungCapId`
- [ ] Upload image trước (nếu có) → Dùng `fileUrl` trong `hinhAnh`
- [ ] Handle errors:
  - `DUPLICATE_BARCODE` → Show "Barcode đã tồn tại"
  - `DUPLICATE_CODE` → Show "Mã sản phẩm đã tồn tại"

### **Get Products (Paginated)**
- [ ] Gọi `GET /api/v1/admin/products?page=0&size=20`
- [ ] Sử dụng `paging` object cho pagination UI:
  - `paging.page` - Current page
  - `paging.size` - Items per page
  - `paging.totalElements` - Total items
  - `paging.totalPages` - Total pages
- [ ] Display `data.content` array

### **Search Products**
- [ ] Gọi `GET /api/v1/admin/products/search?keyword={keyword}&page=0&size=20`
- [ ] Debounce search input (300-500ms)
- [ ] Show loading state
- [ ] Handle empty results

### **Update Product**
- [ ] Gọi `PUT /api/v1/admin/products/{id}`
- [ ] Request body giống Create (không cần `id`)
- [ ] Handle barcode duplicate check (nếu changed)

---

## ✅ 4. Customer Management

### **Create Customer**
- [ ] Gọi `POST /api/v1/admin/customers`
- [ ] Required fields:
  - `maKhachHang` - Unique
  - `tenKhachHang`
- [ ] Optional fields:
  - `soDienThoai` - Unique (nếu có)
  - `email`, `diaChi`
- [ ] Handle error: `DUPLICATE_PHONE` → Show "Số điện thoại đã tồn tại"

### **Search Customer (for POS)**
- [ ] Gọi `GET /api/v1/admin/customers/search?keyword={phone}` hoặc `GET /api/v1/admin/customers/phone/{phone}`
- [ ] Search by phone number (most common)
- [ ] Display results in dropdown
- [ ] Select customer for checkout

### **Update Customer Points**
- [ ] Gọi `PATCH /api/v1/admin/customers/{id}/points?points=100`
- [ ] Note: Points được **cộng thêm**, không thay thế

---

## ✅ 5. File Upload

### **Upload Product Image**
- [ ] Gọi `POST /api/v1/files/products/upload`
- [ ] Request: `multipart/form-data`
- [ ] Validate file type (jpg, png, gif)
- [ ] Validate file size (max 10MB)
- [ ] Show upload progress
- [ ] Use `fileUrl` from response trong product form

### **Display Image**
- [ ] Use full URL: `http://localhost:8081/uploads/products/{fileName}`
- [ ] Or relative path: `/uploads/products/{fileName}`
- [ ] Handle 404 (image not found)

---

## ✅ 6. Inventory Management

### **Import Goods**
- [ ] Gọi `POST /api/v1/admin/inventory/import`
- [ ] Required fields:
  - `nhaCungCapId`
  - `chiNhanhId`
  - `nhanVienId`
  - `items[]` - Array of items
- [ ] Each item:
  - `sanPhamId`
  - `soLuong` - > 0
  - `donGia` - > 0
- [ ] Calculate total amount
- [ ] Show success message

### **Return Goods**
- [ ] Gọi `POST /api/v1/admin/inventory/return`
- [ ] Required fields:
  - `hoaDonGocId` - Original invoice ID
  - `sanPhamId`
  - `soLuongTra` - <= soLuongDaMua
  - `nhanVienId`
  - `lyDoTra`
- [ ] Validate: `soLuongTra <= soLuongDaMua`
- [ ] Handle error: `INVALID_RETURN` → Show "Số lượng trả không hợp lệ"

---

## ✅ 7. Raw Material Management

### **Create Raw Material**
- [ ] Gọi `POST /api/v1/admin/nguyen-lieu`
- [ ] Required fields:
  - `maNguyenLieu` - Unique
  - `tenNguyenLieu`
  - `tonKho` - >= 0
- [ ] Optional fields:
  - `donViTinh`
  - `tonKhoToiThieu`
  - `chiNhanhId`

### **Import Raw Material**
- [ ] Gọi `POST /api/v1/admin/nguyen-lieu/nhap`
- [ ] Required fields:
  - `nguyenLieuId`
  - `soLuong` - > 0
  - `nhanVienId`
  - `loaiPhieu` - "NHAP"
- [ ] Stock sẽ tự động tăng

### **Export Raw Material**
- [ ] Gọi `POST /api/v1/admin/nguyen-lieu/xuat`
- [ ] Required fields:
  - `nguyenLieuId`
  - `soLuong` - > 0, <= tonKho
  - `nhanVienId`
  - `loaiPhieu` - "XUAT"
- [ ] Validate: `soLuong <= tonKho`
- [ ] Handle error: `INSUFFICIENT_STOCK` → Show "Không đủ nguyên liệu"

---

## ✅ 8. Promotion Management

### **Create Promotion**
- [ ] Gọi `POST /api/v1/admin/promotions`
- [ ] Required fields:
  - `maKhuyenMai` - Unique
  - `tenKhuyenMai`
  - `loaiKhuyenMai` - PERCENTAGE, FIXED_AMOUNT, BOGO, BUNDLE, BUY_X_GET_Y
  - `giaTriKhuyenMai`
  - `ngayBatDau`, `ngayKetThuc`
- [ ] Optional fields:
  - `giaTriToiThieu` - Minimum amount
  - `giamToiDa` - Max discount
  - `chiNhanhId` - null = all branches
  - `sanPhamIds[]` - Specific products

### **Note:**
- [ ] Promotion được **tự động áp dụng** khi checkout (không cần gọi API riêng)
- [ ] FE chỉ cần hiển thị discount trong invoice response

---

## ✅ 9. Dashboard

### **Get Dashboard Stats**
- [ ] Gọi `GET /api/v1/admin/dashboard?date=2025-12-06`
- [ ] Date format: `YYYY-MM-DD` (optional, default: today)
- [ ] Display:
  - Today's stats với change indicators (%)
  - Order stats chart (7 days)
  - Sales overview chart (7 days)
  - Top products list

---

## ✅ 10. Reports

### **Revenue Report**
- [ ] Gọi `GET /api/v1/admin/reports/revenue?startDate=2025-12-01&endDate=2025-12-06`
- [ ] Date format: `YYYY-MM-DD`
- [ ] Validate: `startDate <= endDate`
- [ ] Display revenue statistics

### **Top Products**
- [ ] Gọi `GET /api/v1/admin/reports/top-products?startDate=...&endDate=...&limit=10`
- [ ] Display top selling products

---

## ✅ 11. Response Format

### **Success Response**
- [ ] Check `data` field (not `result`, `body`, etc.)
- [ ] Check `paging` field for paginated responses
- [ ] Check `meta.timestamp` for debugging

### **Error Response**
- [ ] Check `errors` array (not `error`, `message`, etc.)
- [ ] Each error has:
  - `code` - Error code
  - `message` - Error message
  - `field` - Field name (if field-specific)
- [ ] Display field errors next to input fields
- [ ] Display general errors at top of form

---

## ✅ 12. Error Handling

### **HTTP Status Codes**
- [ ] `400 BAD REQUEST` → Validation errors → Show field errors
- [ ] `401 UNAUTHORIZED` → Invalid/expired token → Redirect to login
- [ ] `403 FORBIDDEN` → Insufficient permissions → Show "Không có quyền"
- [ ] `404 NOT FOUND` → Resource not found → Show "Không tìm thấy"
- [ ] `500 INTERNAL SERVER ERROR` → System error → Show "Lỗi hệ thống"

### **Error Codes**
- [ ] `VALIDATION_ERROR` → Show field errors
- [ ] `NOT_FOUND` → Show "Không tìm thấy {resource}"
- [ ] `INSUFFICIENT_STOCK` → Show "Không đủ tồn kho"
- [ ] `INACTIVE_PRODUCT` → Show "Sản phẩm đã ngừng hoạt động"
- [ ] `DUPLICATE_BARCODE` → Show "Barcode đã tồn tại"
- [ ] `UNAUTHORIZED` → Redirect to login

---

## ✅ 13. Data Format

### **Dates**
- [ ] All dates: `YYYY-MM-DD` format
- [ ] Date-time: `YYYY-MM-DDTHH:mm:ss` format
- [ ] Parse dates correctly from response

### **Numbers**
- [ ] All amounts: Number (not string)
- [ ] Format with thousand separators for display
- [ ] Example: `25000` → Display as `25,000 VNĐ`

### **Status Values**
- [ ] Use exact values: `ACTIVE`, `INACTIVE`, `COMPLETED`, `DELETED`
- [ ] Don't use lowercase or different casing

---

## ✅ 14. API Base URL & Headers

### **Base URL**
- [ ] Use correct base URL: `http://localhost:8081`
- [ ] Or use environment variable for different environments

### **Headers**
- [ ] Always include: `Content-Type: application/json`
- [ ] Always include: `Authorization: Bearer {token}` (for protected endpoints)
- [ ] Don't include token for public endpoints

---

## ✅ 15. Common Issues to Avoid

### **Checkout Issues**
- [ ] ❌ **DON'T:** Send `null` for `nhanVienId`, `chiNhanhId` → Get from login response
- [ ] ❌ **DON'T:** Send `null` for `items[].donGia` → Get from product scan (`giaBan`)
- [ ] ❌ **DON'T:** Send `null` for `phuongThucThanhToan` → Get from user selection
- [ ] ✅ **DO:** Always validate cart before checkout

### **Product Issues**
- [ ] ❌ **DON'T:** Send base64 image in `hinhAnh` → Upload file first, use URL
- [ ] ❌ **DON'T:** Send duplicate `barcode` or `maSanPham`
- [ ] ✅ **DO:** Check `tonKho` before adding to cart

### **Customer Issues**
- [ ] ❌ **DON'T:** Send duplicate `soDienThoai`
- [ ] ✅ **DO:** Search customer by phone for POS

### **Date Issues**
- [ ] ❌ **DON'T:** Send dates in wrong format → Use `YYYY-MM-DD`
- [ ] ❌ **DON'T:** Send `fromDate > toDate` → Validate date range

### **Pagination Issues**
- [ ] ❌ **DON'T:** Use wrong page number → Use 0-indexed (0, 1, 2, ...)
- [ ] ❌ **DON'T:** Ignore `paging` object → Use it for pagination UI

---

## ✅ 16. Performance Optimization

### **Caching**
- [ ] Cache product data (if needed)
- [ ] Cache customer data (if needed)
- [ ] Don't cache frequently changing data (stock, points)

### **API Calls**
- [ ] Debounce search inputs (300-500ms)
- [ ] Don't call API on every keystroke
- [ ] Show loading states
- [ ] Handle empty states

### **Pagination**
- [ ] Use pagination for large lists
- [ ] Don't load all data at once
- [ ] Implement infinite scroll or page navigation

---

## ✅ 17. Security

### **Token Security**
- [ ] Don't log token in console
- [ ] Don't store token in localStorage if possible (use sessionStorage or httpOnly cookie)
- [ ] Clear token on logout
- [ ] Handle token expiration

### **Input Validation**
- [ ] Validate on frontend before submit
- [ ] But also handle backend validation errors
- [ ] Sanitize user input

---

## ✅ 18. User Experience

### **Error Messages**
- [ ] Show user-friendly error messages (not technical errors)
- [ ] Show field-specific errors next to inputs
- [ ] Show general errors at top of form/page

### **Loading States**
- [ ] Show loading spinner during API calls
- [ ] Disable submit button during request
- [ ] Show success messages after operations

### **Confirmation**
- [ ] Confirm before delete operations
- [ ] Confirm before checkout (show total amount)
- [ ] Confirm before return goods

---

## 📝 Notes

### **Backend Assumptions:**
1. Promotion is **automatically applied** during checkout
2. Points are **automatically calculated** (1% of `thanhTien`)
3. Customer points are **automatically updated** (if `khachHangId` provided)
4. Stock is **automatically deducted** during checkout
5. Stock is **automatically increased** during import/return

### **Frontend Should:**
1. **NOT** call separate API to apply promotion
2. **NOT** manually calculate points
3. **NOT** manually update customer points
4. **NOT** manually update stock
5. **DO** trust backend to handle these automatically

---

## 🔍 Testing Checklist

### **Manual Testing**
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test checkout with valid cart
- [ ] Test checkout with insufficient stock
- [ ] Test product creation
- [ ] Test product search
- [ ] Test file upload
- [ ] Test customer search
- [ ] Test inventory import
- [ ] Test dashboard stats

### **Error Scenarios**
- [ ] Test with expired token
- [ ] Test with invalid token
- [ ] Test with missing required fields
- [ ] Test with duplicate barcode
- [ ] Test with insufficient stock
- [ ] Test with inactive product

---

**📌 Sau khi hoàn thành checklist này, Frontend sẽ tích hợp đúng với Backend!**

