# 🎁 HƯỚNG DẪN PROMOTION MANAGEMENT

**Ngày tạo:** 2025-11-30  
**Mục đích:** Hướng dẫn sử dụng hệ thống quản lý khuyến mãi

---

## ✅ CÁC THÀNH PHẦN ĐÃ TẠO

### 1. **PromotionType Enum**
   - File: `retail-common/src/main/java/com/retail/common/constant/PromotionType.java`
   - Các loại: PERCENTAGE, FIXED_AMOUNT, BOGO, BUNDLE, BUY_X_GET_Y, FREE_SHIPPING

### 2. **KhuyenMai Entity**
   - File: `retail-domain/src/main/java/com/retail/domain/entity/KhuyenMai.java`
   - Entity quản lý các chương trình khuyến mãi

### 3. **ChiTietKhuyenMai Entity**
   - File: `retail-domain/src/main/java/com/retail/domain/entity/ChiTietKhuyenMai.java`
   - Liên kết khuyến mãi với sản phẩm

### 4. **PromotionService & PromotionServiceImpl**
   - Files:
     - `retail-application/src/main/java/com/retail/application/service/promotion/PromotionService.java`
     - `retail-application/src/main/java/com/retail/application/service/promotion/PromotionServiceImpl.java`
   - Service quản lý và áp dụng promotions

### 5. **PromotionController** (Admin)
   - File: `retail-admin-api/src/main/java/com/retail/admin/controller/PromotionController.java`
   - REST API endpoints cho quản trị promotions

### 6. **PromotionPosController** (POS)
   - File: `retail-pos-api/src/main/java/com/retail/pos/controller/PromotionPosController.java`
   - REST API endpoints cho POS để xem và tính toán promotions

### 7. **Migration**
   - File: `retail-migrations/src/main/resources/db/migration/V6__create_promotion_tables.sql`
   - Tạo bảng `khuyen_mai` và `chi_tiet_khuyen_mai`

---

## 🚀 CÁC LOẠI KHUYẾN MÃI

### **1. PERCENTAGE - Giảm giá theo phần trăm**

**Ví dụ:** Giảm 10%, 20%, 50%

**Cấu hình:**
- `giaTriKhuyenMai`: 10 (tức là 10%)
- `giaTriToiThieu`: Số tiền tối thiểu để áp dụng (optional)
- `giamToiDa`: Số tiền giảm tối đa (optional)

**Cách tính:**
```
Discount = (Total × Percentage / 100)
Nếu có giamToiDa: Discount = MIN(Discount, giamToiDa)
```

---

### **2. FIXED_AMOUNT - Giảm giá cố định**

**Ví dụ:** Giảm 50.000đ, 100.000đ

**Cấu hình:**
- `giaTriKhuyenMai`: 50000 (số tiền giảm)
- `giaTriToiThieu`: Số tiền tối thiểu (optional)

**Cách tính:**
```
Discount = giaTriKhuyenMai
Nếu Total < Discount: Discount = Total
```

---

### **3. BOGO - Buy One Get One (Mua 1 tặng 1)**

**Ví dụ:** Mua 1 sản phẩm được tặng 1 sản phẩm (rẻ nhất)

**Cấu hình:**
- Áp dụng cho các sản phẩm được chỉ định trong `chiTietKhuyenMai`
- Không cần `giaTriKhuyenMai`

**Cách tính:**
```
Với mỗi 2 sản phẩm mua: tặng 1 sản phẩm (giá rẻ nhất)
Discount = (Số lượng mua / 2) × Giá sản phẩm
```

---

### **4. BUNDLE - Combo sản phẩm**

**Ví dụ:** Combo 3 sản phẩm với giá đặc biệt

**Cấu hình:**
- `giaTriKhuyenMai`: Giá combo
- Các sản phẩm trong combo được liệt kê trong `chiTietKhuyenMai`

**Cách tính:**
```
Original Total = Tổng giá các sản phẩm trong combo
Discount = Original Total - giaTriKhuyenMai
```

---

### **5. BUY_X_GET_Y - Mua X tặng Y**

**Ví dụ:** Mua 2 tặng 1, Mua 3 tặng 2

**Cấu hình:**
- `soLuongMua`: X (số lượng cần mua)
- `soLuongTang`: Y (số lượng được tặng)
- `giaTriKhuyenMai`: không cần (tính tự động)

**Cách tính:**
```
Với mỗi X sản phẩm mua: tặng Y sản phẩm
Discount = (Số lượng mua / X) × Y × Giá sản phẩm
```

---

## 📋 API ENDPOINTS

### **Admin Endpoints** (Quản lý promotions)

