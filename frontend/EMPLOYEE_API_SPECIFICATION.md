# 📋 Employee API Specification - Frontend Requirements

## 🔌 Endpoints

### 1. Tạo Nhân Viên
```
POST /api/v1/admin/employees
```

### 2. Cập Nhật Nhân Viên
```
PUT /api/v1/admin/employees/{id}
```

### 3. Lấy Danh Sách Nhân Viên
```
GET /api/v1/admin/employees?page=0&size=100
```

### 4. Lấy Chi Tiết Nhân Viên
```
GET /api/v1/admin/employees/{id}
```

### 5. Xóa Nhân Viên
```
DELETE /api/v1/admin/employees/{id}
```

---

## 📋 EmployeeDTO - Các Field Chính Xác

### Request Body (Tạo/Cập Nhật)

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
  "trangThai": "ACTIVE",
  "ngayBatDau": "2025-01-01"
}
```

### Response Body

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "maNhanVien": "NV001",
    "tenNhanVien": "Nguyễn Văn A",
    "username": "nva",
    "email": "nva@example.com",
    "soDienThoai": "0912345678",
    "role": "CASHIER",
    "chiNhanhId": 1,
    "tenChiNhanh": "Chi nhánh Trung tâm",
    "trangThai": "ACTIVE",
    "ngayBatDau": "2025-01-01"
  }
}
```

**Lưu ý:** Response không bao gồm field `password` (vì lý do bảo mật).

---

## 📊 Bảng Chi Tiết Các Field

| Field Name | Type | Required | Validation | Mô Tả | Ghi Chú |
|-----------|------|----------|------------|-------|---------|
| `id` | `Long` (Number) | ✅ Auto | - | ID nhân viên | Chỉ có trong Response |
| `maNhanVien` | `String` | ✅ **YES** | Max 20 ký tự, unique | **Mã nhân viên** | ⚠️ KHÔNG phải "employeeCode" |
| `tenNhanVien` | `String` | ✅ **YES** | Max 200 ký tự | **Tên nhân viên** | ⚠️ KHÔNG phải "name" |
| `username` | `String` | ✅ **YES** | 4-50 ký tự, unique | Username để đăng nhập | - |
| `password` | `String` | ✅ **YES** (khi tạo) | Min 6 ký tự | Mật khẩu | Chỉ dùng khi tạo/cập nhật, không có trong Response |
| `email` | `String` | ❌ No | Email format | Email | Optional |
| `soDienThoai` | `String` | ❌ No | Format: `^(\\+84\|0)[0-9]{9}$` | Số điện thoại | ⚠️ KHÔNG phải "phone" |
| `role` | `String` (Enum) | ✅ **YES** | `ADMIN`, `MANAGER`, `CASHIER` | Vai trò | Xem bảng Enum bên dưới |
| `chiNhanhId` | `Long` (Number) | ❌ No | - | ID chi nhánh | ⚠️ KHÔNG phải "branchId" |
| `tenChiNhanh` | `String` | ❌ No | - | Tên chi nhánh | Chỉ có trong Response |
| `trangThai` | `String` (Enum) | ✅ **YES** | `ACTIVE`, `INACTIVE` | Trạng thái | Xem bảng Enum bên dưới |
| `ngayBatDau` | `String` (Date) | ❌ No | Format: `YYYY-MM-DD` | **Ngày bắt đầu làm việc** | Format ISO 8601 |

---

## 🔢 Enum Values

### 1. Role (Vai trò)

| Value | Mô Tả | Hiển Thị Trong FE |
|-------|-------|-------------------|
| `ADMIN` | Quản trị viên | "Quản trị viên" |
| `MANAGER` | Quản lý | "Quản lý" |
| `CASHIER` | Thu ngân | "Thu ngân" |

### 2. TrangThai (Trạng thái)

