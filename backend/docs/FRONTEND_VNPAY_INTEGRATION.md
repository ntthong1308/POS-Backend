# 💳 HƯỚNG DẪN TÍCH HỢP VNPAY CHO FRONTEND

**Ngày:** 2025-12-07  
**Mục đích:** Hướng dẫn chi tiết cách tích hợp VNPay vào Frontend

---

## 📋 MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [API Endpoints](#2-api-endpoints)
3. [Flow thanh toán](#3-flow-thanh-toán)
4. [Code Examples](#4-code-examples)
5. [Error Handling](#5-error-handling)
6. [Testing](#6-testing)

---

## 1. TỔNG QUAN

### 1.1. VNPay là gì?

VNPay là cổng thanh toán trực tuyến của Việt Nam, hỗ trợ:
- Thanh toán bằng thẻ (VISA, Mastercard, JCB)
- Thanh toán qua ví điện tử
- Thanh toán qua Internet Banking

### 1.2. Flow tổng quan

```
User chọn VNPay
    ↓
Frontend gọi API: POST /api/v1/pos/payments/process
    ↓
Backend tạo payment URL với VNPay
    ↓
Frontend redirect user đến payment URL
    ↓
User thanh toán trên VNPay
    ↓
VNPay xử lý thanh toán
    ↓
VNPay redirect user về Return URL
    ↓
Backend hiển thị kết quả
```

---

## 2. API ENDPOINTS

### 2.1. Process Payment

**Endpoint:** `POST /api/v1/pos/payments/process`

**Authentication:** Required (Bearer Token)

**Request:**
```json
{
  "invoiceId": 1,
  "paymentMethod": "VNPAY",
  "amount": 35000
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "transactionId": 1,
    "transactionCode": "TXN1234567890",
    "invoiceId": 1,
    "paymentMethod": "VNPAY",
    "status": "PENDING",
    "amount": 35000,
    "transactionDate": "2025-12-07T14:30:00",
    "gatewayTransactionId": "VNPAY_1234567890",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=3500000&vnp_TmnCode=DU1FT308&vnp_TxnRef=INV1_1234567890&...",
    "redirectUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "requiresConfirmation": true
  },
  "message": null,
  "errorCode": null
}
```

**Response (Error):**
```json
{
  "success": false,
  "data": null,
  "message": "Lỗi xử lý thanh toán VNPay: ...",
  "errorCode": "PAYMENT_ERROR"
}
```

### 2.2. Verify Payment (Optional)

**Endpoint:** `GET /api/v1/pos/payments/verify/{transactionId}`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": 1,
    "status": "COMPLETED",
    "amount": 35000,
    "gatewayTransactionId": "VNPAY_1234567890"
  }
}
```

---

## 3. FLOW THANH TOÁN

### 3.1. Bước 1: User chọn VNPay

```javascript
// Trong checkout form
const [paymentMethod, setPaymentMethod] = useState('CASH');

<select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
  <option value="CASH">Tiền mặt</option>
  <option value="VISA">Thẻ Visa</option>
  <option value="MASTER">Thẻ Mastercard</option>
  <option value="JCB">Thẻ JCB</option>
  <option value="CHUYEN_KHOAN">Chuyển khoản</option>
  <option value="VNPAY">VNPay</option>  {/* ✅ MỚI */}
</select>
```

### 3.2. Bước 2: Gọi API process payment

```javascript
async function handlePayment() {
  try {
    // Show loading
    setLoading(true);
    
    // Gọi API
    const response = await fetch('/api/v1/pos/payments/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        invoiceId: invoice.id,
        paymentMethod: 'VNPAY',
        amount: invoice.thanhTien
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Lỗi xử lý thanh toán');
    }
    
    // Nếu là VNPay, redirect đến payment URL
    if (paymentMethod === 'VNPAY' && data.data.paymentUrl) {
      // Redirect user đến VNPay
      window.location.href = data.data.paymentUrl;
      
      // Hoặc mở popup (tùy chọn)
      // const popup = window.open(
      //   data.data.paymentUrl,
      //   'VNPay Payment',
      //   'width=800,height=600,scrollbars=yes'
      // );
    } else {
      // Các phương thức khác (CASH, CARD, etc.)
      handleOtherPaymentMethods(data);
    }
    
  } catch (error) {
    console.error('Payment error:', error);
    showError(error.message);
  } finally {
    setLoading(false);
  }
}
```

### 3.3. Bước 3: User thanh toán trên VNPay

- User được redirect đến trang VNPay
- User nhập thông tin thẻ/ví
- User xác nhận thanh toán

### 3.4. Bước 4: VNPay redirect về Return URL

- VNPay sẽ redirect user về: `http://localhost:8081/api/v1/payments/vnpay/return`
- Backend sẽ hiển thị HTML page với kết quả
- Frontend có thể check status bằng cách gọi API verify

### 3.5. Bước 5: Verify payment (Optional)

```javascript
// Sau khi user quay lại từ VNPay
async function verifyPayment(transactionId) {
  try {
    const response = await fetch(`/api/v1/pos/payments/verify/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const data = await response.json();
    
    if (data.data.status === 'COMPLETED') {
      showSuccess('Thanh toán thành công!');
      // Refresh invoice hoặc redirect
    } else if (data.data.status === 'FAILED') {
      showError('Thanh toán thất bại: ' + data.data.errorMessage);
    } else {
      showWarning('Thanh toán đang được xử lý...');
    }
  } catch (error) {
    console.error('Verify error:', error);
  }
}
```

---

## 4. CODE EXAMPLES

### 4.1. React Component

```typescript
import React, { useState } from 'react';

