# 🛒 Hệ Thống Quản Lý Bán Hàng POS

<div align="center">

[![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen?style=for-the-badge&logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019+-red?style=for-the-badge&logo=microsoft-sql-server)](https://www.microsoft.com/sql-server)

**Đồ án thực tập tốt nghiệp** - Hệ thống quản lý bán hàng POS hiện đại cho cửa hàng bán lẻ

[📖 Xem tài liệu](#-tài-liệu) • [🚀 Bắt đầu](#-bắt-đầu-nhanh) • [📱 Tính năng](#-tính-năng) • [💻 Công nghệ](#-công-nghệ)

</div>

---

## 📖 Giới thiệu

Hệ thống **Quản Lý Bán Hàng POS** là một giải pháp toàn diện được xây dựng để hỗ trợ quản lý cửa hàng bán lẻ hiện đại. Hệ thống bao gồm:

- 🏪 **Ứng dụng POS** - Giao diện bán hàng tại quầy thân thiện, dễ sử dụng
- 👨‍💼 **Web Admin Dashboard** - Quản lý toàn bộ hoạt động cửa hàng
- 📊 **Báo cáo & Thống kê** - Phân tích doanh thu, xuất báo cáo Excel/PDF
- 🔐 **Bảo mật cao** - JWT Authentication, RBAC phân quyền chi tiết

---

## ✨ Tính năng nổi bật

### 🏪 POS Application
- ✅ Bán hàng nhanh chóng với giao diện tối ưu
- ✅ Quản lý đơn hàng theo bàn
- ✅ Treo bill (Hold Bill) để xử lý sau
- ✅ Tích hợp thanh toán VNPay
- ✅ Tìm kiếm sản phẩm theo tên, mã, barcode
- ✅ Áp dụng khuyến mãi tự động

### 👨‍💼 Admin Dashboard
- ✅ Dashboard tổng quan với biểu đồ real-time
- ✅ Quản lý sản phẩm, danh mục, kho hàng
- ✅ Quản lý nhân viên với phân quyền RBAC
- ✅ Quản lý khách hàng và điểm tích lũy
- ✅ Báo cáo doanh thu chi tiết
- ✅ Xuất báo cáo Excel đa sheet

### 🔐 Bảo mật
- ✅ JWT Authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ Spring Security bảo vệ API
- ✅ Audit logging

---

## 🛠 Công nghệ

### Backend Stack
```
Java 21 + Spring Boot 3.2.0
├── Spring Data JPA (Hibernate)
├── Spring Security (JWT)
├── SQL Server (Database)
├── Redis (Caching)
├── Apache POI (Excel)
├── iText 7 (PDF)
└── Flyway (Migration)
```

### Frontend Stack
```
React 19 + TypeScript 5.9
├── Vite 7 (Build Tool)
├── Tailwind CSS 4 (Styling)
├── Zustand (State Management)
├── React Query (Server State)
├── Radix UI (Components)
└── Recharts (Charts)
```

---

## 📁 Cấu trúc dự án

```
demo-thuc-tap-tot-nghiep/
├── retail-platform/          # Backend (Spring Boot)
│   ├── retail-bootstrap/     # Application entry point
│   ├── retail-api/           # Public APIs
│   ├── retail-pos-api/       # POS APIs
│   ├── retail-admin-api/     # Admin APIs
│   ├── retail-application/   # Business logic
│   ├── retail-persistence/   # Data access
│   ├── retail-security/      # Security config
│   └── retail-migrations/    # Database migrations
│
└── retail-pos-app/           # Frontend (React)
    ├── src/
    │   ├── pages/            # Page components
    │   ├── components/       # Reusable components
    │   ├── lib/              # Utilities & API clients
    │   └── store/            # State management
    └── public/               # Static assets
```

---

## 🚀 Bắt đầu nhanh

### Yêu cầu hệ thống

- **Backend**: JDK 21+, Maven 3.8+, SQL Server 2019+
- **Frontend**: Node.js 18+, npm/yarn
- **Tùy chọn**: Redis 6.0+, Docker

### Cài đặt

#### 1️⃣ Clone repositories

```bash
# Clone cả 2 repositories
git clone <backend-repo-url> retail-platform
git clone <frontend-repo-url> retail-pos-app
```

#### 2️⃣ Setup Database

```bash
# Option 1: Docker (Khuyến nghị)
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" \
   -p 1433:1433 --name sqlserver \
   -d mcr.microsoft.com/mssql/server:2022-latest

# Option 2: SQL Server Local
# Tạo database: CREATE DATABASE retail_db;
```

#### 3️⃣ Cấu hình Backend

```bash
cd retail-platform
# Cập nhật application.yml với thông tin database
mvn clean install -DskipTests
```

#### 4️⃣ Cấu hình Frontend

```bash
cd retail-pos-app
# Tạo file .env
echo "VITE_API_BASE_URL=http://localhost:8081" > .env
npm install
```

#### 5️⃣ Chạy ứng dụng

```bash
# Terminal 1: Backend
cd retail-platform
mvn spring-boot:run -pl retail-bootstrap

# Terminal 2: Frontend
cd retail-pos-app
npm run dev
```

🌐 **Truy cập:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8081
- Swagger UI: http://localhost:8081/swagger-ui.html

---

## 📚 Tài liệu

### 📖 Báo cáo đồ án
- [Chương 1: Cơ sở lý luận](retail-platform/docs/BAO_CAO_CHUONG_1.md)
- [Chương 2: Phân tích và thiết kế](retail-platform/docs/BAO_CAO_CHUONG_2.md)
- [Chương 3: Triển khai và thử nghiệm](retail-platform/docs/BAO_CAO_CHUONG_3.md)
- [Chương 4: Kế hoạch kiểm thử](retail-platform/docs/BAO_CAO_CHUONG_4_KIEM_THU.md)

### 🔧 Hướng dẫn kỹ thuật
- [Backend README](retail-platform/README.md) - Chi tiết về Backend
- [Frontend README](retail-pos-app/README.md) - Chi tiết về Frontend
- [API Documentation](retail-platform/docs/API_DOCUMENTATION.md)
- [Database Setup](retail-platform/docs/DATABASE_SETUP_GUIDE.md)

---

## 📸 Screenshots

> 💡 *Thêm screenshots của ứng dụng tại đây*

---

## 🎯 Mục tiêu đồ án

- ✅ Xây dựng hệ thống POS hoàn chỉnh với đầy đủ tính năng cơ bản
- ✅ Áp dụng kiến thức Spring Boot, React, SQL Server vào thực tế
- ✅ Phát triển kỹ năng phân tích, thiết kế và triển khai hệ thống
- ✅ Tạo ra sản phẩm có thể sử dụng thực tế

---

## 📊 Kết quả đạt được

### Chức năng hoàn thành
- ✅ Hệ thống đăng nhập và phân quyền (JWT, RBAC)
- ✅ Ứng dụng POS bán hàng tại quầy
- ✅ Quản lý sản phẩm, danh mục, kho
- ✅ Quản lý khách hàng, nhân viên
- ✅ Báo cáo doanh thu và xuất Excel
- ✅ Tích hợp thanh toán VNPay
- ✅ Quản lý khuyến mãi

### Kỹ năng học được
- Phát triển Backend với Spring Boot, Spring Security, JPA
- Phát triển Frontend với React, TypeScript, Tailwind CSS
- Thiết kế và quản lý cơ sở dữ liệu SQL Server
- API design và documentation với Swagger
- State management với Zustand và React Query

---

## 🔮 Hướng phát triển

- [ ] Tích hợp nhiều cổng thanh toán (Momo, ZaloPay)
- [ ] Quản lý nhiều chi nhánh
- [ ] Ứng dụng mobile (React Native)
- [ ] Báo cáo Business Intelligence (BI) nâng cao
- [ ] Tích hợp máy in hóa đơn
- [ ] Hệ thống thông báo real-time

---

## 👤 Thông tin sinh viên

**Sinh viên thực hiện:**
- **Họ và tên:** Nguyễn Trung Thông
- **Email:** nguyentrungthong789@gmail.com
- **GitHub:** [@ntthong1308](https://github.com/ntthong1308)

---

## 📄 License

Dự án này được tạo ra cho mục đích học tập và nghiên cứu trong khuôn khổ đồ án thực tập tốt nghiệp.

---

## 🙏 Lời cảm ơn

Cảm ơn giảng viên hướng dẫn và cộng đồng open-source đã tạo ra những công cụ tuyệt vời!

---

<div align="center">

**⭐ Nếu đồ án này hữu ích, hãy cho một star!**

Made with ❤️ by Nguyễn Trung Thông

</div>

