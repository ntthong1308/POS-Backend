# 📋 PROMOTION FIELDS REFERENCE - FRONTEND

**Ngày:** 2025-12-11  
**Mục đích:** Tài liệu tham chiếu các field trong Promotion interface để so sánh với Backend

---

## 📊 PROMOTION INTERFACE (Frontend)

**File:** `src/store/cartStore.ts`

```typescript
export interface Promotion {
  // ========== IDENTIFIERS ==========
  id: number;                          // ✅ ID khuyến mãi
  maKhuyenMai: string;                 // ✅ Mã khuyến mãi (REQUIRED)
  tenKhuyenMai: string;                // ✅ Tên khuyến mãi (REQUIRED)
  moTa?: string;                       // ❌ Mô tả (optional)

  // ========== TYPE & VALUE ==========
  loaiKhuyenMai: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'BUNDLE' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
  // ✅ Loại khuyến mãi (REQUIRED)
  // - PERCENTAGE: Giảm theo phần trăm
  // - FIXED_AMOUNT: Giảm số tiền cố định
  // - BOGO: Buy One Get One
  // - BUNDLE: Gói sản phẩm
  // - FREE_SHIPPING: Miễn phí vận chuyển
  // - BUY_X_GET_Y: Mua X tặng Y

  giaTriKhuyenMai: number;              // ✅ Giá trị khuyến mãi (REQUIRED)
  // - PERCENTAGE: Phần trăm (0-100)
  // - FIXED_AMOUNT: Số tiền giảm (VND)

  // ========== CONDITIONS ==========
  giaTriToiThieu?: number;              // ❌ Giá trị đơn hàng tối thiểu (optional)
  giamToiDa?: number;                   // ❌ Giảm tối đa (optional, cho PERCENTAGE)
  soLuongMua?: number;                  // ❌ Số lượng mua (optional, cho BOGO/BUY_X_GET_Y)
  soLuongTang?: number;                 // ❌ Số lượng tặng (optional, cho BOGO/BUY_X_GET_Y)

  // ========== BRANCH ==========
  chiNhanhId?: number;                  // ❌ ID chi nhánh (optional)
  tenChiNhanh?: string;                 // ❌ Tên chi nhánh (optional, chỉ trong response)

  // ========== TIME ==========
  ngayBatDau: string;                   // ✅ Ngày bắt đầu (REQUIRED, ISO 8601: "2025-12-01T00:00:00")
  ngayKetThuc: string;                  // ✅ Ngày kết thúc (REQUIRED, ISO 8601: "2025-12-31T23:59:59")

  // ========== USAGE LIMITS ==========
  soLanSuDungToiDa?: number;            // ❌ Số lần sử dụng tối đa (per user, optional)
  tongSoLanSuDungToiDa?: number;        // ❌ Tổng số lần sử dụng tối đa (global, optional)
  soLanDaSuDung?: number;               // ❌ Số lần đã sử dụng (optional, chỉ trong response)

  // ========== STATUS ==========
  trangThai: 'ACTIVE' | 'INACTIVE';     // ✅ Trạng thái (REQUIRED)
  // - ACTIVE: Đang hoạt động
  // - INACTIVE: Tạm dừng

  // ========== ADDITIONAL ==========
  anhKhuyenMai?: string;                // ❌ Ảnh khuyến mãi (optional, URL)
  dieuKien?: string;                    // ❌ Điều kiện (optional)
  sanPhamIds?: number[];                 // ❌ Danh sách sản phẩm áp dụng (optional)

  // ========== BACKWARD COMPATIBILITY (Alias) ==========
  // Các field này chỉ dùng để tương thích ngược, không gửi lên backend
  code?: string;                        // Alias cho maKhuyenMai
  name?: string;                        // Alias cho tenKhuyenMai
  description?: string;                 // Alias cho moTa
  type?: string;                        // Alias cho loaiKhuyenMai
  value?: number;                       // Alias cho giaTriKhuyenMai
  minPurchaseAmount?: number;           // Alias cho giaTriToiThieu
  maxDiscountAmount?: number;           // Alias cho giamToiDa
  startDate?: string;                   // Alias cho ngayBatDau
  endDate?: string;                     // Alias cho ngayKetThuc
  usageLimit?: number;                  // Alias cho soLanSuDungToiDa
  usedCount?: number;                   // Alias cho soLanDaSuDung
  isActive?: boolean;                    // Alias cho trangThai === 'ACTIVE'
}
```