#### **1. Tạo khuyến mãi**
```http
POST /api/v1/admin/promotions
Authorization: Bearer {token}
Content-Type: application/json

{
  "maKhuyenMai": "KM_BLACKFRIDAY_2025",
  "tenKhuyenMai": "Black Friday 2025",
  "moTa": "Giảm giá 50% cho tất cả sản phẩm",
  "loaiKhuyenMai": "PERCENTAGE",
  "chiNhanhId": 1,  // null = áp dụng cho tất cả chi nhánh
  "ngayBatDau": "2025-11-25T00:00:00",
  "ngayKetThuc": "2025-11-30T23:59:59",
  "giaTriKhuyenMai": 50,  // 50%
  "giaTriToiThieu": 100000,  // Áp dụng cho đơn hàng từ 100k
  "giamToiDa": 500000,  // Giảm tối đa 500k
  "tongSoLanSuDungToiDa": 1000,  // Tối đa 1000 lượt sử dụng
  "sanPhamIds": [1, 2, 3]  // null = áp dụng cho tất cả sản phẩm
}
```

#### **2. Lấy tất cả khuyến mãi**
```http
GET /api/v1/admin/promotions
Authorization: Bearer {token}
```

#### **3. Lấy khuyến mãi theo ID**
```http
GET /api/v1/admin/promotions/{id}
Authorization: Bearer {token}
```

#### **4. Lấy khuyến mãi theo mã**
```http
GET /api/v1/admin/promotions/code/{code}
Authorization: Bearer {token}
```

#### **5. Cập nhật khuyến mãi**
```http
PUT /api/v1/admin/promotions/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  // Same structure as create
}
```

#### **6. Kích hoạt/Vô hiệu hóa**
```http
POST /api/v1/admin/promotions/{id}/activate
POST /api/v1/admin/promotions/{id}/deactivate
Authorization: Bearer {token}
```

#### **7. Xóa khuyến mãi**
```http
DELETE /api/v1/admin/promotions/{id}
Authorization: Bearer {token}
```

---

### **POS Endpoints** (Sử dụng trong checkout)

#### **1. Lấy danh sách khuyến mãi active cho chi nhánh**
```http
GET /api/v1/pos/promotions/branch/{branchId}/active
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "maKhuyenMai": "KM_BLACKFRIDAY_2025",
      "tenKhuyenMai": "Black Friday 2025",
      "loaiKhuyenMai": "PERCENTAGE",
      "giaTriKhuyenMai": 50,
      "isActive": true,
      "ngayBatDau": "2025-11-25T00:00:00",
      "ngayKetThuc": "2025-11-30T23:59:59"
    }
  ]
}
```

#### **2. Tính toán discount từ promotions**
```http
POST /api/v1/pos/promotions/calculate-discount?chiNhanhId=1&totalAmount=200000
Authorization: Bearer {token}
Content-Type: application/json

[
  {
    "sanPhamId": 1,
    "soLuong": 2,
    "donGia": 100000
  }
]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDiscount": 100000,
    "appliedPromotions": {
      "1": {
        "promotionId": 1,
        "maKhuyenMai": "KM_BLACKFRIDAY_2025",
        "tenKhuyenMai": "Black Friday 2025",
        "loaiKhuyenMai": "PERCENTAGE",
        "discountAmount": 100000,
        "description": "Giảm 50% - Tiết kiệm 100000 VNĐ"
      }
    },
    "finalAmount": 100000
  }
}
```

---

## 🔄 TÍCH HỢP VÀO CHECKOUT

**Promotions được tự động áp dụng khi checkout!**

Khi gọi `POST /api/v1/pos/checkout`, hệ thống sẽ:
1. ✅ Tự động tìm các promotions active cho chi nhánh
2. ✅ Tự động áp dụng promotions phù hợp với giỏ hàng
3. ✅ Tính toán discount từ promotions
4. ✅ Cộng với manual discount (nếu có)
5. ✅ Áp dụng vào hóa đơn

**Flow:**
```
1. Checkout Request → Calculate cart total
2. Auto-apply promotions → Calculate promotion discount
3. Total Discount = Manual Discount + Promotion Discount
4. Final Amount = Total - Total Discount - Points Used
5. Create Invoice
```

**Ví dụ:**
```json
// Checkout Request
{
  "chiNhanhId": 1,
  "items": [...],
  "giamGia": 0  // Manual discount = 0, promotions sẽ tự động apply
}

// System sẽ tự động:
// - Tìm promotions active cho branch 1
// - Apply promotions cho items
// - Tính promotion discount (ví dụ: 100.000đ)
// - Total discount = 0 + 100.000đ = 100.000đ
```

---

## 📝 VÍ DỤ TẠO KHUYẾN MÃI

### **Ví dụ 1: Giảm 20% cho đơn hàng từ 500k**

