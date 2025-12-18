# 💳 TÍCH HỢP VNPAY PAYMENT GATEWAY

**Ngày:** 2025-12-07  
**Mục đích:** Tích hợp VNPay để xử lý thanh toán online

---

## 1. THÔNG TIN CẤU HÌNH VNPAY

### 1.1. Test Environment

**Terminal ID / Mã Website:**
```
X8VWWPJ2
```

**Secret Key / Chuỗi bí mật:**
```
UL37T5AM49OJ8KAIREZZJMD3YUD0XUN6
```

**URL thanh toán (Sandbox):**
```
https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

**Merchant Admin:**
- URL: https://sandbox.vnpayment.vn/merchantv2/
- Email: 2251120056@ut.edu.vn
- Password: (mật khẩu đăng ký tại giao diện đăng ký Merchant môi trường TEST)

**Test Case (SIT):**
- URL: https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login
- Email: 2251120056@ut.edu.vn
- Password: Trungthong1308*

---

## 2. CẤU HÌNH

### 2.1. Application Configuration

**File:** `retail-bootstrap/src/main/resources/application.yml`

```yaml
app:
  vnpay:
    tmn-code: X8VWWPJ2
    hash-secret: UL37T5AM49OJ8KAIREZZJMD3YUD0XUN6
    url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
    return-url: http://localhost:8081/api/v1/payments/vnpay/return
    ipn-url: http://localhost:8081/api/v1/payments/vnpay/ipn
```

### 2.2. Production Configuration

Khi deploy production, cần cập nhật:
- `vnpay.url`: URL production của VNPay
- `vnpay.return-url`: URL production của return callback
- `vnpay.ipn-url`: URL production của IPN callback (phải là public URL)

---

## 3. IMPLEMENTATION

### 3.1. VNPayPaymentGateway

**File:** `retail-application/src/main/java/com/retail/application/service/payment/impl/VNPayPaymentGateway.java`

**Chức năng:**
- ✅ Tạo payment URL với VNPay
- ✅ Tạo HMAC SHA512 hash để bảo mật
- ✅ Xác minh IPN callback từ VNPay
- ✅ Parse IPN response
- ✅ Hỗ trợ refund (cần implement API riêng)

**Payment Methods hỗ trợ:**
- `VISA`
- `MASTER`
- `JCB`
- `BANK_TRANSFER`

### 3.2. VNPayController

**File:** `retail-pos-api/src/main/java/com/retail/pos/controller/VNPayController.java`

**Endpoints:**

1. **IPN Callback:**
   ```
   POST /api/v1/payments/vnpay/ipn
   ```
   - VNPay gọi URL này để thông báo kết quả thanh toán
   - Xác minh signature
   - Cập nhật payment transaction status

2. **Return URL:**
   ```
   GET /api/v1/payments/vnpay/return
   ```
   - User được redirect về URL này sau khi thanh toán
   - Hiển thị kết quả thanh toán
   - Xác minh signature

### 3.3. PaymentMethod Enum

**File:** `retail-common/src/main/java/com/retail/common/constant/PaymentMethod.java`

Đã thêm:
```java
VNPAY("VNPay")
```

---

## 4. FLOW THANH TOÁN VNPAY

### 4.1. Process Payment

```
1. Frontend gọi: POST /api/v1/pos/payments/process
   {
     "invoiceId": 1,
     "paymentMethod": "VNPAY",
     "amount": 35000
   }

2. Backend tạo payment URL với VNPay
   - Tạo các params theo chuẩn VNPay
   - Tạo HMAC SHA512 hash
   - Return payment URL

3. Frontend redirect user đến payment URL
   - User thanh toán trên VNPay
   - VNPay xử lý thanh toán

4. VNPay gọi IPN callback
   - POST /api/v1/payments/vnpay/ipn
   - Backend xác minh signature
   - Cập nhật transaction status

5. VNPay redirect user về Return URL
   - GET /api/v1/payments/vnpay/return
   - Hiển thị kết quả thanh toán
```

### 4.2. IPN Callback Flow

```
VNPay → POST /api/v1/payments/vnpay/ipn
  ↓
Verify signature (HMAC SHA512)
  ↓
Parse response (vnp_ResponseCode, vnp_TransactionStatus)
  ↓
Update PaymentTransaction status
  ↓
