# 📚 API Documentation - Retail Platform

Tài liệu chi tiết về API Endpoints, DTO/Response Models, Business Rules và Technical Specs

---

## BƯỚC 1: API ENDPOINTS DOCUMENTATION

### 1. Swagger/OpenAPI URL

**Swagger UI URL:**
```
http://localhost:8081/swagger-ui.html
```

**OpenAPI JSON:**
```
http://localhost:8081/v3/api-docs
```

**Lưu ý:** Port mặc định là `8081`. Nếu bạn đã thay đổi port trong `application.yml`, hãy cập nhật URL tương ứng.

### 2. Danh sách API Endpoints chính

#### 🔐 Authentication APIs

| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|---------------|
| `POST` | `/api/v1/auth/login` | Đăng nhập, lấy JWT token | Public |
| `GET` | `/api/v1/auth/me` | Lấy thông tin user hiện tại | Required |
| `POST` | `/api/v1/auth/logout` | Đăng xuất | Required |

#### 📦 Product APIs (Public)

| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|---------------|
| `GET` | `/api/products` | Danh sách sản phẩm (phân trang) | Public |
| `GET` | `/api/products/{id}` | Chi tiết sản phẩm theo ID | Public |
| `GET` | `/api/products/barcode/{barcode}` | Tìm sản phẩm theo barcode | Public |
| `GET` | `/api/products/search` | Tìm kiếm sản phẩm theo từ khóa | Public |
| `POST` | `/api/products` | Tạo sản phẩm mới | Public (tạm thời) |
| `PUT` | `/api/products/{id}` | Cập nhật sản phẩm | Public (tạm thời) |
| `DELETE` | `/api/products/{id}` | Xóa sản phẩm | Public (tạm thời) |

#### 👥 Customer APIs (Public)

| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|---------------|
| `GET` | `/api/customers` | Danh sách khách hàng (phân trang) | Public |
| `GET` | `/api/customers/{id}` | Chi tiết khách hàng theo ID | Public |
| `GET` | `/api/customers/phone/{phone}` | Tìm khách hàng theo số điện thoại | Public |
| `GET` | `/api/customers/search` | Tìm kiếm khách hàng theo từ khóa | Public |
| `POST` | `/api/customers` | Tạo khách hàng mới | Public (tạm thời) |
| `PUT` | `/api/customers/{id}` | Cập nhật khách hàng | Public (tạm thời) |
| `DELETE` | `/api/customers/{id}` | Xóa khách hàng | Public (tạm thời) |

#### 🏪 POS APIs (Yêu cầu: CASHIER, MANAGER, ADMIN)

| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|---------------|
| `POST` | `/api/v1/pos/checkout` | Tạo hóa đơn (checkout) | CASHIER, MANAGER, ADMIN |
| `POST` | `/api/v1/pos/checkout/validate` | Validate giỏ hàng trước khi checkout | CASHIER, MANAGER, ADMIN |
| `GET` | `/api/v1/pos/products` | Danh sách sản phẩm cho POS | CASHIER, MANAGER, ADMIN |
| `GET` | `/api/v1/pos/products/search` | Tìm kiếm sản phẩm cho POS | CASHIER, MANAGER, ADMIN |
| `GET` | `/api/v1/pos/products/scan/{barcode}` | Scan sản phẩm theo barcode | CASHIER, MANAGER, ADMIN |
| `GET` | `/api/v1/pos/products/{id}` | Chi tiết sản phẩm | CASHIER, MANAGER, ADMIN |
| `GET` | `/api/v1/pos/invoices/{id}` | Chi tiết hóa đơn | CASHIER, MANAGER, ADMIN |
| `GET` | `/api/v1/pos/invoices/by-date` | Lấy hóa đơn theo ngày | CASHIER, MANAGER, ADMIN |
| `POST` | `/api/v1/pos/payments/process` | Xử lý thanh toán | CASHIER, MANAGER, ADMIN |
| `GET` | `/api/v1/pos/payments/verify/{transactionId}` | Xác minh trạng thái thanh toán | CASHIER, MANAGER, ADMIN |
| `POST` | `/api/v1/pos/payments/refund` | Hoàn tiền | CASHIER, MANAGER, ADMIN |
| `GET` | `/api/v1/pos/payments/{transactionId}` | Lấy giao dịch thanh toán | CASHIER, MANAGER, ADMIN |
| `GET` | `/api/v1/pos/payments/invoice/{invoiceId}` | Lấy danh sách giao dịch theo hóa đơn | CASHIER, MANAGER, ADMIN |
| `POST` | `/api/v1/pos/payments/reconcile/{transactionId}` | Đối soát thanh toán | CASHIER, MANAGER, ADMIN |
| `GET` | `/api/v1/pos/promotions/branch/{branchId}/active` | Khuyến mãi đang hoạt động | CASHIER, MANAGER, ADMIN |