interface PaymentRequest {
  invoiceId: number;
  paymentMethod: string;
  amount: number;
}

interface PaymentResponse {
  success: boolean;
  data: {
    transactionId: number;
    paymentUrl?: string;
    redirectUrl?: string;
    status: string;
  };
  message?: string;
}

function PaymentForm({ invoiceId, amount }: { invoiceId: number; amount: number }) {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/pos/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          invoiceId,
          paymentMethod,
          amount
        } as PaymentRequest)
      });

      const data: PaymentResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Lỗi xử lý thanh toán');
      }

      // Nếu là VNPay, redirect đến payment URL
      if (paymentMethod === 'VNPAY' && data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
        return;
      }

      // Các phương thức khác
      alert('Thanh toán thành công!');
      
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select 
        value={paymentMethod} 
        onChange={(e) => setPaymentMethod(e.target.value)}
        disabled={loading}
      >
        <option value="CASH">Tiền mặt</option>
        <option value="VISA">Thẻ Visa</option>
        <option value="MASTER">Thẻ Mastercard</option>
        <option value="JCB">Thẻ JCB</option>
        <option value="CHUYEN_KHOAN">Chuyển khoản</option>
        <option value="VNPAY">VNPay</option>
      </select>

      <button 
        onClick={handlePayment} 
        disabled={loading}
      >
        {loading ? 'Đang xử lý...' : 'Thanh toán'}
      </button>

      {paymentMethod === 'VNPAY' && (
        <p className="text-sm text-gray-500">
          Bạn sẽ được chuyển đến trang thanh toán VNPay
        </p>
      )}
    </div>
  );
}
```

### 4.2. Vue Component

```vue
<template>
  <div>
    <select v-model="paymentMethod" :disabled="loading">
      <option value="CASH">Tiền mặt</option>
      <option value="VISA">Thẻ Visa</option>
      <option value="MASTER">Thẻ Mastercard</option>
      <option value="JCB">Thẻ JCB</option>
      <option value="CHUYEN_KHOAN">Chuyển khoản</option>
      <option value="VNPAY">VNPay</option>
    </select>

    <button @click="handlePayment" :disabled="loading">
      {{ loading ? 'Đang xử lý...' : 'Thanh toán' }}
    </button>

    <p v-if="paymentMethod === 'VNPAY'" class="text-sm text-gray-500">
      Bạn sẽ được chuyển đến trang thanh toán VNPay
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  invoiceId: Number,
  amount: Number
});

