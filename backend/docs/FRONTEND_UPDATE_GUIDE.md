# 📘 HƯỚNG DẪN CẬP NHẬT CHO FRONTEND

**Ngày:** 2025-12-07  
**Mục đích:** Hướng dẫn Frontend cập nhật theo các thay đổi mới của Backend

---

## 📋 MỤC LỤC

1. [Thay đổi về Tích điểm](#1-thay-đổi-về-tích-điểm)
2. [Thay đổi về Mã khách hàng](#2-thay-đổi-về-mã-khách-hàng)
3. [Thay đổi về Checkout Request](#3-thay-đổi-về-checkout-request)
4. [API VNPay mới](#4-api-vnpay-mới)
5. [PDF Invoice - Cập nhật](#5-pdf-invoice---cập-nhật)
6. [Checklist cập nhật](#6-checklist-cập-nhật)

---

## 1. THAY ĐỔI VỀ TÍCH ĐIỂM

### 1.1. Công thức tích điểm mới

**Trước:**
- 1% của tổng tiền
- Ví dụ: 35,000 VND → 350 điểm

**Sau:**
- **1.000 VND = 1 điểm**
- Ví dụ: 35,000 VND → **35 điểm** (35,000 / 1,000)
- Ví dụ: 50,500 VND → **51 điểm** (50,500 / 1,000, làm tròn)
- Ví dụ: 1,500 VND → **2 điểm** (1,500 / 1,000, làm tròn)

### 1.2. Xóa phần sử dụng điểm

⚠️ **ĐÃ XÓA:** Không còn sử dụng điểm để giảm giá

**Trước:**
```json
{
  "diemSuDung": 50.00  // ❌ KHÔNG CÒN
}
```

**Sau:**
```json
{
  // Không có field diemSuDung nữa
}
```

### 1.3. Response từ Checkout

**InvoiceDTO Response:**
```json
{
  "id": 1,
  "maHoaDon": "HD20251207123456",
  "tongTien": 50000,
  "giamGia": 5000,
  "thanhTien": 45000,
  "diemTichLuy": 45,  // ✅ 1.000 VND = 1 điểm (45,000 / 1,000)
  // ❌ KHÔNG CÒN: "diemSuDung"
}
```

### 1.4. Cập nhật UI

**Cần sửa:**
1. ❌ **Xóa input "Sử dụng điểm"** khỏi checkout form
2. ✅ **Cập nhật hiển thị điểm tích lũy:** 
   - Trước: "Tích được: 350 điểm (1%)"
   - Sau: "Tích được: 35 điểm (1.000 VND = 1 điểm)"
3. ✅ **Cập nhật logic tính điểm:**
   - Công thức: `diemTichLuy = Math.round(thanhTien / 1000)`
   - Không cần nhân 0.01 nữa

---

## 2. THAY ĐỔI VỀ MÃ KHÁCH HÀNG

### 2.1. Format mới

**Trước:**
- Format: `KH2025120621161234` (20 ký tự)
- Ví dụ: `KH2025120621161234`

**Sau:**
- Format: `KH` + 4-5 số ngẫu nhiên (6-7 ký tự)
- Ví dụ: `KH1234`, `KH56789`, `KH9999`

### 2.2. Cập nhật UI

**Cần sửa:**
1. ✅ **Input field mã khách hàng:**
   - Max length: 7 ký tự (thay vì 20)
   - Pattern: `KH[0-9]{4,5}`

2. ✅ **Hiển thị mã khách hàng:**
   - Đảm bảo hiển thị đúng format mới

3. ✅ **Validation:**
   - Nếu user tự nhập, validate format: `KH` + 4-5 số

---

## 3. THAY ĐỔI VỀ CHECKOUT REQUEST

### 3.1. CheckoutRequest - Đã xóa field

**Trước:**
```json
{
  "khachHangId": 1,
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "items": [...],
  "giamGia": 0,
  "phuongThucThanhToan": "TIEN_MAT",
  "diemSuDung": 50.00,  // ❌ ĐÃ XÓA
  "ghiChu": "..."
}
```

**Sau:**
```json
{
  "khachHangId": 1,
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "items": [...],
  "giamGia": 0,
  "phuongThucThanhToan": "TIEN_MAT",
  // ❌ KHÔNG CÒN: "diemSuDung"
  "ghiChu": "..."
}
```

### 3.2. Cập nhật Checkout Form

**Cần sửa:**
1. ❌ **Xóa field "Sử dụng điểm"** khỏi form
2. ❌ **Xóa logic tính giảm giá từ điểm**
3. ✅ **Giữ nguyên:** giamGia (giảm giá thủ công)

---

## 4. API VNPAY MỚI

### 4.1. Process Payment với VNPay

**Endpoint:** `POST /api/v1/pos/payments/process`

**Request:**
```json
{
  "invoiceId": 1,
  "paymentMethod": "VNPAY",  // ✅ MỚI
  "amount": 35000
}
```

**Response:**
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
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=3500000&vnp_TmnCode=DU1FT308&...",  // ✅ MỚI
    "redirectUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",  // ✅ MỚI
    "requiresConfirmation": true
  }
}
```

### 4.2. Flow thanh toán VNPay

**Bước 1: Gọi API process payment**
```javascript
const response = await fetch('/api/v1/pos/payments/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    invoiceId: 1,
    paymentMethod: 'VNPAY',
    amount: 35000
  })
});

const data = await response.json();
```

**Bước 2: Redirect user đến VNPay**
```javascript
if (data.data.paymentUrl) {
  // Redirect user đến VNPay
  window.location.href = data.data.paymentUrl;
  
  // Hoặc mở popup
  // window.open(data.data.paymentUrl, 'VNPay Payment', 'width=800,height=600');
}
```

**Bước 3: User thanh toán trên VNPay**

**Bước 4: VNPay redirect về Return URL**
- VNPay sẽ redirect về: `http://localhost:8081/api/v1/payments/vnpay/return`
- Backend sẽ hiển thị HTML page với kết quả
- Frontend có thể check status bằng cách gọi API verify

**Bước 5: Verify payment status (optional)**
```javascript
// Sau khi user quay lại, có thể verify status
const verifyResponse = await fetch(`/api/v1/pos/payments/verify/${transactionId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 4.3. Payment Methods mới

**Enum PaymentMethod đã thêm:**
```javascript
// ✅ MỚI
VNPAY: "VNPay"
```

**Tất cả Payment Methods:**
```javascript
const PaymentMethod = {
  CASH: "TIEN_MAT",
  VISA: "VISA",
  MASTER: "MASTER",
  JCB: "JCB",
  BANK_TRANSFER: "CHUYEN_KHOAN",
  VNPAY: "VNPAY"  // ✅ MỚI
};
```

### 4.4. Cập nhật Payment UI

**Cần sửa:**
1. ✅ **Thêm option "VNPay"** vào dropdown phương thức thanh toán
2. ✅ **Xử lý redirect khi chọn VNPay:**
   ```javascript
   if (paymentMethod === 'VNPAY') {
     // Gọi API process payment
     const response = await processPayment(invoiceId, 'VNPAY', amount);
     
     // Redirect đến paymentUrl
     if (response.data.paymentUrl) {
       window.location.href = response.data.paymentUrl;
     }
   }
   ```
3. ✅ **Hiển thị loading khi redirect:**
   - Show "Đang chuyển đến VNPay..."
   - Disable button trong lúc redirect

---

## 5. PDF INVOICE - CẬP NHẬT

### 5.1. API không thay đổi

**Endpoint:** `GET /api/invoices/{id}/pdf`

**Request:**
```javascript
GET /api/invoices/1/pdf
Authorization: Bearer {token}
```

**Response:**
- Content-Type: `application/pdf`
- File download

### 5.2. Thay đổi trong PDF

**Đã cập nhật:**
1. ✅ **Thêm dòng "Giảm giá"** (nếu có)
2. ✅ **Format theo mẫu Alltime Coffee:**
   - SỐ HĐ: 6 số (070836)
   - Mã HĐ: #NHGDS (5 ký tự cuối)
   - Bàn: BAN27 - Tại Chỗ (từ ghiChu)
   - Giờ vào/Giờ ra
   - QR Code thật (thay vì placeholder)

### 5.3. Format ghi chú cho Bàn (tùy chọn)

**Nếu muốn hiển thị "Bàn" trong PDF:**

**Option 1:** Gửi trong `ghiChu` khi checkout:
```json
{
  "ghiChu": "Bàn: BAN27 | Loại: Dine-in"
}
```

**Option 2:** Format đơn giản:
```json
{
  "ghiChu": "Bàn: BAN27"
}
```

**Backend sẽ parse:**
- Tìm "Bàn:" trong ghiChu
- Lấy text sau "Bàn:" và trước "|" (nếu có)
- Hiển thị: "Bàn: BAN27 - Tại Chỗ"

### 5.4. Cập nhật UI in hóa đơn

**Không cần thay đổi gì:**
- API endpoint giữ nguyên
- Response format giữ nguyên
- Chỉ cần đảm bảo gọi đúng endpoint

**Nếu muốn hiển thị Bàn:**
- Thêm field "Bàn" vào checkout form (optional)
- Gửi trong `ghiChu` với format: `"Bàn: {soBan}"`

---

## 6. CHECKLIST CẬP NHẬT

### 6.1. Tích điểm ⚠️ QUAN TRỌNG

- [ ] ❌ **Xóa field "Sử dụng điểm"** khỏi checkout form
- [ ] ❌ **Xóa logic tính giảm giá từ điểm**
- [ ] ✅ **Cập nhật hiển thị điểm tích lũy:**
  - Text: "Tích được: {diemTichLuy} điểm (1.000 VND = 1 điểm)"
  - Công thức: `diemTichLuy = Math.round(thanhTien / 1000)`
- [ ] ✅ **Cập nhật CustomerDTO:**
  - Xóa `diemSuDung` khỏi interface/type
  - Chỉ giữ `diemTichLuy`

### 6.2. Mã khách hàng

- [ ] ✅ **Cập nhật input field:**
  - Max length: 7 (thay vì 20)
  - Pattern validation: `KH[0-9]{4,5}`
- [ ] ✅ **Cập nhật hiển thị:**
  - Đảm bảo hiển thị đúng format mới

### 6.3. Checkout Request

- [ ] ❌ **Xóa `diemSuDung`** khỏi CheckoutRequest interface/type
- [ ] ❌ **Xóa field "Sử dụng điểm"** khỏi checkout form
- [ ] ✅ **Giữ nguyên:** `giamGia` (giảm giá thủ công)

### 6.4. VNPay Integration

- [ ] ✅ **Thêm "VNPay" vào PaymentMethod enum/constant**
- [ ] ✅ **Thêm option "VNPay" vào dropdown phương thức thanh toán**
- [ ] ✅ **Xử lý redirect khi chọn VNPay:**
  ```javascript
  if (paymentMethod === 'VNPAY') {
    const response = await processPayment(invoiceId, 'VNPAY', amount);
    if (response.data.paymentUrl) {
      window.location.href = response.data.paymentUrl;
    }
  }
  ```
- [ ] ✅ **Cập nhật PaymentResponse interface:**
  - Thêm field: `paymentUrl?: string`
- [ ] ✅ **Hiển thị loading khi redirect đến VNPay**

### 6.5. PDF Invoice

- [ ] ✅ **Không cần thay đổi** (API giữ nguyên)
- [ ] ✅ **Optional:** Thêm field "Bàn" vào checkout form
  - Format: `"Bàn: {soBan}"` trong ghiChu

---

## 7. CODE SAMPLES CHO FRONTEND

### 7.1. Checkout Request (Updated)

```typescript
interface CheckoutRequest {
  khachHangId?: number;
  nhanVienId: number;
  chiNhanhId: number;
  items: CartItem[];
  giamGia?: number;
  phuongThucThanhToan: string;
  // ❌ XÓA: diemSuDung?: number;
  ghiChu?: string;
}

interface InvoiceResponse {
  id: number;
  maHoaDon: string;
  tongTien: number;
  giamGia: number;
  thanhTien: number;
  diemTichLuy: number;  // ✅ 1.000 VND = 1 điểm (thanhTien / 1000)
  // ❌ XÓA: diemSuDung?: number;
}
```

### 7.2. Process Payment với VNPay

```typescript
interface PaymentRequest {
  invoiceId: number;
  paymentMethod: 'CASH' | 'VISA' | 'MASTER' | 'JCB' | 'BANK_TRANSFER' | 'VNPAY';  // ✅ Thêm VNPAY
  amount: number;
}

interface PaymentResponse {
  transactionId?: number;
  transactionCode: string;
  invoiceId: number;
  paymentMethod: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  paymentUrl?: string;  // ✅ MỚI - URL để redirect đến VNPay
  redirectUrl?: string;  // ✅ MỚI
  requiresConfirmation: boolean;
}

// Function xử lý thanh toán
async function processPayment(invoiceId: number, method: string, amount: number) {
  const response = await fetch('/api/v1/pos/payments/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      invoiceId,
      paymentMethod: method,
      amount
    })
  });
  
  const data = await response.json();
  
  // Nếu là VNPay, redirect đến payment URL
  if (method === 'VNPAY' && data.data.paymentUrl) {
    window.location.href = data.data.paymentUrl;
  }
  
  return data;
}
```

### 7.3. Customer Code Format

```typescript
interface Customer {
  id: number;
  maKhachHang: string;  // ✅ Format mới: KH1234 (6-7 ký tự)
  tenKhachHang: string;
  // ...
}

// Validation
const customerCodePattern = /^KH[0-9]{4,5}$/;
const isValidCustomerCode = (code: string) => {
  return customerCodePattern.test(code);
};

// Input field
<input
  type="text"
  maxLength={7}  // ✅ Cập nhật từ 20
  pattern="KH[0-9]{4,5}"
  placeholder="KH1234"
/>
```

### 7.4. Display Points

```typescript
// Component hiển thị điểm tích lũy
function PointsDisplay({ thanhTien }: { thanhTien: number }) {
  const points = Math.round(thanhTien / 1000);  // ✅ 1.000 VND = 1 điểm
  
  return (
    <div>
      <p>Tích được: <strong>{points.toLocaleString('vi-VN')} điểm</strong></p>
      <p className="text-sm text-gray-500">(1.000 VND = 1 điểm)</p>
    </div>
  );
}
```

### 7.5. Checkout Form (Updated)

```typescript
function CheckoutForm() {
  const [formData, setFormData] = useState({
    khachHangId: null,
    nhanVienId: currentUser.id,
    chiNhanhId: currentUser.chiNhanhId,
    items: cartItems,
    giamGia: 0,
    phuongThucThanhToan: 'CASH',
    // ❌ XÓA: diemSuDung: 0,
    ghiChu: ''
  });
  
  const handleSubmit = async () => {
    // ❌ XÓA logic sử dụng điểm
    
    const response = await checkout(formData);
    
    // ✅ Hiển thị điểm tích lũy mới
    const points = Math.round(response.thanhTien / 1000);
    showSuccess(`Thanh toán thành công! Tích được ${points} điểm (1.000 VND = 1 điểm)`);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      
      {/* ❌ XÓA: Input sử dụng điểm */}
      
      {/* ✅ Giữ: Input giảm giá thủ công */}
      <input
        type="number"
        value={formData.giamGia}
        onChange={(e) => setFormData({ ...formData, giamGia: parseFloat(e.target.value) || 0 })}
        placeholder="Giảm giá (VND)"
      />
      
      {/* ✅ Thêm: Option VNPay */}
      <select
        value={formData.phuongThucThanhToan}
        onChange={(e) => setFormData({ ...formData, phuongThucThanhToan: e.target.value })}
      >
        <option value="TIEN_MAT">Tiền mặt</option>
        <option value="VISA">Thẻ Visa</option>
        <option value="MASTER">Thẻ Mastercard</option>
        <option value="JCB">Thẻ JCB</option>
        <option value="CHUYEN_KHOAN">Chuyển khoản</option>
        <option value="VNPAY">VNPay</option>  {/* ✅ MỚI */}
      </select>
      
      {/* ... */}
    </form>
  );
}
```

---

## 8. API ENDPOINTS TỔNG HỢP

### 8.1. Checkout (Đã cập nhật)

**Endpoint:** `POST /api/v1/pos/checkout`

**Request:**
```json
{
  "khachHangId": 1,
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "donGia": 10000
    }
  ],
  "giamGia": 5000,
  "phuongThucThanhToan": "TIEN_MAT",
  "ghiChu": "Bàn: BAN27 | Loại: Dine-in"  // Optional - để hiển thị Bàn trong PDF
}
```

**Response:**
```json
{
  "id": 1,
  "maHoaDon": "HD20251207123456",
  "tongTien": 20000,
  "giamGia": 5000,
  "thanhTien": 15000,
  "diemTichLuy": 15,  // ✅ 1.000 VND = 1 điểm (15,000 / 1,000)
  "trangThai": "COMPLETED"
}
```

### 8.2. Process Payment (Đã thêm VNPay)

**Endpoint:** `POST /api/v1/pos/payments/process`

**Request:**
```json
{
  "invoiceId": 1,
  "paymentMethod": "VNPAY",  // ✅ MỚI
  "amount": 15000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionCode": "TXN1234567890",
    "invoiceId": 1,
    "paymentMethod": "VNPAY",
    "status": "PENDING",
    "amount": 15000,
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",  // ✅ MỚI
    "redirectUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",  // ✅ MỚI
    "requiresConfirmation": true
  }
}
```

### 8.3. Generate PDF (Không thay đổi)

**Endpoint:** `GET /api/invoices/{id}/pdf`

**Request:**
```javascript
GET /api/invoices/1/pdf
Authorization: Bearer {token}
```

**Response:**
- Content-Type: `application/pdf`
- File download

**Lưu ý:** PDF đã được cập nhật với:
- Dòng "Giảm giá" (nếu có)
- Format theo mẫu Alltime Coffee
- QR Code thật

---

## 9. MIGRATION GUIDE

### 9.1. Breaking Changes

⚠️ **Các thay đổi có thể break code hiện tại:**

1. **CheckoutRequest:**
   - ❌ Xóa field `diemSuDung`
   - ✅ Cần xóa khỏi TypeScript interface/type

2. **InvoiceDTO:**
   - ❌ Xóa field `diemSuDung`
   - ✅ Cần xóa khỏi TypeScript interface/type

3. **Customer Code:**
   - ⚠️ Format thay đổi (20 ký tự → 6-7 ký tự)
   - ✅ Cần cập nhật validation và max length

4. **Tích điểm:**
   - ⚠️ Công thức thay đổi (1% → 1.000 VND = 1 điểm)
   - ✅ Cần cập nhật logic tính và hiển thị điểm

### 9.2. Non-Breaking Changes

✅ **Các thay đổi không break code:**

1. **PaymentResponse:**
   - ✅ Thêm field `paymentUrl` (optional)
   - ✅ Không ảnh hưởng code cũ

2. **PaymentMethod:**
   - ✅ Thêm enum `VNPAY`
   - ✅ Không ảnh hưởng code cũ

3. **PDF Invoice:**
   - ✅ API giữ nguyên
   - ✅ Chỉ thay đổi format bên trong

---

## 10. TESTING CHECKLIST

### 10.1. Test Tích điểm

- [ ] Tạo hóa đơn 35,000 VND
- [ ] Kiểm tra `diemTichLuy` = 35 (không phải 350 hoặc 35,000)
- [ ] Kiểm tra điểm khách hàng được cập nhật đúng
- [ ] Test với số tiền lẻ: 50,500 VND → 51 điểm (làm tròn)

### 10.2. Test Mã khách hàng

- [ ] Tạo khách hàng mới (không gửi mã)
- [ ] Kiểm tra mã tự động tạo có 6-7 ký tự
- [ ] Format: `KH` + 4-5 số

### 10.3. Test Checkout

- [ ] Checkout không có `diemSuDung`
- [ ] Checkout với `giamGia > 0`
- [ ] Kiểm tra response không có `diemSuDung`
- [ ] Kiểm tra `diemTichLuy` = thanhTien / 1000

### 10.4. Test VNPay

- [ ] Chọn phương thức "VNPay"
- [ ] Gọi API process payment
- [ ] Kiểm tra có `paymentUrl` trong response
- [ ] Redirect đến `paymentUrl`
- [ ] Test thanh toán trên VNPay sandbox
- [ ] Kiểm tra IPN callback (nếu có public URL)
- [ ] Kiểm tra Return URL hiển thị kết quả

### 10.5. Test PDF

- [ ] Generate PDF cho hóa đơn có giảm giá
- [ ] Kiểm tra có dòng "Giảm giá" trong PDF
- [ ] Kiểm tra format theo mẫu Alltime Coffee
- [ ] Kiểm tra có QR Code

---

## 11. QUICK REFERENCE

### 11.1. API Endpoints

| Method | Endpoint | Mô tả | Thay đổi |
|--------|----------|-------|----------|
| POST | `/api/v1/pos/checkout` | Checkout | ❌ Xóa `diemSuDung` |
| POST | `/api/v1/pos/payments/process` | Process payment | ✅ Thêm `VNPAY` |
| GET | `/api/invoices/{id}/pdf` | Generate PDF | ✅ Thêm dòng giảm giá |
| POST | `/api/v1/payments/vnpay/ipn` | VNPay IPN | ✅ MỚI |
| GET | `/api/v1/payments/vnpay/return` | VNPay Return | ✅ MỚI |

### 11.2. Payment Methods

```javascript
const PaymentMethods = {
  TIEN_MAT: 'CASH',
  VISA: 'VISA',
  MASTER: 'MASTER',
  JCB: 'JCB',
  CHUYEN_KHOAN: 'BANK_TRANSFER',
  VNPAY: 'VNPAY'  // ✅ MỚI
};
```

### 11.3. Response Fields

**CheckoutResponse:**
```typescript
{
  diemTichLuy: number;  // ✅ 1.000 VND = 1 điểm (thanhTien / 1000)
  // ❌ XÓA: diemSuDung
}
```

**PaymentResponse:**
```typescript
{
  paymentUrl?: string;  // ✅ MỚI - VNPay redirect URL
  redirectUrl?: string;  // ✅ MỚI
}
```

### 11.4. Tính điểm tích lũy

```javascript
// Công thức mới
const diemTichLuy = Math.round(thanhTien / 1000);

// Ví dụ:
// 35,000 VND → 35 điểm
// 50,500 VND → 51 điểm (làm tròn)
// 1,500 VND → 2 điểm (làm tròn)
```

---

## 12. HỖ TRỢ

Nếu có vấn đề khi tích hợp, kiểm tra:

1. ✅ API endpoints có đúng không?
2. ✅ Request body có đúng format không?
3. ✅ Authorization header có token không?
4. ✅ Payment URL có được redirect đúng không?
5. ✅ Công thức tính điểm: thanhTien / 1000 (không phải * 0.01)

**Swagger UI:** http://localhost:8081/swagger-ui.html

---

**Ngày cập nhật:** 2025-12-07  
**Version:** 1.1.0  
**Trạng thái:** ✅ Sẵn sàng tích hợp

