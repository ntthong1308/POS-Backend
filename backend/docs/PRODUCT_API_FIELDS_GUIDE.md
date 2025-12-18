# 📦 Product API Fields Guide - Hướng dẫn cho Frontend

**Ngày:** 2025-12-14  
**Mục đích:** Hướng dẫn chi tiết về các fields trong Product API và cách xử lý đúng

---

## ❌ LỖI THƯỜNG GẶP

### Lỗi: `Violation of UNIQUE KEY constraint on barcode`

**Nguyên nhân:**
- SQL Server không cho phép nhiều giá trị NULL trong unique constraint
- Khi FE gửi `barcode: null` hoặc không gửi field, database sẽ vi phạm unique constraint

**Giải pháp:**
- ✅ **Nếu không có barcode:** Không gửi field `barcode` trong request hoặc gửi `null`
- ✅ **Nếu có barcode:** Gửi giá trị barcode hợp lệ (string, không empty)
- ✅ **Không được:** Gửi `barcode: ""` (empty string) - Backend sẽ tự động convert thành `null`

---

## 📋 API Endpoints

### 1. Tạo sản phẩm mới

**Endpoint:** `POST /api/v1/admin/products`

**Authentication:** Required (ADMIN, MANAGER roles)

**Request Body:**

```json
{
  "maSanPham": "SP001",
  "barcode": "1234567890123",  // Optional: null hoặc barcode hợp lệ
  "tenSanPham": "Sản phẩm mới",
  "moTa": "Mô tả sản phẩm",
  "donViTinh": "Cái",
  "giaBan": 50000,
  "giaNhap": 40000,  // Optional
  "tonKho": 100,
  "tonKhoToiThieu": 10,  // Optional
  "hinhAnh": "https://example.com/image.jpg",  // Optional: URL hoặc null
  "chiNhanhId": 1,  // Optional
  "nhaCungCapId": 1,  // Optional
  "danhMucId": 1,  // Optional
  "trangThai": "ACTIVE"  // ACTIVE, INACTIVE, DELETED
}
```

---

## 🔍 Chi tiết các Fields

### ✅ Required Fields (Bắt buộc)

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `maSanPham` | String | `@NotBlank`, max 50 chars, unique | Mã sản phẩm (phải unique) |
| `tenSanPham` | String | `@NotBlank`, max 200 chars | Tên sản phẩm |
| `giaBan` | BigDecimal | `@NotNull`, `> 0` | Giá bán (phải > 0) |
| `tonKho` | Integer | `@NotNull`, `>= 0` | Số lượng tồn kho |
| `trangThai` | String | `@NotNull` | Trạng thái: `ACTIVE`, `INACTIVE`, `DELETED` |

### ⚠️ Optional Fields (Tùy chọn)

| Field | Type | Validation | Description | Lưu ý |
|-------|------|------------|-------------|-------|
| `barcode` | String | max 50 chars, unique | Mã vạch | **QUAN TRỌNG:** Nếu không có barcode, gửi `null` hoặc không gửi field. **KHÔNG** gửi empty string `""` |
| `moTa` | String | - | Mô tả sản phẩm | Có thể null |
| `donViTinh` | String | max 50 chars | Đơn vị tính (Cái, Hộp, Kg, ...) | Có thể null |
| `giaNhap` | BigDecimal | `>= 0` | Giá nhập | Có thể null |
| `tonKhoToiThieu` | Integer | `>= 0` | Tồn kho tối thiểu | Có thể null |
| `hinhAnh` | String | max 2000 chars | URL hình ảnh | Sử dụng endpoint `/api/v1/files/products/upload` để upload |
| `chiNhanhId` | Long | - | ID chi nhánh | Có thể null |
| `nhaCungCapId` | Long | - | ID nhà cung cấp | Có thể null |
| `danhMucId` | Long | - | ID danh mục | Có thể null |

---

## 📝 Ví dụ Request

### ✅ ĐÚNG - Có barcode

```json
{
  "maSanPham": "SP001",
  "barcode": "1234567890123",
  "tenSanPham": "Sản phẩm có barcode",
  "giaBan": 50000,
  "tonKho": 100,
  "trangThai": "ACTIVE"
}
```

### ✅ ĐÚNG - Không có barcode (gửi null)

```json
{
  "maSanPham": "SP002",
  "barcode": null,
  "tenSanPham": "Sản phẩm không có barcode",
  "giaBan": 50000,
  "tonKho": 100,
  "trangThai": "ACTIVE"
}
```

### ✅ ĐÚNG - Không có barcode (không gửi field)

```json
{
  "maSanPham": "SP003",
  "tenSanPham": "Sản phẩm không có barcode",
  "giaBan": 50000,
  "tonKho": 100,
  "trangThai": "ACTIVE"
}
```

### ❌ SAI - Empty string barcode

```json
{
  "maSanPham": "SP004",
  "barcode": "",  // ❌ SAI: Empty string sẽ bị lỗi unique constraint
  "tenSanPham": "Sản phẩm",
  "giaBan": 50000,
  "tonKho": 100,
  "trangThai": "ACTIVE"
}
```

**Lỗi:** `Violation of UNIQUE KEY constraint 'UQ__san_pham__...'. Cannot insert duplicate key value is (<NULL>).`

---

## 🔧 Code Example (Frontend)

### TypeScript/React

