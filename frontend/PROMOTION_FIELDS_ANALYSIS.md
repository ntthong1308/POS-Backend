# 📋 Phân Tích Các Field Trong Khuyến Mãi

## 🔍 Tổng Quan

Có **2 interface Promotion** khác nhau trong codebase:

1. **`Promotion` trong `src/store/cartStore.ts`** - Interface chính, đầy đủ field theo API
2. **`Promotion` trong `AddPromotionDialog.tsx` và `EditPromotionDialog.tsx`** - Interface đơn giản hơn, dùng alias fields

---

## 📊 Interface Chính (`src/store/cartStore.ts`)

### **Promotion Interface:**

```typescript
export interface Promotion {
  // ID
  id: number;
  
  // Thông tin cơ bản
  maKhuyenMai: string;              // ✅ Mã khuyến mãi
  tenKhuyenMai: string;             // ✅ Tên khuyến mãi
  moTa?: string;                    // ❌ Mô tả (optional)
  
  // Loại khuyến mãi
  loaiKhuyenMai: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'BUNDLE' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
  
  // Chi nhánh
  chiNhanhId?: number;              // ❌ ID chi nhánh (optional)
  tenChiNhanh?: string;             // ❌ Tên chi nhánh (optional, chỉ trong response)
  
  // Thời gian
  ngayBatDau: string;               // ✅ Ngày bắt đầu
  ngayKetThuc: string;              // ✅ Ngày kết thúc
  
  // Giá trị khuyến mãi
  giaTriKhuyenMai: number;          // ✅ Giá trị khuyến mãi (% hoặc số tiền)
  giaTriToiThieu?: number;          // ❌ Giá trị đơn hàng tối thiểu (optional)
  giamToiDa?: number;               // ❌ Giảm tối đa (optional)
  
  // Số lượng (cho BOGO, BUY_X_GET_Y)
  soLuongMua?: number;              // ❌ Số lượng mua (optional)
  soLuongTang?: number;              // ❌ Số lượng tặng (optional)
  
  // Giới hạn sử dụng
  soLanSuDungToiDa?: number;        // ❌ Số lần sử dụng tối đa (per user, optional)
  tongSoLanSuDungToiDa?: number;    // ❌ Tổng số lần sử dụng tối đa (global, optional)
  soLanDaSuDung?: number;           // ❌ Số lần đã sử dụng (optional, chỉ trong response)
  
  // Trạng thái
  trangThai: 'ACTIVE' | 'INACTIVE'; // ✅ Trạng thái
  
  // Hình ảnh
  anhKhuyenMai?: string;             // ❌ Ảnh khuyến mãi (optional)
  
  // Điều kiện
  dieuKien?: string;                // ❌ Điều kiện (optional)
  
  // Sản phẩm áp dụng
  sanPhamIds?: number[];            // ❌ Danh sách ID sản phẩm (optional)
  
  // Tương thích ngược (Alias fields)
  code?: string;                    // Alias cho maKhuyenMai
  name?: string;                    // Alias cho tenKhuyenMai
  description?: string;             // Alias cho moTa
  type?: string;                    // Alias cho loaiKhuyenMai
  value?: number;                   // Alias cho giaTriKhuyenMai
  minPurchaseAmount?: number;       // Alias cho giaTriToiThieu
  maxDiscountAmount?: number;      // Alias cho giamToiDa
  startDate?: string;               // Alias cho ngayBatDau
  endDate?: string;                 // Alias cho ngayKetThuc
  usageLimit?: number;              // Alias cho soLanSuDungToiDa
  usedCount?: number;               // Alias cho soLanDaSuDung
  isActive?: boolean;               // Alias cho trangThai === 'ACTIVE'
  branchId?: number;                // Alias cho chiNhanhId
  branchName?: string;              // Alias cho tenChiNhanh
}
```

---

## 📋 Bảng Chi Tiết Các Field