---

## 🔄 MAPPING VỚI BACKEND

### Backend DTO (Java)

```java
public class PromotionDTO {
    private Long id;
    private String maKhuyenMai;          // ✅ REQUIRED
    private String tenKhuyenMai;         // ✅ REQUIRED
    private String moTa;                 // ❌ Optional
    private PromotionType loaiKhuyenMai; // ✅ REQUIRED (enum)
    private BigDecimal giaTriKhuyenMai;   // ✅ REQUIRED
    private BigDecimal giaTriToiThieu;    // ❌ Optional
    private BigDecimal giamToiDa;        // ❌ Optional
    private Integer soLuongMua;           // ❌ Optional
    private Integer soLuongTang;          // ❌ Optional
    private Long chiNhanhId;              // ❌ Optional
    private String tenChiNhanh;           // ❌ Optional (response only)
    private LocalDateTime ngayBatDau;     // ✅ REQUIRED
    private LocalDateTime ngayKetThuc;    // ✅ REQUIRED
    private Integer soLanSuDungToiDa;    // ❌ Optional
    private Integer tongSoLanSuDungToiDa; // ❌ Optional
    private Integer soLanDaSuDung;        // ❌ Optional (response only)
    private PromotionStatus trangThai;    // ✅ REQUIRED (enum: ACTIVE, INACTIVE)
    private String anhKhuyenMai;          // ❌ Optional
    private String dieuKien;              // ❌ Optional
    private List<Long> sanPhamIds;        // ❌ Optional
}
```

---

## 📤 REQUEST FORMAT (Frontend → Backend)

### Create/Update Promotion

```typescript
// ✅ Gửi các field này lên backend
const promotionData = {
  maKhuyenMai: string,           // REQUIRED
  tenKhuyenMai: string,          // REQUIRED
  moTa?: string,                 // Optional
  loaiKhuyenMai: string,         // REQUIRED: 'PERCENTAGE' | 'FIXED_AMOUNT' | ...
  giaTriKhuyenMai: number,        // REQUIRED
  giaTriToiThieu?: number,        // Optional
  giamToiDa?: number,             // Optional
  soLuongMua?: number,            // Optional
  soLuongTang?: number,           // Optional
  chiNhanhId?: number,            // Optional
  ngayBatDau: string,             // REQUIRED: ISO 8601 format
  ngayKetThuc: string,            // REQUIRED: ISO 8601 format
  soLanSuDungToiDa?: number,      // Optional
  tongSoLanSuDungToiDa?: number,  // Optional
  trangThai: string,              // REQUIRED: 'ACTIVE' | 'INACTIVE'
  anhKhuyenMai?: string,          // Optional
  dieuKien?: string,              // Optional
  sanPhamIds?: number[],          // Optional
};

// ❌ KHÔNG gửi các field này:
// - id (backend tự generate)
// - tenChiNhanh (backend tự lấy từ chiNhanhId)
// - soLanDaSuDung (backend tự tính)
// - Các alias fields (code, name, type, etc.)
```

---

## 📥 RESPONSE FORMAT (Backend → Frontend)

```typescript
// Backend trả về đầy đủ các field
const promotion: Promotion = {
  id: number,
  maKhuyenMai: string,
  tenKhuyenMai: string,
  moTa?: string,
  loaiKhuyenMai: string,
  giaTriKhuyenMai: number,
  giaTriToiThieu?: number,
  giamToiDa?: number,
  soLuongMua?: number,
  soLuongTang?: number,
  chiNhanhId?: number,
  tenChiNhanh?: string,           // ✅ Backend tự điền
  ngayBatDau: string,
  ngayKetThuc: string,
  soLanSuDungToiDa?: number,
  tongSoLanSuDungToiDa?: number,
  soLanDaSuDung?: number,          // ✅ Backend tự tính
  trangThai: 'ACTIVE' | 'INACTIVE',
  anhKhuyenMai?: string,
  dieuKien?: string,
  sanPhamIds?: number[],
};
```

---

