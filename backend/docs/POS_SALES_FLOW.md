# 📊 Quy Trình Xử Lý POS Bán Hàng

## 📋 Tổng Quan

Hệ thống POS (Point of Sale) xử lý quy trình bán hàng từ quét sản phẩm đến thanh toán và tạo hóa đơn. Tài liệu này mô tả chi tiết flow xử lý.

---

## 🔄 Flow Bán Hàng Tổng Quan

```
1. Quét/Tìm Sản Phẩm → 2. Thêm vào Giỏ Hàng → 3. Validate Giỏ Hàng 
→ 4. Checkout (Thanh Toán) → 5. Tạo Hóa Đơn → 6. Cập Nhật Tồn Kho 
→ 7. Áp Dụng Khuyến Mãi → 8. Cập Nhật Điểm Khách Hàng → 9. Trả Về Hóa Đơn
```

---

## 📡 API Endpoints

### 1. Quét/Tìm Sản Phẩm

#### 1.1. Quét Barcode
```
GET /api/v1/pos/products/scan/{barcode}
Authorization: Bearer {token}
Role: CASHIER, MANAGER, ADMIN

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "maSanPham": "SP001",
    "barcode": "8934567890123",
    "tenSanPham": "Nước ngọt Coca Cola 330ml",
    "giaBan": 10000.00,
    "tonKho": 100,
    "hinhAnh": "/uploads/products/abc123.jpg",
    ...
  }
}
```

#### 1.2. Tìm Kiếm Sản Phẩm
```
GET /api/v1/pos/products/search?keyword=coca&page=0&size=20
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "content": [...],
    "page": 0,
    "size": 20,
    "totalElements": 5,
    "totalPages": 1
  },
  "pageInfo": {
    "page": 0,
    "size": 20,
    "totalElements": 5,
    "totalPages": 1
  }
}
```

#### 1.3. Lấy Danh Sách Sản Phẩm
```
GET /api/v1/pos/products?page=0&size=20
Authorization: Bearer {token}
```

---

### 2. Validate Giỏ Hàng

```
POST /api/v1/pos/checkout/validate
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "donGia": 10000.00,
      "ghiChu": "Optional note"
    }
  ]
}

Response:
{
  "success": true,
  "data": "Giỏ hàng hợp lệ"
}

Error Response (nếu không đủ tồn kho):
{
  "success": false,
  "error": "INSUFFICIENT_STOCK",
  "message": "Sản phẩm 'Nước ngọt Coca Cola 330ml' không đủ tồn kho. Còn lại: 1"
}
```

**Validation Rules:**
- ✅ Giỏ hàng không được trống
- ✅ Số lượng phải > 0
- ✅ Tồn kho phải đủ cho số lượng yêu cầu
- ✅ Sản phẩm phải tồn tại và ACTIVE

---

### 3. Checkout (Thanh Toán)

```
POST /api/v1/pos/checkout
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "khachHangId": 1,                    // Optional - null nếu bán lẻ không cần khách hàng
  "nhanVienId": 1,                     // Required - ID nhân viên bán hàng
  "chiNhanhId": 1,                     // Required - ID chi nhánh
  "items": [                           // Required - Danh sách sản phẩm
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "donGia": 10000.00,              // Optional - sẽ lấy từ database nếu null
      "ghiChu": "Optional note"
    },
    {
      "sanPhamId": 2,
      "soLuong": 1,
      "donGia": 20000.00
    }
  ],
  "giamGia": 5000.00,                  // Optional - Giảm giá thủ công
  "phuongThucThanhToan": "CASH",       // Required - CASH, CARD, MOMO, ZALOPAY, etc.
  "diemSuDung": 0,                     // Optional - Điểm khách hàng sử dụng
  "ghiChu": "Optional note"            // Optional
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "maHoaDon": "HD20251206133805",
    "khachHangId": 1,
    "tenKhachHang": "Nguyễn Văn A",
    "nhanVienId": 1,
    "tenNhanVien": "Nguyễn Văn B",
    "chiNhanhId": 1,
    "tenChiNhanh": "Chi nhánh Trung tâm",
    "ngayTao": "2025-12-06T13:38:05",
    "tongTien": 40000.00,               // Tổng tiền trước giảm giá
    "giamGia": 5000.00,                 // Tổng giảm giá (thủ công + khuyến mãi)
    "thanhTien": 35000.00,              // Số tiền cuối cùng phải trả
    "phuongThucThanhToan": "CASH",
    "diemSuDung": 0,
    "diemTichLuy": 350.00,              // Điểm tích lũy (1% của thanhTien)
    "ghiChu": "Optional note",
    "trangThai": "COMPLETED",
    "chiTietHoaDons": [
      {
        "id": 1,
        "sanPhamId": 1,
        "tenSanPham": "Nước ngọt Coca Cola 330ml",
        "maSanPham": "SP001",
        "soLuong": 2,
        "donGia": 10000.00,
        "thanhTien": 20000.00,
        "ghiChu": "Optional note"
      },
      {
        "id": 2,
        "sanPhamId": 2,
        "tenSanPham": "Bánh mì thịt nướng",
        "maSanPham": "SP002",
        "soLuong": 1,
        "donGia": 20000.00,
        "thanhTien": 20000.00
      }
    ]
  }
}
```