#### 👨‍💼 Admin APIs (Yêu cầu: ADMIN, MANAGER)

| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|---------------|
| **Products** | | | |
| `POST` | `/api/v1/admin/products` | Tạo sản phẩm mới | ADMIN, MANAGER |
| `PUT` | `/api/v1/admin/products/{id}` | Cập nhật sản phẩm | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/products` | Danh sách sản phẩm (phân trang) | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/products/{id}` | Chi tiết sản phẩm | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/products/search` | Tìm kiếm sản phẩm | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/products/low-stock` | Sản phẩm sắp hết hàng | ADMIN, MANAGER |
| `DELETE` | `/api/v1/admin/products/{id}` | Xóa sản phẩm | ADMIN, MANAGER |
| `PATCH` | `/api/v1/admin/products/{id}/status` | Cập nhật trạng thái sản phẩm | ADMIN, MANAGER |
| **Customers** | | | |
| `POST` | `/api/v1/admin/customers` | Tạo khách hàng mới | ADMIN, MANAGER |
| `PUT` | `/api/v1/admin/customers/{id}` | Cập nhật khách hàng | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/customers` | Danh sách khách hàng (phân trang) | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/customers/{id}` | Chi tiết khách hàng | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/customers/phone/{phone}` | Tìm khách hàng theo số điện thoại | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/customers/search` | Tìm kiếm khách hàng | ADMIN, MANAGER |
| `DELETE` | `/api/v1/admin/customers/{id}` | Xóa khách hàng | ADMIN, MANAGER |
| `PATCH` | `/api/v1/admin/customers/{id}/points` | Cập nhật điểm tích lũy | ADMIN, MANAGER |
| **Inventory** | | | |
| `POST` | `/api/v1/admin/inventory/import` | Nhập hàng | ADMIN, MANAGER |
| `POST` | `/api/v1/admin/inventory/return` | Trả hàng | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/inventory/stock/{productId}` | Kiểm tra tồn kho | ADMIN, MANAGER |
| **Promotions** | | | |
| `POST` | `/api/v1/admin/promotions` | Tạo khuyến mãi | ADMIN, MANAGER |
| `PUT` | `/api/v1/admin/promotions/{id}` | Cập nhật khuyến mãi | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/promotions` | Danh sách khuyến mãi | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/promotions/{id}` | Chi tiết khuyến mãi | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/promotions/code/{code}` | Tìm khuyến mãi theo mã | ADMIN, MANAGER |
| `GET` | `/api/v1/admin/promotions/branch/{branchId}/active` | Khuyến mãi đang hoạt động theo chi nhánh | ADMIN, MANAGER |
| `POST` | `/api/v1/admin/promotions/{id}/activate` | Kích hoạt khuyến mãi | ADMIN, MANAGER |
| `POST` | `/api/v1/admin/promotions/{id}/deactivate` | Vô hiệu hóa khuyến mãi | ADMIN, MANAGER |
| `DELETE` | `/api/v1/admin/promotions/{id}` | Xóa khuyến mãi | ADMIN, MANAGER |
| **Employees** | | | |
| `POST` | `/api/v1/admin/employees` | Tạo nhân viên mới | ADMIN |
| `PUT` | `/api/v1/admin/employees/{id}` | Cập nhật nhân viên | ADMIN |
| `GET` | `/api/v1/admin/employees` | Danh sách nhân viên | ADMIN |
| `GET` | `/api/v1/admin/employees/{id}` | Chi tiết nhân viên | ADMIN |

#### 📄 Invoice APIs (Public)

| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|---------------|
| `GET` | `/api/invoices/{id}` | Chi tiết hóa đơn | Public |
| `GET` | `/api/invoices/by-date` | Lấy hóa đơn theo ngày | Public |
| `GET` | `/api/invoices/{id}/print` | Lấy dữ liệu hóa đơn để in (JSON) | Public |

#### 📊 Report APIs (Public)

| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|---------------|
| `GET` | `/api/reports/revenue/excel` | Báo cáo doanh thu (Excel) | Public |
| `GET` | `/api/reports/inventory/excel` | Báo cáo tồn kho (Excel) | Public |
| `GET` | `/api/reports/sales/excel` | Báo cáo sản phẩm bán chạy (Excel) | Public |