const paymentMethod = ref('CASH');
const loading = ref(false);

const handlePayment = async () => {
  loading.value = true;
  
  try {
    const response = await fetch('/api/v1/pos/payments/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        invoiceId: props.invoiceId,
        paymentMethod: paymentMethod.value,
        amount: props.amount
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Lỗi xử lý thanh toán');
    }

    // Nếu là VNPay, redirect đến payment URL
    if (paymentMethod.value === 'VNPAY' && data.data.paymentUrl) {
      window.location.href = data.data.paymentUrl;
      return;
    }

    alert('Thanh toán thành công!');
    
  } catch (error) {
    alert('Lỗi: ' + error.message);
  } finally {
    loading.value = false;
  }
};
</script>
```

### 4.3. Angular Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface PaymentRequest {
  invoiceId: number;
  paymentMethod: string;
  amount: number;
}

interface PaymentResponse {
  success: boolean;
  data: {
    transactionId: number;
    paymentUrl?: string;
    redirectUrl?: string;
    status: string;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = '/api/v1/pos/payments';

  constructor(private http: HttpClient) {}

  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.post<PaymentResponse>(`${this.apiUrl}/process`, request, { headers });
  }

  handleVNPayPayment(response: PaymentResponse): void {
    if (response.data.paymentUrl) {
      window.location.href = response.data.paymentUrl;
    }
  }

  private getToken(): string {
    return localStorage.getItem('token') || '';
  }
}
```

---

## 5. ERROR HANDLING

### 5.1. Common Errors

**1. Invalid Payment Method:**
```json
{
  "success": false,
  "message": "Không tìm thấy payment gateway cho phương thức thanh toán: VNPAY",
  "errorCode": "INVALID_PAYMENT_METHOD"
}
```

**2. Payment Processing Error:**
```json
{
  "success": false,
  "message": "Lỗi xử lý thanh toán VNPay: ...",
  "errorCode": "PAYMENT_ERROR"
}
```

**3. Invalid Amount:**
```json
{
  "success": false,
  "message": "Số tiền thanh toán không khớp với số tiền hóa đơn",
  "errorCode": "INVALID_AMOUNT"
}
```

### 5.2. Error Handling Code

```javascript
async function handlePayment() {
  try {
    const response = await fetch('/api/v1/pos/payments/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        invoiceId: invoiceId,
        paymentMethod: 'VNPAY',
        amount: amount
      })
    });

    const data = await response.json();

    if (!data.success) {
      // Handle specific error codes
      switch (data.errorCode) {
        case 'INVALID_PAYMENT_METHOD':
          showError('Phương thức thanh toán không hợp lệ');
          break;
        case 'INVALID_AMOUNT':
          showError('Số tiền không khớp');
          break;
        case 'PAYMENT_ERROR':
          showError('Lỗi xử lý thanh toán: ' + data.message);
          break;
        default:
          showError(data.message || 'Lỗi không xác định');
      }
      return;
    }

    // Success - redirect to VNPay
    if (data.data.paymentUrl) {
      window.location.href = data.data.paymentUrl;
    }

  } catch (error) {
    console.error('Payment error:', error);
    showError('Lỗi kết nối đến server');
  }
}
```

---

## 6. TESTING

### 6.1. Test với VNPay Sandbox

**1. Tạo payment request:**
```javascript
POST /api/v1/pos/payments/process
{
  "invoiceId": 1,
  "paymentMethod": "VNPAY",
  "amount": 35000
}
```

**2. Lấy payment URL từ response**

**3. Mở payment URL trong browser**

