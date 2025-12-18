# 📋 CheckoutRequest - Các Field Cần Gửi

## ❌ Lỗi Validation Hiện Tại

Frontend đang thiếu các field **BẮT BUỘC** sau:
1. `chiNhanhId` - null
2. `nhanVienId` - null  
3. `items[0].donGia` - null
4. `phuongThucThanhToan` - null

---

## ✅ Request Body Đúng

### Endpoint: `POST /api/v1/pos/checkout/validate` hoặc `POST /api/v1/pos/checkout`

```json
{
  "khachHangId": 1,                    // ⚠️ OPTIONAL - null nếu bán lẻ không cần khách hàng
  "nhanVienId": 1,                     // ✅ REQUIRED - ID nhân viên bán hàng (lấy từ user đang login)
  "chiNhanhId": 1,                     // ✅ REQUIRED - ID chi nhánh (lấy từ user hoặc chọn)
  "items": [                           // ✅ REQUIRED - Danh sách sản phẩm (không được trống)
    {
      "sanPhamId": 1,                  // ✅ REQUIRED - ID sản phẩm
      "soLuong": 2,                    // ✅ REQUIRED - Số lượng (phải > 0)
      "donGia": 10000.00,              // ✅ REQUIRED - Đơn giá (phải > 0)
      "ghiChu": "Optional note"        // ⚠️ OPTIONAL
    }
  ],
  "giamGia": 5000.00,                  // ⚠️ OPTIONAL - Giảm giá thủ công (>= 0)
  "phuongThucThanhToan": "CASH",       // ✅ REQUIRED - Phương thức thanh toán
  "diemSuDung": 0,                     // ⚠️ OPTIONAL - Điểm khách hàng sử dụng (>= 0)
  "ghiChu": "Optional note"            // ⚠️ OPTIONAL
}
```

---

## 📝 Chi Tiết Từng Field

### 1. `nhanVienId` (Required)
- **Type:** `Long`
- **Nguồn:** Lấy từ user đang login
- **Cách lấy:**
  ```javascript
  // Sau khi login, lưu user info
  const user = {
    id: 1,              // ← Dùng cái này
    username: "admin",
    role: "CASHIER",
    ...
  };
  
  // Khi checkout
  checkoutRequest.nhanVienId = user.id;
  ```

### 2. `chiNhanhId` (Required)
- **Type:** `Long`
- **Nguồn:** 
  - Lấy từ user info (nếu user có `chiNhanhId`)
  - Hoặc chọn từ danh sách chi nhánh
- **Cách lấy:**
  ```javascript
  // Từ user info sau login
  const user = {
    id: 1,
    chiNhanhId: 1,      // ← Dùng cái này
    tenChiNhanh: "Chi nhánh Trung tâm",
    ...
  };
  
  checkoutRequest.chiNhanhId = user.chiNhanhId;
  ```

### 3. `items[].donGia` (Required)
- **Type:** `BigDecimal` (số thập phân)
- **Nguồn:** Lấy từ `ProductDTO.giaBan` khi load sản phẩm
- **Cách lấy:**
  ```javascript
  // Khi thêm sản phẩm vào giỏ hàng
  const product = {
    id: 1,
    giaBan: 10000.00,   // ← Dùng cái này
    tenSanPham: "Coca Cola",
    ...
  };
  
  const cartItem = {
    sanPhamId: product.id,
    soLuong: 2,
    donGia: product.giaBan,  // ← Lấy từ product
    ghiChu: null
  };
  ```

### 4. `phuongThucThanhToan` (Required)
- **Type:** `String`
- **Giá trị:** `"CASH"`, `"CARD"`, `"MOMO"`, `"ZALOPAY"`, `"BANK_TRANSFER"`, `"OTHER"`
- **Cách set:**
  ```javascript
  // User chọn phương thức thanh toán
  checkoutRequest.phuongThucThanhToan = "CASH";  // hoặc "CARD", "MOMO", etc.
  ```

---

## 🔄 Workflow Frontend

