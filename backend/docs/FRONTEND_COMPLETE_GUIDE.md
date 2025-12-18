# 📘 Hướng Dẫn Tổng Hợp Frontend - Retail Platform

> **Tài liệu này cung cấp toàn bộ thông tin cần thiết để frontend tích hợp với backend:**
> - Tất cả API endpoints và cách sử dụng
> - Cấu trúc DTO và các field cần thiết
> - Business rules và validation rules
> - Workflow xử lý cho từng chức năng
> - Error handling và best practices

---

## 📑 Mục Lục

1. [Authentication & Authorization](#1-authentication--authorization)
2. [POS - Bán Hàng](#2-pos---bán-hàng)
3. [Quản Lý Sản Phẩm](#3-quản-lý-sản-phẩm)
4. [Quản Lý Khách Hàng](#4-quản-lý-khách-hàng)
5. [Quản Lý Nhân Viên](#5-quản-lý-nhân-viên)
6. [Quản Lý Tồn Kho](#6-quản-lý-tồn-kho)
7. [Quản Lý Khuyến Mãi](#7-quản-lý-khuyến-mãi)
8. [Thanh Toán](#8-thanh-toán)
9. [Báo Cáo](#9-báo-cáo)
10. [Upload File](#10-upload-file)
11. [Response Format](#11-response-format)
12. [Error Handling](#12-error-handling)

---

## 1. Authentication & Authorization

### 1.1. Login

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": 1,
    "username": "admin",
    "tenNhanVien": "Nguyễn Văn A",
    "email": "admin@example.com",
    "role": "ADMIN",
    "chiNhanhId": 1,
    "tenChiNhanh": "Chi nhánh Trung tâm"
  },
  "meta": {
    "timestamp": "2025-12-06T14:00:00"
  }
}
```

**Lưu ý:**
- Lưu `token` vào localStorage/sessionStorage
- Lưu `id` làm `nhanVienId` cho checkout
- Lưu `chiNhanhId` cho checkout và các API khác
- Gửi token trong header: `Authorization: Bearer {token}`

### 1.2. Get Current User

**Endpoint:** `GET /api/v1/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** Tương tự login response (EmployeeDTO)

### 1.3. Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": "Đăng xuất thành công"
}
```

### 1.4. Roles & Permissions

| Role | Quyền Truy Cập |
|------|----------------|
| `ADMIN` | Tất cả endpoints |
| `MANAGER` | Admin endpoints + POS endpoints |
| `CASHIER` | Chỉ POS endpoints |

**Endpoints theo Role:**
- `/api/v1/pos/**` → `CASHIER`, `MANAGER`, `ADMIN`
- `/api/v1/admin/**` → `ADMIN`, `MANAGER`

---

## 2. POS - Bán Hàng

### 2.1. Quét/Tìm Sản Phẩm

#### 2.1.1. Quét Barcode

**Endpoint:** `GET /api/v1/pos/products/scan/{barcode}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "maSanPham": "SP001",
    "barcode": "8934567890123",
    "tenSanPham": "Nước ngọt Coca Cola 330ml",
    "giaBan": 10000.00,
    "tonKho": 100,
    "hinhAnh": "/uploads/products/abc123.jpg",
    "donViTinh": "Chai",
    "trangThai": "ACTIVE"
  }
}
```

**Workflow:**
1. User quét barcode hoặc nhập barcode
2. Gọi API với barcode
3. Nếu tìm thấy → Thêm vào giỏ hàng với `giaBan` làm `donGia`
4. Nếu không tìm thấy → Hiển thị lỗi

#### 2.1.2. Tìm Kiếm Sản Phẩm

**Endpoint:** `GET /api/v1/pos/products/search?keyword={keyword}&page={page}&size={size}`

**Query Parameters:**
- `keyword` (required): Từ khóa tìm kiếm
- `page` (default: 0): Số trang
- `size` (default: 20): Số item mỗi trang

**Response:**
```json
{
  "data": {
    "content": [
      {
        "id": 1,
        "maSanPham": "SP001",
        "tenSanPham": "Coca Cola",
        "giaBan": 10000.00,
        "tonKho": 100,
        ...
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 50,
    "totalPages": 3
  },
  "paging": {
    "page": 0,
    "size": 20,
    "totalElements": 50,
    "totalPages": 3
  }
}
```

#### 2.1.3. Lấy Danh Sách Sản Phẩm

**Endpoint:** `GET /api/v1/pos/products?page={page}&size={size}`

**Response:** Tương tự search

### 2.2. Validate Giỏ Hàng

**Endpoint:** `POST /api/v1/pos/checkout/validate`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "khachHangId": null,
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "donGia": 10000.00,
      "ghiChu": null
    }
  ],
  "giamGia": 0,
  "phuongThucThanhToan": "CASH",
  "diemSuDung": 0,
  "ghiChu": null
}
```

**Validation Rules:**
- `nhanVienId`: **REQUIRED** - Lấy từ `user.id` (sau login)
- `chiNhanhId`: **REQUIRED** - Lấy từ `user.chiNhanhId` (sau login)
- `items`: **REQUIRED** - Không được trống
  - `items[].sanPhamId`: **REQUIRED**
  - `items[].soLuong`: **REQUIRED**, phải > 0
  - `items[].donGia`: **REQUIRED**, phải > 0 (lấy từ `product.giaBan`)
- `phuongThucThanhToan`: **REQUIRED** - `"CASH"`, `"CARD"`, `"MOMO"`, `"ZALOPAY"`, `"BANK_TRANSFER"`, `"OTHER"`

**Response:**
```json
{
  "data": "Giỏ hàng hợp lệ"
}
```

**Business Rules:**
- Kiểm tra sản phẩm tồn tại
- Kiểm tra tồn kho >= số lượng yêu cầu
- Kiểm tra số lượng > 0

### 2.3. Checkout (Thanh Toán)

**Endpoint:** `POST /api/v1/pos/checkout`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (Giống validate, nhưng đầy đủ hơn)

```json
{
  "khachHangId": 1,
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "donGia": 10000.00,
      "ghiChu": null
    }
  ],
  "giamGia": 5000.00,
  "phuongThucThanhToan": "CASH",
  "diemSuDung": 0,
  "ghiChu": "Ghi chú hóa đơn"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "maHoaDon": "HD20251206140000",
    "khachHangId": 1,
    "tenKhachHang": "Nguyễn Văn B",
    "nhanVienId": 1,
    "tenNhanVien": "Nguyễn Văn A",
    "chiNhanhId": 1,
    "tenChiNhanh": "Chi nhánh Trung tâm",
    "ngayTao": "2025-12-06T14:00:00",
    "tongTien": 20000.00,
    "giamGia": 5000.00,
    "thanhTien": 15000.00,
    "phuongThucThanhToan": "CASH",
    "diemSuDung": 0,
    "diemTichLuy": 150,
    "trangThai": "COMPLETED",
    "chiTietHoaDons": [
      {
        "id": 1,
        "sanPhamId": 1,
        "tenSanPham": "Coca Cola",
        "maSanPham": "SP001",
        "soLuong": 2,
        "donGia": 10000.00,
        "thanhTien": 20000.00
      }
    ]
  }
}
```

**Workflow:**
1. Validate giỏ hàng trước
2. Gọi checkout API
3. Backend tự động:
   - Tạo hóa đơn
   - Cập nhật tồn kho (trừ số lượng)
   - Áp dụng khuyến mãi (nếu có)
   - Cập nhật điểm khách hàng (nếu có)
4. Hiển thị hóa đơn và in (nếu cần)

### 2.4. Lấy Hóa Đơn

#### 2.4.1. Lấy Hóa Đơn Theo ID

**Endpoint:** `GET /api/v1/pos/invoices/{id}`

**Response:** InvoiceDTO (giống checkout response)

#### 2.4.2. Lấy Hóa Đơn Theo Ngày

**Endpoint:** `GET /api/v1/pos/invoices/by-date?date={date}`

**Query Parameters:**
- `date` (required): Format `YYYY-MM-DD` (ví dụ: `2025-12-06`)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "maHoaDon": "HD20251206140000",
      ...
    }
  ]
}
```

#### 2.4.3. Lấy Hóa Đơn Theo Khoảng Ngày

**Endpoint:** `GET /api/v1/pos/invoices/by-date?fromDate={fromDate}&toDate={toDate}`

**Query Parameters:**
- `fromDate` (required): Format `YYYY-MM-DD`
- `toDate` (required): Format `YYYY-MM-DD`

**Response:** Tương tự single date

---

## 3. Quản Lý Sản Phẩm

### 3.1. Admin - Tạo Sản Phẩm

**Endpoint:** `POST /api/v1/admin/products`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "maSanPham": "SP001",
  "barcode": "8934567890123",
  "tenSanPham": "Nước ngọt Coca Cola 330ml",
  "moTa": "Mô tả sản phẩm",
  "donViTinh": "Chai",
  "giaBan": 10000.00,
  "giaNhap": 8000.00,
  "tonKho": 100,
  "tonKhoToiThieu": 10,
  "hinhAnh": "/uploads/products/abc123.jpg",
  "chiNhanhId": 1,
  "nhaCungCapId": 1,
  "trangThai": "ACTIVE"
}
```

**Validation Rules:**
- `maSanPham`: **REQUIRED**, max 50 ký tự
- `tenSanPham`: **REQUIRED**, max 200 ký tự
- `giaBan`: **REQUIRED**, > 0
- `tonKho`: **REQUIRED**, >= 0
- `trangThai`: **REQUIRED** - `ACTIVE`, `INACTIVE`, `DISCONTINUED`
- `hinhAnh`: max 2000 ký tự (nên upload file và lưu URL)

**Response:** ProductDTO

### 3.2. Admin - Cập Nhật Sản Phẩm

**Endpoint:** `PUT /api/v1/admin/products/{id}`

**Request Body:** Giống tạo (không cần `id`)

**Response:** ProductDTO

### 3.3. Admin - Lấy Sản Phẩm

**Endpoint:** `GET /api/v1/admin/products/{id}`

**Response:** ProductDTO

### 3.4. Admin - Lấy Danh Sách Sản Phẩm

**Endpoint:** `GET /api/v1/admin/products?page={page}&size={size}`

**Response:** Page<ProductDTO>

### 3.5. Admin - Tìm Kiếm Sản Phẩm

**Endpoint:** `GET /api/v1/admin/products/search?keyword={keyword}&page={page}&size={size}`

**Response:** Page<ProductDTO>

### 3.6. Admin - Sản Phẩm Tồn Kho Thấp

**Endpoint:** `GET /api/v1/admin/products/low-stock`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "tenSanPham": "Coca Cola",
      "tonKho": 5,
      "tonKhoToiThieu": 10,
      ...
    }
  ]
}
```

### 3.7. Admin - Cập Nhật Trạng Thái

**Endpoint:** `PATCH /api/v1/admin/products/{id}/status?status={status}`

**Query Parameters:**
- `status`: `ACTIVE`, `INACTIVE`, `DISCONTINUED`

**Response:**
```json
{
  "data": "Cập nhật trạng thái thành công"
}
```

### 3.8. Admin - Xóa Sản Phẩm

**Endpoint:** `DELETE /api/v1/admin/products/{id}`

**Response:**
```json
{
  "data": "Xóa sản phẩm thành công"
}
```

---

## 4. Quản Lý Khách Hàng

### 4.1. Admin - Tạo Khách Hàng

**Endpoint:** `POST /api/v1/admin/customers`

**Request Body:**
```json
{
  "maKhachHang": "KH001",
  "tenKhachHang": "Nguyễn Văn B",
  "soDienThoai": "0912345678",
  "email": "customer@example.com",
  "diaChi": "123 Đường ABC, Quận 1, TP.HCM",
  "diemTichLuy": 0,
  "trangThai": "ACTIVE"
}
```

**Validation Rules:**
- `maKhachHang`: **REQUIRED**, max 20 ký tự
- `tenKhachHang`: **REQUIRED**, max 200 ký tự
- `soDienThoai`: Format `^(\\+84|0)[0-9]{9}$` (ví dụ: `0912345678`, `+84912345678`)
- `email`: Format email hợp lệ, max 100 ký tự
- `trangThai`: **REQUIRED** - `ACTIVE`, `INACTIVE`

**Response:** CustomerDTO

### 4.2. Admin - Cập Nhật Khách Hàng

**Endpoint:** `PUT /api/v1/admin/customers/{id}`

**Request Body:** Giống tạo

**Response:** CustomerDTO

### 4.3. Admin - Lấy Khách Hàng

**Endpoint:** `GET /api/v1/admin/customers/{id}`

**Response:** CustomerDTO

### 4.4. Admin - Lấy Khách Hàng Theo SĐT

**Endpoint:** `GET /api/v1/admin/customers/phone/{phone}`

**Response:** CustomerDTO

### 4.5. Admin - Lấy Danh Sách Khách Hàng

**Endpoint:** `GET /api/v1/admin/customers?page={page}&size={size}`

**Response:** Page<CustomerDTO>

### 4.6. Admin - Tìm Kiếm Khách Hàng

**Endpoint:** `GET /api/v1/admin/customers/search?keyword={keyword}&page={page}&size={size}`

**Response:** Page<CustomerDTO>

### 4.7. Admin - Cập Nhật Điểm

**Endpoint:** `PATCH /api/v1/admin/customers/{id}/points?points={points}`

**Query Parameters:**
- `points`: BigDecimal (ví dụ: `1000`)

**Response:**
```json
{
  "data": "Cập nhật điểm thành công"
}
```

### 4.8. Admin - Xóa Khách Hàng

**Endpoint:** `DELETE /api/v1/admin/customers/{id}`

**Response:**
```json
{
  "data": "Xóa khách hàng thành công"
}
```

### 4.9. Public - Tìm Kiếm Khách Hàng (POS)

**Endpoint:** `GET /api/customers/search?keyword={keyword}&page={page}&size={size}`

**Response:** Page<CustomerDTO>

---

## 5. Quản Lý Nhân Viên

### 5.1. Admin - Tạo Nhân Viên

**Endpoint:** `POST /api/v1/admin/employees`

**Request Body:**
```json
{
  "maNhanVien": "NV001",
  "tenNhanVien": "Nguyễn Văn A",
  "username": "nva",
  "password": "password123",
  "email": "nva@example.com",
  "soDienThoai": "0912345678",
  "role": "CASHIER",
  "chiNhanhId": 1,
  "trangThai": "ACTIVE"
}
```

**Validation Rules:**
- `maNhanVien`: **REQUIRED**, max 20 ký tự
- `tenNhanVien`: **REQUIRED**, max 200 ký tự
- `username`: **REQUIRED**, 4-50 ký tự
- `password`: min 6 ký tự (chỉ khi tạo mới)
- `role`: **REQUIRED** - `ADMIN`, `MANAGER`, `CASHIER`
- `trangThai`: **REQUIRED** - `ACTIVE`, `INACTIVE`

**Response:** EmployeeDTO

### 5.2. Admin - Cập Nhật Nhân Viên

**Endpoint:** `PUT /api/v1/admin/employees/{id}`

**Request Body:** Giống tạo (không cần `password` nếu không đổi)

**Response:** EmployeeDTO

### 5.3. Admin - Lấy Nhân Viên

**Endpoint:** `GET /api/v1/admin/employees/{id}`

**Response:** EmployeeDTO

### 5.4. Admin - Lấy Danh Sách Nhân Viên

**Endpoint:** `GET /api/v1/admin/employees`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "maNhanVien": "NV001",
      "tenNhanVien": "Nguyễn Văn A",
      "username": "nva",
      "role": "CASHIER",
      ...
    }
  ]
}
```

### 5.5. Admin - Lấy Nhân Viên Theo Role

**Endpoint:** `GET /api/v1/admin/employees/by-role?role={role}`

**Query Parameters:**
- `role`: `ADMIN`, `MANAGER`, `CASHIER`

**Response:** List<EmployeeDTO>

### 5.6. Admin - Đổi Mật Khẩu

**Endpoint:** `POST /api/v1/admin/employees/{id}/change-password?oldPassword={old}&newPassword={new}`

**Query Parameters:**
- `oldPassword`: Mật khẩu cũ
- `newPassword`: Mật khẩu mới

**Response:**
```json
{
  "data": "Đổi mật khẩu thành công"
}
```

### 5.7. Admin - Xóa Nhân Viên

**Endpoint:** `DELETE /api/v1/admin/employees/{id}`

**Response:**
```json
{
  "data": "Xóa nhân viên thành công"
}
```

---

## 6. Quản Lý Tồn Kho

### 6.1. Admin - Nhập Hàng

**Endpoint:** `POST /api/v1/admin/inventory/import`

**Request Body:**
```json
{
  "nhaCungCapId": 1,
  "chiNhanhId": 1,
  "nhanVienId": 1,
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 100,
      "donGia": 8000.00,
      "ghiChu": "Nhập hàng tháng 12"
    }
  ],
  "ghiChu": "Ghi chú nhập hàng"
}
```

**Validation Rules:**
- `nhaCungCapId`: **REQUIRED**
- `chiNhanhId`: **REQUIRED**
- `nhanVienId`: **REQUIRED**
- `items`: **REQUIRED**, không được trống
  - `items[].sanPhamId`: **REQUIRED**
  - `items[].soLuong`: **REQUIRED**, > 0
  - `items[].donGia`: **REQUIRED**, > 0

**Response:**
```json
{
  "data": "Nhập hàng thành công"
}
```

**Business Rules:**
- Tạo phiếu nhập hàng
- Cập nhật tồn kho (tăng số lượng)
- Cập nhật giá nhập (nếu cần)

### 6.2. Admin - Trả Hàng

**Endpoint:** `POST /api/v1/admin/inventory/return`

**Request Body:**
```json
{
  "hoaDonGocId": 1,
  "sanPhamId": 1,
  "soLuongTra": 2,
  "nhanVienId": 1,
  "lyDoTra": "Sản phẩm bị lỗi"
}
```

**Validation Rules:**
- `hoaDonGocId`: **REQUIRED**
- `sanPhamId`: **REQUIRED**
- `soLuongTra`: **REQUIRED**, > 0
- `nhanVienId`: **REQUIRED**
- `lyDoTra`: **REQUIRED**, max 1000 ký tự

**Response:**
```json
{
  "data": "Trả hàng thành công"
}
```

**Business Rules:**
- Kiểm tra hóa đơn gốc tồn tại
- Kiểm tra số lượng trả <= số lượng đã bán
- Tạo phiếu trả hàng
- Cập nhật tồn kho (tăng số lượng)
- Hoàn tiền (nếu cần)

### 6.3. Admin - Kiểm Tra Tồn Kho

**Endpoint:** `GET /api/v1/admin/inventory/stock/{productId}`

**Response:**
```json
{
  "data": 100
}
```

---

## 7. Quản Lý Khuyến Mãi

### 7.1. Admin - Tạo Khuyến Mãi

**Endpoint:** `POST /api/v1/admin/promotions`

**Request Body:**
```json
{
  "maKhuyenMai": "KM001",
  "tenKhuyenMai": "Giảm 20% cho đơn hàng trên 100k",
  "moTa": "Mô tả khuyến mãi",
  "loaiKhuyenMai": "PERCENTAGE",
  "chiNhanhId": 1,
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "giaTriKhuyenMai": 20.00,
  "giaTriToiThieu": 100000.00,
  "giamToiDa": 50000.00,
  "soLuongMua": null,
  "soLuongTang": null,
  "soLanSuDungToiDa": 100,
  "tongSoLanSuDungToiDa": 1000,
  "trangThai": "ACTIVE",
  "anhKhuyenMai": "/uploads/promotions/km001.jpg",
  "dieuKien": "Áp dụng cho đơn hàng trên 100k",
  "sanPhamIds": [1, 2, 3]
}
```

**Validation Rules:**
- `maKhuyenMai`: **REQUIRED**
- `tenKhuyenMai`: **REQUIRED**
- `loaiKhuyenMai`: `PERCENTAGE`, `FIXED_AMOUNT`, `BUY_X_GET_Y`
- `ngayBatDau`: **REQUIRED**
- `ngayKetThuc`: **REQUIRED**
- `trangThai`: `ACTIVE`, `INACTIVE`

**Response:** PromotionDTO

### 7.2. Admin - Cập Nhật Khuyến Mãi

**Endpoint:** `PUT /api/v1/admin/promotions/{id}`

**Request Body:** Giống tạo

**Response:** PromotionDTO

### 7.3. Admin - Lấy Khuyến Mãi

**Endpoint:** `GET /api/v1/admin/promotions/{id}`

**Response:** PromotionDTO

### 7.4. Admin - Lấy Khuyến Mãi Theo Mã

**Endpoint:** `GET /api/v1/admin/promotions/code/{code}`

**Response:** PromotionDTO

### 7.5. Admin - Lấy Tất Cả Khuyến Mãi

**Endpoint:** `GET /api/v1/admin/promotions`

**Response:** List<PromotionDTO>

### 7.6. Admin - Kích Hoạt Khuyến Mãi

**Endpoint:** `POST /api/v1/admin/promotions/{id}/activate`

**Response:**
```json
{
  "data": "Kích hoạt khuyến mãi thành công"
}
```

### 7.7. Admin - Vô Hiệu Hóa Khuyến Mãi

**Endpoint:** `POST /api/v1/admin/promotions/{id}/deactivate`

**Response:**
```json
{
  "data": "Vô hiệu hóa khuyến mãi thành công"
}
```

### 7.8. Admin - Xóa Khuyến Mãi

**Endpoint:** `DELETE /api/v1/admin/promotions/{id}`

**Response:**
```json
{
  "data": "Xóa khuyến mãi thành công"
}
```

### 7.9. POS - Lấy Khuyến Mãi Đang Hoạt Động

**Endpoint:** `GET /api/v1/pos/promotions/branch/{branchId}/active`

**Response:** List<PromotionDTO>

### 7.10. POS - Tính Giảm Giá

**Endpoint:** `POST /api/v1/pos/promotions/calculate-discount?chiNhanhId={id}&totalAmount={amount}`

**Request Body:**
```json
[
  {
    "sanPhamId": 1,
    "soLuong": 2,
    "donGia": 10000.00
  }
]
```

**Response:**
```json
{
  "data": {
    "totalDiscount": 5000.00,
    "appliedPromotions": {
      "1": {
        "promotionId": 1,
        "discountAmount": 5000.00,
        "description": "Giảm 20%"
      }
    },
    "finalAmount": 15000.00
  }
}
```

### 7.11. POS - Lấy Khuyến Mãi Theo Mã

**Endpoint:** `GET /api/v1/pos/promotions/code/{code}`

**Response:** PromotionDTO

---

## 8. Thanh Toán

### 8.1. Xử Lý Thanh Toán

**Endpoint:** `POST /api/v1/pos/payments/process`

**Request Body:**
```json
{
  "invoiceId": 1,
  "amount": 15000.00,
  "paymentMethod": "CASH",
  "transactionId": "TXN123456",
  "metadata": {}
}
```

**Response:**
```json
{
  "data": {
    "transactionId": "TXN123456",
    "invoiceId": 1,
    "amount": 15000.00,
    "paymentMethod": "CASH",
    "status": "SUCCESS",
    "transactionDate": "2025-12-06T14:00:00"
  }
}
```

### 8.2. Xác Minh Thanh Toán

**Endpoint:** `GET /api/v1/pos/payments/verify/{transactionId}`

**Response:** PaymentResponse

### 8.3. Hoàn Tiền

**Endpoint:** `POST /api/v1/pos/payments/refund?transactionId={id}&amount={amount}`

**Query Parameters:**
- `transactionId`: ID giao dịch
- `amount`: Số tiền hoàn

**Response:** PaymentResponse

### 8.4. Lấy Giao Dịch

**Endpoint:** `GET /api/v1/pos/payments/{transactionId}`

**Response:** PaymentResponse

### 8.5. Lấy Giao Dịch Theo Hóa Đơn

**Endpoint:** `GET /api/v1/pos/payments/invoice/{invoiceId}`

**Response:** List<PaymentResponse>

---

## 9. Báo Cáo

### 9.1. Admin - Báo Cáo Doanh Thu

**Endpoint:** `GET /api/v1/admin/reports/revenue?startDate={start}&endDate={end}`

**Query Parameters:**
- `startDate`: Format `YYYY-MM-DD`
- `endDate`: Format `YYYY-MM-DD`

**Response:**
```json
{
  "data": {
    "totalRevenue": 1000000.00,
    "totalOrders": 100,
    "averageOrderValue": 10000.00,
    "revenueByDay": [
      {
        "date": "2025-12-06",
        "revenue": 500000.00,
        "orders": 50
      }
    ]
  }
}
```

### 9.2. Admin - Báo Cáo Doanh Thu Theo Chi Nhánh

**Endpoint:** `GET /api/v1/admin/reports/revenue/branch/{branchId}?startDate={start}&endDate={end}`

**Response:** RevenueReportDTO

### 9.3. Admin - Top Sản Phẩm Bán Chạy

**Endpoint:** `GET /api/v1/admin/reports/top-products?startDate={start}&endDate={end}&limit={limit}`

**Query Parameters:**
- `startDate`: Format `YYYY-MM-DD`
- `endDate`: Format `YYYY-MM-DD`
- `limit`: Số lượng sản phẩm (default: 10)

**Response:**
```json
{
  "data": [
    {
      "sanPhamId": 1,
      "tenSanPham": "Coca Cola",
      "soLuongBan": 1000,
      "doanhThu": 10000000.00
    }
  ]
}
```

### 9.4. Admin - Sản Phẩm Tồn Kho Thấp

**Endpoint:** `GET /api/v1/admin/reports/low-stock`

**Response:** List<ProductDTO>

### 9.5. Public - Tải Báo Cáo Excel

#### 9.5.1. Báo Cáo Doanh Thu Excel

**Endpoint:** `GET /api/reports/revenue/excel?startDate={start}&endDate={end}`

**Response:** File Excel (binary)

#### 9.5.2. Báo Cáo Tồn Kho Excel

**Endpoint:** `GET /api/reports/inventory/excel`

**Response:** File Excel (binary)

#### 9.5.3. Báo Cáo Bán Hàng Excel

**Endpoint:** `GET /api/reports/sales/excel?startDate={start}&endDate={end}&limit={limit}`

**Response:** File Excel (binary)

---

## 10. Upload File

### 10.1. Upload Hình Ảnh Sản Phẩm

**Endpoint:** `POST /api/v1/files/products/upload`

**Headers:**
```
Content-Type: multipart/form-data
```

**Request:**
```
file: [File]
```

**Response:**
```json
{
  "data": "/uploads/products/8e4c79c9-3a79-430b-9feb-9a9a7da0c504.jpg"
}
```

**Lưu ý:**
- Chỉ chấp nhận file ảnh: `jpg`, `jpeg`, `png`, `gif`
- Max size: 5MB
- Lưu URL vào `ProductDTO.hinhAnh`

### 10.2. Upload Hình Ảnh Khách Hàng

**Endpoint:** `POST /api/v1/files/customers/upload`

**Request/Response:** Tương tự sản phẩm

### 10.3. Xóa File

**Endpoint:** `DELETE /api/v1/files/delete?fileUrl={url}`

**Query Parameters:**
- `fileUrl`: URL file cần xóa

**Response:**
```json
{
  "data": "File deleted successfully"
}
```

### 10.4. Serve File (Xem Ảnh)

**Endpoint:** `GET /uploads/{path}` hoặc `GET /api/v1/uploads/{path}`

**Ví dụ:**
```
GET /uploads/products/abc123.jpg
GET /api/v1/uploads/products/abc123.jpg
```

**Response:** File binary (image)

---

## 11. Response Format

### 11.1. Success Response

```json
{
  "data": {
    // Response data
  },
  "paging": {
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  },
  "meta": {
    "timestamp": "2025-12-06T14:00:00"
  }
}
```

### 11.2. Error Response

```json
{
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Nhân viên ID không được để trống",
      "field": "nhanVienId"
    }
  ],
  "meta": {
    "timestamp": "2025-12-06T14:00:00"
  }
}
```

### 11.3. HTTP Status Codes

| Code | Ý Nghĩa |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation Error) |
| 401 | Unauthorized (Chưa đăng nhập) |
| 403 | Forbidden (Không có quyền) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 12. Error Handling

### 12.1. Validation Errors

Khi gửi request với field thiếu hoặc sai format:

```json
{
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Nhân viên ID không được để trống",
      "field": "nhanVienId"
    },
    {
      "code": "VALIDATION_ERROR",
      "message": "Đơn giá không được để trống",
      "field": "items[0].donGia"
    }
  ]
}
```

**Xử lý:**
- Hiển thị lỗi validation cho từng field
- Highlight field bị lỗi
- Disable submit button nếu có lỗi

### 12.2. Business Errors

Khi vi phạm business rules:

```json
{
  "errors": [
    {
      "code": "INSUFFICIENT_STOCK",
      "message": "Sản phẩm 'Coca Cola' không đủ tồn kho. Còn lại: 5"
    }
  ]
}
```

**Xử lý:**
- Hiển thị thông báo lỗi rõ ràng
- Cập nhật UI (ví dụ: giảm số lượng trong giỏ hàng)

### 12.3. Authentication Errors

**401 Unauthorized:**
```json
{
  "errors": [
    {
      "code": "UNAUTHORIZED",
      "message": "Chưa đăng nhập"
    }
  ]
}
```

**Xử lý:**
- Redirect về trang login
- Clear token và user info

**403 Forbidden:**
```json
{
  "errors": [
    {
      "code": "FORBIDDEN",
      "message": "Không có quyền truy cập"
    }
  ]
}
```

**Xử lý:**
- Hiển thị thông báo "Không có quyền"
- Ẩn/hide các chức năng không được phép

### 12.4. Not Found Errors

**404 Not Found:**
```json
{
  "errors": [
    {
      "code": "NOT_FOUND",
      "message": "Sản phẩm không tồn tại"
    }
  ]
}
```

**Xử lý:**
- Hiển thị thông báo "Không tìm thấy"
- Redirect về trang danh sách (nếu cần)

---

## 13. DTO Structures

### 13.1. ProductDTO

```typescript
interface ProductDTO {
  id?: number;
  maSanPham: string;          // Required, max 50
  barcode?: string;            // max 50
  tenSanPham: string;          // Required, max 200
  moTa?: string;
  donViTinh?: string;          // max 50
  giaBan: number;              // Required, > 0
  giaNhap?: number;            // >= 0
  tonKho: number;              // Required, >= 0
  tonKhoToiThieu?: number;     // >= 0
  hinhAnh?: string;            // max 2000 (URL)
  chiNhanhId?: number;
  tenChiNhanh?: string;
  nhaCungCapId?: number;
  tenNhaCungCap?: string;
  trangThai: "ACTIVE" | "INACTIVE" | "DISCONTINUED";  // Required
}
```

### 13.2. CustomerDTO

```typescript
interface CustomerDTO {
  id?: number;
  maKhachHang: string;         // Required, max 20
  tenKhachHang: string;         // Required, max 200
  soDienThoai?: string;         // Format: ^(\+84|0)[0-9]{9}$
  email?: string;               // Email format, max 100
  diaChi?: string;              // max 500
  diemTichLuy?: number;         // >= 0
  trangThai: "ACTIVE" | "INACTIVE";  // Required
}
```

### 13.3. EmployeeDTO

```typescript
interface EmployeeDTO {
  id?: number;
  maNhanVien: string;           // Required, max 20
  tenNhanVien: string;           // Required, max 200
  username: string;              // Required, 4-50
  password?: string;             // min 6 (only when creating)
  email?: string;                // Email format, max 100
  soDienThoai?: string;           // Format: ^(\+84|0)[0-9]{9}$
  role: "ADMIN" | "MANAGER" | "CASHIER";  // Required
  chiNhanhId?: number;
  tenChiNhanh?: string;
  trangThai: "ACTIVE" | "INACTIVE";  // Required
}
```

### 13.4. CheckoutRequest

```typescript
interface CheckoutRequest {
  khachHangId?: number;
  nhanVienId: number;            // Required
  chiNhanhId: number;            // Required
  items: CartItemDTO[];          // Required, not empty
  giamGia?: number;              // >= 0
  phuongThucThanhToan: string;   // Required: "CASH", "CARD", "MOMO", "ZALOPAY", "BANK_TRANSFER", "OTHER"
  diemSuDung?: number;           // >= 0
  ghiChu?: string;
}

interface CartItemDTO {
  sanPhamId: number;             // Required
  soLuong: number;                // Required, > 0
  donGia: number;                 // Required, > 0 (from product.giaBan)
  ghiChu?: string;
}
```

### 13.5. InvoiceDTO

```typescript
interface InvoiceDTO {
  id: number;
  maHoaDon: string;
  khachHangId?: number;
  tenKhachHang?: string;
  soDienThoaiKhachHang?: string;
  nhanVienId: number;
  tenNhanVien: string;
  chiNhanhId: number;
  tenChiNhanh: string;
  ngayTao: string;                // ISO 8601 format
  tongTien: number;
  giamGia: number;
  thanhTien: number;
  phuongThucThanhToan: string;
  diemSuDung: number;
  diemTichLuy: number;
  ghiChu?: string;
  trangThai: "COMPLETED" | "CANCELLED" | "REFUNDED";
  chiTietHoaDons: InvoiceDetailDTO[];
}

interface InvoiceDetailDTO {
  id: number;
  sanPhamId: number;
  tenSanPham: string;
  maSanPham: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  ghiChu?: string;
}
```

### 13.6. PromotionDTO

```typescript
interface PromotionDTO {
  id: number;
  maKhuyenMai: string;
  tenKhuyenMai: string;
  moTa?: string;
  loaiKhuyenMai: "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_X_GET_Y";
  chiNhanhId: number;
  tenChiNhanh?: string;
  ngayBatDau: string;             // ISO 8601
  ngayKetThuc: string;            // ISO 8601
  giaTriKhuyenMai: number;
  giaTriToiThieu?: number;
  giamToiDa?: number;
  soLuongMua?: number;             // For BUY_X_GET_Y
  soLuongTang?: number;           // For BUY_X_GET_Y
  soLanSuDungToiDa?: number;
  tongSoLanSuDungToiDa?: number;
  soLanDaSuDung?: number;
  trangThai: "ACTIVE" | "INACTIVE";
  anhKhuyenMai?: string;
  dieuKien?: string;
  isActive?: boolean;              // Computed: promotion is currently active
  sanPhamIds?: number[];           // List of product IDs
}
```

---

## 14. Best Practices

### 14.1. Authentication

1. **Lưu token:**
   ```javascript
   // Sau khi login
   localStorage.setItem('token', response.data.token);
   localStorage.setItem('user', JSON.stringify(response.data));
   ```

2. **Gửi token trong mọi request:**
   ```javascript
   const token = localStorage.getItem('token');
   fetch('/api/v1/pos/products', {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   });
   ```

3. **Xử lý token hết hạn:**
   ```javascript
   if (response.status === 401) {
     localStorage.removeItem('token');
     localStorage.removeItem('user');
     window.location.href = '/login';
   }
   ```

### 14.2. Error Handling

1. **Wrap API calls:**
   ```javascript
   async function apiCall(url, options) {
     try {
       const response = await fetch(url, options);
       const data = await response.json();
       
       if (!response.ok) {
         // Handle errors
         if (data.errors) {
           data.errors.forEach(error => {
             console.error(`${error.field}: ${error.message}`);
           });
         }
         throw new Error(data.errors?.[0]?.message || 'Request failed');
       }
       
       return data;
     } catch (error) {
       console.error('API Error:', error);
       throw error;
     }
   }
   ```

### 14.3. Form Validation

1. **Validate trước khi submit:**
   ```javascript
   function validateCheckoutRequest(request) {
     const errors = [];
     
     if (!request.nhanVienId) {
       errors.push({ field: 'nhanVienId', message: 'Nhân viên ID không được để trống' });
     }
     
     if (!request.chiNhanhId) {
       errors.push({ field: 'chiNhanhId', message: 'Chi nhánh ID không được để trống' });
     }
     
     if (!request.items || request.items.length === 0) {
       errors.push({ field: 'items', message: 'Giỏ hàng không được trống' });
     }
     
     request.items?.forEach((item, index) => {
       if (!item.donGia) {
         errors.push({ field: `items[${index}].donGia`, message: 'Đơn giá không được để trống' });
       }
     });
     
     return errors;
   }
   ```

### 14.4. State Management

1. **Lưu user info sau login:**
   ```javascript
   const user = {
     id: loginResponse.data.id,
     username: loginResponse.data.username,
     chiNhanhId: loginResponse.data.chiNhanhId,
     role: loginResponse.data.role
   };
   
   // Sử dụng khi checkout
   checkoutRequest.nhanVienId = user.id;
   checkoutRequest.chiNhanhId = user.chiNhanhId;
   ```

2. **Lưu product info khi thêm vào giỏ:**
   ```javascript
   const cartItem = {
     sanPhamId: product.id,
     soLuong: 1,
     donGia: product.giaBan,  // QUAN TRỌNG: Lấy từ product
     ghiChu: null
   };
   ```

### 14.5. Date Format

1. **Format date cho API:**
   ```javascript
   const date = new Date();
   const formattedDate = date.toISOString().split('T')[0];  // "2025-12-06"
   
   // Hoặc
   const formattedDate = date.toLocaleDateString('en-CA');  // "2025-12-06"
   ```

### 14.6. File Upload

1. **Upload file trước khi tạo sản phẩm:**
   ```javascript
   async function uploadProductImage(file) {
     const formData = new FormData();
     formData.append('file', file);
     
     const response = await fetch('/api/v1/files/products/upload', {
       method: 'POST',
       body: formData
     });
     
     const data = await response.json();
     return data.data;  // URL của file
   }
   
   // Sử dụng
   const imageUrl = await uploadProductImage(file);
   productDTO.hinhAnh = imageUrl;
   ```

---

## 15. Checklist Frontend Integration

### 15.1. Authentication
- [ ] Implement login với username/password
- [ ] Lưu token và user info sau login
- [ ] Gửi token trong mọi request
- [ ] Xử lý 401 (redirect login)
- [ ] Xử lý 403 (hide unauthorized features)

### 15.2. POS - Bán Hàng
- [ ] Implement quét barcode
- [ ] Implement tìm kiếm sản phẩm
- [ ] Implement thêm vào giỏ hàng (lưu `donGia` từ `product.giaBan`)
- [ ] Implement validate giỏ hàng
- [ ] Implement checkout (gửi đầy đủ `nhanVienId`, `chiNhanhId`, `donGia`, `phuongThucThanhToan`)
- [ ] Implement hiển thị hóa đơn
- [ ] Implement in hóa đơn (PDF)

### 15.3. Quản Lý Sản Phẩm
- [ ] Implement CRUD sản phẩm
- [ ] Implement upload hình ảnh
- [ ] Implement validation form
- [ ] Implement hiển thị sản phẩm tồn kho thấp

### 15.4. Quản Lý Khách Hàng
- [ ] Implement CRUD khách hàng
- [ ] Implement tìm kiếm khách hàng
- [ ] Implement validation form (SĐT, email)

### 15.5. Quản Lý Nhân Viên
- [ ] Implement CRUD nhân viên (Admin only)
- [ ] Implement đổi mật khẩu

### 15.6. Quản Lý Tồn Kho
- [ ] Implement nhập hàng
- [ ] Implement trả hàng
- [ ] Implement kiểm tra tồn kho

### 15.7. Quản Lý Khuyến Mãi
- [ ] Implement CRUD khuyến mãi (Admin)
- [ ] Implement tính giảm giá (POS)
- [ ] Implement áp dụng khuyến mãi khi checkout

### 15.8. Báo Cáo
- [ ] Implement báo cáo doanh thu
- [ ] Implement báo cáo top sản phẩm
- [ ] Implement tải Excel

### 15.9. Error Handling
- [ ] Implement hiển thị validation errors
- [ ] Implement hiển thị business errors
- [ ] Implement xử lý network errors

---

## 16. Common Issues & Solutions

### 16.1. "Nhân viên ID không được để trống"

**Nguyên nhân:** Chưa lưu `user.id` sau login

**Giải pháp:**
```javascript
// Sau login
const user = loginResponse.data;
localStorage.setItem('user', JSON.stringify(user));

// Khi checkout
const user = JSON.parse(localStorage.getItem('user'));
checkoutRequest.nhanVienId = user.id;
```

### 16.2. "Đơn giá không được để trống"

**Nguyên nhân:** Chưa lưu `donGia` khi thêm vào giỏ hàng

**Giải pháp:**
```javascript
// Khi thêm sản phẩm vào giỏ
const cartItem = {
  sanPhamId: product.id,
  soLuong: 1,
  donGia: product.giaBan,  // ← QUAN TRỌNG
  ghiChu: null
};
```

### 16.3. "Phương thức thanh toán không được để trống"

**Nguyên nhân:** User chưa chọn phương thức thanh toán

**Giải pháp:**
```javascript
// User phải chọn trước khi checkout
checkoutRequest.phuongThucThanhToan = selectedPaymentMethod;  // "CASH", "CARD", etc.
```

### 16.4. "Sản phẩm không đủ tồn kho"

**Nguyên nhân:** Số lượng yêu cầu > tồn kho

**Giải pháp:**
- Hiển thị thông báo lỗi
- Cập nhật số lượng trong giỏ hàng <= tồn kho
- Hoặc xóa sản phẩm khỏi giỏ hàng

### 16.5. Image không hiển thị

**Nguyên nhân:** URL sai hoặc file không tồn tại

**Giải pháp:**
```javascript
// Sử dụng đúng URL từ response
const imageUrl = product.hinhAnh;  // "/uploads/products/abc123.jpg"

// Hiển thị
<img src={`http://localhost:8081${imageUrl}`} alt={product.tenSanPham} />
```

---

## 17. API Base URL

**Development:**
```
http://localhost:8081
```

**Production:**
```
https://api.yourdomain.com
```

**Cấu hình:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';
```

---

## 18. Tài Liệu Liên Quan

- [POS_SALES_FLOW.md](./POS_SALES_FLOW.md) - Chi tiết quy trình POS
- [CHECKOUT_REQUEST_FIELDS.md](./CHECKOUT_REQUEST_FIELDS.md) - Chi tiết CheckoutRequest
- [FRONTEND_FILE_UPLOAD_GUIDE.md](./FRONTEND_FILE_UPLOAD_GUIDE.md) - Hướng dẫn upload file
- [FRONTEND_ANSWERS.md](./FRONTEND_ANSWERS.md) - Câu trả lời các câu hỏi thường gặp

---

**📝 Lưu ý:** Tài liệu này được cập nhật thường xuyên. Nếu có thay đổi API, vui lòng cập nhật tài liệu này.

**📧 Liên hệ:** Nếu có thắc mắc, vui lòng liên hệ team backend.