**4. Test với thẻ test của VNPay:**
- **Số thẻ:** 9704198526191432198
- **Tên chủ thẻ:** NGUYEN VAN A
- **Ngày hết hạn:** 07/15
- **CVV:** 123
- **OTP:** 123456

**5. Kiểm tra kết quả:**
- User được redirect về Return URL
- Backend hiển thị kết quả thanh toán
- Payment transaction được cập nhật status

### 6.2. Test Cases

**Test 1: Successful Payment**
- [ ] Gọi API process payment
- [ ] Lấy payment URL
- [ ] Redirect đến VNPay
- [ ] Thanh toán thành công
- [ ] Kiểm tra status = COMPLETED

**Test 2: Failed Payment**
- [ ] Gọi API process payment
- [ ] Lấy payment URL
- [ ] Redirect đến VNPay
- [ ] Hủy thanh toán hoặc lỗi
- [ ] Kiểm tra status = FAILED

**Test 3: Network Error**
- [ ] Gọi API process payment
- [ ] Simulate network error
- [ ] Kiểm tra error handling

---

## 7. BEST PRACTICES

### 7.1. User Experience

1. **Show Loading:**
   ```javascript
   // Khi redirect đến VNPay
   setLoading(true);
   showMessage('Đang chuyển đến VNPay...');
   window.location.href = paymentUrl;
   ```

2. **Handle Popup (Optional):**
   ```javascript
   // Mở popup thay vì redirect
   const popup = window.open(
     paymentUrl,
     'VNPay Payment',
     'width=800,height=600,scrollbars=yes'
   );
   
   // Check if popup is closed
   const checkClosed = setInterval(() => {
     if (popup.closed) {
       clearInterval(checkClosed);
       // Verify payment status
       verifyPayment(transactionId);
     }
   }, 1000);
   ```

3. **Save Transaction Info:**
   ```javascript
   // Lưu transaction ID để verify sau
   localStorage.setItem('pendingTransaction', transactionId);
   ```

### 7.2. Security

1. **Never expose Secret Key:**
   - Secret key chỉ ở Backend
   - Frontend không cần biết secret key

2. **Verify Payment Status:**
   - Sau khi user quay lại, verify payment status
   - Không trust client-side data

3. **Handle Timeout:**
   ```javascript
   // Set timeout cho payment
   setTimeout(() => {
     if (paymentStatus === 'PENDING') {
       // Verify payment status
       verifyPayment(transactionId);
     }
   }, 300000); // 5 minutes
   ```

---

## 8. TROUBLESHOOTING

### 8.1. Payment URL không hoạt động

**Nguyên nhân:**
- URL bị encode sai
- Thiếu params

**Giải pháp:**
- Kiểm tra `paymentUrl` trong response
- Đảm bảo redirect đúng URL

### 8.2. IPN không được gọi

**Nguyên nhân:**
- IPN URL là localhost (VNPay không thể gọi)
- Firewall block

**Giải pháp:**
- Deploy lên server có public IP
- Hoặc dùng ngrok để test local

### 8.3. Payment status không cập nhật

**Nguyên nhân:**
- IPN callback fail
- Transaction không tìm thấy

**Giải pháp:**
- Check logs của IPN callback
- Verify payment manually bằng API

---

## 9. QUICK REFERENCE

### 9.1. API Endpoint

```
POST /api/v1/pos/payments/process
```

### 9.2. Request Format

```json
{
  "invoiceId": 1,
  "paymentMethod": "VNPAY",
  "amount": 35000
}
```

### 9.3. Response Format

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "status": "PENDING"
  }
}
```

### 9.4. Redirect Code

```javascript
if (response.data.paymentUrl) {
  window.location.href = response.data.paymentUrl;
}
```

---

**Ngày cập nhật:** 2025-12-07  
**Version:** 1.0.0  
**Trạng thái:** ✅ Sẵn sàng tích hợp

