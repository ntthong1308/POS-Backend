# 📚 Frontend API Reference - Tổng hợp Entity, DTO và API Endpoints

> **Tài liệu này tổng hợp tất cả các Entity, DTO và API Endpoints để Frontend tham khảo, tránh sai sót khi tích hợp.**

**Base URL:** `http://localhost:8081`

**Swagger UI:** `http://localhost:8081/swagger-ui.html`

**📎 Tài liệu liên quan:**
- [Hướng dẫn tích hợp File Upload](./FRONTEND_FILE_UPLOAD_GUIDE.md) - Chi tiết cách upload file hình ảnh

---

## 📋 Mục lục

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Entities (Database Models)](#2-entities-database-models)
3. [DTOs (Data Transfer Objects)](#3-dtos-data-transfer-objects)
4. [API Endpoints](#4-api-endpoints)
5. [Enums & Constants](#5-enums--constants)
6. [Validation Rules](#6-validation-rules)
7. [Response Format](#7-response-format)

---

## 1. Authentication & Authorization

### Login Request
```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Login Response
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": 1,
    "username": "admin",
    "tenNhanVien": "Admin User",
    "email": "admin@retail.com",
    "role": "ADMIN",
    "chiNhanhId": 1,
    "tenChiNhanh": "Chi nhánh Trung tâm"
  },
  "message": null,
  "errorCode": null
}
```

### Get Current User
```json
GET /api/v1/auth/me
Authorization: Bearer {token}
```

### Logout
```json
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

### Roles
- `ADMIN` - Quản trị viên
- `MANAGER` - Quản lý
- `CASHIER` - Thu ngân

---

## 2. Entities (Database Models)

### 2.1. SanPham (Product)
**Table:** `san_pham`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Long | Auto | ID sản phẩm |
| maSanPham | String(50) | ✅ | Mã sản phẩm (unique) |
| barcode | String(50) | ❌ | Barcode (unique) |
| tenSanPham | String(200) | ✅ | Tên sản phẩm |
| moTa | String(TEXT) | ❌ | Mô tả |
| donViTinh | String(50) | ❌ | Đơn vị tính |
| giaBan | BigDecimal(18,2) | ✅ | Giá bán |
| giaNhap | BigDecimal(18,2) | ❌ | Giá nhập |
| tonKho | Integer | ✅ | Tồn kho |
| tonKhoToiThieu | Integer | ❌ | Tồn kho tối thiểu |
| hinhAnh | String(2000) | ❌ | URL hoặc path hình ảnh sản phẩm |
| chiNhanhId | Long | ❌ | ID chi nhánh |
| nhaCungCapId | Long | ❌ | ID nhà cung cấp |
| trangThai | Status | ✅ | Trạng thái |

### 2.2. KhachHang (Customer)
**Table:** `khach_hang`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Long | Auto | ID khách hàng |
| maKhachHang | String(20) | ✅ | Mã khách hàng (unique) |
| tenKhachHang | String(200) | ✅ | Tên khách hàng |
| soDienThoai | String(20) | ❌ | Số điện thoại |
| email | String(100) | ❌ | Email |
| diaChi | String(500) | ❌ | Địa chỉ |
| diemTichLuy | BigDecimal(10,2) | ❌ | Điểm tích lũy |
| trangThai | Status | ✅ | Trạng thái |

### 2.3. NhanVien (Employee)
**Table:** `nhan_vien`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Long | Auto | ID nhân viên |
| maNhanVien | String(20) | ✅ | Mã nhân viên (unique) |
| tenNhanVien | String(200) | ✅ | Tên nhân viên |
| username | String(50) | ✅ | Username (unique) |
| password | String(255) | ✅ | Password (BCrypt) |
| email | String(100) | ❌ | Email |
| soDienThoai | String(20) | ❌ | Số điện thoại |
| role | Role | ✅ | Vai trò (ADMIN/MANAGER/CASHIER) |
| chiNhanhId | Long | ❌ | ID chi nhánh |
| trangThai | Status | ✅ | Trạng thái |

### 2.4. HoaDon (Invoice)
**Table:** `hoa_don`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Long | Auto | ID hóa đơn |
| maHoaDon | String(50) | ✅ | Mã hóa đơn (unique) |
| khachHangId | Long | ❌ | ID khách hàng |
| nhanVienId | Long | ✅ | ID nhân viên |
| chiNhanhId | Long | ✅ | ID chi nhánh |
| ngayTao | LocalDateTime | ✅ | Ngày tạo |
| tongTien | BigDecimal(18,2) | ✅ | Tổng tiền |
| giamGia | BigDecimal(18,2) | ❌ | Giảm giá |
| thanhTien | BigDecimal(18,2) | ✅ | Thành tiền |
| phuongThucThanhToan | String(50) | ❌ | Phương thức thanh toán |
| diemSuDung | BigDecimal(10,2) | ❌ | Điểm sử dụng |
| diemTichLuy | BigDecimal(10,2) | ❌ | Điểm tích lũy |
| ghiChu | String(TEXT) | ❌ | Ghi chú |
| trangThai | Status | ✅ | Trạng thái |

### 2.5. ChiTietHoaDon (Invoice Detail)
**Table:** `chi_tiet_hoa_don`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Long | Auto | ID chi tiết |
| hoaDonId | Long | ✅ | ID hóa đơn |
| sanPhamId | Long | ✅ | ID sản phẩm |
| soLuong | Integer | ✅ | Số lượng |
| donGia | BigDecimal(18,2) | ✅ | Đơn giá |
| thanhTien | BigDecimal(18,2) | ✅ | Thành tiền (auto) |
| ghiChu | String(500) | ❌ | Ghi chú |

### 2.6. ChiNhanh (Branch)
**Table:** `chi_nhanh`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Long | Auto | ID chi nhánh |
| maChiNhanh | String(20) | ✅ | Mã chi nhánh (unique) |
| tenChiNhanh | String(200) | ✅ | Tên chi nhánh |
| diaChi | String(500) | ❌ | Địa chỉ |
| soDienThoai | String(20) | ❌ | Số điện thoại |
| trangThai | Status | ✅ | Trạng thái |

### 2.7. NhaCungCap (Supplier)
**Table:** `nha_cung_cap`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Long | Auto | ID nhà cung cấp |
| maNcc | String(20) | ✅ | Mã nhà cung cấp (unique) |
| tenNcc | String(200) | ✅ | Tên nhà cung cấp |
| soDienThoai | String(20) | ❌ | Số điện thoại |
| email | String(100) | ❌ | Email |
| diaChi | String(500) | ❌ | Địa chỉ |
| trangThai | Status | ✅ | Trạng thái |

### 2.8. KhuyenMai (Promotion)
**Table:** `khuyen_mai`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Long | Auto | ID khuyến mãi |
| maKhuyenMai | String(50) | ✅ | Mã khuyến mãi (unique) |
| tenKhuyenMai | String(200) | ✅ | Tên khuyến mãi |
| moTa | String(TEXT) | ❌ | Mô tả |
| loaiKhuyenMai | String(50) | ✅ | Loại khuyến mãi |
| giaTri | BigDecimal(18,2) | ✅ | Giá trị |
| ngayBatDau | LocalDateTime | ✅ | Ngày bắt đầu |
| ngayKetThuc | LocalDateTime | ✅ | Ngày kết thúc |
| chiNhanhId | Long | ❌ | ID chi nhánh |
| trangThai | Status | ✅ | Trạng thái |

---

## 3. DTOs (Data Transfer Objects)

### 3.1. ProductDTO

```json
{
  "id": 1,
  "maSanPham": "SP001",
  "barcode": "8934567890123",
  "tenSanPham": "Nước ngọt Coca Cola 330ml",
  "moTa": "Nước ngọt có ga",
  "donViTinh": "Lon",
  "giaBan": 10000.00,
  "giaNhap": 7000.00,
  "tonKho": 100,
  "tonKhoToiThieu": 20,
  "hinhAnh": "https://example.com/images/coca-cola-330ml.jpg",
  "chiNhanhId": 1,
  "tenChiNhanh": "Chi nhánh Trung tâm",
  "nhaCungCapId": 1,
  "tenNhaCungCap": "Nhà cung cấp A",
  "trangThai": "ACTIVE"
}
```

**Validation Rules:**
- `maSanPham`: Required, max 50 chars
- `tenSanPham`: Required, max 200 chars
- `barcode`: Optional, max 50 chars, unique
- `giaBan`: Required, > 0
- `giaNhap`: Optional, >= 0
- `tonKho`: Required, >= 0
- `tonKhoToiThieu`: Optional, >= 0
- `hinhAnh`: Optional, max 2000 chars (URL của hình ảnh đã upload qua `/api/v1/files/products/upload`)

**⚠️ LƯU Ý:** 
- Frontend KHÔNG nên gửi field `danhMuc` - field này không tồn tại trong backend!
- Field `hinhAnh` đã được thêm vào backend (migration V8) - **Sử dụng endpoint `/api/v1/files/products/upload` để upload file, sau đó lưu URL trả về vào field này**

### 3.2. CustomerDTO

```json
{
  "id": 1,
  "maKhachHang": "KH001",
  "tenKhachHang": "Nguyễn Văn A",
  "soDienThoai": "0912345678",
  "email": "nguyenvana@email.com",
  "diaChi": "123 Đường ABC, Quận 1, TP.HCM",
  "diemTichLuy": 1000.00,
  "trangThai": "ACTIVE"
}
```

**Validation Rules:**
- `maKhachHang`: Required, max 20 chars, unique
- `tenKhachHang`: Required, max 200 chars
- `soDienThoai`: Optional, pattern: `^(\\+84|0)[0-9]{9}$`
- `email`: Optional, valid email format, max 100 chars
- `diaChi`: Optional, max 500 chars

### 3.3. EmployeeDTO

```json
{
  "id": 1,
  "maNhanVien": "NV001",
  "tenNhanVien": "Nguyễn Văn B",
  "username": "admin",
  "password": "admin123",
  "email": "admin@retail.com",
  "soDienThoai": "0912345678",
  "role": "ADMIN",
  "chiNhanhId": 1,
  "tenChiNhanh": "Chi nhánh Trung tâm",
  "trangThai": "ACTIVE"
}
```

**Validation Rules:**
- `maNhanVien`: Required, max 20 chars, unique
- `tenNhanVien`: Required, max 200 chars
- `username`: Required, 4-50 chars, unique
- `password`: Optional (update), min 6 chars
- `email`: Optional, valid email format, max 100 chars
- `soDienThoai`: Optional, pattern: `^(\\+84|0)[0-9]{9}$`
- `role`: Required, enum: `ADMIN`, `MANAGER`, `CASHIER`

### 3.4. InvoiceDTO

```json
{
  "id": 1,
  "maHoaDon": "HD001",
  "khachHangId": 1,
  "tenKhachHang": "Nguyễn Văn A",
  "soDienThoaiKhachHang": "0912345678",
  "nhanVienId": 1,
  "tenNhanVien": "Nguyễn Văn B",
  "chiNhanhId": 1,
  "tenChiNhanh": "Chi nhánh Trung tâm",
  "ngayTao": "2025-12-06T10:30:00",
  "tongTien": 100000.00,
  "giamGia": 10000.00,
  "thanhTien": 90000.00,
  "phuongThucThanhToan": "TIEN_MAT",
  "diemSuDung": 0.00,
  "diemTichLuy": 90.00,
  "ghiChu": "Khách hàng VIP",
  "trangThai": "ACTIVE",
  "chiTietHoaDons": [
    {
      "id": 1,
      "sanPhamId": 1,
      "tenSanPham": "Nước ngọt Coca Cola 330ml",
      "soLuong": 10,
      "donGia": 10000.00,
      "thanhTien": 100000.00,
      "ghiChu": null
    }
  ]
}
```

### 3.5. InvoiceDetailDTO

```json
{
  "id": 1,
  "sanPhamId": 1,
  "tenSanPham": "Nước ngọt Coca Cola 330ml",
  "soLuong": 10,
  "donGia": 10000.00,
  "thanhTien": 100000.00,
  "ghiChu": null
}
```

### 3.6. CheckoutRequest

```json
{
  "khachHangId": 1,
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 10,
      "donGia": 10000.00,
      "ghiChu": null
    }
  ],
  "giamGia": 10000.00,
  "phuongThucThanhToan": "TIEN_MAT",
  "diemSuDung": 0.00,
  "ghiChu": "Khách hàng VIP"
}
```

**Validation Rules:**
- `nhanVienId`: Required
- `chiNhanhId`: Required
- `items`: Required, not empty
- `items[].sanPhamId`: Required
- `items[].soLuong`: Required, > 0
- `items[].donGia`: Required, > 0
- `giamGia`: Optional, >= 0
- `phuongThucThanhToan`: Required
- `diemSuDung`: Optional, >= 0

### 3.7. CartItemDTO

```json
{
  "sanPhamId": 1,
  "soLuong": 10,
  "donGia": 10000.00,
  "ghiChu": null
}
```

**Validation Rules:**
- `sanPhamId`: Required
- `soLuong`: Required, > 0
- `donGia`: Required, > 0

### 3.8. PromotionDTO

```json
{
  "id": 1,
  "maKhuyenMai": "KM001",
  "tenKhuyenMai": "Giảm giá 10%",
  "moTa": "Áp dụng cho tất cả sản phẩm",
  "loaiKhuyenMai": "PERCENTAGE",
  "chiNhanhId": 1,
  "tenChiNhanh": "Chi nhánh Trung tâm",
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "giaTriKhuyenMai": 10.00,
  "giaTriToiThieu": 100000.00,
  "giamToiDa": 50000.00,
  "soLuongMua": 2,
  "soLuongTang": 1,
  "soLanSuDungToiDa": 1,
  "tongSoLanSuDungToiDa": 100,
  "soLanDaSuDung": 0,
  "trangThai": "ACTIVE",
  "anhKhuyenMai": "https://example.com/image.jpg",
  "dieuKien": "Áp dụng cho đơn hàng từ 100,000đ",
  "isActive": true,
  "sanPhamIds": [1, 2, 3]
}
```

**PromotionType Enum:**
- `PERCENTAGE` - Giảm giá theo phần trăm
- `FIXED_AMOUNT` - Giảm giá theo số tiền cố định
- `BOGO` - Mua 1 tặng 1
- `BUNDLE` - Combo sản phẩm
- `FREE_SHIPPING` - Miễn phí vận chuyển
- `BUY_X_GET_Y` - Mua X tặng Y

---

## 4. API Endpoints

### 4.1. Authentication APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | ❌ | Đăng nhập |
| GET | `/api/v1/auth/me` | ✅ | Lấy thông tin user hiện tại |
| POST | `/api/v1/auth/logout` | ✅ | Đăng xuất |

### 4.2. Product APIs

#### Public APIs (`/api/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products/{id}` | ❌ | Lấy sản phẩm theo ID |
| GET | `/api/products/barcode/{barcode}` | ❌ | Lấy sản phẩm theo barcode |
| GET | `/api/products?page=0&size=20` | ❌ | Lấy danh sách sản phẩm (pagination) |
| GET | `/api/products/search?keyword=cola&page=0&size=20` | ❌ | Tìm kiếm sản phẩm |

#### Admin APIs (`/api/v1/admin/products`) - Requires ADMIN/MANAGER

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/admin/products` | ✅ | Tạo sản phẩm mới |
| PUT | `/api/v1/admin/products/{id}` | ✅ | Cập nhật sản phẩm |
| GET | `/api/v1/admin/products/{id}` | ✅ | Lấy sản phẩm theo ID |
| GET | `/api/v1/admin/products?page=0&size=20` | ✅ | Lấy danh sách sản phẩm |
| GET | `/api/v1/admin/products/search?keyword=cola&page=0&size=20` | ✅ | Tìm kiếm sản phẩm |
| GET | `/api/v1/admin/products/low-stock` | ✅ | Lấy sản phẩm tồn kho thấp |
| DELETE | `/api/v1/admin/products/{id}` | ✅ | Xóa sản phẩm |
| PATCH | `/api/v1/admin/products/{id}/status?status=ACTIVE` | ✅ | Cập nhật trạng thái |

#### POS APIs (`/api/v1/pos/products`) - Requires CASHIER/MANAGER/ADMIN

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/pos/products?page=0&size=20` | ✅ | Lấy danh sách sản phẩm cho POS |

### 4.3. Customer APIs

#### Public APIs (`/api/customers`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/customers/{id}` | ❌ | Lấy khách hàng theo ID |
| GET | `/api/customers/phone/{phone}` | ❌ | Lấy khách hàng theo số điện thoại |
| GET | `/api/customers?page=0&size=20` | ❌ | Lấy danh sách khách hàng |
| GET | `/api/customers/search?keyword=nguyen&page=0&size=20` | ❌ | Tìm kiếm khách hàng |

#### Admin APIs (`/api/v1/admin/customers`) - Requires ADMIN

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/admin/customers` | ✅ | Tạo khách hàng mới |
| PUT | `/api/v1/admin/customers/{id}` | ✅ | Cập nhật khách hàng |
| DELETE | `/api/v1/admin/customers/{id}` | ✅ | Xóa khách hàng |

### 4.4. Invoice APIs

#### Public APIs (`/api/invoices`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/invoices/{id}` | ❌ | Lấy hóa đơn theo ID |

#### POS APIs (`/api/v1/pos/invoices`) - Requires CASHIER/MANAGER/ADMIN

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/pos/invoices/{id}` | ✅ | Lấy hóa đơn theo ID |
| GET | `/api/v1/pos/invoices/by-date?date=2025-12-06` | ✅ | Lấy hóa đơn theo ngày |

### 4.5. Checkout APIs

#### POS APIs (`/api/v1/pos/checkout`) - Requires CASHIER/MANAGER/ADMIN

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/pos/checkout` | ✅ | Thanh toán (tạo hóa đơn) |
| POST | `/api/v1/pos/checkout/validate` | ✅ | Validate giỏ hàng |

### 4.6. Employee APIs

#### Admin APIs (`/api/v1/admin/employees`) - Requires ADMIN

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/admin/employees` | ✅ | Tạo nhân viên mới |
| PUT | `/api/v1/admin/employees/{id}` | ✅ | Cập nhật nhân viên |
| GET | `/api/v1/admin/employees/{id}` | ✅ | Lấy nhân viên theo ID |
| GET | `/api/v1/admin/employees` | ✅ | Lấy danh sách nhân viên |
| DELETE | `/api/v1/admin/employees/{id}` | ✅ | Xóa nhân viên |

### 4.7. Promotion APIs

#### Admin APIs (`/api/v1/admin/promotions`) - Requires ADMIN/MANAGER

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/admin/promotions` | ✅ | Tạo khuyến mãi mới |
| PUT | `/api/v1/admin/promotions/{id}` | ✅ | Cập nhật khuyến mãi |
| GET | `/api/v1/admin/promotions/{id}` | ✅ | Lấy khuyến mãi theo ID |
| GET | `/api/v1/admin/promotions` | ✅ | Lấy danh sách khuyến mãi |
| DELETE | `/api/v1/admin/promotions/{id}` | ✅ | Xóa khuyến mãi |

#### POS APIs (`/api/v1/pos/promotions`) - Requires CASHIER/MANAGER/ADMIN

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/pos/promotions/active?chiNhanhId=1` | ✅ | Lấy khuyến mãi đang active |

### 4.8. Report APIs

#### Admin APIs (`/api/v1/admin/reports`) - Requires ADMIN/MANAGER

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/admin/reports/revenue?startDate=2025-12-01&endDate=2025-12-31` | ✅ | Báo cáo doanh thu |
| GET | `/api/v1/admin/reports/top-products?startDate=2025-12-01&endDate=2025-12-31&limit=10` | ✅ | Top sản phẩm bán chạy |

### 4.9. File Upload APIs

#### Public APIs (`/api/v1/files`) - No authentication required

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/files/products/upload` | ❌ | Upload hình ảnh sản phẩm |
| POST | `/api/v1/files/customers/upload` | ❌ | Upload hình ảnh khách hàng |
| DELETE | `/api/v1/files/delete?fileUrl=/uploads/products/abc123.jpg` | ❌ | Xóa file đã upload |

**Upload File Request:**
- Content-Type: `multipart/form-data`
- Parameter name: `file`
- Max file size: 10MB
- Allowed types: Image files only (image/jpeg, image/png, image/gif, etc.)

**Upload File Response:**
```json
{
  "success": true,
  "data": "/uploads/products/550e8400-e29b-41d4-a716-446655440000.jpg",
  "message": null,
  "error": null
}
```

**Usage Example (JavaScript/Fetch):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8081/api/v1/files/products/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
const imageUrl = result.data; // Use this URL in ProductDTO.hinhAnh
```

**⚠️ LƯU Ý:**
- Sau khi upload thành công, sử dụng URL trả về (ví dụ: `/uploads/products/abc123.jpg`) để lưu vào field `hinhAnh` của ProductDTO
- URL này sẽ được serve tự động bởi server tại `http://localhost:8081/uploads/products/abc123.jpg`
- **KHÔNG** gửi base64 encoded image trực tiếp vào field `hinhAnh` - hãy upload file trước rồi lưu URL

---

## 5. Enums & Constants

### 5.1. Status Enum

```typescript
enum Status {
  ACTIVE = "ACTIVE",      // Đang hoạt động
  INACTIVE = "INACTIVE",  // Không hoạt động
  DELETED = "DELETED",    // Đã xóa
  PENDING = "PENDING",    // Đang chờ
  COMPLETED = "COMPLETED", // Hoàn thành
  CANCELLED = "CANCELLED" // Đã hủy
}
```

### 5.2. Role Enum

```typescript
enum Role {
  ADMIN = "ADMIN",        // Quản trị viên
  MANAGER = "MANAGER",    // Quản lý
  CASHIER = "CASHIER"     // Thu ngân
}
```

### 5.3. PromotionType Enum

```typescript
enum PromotionType {
  PERCENTAGE = "PERCENTAGE",        // Giảm giá theo phần trăm
  FIXED_AMOUNT = "FIXED_AMOUNT",    // Giảm giá theo số tiền cố định
  BOGO = "BOGO",                    // Mua 1 tặng 1
  BUNDLE = "BUNDLE",                // Combo sản phẩm
  FREE_SHIPPING = "FREE_SHIPPING",  // Miễn phí vận chuyển
  BUY_X_GET_Y = "BUY_X_GET_Y"       // Mua X tặng Y
}
```

### 5.4. Payment Methods

```typescript
// Phương thức thanh toán (String)
"TIEN_MAT"      // Tiền mặt
"CHUYEN_KHOAN"  // Chuyển khoản
"THE"           // Thẻ
"VI_DIEN_TU"    // Ví điện tử
```

---

## 6. Validation Rules

### 6.1. ProductDTO Validation

| Field | Rules |
|-------|-------|
| `maSanPham` | Required, max 50 chars, unique |
| `tenSanPham` | Required, max 200 chars |
| `barcode` | Optional, max 50 chars, unique |
| `giaBan` | Required, > 0 |
| `giaNhap` | Optional, >= 0 |
| `tonKho` | Required, >= 0 |
| `tonKhoToiThieu` | Optional, >= 0 |
| `hinhAnh` | Optional, max 2000 chars (URL hình ảnh) |
| `trangThai` | Required, enum: ACTIVE/INACTIVE/DELETED |

### 6.2. CustomerDTO Validation

| Field | Rules |
|-------|-------|
| `maKhachHang` | Required, max 20 chars, unique |
| `tenKhachHang` | Required, max 200 chars |
| `soDienThoai` | Optional, pattern: `^(\\+84|0)[0-9]{9}$` |
| `email` | Optional, valid email format, max 100 chars |
| `diaChi` | Optional, max 500 chars |

### 6.3. EmployeeDTO Validation

| Field | Rules |
|-------|-------|
| `maNhanVien` | Required, max 20 chars, unique |
| `tenNhanVien` | Required, max 200 chars |
| `username` | Required, 4-50 chars, unique |
| `password` | Optional (update), min 6 chars |
| `email` | Optional, valid email format, max 100 chars |
| `soDienThoai` | Optional, pattern: `^(\\+84|0)[0-9]{9}$` |
| `role` | Required, enum: ADMIN/MANAGER/CASHIER |

### 6.4. CheckoutRequest Validation

| Field | Rules |
|-------|-------|
| `nhanVienId` | Required |
| `chiNhanhId` | Required |
| `items` | Required, not empty array |
| `items[].sanPhamId` | Required |
| `items[].soLuong` | Required, > 0 |
| `items[].donGia` | Required, > 0 |
| `giamGia` | Optional, >= 0 |
| `phuongThucThanhToan` | Required |
| `diemSuDung` | Optional, >= 0 |

---

## 7. Response Format

### 7.1. Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": null,
  "errorCode": null,
  "pageInfo": {
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

### 7.2. Error Response

```json
{
  "success": false,
  "data": null,
  "message": "Mã sản phẩm đã tồn tại",
  "errorCode": "DUPLICATE_PRODUCT_CODE"
}
```

### 7.3. Pagination Response

```json
{
  "success": true,
  "data": {
    "content": [...],
    "pageable": {...},
    "totalElements": 100,
    "totalPages": 5,
    "size": 20,
    "number": 0
  },
  "pageInfo": {
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

---

## 8. Common Error Codes

| Error Code | Description |
|------------|-------------|
| `BAD_REQUEST` | Request không hợp lệ |
| `UNAUTHORIZED` | Chưa đăng nhập |
| `FORBIDDEN` | Không có quyền truy cập |
| `NOT_FOUND` | Không tìm thấy resource |
| `DUPLICATE_PRODUCT_CODE` | Mã sản phẩm đã tồn tại |
| `DUPLICATE_BARCODE` | Barcode đã tồn tại |
| `INVALID_CREDENTIALS` | Thông tin đăng nhập không đúng |
| `INSUFFICIENT_STOCK` | Không đủ tồn kho |

---

## 9. Important Notes

### ⚠️ Fields NOT in Backend

- **`danhMuc`** - Field này KHÔNG tồn tại trong `ProductDTO`. Frontend không nên gửi field này.

### ✅ Fields Available in Backend

- **`hinhAnh`** - Field này ĐÃ CÓ trong `ProductDTO` (thêm từ migration V8). Frontend có thể gửi URL hình ảnh (max 2000 chars).

### ✅ Best Practices

1. **Always include Authorization header:**
   ```
   Authorization: Bearer {token}
   ```

2. **Use proper HTTP methods:**
   - GET: Read data
   - POST: Create new resource
   - PUT: Update entire resource
   - PATCH: Partial update
   - DELETE: Delete resource

3. **Handle pagination:**
   - Default page: 0
   - Default size: 20
   - Always check `totalPages` and `totalElements`

4. **Validate data before sending:**
   - Check required fields
   - Validate format (email, phone, etc.)
   - Check constraints (min, max, pattern)

5. **Handle errors gracefully:**
   - Check `success` field
   - Display `message` to user
   - Log `errorCode` for debugging

---

## 10. Example Requests

### Create Product

```bash
POST /api/v1/admin/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "maSanPham": "SP001",
  "barcode": "8934567890123",
  "tenSanPham": "Nước ngọt Coca Cola 330ml",
  "moTa": "Nước ngọt có ga",
  "donViTinh": "Lon",
  "giaBan": 10000.00,
  "giaNhap": 7000.00,
  "tonKho": 100,
  "tonKhoToiThieu": 20,
  "hinhAnh": "https://example.com/images/coca-cola-330ml.jpg",
  "chiNhanhId": 1,
  "nhaCungCapId": 1,
  "trangThai": "ACTIVE"
}
```

### Checkout

```bash
POST /api/v1/pos/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "khachHangId": 1,
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 10,
      "donGia": 10000.00
    }
  ],
  "giamGia": 10000.00,
  "phuongThucThanhToan": "TIEN_MAT",
  "diemSuDung": 0.00,
  "ghiChu": "Khách hàng VIP"
}
```

---

**Last Updated:** 2025-12-06

**Version:** 1.0.0


