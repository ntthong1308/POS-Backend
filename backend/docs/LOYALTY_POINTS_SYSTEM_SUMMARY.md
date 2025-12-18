# Tổng Hợp Hệ Thống Tích Điểm (Loyalty Points)

## ✅ Kết Luận: **Đã có đầy đủ logic tích điểm**

---

## 1. Database Schema

### Bảng `khach_hang`
```sql
diem_tich_luy DECIMAL(10,2) DEFAULT 0  -- Điểm tích lũy của khách hàng
```

### Bảng `hoa_don`
```sql
diem_su_dung DECIMAL(10,2) DEFAULT 0   -- Điểm khách hàng sử dụng trong hóa đơn này
diem_tich_luy DECIMAL(10,2) DEFAULT 0   -- Điểm tích lũy được tạo từ hóa đơn này
```

---

## 2. Logic Tích Điểm

### 2.1. Tính Điểm Tích Lũy

**Công thức:**
```
diemTichLuy = thanhTien / 1.000 (làm tròn)
```

**Trong đó:**
- `thanhTien = tongTien - giamGia`
- Điểm được làm tròn đến số nguyên (1.000 VND = 1 điểm)

**File:** `retail-application/src/main/java/com/retail/application/service/pos/PosServiceImpl.java`

```java
// Tính điểm tích lũy: 1.000 VND = 1 điểm (làm tròn đến số nguyên)
BigDecimal diemTichLuy = thanhTien.divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP);
hoaDon.setDiemTichLuy(diemTichLuy);
```

---

### 2.2. Cập Nhật Điểm Khách Hàng

**Khi checkout:**
1. **Thêm điểm mới:**
   ```java
   khachHang.diemTichLuy += diemTichLuy;
   ```

**Ví dụ:**
- Khách hàng có: 100 điểm
- Thanh toán: 35.000 VND
- Điểm tích lũy: 35 điểm (35.000 / 1.000)
- **Kết quả:** 100 + 35 = **135 điểm**

**Lưu ý:** Đã xóa phần sử dụng điểm (diemSuDung)

**File:** `retail-application/src/main/java/com/retail/application/service/pos/PosServiceImpl.java`

```java
// Cập nhật điểm khách hàng
if (khachHang != null) {
    // Trừ điểm đã sử dụng
    if (hoaDon.getDiemSuDung().compareTo(BigDecimal.ZERO) > 0) {
        khachHang.setDiemTichLuy(
                khachHang.getDiemTichLuy().subtract(hoaDon.getDiemSuDung()));
    }

    // Thêm điểm mới
    khachHang.setDiemTichLuy(
            khachHang.getDiemTichLuy().add(diemTichLuy));

    khachHangRepository.save(khachHang);
}
```

---

## 3. Flow Checkout với Điểm

### Bước 1-5: Tạo hóa đơn và tính tổng tiền
```
tongTien = sum(items[i].soLuong * items[i].donGia)
```

### Bước 6: Áp dụng giảm giá
```
giamGia = giamGiaThucCong + giamGiaKhuyenMai
```

### Bước 7: Tính số tiền cuối cùng
```
thanhTien = tongTien - giamGia - diemSuDung
if (thanhTien < 0) thanhTien = 0
```

### Bước 8: Tính điểm tích lũy
```
diemTichLuy = thanhTien * 0.01
```

### Bước 9: Cập nhật điểm khách hàng
```
if (khachHang != null) {
    khachHang.diemTichLuy -= diemSuDung  // Trừ điểm đã dùng
    khachHang.diemTichLuy += diemTichLuy // Thêm điểm mới
}
```

---

## 4. DTOs và Fields

### CheckoutRequest
```java
{
    "khachHangId": 1,           // Optional - ID khách hàng
    // ❌ XÓA: "diemSuDung": 50.00,
    "giamGia": 5000.00,         // Optional - Giảm giá
    ...
}
```

### InvoiceDTO (Response)
```java
{
    // ❌ XÓA: "diemSuDung": 50.00,
    "diemTichLuy": 35,          // Điểm tích lũy mới (1.000 VND = 1 điểm)
    "thanhTien": 35000.00,      // Số tiền cuối cùng
    ...
}
```

### CustomerDTO
```java
{
    "id": 1,
    "diemTichLuy": 250.00,      // Tổng điểm hiện tại
    ...
}
```

---

## 5. API Endpoints

### 5.1. Checkout (Tự động tích điểm)

**Endpoint:** `POST /api/v1/pos/checkout`

