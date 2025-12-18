# 📘 Phần 1: Tổng Quan Hệ Thống

> Tài liệu phân tích hệ thống Retail Platform - Phần 1: Tổng quan kiến trúc, công nghệ và cấu trúc module

---

## 1.1. Công Nghệ Sử Dụng

### Framework & Core
- **Spring Boot:** `3.2.0`
- **Java:** `21` (LTS)
- **Build Tool:** `Maven` (Multi-module project)
- **Packaging:** `JAR`

### Database & ORM
- **Database:** `Microsoft SQL Server` (SQL Server 2019+)
- **ORM:** `Hibernate` (JPA implementation)
- **Connection Pool:** `HikariCP`
  - Max pool size: 20
  - Min idle: 5
  - Connection timeout: 30s
  - Max lifetime: 30 phút
- **Migration Tool:** `Flyway`
  - Location: `classpath:db/migration`
  - Baseline on migrate: true
  - Validate on migrate: false (development mode)

### Caching
- **Cache Provider:** `Redis` (Jedis client)
- **Cache Type:** `Redis Cache Manager`
- **Default TTL:** 30 phút
- **Cache Names:**
  - `products`: 1 giờ
  - `customers`: 15 phút
  - `invoices`: 10 phút
  - `promotions`: 15 phút

### Security
- **Authentication:** `JWT` (JSON Web Token)
- **Password Encoding:** `BCrypt`
- **JWT Library:** `io.jsonwebtoken:jjwt:0.12.5`
- **Session:** Stateless (no session)

### API Documentation
- **OpenAPI/Swagger:** `springdoc-openapi:2.5.0`
- **Swagger UI:** `/swagger-ui.html`
- **API Docs:** `/v3/api-docs`

### Reporting & File Processing
- **Excel:** `Apache POI 5.2.5`
- **PDF:** `iText 7.2.5`
- **File Upload:** Spring Multipart (max 10MB)

### Mapping & Utilities
- **Object Mapping:** `MapStruct 1.5.5.Final`
- **Lombok:** `1.18.30` (code generation)
- **Jackson:** JSON serialization/deserialization

### Logging
- **Logback:** Structured logging với JSON format
- **Logstash Encoder:** `7.4` (JSON logs)
- **MDC:** Correlation ID tracking

### Testing
- **JUnit 5:** Unit & Integration tests
- **Testcontainers:** `1.19.7` (Database testing)
- **Mockito:** `5.10.0` (Mocking)
- **AssertJ:** `3.25.3` (Assertions)

---

## 1.2. Kiến Trúc Hệ Thống

### **Layered Architecture (Multi-Layer Architecture)**

Hệ thống được tổ chức theo kiến trúc **Layered Architecture** với **9 modules** riêng biệt:

```
┌─────────────────────────────────────────────────────────┐
│                    retail-bootstrap                      │
│              (Application Entry Point)                  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│  retail-api  │  │ retail-pos-api│  │retail-admin-api│
│  (Public)    │  │   (POS)       │  │   (Admin)      │
└───────┬──────┘  └───────┬──────┘  └───────┬──────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│retail-security│  │retail-application│ retail-persistence│
│  (JWT/Auth)  │  │  (Business Logic)│   (Repositories)   │
└───────┬──────┘  └───────┬──────┘  └───────┬──────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│ retail-domain│  │ retail-common │  │retail-migrations│
│  (Entities)  │  │  (Shared)    │  │   (Flyway)      │
└──────────────┘  └───────────────┘  └─────────────────┘
```

### **Các Layer:**

#### **1. Presentation Layer (API Layer)**
- **retail-api:** Public APIs (không cần auth)
- **retail-pos-api:** POS APIs (CASHIER, MANAGER, ADMIN)
- **retail-admin-api:** Admin APIs (ADMIN, MANAGER)

**Chức năng:**
- Nhận HTTP requests
- Validate input (Bean Validation)
- Gọi Service layer
- Trả về response (DTO)
- Xử lý exceptions

#### **2. Application Layer (Business Logic)**
- **retail-application:** Business logic, Services, DTOs, Mappers

**Chức năng:**
- Business logic
- Transaction management
- Caching logic
- DTO mapping (Entity ↔ DTO)
- Validation rules

#### **3. Security Layer**
- **retail-security:** JWT authentication, authorization

**Chức năng:**
- JWT token generation/validation
- User authentication
- Role-based access control (RBAC)
- Password encoding

#### **4. Persistence Layer**
- **retail-persistence:** JPA Repositories

**Chức năng:**
- Database queries
- Custom queries (JPQL, Native SQL)
- Data access operations

#### **5. Domain Layer**
- **retail-domain:** JPA Entities

**Chức năng:**
- Domain models
- Entity relationships
- Business rules trong entities

#### **6. Common Layer**
- **retail-common:** Shared utilities, constants, responses

**Chức năng:**
- Common DTOs (ApiResponse)
- Constants (Status, ErrorCode)
- Exception classes

#### **7. Migration Layer**
- **retail-migrations:** Flyway migration scripts

**Chức năng:**
- Database schema versioning
- Data migrations

