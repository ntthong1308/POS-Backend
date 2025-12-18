# 💳 HƯỚNG DẪN PAYMENT GATEWAY INTEGRATION

**Ngày tạo:** 2025-11-30  
**Cập nhật:** 2025-11-30  
**Mục đích:** Hướng dẫn sử dụng Payment Gateway Integration

---

## ✅ CÁC PHƯƠNG THỨC THANH TOÁN

Hệ thống hỗ trợ **5 phương thức thanh toán**:

1. **CASH** - Tiền mặt
2. **VISA** - Thẻ Visa
3. **MASTER** - Thẻ Mastercard
4. **JCB** - Thẻ JCB
5. **BANK_TRANSFER** - Chuyển khoản ngân hàng (có QR và số tiền)

---

## 🚀 CÁCH SỬ DỤNG

### **1. TIỀN MẶT (CASH)**

Thanh toán bằng tiền mặt - luôn thành công ngay lập tức.

```http
POST /api/v1/pos/payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceId": 1,
  "paymentMethod": "CASH",
  "amount": 100000,
  "notes": "Thanh toán tiền mặt"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": 1,
    "transactionCode": "PAY1732945200000",
    "invoiceId": 1,
    "paymentMethod": "CASH",
    "status": "COMPLETED",
    "amount": 100000,
    "transactionDate": "2025-11-30T10:00:00",
    "gatewayTransactionId": "MOCK_ABC12345"
  }
}
```

---

### **2. THẺ VISA**

Thanh toán bằng thẻ Visa.

```http
POST /api/v1/pos/payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceId": 1,
  "paymentMethod": "VISA",
  "amount": 100000,
  "cardNumber": "4111111111111111",
  "cardHolderName": "NGUYEN VAN A",
  "cardExpiryDate": "12/25",
  "cardCvv": "123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": 1,
    "transactionCode": "PAY1732945200000",
    "invoiceId": 1,
    "paymentMethod": "VISA",
    "status": "COMPLETED",
    "amount": 100000,
    "cardLast4": "1111",
    "cardType": "VISA"
  }
}
```

---

### **3. THẺ MASTERCARD**

Thanh toán bằng thẻ Mastercard.

```http
POST /api/v1/pos/payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceId": 1,
  "paymentMethod": "MASTER",
  "amount": 100000,
  "cardNumber": "5555555555554444",
  "cardHolderName": "NGUYEN VAN A",
  "cardExpiryDate": "12/25",
  "cardCvv": "123"
}
```

---

### **4. THẺ JCB**

Thanh toán bằng thẻ JCB.

```http
POST /api/v1/pos/payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceId": 1,
  "paymentMethod": "JCB",
  "amount": 100000,
  "cardNumber": "3530111333300000",
  "cardHolderName": "NGUYEN VAN A",
  "cardExpiryDate": "12/25",
  "cardCvv": "123"
}
```

---

### **5. CHUYỂN KHOẢN (BANK_TRANSFER)**

Chuyển khoản ngân hàng - **sẽ hiển thị QR code và số tiền**.

```http
POST /api/v1/pos/payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceId": 1,
  "paymentMethod": "BANK_TRANSFER",
  "amount": 100000,
  "bankName": "Vietcombank",
  "bankAccount": "1234567890",
  "notes": "Chuyển khoản ngân hàng"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": 1,
    "transactionCode": "PAY1732945200000",
    "invoiceId": 1,
    "paymentMethod": "BANK_TRANSFER",
    "status": "PENDING_RECONCILIATION",
    "amount": 100000,
    "qrCode": "00020101021238570010A000000727012700061000000000053037045406...",
    "requiresConfirmation": true
  }
}
```

**Lưu ý:**
- ✅ Response sẽ có `qrCode` - QR code để khách hàng quét và chuyển khoản
- ✅ Response sẽ có `amount` - Số tiền cần chuyển
- ⏳ Status: `PENDING_RECONCILIATION` - Chờ đối soát sau khi khách chuyển tiền
- 🔄 Sau khi khách chuyển tiền, cần gọi API **reconcile** để xác nhận

---

## 📋 API ENDPOINTS

### **1. Process Payment**
```http
POST /api/v1/pos/payments/process
```
Process payment cho một invoice.

**Request Body:**
```json
{
  "invoiceId": 1,
  "paymentMethod": "CASH|VISA|MASTER|JCB|BANK_TRANSFER",
  "amount": 100000,
  "cardNumber": "...",        // Chỉ cần cho VISA, MASTER, JCB
  "cardHolderName": "...",    // Chỉ cần cho VISA, MASTER, JCB
  "cardExpiryDate": "...",    // Chỉ cần cho VISA, MASTER, JCB
  "cardCvv": "...",           // Chỉ cần cho VISA, MASTER, JCB
  "bankName": "...",          // Chỉ cần cho BANK_TRANSFER
  "bankAccount": "...",       // Chỉ cần cho BANK_TRANSFER
  "notes": "..."
}
```

### **2. Verify Payment**
```http
GET /api/v1/pos/payments/verify/{transactionId}
```
Verify payment status.

### **3. Refund Payment**
```http
POST /api/v1/pos/payments/refund?transactionId={id}&amount={amount}
```
Hoàn tiền cho một transaction.

