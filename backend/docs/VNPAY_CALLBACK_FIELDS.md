# 🔌 VNPay Callback Fields - Tài Liệu Cho Frontend

> Tài liệu này mô tả các field mà VNPay trả về trong callback (Return URL và IPN) và cách xử lý ở Frontend

**Ngày cập nhật:** 2025-12-12

---

## 📋 TỔNG QUAN

VNPay sẽ gọi 2 endpoint sau khi user thanh toán:

1. **Return URL** (GET): `/api/v1/payments/vnpay/return` - User được redirect về đây
2. **IPN** (POST): `/api/v1/payments/vnpay/ipn` - VNPay gọi background để xác nhận

---

## 🔄 FLOW XỬ LÝ

```
1. Frontend gọi POST /api/v1/pos/payments/process
   ↓
2. Backend trả về PaymentResponse với paymentUrl
   ↓
3. Frontend redirect user đến paymentUrl (VNPay)
   ↓
4. User thanh toán trên VNPay
   ↓
5. VNPay redirect về Return URL: /api/v1/payments/vnpay/return?params...
   ↓
6. Backend parse params và trả về HTML
   ↓
7. (Song song) VNPay gọi IPN: POST /api/v1/payments/vnpay/ipn?params...
   ↓
8. Backend update transaction status
```

---

## 📥 CÁC FIELD VNPAY TRẢ VỀ

### **Return URL (GET) - `/api/v1/payments/vnpay/return`**

VNPay sẽ redirect user về URL này với các query parameters:

| Field Name | Type | Mô Tả | Ví Dụ |
|-----------|------|-------|-------|
| `vnp_Amount` | String | Số tiền thanh toán (đơn vị: đồng nhỏ nhất, chia 100 để có VND) | `"10000000"` = 100,000 VND |
| `vnp_BankCode` | String | Mã ngân hàng thanh toán | `"NCB"`, `"VIB"`, `"VISA"`, etc. |
| `vnp_BankTranNo` | String | Mã giao dịch tại ngân hàng | `"VNP14236897"` |
| `vnp_CardType` | String | Loại thẻ thanh toán | `"ATM"`, `"CREDIT"`, `"DEBIT"` |
| `vnp_OrderInfo` | String | Thông tin đơn hàng | `"Thanh toan hoa don #123"` |
| `vnp_PayDate` | String | Thời gian thanh toán (format: yyyyMMddHHmmss) | `"20251212140500"` |
| `vnp_ResponseCode` | String | **Mã kết quả thanh toán** | `"00"` = Thành công |
| `vnp_TmnCode` | String | Mã website/Terminal ID | `"X8VWWPJ2"` |
| `vnp_TransactionNo` | String | **Mã giao dịch VNPay** (gatewayTransactionId) | `"14236897"` |
| `vnp_TransactionStatus` | String | **Trạng thái giao dịch** | `"00"` = Thành công |
| `vnp_TxnRef` | String | **Mã tham chiếu giao dịch** (transactionCode) | `"INV123_1702377600000"` |
| `vnp_SecureHash` | String | **Chữ ký xác thực** (HMAC SHA512) | `"a1b2c3d4e5f6..."` |
| `vnp_SecureHashType` | String | Loại hash | `"SHA256"` hoặc `"SHA512"` |

---

### **IPN (POST) - `/api/v1/payments/vnpay/ipn`**

IPN nhận các field tương tự Return URL nhưng qua POST body/query params:

**Các field giống Return URL** + có thể có thêm:
- `vnp_CreateDate` - Thời gian tạo giao dịch
- `vnp_ExpireDate` - Thời gian hết hạn

---

## ✅ LOGIC XỬ LÝ Ở BACKEND

### **1. Verify Signature**

Backend kiểm tra `vnp_SecureHash` để đảm bảo callback hợp lệ:

```java
// Backend tự động verify
boolean isValid = vnPayPaymentGateway.verifyIpnCallback(params);
```

### **2. Parse Response**

Backend parse các field và convert sang `PaymentResponse`:

```java
// Các field được parse:
vnp_ResponseCode      → status (PaymentStatus.COMPLETED/FAILED)
vnp_TxnRef            → transactionCode
vnp_TransactionNo     → gatewayTransactionId
vnp_Amount            → amount (chia 100)
vnp_TransactionStatus → kiểm tra cùng với ResponseCode
```