```json
POST /api/v1/admin/promotions

{
  "maKhuyenMai": "KM_GIAM20",
  "tenKhuyenMai": "Giảm 20% cho đơn hàng từ 500k",
  "loaiKhuyenMai": "PERCENTAGE",
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "giaTriKhuyenMai": 20,
  "giaTriToiThieu": 500000,
  "giamToiDa": 200000
}
```

### **Ví dụ 2: Mua 1 tặng 1 cho sản phẩm cụ thể**

```json
POST /api/v1/admin/promotions

{
  "maKhuyenMai": "KM_BOGO_SP1",
  "tenKhuyenMai": "Mua 1 tặng 1 - Sản phẩm A",
  "loaiKhuyenMai": "BOGO",
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "sanPhamIds": [1, 2, 3]  // Chỉ áp dụng cho sản phẩm 1, 2, 3
}
```

### **Ví dụ 3: Combo 3 sản phẩm giá 500k (giá gốc 700k)**

```json
POST /api/v1/admin/promotions

{
  "maKhuyenMai": "KM_COMBO_3SP",
  "tenKhuyenMai": "Combo 3 sản phẩm - Giá đặc biệt",
  "loaiKhuyenMai": "BUNDLE",
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "giaTriKhuyenMai": 500000,  // Giá combo
  "sanPhamIds": [1, 2, 3]  // 3 sản phẩm trong combo
}
```

### **Ví dụ 4: Mua 2 tặng 1**

```json
POST /api/v1/admin/promotions

{
  "maKhuyenMai": "KM_MUA2_TANG1",
  "tenKhuyenMai": "Mua 2 tặng 1",
  "loaiKhuyenMai": "BUY_X_GET_Y",
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "soLuongMua": 2,
  "soLuongTang": 1,
  "sanPhamIds": [1, 2, 3]
}
```

---

## ⚙️ CÁC TÍNH NĂNG

### **1. Time-bound Promotions**
- ✅ Hỗ trợ `ngayBatDau` và `ngayKetThuc`
- ✅ Tự động kích hoạt/vô hiệu hóa theo thời gian
- ✅ Chỉ áp dụng trong khoảng thời gian được chỉ định

### **2. Branch-specific Promotions**
- ✅ Có thể áp dụng cho chi nhánh cụ thể
- ✅ `chiNhanhId = null` = áp dụng cho tất cả chi nhánh

### **3. Product-specific Promotions**
- ✅ Có thể áp dụng cho sản phẩm cụ thể
- ✅ `sanPhamIds = null/empty` = áp dụng cho tất cả sản phẩm

### **4. Usage Limits**
- ✅ `soLanSuDungToiDa`: Số lần mỗi khách hàng có thể dùng
- ✅ `tongSoLanSuDungToiDa`: Tổng số lần tất cả khách hàng có thể dùng
- ✅ Tự động theo dõi số lần đã sử dụng

### **5. Minimum Purchase Requirements**
- ✅ `giaTriToiThieu`: Số tiền tối thiểu để áp dụng
- ✅ `giamToiDa`: Số tiền giảm tối đa (cho percentage)

### **6. Auto-apply in Checkout**
- ✅ Tự động tìm và áp dụng promotions khi checkout
- ✅ Không cần chọn manual

---

## 🔐 BẢO MẬT

- **Admin endpoints:** Chỉ ADMIN và MANAGER
- **POS endpoints:** CASHIER, MANAGER, ADMIN
- Tất cả endpoints yêu cầu JWT authentication

---

## 📊 DATABASE

Promotions được lưu trong:
- `khuyen_mai` - Thông tin promotions
- `chi_tiet_khuyen_mai` - Liên kết promotion với sản phẩm

Indexes:
- `idx_ma_khuyen_mai` - Tìm nhanh theo mã
- `idx_ngay_bat_dau`, `idx_ngay_ket_thuc` - Filter theo thời gian
- `idx_trang_thai` - Filter theo status

---

## ⚠️ LƯU Ý

1. **Auto-apply**: Promotions tự động áp dụng khi checkout, không cần chọn manual
2. **Multiple promotions**: Có thể có nhiều promotions cùng áp dụng (cộng dồn)
3. **Priority**: Nếu có conflict, promotion nào có discount lớn hơn sẽ được ưu tiên
4. **Cache**: Promotions được cache để tăng performance
5. **Usage tracking**: Số lần sử dụng được tự động tăng khi apply

---

## 🧪 TEST

1. **Tạo promotion:**
   ```http
   POST /api/v1/admin/promotions
   ```

2. **Xem active promotions:**
   ```http
   GET /api/v1/pos/promotions/branch/1/active
   ```

3. **Checkout và kiểm tra discount:**
   ```http
   POST /api/v1/pos/checkout
   ```
   - Kiểm tra `giamGia` trong invoice response
   - Nên có discount từ promotions

---

**Hoàn thành! Promotion Management đã sẵn sàng. 🎉**

