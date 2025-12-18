# 🔧 VNPay Return URL Fix

## ❌ Vấn đề hiện tại

Sau khi thanh toán VNPay thành công, VNPay redirect về **backend URL** (`http://localhost:8081/api/v1/payments/vnpay/return`) thay vì **frontend URL** (`http://localhost:5173/payments/vnpay/return`).

**Kết quả:** User thấy trang backend thay vì trang frontend xử lý callback.

---

## ✅ Giải pháp

### Option 1: Backend cấu hình Return URL = Frontend URL (Khuyến nghị)

Backend cần cập nhật `vnp_ReturnUrl` trong config để trỏ về **frontend URL**:

```properties
# application.properties hoặc application.yml
vnpay.return.url=http://localhost:5173/payments/vnpay/return
```

**Lưu ý:**
- Development: `http://localhost:5173/payments/vnpay/return`
- Production: `https://yourdomain.com/payments/vnpay/return`

### Option 2: Backend redirect từ Backend URL → Frontend URL

Nếu backend vẫn muốn giữ endpoint `/api/v1/payments/vnpay/return` để xử lý IPN/verification, backend có thể:

1. **Xử lý callback từ VNPay** (verify signature, update invoice status)
2. **Redirect về frontend URL** với query params:

```java
// Backend Controller
@GetMapping("/api/v1/payments/vnpay/return")
public String handleVNPayReturn(HttpServletRequest request) {
    // 1. Verify signature
    // 2. Update invoice status
    // 3. Redirect về frontend với query params
    
    String frontendUrl = "http://localhost:5173/payments/vnpay/return";
    String queryString = request.getQueryString();
    
    return "redirect:" + frontendUrl + "?" + queryString;
}
```

---

## 📋 Flow đúng

```
1. User click "Thanh toán VNPay"
   ↓
2. Frontend gọi: POST /api/v1/pos/payments/process
   ↓
3. Backend tạo payment URL với:
   - vnp_ReturnUrl = http://localhost:5173/payments/vnpay/return (FRONTEND)
   ↓
4. Frontend redirect: window.location.replace(paymentUrl)
   ↓
5. User thanh toán trên VNPay
   ↓
6. VNPay redirect về: http://localhost:5173/payments/vnpay/return?...
   ↓
7. Frontend VNPayCallbackPage xử lý:
   - Parse query params
   - Verify payment (gọi API verifyPayment)
   - Hiển thị kết quả
   - Navigate về /pos
```

---

## 🔍 Kiểm tra hiện tại

### Backend config (cần kiểm tra):

```properties
# ❌ SAI - Đang trỏ về backend
vnpay.return.url=http://localhost:8081/api/v1/payments/vnpay/return

# ✅ ĐÚNG - Phải trỏ về frontend
vnpay.return.url=http://localhost:5173/payments/vnpay/return
```

### Frontend route (đã đúng):

```typescript
// src/routes/index.tsx
{
  path: '/payments/vnpay/return',
  element: (
    <ProtectedRoute>
      <VNPayCallbackPage />
    </ProtectedRoute>
  ),
}
```

---

## 🧪 Test sau khi fix

1. **Test thanh toán VNPay:**
   - Click "Thanh toán VNPay"
   - Thanh toán trên VNPay sandbox
   - Kiểm tra URL sau khi redirect: phải là `http://localhost:5173/payments/vnpay/return?...`
   - Kiểm tra trang hiển thị: phải là frontend VNPayCallbackPage (có UI đẹp, không phải backend response)

2. **Test callback params:**
   - Kiểm tra query params có đầy đủ: `vnp_ResponseCode`, `vnp_TxnRef`, `vnp_Amount`, etc.
   - Kiểm tra invoice status được cập nhật đúng
   - Kiểm tra bàn không còn hiển thị "Đang treo" sau khi thanh toán thành công

---

## 📝 Checklist

### Backend cần làm:
- [ ] Cập nhật `vnpay.return.url` = frontend URL (`http://localhost:5173/payments/vnpay/return`)
- [ ] Test tạo payment URL với return URL mới
- [ ] Verify signature khi nhận callback từ VNPay
- [ ] Update invoice status từ PENDING → COMPLETED khi thanh toán thành công

### Frontend (đã đúng, không cần sửa):
- [x] Route `/payments/vnpay/return` đã có
- [x] VNPayCallbackPage đã xử lý query params
- [x] VNPayCallbackPage đã gọi verifyPayment API
- [x] VNPayCallbackPage đã hiển thị kết quả và navigate về /pos

---

## 🎯 Kết quả mong đợi

Sau khi fix:
- ✅ VNPay redirect về frontend URL (`http://localhost:5173/payments/vnpay/return`)
- ✅ Frontend VNPayCallbackPage xử lý và hiển thị kết quả
- ✅ User thấy UI đẹp với thông báo "Thanh toán thành công!"
- ✅ Invoice status được cập nhật đúng
- ✅ Bàn tự động cập nhật (không còn "Đang treo")

---

## 💡 Lưu ý

1. **IPN URL** vẫn có thể là backend URL:
   ```properties
   vnpay.ipn.url=http://localhost:8081/api/v1/payments/vnpay/ipn
   ```
   Vì IPN là server-to-server callback, không cần user thấy.

2. **Return URL** phải là frontend URL:
   ```properties
   vnpay.return.url=http://localhost:5173/payments/vnpay/return
   ```
   Vì đây là URL user sẽ thấy sau khi thanh toán.

3. **Production:** Nhớ cập nhật URL cho production:
   ```properties
   vnpay.return.url=https://yourdomain.com/payments/vnpay/return
   vnpay.ipn.url=https://yourdomain.com/api/v1/payments/vnpay/ipn
   ```