### Bước 1: Load User Info (Sau Login)
```javascript
// Sau khi login thành công
const loginResponse = await fetch('/api/v1/auth/login', {...});
const user = loginResponse.data;

// Lưu vào state/store
setCurrentUser({
  id: user.id,                    // ← nhanVienId
  chiNhanhId: user.chiNhanhId,    // ← chiNhanhId
  ...
});
```

### Bước 2: Thêm Sản Phẩm Vào Giỏ Hàng
```javascript
// Khi quét/tìm sản phẩm
const product = await fetch(`/api/v1/pos/products/scan/${barcode}`);

// Thêm vào giỏ hàng
const cartItem = {
  sanPhamId: product.id,
  soLuong: 1,
  donGia: product.giaBan,  // ← QUAN TRỌNG: Lấy từ product
  ghiChu: null
};

cart.push(cartItem);
```

### Bước 3: Validate Giỏ Hàng
```javascript
const checkoutRequest = {
  khachHangId: selectedCustomer?.id || null,  // Optional
  nhanVienId: currentUser.id,                 // ← Từ user đang login
  chiNhanhId: currentUser.chiNhanhId,        // ← Từ user đang login
  items: cart.map(item => ({
    sanPhamId: item.sanPhamId,
    soLuong: item.soLuong,
    donGia: item.donGia,                      // ← Phải có
    ghiChu: item.ghiChu || null
  })),
  giamGia: discount || 0,                     // Optional
  phuongThucThanhToan: selectedPaymentMethod, // ← User chọn: "CASH", "CARD", etc.
  diemSuDung: pointsUsed || 0,                // Optional
  ghiChu: note || null                        // Optional
};

// Validate
await fetch('/api/v1/pos/checkout/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(checkoutRequest)
});
```

### Bước 4: Checkout
```javascript
// Nếu validate thành công, checkout
const invoice = await fetch('/api/v1/pos/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(checkoutRequest)  // ← Cùng request body
});
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. `donGia` trong CartItemDTO
- **Backend sẽ lấy giá từ database** nếu bạn không gửi
- **NHƯNG** validation yêu cầu phải có `donGia` trong request
- **Giải pháp:** Luôn gửi `donGia` từ `product.giaBan` khi thêm vào giỏ hàng

### 2. `nhanVienId` và `chiNhanhId`
- **Lấy từ user đang login** (sau khi gọi `/api/v1/auth/login`)
- Response từ login có:
  ```json
  {
    "id": 1,                    // ← nhanVienId
    "chiNhanhId": 1,            // ← chiNhanhId
    "tenChiNhanh": "...",
    ...
  }
  ```

### 3. `phuongThucThanhToan`
- **User phải chọn** trước khi checkout
- Các giá trị hợp lệ:
  - `"CASH"` - Tiền mặt
  - `"CARD"` - Thẻ
  - `"MOMO"` - Ví MoMo
  - `"ZALOPAY"` - Ví ZaloPay
  - `"BANK_TRANSFER"` - Chuyển khoản
  - `"OTHER"` - Khác

---

## 📋 Checklist Frontend

- [ ] Lưu `user.id` và `user.chiNhanhId` sau khi login
- [ ] Khi thêm sản phẩm vào giỏ, lưu `product.giaBan` vào `cartItem.donGia`
- [ ] User chọn phương thức thanh toán trước khi checkout
- [ ] Gửi đầy đủ các field required trong `CheckoutRequest`
- [ ] Validate giỏ hàng trước khi checkout

---

## 🔍 Ví Dụ Request Body Hoàn Chỉnh

```json
{
  "khachHangId": null,
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "donGia": 10000.00,
      "ghiChu": null
    },
    {
      "sanPhamId": 2,
      "soLuong": 1,
      "donGia": 20000.00,
      "ghiChu": null
    }
  ],
  "giamGia": 5000.00,
  "phuongThucThanhToan": "CASH",
  "diemSuDung": 0,
  "ghiChu": null
}
```

---

**Tài liệu liên quan:**
- [POS_SALES_FLOW.md](./POS_SALES_FLOW.md) - Quy trình POS bán hàng
- [FRONTEND_API_REFERENCE.md](./FRONTEND_API_REFERENCE.md) - Tài liệu API đầy đủ