---

## BƯỚC 2: DTO/RESPONSE MODELS

### 1. Login Response

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoxNjk4ODUxODMyfQ...",
    "type": "Bearer",
    "id": 1,
    "username": "admin",
    "tenNhanVien": "Quản trị viên",
    "email": "admin@retail.com",
    "role": "ADMIN",
    "chiNhanhId": 1,
    "tenChiNhanh": "Chi nhánh Trung tâm"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00"
  }
}
```

### 2. Product Response

**Request:**
```http
GET /api/products/1
```

**Response:**
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
  "chiNhanhId": 1,
  "tenChiNhanh": "Chi nhánh Trung tâm",
  "nhaCungCapId": 1,
  "tenNhaCungCap": "Công ty TNHH ABC",
  "trangThai": "ACTIVE"
}
```

### 3. Customer Response

**Request:**
```http
GET /api/customers/1
```

**Response:**
```json
{
  "id": 1,
  "maKhachHang": "KH001",
  "tenKhachHang": "Nguyễn Văn A",
  "soDienThoai": "0901234567",
  "email": "nguyenvana@example.com",
  "diaChi": "123 Đường ABC, Quận 1, TP.HCM",
  "diemTichLuy": 500.00,
  "trangThai": "ACTIVE"
}
```

### 4. Invoice Response

**Request:**
```http
GET /api/invoices/1
```

**Response:**
```json
{
  "id": 1,
  "maHoaDon": "HD20250115001",
  "khachHangId": 1,
  "tenKhachHang": "Nguyễn Văn A",
  "soDienThoaiKhachHang": "0901234567",
  "nhanVienId": 1,
  "tenNhanVien": "Quản trị viên",
  "chiNhanhId": 1,
  "tenChiNhanh": "Chi nhánh Trung tâm",
  "ngayTao": "2025-01-15T10:30:00",
  "tongTien": 100000.00,
  "giamGia": 10000.00,
  "thanhTien": 90000.00,
  "phuongThucThanhToan": "CASH",
  "diemSuDung": 0.00,
  "diemTichLuy": 50.00,
  "ghiChu": "Khách hàng VIP",
  "trangThai": "COMPLETED",
  "chiTietHoaDons": [
    {
      "id": 1,
      "sanPhamId": 1,
      "tenSanPham": "Nước ngọt Coca Cola 330ml",
      "maSanPham": "SP001",
      "soLuong": 10,
      "donGia": 10000.00,
      "thanhTien": 100000.00,
      "ghiChu": null
    }
  ]
}
```

### 5. Pagination Response Example

**Request:**
```http
GET /api/products?page=0&size=10&sort=id,desc
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "maSanPham": "SP001",
      "tenSanPham": "Nước ngọt Coca Cola 330ml",
      ...
    },
    ...
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalElements": 100,
  "totalPages": 10,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false,
  "numberOfElements": 10,
  "empty": false
}
```

---

## BƯỚC 3: BUSINESS RULES

### 1. User Roles

#### ADMIN
- **Quyền:** Toàn quyền quản lý hệ thống
- **Có thể:**
  - Quản lý nhân viên (tạo, sửa, xóa)
  - Quản lý sản phẩm, khách hàng, khuyến mãi
  - Nhập hàng, trả hàng
  - Xem tất cả báo cáo
  - Sử dụng POS (bán hàng)
  - Truy cập tất cả API endpoints

#### MANAGER
- **Quyền:** Quản lý chi nhánh và bán hàng
- **Có thể:**
  - Quản lý sản phẩm, khách hàng, khuyến mãi
  - Nhập hàng, trả hàng
  - Xem báo cáo
  - Sử dụng POS (bán hàng)
  - **KHÔNG thể:** Quản lý nhân viên

#### CASHIER
- **Quyền:** Chỉ bán hàng tại quầy
- **Có thể:**
  - Sử dụng POS (scan sản phẩm, checkout)
  - Xử lý thanh toán
  - Xem hóa đơn
  - Xem khuyến mãi đang hoạt động
  - **KHÔNG thể:** Quản lý sản phẩm, khách hàng, nhập hàng, xem báo cáo

### 2. POS Flow (Quy trình bán hàng)

#### Bước 1: Cashier Login
```http
POST /api/v1/auth/login
{
  "username": "cashier1",
  "password": "admin123"
}
```

#### Bước 2: Tìm/Scan Product
- **Option A:** Scan barcode
  ```http
  GET /api/v1/pos/products/scan/{barcode}
  Authorization: Bearer {token}
  ```