---

## ⚙️ Xử Lý Chi Tiết (Backend)

### Bước 1: Validate Giỏ Hàng
```java
// File: PosServiceImpl.validateCart()
- Kiểm tra giỏ hàng không trống
- Với mỗi item:
  - Kiểm tra sản phẩm tồn tại
  - Kiểm tra tồn kho >= số lượng yêu cầu
  - Kiểm tra số lượng > 0
```

### Bước 2: Load Entities
```java
// File: PosServiceImpl.checkout()
- Load NhanVien (nhân viên bán hàng)
- Load ChiNhanh (chi nhánh)
- Load KhachHang (nếu có khachHangId)
```

### Bước 3: Tạo Hóa Đơn
```java
HoaDon hoaDon = HoaDon.builder()
    .maHoaDon("HD20251206133805")  // Auto-generated
    .khachHang(khachHang)
    .nhanVien(nhanVien)
    .chiNhanh(chiNhanh)
    .ngayTao(LocalDateTime.now())
    .giamGia(5000.00)              // Giảm giá thủ công
    .diemSuDung(0)                  // Điểm sử dụng
    .phuongThucThanhToan("CASH")
    .trangThai(Status.COMPLETED)
    .build();
```

### Bước 4: Xử Lý Từng Sản Phẩm
```java
for (CartItemDTO item : request.getItems()) {
    // 1. Load sản phẩm
    SanPham sanPham = sanPhamRepository.findById(item.getSanPhamId());
    
    // 2. Tạo chi tiết hóa đơn
    ChiTietHoaDon chiTiet = ChiTietHoaDon.builder()
        .sanPham(sanPham)
        .soLuong(item.getSoLuong())
        .donGia(sanPham.getGiaBan())  // Lấy giá từ database
        .build();
    
    // 3. Tính thành tiền = số lượng × đơn giá
    chiTiet.calculateThanhTien();
    
    // 4. Thêm vào hóa đơn
    hoaDon.addChiTiet(chiTiet);
    
    // 5. Cộng vào tổng tiền
    tongTien += chiTiet.getThanhTien();
    
    // 6. ⭐ CẬP NHẬT TỒN KHO (giảm số lượng)
    sanPham.setTonKho(sanPham.getTonKho() - item.getSoLuong());
    sanPhamRepository.save(sanPham);
}
```

### Bước 5: Áp Dụng Khuyến Mãi
```java
// Tự động tính khuyến mãi dựa trên:
// - Chi nhánh
// - Danh sách sản phẩm
// - Tổng tiền

BigDecimal promotionDiscount = promotionService.calculateDiscount(
    request.getChiNhanhId(), 
    request.getItems(), 
    tongTien
);

// Tổng giảm giá = giảm giá thủ công + giảm giá từ khuyến mãi
BigDecimal totalDiscount = hoaDon.getGiamGia().add(promotionDiscount);
hoaDon.setGiamGia(totalDiscount);
```

### Bước 6: Tính Số Tiền Cuối Cùng
```java
// thanhTien = tongTien - giamGia - diemSuDung
BigDecimal thanhTien = tongTien
    .subtract(hoaDon.getGiamGia())      // Trừ giảm giá
    .subtract(hoaDon.getDiemSuDung());   // Trừ điểm sử dụng

// Đảm bảo không âm
if (thanhTien < 0) {
    thanhTien = BigDecimal.ZERO;
}
```

### Bước 7: Tính Điểm Tích Lũy
```java
// Điểm tích lũy = 1% của số tiền thanh toán
BigDecimal diemTichLuy = thanhTien
    .multiply(BigDecimal.valueOf(0.01))
    .setScale(2, RoundingMode.HALF_UP);
```

### Bước 8: Cập Nhật Điểm Khách Hàng
```java
if (khachHang != null) {
    // Trừ điểm đã sử dụng
    if (diemSuDung > 0) {
        khachHang.setDiemTichLuy(
            khachHang.getDiemTichLuy() - diemSuDung
        );
    }
    
    // Thêm điểm mới
    khachHang.setDiemTichLuy(
        khachHang.getDiemTichLuy() + diemTichLuy
    );
    
    khachHangRepository.save(khachHang);
}
```