```typescript
interface ProductCreateRequest {
  maSanPham: string;
  barcode?: string | null;  // Optional: null hoặc string hợp lệ
  tenSanPham: string;
  moTa?: string | null;
  donViTinh?: string | null;
  giaBan: number;
  giaNhap?: number | null;
  tonKho: number;
  tonKhoToiThieu?: number | null;
  hinhAnh?: string | null;
  chiNhanhId?: number | null;
  nhaCungCapId?: number | null;
  danhMucId?: number | null;
  trangThai: 'ACTIVE' | 'INACTIVE' | 'DELETED';
}

async function createProduct(data: ProductCreateRequest) {
  // ✅ NORMALIZE: Convert empty string to null
  const requestData = {
    ...data,
    barcode: data.barcode?.trim() === '' ? null : data.barcode || null,
    // Loại bỏ các field empty string khác
    moTa: data.moTa?.trim() === '' ? null : data.moTa || null,
    donViTinh: data.donViTinh?.trim() === '' ? null : data.donViTinh || null,
    hinhAnh: data.hinhAnh?.trim() === '' ? null : data.hinhAnh || null,
  };

  // Loại bỏ các field null không cần thiết (optional)
  const cleanedData = Object.fromEntries(
    Object.entries(requestData).filter(([_, value]) => value !== null || value === null) // Giữ null cho barcode
  );

  const response = await fetch('/api/v1/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(cleanedData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create product');
  }

  return response.json();
}
```

### JavaScript/Vue

```javascript
function normalizeProductData(data) {
  return {
    ...data,
    // ✅ Convert empty string to null cho barcode
    barcode: data.barcode?.trim() === '' ? null : (data.barcode || null),
    // Các field khác
    moTa: data.moTa?.trim() === '' ? null : data.moTa || null,
    donViTinh: data.donViTinh?.trim() === '' ? null : data.donViTinh || null,
    hinhAnh: data.hinhAnh?.trim() === '' ? null : data.hinhAnh || null,
  };
}

async function createProduct(productData) {
  const normalized = normalizeProductData(productData);
  
  const response = await axios.post('/api/v1/admin/products', normalized, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.data;
}
```

---

## ✅ Validation Rules

### Frontend Validation (Recommended)

```typescript
function validateProduct(data: ProductCreateRequest): string[] {
  const errors: string[] = [];

  // Required fields
  if (!data.maSanPham?.trim()) {
    errors.push('Mã sản phẩm không được để trống');
  } else if (data.maSanPham.length > 50) {
    errors.push('Mã sản phẩm không quá 50 ký tự');
  }

  if (!data.tenSanPham?.trim()) {
    errors.push('Tên sản phẩm không được để trống');
  } else if (data.tenSanPham.length > 200) {
    errors.push('Tên sản phẩm không quá 200 ký tự');
  }

  if (!data.giaBan || data.giaBan <= 0) {
    errors.push('Giá bán phải lớn hơn 0');
  }

  if (data.tonKho === undefined || data.tonKho < 0) {
    errors.push('Tồn kho không được âm');
  }

  if (!data.trangThai) {
    errors.push('Trạng thái không được để trống');
  }

  // Barcode validation
  if (data.barcode !== null && data.barcode !== undefined) {
    if (data.barcode.trim() === '') {
      // ✅ Empty string -> convert to null (sẽ được xử lý ở normalizeProductData)
    } else if (data.barcode.length > 50) {
      errors.push('Barcode không quá 50 ký tự');
    }
  }

  return errors;
}
```

---

## 🔄 Update Product

**Endpoint:** `PUT /api/v1/admin/products/{id}`

**Request Body:** Tương tự như create, nhưng:
- Không cần gửi tất cả fields
- Chỉ gửi fields cần update
- `barcode` vẫn phải tuân thủ rule: `null` hoặc giá trị hợp lệ, không được empty string

---

## 📞 Error Responses

### 400 Bad Request - Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "maSanPham",
      "message": "Mã sản phẩm không được để trống"
    }
  ]
}
```

### 409 Conflict - Duplicate

```json
{
  "success": false,
  "message": "Barcode đã tồn tại: 1234567890123",
  "errorCode": "DUPLICATE_BARCODE"
}
```

### 500 Internal Server Error - Unique Constraint Violation

Nếu vẫn gặp lỗi unique constraint sau khi làm theo hướng dẫn, có thể do:
1. Database chưa được migrate với migration V17 (fix barcode unique constraint)
2. Vẫn còn barcode là empty string trong request

---

## 📝 Summary

### ✅ DO (Nên làm)

- ✅ Gửi `barcode: null` nếu không có barcode
- ✅ Không gửi field `barcode` nếu không có barcode
- ✅ Normalize empty string thành `null` trước khi gửi request
- ✅ Validate tất cả required fields ở frontend trước khi submit

### ❌ DON'T (Không nên làm)

- ❌ **KHÔNG** gửi `barcode: ""` (empty string)
- ❌ **KHÔNG** gửi `barcode: undefined` (nên convert thành `null`)
- ❌ **KHÔNG** bỏ qua validation ở frontend

---

**Nếu vẫn gặp lỗi, vui lòng kiểm tra:**
1. Database đã được migrate với migration V17 chưa?
2. Frontend đã normalize empty string thành null chưa?
3. Request body có đúng format không?