### **3. Status Mapping**

| vnp_ResponseCode | vnp_TransactionStatus | PaymentStatus | Mô Tả |
|-----------------|----------------------|---------------|-------|
| `"00"` | `"00"` | `COMPLETED` | ✅ Thanh toán thành công |
| Khác `"00"` | - | `FAILED` | ❌ Thanh toán thất bại |

**Mã lỗi VNPay thường gặp:**
- `"00"` - Giao dịch thành công
- `"07"` - Trừ tiền thành công nhưng giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)
- `"09"` - Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking
- `"10"` - Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần
- `"11"` - Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch
- `"12"` - Thẻ/Tài khoản bị khóa
- `"24"` - Khách hàng hủy giao dịch

---

## 🎯 CÁCH XỬ LÝ Ở FRONTEND

### **Option 1: Xử lý từ Return URL (Recommended)**

Frontend có thể parse query params trực tiếp từ URL:

```typescript
// Khi user được redirect về từ VNPay
// URL: /api/v1/payments/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=INV123_...&...

interface VNPayCallbackParams {
  vnp_Amount: string;              // "10000000" = 100,000 VND
  vnp_BankCode?: string;           // "NCB", "VIB", etc.
  vnp_BankTranNo?: string;         // Mã giao dịch tại ngân hàng
  vnp_CardType?: string;           // "ATM", "CREDIT", "DEBIT"
  vnp_OrderInfo: string;           // "Thanh toan hoa don #123"
  vnp_PayDate: string;             // "20251212140500" (yyyyMMddHHmmss)
  vnp_ResponseCode: string;        // "00" = Success, khác = Failed
  vnp_TmnCode: string;             // "X8VWWPJ2"
  vnp_TransactionNo: string;       // Mã giao dịch VNPay
  vnp_TransactionStatus: string;   // "00" = Success
  vnp_TxnRef: string;              // "INV123_1702377600000"
  vnp_SecureHash: string;          // Signature để verify
  vnp_SecureHashType?: string;     // "SHA256" hoặc "SHA512"
}

// Parse từ URL
const urlParams = new URLSearchParams(window.location.search);
const params: VNPayCallbackParams = {
  vnp_Amount: urlParams.get('vnp_Amount') || '',
  vnp_BankCode: urlParams.get('vnp_BankCode') || undefined,
  vnp_BankTranNo: urlParams.get('vnp_BankTranNo') || undefined,
  vnp_CardType: urlParams.get('vnp_CardType') || undefined,
  vnp_OrderInfo: urlParams.get('vnp_OrderInfo') || '',
  vnp_PayDate: urlParams.get('vnp_PayDate') || '',
  vnp_ResponseCode: urlParams.get('vnp_ResponseCode') || '',
  vnp_TmnCode: urlParams.get('vnp_TmnCode') || '',
  vnp_TransactionNo: urlParams.get('vnp_TransactionNo') || '',
  vnp_TransactionStatus: urlParams.get('vnp_TransactionStatus') || '',
  vnp_TxnRef: urlParams.get('vnp_TxnRef') || '',
  vnp_SecureHash: urlParams.get('vnp_SecureHash') || '',
  vnp_SecureHashType: urlParams.get('vnp_SecureHashType') || undefined,
};

// Check status
const isSuccess = params.vnp_ResponseCode === '00' && 
                  params.vnp_TransactionStatus === '00';

// Parse amount (chia 100)
const amount = params.vnp_Amount 
  ? parseFloat(params.vnp_Amount) / 100 
  : 0;

// Extract invoice ID từ vnp_TxnRef
// Format: "INV{invoiceId}_{timestamp}"
const invoiceIdMatch = params.vnp_TxnRef.match(/^INV(\d+)_/);
const invoiceId = invoiceIdMatch ? parseInt(invoiceIdMatch[1]) : null;

// Parse payment date
const payDateStr = params.vnp_PayDate; // "20251212140500"
const payDate = payDateStr 
  ? new Date(
      parseInt(payDateStr.substring(0, 4)),    // year
      parseInt(payDateStr.substring(4, 6)) - 1, // month (0-based)
      parseInt(payDateStr.substring(6, 8)),    // day
      parseInt(payDateStr.substring(8, 10)),   // hour
      parseInt(payDateStr.substring(10, 12)),  // minute
      parseInt(payDateStr.substring(12, 14))   // second
    )
  : null;
```

