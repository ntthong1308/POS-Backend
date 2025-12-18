# 📋 Promotion API - Hướng Dẫn Field Cho Frontend

> Tài liệu này hướng dẫn FE sử dụng đúng field names theo backend

**Ngày cập nhật:** 2025-12-07  
**Status:** ✅ Cần FE chỉnh lại

---

## ⚠️ VẤN ĐỀ HIỆN TẠI

FE đang dùng **alias fields** (`code`, `name`, `type`, `value`, etc.) nhưng **BE chỉ nhận/trả về field chính** (`maKhuyenMai`, `tenKhuyenMai`, `loaiKhuyenMai`, `giaTriKhuyenMai`, etc.).

---

## ✅ FIELD NAMES ĐÚNG (Theo BE)

### **Field Mapping - BẮT BUỘC PHẢI ĐỔI**

| ❌ Field FE ĐANG DÙNG (SAI) | ✅ Field BE CẦN DÙNG (ĐÚNG) | Type | Required |
|---------------------------|--------------------------|------|----------|
| `code` | `maKhuyenMai` | `String` | ✅ YES |
| `name` | `tenKhuyenMai` | `String` | ✅ YES |
| `description` | `moTa` | `String` | ❌ No |
| `type` | `loaiKhuyenMai` | `String` (Enum) | ✅ YES |
| `value` | `giaTriKhuyenMai` | `Number` (BigDecimal) | ✅ YES |
| `minPurchaseAmount` | `giaTriToiThieu` | `Number` (BigDecimal) | ❌ No |
| `maxDiscountAmount` | `giamToiDa` | `Number` (BigDecimal) | ❌ No |
| `startDate` | `ngayBatDau` | `String` (DateTime) | ✅ YES |
| `endDate` | `ngayKetThuc` | `String` (DateTime) | ✅ YES |
| `usageLimit` | `soLanSuDungToiDa` | `Number` (Integer) | ❌ No |
| `usedCount` | `soLanDaSuDung` | `Number` (Integer) | ❌ No |
| `isActive` | `trangThai` (hoặc dùng `isActive` Boolean) | `String` (Enum) / `Boolean` | ✅ YES |
| `branchId` | `chiNhanhId` | `Number` (Long) | ❌ No |
| `branchName` | `tenChiNhanh` | `String` | ❌ No |

---

## 📋 CHI TIẾT TẤT CẢ FIELDS

### **1. ID**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | `Number` (Long) | ✅ Auto | ID khuyến mãi | `1` |

---

### **2. Thông Tin Cơ Bản**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `maKhuyenMai` | `String` | ✅ **YES** | Mã khuyến mãi (unique) | `"KM001"` |
| `tenKhuyenMai` | `String` | ✅ **YES** | Tên khuyến mãi | `"Giảm giá 10%"` |
| `moTa` | `String` | ❌ No | Mô tả | `"Áp dụng cho tất cả sản phẩm"` |

**Lưu ý:**
- ❌ **KHÔNG dùng:** `code`, `name`, `description`
- ✅ **PHẢI dùng:** `maKhuyenMai`, `tenKhuyenMai`, `moTa`

---

### **3. Loại Khuyến Mãi**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `loaiKhuyenMai` | `String` (Enum) | ✅ **YES** | Loại khuyến mãi | `"PERCENTAGE"` |

**Enum Values:**

| Value | Mô Tả | Sử Dụng |
|-------|-------|---------|
| `PERCENTAGE` | Giảm giá theo phần trăm | `giaTriKhuyenMai` = 10 → giảm 10% |
| `FIXED_AMOUNT` | Giảm giá theo số tiền cố định | `giaTriKhuyenMai` = 50000 → giảm 50.000đ |
| `BOGO` | Buy One Get One (Mua 1 tặng 1) | Dùng `soLuongMua`, `soLuongTang` |
| `BUNDLE` | Combo sản phẩm | Dùng `sanPhamIds` |
| `FREE_SHIPPING` | Miễn phí vận chuyển | - |
| `BUY_X_GET_Y` | Mua X tặng Y | Dùng `soLuongMua`, `soLuongTang` |

