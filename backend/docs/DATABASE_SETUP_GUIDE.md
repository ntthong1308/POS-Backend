# Hướng dẫn tạo lại Database

## Thông tin kết nối

- **Database Name:** `retail_db`
- **Server:** `localhost:1433`
- **Username:** `sa`
- **Password:** `123456`

## Cách 1: Sử dụng SQL Server Management Studio (SSMS)

### Bước 1: Kết nối SQL Server
1. Mở **SQL Server Management Studio (SSMS)**
2. Kết nối với:
   - **Server name:** `localhost` hoặc `.` hoặc `(local)`
   - **Authentication:** SQL Server Authentication
   - **Login:** `sa`
   - **Password:** `123456`

### Bước 2: Chạy script tạo database

**Option A: Script đầy đủ** (khuyến nghị)
- Mở file `scripts/create-database.sql` trong SSMS
- Chạy script (F5 hoặc Execute)

**Option B: Script đơn giản** (nếu script chính lỗi)
- Mở file `scripts/create-database-simple.sql` trong SSMS
- Chạy script (F5 hoặc Execute)

### Bước 3: Kiểm tra database đã tạo
```sql
USE master;
GO
SELECT name FROM sys.databases WHERE name = 'retail_db';
GO
```

## Cách 2: Sử dụng SQL Server Command Line (sqlcmd)

### Bước 1: Mở Command Prompt hoặc PowerShell
```powershell
# Chuyển đến thư mục scripts
cd "C:\Users\nguye\Downloads\demo thuc tap tot nghiep\retail-platform\scripts"
```

### Bước 2: Chạy script
```powershell
# Script đơn giản
sqlcmd -S localhost -U sa -P 123456 -i create-database-simple.sql

# Hoặc script đầy đủ
sqlcmd -S localhost -U sa -P 123456 -i create-database.sql
```

## Cách 3: Tạo database bằng cách chạy ứng dụng

Flyway sẽ tự động tạo database nếu cấu hình đúng:

1. **Đảm bảo SQL Server đang chạy**
   ```powershell
   # Kiểm tra service SQL Server
   Get-Service -Name "MSSQLSERVER"
   ```

2. **Cấu hình trong `application.yml` đã đúng:**
   ```yaml
   spring:
     datasource:
       url: jdbc:sqlserver://localhost:1433;databaseName=retail_db;encrypt=true;trustServerCertificate=true
       username: sa
       password: 123456
   ```

3. **Chạy ứng dụng:**
   ```bash
   # Từ IntelliJ: Run RetailPlatformApplication
   # Hoặc từ command line:
   mvn spring-boot:run -pl retail-bootstrap
   ```

   Flyway sẽ tự động:
   - Tạo database nếu chưa có (nếu có quyền)
   - Chạy các migration scripts trong `retail-migrations/src/main/resources/db/migration/`
   - Tạo tất cả các bảng và dữ liệu ban đầu

## Kiểm tra kết nối

### Test bằng JDBC URL:
```bash
# Sử dụng sqlcmd để test kết nối
sqlcmd -S localhost -U sa -P 123456 -Q "SELECT @@VERSION"
```

### Test từ ứng dụng:
Chạy ứng dụng và kiểm tra logs:
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
Flyway migrations started...
```

## Troubleshooting

### Lỗi: "Cannot connect to SQL Server"
**Giải pháp:**
1. Kiểm tra SQL Server Service đang chạy:
   ```powershell
   Get-Service -Name "MSSQLSERVER"
   Start-Service -Name "MSSQLSERVER"  # Nếu chưa chạy
   ```

2. Kiểm tra SQL Server Browser Service:
   ```powershell
   Get-Service -Name "SQLSERVERAGENT"
   ```

3. Kiểm tra port 1433 đang lắng nghe:
   ```powershell
   netstat -an | findstr 1433
   ```

### Lỗi: "Login failed for user 'sa'"
**Giải pháp:**
1. Đảm bảo SQL Server Authentication được bật:
   - Mở SSMS → Right-click server → Properties → Security
   - Chọn "SQL Server and Windows Authentication mode"
   - Restart SQL Server

2. Đặt lại password cho user sa:
   ```sql
   USE master;
   GO
   ALTER LOGIN sa WITH PASSWORD = '123456';
   ALTER LOGIN sa ENABLE;
   GO
   ```

### Lỗi: "Database 'retail_db' does not exist"
**Giải pháp:**
- Chạy script `create-database-simple.sql` để tạo database thủ công

### Lỗi: "Trust Server Certificate"
**Giải pháp:**
- Connection string đã có `trustServerCertificate=true`, nên không cần cấu hình thêm

## Sau khi tạo database thành công

1. **Chạy ứng dụng** - Flyway sẽ tự động tạo các bảng
2. **Kiểm tra logs** để xác nhận migrations đã chạy:
   ```
   Flyway Community Edition ... successfully applied 6 migrations
   ```

3. **Kiểm tra database** trong SSMS:
   ```sql
   USE retail_db;
   GO
   SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;
   GO
   ```

## Liên hệ

Nếu gặp vấn đề, kiểm tra:
- SQL Server logs trong `C:\Program Files\Microsoft SQL Server\MSSQL*\MSSQL\Log\`
- Application logs trong `logs/` folder