### Bước 9: Lưu Hóa Đơn
```java
HoaDon savedInvoice = hoaDonRepository.save(hoaDon);
// Cache được xóa tự động (@CacheEvict)
return invoiceMapper.toDto(savedInvoice);
```

---

## 📊 DTOs Sử Dụng

### CheckoutRequest
```json
{
  "khachHangId": 1,              // Optional
  "nhanVienId": 1,               // Required
  "chiNhanhId": 1,               // Required
  "items": [                     // Required, not empty
    {
      "sanPhamId": 1,            // Required
      "soLuong": 2,              // Required, > 0
      "donGia": 10000.00,        // Optional (lấy từ DB nếu null)
      "ghiChu": "Optional"
    }
  ],
  "giamGia": 5000.00,            // Optional, >= 0
  "phuongThucThanhToan": "CASH", // Required
  "diemSuDung": 0,               // Optional, >= 0
  "ghiChu": "Optional"
}
```

### CartItemDTO
```json
{
  "sanPhamId": 1,                // Required
  "soLuong": 2,                  // Required, > 0
  "donGia": 10000.00,            // Optional (lấy từ DB)
  "ghiChu": "Optional"
}
```

### InvoiceDTO (Response)
```json
{
  "id": 1,
  "maHoaDon": "HD20251206133805",
  "khachHangId": 1,
  "tenKhachHang": "Nguyễn Văn A",
  "nhanVienId": 1,
  "tenNhanVien": "Nguyễn Văn B",
  "chiNhanhId": 1,
  "tenChiNhanh": "Chi nhánh Trung tâm",
  "ngayTao": "2025-12-06T13:38:05",
  "tongTien": 40000.00,          // Tổng tiền trước giảm giá
  "giamGia": 5000.00,             // Tổng giảm giá (thủ công + khuyến mãi)
  "thanhTien": 35000.00,          // Số tiền cuối cùng
  "phuongThucThanhToan": "CASH",
  "diemSuDung": 0,
  "diemTichLuy": 350.00,          // 1% của thanhTien
  "ghiChu": "Optional",
  "trangThai": "COMPLETED",
  "chiTietHoaDons": [...]
}
```

---

## 🔐 Business Rules

### 1. Validation Rules
- ✅ Giỏ hàng không được trống
- ✅ Số lượng phải > 0
- ✅ Tồn kho phải đủ
- ✅ Sản phẩm phải ACTIVE
- ✅ Nhân viên và chi nhánh phải tồn tại

### 2. Tính Toán
- **Tổng tiền** = Σ (số lượng × đơn giá) của tất cả sản phẩm
- **Giảm giá** = Giảm giá thủ công + Giảm giá từ khuyến mãi tự động
- **Thành tiền** = Tổng tiền - Giảm giá - Điểm sử dụng (≥ 0)
- **Điểm tích lũy** = 1% của thành tiền (làm tròn 2 chữ số)

### 3. Cập Nhật Dữ Liệu
- ✅ **Tồn kho**: Giảm số lượng đã bán
- ✅ **Điểm khách hàng**: 
  - Trừ điểm đã sử dụng
  - Cộng điểm tích lũy mới
- ✅ **Hóa đơn**: Tạo mới với status COMPLETED

### 4. Khuyến Mãi Tự Động
- Hệ thống tự động tìm và áp dụng khuyến mãi phù hợp
- Dựa trên: Chi nhánh, Sản phẩm, Tổng tiền
- Giảm giá từ khuyến mãi được cộng vào tổng giảm giá

---

## 💳 Phương Thức Thanh Toán

### Các Phương Thức Hỗ Trợ:
- `CASH` - Tiền mặt
- `CARD` - Thẻ tín dụng/ghi nợ
- `MOMO` - Ví MoMo
- `ZALOPAY` - Ví ZaloPay
- `BANK_TRANSFER` - Chuyển khoản ngân hàng
- `OTHER` - Khác

---

## 🎁 Khuyến Mãi

### Các Loại Khuyến Mãi:
1. **Giảm giá theo %** - Giảm X% trên tổng tiền
2. **Giảm giá cố định** - Giảm X VNĐ
3. **Mua X tặng Y** - Mua X sản phẩm, tặng Y sản phẩm
4. **Giảm giá theo sản phẩm** - Giảm giá cho sản phẩm cụ thể

Khuyến mãi được tính tự động trong quá trình checkout.

---

## 📝 Ví Dụ Flow Hoàn Chỉnh

### Scenario: Bán 2 chai Coca Cola và 1 bánh mì

#### 1. Quét Barcode Coca Cola
```http
GET /api/v1/pos/products/scan/8934567890123
→ Trả về: ProductDTO (id: 1, giaBan: 10000, tonKho: 100)
```