### **4. Get Payment Transaction**
```http
GET /api/v1/pos/payments/{transactionId}
```
Lấy thông tin payment transaction.

### **5. Get Payments by Invoice**
```http
GET /api/v1/pos/payments/invoice/{invoiceId}
```
Lấy tất cả payments của một invoice.

### **6. Reconcile Payment** (Cho BANK_TRANSFER)
```http
POST /api/v1/pos/payments/reconcile/{transactionId}?reconciliationStatus={status}
```
Đối soát offline payment sau khi khách đã chuyển khoản.

**Ví dụ:**
```http
POST /api/v1/pos/payments/reconcile/1?reconciliationStatus=CONFIRMED
```

---

## 🔄 FLOW

### **Flow 1: TIỀN MẶT (CASH)**
```
1. Checkout → Create Invoice
2. Process Payment (CASH) → Status: COMPLETED
3. Done ✅
```

### **Flow 2: THẺ (VISA/MASTER/JCB)**
```
1. Checkout → Create Invoice
2. Process Payment (VISA/MASTER/JCB) → Status: COMPLETED
3. Done ✅
```

### **Flow 3: CHUYỂN KHOẢN (BANK_TRANSFER)**
```
1. Checkout → Create Invoice
2. Process Payment (BANK_TRANSFER) → 
   - Status: PENDING_RECONCILIATION
   - Receive QR Code và Amount
3. Khách hàng quét QR và chuyển khoản
4. Nhân viên đối soát → Reconcile Payment → Status: RECONCILED
5. Done ✅
```

---

## 📱 QR CODE CHO BANK TRANSFER

Khi thanh toán bằng **BANK_TRANSFER**, response sẽ trả về:

```json
{
  "qrCode": "00020101021238570010A000000727012700061000000000053037045406...",
  "amount": 100000
}
```

**QR Code Format:**
- Format: **VietQR** standard
- Chứa: Số tiền, thông tin merchant, ngân hàng
- Có thể quét bằng app banking để chuyển khoản

**Frontend cần:**
1. Hiển thị QR code image (từ string QR code)
2. Hiển thị số tiền: `amount`
3. Hiển thị thông tin: "Vui lòng quét QR code và chuyển khoản đúng số tiền"
4. Cho phép nhân viên reconcile sau khi khách đã chuyển

---

## 🔐 BẢO MẬT

- Tất cả endpoints yêu cầu authentication
- Chỉ **CASHIER**, **MANAGER**, **ADMIN** có quyền truy cập
- Card details (CVV, full card number) nên được mã hóa trong production
- QR code chỉ được generate cho BANK_TRANSFER

---

## 📊 DATABASE

Payment transactions được lưu trong bảng `payment_transaction` với:
- `payment_method`: CASH, VISA, MASTER, JCB, BANK_TRANSFER
- `card_type`: VISA, MASTER, JCB (chỉ cho card payments)
- `qr_code`: QR code string (chỉ cho BANK_TRANSFER)
- `amount`: Số tiền thanh toán
- `status`: PENDING, COMPLETED, PENDING_RECONCILIATION, RECONCILED, etc.

---

## 🧪 TEST

### **Test 1: Tiền mặt**
```bash
POST /api/v1/pos/payments/process
{
  "invoiceId": 1,
  "paymentMethod": "CASH",
  "amount": 100000
}
```

### **Test 2: Thẻ Visa**
```bash
POST /api/v1/pos/payments/process
{
  "invoiceId": 1,
  "paymentMethod": "VISA",
  "amount": 100000,
  "cardNumber": "4111111111111111",
  "cardHolderName": "TEST USER",
  "cardExpiryDate": "12/25",
  "cardCvv": "123"
}
```

### **Test 3: Chuyển khoản (có QR)**
```bash
POST /api/v1/pos/payments/process
{
  "invoiceId": 1,
  "paymentMethod": "BANK_TRANSFER",
  "amount": 100000,
  "bankName": "Vietcombank"
}
```

**Expected Response:**
- `status`: `PENDING_RECONCILIATION`
- `qrCode`: QR code string (có thể generate image)
- `amount`: 100000

### **Test 4: Reconcile Bank Transfer**
```bash
POST /api/v1/pos/payments/reconcile/1?reconciliationStatus=CONFIRMED
```

---

## ⚠️ LƯU Ý

1. **Tiền mặt (CASH)**: Luôn thành công ngay, không cần thông tin bổ sung
2. **Thẻ (VISA/MASTER/JCB)**: Cần card details (số thẻ, tên chủ thẻ, hạn, CVV)
3. **Chuyển khoản (BANK_TRANSFER)**:
   - ✅ Tự động generate QR code
   - ✅ Response có số tiền
   - ⏳ Status: PENDING_RECONCILIATION (chờ đối soát)
   - 🔄 Cần reconcile sau khi khách chuyển tiền
4. **QR Code**: Format VietQR, có thể generate image từ string
5. **Card Type**: Tự động xác định từ PaymentMethod (VISA → VISA, MASTER → MASTER, JCB → JCB)

---

**Hoàn thành! Payment Gateway đã được cập nhật theo yêu cầu. 🎉**
