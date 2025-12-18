# 🔧 Hướng dẫn Fix Password

## Vấn đề
Hash BCrypt trong database có thể không khớp với hash được tạo bởi `BCryptPasswordEncoder` của Spring Security, dẫn đến lỗi đăng nhập.

## ✅ Giải pháp đã được triển khai

### Cách 1: Tự động (Khuyến nghị - Đã được cấu hình)
**Component `PasswordInitializer` sẽ tự động kiểm tra và fix password khi application start** (chỉ trong dev mode).

- ✅ **Không cần làm gì thêm!**
- Component sẽ **chỉ reset password nếu password hiện tại không đúng** (chỉ chạy 1 lần thực sự)
- Sau lần đầu tiên, password đã đúng nên sẽ tự động skip (không reset lại)
- Reset password cho các user: `admin`, `manager1`, `cashier1`
- Password mặc định: `admin123`
- Chỉ chạy trong profile `default` (development)

### Cách 2: Dùng Endpoint (Nếu cần reset thủ công)
1. Start backend application
2. Gọi endpoint để reset password:
   ```bash
   POST http://localhost:8081/api/v1/auth/reset-password?username=admin&newPassword=admin123
   POST http://localhost:8081/api/v1/auth/reset-password?username=manager1&newPassword=admin123
   POST http://localhost:8081/api/v1/auth/reset-password?username=cashier1&newPassword=admin123
   ```

### Cách 3: Dùng SQL Script (Nếu cần fix trực tiếp trong database)
1. Start backend application
2. Gọi endpoint để lấy hash:
   ```bash
   GET http://localhost:8081/api/v1/auth/generate-hash?password=admin123
   ```
3. Copy hash từ response
4. Mở file `scripts/fix-passwords.sql`
5. Thay `HASH_VALUE` bằng hash vừa lấy
6. Chạy script trong SQL Server Management Studio

Hoặc dùng script tự động:
```sql
-- Chạy script này trong SQL Server
-- File: scripts/fix-passwords-auto.sql
```

## 📝 Thông tin đăng nhập mặc định

| Username | Password | Role    |
|----------|----------|---------|
| admin    | admin123 | ADMIN   |
| manager1 | admin123 | MANAGER |
| cashier1 | admin123 | CASHIER |

## ⚠️ Lưu ý

1. **Component `PasswordInitializer`**:
   - Chỉ chạy trong profile `default` (development)
   - **Chỉ reset password nếu password hiện tại không đúng** (chỉ chạy 1 lần thực sự)
   - Sau lần đầu tiên, password đã đúng nên sẽ tự động skip (không reset lại mỗi lần start)
   - **Nên disable trong production** bằng cách:
     - Xóa component này, hoặc
     - Set profile khác (ví dụ: `prod`)

2. **Endpoints utility** (`/generate-hash`, `/reset-password`):
   - Chỉ dùng cho development
   - **Nên xóa hoặc bảo vệ trong production**

3. **SQL Scripts**:
   - Chỉ dùng khi cần fix trực tiếp trong database
   - Không cần thiết nếu dùng component tự động

## 🚀 Quick Start

1. **Start backend lần đầu** - Component sẽ tự động fix password (nếu chưa đúng)
2. **Các lần start sau** - Component sẽ kiểm tra và skip (vì password đã đúng rồi)
3. **Test login** với username/password mặc định
4. **Done!** ✅

**Lưu ý:** Component chỉ fix password **1 lần duy nhất** (lần đầu tiên). Các lần start sau sẽ tự động skip vì password đã đúng rồi.


