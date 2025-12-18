# 🚀 Hướng dẫn nhanh - Sau khi chạy enable-sql-auth.bat

## ✅ Bước 1: Test kết nối SQL Server

**Chạy file:**
```
scripts/test-connection.bat
```
(Right-click → Run as administrator)

**Kết quả mong đợi:** "Ket noi thanh cong!"

---

## ✅ Bước 2: Tạo database retail_db

**Chạy file:**
```
scripts/create-db-now.bat
```
(Right-click → Run as administrator)

**Hoặc kết nối SSMS:**
1. Mở **SQL Server Management Studio**
2. Connect với:
   - Server: `localhost`
   - Authentication: **SQL Server Authentication**
   - Username: `sa`
   - Password: `123456`
3. Mở file `scripts/create-database-simple.sql` và chạy (F5)

---

## ✅ Bước 3: Chạy ứng dụng Spring Boot

1. Mở **IntelliJ IDEA**
2. Mở project `retail-platform`
3. Chạy class: `RetailPlatformApplication`

**Flyway sẽ tự động:**
- Tạo tất cả các bảng
- Chạy migration scripts
- Insert dữ liệu ban đầu

---

## ✅ Bước 4: Kiểm tra

**Mở browser:**
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

---

## 🔧 Nếu gặp lỗi

### Lỗi kết nối SQL Server:
→ Xem: `docs/FIX_SA_LOGIN_ERROR.md`

### Lỗi database không tồn tại:
→ Chạy lại: `scripts/create-db-now.bat`

### Lỗi ứng dụng không chạy:
→ Kiểm tra logs trong IntelliJ console

---

## 📝 Checklist

- [ ] Test kết nối SQL Server (test-connection.bat)
- [ ] Tạo database retail_db (create-db-now.bat)
- [ ] Chạy ứng dụng Spring Boot
- [ ] Kiểm tra Swagger UI hoạt động

---

**Chi tiết đầy đủ:** Xem file `docs/SAU_KHI_CHAY_BAT.md`