- **Option B:** Tìm kiếm sản phẩm
  ```http
  GET /api/v1/pos/products/search?keyword=coca
  Authorization: Bearer {token}
  ```

#### Bước 3: Thêm vào Cart
- Frontend quản lý cart locally
- Validate cart trước khi checkout:
  ```http
  POST /api/v1/pos/checkout/validate
  Authorization: Bearer {token}
  {
    "items": [
      {
        "sanPhamId": 1,
        "soLuong": 2,
        "ghiChu": null
      }
    ]
  }
  ```

#### Bước 4: Chọn Customer (Optional)
- Có thể bán cho khách vãng lai (không cần customer)
- Nếu có customer, tìm theo số điện thoại:
  ```http
  GET /api/customers/phone/{phone}
  ```

#### Bước 5: Apply Discount (Optional)
- Giảm giá thủ công: Nhập vào field `giamGia` trong CheckoutRequest
- Khuyến mãi tự động: Hệ thống tự động áp dụng khi checkout
- Xem khuyến mãi đang hoạt động:
  ```http
  GET /api/v1/pos/promotions/branch/{branchId}/active
  Authorization: Bearer {token}
  ```

#### Bước 6: Payment Method
- Chọn phương thức thanh toán:
  - `CASH` - Tiền mặt
  - `VISA` - Thẻ Visa
  - `MASTER` - Thẻ Mastercard
  - `JCB` - Thẻ JCB
  - `BANK_TRANSFER` - Chuyển khoản ngân hàng

#### Bước 7: Checkout
```http
POST /api/v1/pos/checkout
Authorization: Bearer {token}
{
  "khachHangId": 1,  // Optional
  "nhanVienId": 3,
  "chiNhanhId": 1,
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "ghiChu": null
    }
  ],
  "giamGia": 10000.00,  // Optional - giảm giá thủ công
  "phuongThucThanhToan": "CASH",
  "diemSuDung": 0.00,  // Optional - điểm sử dụng
  "ghiChu": "Khách hàng VIP"
}
```

**Response:** InvoiceDTO với thông tin hóa đơn đã tạo

#### Bước 8: In hóa đơn (Optional)
```http
GET /api/invoices/{id}/print
```
Trả về dữ liệu hóa đơn dạng JSON - Frontend tự xử lý format và in

### 3. Product Management

#### Category
- **Hiện tại:** Không có category riêng biệt
- Sản phẩm được quản lý theo:
  - Chi nhánh (`chiNhanhId`)
  - Nhà cung cấp (`nhaCungCapId`)

#### Barcode Scanning
- ✅ **Có hỗ trợ barcode scanning**
- Endpoint: `GET /api/products/barcode/{barcode}`
- Endpoint POS: `GET /api/v1/pos/products/scan/{barcode}`

#### Stock/Inventory Tracking
- ✅ **Có tracking tồn kho**
- Field: `tonKho` (Integer)
- Tự động giảm khi checkout
- Tự động tăng khi nhập hàng

#### Low Stock Alert
- ✅ **Có cảnh báo tồn kho thấp**
- Field: `tonKhoToiThieu` (Integer)
- Endpoint: `GET /api/v1/admin/products/low-stock`
- Trả về danh sách sản phẩm có `tonKho <= tonKhoToiThieu`

### 4. Customer Management

#### Loyalty Program
- ✅ **Có hệ thống điểm tích lũy**
- Field: `diemTichLuy` (BigDecimal)
- Tự động tích lũy khi mua hàng (tính theo % của tổng tiền)

#### Point System
- ✅ **Có điểm tích lũy và sử dụng điểm**
- **Tích lũy:** Tự động khi checkout (nếu có customer)
- **Sử dụng:** Có thể dùng điểm để giảm giá (`diemSuDung` trong CheckoutRequest)
- **Cập nhật điểm:** `PATCH /api/v1/admin/customers/{id}/points?points=1000`

#### Member Discount
- **Hiện tại:** Không có member discount riêng
- Có thể áp dụng giảm giá thủ công trong checkout
- Có thể tạo khuyến mãi cho customer cụ thể (qua promotion system)

---

## BƯỚC 4: TECHNICAL SPECS

### 1. Authentication

#### JWT Token in Header
```http
Authorization: Bearer {token}
```

**Ví dụ:**
```http
GET /api/v1/pos/products
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoxNjk4ODUxODMyfQ...
```

#### Token Expiration
- **Mặc định:** 1440 phút = **24 giờ**
- Cấu hình trong `application.yml`:
  ```yaml
  app:
    jwt:
      exp-min: 1440  # 24 hours
  ```