**Request:**
```json
{
    "khachHangId": 1,
    "nhanVienId": 1,
    "chiNhanhId": 1,
    "items": [...],
    "diemSuDung": 50.00,
    "giamGia": 5000.00,
    "phuongThucThanhToan": "CASH"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "maHoaDon": "HD-20251207120000",
        "thanhTien": 19500.00,
        "diemSuDung": 50.00,
        "diemTichLuy": 195.00,
        ...
    }
}
```

**Logic tự động:**
- ✅ Tính điểm tích lũy (1% của thanhTien)
- ✅ Trừ điểm đã sử dụng
- ✅ Cộng điểm mới vào tài khoản khách hàng

---

### 5.2. Cập Nhật Điểm Thủ Công (Admin)

**Endpoint:** `PATCH /api/v1/admin/customers/{id}/points?points=100`

**Mô tả:** Cộng thêm điểm cho khách hàng (không trừ)

**File:** `retail-application/src/main/java/com/retail/application/service/customer/CustomerServiceImpl.java`

```java
public void updatePoints(Long id, BigDecimal points) {
    KhachHang entity = khachHangRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));
    
    entity.setDiemTichLuy(entity.getDiemTichLuy().add(points));
    khachHangRepository.save(entity);
}
```

**Lưu ý:** Điểm được **cộng thêm**, không thay thế

---

### 5.3. Lấy Thông Tin Khách Hàng

**Endpoint:** `GET /api/v1/admin/customers/{id}`

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "tenKhachHang": "Nguyễn Văn A",
        "diemTichLuy": 250.00,
        ...
    }
}
```

---

## 6. Business Rules

### 6.1. Tính Điểm Tích Lũy
- ✅ **Tỷ lệ:** 1% của `thanhTien` (sau khi trừ giảm giá và điểm sử dụng)
- ✅ **Làm tròn:** 2 chữ số thập phân
- ✅ **Điều kiện:** Chỉ tích điểm khi có `khachHangId`

### 6.2. Sử Dụng Điểm
- ✅ **Tự do:** Khách hàng có thể sử dụng bao nhiêu điểm tùy ý (không có giới hạn)
- ✅ **Validation:** `diemSuDung >= 0` (không âm)
- ⚠️ **Lưu ý:** Hiện tại **KHÔNG có** validation kiểm tra `diemSuDung <= diemTichLuy` (có thể dùng quá số điểm hiện có)

### 6.3. Cập Nhật Điểm
- ✅ **Tự động:** Khi checkout thành công
- ✅ **Thủ công:** Admin có thể cộng điểm qua API
- ✅ **Transaction:** Tất cả trong `@Transactional` (đảm bảo data consistency)

---

## 7. Ví Dụ Tính Toán

### Ví dụ 1: Mua hàng không dùng điểm

**Đầu vào:**
- Tổng tiền: 100.000 VND
- Giảm giá: 10.000 VND
- Điểm sử dụng: 0

**Tính toán:**
```
thanhTien = 100.000 - 10.000 - 0 = 90.000 VND
diemTichLuy = 90.000 * 1% = 900 điểm
```

**Kết quả:**
- Khách hàng nhận: **+900 điểm**

---

### Ví dụ 2: Mua hàng có dùng điểm

**Đầu vào:**
- Điểm hiện tại: 500 điểm
- Tổng tiền: 100.000 VND
- Giảm giá: 10.000 VND
- Điểm sử dụng: 200 điểm

**Tính toán:**
```
thanhTien = 100.000 - 10.000 - 200 = 89.800 VND
diemTichLuy = 89.800 * 1% = 898 điểm
```

**Cập nhật điểm khách hàng:**
```
diemTichLuy_moi = 500 - 200 + 898 = 1.198 điểm
```

**Kết quả:**
- Trừ: -200 điểm
- Thêm: +898 điểm
- **Tổng còn lại: 1.198 điểm**

---

## 8. Code Implementation

### 8.1. Entity

**KhachHang:**
```java
@Column(name = "diem_tich_luy", precision = 10, scale = 2)
@Builder.Default
private BigDecimal diemTichLuy = BigDecimal.ZERO;
```

**HoaDon:**
```java
@Column(name = "diem_su_dung", precision = 10, scale = 2)
@Builder.Default
private BigDecimal diemSuDung = BigDecimal.ZERO;