| Field Name | Type | Required | Mô Tả | Sử Dụng Trong UI | Status |
|-----------|------|----------|-------|------------------|--------|
| **id** | `number` | ✅ | ID khuyến mãi | Table, Edit, Delete | ✅ Có |
| **maKhuyenMai** | `string` | ✅ | Mã khuyến mãi | Table, Form | ✅ Có |
| **tenKhuyenMai** | `string` | ✅ | Tên khuyến mãi | Table, Form | ✅ Có |
| **moTa** | `string` | ❌ | Mô tả | Table (subtitle) | ✅ Có |
| **loaiKhuyenMai** | `enum` | ✅ | Loại khuyến mãi | Form | ✅ Có |
| **chiNhanhId** | `number` | ❌ | ID chi nhánh | Form | ✅ Có |
| **tenChiNhanh** | `string` | ❌ | Tên chi nhánh | Display | ✅ Có |
| **ngayBatDau** | `string` | ✅ | Ngày bắt đầu | Table, Form | ✅ Có |
| **ngayKetThuc** | `string` | ✅ | Ngày kết thúc | Table, Form | ✅ Có |
| **giaTriKhuyenMai** | `number` | ✅ | Giá trị khuyến mãi | Table, Form | ✅ Có |
| **giaTriToiThieu** | `number` | ❌ | Giá trị đơn tối thiểu | Table, Form | ✅ Có |
| **giamToiDa** | `number` | ❌ | Giảm tối đa | Form | ⚠️ Có nhưng chưa dùng |
| **soLuongMua** | `number` | ❌ | Số lượng mua (BOGO) | Form | ⚠️ Có nhưng chưa dùng |
| **soLuongTang** | `number` | ❌ | Số lượng tặng (BOGO) | Form | ⚠️ Có nhưng chưa dùng |
| **soLanSuDungToiDa** | `number` | ❌ | Số lần sử dụng tối đa (per user) | Table, Form | ✅ Có |
| **tongSoLanSuDungToiDa** | `number` | ❌ | Tổng số lần sử dụng tối đa (global) | - | ⚠️ Có nhưng chưa dùng |
| **soLanDaSuDung** | `number` | ❌ | Số lần đã sử dụng | Table (progress bar) | ✅ Có |
| **trangThai** | `enum` | ✅ | Trạng thái (ACTIVE/INACTIVE) | Table, Form | ✅ Có |
| **anhKhuyenMai** | `string` | ❌ | Ảnh khuyến mãi | - | ⚠️ Có nhưng chưa dùng |
| **dieuKien** | `string` | ❌ | Điều kiện | - | ⚠️ Có nhưng chưa dùng |
| **sanPhamIds** | `number[]` | ❌ | Danh sách ID sản phẩm | - | ⚠️ Có nhưng chưa dùng |

---

## 🔄 Interface Trong Dialog Components

### **AddPromotionDialog & EditPromotionDialog:**

```typescript
interface Promotion {
  id: number;
  code: string;                    // ⚠️ Dùng alias thay vì maKhuyenMai
  name: string;                    // ⚠️ Dùng alias thay vì tenKhuyenMai
  description?: string;            // ⚠️ Dùng alias thay vì moTa
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';  // ⚠️ Chỉ có 2 loại, không có BOGO, BUNDLE, etc.
  value: number;                   // ⚠️ Dùng alias thay vì giaTriKhuyenMai
  minPurchaseAmount?: number;      // ⚠️ Dùng alias thay vì giaTriToiThieu
  maxDiscountAmount?: number;      // ⚠️ Dùng alias thay vì giamToiDa
  startDate: string;               // ⚠️ Dùng alias thay vì ngayBatDau
  endDate: string;                 // ⚠️ Dùng alias thay vì ngayKetThuc
  branchId?: number;               // ⚠️ Dùng alias thay vì chiNhanhId
  branchName?: string;             // ⚠️ Dùng alias thay vì tenChiNhanh
  isActive: boolean;               // ⚠️ Dùng alias thay vì trangThai
  usageLimit?: number;             // ⚠️ Dùng alias thay vì soLanSuDungToiDa
  usedCount: number;               // ⚠️ Dùng alias thay vì soLanDaSuDung
}
```

**Vấn đề:**
- ⚠️ Dialog components đang dùng **alias fields** thay vì **field chính**
- ⚠️ Chỉ hỗ trợ 2 loại khuyến mãi: `PERCENTAGE`, `FIXED_AMOUNT`
- ⚠️ Không hỗ trợ các loại khác: `BOGO`, `BUNDLE`, `FREE_SHIPPING`, `BUY_X_GET_Y`

---

## 📊 Field Đang Được Sử Dụng Trong UI

### **PromotionsPage.tsx:**

| Field | Sử Dụng | Ghi Chú |
|-------|---------|---------|
| `code` | Table, Search | ✅ Dùng alias |
| `name` | Table, Search | ✅ Dùng alias |
| `description` | Table (subtitle), Search | ✅ Dùng alias |
| `type` | Format discount display | ✅ Dùng alias |
| `value` | Format discount display | ✅ Dùng alias |
| `minPurchaseAmount` | Table (subtitle) | ✅ Dùng alias |
| `startDate` | Table | ✅ Dùng alias |
| `endDate` | Table | ✅ Dùng alias |
| `usedCount` | Table (progress bar) | ✅ Dùng alias |
| `usageLimit` | Table (progress bar) | ✅ Dùng alias |
| `isActive` | Table (status badge) | ✅ Dùng alias |
| `branchId` | - | ⚠️ Có nhưng chưa hiển thị |
| `branchName` | - | ⚠️ Có nhưng chưa hiển thị |

---