## ✅ VALIDATION RULES

### Frontend Validation

1. **REQUIRED Fields:**
   - `maKhuyenMai` - Không được để trống
   - `tenKhuyenMai` - Không được để trống
   - `loaiKhuyenMai` - Phải là một trong các giá trị enum
   - `giaTriKhuyenMai` - Phải > 0
   - `ngayBatDau` - Phải có format ISO 8601
   - `ngayKetThuc` - Phải có format ISO 8601, phải sau `ngayBatDau`
   - `trangThai` - Phải là 'ACTIVE' hoặc 'INACTIVE'

2. **Conditional Validation:**
   - Nếu `loaiKhuyenMai === 'PERCENTAGE'`:
     - `giaTriKhuyenMai` phải trong khoảng 0-100
     - `giamToiDa` có thể có (giới hạn giảm tối đa)
   - Nếu `loaiKhuyenMai === 'FIXED_AMOUNT'`:
     - `giaTriKhuyenMai` phải > 0
   - Nếu `loaiKhuyenMai === 'BOGO'` hoặc `'BUY_X_GET_Y'`:
     - `soLuongMua` và `soLuongTang` phải có

---

## 🔍 FIELD COMPARISON TABLE

| Field Name | Frontend Type | Backend Type | Required | Notes |
|------------|---------------|--------------|----------|-------|
| `id` | `number` | `Long` | ❌ | Backend tự generate |
| `maKhuyenMai` | `string` | `String` | ✅ | REQUIRED |
| `tenKhuyenMai` | `string` | `String` | ✅ | REQUIRED |
| `moTa` | `string?` | `String` | ❌ | Optional |
| `loaiKhuyenMai` | `enum` | `PromotionType` | ✅ | REQUIRED |
| `giaTriKhuyenMai` | `number` | `BigDecimal` | ✅ | REQUIRED |
| `giaTriToiThieu` | `number?` | `BigDecimal` | ❌ | Optional |
| `giamToiDa` | `number?` | `BigDecimal` | ❌ | Optional |
| `soLuongMua` | `number?` | `Integer` | ❌ | Optional (BOGO/BUY_X_GET_Y) |
| `soLuongTang` | `number?` | `Integer` | ❌ | Optional (BOGO/BUY_X_GET_Y) |
| `chiNhanhId` | `number?` | `Long` | ❌ | Optional |
| `tenChiNhanh` | `string?` | `String` | ❌ | Response only |
| `ngayBatDau` | `string` | `LocalDateTime` | ✅ | REQUIRED, ISO 8601 |
| `ngayKetThuc` | `string` | `LocalDateTime` | ✅ | REQUIRED, ISO 8601 |
| `soLanSuDungToiDa` | `number?` | `Integer` | ❌ | Optional (per user) |
| `tongSoLanSuDungToiDa` | `number?` | `Integer` | ❌ | Optional (global) |
| `soLanDaSuDung` | `number?` | `Integer` | ❌ | Response only |
| `trangThai` | `'ACTIVE'\|'INACTIVE'` | `PromotionStatus` | ✅ | REQUIRED |
| `anhKhuyenMai` | `string?` | `String` | ❌ | Optional |
| `dieuKien` | `string?` | `String` | ❌ | Optional |
| `sanPhamIds` | `number[]?` | `List<Long>` | ❌ | Optional |

---

## 📝 NOTES

1. **Date Format:**
   - Frontend gửi: `"2025-12-01T00:00:00"` (ISO 8601)
   - Backend nhận: `LocalDateTime`

2. **Status:**
   - Frontend: `'ACTIVE' | 'INACTIVE'` (string)
   - Backend: `PromotionStatus` enum

3. **Type:**
   - Frontend: `'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'BUNDLE' | 'FREE_SHIPPING' | 'BUY_X_GET_Y'`
   - Backend: `PromotionType` enum

4. **Alias Fields:**
   - Các field như `code`, `name`, `type` chỉ dùng trong frontend để tương thích ngược
   - **KHÔNG gửi** các alias fields lên backend
   - Chỉ dùng field chính: `maKhuyenMai`, `tenKhuyenMai`, `loaiKhuyenMai`, etc.

---

**Version:** 1.0.0  
**Cập nhật:** 2025-12-11