**Lưu ý:**
- ❌ **KHÔNG dùng:** `type`
- ✅ **PHẢI dùng:** `loaiKhuyenMai`

---

### **4. Chi Nhánh**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `chiNhanhId` | `Number` (Long) | ❌ No | ID chi nhánh (null = tất cả) | `1` |
| `tenChiNhanh` | `String` | ❌ No | Tên chi nhánh (chỉ trong Response) | `"Chi nhánh Trung tâm"` |

**Lưu ý:**
- ❌ **KHÔNG dùng:** `branchId`, `branchName`
- ✅ **PHẢI dùng:** `chiNhanhId`, `tenChiNhanh`

---

### **5. Thời Gian**

| Field | Type | Required | Description | Format |
|-------|------|----------|-------------|--------|
| `ngayBatDau` | `String` (DateTime) | ✅ **YES** | Ngày bắt đầu | `"2025-12-01T00:00:00"` |
| `ngayKetThuc` | `String` (DateTime) | ✅ **YES** | Ngày kết thúc | `"2025-12-31T23:59:59"` |

**Format:** ISO 8601 DateTime: `YYYY-MM-DDTHH:mm:ss`

**Lưu ý:**
- ❌ **KHÔNG dùng:** `startDate`, `endDate`
- ✅ **PHẢI dùng:** `ngayBatDau`, `ngayKetThuc`

---

### **6. Giá Trị Khuyến Mãi**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `giaTriKhuyenMai` | `Number` (BigDecimal) | ✅ **YES** | Giá trị khuyến mãi | `10.00` hoặc `50000.00` |
| `giaTriToiThieu` | `Number` (BigDecimal) | ❌ No | Giá trị đơn hàng tối thiểu | `100000.00` |
| `giamToiDa` | `Number` (BigDecimal) | ❌ No | Giảm tối đa | `50000.00` |

**Giải thích:**
- `PERCENTAGE`: `giaTriKhuyenMai` = 10 → giảm 10%
- `FIXED_AMOUNT`: `giaTriKhuyenMai` = 50000 → giảm 50.000đ
- `giaTriToiThieu`: Đơn hàng phải từ X đồng mới được áp dụng
- `giamToiDa`: Với PERCENTAGE, tối đa chỉ giảm X đồng

**Lưu ý:**
- ❌ **KHÔNG dùng:** `value`, `minPurchaseAmount`, `maxDiscountAmount`
- ✅ **PHẢI dùng:** `giaTriKhuyenMai`, `giaTriToiThieu`, `giamToiDa`

---

### **7. Số Lượng (Cho BOGO, BUY_X_GET_Y)**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `soLuongMua` | `Number` (Integer) | ❌ No | Số lượng cần mua | `2` |
| `soLuongTang` | `Number` (Integer) | ❌ No | Số lượng được tặng | `1` |

**Sử dụng cho:**
- `BOGO`: `soLuongMua = 1`, `soLuongTang = 1`
- `BUY_X_GET_Y`: `soLuongMua = X`, `soLuongTang = Y`

---

### **8. Giới Hạn Sử Dụng**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `soLanSuDungToiDa` | `Number` (Integer) | ❌ No | Số lần sử dụng tối đa (per user) | `1` |
| `tongSoLanSuDungToiDa` | `Number` (Integer) | ❌ No | Tổng số lần sử dụng tối đa (global) | `100` |
| `soLanDaSuDung` | `Number` (Integer) | ❌ No | Số lần đã sử dụng (chỉ trong Response) | `25` |

**Lưu ý:**
- ❌ **KHÔNG dùng:** `usageLimit`, `usedCount`
- ✅ **PHẢI dùng:** `soLanSuDungToiDa`, `soLanDaSuDung`

---