#### Refresh Token
- ❌ **Hiện tại:** Không có refresh token
- Khi token hết hạn, user cần login lại

### 2. Pagination

#### Request Format
```http
GET /api/products?page=0&size=10&sort=id,desc
```

**Parameters:**
- `page`: Số trang (bắt đầu từ 0)
- `size`: Số lượng items mỗi trang
- `sort`: Sắp xếp (format: `field,direction`)
  - `direction`: `asc` hoặc `desc`
  - Có thể sort nhiều field: `sort=id,desc&sort=tenSanPham,asc`

#### Response Structure
```json
{
  "content": [
    // Array of items
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalElements": 100,
  "totalPages": 10,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false,
  "numberOfElements": 10,
  "empty": false
}
```

**Hoặc với ApiResponse wrapper:**
```json
{
  "data": {
    "content": [...],
    "totalElements": 100,
    "totalPages": 10,
    "number": 0,
    "size": 10
  },
  "paging": {
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00"
  }
}
```

### 3. Error Response

#### Standard Error Response
```json
{
  "errors": [
    {
      "code": "ERR_INTERNAL",
      "message": "Đã xảy ra lỗi hệ thống",
      "field": null
    }
  ],
  "meta": {
    "timestamp": "2025-01-15T10:30:00"
  }
}
```

#### Validation Error Response
```json
{
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Mã sản phẩm không được để trống",
      "field": "maSanPham"
    },
    {
      "code": "VALIDATION_ERROR",
      "message": "Giá bán phải lớn hơn 0",
      "field": "giaBan"
    }
  ],
  "meta": {
    "timestamp": "2025-01-15T10:30:00"
  }
}
```

#### Common Error Codes
- `ERR_INTERNAL` - Lỗi hệ thống
- `VALIDATION_ERROR` - Lỗi validation
- `RESOURCE_NOT_FOUND` - Không tìm thấy resource
- `UNAUTHORIZED` - Chưa đăng nhập
- `FORBIDDEN` - Không có quyền truy cập
- `DUPLICATE_BARCODE` - Barcode đã tồn tại
- `INSUFFICIENT_STOCK` - Không đủ tồn kho
- `INVALID_QUANTITY` - Số lượng không hợp lệ

### 4. Default Users (Từ Database Migration)

```
Username: admin
Password: admin123
Role: ADMIN

Username: manager1
Password: admin123
Role: MANAGER

Username: cashier1
Password: admin123
Role: CASHIER
```

### 5. Promotion Types

Hệ thống hỗ trợ các loại khuyến mãi sau:

1. **PERCENTAGE** - Giảm giá theo phần trăm (%)
2. **FIXED_AMOUNT** - Giảm giá cố định (số tiền)
3. **BOGO** - Mua 1 tặng 1
4. **BUNDLE** - Combo sản phẩm với giá đặc biệt
5. **FREE_SHIPPING** - Miễn phí vận chuyển
6. **BUY_X_GET_Y** - Mua X sản phẩm tặng Y sản phẩm

### 6. Payment Methods

Hệ thống hỗ trợ các phương thức thanh toán:

1. **CASH** - Tiền mặt
2. **VISA** - Thẻ Visa
3. **MASTER** - Thẻ Mastercard
4. **JCB** - Thẻ JCB
5. **BANK_TRANSFER** - Chuyển khoản ngân hàng

### 7. Caching

- **Redis Cache:** Hỗ trợ caching cho Products, Customers, Invoices, Promotions
- **TTL:** 30 phút (1800000 ms)
- **Cache Prefix:** `retail:`

### 8. Server Port

- **Mặc định:** `8081`
- Cấu hình trong `application.yml`:
  ```yaml
  server:
    port: 8081
  ```

---

## 📝 Notes

1. **Public Endpoints:** Một số endpoints hiện tại là public (không cần authentication) để test cache. Trong production, nên bảo vệ các endpoints này.

2. **CORS:** Hệ thống cho phép CORS từ:
   - `http://localhost:3000` (React - Create React App)
   - `http://localhost:4200` (Angular)
   - `http://localhost:5173` (Vite - React/Vue)

3. **Health Check:**
   ```http
   GET /actuator/health
   ```

4. **API Versioning:** 
   - Auth APIs: `/api/v1/auth/**`
   - POS APIs: `/api/v1/pos/**`
   - Admin APIs: `/api/v1/admin/**`
   - Public APIs: `/api/**` (không có version)

---

**Tài liệu được tạo tự động từ codebase - Cập nhật: 2025-01-15**