Return "OK" to VNPay
```

---

## 5. API USAGE

### 5.1. Process Payment với VNPay

**Endpoint:** `POST /api/v1/pos/payments/process`

**Request:**
```json
{
  "invoiceId": 1,
  "paymentMethod": "VNPAY",
  "amount": 35000
}
```

**Response:**
```json
{
  "transactionCode": "TXN1234567890",
  "invoiceId": 1,
  "paymentMethod": "VNPAY",
  "status": "PENDING",
  "amount": 35000,
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "redirectUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "requiresConfirmation": true
}
```

**Frontend cần:**
1. Lấy `paymentUrl` hoặc `redirectUrl` từ response
2. Redirect user đến URL đó
3. User thanh toán trên VNPay
4. VNPay sẽ redirect về `return-url` sau khi thanh toán

### 5.2. IPN Callback (VNPay tự động gọi)

**Endpoint:** `POST /api/v1/payments/vnpay/ipn`

**Request:** (VNPay gửi params)
```
vnp_Amount=3500000
vnp_BankCode=NCB
vnp_BankTranNo=VNP12345678
vnp_CardType=ATM
vnp_OrderInfo=Thanh+toan+hoa+don+%231
vnp_PayDate=20251207123456
vnp_ResponseCode=00
vnp_TmnCode=DU1FT308
vnp_TransactionNo=12345678
vnp_TransactionStatus=00
vnp_TxnRef=INV1_1234567890
vnp_SecureHash=abc123...
```

**Response:**
```
OK
```

### 5.3. Return URL (User redirect về)

**Endpoint:** `GET /api/v1/payments/vnpay/return`

**Request:** (VNPay redirect với params)
```
?vnp_Amount=3500000&vnp_BankCode=NCB&...&vnp_SecureHash=abc123...
```

**Response:** HTML page hiển thị kết quả

---

## 6. TESTING

### 6.1. Test với VNPay Sandbox

1. **Tạo payment request:**
   ```bash
   POST http://localhost:8081/api/v1/pos/payments/process
   {
     "invoiceId": 1,
     "paymentMethod": "VNPAY",
     "amount": 35000
   }
   ```

2. **Lấy payment URL từ response**

3. **Mở payment URL trong browser**

4. **Test với thẻ test:**
   - Số thẻ: 9704198526191432198
   - Tên chủ thẻ: NGUYEN VAN A
   - Ngày hết hạn: 07/15
   - CVV: 123
   - OTP: 123456

5. **Kiểm tra IPN callback:**
   - VNPay sẽ gọi IPN URL
   - Check logs để xem IPN được xử lý

6. **Kiểm tra Return URL:**
   - User được redirect về return URL
   - Hiển thị kết quả thanh toán

### 6.2. Test IPN Callback

Có thể test IPN callback bằng cách gọi trực tiếp:

```bash
POST http://localhost:8081/api/v1/payments/vnpay/ipn
Content-Type: application/x-www-form-urlencoded

vnp_Amount=3500000
&vnp_BankCode=NCB
&vnp_ResponseCode=00
&vnp_TxnRef=INV1_1234567890
&vnp_TransactionNo=12345678
&vnp_TransactionStatus=00
&vnp_SecureHash=...
```

---

## 7. LƯU Ý QUAN TRỌNG

### 7.1. IPN URL

⚠️ **IPN URL phải là public URL:**
- Không thể dùng `localhost` cho IPN
- Cần deploy lên server có public IP
- Hoặc dùng ngrok/tunneling để test local

### 7.2. Return URL

✅ **Return URL có thể là localhost:**
- User được redirect về sau khi thanh toán
- Có thể dùng localhost cho development

### 7.3. Security

✅ **Đã implement:**
- HMAC SHA512 hash verification
- Signature validation cho IPN và Return URL
- Secure hash generation

### 7.4. Amount Format

⚠️ **VNPay dùng đơn vị nhỏ nhất:**
- VNPay: 35000 VND → 3500000 (nhân 100)
- Backend tự động convert khi tạo payment URL
- Backend tự động convert khi parse IPN response

---

## 8. PRODUCTION DEPLOYMENT

### 8.1. Cần cập nhật

1. **VNPay Production Credentials:**
   - Terminal ID (production)
   - Secret Key (production)
   - Payment URL (production)

2. **Public URLs:**
   - IPN URL: `https://yourdomain.com/api/v1/payments/vnpay/ipn`
   - Return URL: `https://yourdomain.com/api/v1/payments/vnpay/return`

3. **Cấu hình trong VNPay Merchant:**
   - Đăng ký IPN URL trong VNPay Merchant Admin
   - Đăng ký Return URL trong VNPay Merchant Admin

### 8.2. Monitoring

- Log tất cả IPN callbacks
- Monitor payment success rate
- Alert nếu IPN verification fails

---

## 9. KẾT LUẬN

✅ **Đã tích hợp:**
- VNPayPaymentGateway implementation
- IPN callback handler
- Return URL handler
- HMAC SHA512 security
- Payment URL generation

⚠️ **Cần làm thêm:**
- Test với VNPay sandbox
- Deploy lên server public để test IPN
- Implement refund API (nếu cần)
- Error handling và retry logic

---

**Ngày hoàn thành:** 2025-12-07  
**Trạng thái:** ✅ Code đã sẵn sàng, cần test với VNPay sandbox