@Column(name = "diem_tich_luy", precision = 10, scale = 2)
@Builder.Default
private BigDecimal diemTichLuy = BigDecimal.ZERO;
```

---

### 8.2. Service Logic

**File:** `retail-application/src/main/java/com/retail/application/service/pos/PosServiceImpl.java`

**Method:** `checkout(CheckoutRequest request)`

**Quy trình:**
1. Validate cart
2. Load entities (khachHang, nhanVien, chiNhanh)
3. Tạo hóa đơn
4. Tính tongTien từ items
5. Áp dụng khuyến mãi
6. Tính thanhTien = tongTien - giamGia - diemSuDung
7. **Tính diemTichLuy = thanhTien * 1%**
8. **Cập nhật điểm khách hàng:**
   - Trừ diemSuDung
   - Cộng diemTichLuy
9. Lưu hóa đơn

---

## 9. Validation & Edge Cases

### ✅ Đã xử lý:
- ✅ `thanhTien < 0` → Set về 0
- ✅ `diemSuDung = null` → Set về 0
- ✅ `khachHang = null` → Không cập nhật điểm (bán lẻ)

### ⚠️ Chưa có validation:
- ⚠️ **Kiểm tra đủ điểm:** Không có check `diemSuDung <= diemTichLuy` trước khi checkout
- ⚠️ **Giới hạn sử dụng:** Không có giới hạn tối đa điểm được dùng trong 1 hóa đơn

**Recommendation:** Có thể thêm validation này nếu cần:

```java
// Check điểm đủ trước khi checkout
if (request.getDiemSuDung() != null && khachHang != null) {
    if (khachHang.getDiemTichLuy().compareTo(request.getDiemSuDung()) < 0) {
        throw new BusinessException(ErrorCode.INSUFFICIENT_POINTS,
                "Không đủ điểm. Hiện có: " + khachHang.getDiemTichLuy());
    }
}
```

---

## 10. Test Cases

### Test 1: Tích điểm khi mua hàng
**File:** `retail-application/src/test/java/com/retail/application/service/pos/PosServiceImplTest.java`

```java
@Test
void checkout_ShouldUpdateCustomerPoints() {
    // Initial: 100 points
    // Earned: 200 points (1% of 20000)
    // Final: 300 points
}
```

### Test 2: Trừ và cộng điểm
```java
@Test
void checkout_WithPointsUsage_ShouldUpdateCustomerPoints() {
    // Initial: 100
    // Used: -50
    // Earned: +199.50 (1% of 19950)
    // Final: 249.50
}
```

---

## 11. API Summary

| Endpoint | Method | Mô Tả |
|----------|--------|-------|
| `/api/v1/pos/checkout` | POST | Checkout - Tự động tích điểm và cập nhật |
| `/api/v1/admin/customers/{id}` | GET | Lấy thông tin khách hàng (bao gồm điểm) |
| `/api/v1/admin/customers/{id}/points` | PATCH | Cộng điểm thủ công (Admin) |

---

## 12. Tóm Tắt

### ✅ Đã có:
1. ✅ Field `diemTichLuy` trong `KhachHang` entity
2. ✅ Field `diemSuDung` và `diemTichLuy` trong `HoaDon` entity
3. ✅ Logic tính điểm tích lũy (1% của thanhTien)
4. ✅ Logic cập nhật điểm khách hàng khi checkout
5. ✅ API checkout tự động tích điểm
6. ✅ API cập nhật điểm thủ công (Admin)

### ⚠️ Có thể cải thiện:
1. ⚠️ Thêm validation kiểm tra đủ điểm trước khi sử dụng
2. ⚠️ Thêm giới hạn tối đa điểm được dùng trong 1 hóa đơn
3. ⚠️ Thêm lịch sử giao dịch điểm (tích lũy, sử dụng)

---

## 13. Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│  Checkout Request                                   │
│  - khachHangId: 1                                   │
│  - diemSuDung: 50                                   │
│  - tongTien: 100.000                                │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Calculate thanhTien                                │
│  thanhTien = tongTien - giamGia - diemSuDung       │
│  = 100.000 - 0 - 50 = 99.950                        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Calculate diemTichLuy                              │
│  diemTichLuy = thanhTien * 1%                       │
│  = 99.950 * 0.01 = 999.50 điểm                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Update Customer Points                             │
│  khachHang.diemTichLuy -= diemSuDung (50)          │
│  khachHang.diemTichLuy += diemTichLuy (999.50)     │
│  Final: 500 - 50 + 999.50 = 1.449.50 điểm          │
└─────────────────────────────────────────────────────┘
```

---

**Ngày kiểm tra:** 2025-12-07
**Kết luận:** ✅ Logic tích điểm đã có đầy đủ và hoạt động tốt!

