# 📘 Phần 6: Chuẩn Cho Frontend

> Tài liệu hướng dẫn Frontend developers tích hợp với Backend API

---

## 6.1. Base URL & Headers

### **Base URL:**
```
http://localhost:8081
```

### **Required Headers:**
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"  // Required for protected endpoints
}
```

### **CORS:**
- Allowed Origins:
  - `http://localhost:3000` (React)
  - `http://localhost:4200` (Angular)
  - `http://localhost:5173` (Vite)

---

## 6.2. Response Format

### **Success Response:**
```json
{
  "data": { ... },
  "paging": {  // Only for paginated responses
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  },
  "meta": {
    "timestamp": "2025-12-06T10:30:00"
  }
}
```

### **Error Response:**
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
    "timestamp": "2025-12-06T10:30:00"
  }
}
```

### **Error Codes:**
- `VALIDATION_ERROR` - Invalid input (400)
- `NOT_FOUND` - Resource not found (404)
- `UNAUTHORIZED` - Invalid credentials (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `INSUFFICIENT_STOCK` - Not enough stock (400)
- `INACTIVE_PRODUCT` - Product inactive (400)
- `DUPLICATE_BARCODE` - Duplicate barcode (400)
- `INTERNAL_ERROR` - System error (500)

---

## 6.3. Authentication

### **6.3.1. Login**

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "type": "Bearer",
    "id": 1,
    "username": "admin",
    "tenNhanVien": "Nguyễn Văn A",
    "email": "admin@example.com",
    "role": "ADMIN",
    "chiNhanhId": 1,
    "tenChiNhanh": "Chi nhánh 1"
  }
}
```

**FE Actions:**
1. Save `token` to localStorage/sessionStorage
2. Save `id` as `nhanVienId` (for checkout)
3. Save `chiNhanhId` (for checkout and other APIs)
4. Save `role` (for permission checks)
5. Add token to all subsequent requests: `Authorization: Bearer {token}`

**Error Handling:**
- `401 UNAUTHORIZED` → Show "Username hoặc password không chính xác"

---

### **6.3.2. Get Current User**