### **9. Trạng Thái**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `trangThai` | `String` (Enum) | ✅ **YES** | Trạng thái | `"ACTIVE"` |
| `isActive` | `Boolean` | ❌ No | Computed: khuyến mãi có đang hoạt động không (chỉ trong Response) | `true` |

**Enum Values:**

| Value | Mô Tả |
|-------|-------|
| `ACTIVE` | Đang hoạt động |
| `INACTIVE` | Ngừng hoạt động |

**Lưu ý:**
- `trangThai` là field chính, bắt buộc
- `isActive` là computed field (chỉ có trong Response), tính dựa trên:
  - `trangThai === 'ACTIVE'`
  - Trong khoảng thời gian (`ngayBatDau` → `ngayKetThuc`)
  - Chưa vượt quá `tongSoLanSuDungToiDa`

---

### **10. Sản Phẩm Áp Dụng**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `sanPhamIds` | `Array<Number>` | ❌ No | Danh sách ID sản phẩm áp dụng | `[1, 2, 3]` |

**Lưu ý:**
- `null` hoặc `[]` = áp dụng cho tất cả sản phẩm
- Có giá trị = chỉ áp dụng cho các sản phẩm trong danh sách

---

### **11. Hình Ảnh & Điều Kiện**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `anhKhuyenMai` | `String` | ❌ No | URL ảnh khuyến mãi | `"/uploads/promotions/abc.jpg"` |
| `dieuKien` | `String` | ❌ No | Điều kiện áp dụng (JSON hoặc text) | `"Áp dụng cho đơn hàng từ 100,000đ"` |

---

## 💻 TypeScript Interface (Đúng theo BE)

```typescript
interface Promotion {
  // ID
  id: number;

  // Thông tin cơ bản
  maKhuyenMai: string;              // ✅ REQUIRED - Mã khuyến mãi
  tenKhuyenMai: string;             // ✅ REQUIRED - Tên khuyến mãi
  moTa?: string;                    // Optional - Mô tả

  // Loại khuyến mãi
  loaiKhuyenMai: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'BUNDLE' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';

  // Chi nhánh
  chiNhanhId?: number;              // Optional - ID chi nhánh
  tenChiNhanh?: string;             // Optional - Tên chi nhánh (chỉ trong Response)

  // Thời gian
  ngayBatDau: string;               // ✅ REQUIRED - Ngày bắt đầu (ISO 8601)
  ngayKetThuc: string;              // ✅ REQUIRED - Ngày kết thúc (ISO 8601)

  // Giá trị khuyến mãi
  giaTriKhuyenMai: number;          // ✅ REQUIRED - Giá trị khuyến mãi
  giaTriToiThieu?: number;          // Optional - Giá trị đơn hàng tối thiểu
  giamToiDa?: number;               // Optional - Giảm tối đa

  // Số lượng (cho BOGO, BUY_X_GET_Y)
  soLuongMua?: number;              // Optional - Số lượng mua
  soLuongTang?: number;             // Optional - Số lượng tặng

  // Giới hạn sử dụng
  soLanSuDungToiDa?: number;        // Optional - Số lần sử dụng tối đa (per user)
  tongSoLanSuDungToiDa?: number;    // Optional - Tổng số lần sử dụng tối đa (global)
  soLanDaSuDung?: number;          // Optional - Số lần đã sử dụng (chỉ trong Response)

  // Trạng thái
  trangThai: 'ACTIVE' | 'INACTIVE'; // ✅ REQUIRED - Trạng thái
  isActive?: boolean;               // Optional - Computed: có đang hoạt động không (chỉ trong Response)

  // Sản phẩm áp dụng
  sanPhamIds?: number[];           // Optional - Danh sách ID sản phẩm

  // Hình ảnh & Điều kiện
  anhKhuyenMai?: string;            // Optional - URL ảnh khuyến mãi
  dieuKien?: string;               // Optional - Điều kiện áp dụng
}
```

---

## 📝 Ví Dụ Request Body (Đúng theo BE)

### **Tạo Khuyến Mãi Mới (PERCENTAGE)**