| Value | Mô Tả | Hiển Thị Trong FE | Màu Badge |
|-------|-------|-------------------|-----------|
| `ACTIVE` | Đang hoạt động | "Đang hoạt động" | Xanh lá (green-100/green-700) |
| `INACTIVE` | Ngừng hoạt động | "Nghỉ việc" | Đỏ (red-100/red-700) |

**Lưu ý:** 
- Frontend chỉ sử dụng 2 trạng thái: `ACTIVE` và `INACTIVE`
- Không còn các trạng thái: `onboarding`, `off-boarding`, `dismissed`

---

## ⚠️ Field Names Quan Trọng - Mapping

| ❌ **SAI** (Gây lỗi) | ✅ **ĐÚNG** | Ghi Chú |
|---------------------|------------|---------|
| `name` | `tenNhanVien` | Tên nhân viên |
| `employeeCode` | `maNhanVien` | Mã nhân viên |
| `phone` | `soDienThoai` | Số điện thoại |
| `branchId` | `chiNhanhId` | ID chi nhánh |
| `status` | `trangThai` | Trạng thái (ACTIVE/INACTIVE) |
| `startDate` | `ngayBatDau` | Ngày bắt đầu làm việc |

---

## 📝 Validation Rules

### 1. Field Bắt Buộc (Required)

- ✅ `maNhanVien` - Mã nhân viên
- ✅ `tenNhanVien` - **Tên nhân viên** (KHÔNG phải "name")
- ✅ `username` - Username
- ✅ `password` - Mật khẩu (khi tạo mới)
- ✅ `role` - Vai trò (ADMIN, MANAGER, CASHIER)
- ✅ `trangThai` - Trạng thái (ACTIVE, INACTIVE)

### 2. Format Validation

| Field | Format | Ví dụ | Regex (nếu có) |
|-------|--------|-------|----------------|
| `username` | 4-50 ký tự | `"nva"` | - |
| `password` | Tối thiểu 6 ký tự | `"password123"` | - |
| `email` | Email format | `"nva@example.com"` | - |
| `soDienThoai` | `^(\\+84\|0)[0-9]{9}$` | `"0912345678"` hoặc `"+84912345678"` | `^(\\+84\|0)[0-9]{9}$` |
| `role` | `ADMIN`, `MANAGER`, `CASHIER` | `"CASHIER"` | - |
| `trangThai` | `ACTIVE`, `INACTIVE` | `"ACTIVE"` | - |
| `ngayBatDau` | `YYYY-MM-DD` (ISO 8601) | `"2025-01-01"` | `^\\d{4}-\\d{2}-\\d{2}$` |

### 3. Uniqueness

- `maNhanVien` - Phải unique (không trùng)
- `username` - Phải unique (không trùng)

---

## 🎯 Frontend Filter Logic

### Tab Filtering

| Tab | Filter Logic | Hiển Thị |
|-----|--------------|----------|
| **"Tất cả"** (`all`) | Không filter | Tất cả nhân viên (ACTIVE và INACTIVE) |
| **"Đang hoạt động"** (`ACTIVE`) | `trangThai === 'ACTIVE'` | Chỉ nhân viên có `trangThai = 'ACTIVE'` |

**Lưu ý:** 
- Frontend KHÔNG còn tab "Đã nghỉ việc" (INACTIVE)
- Tab "Tất cả" hiển thị tất cả nhân viên bất kể trạng thái

---

## 💻 TypeScript Interface (Frontend)

```typescript
interface Employee {
  id: number;                    // ID nhân viên
  maNhanVien: string;            // ✅ REQUIRED - Mã nhân viên
  tenNhanVien: string;           // ✅ REQUIRED - Tên nhân viên (KHÔNG phải "name")
  username: string;              // ✅ REQUIRED - Username (4-50 ký tự)
  password?: string;             // ✅ REQUIRED khi tạo - Password (min 6 ký tự)
  email?: string;                // Optional - Email
  soDienThoai?: string;          // Optional - Số điện thoại
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';  // ✅ REQUIRED - Vai trò
  chiNhanhId?: number;           // Optional - ID chi nhánh
  tenChiNhanh?: string;          // Optional - Tên chi nhánh (chỉ trong Response)
  trangThai: 'ACTIVE' | 'INACTIVE';        // ✅ REQUIRED - Trạng thái
  ngayBatDau?: string;           // Optional - Ngày bắt đầu làm việc (format: "YYYY-MM-DD")
}
```