**Endpoint:** `GET /api/v1/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** Same as login response

**FE Actions:**
- Use to refresh user info
- Check if token is still valid

---

### **6.3.3. Logout**

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**FE Actions:**
1. Call API
2. Remove token from storage
3. Clear user state
4. Redirect to login

---

## 6.4. POS - Checkout

### **6.4.1. Validate Cart**

**Endpoint:** `POST /api/v1/pos/checkout/validate`

**Request:**
```json
{
  "nhanVienId": 1,          // From login response
  "chiNhanhId": 1,          // From login response
  "phuongThucThanhToan": "TIEN_MAT",  // User selection
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "donGia": 25000,      // From product scan (giaBan)
      "ghiChu": ""
    }
  ]
}
```

**Response:**
```json
{
  "data": "Giỏ hàng hợp lệ"
}
```

**FE Actions:**
1. Call before checkout to validate
2. Show errors if validation fails
3. Proceed to checkout if valid

**Required Fields:**
- `nhanVienId` - From login response (`id`)
- `chiNhanhId` - From login response (`chiNhanhId`)
- `phuongThucThanhToan` - User selection (`TIEN_MAT`, `CHUYEN_KHOAN`, etc.)
- `items[].sanPhamId` - Product ID
- `items[].soLuong` - Quantity (> 0)
- `items[].donGia` - Price from product scan (`giaBan`)

**Error Handling:**
- `VALIDATION_ERROR` → Show field errors
- `INSUFFICIENT_STOCK` → Show "Sản phẩm không đủ tồn kho"
- `INACTIVE_PRODUCT` → Show "Sản phẩm đã ngừng hoạt động"

---

### **6.4.2. Checkout**

**Endpoint:** `POST /api/v1/pos/checkout`

**Request:**
```json
{
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "khachHangId": 1,         // Optional (null for walk-in customers)
  "phuongThucThanhToan": "TIEN_MAT",
  "giamGia": 0,             // Manual discount (optional)
  "diemSuDung": 0,          // Points used (optional)
  "ghiChu": "",
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "donGia": 25000,
      "ghiChu": ""
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "maHoaDon": "HD-20251206103000",
    "ngayTao": "2025-12-06T10:30:00",
    "tongTien": 50000,
    "giamGia": 5000,        // Manual + promotion discount
    "thanhTien": 45000,
    "diemTichLuy": 450,     // New points earned (1% of thanhTien)
    "chiTietHoaDons": [
      {
        "id": 1,
        "sanPham": {
          "id": 1,
          "tenSanPham": "Cà phê đen",
          ...
        },
        "soLuong": 2,
        "donGia": 25000,
        "thanhTien": 50000
      }
    ]
  }
}
```

**FE Actions:**
1. Show success message
2. Display invoice details
3. Optionally print receipt
4. Clear cart
5. Refresh product stock (if needed)

**Business Rules:**
- Promotion is **automatically applied** (no need to call separate API)
- Points are **automatically calculated** (1% of `thanhTien`)
- Customer points are **automatically updated** (if `khachHangId` provided)
- Stock is **automatically deducted**

---

### **6.4.3. Scan Product**

**Endpoint:** `GET /api/v1/pos/products/barcode/{barcode}`

**Response:**
```json
{
  "data": {
    "id": 1,
    "maSanPham": "SP001",
    "barcode": "1234567890123",
    "tenSanPham": "Cà phê đen",
    "giaBan": 25000,
    "tonKho": 100,
    "hinhAnh": "/uploads/products/abc123.jpg",
    "trangThai": "ACTIVE"
  }
}
```

**FE Actions:**
1. Use `giaBan` as `donGia` in cart
2. Check `tonKho` before adding to cart
3. Check `trangThai` = "ACTIVE"
4. Display product info
5. Add to cart with `soLuong = 1` (default)

**Error Handling:**
- `404 NOT FOUND` → Show "Không tìm thấy sản phẩm"
- `INACTIVE_PRODUCT` → Show "Sản phẩm đã ngừng hoạt động"

---

## 6.5. Product Management

### **6.5.1. Create Product**

**Endpoint:** `POST /api/v1/admin/products`

**Request:**
```json
{
  "maSanPham": "SP001",
  "barcode": "1234567890123",  // Optional, but must be unique if provided
  "tenSanPham": "Cà phê đen",
  "moTa": "Cà phê đen pha phin",
  "donViTinh": "Ly",
  "giaBan": 25000,
  "giaNhap": 15000,
  "tonKho": 100,
  "tonKhoToiThieu": 20,
  "hinhAnh": "/uploads/products/abc123.jpg",  // URL from file upload
  "chiNhanhId": 1,
  "nhaCungCapId": 1
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "maSanPham": "SP001",
    ...
  }
}
```

**FE Actions:**
1. Upload image first (if provided)
2. Use returned URL in `hinhAnh` field
3. Validate required fields before submit
4. Show success message
5. Redirect to product list

**Required Fields:**
- `maSanPham` - Unique
- `tenSanPham`
- `giaBan` - > 0
- `tonKho` - >= 0

**Error Handling:**
- `DUPLICATE_BARCODE` → Show "Barcode đã tồn tại"
- `DUPLICATE_CODE` → Show "Mã sản phẩm đã tồn tại"

---

### **6.5.2. Get Products (Paginated)**

**Endpoint:** `GET /api/v1/admin/products?page=0&size=20`

**Query Parameters:**
- `page` (default: 0) - Page number (0-indexed)
- `size` (default: 20) - Items per page

**Response:**
```json
{
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  },
  "paging": {
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

**FE Actions:**
1. Use `paging` for pagination UI
2. Display `content` array
3. Handle empty results

---

### **6.5.3. Search Products**

**Endpoint:** `GET /api/v1/admin/products/search?keyword=cà phê&page=0&size=20`

**Query Parameters:**
- `keyword` (required) - Search term
- `page` (default: 0)
- `size` (default: 20)

**Response:** Same as Get Products

**FE Actions:**
1. Debounce search input (300-500ms)
2. Show loading state
3. Display results

---

## 6.6. File Upload

### **6.6.1. Upload Product Image**

**Endpoint:** `POST /api/v1/files/products/upload`

**Request:** `multipart/form-data`
```
file: [File object]
```

**Response:**
```json
{
  "data": {
    "fileName": "abc123.jpg",
    "fileUrl": "/uploads/products/abc123.jpg",
    "fileSize": 102400,
    "contentType": "image/jpeg"
  }
}
```

**FE Actions:**
1. Validate file type (jpg, png, gif)
2. Validate file size (max 10MB)
3. Show upload progress
4. Use `fileUrl` in product form

**Example (React):**
```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/v1/files/products/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

### **6.6.2. Serve Image**

**Endpoint:** `GET /uploads/products/{fileName}`

**FE Actions:**
1. Use full URL: `http://localhost:8081/uploads/products/abc123.jpg`
2. Or use relative path: `/uploads/products/abc123.jpg`
3. Handle 404 (image not found)

---

## 6.7. Customer Management

### **6.7.1. Create Customer**

**Endpoint:** `POST /api/v1/admin/customers`

**Request:**
```json
{
  "maKhachHang": "KH001",
  "tenKhachHang": "Nguyễn Văn B",
  "soDienThoai": "0123456789",
  "email": "customer@example.com",
  "diaChi": "123 Đường ABC"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "maKhachHang": "KH001",
    "diemTichLuy": 0,
    ...
  }
}
```

**FE Actions:**
1. Auto-generate `maKhachHang` (optional)
2. Validate phone/email format
3. Show success message

---

### **6.7.2. Search Customer (for POS)**

**Endpoint:** `GET /api/v1/admin/customers/search?keyword=0123456789`

**FE Actions:**
1. Search by phone number (most common)
2. Search by name
3. Display results in dropdown
4. Select customer for checkout

---

## 6.8. Inventory Management

### **6.8.1. Import Goods**

**Endpoint:** `POST /api/v1/admin/inventory/import`

**Request:**
```json
{
  "nhaCungCapId": 1,
  "chiNhanhId": 1,
  "nhanVienId": 1,
  "ghiChu": "Nhập hàng tháng 12",
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 100,
      "donGia": 15000,
      "ghiChu": ""
    }
  ]
}
```

**FE Actions:**
1. Load supplier list
2. Load product list
3. Add items to import list
4. Calculate total amount
5. Submit and show success

**Business Rules:**
- Stock is **automatically increased**
- Import price is **automatically updated** in product

---

## 6.9. Dashboard

### **6.9.1. Get Dashboard Stats**

**Endpoint:** `GET /api/v1/admin/dashboard?date=2025-12-06`

**Query Parameters:**
- `date` (optional) - Date in `YYYY-MM-DD` format (default: today)

**Response:**
```json
{
  "data": {
    "todayStats": {
      "doanhThu": 1000000,
      "doanhThuChange": 10.5,  // % change from yesterday
      "tongDon": 50,
      "tongDonChange": 5.2,
      "loiNhuan": 500000,
      "loiNhuanChange": 8.3,
      "khachHang": 30,
      "khachHangChange": 2.1
    },
    "orderStatsByDate": [
      {
        "date": "2 Jan",
        "donHang": 10,
        "doanhSo": 200000
      }
    ],
    "salesOverview": [
      {
        "date": "SAT",
        "doanhSo": 500000,
        "loiNhuan": 250000
      }
    ],
    "topProducts": [
      {
        "id": 1,
        "tenSanPham": "Cà phê đen",
        "soLuongBan": 100,
        "doanhSo": 2500000
      }
    ]
  }
}
```

**FE Actions:**
1. Display today's stats with change indicators
2. Show charts for order stats and sales overview
3. Display top products list
4. Handle date selection

---

## 6.10. Common Patterns

### **6.10.1. Pagination**

**Pattern:**
```javascript
// Request
GET /api/v1/admin/products?page=0&size=20

// Response
{
  "data": { ... },
  "paging": {
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}

// FE Usage
const totalPages = response.paging.totalPages;
const currentPage = response.paging.page;
const hasNext = currentPage < totalPages - 1;
const hasPrev = currentPage > 0;
```

---

### **6.10.2. Error Handling**

**Pattern:**
```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (data.errors) {
    // Handle errors
    data.errors.forEach(error => {
      if (error.field) {
        // Field-specific error
        setFieldError(error.field, error.message);
      } else {
        // General error
        showError(error.message);
      }
    });
  } else {
    // Success
    handleSuccess(data.data);
  }
} catch (error) {
  // Network error
  showError("Không thể kết nối đến server");
}
```

---

### **6.10.3. Token Refresh**

**Pattern:**
```javascript
// Interceptor for axios/fetch
const apiCall = async (url, options) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired
    localStorage.removeItem('token');
    redirectToLogin();
    return;
  }
  
  return response;
};
```

---

## 6.11. Important Notes

### **6.11.1. Required Fields for Checkout**

**Must provide:**
- `nhanVienId` - From login response (`id`)
- `chiNhanhId` - From login response (`chiNhanhId`)
- `phuongThucThanhToan` - User selection
- `items[].sanPhamId` - Product ID
- `items[].soLuong` - Quantity
- `items[].donGia` - From product scan (`giaBan`)

**Optional:**
- `khachHangId` - For registered customers
- `giamGia` - Manual discount
- `diemSuDung` - Points used
- `ghiChu` - Notes

---

### **6.11.2. Date Format**

**All dates:**
- Format: `YYYY-MM-DD` (ISO date)
- Example: `2025-12-06`

**Date-time:**
- Format: `YYYY-MM-DDTHH:mm:ss` (ISO datetime)
- Example: `2025-12-06T10:30:00`

---

### **6.11.3. Number Format**

**All amounts:**
- Use `BigDecimal` in backend
- Send as number in JSON
- Example: `25000.00` or `25000`

**Display:**
- Format with thousand separators
- Example: `25,000 VNĐ`

---

### **6.11.4. Status Values**

**Common statuses:**
- `ACTIVE` - Active
- `INACTIVE` - Inactive
- `COMPLETED` - Completed (for invoices, imports)

---

### **6.11.5. Payment Methods**

**Common values:**
- `TIEN_MAT` - Cash
- `CHUYEN_KHOAN` - Bank transfer
- `THE` - Card

---

## 6.12. Best Practices

### **6.12.1. API Calls**

1. **Always include token** for protected endpoints
2. **Handle errors gracefully** - Show user-friendly messages
3. **Show loading states** - Better UX
4. **Debounce search** - Reduce API calls
5. **Cache responses** - When appropriate

---

### **6.12.2. Data Validation**

1. **Validate on frontend** before submit
2. **Show field errors** from backend response
3. **Disable submit button** during request
4. **Show success/error messages**

---

### **6.12.3. State Management**

1. **Store user info** after login
2. **Store token** securely (localStorage/sessionStorage)
3. **Clear state** on logout
4. **Refresh token** if expired

---

**📝 Tài liệu tiếp theo:**
- [Phần 7: Nghiệp Vụ Ẩn](./07_NGHIEP_VU_AN.md)
- [Phần 8: Danh Sách API Đầy Đủ](./08_DANH_SACH_API.md)

