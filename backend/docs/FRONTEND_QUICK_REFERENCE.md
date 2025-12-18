# ⚡ FRONTEND QUICK REFERENCE - CẬP NHẬT MỚI

**Ngày:** 2025-12-07  
**Mục đích:** Tài liệu tóm tắt nhanh các thay đổi cho Frontend

---

## 🚨 BREAKING CHANGES

### 1. ❌ XÓA `diemSuDung` khỏi CheckoutRequest

**Trước:**
```typescript
interface CheckoutRequest {
  diemSuDung?: number;  // ❌ XÓA
}
```

**Sau:**
```typescript
interface CheckoutRequest {
  // Không còn diemSuDung
}
```

### 2. ❌ XÓA `diemSuDung` khỏi InvoiceDTO

**Trước:**
```typescript
interface InvoiceDTO {
  diemSuDung?: number;  // ❌ XÓA
  diemTichLuy: number;
}
```

**Sau:**
```typescript
interface InvoiceDTO {
  diemTichLuy: number;  // ✅ 1.000 VND = 1 điểm (thanhTien / 1000)
}
```

### 3. ⚠️ Mã khách hàng format mới

**Trước:** `KH2025120621161234` (20 ký tự)  
**Sau:** `KH1234` (6-7 ký tự)

---

## ✅ API MỚI - VNPAY

### Process Payment với VNPay

```javascript
POST /api/v1/pos/payments/process
{
  "invoiceId": 1,
  "paymentMethod": "VNPAY",  // ✅ MỚI
  "amount": 35000
}

// Response
{
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",  // ✅ MỚI
    "status": "PENDING"
  }
}

// Redirect user
window.location.href = response.data.paymentUrl;
```

---

## 📝 CHECKLIST CẬP NHẬT

### Tích điểm
- [ ] ❌ Xóa field "Sử dụng điểm" khỏi form
- [ ] ✅ Cập nhật hiển thị: "Tích được: {diemTichLuy} điểm (1.000 VND = 1 điểm)"
- [ ] ✅ Xóa logic nhân 0.01

### Mã khách hàng
- [ ] ✅ Cập nhật max length: 7 (thay vì 20)
- [ ] ✅ Pattern: `KH[0-9]{4,5}`

### VNPay
- [ ] ✅ Thêm option "VNPay" vào dropdown
- [ ] ✅ Xử lý redirect khi chọn VNPay
- [ ] ✅ Thêm `paymentUrl` vào PaymentResponse type

### PDF
- [ ] ✅ Không cần thay đổi (API giữ nguyên)

---

## 💰 TÍNH ĐIỂM TÍCH LŨY

### Công thức:
```javascript
diemTichLuy = Math.round(thanhTien / 1000)
```

### Ví dụ:
- 35,000 VND → 35 điểm
- 50,500 VND → 51 điểm (làm tròn)
- 1,500 VND → 2 điểm (làm tròn)

### Code:
```typescript
function calculateLoyaltyPoints(thanhTien: number): number {
  if (thanhTien < 0) return 0;
  return Math.round(thanhTien / 1000);
}
```

**📖 Xem chi tiết:** [LOGIC_TINH_DIEM_TICH_LUY.md](./LOGIC_TINH_DIEM_TICH_LUY.md)

---

## 📚 TÀI LIỆU CHI TIẾT

- [FRONTEND_UPDATE_GUIDE.md](./FRONTEND_UPDATE_GUIDE.md) - Hướng dẫn đầy đủ
- [FRONTEND_VNPAY_INTEGRATION.md](./FRONTEND_VNPAY_INTEGRATION.md) - Hướng dẫn VNPay
- [LOGIC_TINH_DIEM_TICH_LUY.md](./LOGIC_TINH_DIEM_TICH_LUY.md) - Logic tính điểm tích lũy

---

**Version:** 1.1.0  
**Cập nhật:** 2025-12-07