### **Option 2: Gọi API Backend để verify**

Frontend có thể gọi API backend để verify và lấy PaymentResponse:

```typescript
// Sau khi nhận callback từ VNPay
async function handleVNPayReturn() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Option A: Gọi API verify từ backend
  const response = await fetch(`/api/v1/pos/payments/verify/${urlParams.get('vnp_TransactionNo')}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  if (result.success) {
    const paymentResponse: PaymentResponse = result.data;
    // paymentResponse.status → PaymentStatus
    // paymentResponse.amount → BigDecimal (đã chia 100)
    // paymentResponse.gatewayTransactionId → vnp_TransactionNo
    // paymentResponse.transactionCode → vnp_TxnRef
  }
}
```

---

## 📊 MAPPING FIELDS: VNPay → PaymentResponse

| VNPay Field | PaymentResponse Field | Notes |
|------------|----------------------|-------|
| `vnp_ResponseCode` + `vnp_TransactionStatus` | `status` | `"00"` + `"00"` → `COMPLETED`, khác → `FAILED` |
| `vnp_TxnRef` | `transactionCode` | Format: `"INV{invoiceId}_{timestamp}"` |
| `vnp_TransactionNo` | `gatewayTransactionId` | Mã giao dịch VNPay |
| `vnp_Amount` | `amount` | **Chia 100** (VNPay dùng đơn vị nhỏ nhất) |
| `vnp_ResponseCode` (nếu ≠ "00") | `errorMessage` | `"VNPay Response Code: {code}"` |
| `vnp_PayDate` | `transactionDate` | Parse từ format `yyyyMMddHHmmss` |
| `vnp_BankCode` | - | Chỉ có trong callback, không lưu vào DB |
| `vnp_BankTranNo` | - | Chỉ có trong callback, không lưu vào DB |
| `vnp_CardType` | - | Chỉ có trong callback, không lưu vào DB |
| `vnp_OrderInfo` | - | Chỉ có trong callback, không lưu vào DB |

---

## 🔐 SECURITY: VERIFY SIGNATURE

**⚠️ QUAN TRỌNG:** Frontend nên gọi backend để verify signature, không nên verify trực tiếp vì cần `vnp_HashSecret`.

Backend sẽ:
1. Loại bỏ `vnp_SecureHash` và `vnp_SecureHashType`
2. Sắp xếp các params theo alphabet
3. Tạo hash data string
4. Tính HMAC SHA512 với `vnp_HashSecret`
5. So sánh với `vnp_SecureHash` từ VNPay

---

## 💡 EXAMPLE: Xử Lý Callback Ở Frontend

```typescript
// 1. Khi user được redirect về từ VNPay
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const responseCode = urlParams.get('vnp_ResponseCode');
  const txnRef = urlParams.get('vnp_TxnRef');
  
  if (responseCode && txnRef) {
    handleVNPayCallback(urlParams);
  }
}, []);