#### 2. Thêm vào Giỏ Hàng (Frontend)
```javascript
cartItems = [
  { sanPhamId: 1, soLuong: 2, donGia: 10000 }
]
```

#### 3. Quét/Tìm Bánh Mì
```http
GET /api/v1/pos/products/search?keyword=bánh mì
→ Trả về: ProductDTO (id: 2, giaBan: 20000, tonKho: 50)
```

#### 4. Thêm Bánh Mì vào Giỏ
```javascript
cartItems = [
  { sanPhamId: 1, soLuong: 2, donGia: 10000 },
  { sanPhamId: 2, soLuong: 1, donGia: 20000 }
]
```

#### 5. Validate Giỏ Hàng
```http
POST /api/v1/pos/checkout/validate
Body: { items: cartItems }
→ Response: "Giỏ hàng hợp lệ"
```

#### 6. Checkout
```http
POST /api/v1/pos/checkout
Body: {
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "khachHangId": 1,
  "items": cartItems,
  "giamGia": 5000,
  "phuongThucThanhToan": "CASH"
}
```

#### 7. Backend Xử Lý:
```
1. Validate cart ✅
2. Load entities ✅
3. Tạo hóa đơn ✅
4. Xử lý từng sản phẩm:
   - Coca Cola: 2 × 10000 = 20000
     → Cập nhật tồn kho: 100 - 2 = 98
   - Bánh mì: 1 × 20000 = 20000
     → Cập nhật tồn kho: 50 - 1 = 49
5. Tổng tiền = 40000
6. Áp dụng khuyến mãi (ví dụ: -2000)
7. Tổng giảm giá = 5000 + 2000 = 7000
8. Thành tiền = 40000 - 7000 = 33000
9. Điểm tích lũy = 33000 × 1% = 330
10. Cập nhật điểm khách hàng
11. Lưu hóa đơn
```

#### 8. Response:
```json
{
  "success": true,
  "data": {
    "maHoaDon": "HD20251206133805",
    "tongTien": 40000.00,
    "giamGia": 7000.00,
    "thanhTien": 33000.00,
    "diemTichLuy": 330.00,
    "chiTietHoaDons": [...]
  }
}
```

---

## 🔍 Lấy Thông Tin Hóa Đơn

### Lấy Hóa Đơn Theo ID
```
GET /api/v1/pos/invoices/{id}
Authorization: Bearer {token}

Response: InvoiceDTO (có cache Redis)
```

### Lấy Hóa Đơn Theo Ngày
```
GET /api/v1/pos/invoices/by-date?date=2025-12-06
Authorization: Bearer {token}

Response: List<InvoiceDTO> (có cache Redis)
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Transaction
- Toàn bộ quá trình checkout được wrap trong `@Transactional`
- Nếu có lỗi, tất cả thay đổi sẽ được rollback
- Đảm bảo tính nhất quán dữ liệu

### 2. Cache
- Hóa đơn được cache trong Redis (TTL: 10 phút)
- Cache tự động xóa khi tạo hóa đơn mới
- Giúp tăng tốc độ truy vấn

### 3. Tồn Kho
- Tồn kho được cập nhật ngay khi checkout
- Không có cơ chế "reserve" - ai checkout trước sẽ được
- Nếu 2 người cùng checkout sản phẩm cuối cùng, người checkout sau sẽ lỗi

### 4. Điểm Khách Hàng
- Chỉ cập nhật nếu có `khachHangId`
- Điểm sử dụng không được vượt quá điểm hiện có
- Điểm tích lũy = 1% của thành tiền

### 5. Khuyến Mãi
- Tự động áp dụng, không cần nhập mã
- Có thể có nhiều khuyến mãi cùng lúc
- Giảm giá từ khuyến mãi được cộng vào tổng giảm giá

---

## 🧪 Testing Checklist

- [ ] Quét sản phẩm bằng barcode
- [ ] Tìm kiếm sản phẩm
- [ ] Validate giỏ hàng trống → Error
- [ ] Validate giỏ hàng không đủ tồn kho → Error
- [ ] Checkout thành công với khách hàng
- [ ] Checkout thành công không có khách hàng
- [ ] Checkout với giảm giá thủ công
- [ ] Checkout với điểm sử dụng
- [ ] Checkout với khuyến mãi tự động
- [ ] Kiểm tra tồn kho đã giảm đúng
- [ ] Kiểm tra điểm khách hàng đã cập nhật
- [ ] Kiểm tra hóa đơn đã được tạo
- [ ] Lấy hóa đơn theo ID
- [ ] Lấy hóa đơn theo ngày

---

## 📚 Tài Liệu Liên Quan

- [FRONTEND_API_REFERENCE.md](./FRONTEND_API_REFERENCE.md) - Tài liệu API đầy đủ
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Swagger documentation

---

**Chúc bạn tích hợp thành công! 🚀**