#### **8. Bootstrap Layer**
- **retail-bootstrap:** Application entry point, configuration

**Chức năng:**
- Spring Boot application
- Configuration files
- Component scanning

---

## 1.3. Các Module Chính và Chức Năng

### **Module 1: retail-domain**
**Mục đích:** Domain entities (JPA entities)

**Các Entity:**
- `SanPham` - Sản phẩm
- `KhachHang` - Khách hàng
- `NhanVien` - Nhân viên
- `ChiNhanh` - Chi nhánh
- `HoaDon` - Hóa đơn
- `ChiTietHoaDon` - Chi tiết hóa đơn
- `NhapHang` - Phiếu nhập hàng
- `ChiTietNhapHang` - Chi tiết nhập hàng
- `PhieuTraHang` - Phiếu trả hàng
- `KhuyenMai` - Khuyến mãi
- `ChiTietKhuyenMai` - Chi tiết khuyến mãi
- `PaymentTransaction` - Giao dịch thanh toán
- `NhaCungCap` - Nhà cung cấp
- `AuditLog` - Nhật ký audit
- `NguyenLieu` - Nguyên liệu
- `PhieuNhapXuatNguyenLieu` - Phiếu nhập/xuất nguyên liệu

**Base Class:**
- `BaseEntity` - Audit fields (createdAt, updatedAt, createdBy, updatedBy)

---

### **Module 2: retail-persistence**
**Mục đích:** Data access layer (Repositories)

**Các Repository:**
- `SanPhamRepository`
- `KhachHangRepository`
- `NhanVienRepository`
- `ChiNhanhRepository`
- `HoaDonRepository`
- `ChiTietHoaDonRepository`
- `NhapHangRepository`
- `ChiTietNhapHangRepository`
- `PhieuTraHangRepository`
- `KhuyenMaiRepository`
- `ChiTietKhuyenMaiRepository`
- `PaymentTransactionRepository`
- `NhaCungCapRepository`
- `AuditLogRepository`
- `NguyenLieuRepository`
- `PhieuNhapXuatNguyenLieuRepository`

**Chức năng:**
- CRUD operations
- Custom queries (JPQL, Native SQL)
- Query optimization (JOIN FETCH, BatchSize)

---

### **Module 3: retail-application**
**Mục đích:** Business logic layer

**Các Service:**
- `ProductService` - Quản lý sản phẩm
- `CustomerService` - Quản lý khách hàng
- `EmployeeService` - Quản lý nhân viên
- `PosService` - POS bán hàng (checkout, validate cart)
- `InventoryService` - Quản lý tồn kho (nhập/xuất)
- `PromotionService` - Quản lý khuyến mãi
- `PaymentService` - Xử lý thanh toán
- `ReportService` - Báo cáo (doanh thu, tồn kho, bán hàng)
- `DashboardService` - Thống kê dashboard
- `NguyenLieuService` - Quản lý nguyên liệu
- `FileStorageService` - Upload/download files
- `AuditLogService` - Ghi log audit

**Các DTO:**
- `ProductDTO`, `CustomerDTO`, `EmployeeDTO`
- `InvoiceDTO`, `InvoiceDetailDTO`
- `CheckoutRequest`, `CartItemDTO`
- `PromotionDTO`, `AppliedPromotionDTO`
- `PaymentRequest`, `PaymentResponse`
- `DashboardStatsDTO`
- `NguyenLieuDTO`, `NhapXuatNguyenLieuRequest`
- `ImportGoodsRequest`, `ReturnRequest`
- `RevenueReportDTO`, `TopProductDTO`

**Các Mapper:**
- `ProductMapper`, `CustomerMapper`, `EmployeeMapper`
- `InvoiceMapper`, `PromotionMapper`
- `NguyenLieuMapper`, `PaymentTransactionMapper`
- `AuditLogMapper`

**Config:**
- `RedisConfig` - Redis caching configuration
- `JacksonConfig` - JSON serialization configuration

**Aspect:**
- `AuditAspect` - Tự động ghi audit log cho methods có `@Audited`

---

### **Module 4: retail-security**
**Mục đích:** Authentication & Authorization

**Components:**
- `SecurityConfig` - Spring Security configuration
- `JwtAuthFilter` - JWT token validation filter
- `JwtUtils` - JWT token generation/validation
- `UserDetailsServiceImpl` - Load user details for authentication

**Chức năng:**
- JWT token generation
- JWT token validation
- Password encoding (BCrypt)
- Role-based access control
- CORS configuration

---

### **Module 5: retail-api**
**Mục đích:** Public REST APIs (không cần authentication)

**Controllers:**
- `AuthController` - Login, logout, get current user
- `ProductController` - Public product APIs
- `CustomerController` - Public customer APIs
- `InvoiceController` - Invoice APIs (PDF generation)
- `ReportController` - Excel report APIs
- `FileUploadController` - File upload APIs
- `FileServeController` - Serve static files
- `AuditLogController` - Audit log APIs

**Exception Handler:**
- `GlobalExceptionHandler` - Xử lý exceptions toàn cục

**Filter:**
- `RequestLoggingFilter` - Log request/response với correlation ID

