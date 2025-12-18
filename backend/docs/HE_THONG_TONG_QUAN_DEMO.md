# 🏪 HỆ THỐNG QUẢN LÝ BÁN LẺ (RETAIL PLATFORM)
## Tài Liệu Tổng Quan - Demo

**Ngày:** 2025-12-07  
**Sinh viên:** [Tên của bạn]  
**Giáo viên hướng dẫn:** [Tên cô giáo]

---

## 📋 MỤC LỤC

1. [Giới thiệu tổng quan](#1-giới-thiệu-tổng-quan)
2. [Mục tiêu và phạm vi](#2-mục-tiêu-và-phạm-vi)
3. [Các module chính](#3-các-module-chính)
4. [Công nghệ sử dụng](#4-công-nghệ-sử-dụng)
5. [Kiến trúc hệ thống](#5-kiến-trúc-hệ-thống)
6. [Tính năng nổi bật](#6-tính-năng-nổi-bật)
7. [Cơ sở dữ liệu](#7-cơ-sở-dữ-liệu)
8. [API và Endpoints](#8-api-và-endpoints)
9. [Thống kê dự án](#9-thống-kê-dự-án)
10. [Demo Scenarios](#10-demo-scenarios)

---

## 1. GIỚI THIỆU TỔNG QUAN

### 1.1. Tên Hệ Thống
**Retail Platform** - Hệ thống quản lý bán lẻ đa module

### 1.2. Mô Tả Ngắn Gọn
Hệ thống quản lý bán lẻ toàn diện, được xây dựng với kiến trúc multi-module, hỗ trợ:
- ✅ Bán hàng tại quầy (POS)
- ✅ Quản lý tồn kho
- ✅ Quản lý khách hàng và nhân viên
- ✅ Hệ thống khuyến mãi linh hoạt
- ✅ Báo cáo doanh thu, tồn kho (Excel/PDF)
- ✅ Hỗ trợ đa chi nhánh

### 1.3. Đối Tượng Sử Dụng
- **Thu ngân (Cashier)**: Bán hàng tại quầy, xử lý thanh toán
- **Quản lý (Manager)**: Quản lý tồn kho, khuyến mãi, xem báo cáo
- **Quản trị viên (Admin)**: Quản lý toàn bộ hệ thống, nhân viên, chi nhánh

---

## 2. MỤC TIÊU VÀ PHẠM VI

### 2.1. Mục Tiêu
- Xây dựng hệ thống quản lý bán lẻ hiện đại, dễ sử dụng
- Hỗ trợ quy trình bán hàng từ A-Z
- Tối ưu hóa hiệu suất với caching và database optimization
- Đảm bảo bảo mật với JWT authentication và phân quyền
- Tích hợp báo cáo và xuất file (Excel, PDF)

### 2.2. Phạm Vi Dự Án
**Đã hoàn thành:**
- ✅ POS checkout system hoàn chỉnh
- ✅ Quản lý sản phẩm, khách hàng, nhân viên
- ✅ Quản lý tồn kho (nhập/xuất/trả hàng)
- ✅ Hệ thống khuyến mãi (6 loại)
- ✅ Báo cáo doanh thu, tồn kho, bán hàng
- ✅ Hệ thống tích điểm khách hàng
- ✅ Multi-branch support
- ✅ Audit logging tự động

---

## 3. CÁC MODULE CHÍNH

### 3.1. Module 1: POS System (Hệ Thống Bán Hàng)
**Chức năng:**
- Quét barcode sản phẩm
- Thêm/sửa/xóa sản phẩm trong giỏ hàng
- Áp dụng khuyến mãi
- Tính tiền và xử lý thanh toán
- In hóa đơn PDF

**API Endpoints:**
- `POST /api/v1/pos/checkout` - Tạo hóa đơn
- `GET /api/v1/pos/products` - Danh sách sản phẩm
- `GET /api/v1/pos/promotions/active` - Khuyến mãi đang hoạt động

### 3.2. Module 2: Quản Lý Sản Phẩm
**Chức năng:**
- CRUD sản phẩm (tạo, sửa, xóa, xem)
- Quản lý barcode, giá, tồn kho
- Phân loại theo danh mục
- Upload hình ảnh sản phẩm
- Cảnh báo tồn kho thấp

**API Endpoints:**
- `GET /api/v1/admin/products` - Danh sách sản phẩm
- `POST /api/v1/admin/products` - Tạo sản phẩm mới
- `PUT /api/v1/admin/products/{id}` - Cập nhật sản phẩm

### 3.3. Module 3: Quản Lý Khách Hàng
**Chức năng:**
- Quản lý thông tin khách hàng
- Lịch sử mua hàng
- Hệ thống tích điểm (1% của hóa đơn)
- Sử dụng điểm để giảm giá

**API Endpoints:**
- `GET /api/v1/admin/customers` - Danh sách khách hàng
- `POST /api/v1/admin/customers` - Tạo khách hàng mới
- `GET /api/v1/pos/invoices/by-customer/{id}` - Lịch sử mua hàng

### 3.4. Module 4: Quản Lý Tồn Kho
**Chức năng:**
- Nhập hàng từ nhà cung cấp
- Trả hàng về nhà cung cấp
- Theo dõi tồn kho real-time
- Cảnh báo tồn kho thấp
- Báo cáo tồn kho (Excel)

**API Endpoints:**
- `POST /api/v1/admin/inventory/import` - Nhập hàng
- `POST /api/v1/admin/inventory/return` - Trả hàng
- `GET /api/v1/admin/reports/low-stock` - Sản phẩm sắp hết hàng

### 3.5. Module 5: Hệ Thống Khuyến Mãi
**Chức năng:**
- 6 loại khuyến mãi:
  - Giảm giá theo phần trăm (%)
  - Giảm giá cố định (số tiền)
  - Mua 1 tặng 1 (BOGO)
  - Combo sản phẩm (Bundle)
  - Miễn phí vận chuyển
  - Mua X tặng Y
- Áp dụng theo chi nhánh, sản phẩm, thời gian
- Giới hạn số lần sử dụng

**API Endpoints:**
- `POST /api/v1/admin/promotions` - Tạo khuyến mãi
- `GET /api/v1/pos/promotions/active` - Lấy khuyến mãi đang active

### 3.6. Module 6: Báo Cáo và Thống Kê
**Chức năng:**
- Dashboard với thống kê real-time
- Báo cáo doanh thu theo thời gian
- Báo cáo tồn kho
- Báo cáo sản phẩm bán chạy
- Xuất file Excel, PDF

**API Endpoints:**
- `GET /api/v1/admin/dashboard` - Dashboard statistics
- `GET /api/v1/admin/reports/revenue` - Báo cáo doanh thu
- `GET /api/reports/revenue/excel` - Xuất Excel

### 3.7. Module 7: Quản Lý Nhân Viên
**Chức năng:**
- CRUD nhân viên
- Phân quyền (Admin, Manager, Cashier)
- Quản lý thông tin cá nhân
- Đổi mật khẩu

**API Endpoints:**
- `GET /api/v1/admin/employees` - Danh sách nhân viên (có pagination)
- `POST /api/v1/admin/employees` - Tạo nhân viên mới

---

## 4. CÔNG NGHỆ SỬ DỤNG

### 4.1. Backend
- **Ngôn ngữ:** Java 21 (LTS)
- **Framework:** Spring Boot 3.2.0
- **ORM:** Hibernate 6.3.1 (JPA)
- **Build Tool:** Maven 3.8+
- **API:** REST API với Spring Web MVC

### 4.2. Database
- **Hệ quản trị:** Microsoft SQL Server 2022
- **Connection Pool:** HikariCP 5.0.1
- **Migration:** Flyway 9.22.3
- **Cache:** Redis (cho Products, Customers, Invoices)

### 4.3. Security
- **Authentication:** JWT (JSON Web Token)
- **Authorization:** Spring Security với Role-Based Access Control
- **Password:** BCrypt hashing

### 4.4. Reporting & Documents
- **Excel:** Apache POI 5.2.5
- **PDF:** iText 7.2.5
- **QR Code:** ZXing 3.5.2

### 4.5. Testing
- **Unit Tests:** JUnit 5, Mockito
- **Integration Tests:** Testcontainers
- **E2E Tests:** REST Assured

### 4.6. Documentation
- **API Docs:** Swagger/OpenAPI 3.0
- **Access:** http://localhost:8081/swagger-ui.html

---

## 5. KIẾN TRÚC HỆ THỐNG

### 5.1. Kiến Trúc Multi-Module

```
retail-platform/
├── retail-common/          # Constants, exceptions, enums
├── retail-domain/          # JPA Entities (Domain models)
├── retail-persistence/     # Data access layer (Repositories)
├── retail-security/        # Security configuration, JWT
├── retail-application/     # Business logic (Services, DTOs, Mappers)
├── retail-api/             # Public REST APIs
├── retail-pos-api/         # POS-specific APIs
├── retail-admin-api/       # Admin APIs
├── retail-migrations/      # Flyway database migrations
└── retail-bootstrap/       # Main application entry point
```

### 5.2. Kiến Trúc Lớp (Layered Architecture)

```
┌─────────────────────────────────────────┐
│  Controllers (API Layer)                │
│  - AuthController, PosController, etc.  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Services (Business Logic Layer)        │
│  - PosService, ProductService, etc.     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Repositories (Data Access Layer)       │
│  - ProductRepository, InvoiceRepo, etc. │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Entities (Domain Layer)                │
│  - SanPham, HoaDon, KhachHang, etc.     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Database (SQL Server)                  │
└─────────────────────────────────────────┘
```

### 5.3. Flow Xử Lý Request

```
Client Request
    ↓
Spring Security Filter (JWT Validation)
    ↓
Controller (API Endpoint)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Database Query)
    ↓
Database (SQL Server)
    ↓
Response (JSON)
```

---

## 6. TÍNH NĂNG NỔI BẬT

### 6.1. Hệ Thống Tích Điểm Khách Hàng
- **Tích điểm:** 1% giá trị hóa đơn
- **Sử dụng điểm:** Giảm giá trực tiếp từ tổng tiền
- **Cập nhật tự động:** Sau mỗi hóa đơn

### 6.2. Redis Caching
- **Products:** Cache 1 giờ
- **Customers:** Cache 15 phút
- **Invoices:** Cache 10 phút
- **Promotions:** Cache 15 phút
- **Lợi ích:** Tăng tốc độ truy vấn, giảm tải database

### 6.3. Audit Logging Tự Động
- Tự động ghi log mọi thao tác CREATE/UPDATE/DELETE
- Lưu thông tin: ai, khi nào, làm gì
- Hỗ trợ truy vết và kiểm toán

### 6.4. Multi-Branch Support
- Hỗ trợ quản lý nhiều chi nhánh
- Dữ liệu phân tách theo chi nhánh
- Báo cáo theo từng chi nhánh

### 6.5. Phân Quyền Chi Tiết
- **ADMIN:** Quản lý toàn bộ hệ thống
- **MANAGER:** Quản lý kho, khuyến mãi, báo cáo
- **CASHIER:** Chỉ bán hàng, xử lý thanh toán

---

## 7. CƠ SỞ DỮ LIỆU

### 7.1. Các Bảng Chính

| Bảng | Mô Tả | Số Trường |
|------|-------|-----------|
| `san_pham` | Sản phẩm | ~15 fields |
| `khach_hang` | Khách hàng | ~12 fields |
| `nhan_vien` | Nhân viên | ~12 fields |
| `hoa_don` | Hóa đơn | ~15 fields |
| `chi_tiet_hoa_don` | Chi tiết hóa đơn | ~8 fields |
| `khuyen_mai` | Khuyến mãi | ~20 fields |
| `chi_tiet_khuyen_mai` | Chi tiết khuyến mãi | ~5 fields |
| `nhap_hang` | Phiếu nhập hàng | ~10 fields |
| `chi_nhanh` | Chi nhánh | ~8 fields |
| `audit_log` | Nhật ký audit | ~10 fields |

**Tổng cộng:** ~20 bảng chính

### 7.2. Relationships
- **Hóa đơn ↔ Chi tiết hóa đơn:** 1-N
- **Sản phẩm ↔ Chi tiết hóa đơn:** 1-N
- **Khách hàng ↔ Hóa đơn:** 1-N
- **Khuyến mãi ↔ Chi tiết khuyến mãi:** 1-N
- **Sản phẩm ↔ Chi tiết khuyến mãi:** 1-N

### 7.3. Database Optimization
- **Indexes:** Trên các trường thường query (barcode, mã khách hàng, ngày)
- **Connection Pooling:** HikariCP với 20 connections
- **Batch Processing:** Cho các thao tác số lượng lớn

---

## 8. API VÀ ENDPOINTS

### 8.1. Authentication APIs
```
POST   /api/v1/auth/login          # Đăng nhập, lấy JWT token
POST   /api/v1/auth/refresh        # Refresh token
```

### 8.2. POS APIs
```
POST   /api/v1/pos/checkout              # Tạo hóa đơn
GET    /api/v1/pos/products              # Danh sách sản phẩm
GET    /api/v1/pos/invoices/{id}         # Chi tiết hóa đơn
GET    /api/v1/pos/promotions/active     # Khuyến mãi đang hoạt động
```

### 8.3. Admin APIs
```
# Sản phẩm
GET    /api/v1/admin/products            # Danh sách sản phẩm
POST   /api/v1/admin/products            # Tạo sản phẩm
PUT    /api/v1/admin/products/{id}       # Cập nhật sản phẩm

# Khách hàng
GET    /api/v1/admin/customers           # Danh sách khách hàng
POST   /api/v1/admin/customers           # Tạo khách hàng

# Nhân viên
GET    /api/v1/admin/employees           # Danh sách nhân viên (pagination)
POST   /api/v1/admin/employees           # Tạo nhân viên

# Tồn kho
POST   /api/v1/admin/inventory/import    # Nhập hàng
POST   /api/v1/admin/inventory/return    # Trả hàng

# Khuyến mãi
POST   /api/v1/admin/promotions          # Tạo khuyến mãi
PUT    /api/v1/admin/promotions/{id}     # Cập nhật khuyến mãi

# Dashboard & Reports
GET    /api/v1/admin/dashboard           # Dashboard statistics
GET    /api/v1/admin/reports/revenue     # Báo cáo doanh thu
GET    /api/v1/admin/reports/top-products # Top sản phẩm bán chạy
```

### 8.4. Report APIs
```
GET    /api/reports/revenue/excel        # Xuất báo cáo doanh thu (Excel)
GET    /api/reports/inventory/excel      # Xuất báo cáo tồn kho (Excel)
GET    /api/reports/sales/excel          # Xuất báo cáo bán hàng (Excel)
GET    /api/invoices/{id}/pdf            # Xuất hóa đơn PDF
```

### 8.5. API Documentation
- **Swagger UI:** http://localhost:8081/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8081/v3/api-docs

---

## 9. THỐNG KÊ DỰ ÁN

### 9.1. Số Lượng Module
- **10 modules** trong project
- **9 modules** backend (Java)
- **1 module** migrations (SQL)

### 9.2. Số Lượng Entity/DTO
- **~20 Entities** (JPA)
- **~25 DTOs** (Data Transfer Objects)
- **~15 Repositories** (Data Access)
- **~15 Services** (Business Logic)
- **~12 Controllers** (API Endpoints)

### 9.3. Database Migrations
- **15+ migration files** (Flyway)
- Tạo bảng, indexes, constraints
- Seed data (dữ liệu mẫu)

### 9.4. Test Coverage
- **Unit Tests:** JUnit 5
- **Integration Tests:** Testcontainers
- **E2E Tests:** REST Assured

### 9.5. Tính Năng Hoàn Thành
- ✅ **26/29 tính năng** đã hoàn thành (90%)
- ✅ **4/4 tính năng P0** (ưu tiên cao) - 100%
- ✅ **4/4 tính năng P1** (ưu tiên trung bình) - 100%

---

## 10. DEMO SCENARIOS

### Scenario 1: Quy Trình Bán Hàng Tại Quầy (POS)

**Bước 1:** Thu ngân đăng nhập
```
POST /api/v1/auth/login
Body: { "username": "cashier1", "password": "admin123" }
Response: { "token": "JWT_TOKEN...", "role": "CASHIER" }
```

**Bước 2:** Quét barcode sản phẩm
```
GET /api/v1/pos/products/barcode/8934567890123
Response: { "id": 1, "tenSanPham": "Coca Cola", "giaBan": 10000 }
```

**Bước 3:** Thêm vào giỏ hàng và checkout
```
POST /api/v1/pos/checkout
Body: {
  "items": [{ "sanPhamId": 1, "soLuong": 2, "donGia": 10000 }],
  "khachHangId": 1,
  "phuongThucThanhToan": "TIEN_MAT"
}
Response: { "hoaDonId": 100, "tongTien": 20000, "diemTichLuy": 200 }
```

**Bước 4:** Xuất hóa đơn PDF
```
GET /api/invoices/100/pdf
Response: PDF file
```

---

### Scenario 2: Quản Lý Khuyến Mãi

**Bước 1:** Tạo khuyến mãi giảm 10%
```
POST /api/v1/admin/promotions
Body: {
  "maKhuyenMai": "KM_BLACKFRIDAY",
  "tenKhuyenMai": "Giảm 10% Black Friday",
  "loaiKhuyenMai": "PERCENTAGE",
  "giaTriKhuyenMai": 10.00,
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "trangThai": "ACTIVE"
}
```

**Bước 2:** Áp dụng khuyến mãi khi checkout
- Hệ thống tự động tìm khuyến mãi phù hợp
- Áp dụng giảm giá vào tổng tiền

---

### Scenario 3: Xem Dashboard và Báo Cáo

**Bước 1:** Xem dashboard
```
GET /api/v1/admin/dashboard?date=2025-12-07
Response: {
  "todayStats": {
    "doanhThu": 50000000,
    "tongDon": 150,
    "loiNhuan": 5000000,
    "khachHang": 80
  },
  "topProducts": [...],
  "salesOverview": [...]
}
```

**Bước 2:** Xuất báo cáo doanh thu Excel
```
GET /api/reports/revenue/excel?startDate=2025-12-01&endDate=2025-12-31
Response: Excel file download
```

---

## 🎯 KẾT LUẬN

### Điểm Mạnh Của Hệ Thống
1. ✅ **Kiến trúc rõ ràng:** Multi-module, layered architecture
2. ✅ **Tính năng đầy đủ:** POS, Inventory, Promotion, Reports
3. ✅ **Performance tốt:** Redis caching, database optimization
4. ✅ **Bảo mật:** JWT authentication, role-based access control
5. ✅ **Dễ mở rộng:** Module-based design
6. ✅ **Documentation:** Swagger UI, comprehensive docs

### Hướng Phát Triển
- 📱 **Mobile App:** Ứng dụng di động cho thu ngân
- 📊 **Analytics:** Thống kê nâng cao với BI tools
- 🔔 **Notifications:** Thông báo real-time
- 🌐 **Web Portal:** Cổng web cho khách hàng

---

**Cảm ơn cô đã lắng nghe!**

**Câu hỏi?**

---

*Tài liệu này được tạo ngày 2025-12-07*