```json
{
  "maKhuyenMai": "KM001",
  "tenKhuyenMai": "Giảm giá 10%",
  "moTa": "Áp dụng cho tất cả sản phẩm",
  "loaiKhuyenMai": "PERCENTAGE",
  "chiNhanhId": 1,
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "giaTriKhuyenMai": 10.00,
  "giaTriToiThieu": 100000.00,
  "giamToiDa": 50000.00,
  "soLanSuDungToiDa": 1,
  "tongSoLanSuDungToiDa": 100,
  "trangThai": "ACTIVE",
  "sanPhamIds": [1, 2, 3]
}
```

### **Tạo Khuyến Mãi Mới (FIXED_AMOUNT)**

```json
{
  "maKhuyenMai": "KM002",
  "tenKhuyenMai": "Giảm 50.000đ",
  "moTa": "Áp dụng cho đơn hàng từ 200.000đ",
  "loaiKhuyenMai": "FIXED_AMOUNT",
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "giaTriKhuyenMai": 50000.00,
  "giaTriToiThieu": 200000.00,
  "trangThai": "ACTIVE"
}
```

### **Tạo Khuyến Mãi Mới (BOGO)**

```json
{
  "maKhuyenMai": "KM003",
  "tenKhuyenMai": "Mua 1 tặng 1",
  "moTa": "Mua 1 sản phẩm được tặng 1 sản phẩm",
  "loaiKhuyenMai": "BOGO",
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "soLuongMua": 1,
  "soLuongTang": 1,
  "trangThai": "ACTIVE",
  "sanPhamIds": [1, 2]
}
```

---

## ✅ Checklist Thay Đổi

### **Trong Components:**

- [ ] Đổi `code` → `maKhuyenMai`
- [ ] Đổi `name` → `tenKhuyenMai`
- [ ] Đổi `description` → `moTa`
- [ ] Đổi `type` → `loaiKhuyenMai`
- [ ] Đổi `value` → `giaTriKhuyenMai`
- [ ] Đổi `minPurchaseAmount` → `giaTriToiThieu`
- [ ] Đổi `maxDiscountAmount` → `giamToiDa`
- [ ] Đổi `startDate` → `ngayBatDau`
- [ ] Đổi `endDate` → `ngayKetThuc`
- [ ] Đổi `usageLimit` → `soLanSuDungToiDa`
- [ ] Đổi `usedCount` → `soLanDaSuDung`
- [ ] Đổi `isActive` → `trangThai` (hoặc dùng `isActive` Boolean từ Response)
- [ ] Đổi `branchId` → `chiNhanhId`
- [ ] Đổi `branchName` → `tenChiNhanh`

### **Trong Store/API:**

- [ ] Update TypeScript interface
- [ ] Update API calls (request/response mapping)
- [ ] Update form validation

---

## 📋 Tóm Tắt Nhanh

### **Field Names Cần Đổi:**

1. `code` → `maKhuyenMai`
2. `name` → `tenKhuyenMai`
3. `description` → `moTa`
4. `type` → `loaiKhuyenMai`
5. `value` → `giaTriKhuyenMai`
6. `minPurchaseAmount` → `giaTriToiThieu`
7. `maxDiscountAmount` → `giamToiDa`
8. `startDate` → `ngayBatDau`
9. `endDate` → `ngayKetThuc`
10. `usageLimit` → `soLanSuDungToiDa`
11. `usedCount` → `soLanDaSuDung`
12. `branchId` → `chiNhanhId`
13. `branchName` → `tenChiNhanh`

### **Enum Values:**

- **loaiKhuyenMai:** `PERCENTAGE`, `FIXED_AMOUNT`, `BOGO`, `BUNDLE`, `FREE_SHIPPING`, `BUY_X_GET_Y`
- **trangThai:** `ACTIVE`, `INACTIVE`

---

**Ngày tạo:** 2025-12-07  
**Version:** 1.0  
**Status:** ✅ Cần FE chỉnh lại