---

## 📝 Ví Dụ Request Body

### Tạo Nhân Viên Mới

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
  "trangThai": "ACTIVE",
  "ngayBatDau": "2025-01-01"
}
```

### Cập Nhật Nhân Viên (không đổi password)

```json
{
  "maNhanVien": "NV001",
  "tenNhanVien": "Nguyễn Văn B",
  "username": "nva",
  "email": "nvb@example.com",
  "soDienThoai": "0912345678",
  "role": "MANAGER",
  "chiNhanhId": 1,
  "trangThai": "INACTIVE",
  "ngayBatDau": "2025-01-15"
}
```

### Cập Nhật Nhân Viên (có đổi password)

```json
{
  "maNhanVien": "NV001",
  "tenNhanVien": "Nguyễn Văn B",
  "username": "nva",
  "password": "newpassword123",
  "email": "nvb@example.com",
  "soDienThoai": "0912345678",
  "role": "MANAGER",
  "chiNhanhId": 1,
  "trangThai": "ACTIVE",
  "ngayBatDau": "2025-01-15"
}
```

---

## 🔧 Lưu Ý Quan Trọng

### 1. Field Names Phải Chính Xác

- ❌ **KHÔNG** dùng: `name`, `employeeCode`, `phone`, `branchId`, `status`, `startDate`
- ✅ **PHẢI** dùng: `tenNhanVien`, `maNhanVien`, `soDienThoai`, `chiNhanhId`, `trangThai`, `ngayBatDau`

### 2. Enum Values

- **Role:** Chỉ có 3 giá trị: `ADMIN`, `MANAGER`, `CASHIER`
- **TrangThai:** Chỉ có 2 giá trị: `ACTIVE`, `INACTIVE`

### 3. Date Format

- `ngayBatDau` phải có format: `YYYY-MM-DD` (ví dụ: `"2025-01-01"`)
- Không dùng format khác như `DD/MM/YYYY` hoặc timestamp

### 4. Response Format

- Response phải wrap trong `ApiResponse<T>`:
  ```json
  {
    "success": true,
    "message": null,
    "data": { ... }
  }
  ```

### 5. Pagination (GET /admin/employees)

- Response phải là `PaginatedResponse<Employee>`:
  ```json
  {
    "content": [...],
    "totalElements": 100,
    "totalPages": 5,
    "size": 20,
    "number": 0
  }
  ```

---

## 📋 Tóm Tắt Nhanh

### Các Field Cần Gửi:

1. ✅ `maNhanVien` (String, required, max 20, unique)
2. ✅ `tenNhanVien` (String, required, max 200) - **KHÔNG phải "name"**
3. ✅ `username` (String, required, 4-50 ký tự, unique)
4. ✅ `password` (String, required khi tạo, min 6 ký tự)
5. ✅ `role` (String, required: `ADMIN`, `MANAGER`, `CASHIER`)
6. ✅ `trangThai` (String, required: `ACTIVE`, `INACTIVE`)
7. ❌ `email` (String, optional)
8. ❌ `soDienThoai` (String, optional)
9. ❌ `chiNhanhId` (Number, optional)
10. ❌ `ngayBatDau` (String, optional, format: `YYYY-MM-DD`)

### Enum Values:

- **Role:** `"ADMIN"`, `"MANAGER"`, `"CASHIER"`
- **TrangThai:** `"ACTIVE"`, `"INACTIVE"`

---

**Ngày tạo:** 2025-12-07  
**Version:** 1.0  
**Trạng thái:** ✅ Sẵn sàng cho Backend

