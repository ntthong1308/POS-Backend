# 📋 Promotion Fields - Quick Reference (Cho FE)

> File này tóm tắt ngắn gọn các field cần đổi để khớp với BE

**Ngày:** 2025-12-07

---

## ⚠️ CẦN ĐỔI NGAY

### Field Mapping (FE → BE)

| ❌ Field FE ĐANG DÙNG | ✅ Field BE CẦN DÙNG |
|---------------------|-------------------|
| `code` | `maKhuyenMai` |
| `name` | `tenKhuyenMai` |
| `description` | `moTa` |
| `type` | `loaiKhuyenMai` |
| `value` | `giaTriKhuyenMai` |
| `minPurchaseAmount` | `giaTriToiThieu` |
| `maxDiscountAmount` | `giamToiDa` |
| `startDate` | `ngayBatDau` |
| `endDate` | `ngayKetThuc` |
| `usageLimit` | `soLanSuDungToiDa` |
| `usedCount` | `soLanDaSuDung` |
| `isActive` | `trangThai` (hoặc dùng `isActive` Boolean từ Response) |
| `branchId` | `chiNhanhId` |
| `branchName` | `tenChiNhanh` |

---

## ✅ TypeScript Interface (Đúng theo BE)

```typescript
interface Promotion {
  id: number;
  maKhuyenMai: string;              // ✅ REQUIRED
  tenKhuyenMai: string;             // ✅ REQUIRED
  moTa?: string;
  loaiKhuyenMai: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'BUNDLE' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
  chiNhanhId?: number;
  tenChiNhanh?: string;
  ngayBatDau: string;               // ✅ REQUIRED (ISO 8601: "YYYY-MM-DDTHH:mm:ss")
  ngayKetThuc: string;              // ✅ REQUIRED (ISO 8601: "YYYY-MM-DDTHH:mm:ss")
  giaTriKhuyenMai: number;          // ✅ REQUIRED
  giaTriToiThieu?: number;
  giamToiDa?: number;
  soLuongMua?: number;
  soLuongTang?: number;
  soLanSuDungToiDa?: number;
  tongSoLanSuDungToiDa?: number;
  soLanDaSuDung?: number;
  trangThai: 'ACTIVE' | 'INACTIVE'; // ✅ REQUIRED
  isActive?: boolean;               // Computed (chỉ trong Response)
  sanPhamIds?: number[];
  anhKhuyenMai?: string;
  dieuKien?: string;
}
```

---

## 📝 Enum Values

### **loaiKhuyenMai:**
- `PERCENTAGE`
- `FIXED_AMOUNT`
- `BOGO`
- `BUNDLE`
- `FREE_SHIPPING`
- `BUY_X_GET_Y`

### **trangThai:**
- `ACTIVE`
- `INACTIVE`

---

## ✅ Example Request (Đúng)

```json
{
  "maKhuyenMai": "KM001",
  "tenKhuyenMai": "Giảm giá 10%",
  "moTa": "Áp dụng cho tất cả sản phẩm",
  "loaiKhuyenMai": "PERCENTAGE",
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "giaTriKhuyenMai": 10.00,
  "giaTriToiThieu": 100000.00,
  "giamToiDa": 50000.00,
  "soLanSuDungToiDa": 1,
  "trangThai": "ACTIVE"
}
```

---

**Xem chi tiết:** `docs/PROMOTION_API_FIELDS_FE_GUIDE.md`