// 2. Xử lý callback
async function handleVNPayCallback(urlParams: URLSearchParams) {
  const vnp_TransactionNo = urlParams.get('vnp_TransactionNo');
  
  if (!vnp_TransactionNo) {
    showError('Không tìm thấy mã giao dịch');
    return;
  }
  
  // Gọi API verify từ backend
  try {
    const response = await fetch(
      `/api/v1/pos/payments/verify/${vnp_TransactionNo}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      const paymentResponse: PaymentResponse = result.data;
      
      if (paymentResponse.status === 'COMPLETED') {
        // ✅ Thanh toán thành công
        showSuccess(`Thanh toán thành công! Số tiền: ${formatCurrency(paymentResponse.amount)}`);
        
        // Extract invoice ID từ transactionCode
        const invoiceIdMatch = paymentResponse.transactionCode.match(/^INV(\d+)_/);
        if (invoiceIdMatch) {
          const invoiceId = invoiceIdMatch[1];
          // Redirect đến trang hóa đơn hoặc reload data
          router.push(`/invoices/${invoiceId}`);
        }
      } else {
        // ❌ Thanh toán thất bại
        showError(paymentResponse.errorMessage || 'Thanh toán thất bại');
      }
    }
  } catch (error) {
    showError('Lỗi xác minh thanh toán');
  }
}

// 3. Hoặc parse trực tiếp từ URL (nếu không cần verify)
function parseVNPayCallback(urlParams: URLSearchParams) {
  const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
  const vnp_TransactionStatus = urlParams.get('vnp_TransactionStatus');
  const vnp_Amount = urlParams.get('vnp_Amount');
  const vnp_TxnRef = urlParams.get('vnp_TxnRef');
  const vnp_TransactionNo = urlParams.get('vnp_TransactionNo');
  
  const isSuccess = vnp_ResponseCode === '00' && 
                    vnp_TransactionStatus === '00';
  
  const amount = vnp_Amount ? parseFloat(vnp_Amount) / 100 : 0;
  
  return {
    success: isSuccess,
    amount,
    transactionCode: vnp_TxnRef,
    gatewayTransactionId: vnp_TransactionNo,
    responseCode: vnp_ResponseCode,
    transactionStatus: vnp_TransactionStatus
  };
}
```

---

## 📝 VNP_TXNREF FORMAT

Format: `INV{invoiceId}_{timestamp}`

**Ví dụ:**
- `INV123_1702377600000`
  - Invoice ID: `123`
  - Timestamp: `1702377600000` (milliseconds)

**Parse ở Frontend:**
```typescript
const txnRef = "INV123_1702377600000";
const match = txnRef.match(/^INV(\d+)_(\d+)$/);
if (match) {
  const invoiceId = parseInt(match[1]);      // 123
  const timestamp = parseInt(match[2]);      // 1702377600000
}
```

---

## 🔢 VNP_AMOUNT FORMAT

VNPay sử dụng đơn vị nhỏ nhất (tương đương xu):

- **VNPay format:** `"10000000"` = 100,000 VND
- **Convert:** `amount / 100`

**Ví dụ:**
```typescript
const vnp_Amount = "10000000";        // VNPay format
const amountInVND = 10000000 / 100;   // = 100,000 VND
```

---

## 📅 VNP_PAYDATE FORMAT

Format: `yyyyMMddHHmmss` (14 ký tự)

**Ví dụ:**
- `"20251212140500"` = 2025-12-12 14:05:00

**Parse:**
```typescript
const payDateStr = "20251212140500";
const year = parseInt(payDateStr.substring(0, 4));        // 2025
const month = parseInt(payDateStr.substring(4, 6)) - 1;   // 11 (Dec, 0-based)
const day = parseInt(payDateStr.substring(6, 8));         // 12
const hour = parseInt(payDateStr.substring(8, 10));       // 14
const minute = parseInt(payDateStr.substring(10, 12));    // 05
const second = parseInt(payDateStr.substring(12, 14));    // 00

const payDate = new Date(year, month, day, hour, minute, second);
```

---

## 🎯 RECOMMENDED APPROACH

### **Frontend nên làm:**

1. ✅ **Parse query params** từ Return URL
2. ✅ **Gọi API verify** `/api/v1/pos/payments/verify/{transactionId}` để đảm bảo an toàn
3. ✅ **Kiểm tra status** từ `PaymentResponse.status`
4. ✅ **Extract invoice ID** từ `transactionCode` (format: `INV{id}_{timestamp}`)
5. ✅ **Hiển thị kết quả** cho user
6. ✅ **Reload/redirect** đến trang phù hợp

### **Frontend KHÔNG nên:**

1. ❌ Verify signature trực tiếp (cần secret key)
2. ❌ Trust response code mà không verify với backend
3. ❌ Parse amount mà không chia 100

---

## 📚 TÀI LIỆU THAM KHẢO

- **VNPay API Documentation:** https://sandbox.vnpayment.vn/apis/
- **Response Codes:** Xem bảng mã lỗi ở trên
- **Backend Code:** `VNPayPaymentGateway.java` - Method `parseIpnResponse()`

---

**Lưu ý:** Backend đã tự động xử lý verify signature và parse các field. Frontend chỉ cần parse query params và gọi API verify nếu cần kiểm tra lại status.