## ⚠️ Vấn Đề Cần Sửa

### **1. Inconsistency giữa Interface:**

- **`cartStore.ts`**: Dùng field chính (`maKhuyenMai`, `tenKhuyenMai`, `loaiKhuyenMai`, etc.)
- **Dialog components**: Dùng alias fields (`code`, `name`, `type`, etc.)
- **PromotionsPage**: Dùng alias fields

**Hậu quả:**
- Có thể gây lỗi khi mapping data
- Khó maintain

**Giải pháp:**
- Nên thống nhất dùng **field chính** từ `cartStore.ts`
- Hoặc tạo mapping function để convert giữa 2 format

---

### **2. Loại Khuyến Mãi:**

**Interface chính hỗ trợ:**
- `PERCENTAGE` ✅
- `FIXED_AMOUNT` ✅
- `BOGO` ❌ (Buy One Get One)
- `BUNDLE` ❌
- `FREE_SHIPPING` ❌
- `BUY_X_GET_Y` ❌

**Dialog components chỉ hỗ trợ:**
- `PERCENTAGE` ✅
- `FIXED_AMOUNT` ✅

**Giải pháp:**
- Cần update Dialog components để hỗ trợ tất cả loại khuyến mãi
- Cần thêm UI fields cho các loại đặc biệt (BOGO, BUY_X_GET_Y)

---

### **3. Field Chưa Được Sử Dụng:**

| Field | Status | Nên Sử Dụng |
|-------|--------|-------------|
| `giamToiDa` | ⚠️ Có nhưng chưa dùng | Hiển thị trong form và table |
| `soLuongMua` | ⚠️ Có nhưng chưa dùng | Form cho BOGO/BUY_X_GET_Y |
| `soLuongTang` | ⚠️ Có nhưng chưa dùng | Form cho BOGO/BUY_X_GET_Y |
| `tongSoLanSuDungToiDa` | ⚠️ Có nhưng chưa dùng | Form và table |
| `anhKhuyenMai` | ⚠️ Có nhưng chưa dùng | Upload và hiển thị ảnh |
| `dieuKien` | ⚠️ Có nhưng chưa dùng | Form và table |
| `sanPhamIds` | ⚠️ Có nhưng chưa dùng | Form chọn sản phẩm áp dụng |

---

## 📝 Tóm Tắt Field Requirements

### **Field Bắt Buộc (Required):**

1. ✅ `id` - ID khuyến mãi
2. ✅ `maKhuyenMai` - Mã khuyến mãi
3. ✅ `tenKhuyenMai` - Tên khuyến mãi
4. ✅ `loaiKhuyenMai` - Loại khuyến mãi
5. ✅ `ngayBatDau` - Ngày bắt đầu
6. ✅ `ngayKetThuc` - Ngày kết thúc
7. ✅ `giaTriKhuyenMai` - Giá trị khuyến mãi
8. ✅ `trangThai` - Trạng thái

### **Field Optional (Đang dùng):**

1. ✅ `moTa` - Mô tả
2. ✅ `chiNhanhId` - ID chi nhánh
3. ✅ `tenChiNhanh` - Tên chi nhánh
4. ✅ `giaTriToiThieu` - Giá trị đơn tối thiểu
5. ✅ `soLanSuDungToiDa` - Số lần sử dụng tối đa (per user)
6. ✅ `soLanDaSuDung` - Số lần đã sử dụng

### **Field Optional (Chưa dùng):**

1. ⚠️ `giamToiDa` - Giảm tối đa
2. ⚠️ `soLuongMua` - Số lượng mua (BOGO)
3. ⚠️ `soLuongTang` - Số lượng tặng (BOGO)
4. ⚠️ `tongSoLanSuDungToiDa` - Tổng số lần sử dụng tối đa (global)
5. ⚠️ `anhKhuyenMai` - Ảnh khuyến mãi
6. ⚠️ `dieuKien` - Điều kiện
7. ⚠️ `sanPhamIds` - Danh sách ID sản phẩm

---

## 🎯 Recommendations

### **1. Thống Nhất Interface:**
- Nên dùng **field chính** từ `cartStore.ts` trong tất cả components
- Xóa hoặc deprecated alias fields

### **2. Mở Rộng Loại Khuyến Mãi:**
- Update Dialog components để hỗ trợ tất cả loại khuyến mãi
- Thêm UI fields cho BOGO, BUY_X_GET_Y, etc.

### **3. Sử Dụng Field Chưa Dùng:**
- Thêm `giamToiDa` vào form và table
- Thêm `sanPhamIds` để chọn sản phẩm áp dụng
- Thêm `anhKhuyenMai` để upload và hiển thị ảnh

---

**Ngày tạo:** 2025-12-07  
**Version:** 1.0  
**Status:** ✅ Đã phân tích