---

### **Module 6: retail-pos-api**
**Mục đích:** POS (Point of Sale) APIs (CASHIER, MANAGER, ADMIN)

**Controllers:**
- `PosCheckoutController` - Checkout, validate cart
- `PosProductController` - Quét/tìm sản phẩm
- `PosInvoiceController` - Lấy hóa đơn
- `PromotionPosController` - Áp dụng khuyến mãi
- `PaymentController` - Xử lý thanh toán

---

### **Module 7: retail-admin-api**
**Mục đích:** Admin APIs (ADMIN, MANAGER)

**Controllers:**
- `ProductAdminController` - CRUD sản phẩm
- `CustomerAdminController` - CRUD khách hàng
- `EmployeeAdminController` - CRUD nhân viên
- `InventoryAdminController` - Nhập/xuất kho
- `PromotionController` - CRUD khuyến mãi
- `ReportAdminController` - Báo cáo admin
- `DashboardController` - Dashboard statistics
- `NguyenLieuAdminController` - CRUD nguyên liệu

---

### **Module 8: retail-common**
**Mục đích:** Shared utilities và constants

**Components:**
- `ApiResponse<T>` - Standard response format
- `ErrorCode` - Error code constants
- `Status` - Entity status enum (ACTIVE, INACTIVE, etc.)
- `PromotionType` - Loại khuyến mãi enum
- `BusinessException` - Custom business exception
- `ResourceNotFoundException` - Resource not found exception
- `HardwareException` - Hardware error exception

---

### **Module 9: retail-migrations**
**Mục đích:** Database migrations (Flyway)

**Migrations:**
- `V1__create_base_tables.sql` - Tạo bảng cơ bản
- `V2__create_transaction_tables.sql` - Bảng giao dịch
- `V3__insert_initial_data.sql` - Dữ liệu ban đầu
- `V4__add_performance_indexes.sql` - Indexes
- `V5__create_payment_tables.sql` - Bảng thanh toán
- `V6__create_promotion_tables.sql` - Bảng khuyến mãi
- `V7__placeholder.sql` - Placeholder
- `V8__add_hinh_anh_to_san_pham.sql` - Thêm cột hình ảnh
- `V9__increase_hinh_anh_length.sql` - Tăng độ dài hình ảnh
- `V10__create_nguyen_lieu_tables.sql` - Bảng nguyên liệu

---

### **Module 10: retail-bootstrap**
**Mục đích:** Application entry point và configuration

**Components:**
- `RetailPlatformApplication` - Main class
- `application.yml` - Configuration
- `PasswordInitializer` - Auto-reset passwords (dev mode)
- `WebMvcConfig` - Web MVC configuration

---

## 1.4. Dependency Graph

```
retail-bootstrap
    ├── retail-api
    │   ├── retail-application
    │   │   ├── retail-persistence
    │   │   │   ├── retail-domain
    │   │   │   └── retail-common
    │   │   └── retail-common
    │   └── retail-security
    │       └── retail-application
    ├── retail-pos-api
    │   ├── retail-application
    │   └── retail-security
    ├── retail-admin-api
    │   ├── retail-application
    │   └── retail-security
    └── retail-migrations
```

**Quy tắc dependency:**
- **retail-api, retail-pos-api, retail-admin-api** → phụ thuộc vào **retail-application** và **retail-security**
- **retail-application** → phụ thuộc vào **retail-persistence**
- **retail-persistence** → phụ thuộc vào **retail-domain** và **retail-common**
- **retail-security** → phụ thuộc vào **retail-application**
- **retail-domain** → chỉ phụ thuộc vào **retail-common**
- **retail-common** → không phụ thuộc module nào

---

## 1.5. Cấu Hình Chính

### **Database Configuration**
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1434;databaseName=retail_db
    username: sa
    password: 123456
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
```

### **JPA Configuration**
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.SQLServerDialect
        jdbc.batch_size: 20
        default_batch_fetch_size: 20
```

### **Redis Configuration**
```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      client-type: jedis
  cache:
    type: redis
    redis:
      time-to-live: 1800000  # 30 minutes
```

### **JWT Configuration**
```yaml
app:
  jwt:
    secret: U2VjdXJlSldUU2VjcmV0S2V5...
    exp-min: 1440  # 24 hours
```

---

## 1.6. Ports & Endpoints

- **Application Port:** `8081`
- **Database Port:** `1434` (SQL Server)
- **Redis Port:** `6379`
- **Swagger UI:** `http://localhost:8081/swagger-ui.html`
- **API Docs:** `http://localhost:8081/v3/api-docs`
- **Actuator:** `http://localhost:8081/actuator`

---

## 1.7. Build & Run

### **Build:**
```bash
mvn clean install
```

### **Run:**
```bash
mvn spring-boot:run -pl retail-bootstrap
```

### **Test:**
```bash
mvn test
```

---

**📝 Tài liệu tiếp theo:**
- [Phần 2: Sơ Đồ Flow Tổng Quát](./02_SO_DO_FLOW.md)
- [Phần 3: Chi Tiết Từng Module](./03_CHI_TIET_MODULE.md)

