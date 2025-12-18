# 🔐 VNPAY CONFIGURATION

**Ngày cập nhật:** 2025-12-11  
**Môi trường:** TEST (Sandbox)

---

## 📋 THÔNG TIN CẤU HÌNH

### Terminal ID / Mã Website
```
vnp_TmnCode: X8VWWPJ2
```

### Secret Key / Chuỗi bí mật tạo checksum
```
vnp_HashSecret: UL37T5AM49OJ8KAIREZZJMD3YUD0XUN6
```

### URL Thanh Toán (TEST)
```
vnp_Url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

---

## 🔑 THÔNG TIN TRUY CẬP MERCHANT ADMIN

### Địa chỉ
```
https://sandbox.vnpayment.vn/merchantv2/
```

### Thông tin đăng nhập
- **Tên đăng nhập:** `2251120056@ut.edu.vn`
- **Mật khẩu:** (Mật khẩu nhập tại giao diện đăng ký Merchant môi trường TEST)

---

## 🧪 KIỂM TRA (TEST CASE)

### IPN URL Testing
**Kịch bản test (SIT):** https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login

**Thông tin đăng nhập:**
- **Tên đăng nhập:** `2251120056@ut.edu.vn`
- **Mật khẩu:** `Trungthong1308*`

---

## ⚙️ BACKEND CONFIGURATION

### Các thông tin này cần được cấu hình trong Backend:

1. **VNPayConfig.java** hoặc **application.properties/yml:**
   ```properties
   vnpay.tmn.code=X8VWWPJ2
   vnpay.hash.secret=UL37T5AM49OJ8KAIREZZJMD3YUD0XUN6
   vnpay.url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   vnpay.return.url=http://localhost:8081/api/v1/payments/vnpay/return
   vnpay.ipn.url=http://localhost:8081/api/v1/payments/vnpay/ipn
   ```

2. **Return URL:**
   - URL mà VNPay sẽ redirect về sau khi thanh toán
   - Ví dụ: `http://localhost:8081/api/v1/payments/vnpay/return`
   - Hoặc production: `https://yourdomain.com/api/v1/payments/vnpay/return`

3. **IPN URL (Instant Payment Notification):**
   - URL mà VNPay sẽ gọi để thông báo kết quả thanh toán
   - Ví dụ: `http://localhost:8081/api/v1/payments/vnpay/ipn`
   - Hoặc production: `https://yourdomain.com/api/v1/payments/vnpay/ipn`

---

## 💻 FRONTEND IMPLEMENTATION

### Frontend không cần cấu hình gì!

Frontend chỉ cần:
1. Gọi API: `POST /api/v1/pos/payments/process`
2. Nhận `paymentUrl` từ response
3. Redirect đến `paymentUrl`

**Code hiện tại đã đúng:**
```typescript
// src/pages/pos/PaymentPage.tsx
if (paymentResult.paymentUrl) {
  window.location.replace(paymentResult.paymentUrl);
  return;
}
```

---

## 🔄 FLOW THANH TOÁN

```
1. User chọn VNPay
   ↓
2. Frontend gọi: POST /api/v1/pos/payments/process
   {
     "invoiceId": 1,
     "paymentMethod": "VNPAY",
     "amount": 35000
   }
   ↓
3. Backend tạo payment URL với config:
   - Terminal ID: X8VWWPJ2
   - Secret Key: UL37T5AM49OJ8KAIREZZJMD3YUD0XUN6
   - Payment URL: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   ↓
4. Backend trả về:
   {
     "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=3500000&vnp_TmnCode=X8VWWPJ2&..."
   }
   ↓
5. Frontend redirect: window.location.replace(paymentUrl)
   ↓
6. User thanh toán trên VNPay
   ↓
7. VNPay redirect về Return URL (backend xử lý)
   ↓
8. Backend xử lý IPN callback
   ↓
9. Backend cập nhật payment status
```

---

## ✅ CHECKLIST

### Backend cần cập nhật:
- [ ] Cập nhật `vnp_TmnCode` = `X8VWWPJ2`
- [ ] Cập nhật `vnp_HashSecret` = `UL37T5AM49OJ8KAIREZZJMD3YUD0XUN6`
- [ ] Cập nhật `vnp_Url` = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- [ ] Kiểm tra Return URL đúng
- [ ] Kiểm tra IPN URL đúng
- [ ] Test tạo payment URL với config mới

### Frontend (đã đúng, không cần sửa):
- [x] Frontend không hardcode URL
- [x] Frontend chỉ sử dụng `paymentUrl` từ backend
- [x] Frontend redirect đúng cách
- [x] Frontend xử lý error đúng

---

## 🧪 TESTING

### Test Card (Sandbox)
- **Số thẻ:** `9704198526191432198`
- **Tên chủ thẻ:** `NGUYEN VAN A`
- **Ngày hết hạn:** `07/15`
- **CVV:** `123`
- **OTP:** `123456`

### Test Steps
1. Chọn sản phẩm và thanh toán
2. Chọn VNPay
3. Click "Thanh toán"
4. Kiểm tra redirect đến VNPay sandbox
5. Nhập thông tin test card
6. Kiểm tra redirect về Return URL
7. Kiểm tra payment status được cập nhật

---

## 📝 NOTES

1. **Môi trường TEST:**
   - Sử dụng sandbox URL
   - Không cần thẻ thật
   - Có thể test với test card

2. **Môi trường PRODUCTION:**
   - Cần đăng ký merchant account thật
   - Cần cấu hình production URL
   - Cần cấu hình production Terminal ID và Secret Key

3. **Security:**
   - Secret Key chỉ lưu ở Backend
   - Frontend không bao giờ biết Secret Key
   - Checksum được tính ở Backend

---

**Version:** 1.0.0  
**Cập nhật:** 2025-12-11

