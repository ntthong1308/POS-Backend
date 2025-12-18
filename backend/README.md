# ⚙️ Retail Platform Backend

<div align="center">

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019+-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/sql-server)
[![Maven](https://img.shields.io/badge/Maven-3.8+-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)](https://maven.apache.org/)

**Backend API** cho hệ thống quản lý bán hàng POS

[🚀 Bắt đầu](#-bắt-đầu) • [📖 Tài liệu](#-tài-liệu) • [🏗️ Kiến trúc](#-kiến-trúc) • [🔧 Cấu hình](#-cấu-hình)

</div>

---

## 📖 Giới thiệu

**Retail Platform Backend** là RESTful API được xây dựng với **Spring Boot 3.2.0** và **Java 21**, cung cấp:

- 🔐 **Authentication & Authorization** - JWT, RBAC
- 🏪 **POS APIs** - Bán hàng, thanh toán, treo bill
- 👨‍💼 **Admin APIs** - Quản lý sản phẩm, kho, nhân viên
- 📊 **Report APIs** - Báo cáo doanh thu, xuất Excel/PDF
- 🔒 **Security** - Spring Security, JWT, Role-based access

---

## ✨ Tính năng

### 🔐 Authentication & Security
- **JWT Authentication** - Token-based authentication
- **RBAC** - Role-Based Access Control (CASHIER, MANAGER, ADMIN)
- **Spring Security** - Bảo vệ API endpoints
- **Password Encryption** - BCrypt password hashing
- **Audit Logging** - Ghi log các thao tác quan trọng

### 🏪 POS APIs
- **Checkout** - Thanh toán, tạo hóa đơn
- **Hold Bill** - Treo bill (lưu hóa đơn tạm thời)
- **Invoice Management** - Quản lý hóa đơn
- **Product Search** - Tìm kiếm sản phẩm cho POS
- **Payment Integration** - Tích hợp VNPay

### 👨‍💼 Admin APIs
- **Product Management** - CRUD sản phẩm, danh mục
- **Inventory Management** - Nhập hàng, điều chỉnh tồn kho
- **Customer Management** - Quản lý khách hàng
- **Employee Management** - Quản lý nhân viên, phân quyền
- **Promotion Management** - Quản lý khuyến mãi
- **Dashboard** - Thống kê, báo cáo real-time

### 📊 Report & Export
- **Revenue Reports** - Báo cáo doanh thu theo nhiều tiêu chí
- **Excel Export** - Xuất báo cáo đa sheet (Apache POI)
- **PDF Export** - In hóa đơn PDF (iText 7)
- **Statistics** - Thống kê sản phẩm bán chạy, doanh thu

---

## 🛠 Công nghệ

### Core
- **Java 21** - Ngôn ngữ lập trình
- **Spring Boot 3.2.0** - Framework chính
- **Spring Data JPA** - ORM và truy cập database
- **Spring Security** - Bảo mật và xác thực
- **Hibernate** - JPA implementation

### Database & Caching
- **SQL Server** - Hệ quản trị cơ sở dữ liệu
- **Redis** - Caching layer
- **Flyway** - Database migration

### Libraries
- **Apache POI** - Xử lý Excel
- **iText 7** - Xử lý PDF
- **JWT (jjwt)** - JSON Web Token
- **MapStruct** - Object mapping
- **Lombok** - Giảm boilerplate code

### Build & Tools
- **Maven** - Build tool
- **Swagger/OpenAPI** - API documentation
- **Logback + Logstash Encoder** - Structured logging

---

## 📁 Cấu trúc dự án

```
retail-platform/
├── retail-bootstrap/          # 🚀 Application entry point
│   └── src/main/java/...      # RetailPlatformApplication
│
├── retail-domain/             # 📦 Domain entities (JPA entities)
│   └── src/main/java/...      # HoaDon, SanPham, KhachHang, ...
│
├── retail-persistence/        # 💾 Data access layer
│   └── src/main/java/...      # Repositories (JPA)
│
├── retail-common/             # 🔧 Common utilities
│   └── src/main/java/...      # Enums, exceptions, DTOs
│
├── retail-security/           # 🔐 Security configuration
│   └── src/main/java/...      # JWT, SecurityConfig, filters
│
├── retail-application/        # 💼 Business logic layer
│   └── src/main/java/...      # Services, Mappers
│
├── retail-api/                # 🌐 Public API controllers
│   └── src/main/java/...      # Auth, Reports, File upload
│
├── retail-pos-api/            # 🏪 POS-specific APIs
│   └── src/main/java/...      # Checkout, Hold bill, Payment
│
├── retail-admin-api/          # 👨‍💼 Admin-specific APIs
│   └── src/main/java/...      # Products, Inventory, Dashboard
│
└── retail-migrations/          # 🗄️ Database migrations
    └── src/main/resources/...  # Flyway SQL scripts
```

---

## 🏗️ Kiến trúc

### Multi-Module Architecture

```
┌─────────────────────────────────────────┐
│         retail-bootstrap                │
│    (Application Entry Point)            │
└─────────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐        ┌─────▼─────┐
│  API  │        │Application │
│ Layer │        │   Layer   │
└───┬────┘        └─────┬─────┘
    │                   │
    │            ┌──────▼──────┐
    │            │ Persistence │
    │            │    Layer   │
    │            └──────┬──────┘
    │                   │
    └───────────┬───────┘
                │
        ┌───────▼───────┐
        │   Database    │
        │  (SQL Server) │
        └───────────────┘
```

### API Modules

- **`retail-api`** - Public APIs (Auth, Reports, File upload)
- **`retail-pos-api`** - POS APIs (Checkout, Hold bill, Payment)
- **`retail-admin-api`** - Admin APIs (Products, Inventory, Dashboard)

---

## 🚀 Bắt đầu

### Yêu cầu

- **JDK 21+**
- **Maven 3.8+**
- **SQL Server 2019+**
- **Redis 6.0+** (tùy chọn, cho caching)

### Cài đặt

#### 1. Clone repository

```bash
git clone <repository-url> retail-platform
cd retail-platform
```

#### 2. Setup Database

```bash
# Option 1: Docker (Khuyến nghị)
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" \
   -p 1433:1433 --name sqlserver \
   -d mcr.microsoft.com/mssql/server:2022-latest

# Option 2: SQL Server Local
# Tạo database: CREATE DATABASE retail_db;
```

#### 3. Cấu hình

Mở file `retail-bootstrap/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=retail_db
    username: sa
    password: YourPassword
```

#### 4. Build project

```bash
mvn clean install -DskipTests
```

#### 5. Chạy ứng dụng

```bash
mvn spring-boot:run -pl retail-bootstrap
```

Hoặc chạy từ IDE:
- Mở `RetailPlatformApplication.java`
- Run as Spring Boot Application

🌐 **Backend sẽ chạy tại:** http://localhost:8081

---

## 🔧 Cấu hình

### Database Configuration

File: `retail-bootstrap/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=retail_db
    username: sa
    password: your_password
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
```

### JWT Configuration

```yaml
app:
  jwt:
    secret: your-jwt-secret-key-base64-encoded
    exp-min: 1440  # 24 hours
```

### Redis Configuration (Optional)

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
```

### VNPay Configuration (Optional)

```yaml
app:
  vnpay:
    tmn-code: your-terminal-code
    hash-secret: your-hash-secret
    url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

---

## 📚 API Documentation

### Swagger UI

Sau khi chạy backend, truy cập Swagger UI tại:
- **http://localhost:8081/swagger-ui.html**

### API Endpoints

#### Authentication
```
POST   /api/v1/auth/login      # Đăng nhập
GET    /api/v1/auth/me        # Lấy thông tin user
```

#### POS APIs
```
POST   /api/v1/pos/checkout           # Thanh toán
POST   /api/v1/pos/hold-bill         # Treo bill
GET    /api/v1/pos/invoices          # Danh sách hóa đơn
GET    /api/v1/pos/products/search   # Tìm kiếm sản phẩm
```

#### Admin APIs
```
GET    /api/v1/admin/products        # Danh sách sản phẩm
POST   /api/v1/admin/products        # Tạo sản phẩm
PUT    /api/v1/admin/products/{id}   # Cập nhật sản phẩm
GET    /api/v1/admin/dashboard/revenue  # Báo cáo doanh thu
```

#### Reports
```
GET    /api/reports/revenue/excel?startDate=...&endDate=...  # Xuất Excel
```

Xem chi tiết tại [API Documentation](docs/API_DOCUMENTATION.md)

---

## 🧪 Testing

### Run Tests

```bash
# Chạy tất cả tests
mvn test

# Chạy tests với coverage
mvn clean test jacoco:report
```

### Manual Testing

1. **Swagger UI**: Test API endpoints trực tiếp
2. **Postman**: Import collection từ Swagger
3. **Browser DevTools**: Kiểm tra network requests

---

## 🚢 Deployment

### JAR File

```bash
mvn clean package -DskipTests
java -jar retail-bootstrap/target/retail-bootstrap-1.0.0-SNAPSHOT.jar
```

### Docker

```bash
docker build -t retail-platform:latest .
docker run -p 8081:8081 retail-platform:latest
```

### Docker Compose

```bash
docker-compose up -d
```

Xem chi tiết tại [Deployment Guide](docs/CI_CD_GUIDE.md)

---

## 🗄️ Database

### Các bảng chính

- **NhanVien** - Nhân viên
- **KhachHang** - Khách hàng
- **SanPham** - Sản phẩm
- **DanhMuc** - Danh mục sản phẩm
- **HoaDon** - Hóa đơn
- **ChiTietHoaDon** - Chi tiết hóa đơn
- **Kho** - Quản lý tồn kho
- **PhieuNhap** - Phiếu nhập hàng
- **KhuyenMai** - Khuyến mãi
- **ThanhToan** - Thanh toán

Xem ERD và chi tiết tại [Database Setup Guide](docs/DATABASE_SETUP_GUIDE.md)

---

## 🐛 Troubleshooting

### Port already in use

```yaml
# Thay đổi port trong application.yml
server:
  port: 8082
```

### Database connection errors

- Kiểm tra SQL Server đang chạy
- Kiểm tra username/password trong `application.yml`
- Kiểm tra firewall settings

### JWT errors

- Kiểm tra JWT secret key trong `application.yml`
- Đảm bảo secret key đủ dài và base64 encoded

---

## 📚 Tài liệu

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Security](https://spring.io/projects/spring-security)
- [SQL Server Documentation](https://docs.microsoft.com/sql-server)

---

## 📄 License

Dự án này được tạo ra cho mục đích học tập và nghiên cứu trong khuôn khổ đồ án thực tập tốt nghiệp.

---

<div align="center">

**⭐ Nếu dự án này hữu ích, hãy cho một star!**

Made with ❤️ by Nguyễn Trung Thông

</div>
