# 🔧 VNPay Return Page Fix - Redirect về Login

## ⚠️ Vấn đề hiện tại

Sau khi thanh toán VNPay thành công, user bị redirect về `/login` thay vì `/invoices/{invoiceId}`.

**Nguyên nhân:**
- Route `/payments/vnpay/return` đang bị protect bởi authentication guard
- Frontend check token và redirect về login khi không có token
- Token không được pass khi redirect từ VNPay về frontend

---

## ✅ Giải pháp

### **1. Route `/payments/vnpay/return` PHẢI là PUBLIC**

Route này **KHÔNG CẦN** authentication vì:
- VNPay redirect về từ bên ngoài (không có token)
- Backend đã verify signature rồi
- Frontend chỉ cần parse params và redirect user

**Cần sửa trong Frontend:**

```typescript
// ❌ SAI - Route bị protect
<Route path="/payments/vnpay/return" element={<ProtectedRoute><VNPayReturnPage /></ProtectedRoute>} />

// ✅ ĐÚNG - Route public
<Route path="/payments/vnpay/return" element={<VNPayReturnPage />} />
```

---

### **2. Tạo Component VNPayReturnPage**

**File:** `src/pages/payments/VNPayReturnPage.tsx` (hoặc tương tự)

```typescript
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify'; // hoặc notification library của bạn

const VNPayReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Parse params từ URL
    const responseCode = searchParams.get('vnp_ResponseCode');
    const txnRef = searchParams.get('vnp_TxnRef');
    const amount = searchParams.get('vnp_Amount');
    const transactionNo = searchParams.get('vnp_TransactionNo');
    const error = searchParams.get('error');

    // Xử lý error từ backend
    if (error) {
      toast.error('Lỗi xác thực thanh toán: ' + error);
      setTimeout(() => {
        navigate('/pos'); // hoặc trang chủ
      }, 3000);
      return;
    }

    // Kiểm tra params có đầy đủ không
    if (!responseCode || !txnRef) {
      toast.error('Thiếu thông tin thanh toán');
      setTimeout(() => {
        navigate('/pos');
      }, 3000);
      return;
    }

    // Xử lý kết quả thanh toán
    if (responseCode === '00') {
      // ✅ Thanh toán thành công
      
      // Extract Invoice ID từ vnp_TxnRef
      // Format: "INV{invoiceId}_{timestamp}"
      // Example: "INV49_1765531668630" → invoiceId = 49
      const invoiceIdMatch = txnRef.match(/^INV(\d+)_/);
      
      if (invoiceIdMatch) {
        const invoiceId = invoiceIdMatch[1];
        
        // Format amount: "6499900" (đơn vị nhỏ nhất) → 64999 VND
        const amountVND = amount ? parseInt(amount) / 100 : 0;
        
        // Show success message
        toast.success(`Thanh toán thành công! Số tiền: ${amountVND.toLocaleString('vi-VN')} VND`);
        
        // Countdown và redirect sau 3 giây
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              navigate(`/invoices/${invoiceId}`);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        toast.error('Không tìm thấy mã hóa đơn');
        setTimeout(() => {
          navigate('/pos');
        }, 3000);
      }
    } else {
      // ❌ Thanh toán thất bại
      const errorMessages: Record<string, string> = {
        '07': 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ',
        '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking',
        '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
        '11': 'Đã hết hạn chờ thanh toán',
        '12': 'Thẻ/Tài khoản bị khóa',
        '24': 'Khách hàng hủy giao dịch',
      };
      
      const errorMessage = errorMessages[responseCode] || `Thanh toán thất bại. Mã lỗi: ${responseCode}`;
      toast.error(errorMessage);
      
      setTimeout(() => {
        navigate('/pos');
      }, 3000);
    }
  }, [searchParams, navigate]);

  // UI hiển thị trong khi đang xử lý
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '20px'
    }}>
      <div className="spinner"></div> {/* Hoặc loading icon */}
      <p>Đang xử lý kết quả thanh toán...</p>
      {countdown > 0 && (
        <p>Chuyển hướng đến trang hóa đơn sau {countdown} giây...</p>
      )}
    </div>
  );
};

export default VNPayReturnPage;
```

---

### **3. Cấu hình Route (React Router)**

**File:** `src/App.tsx` hoặc `src/router/index.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VNPayReturnPage from './pages/payments/VNPayReturnPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ PUBLIC ROUTE - Không cần authentication */}
        <Route path="/payments/vnpay/return" element={<VNPayReturnPage />} />
        
        {/* Các route khác... */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
        <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### **4. Protected Route - Loại trừ `/payments/vnpay/return`**

**File:** `src/components/ProtectedRoute.tsx` (nếu có)

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // hoặc auth hook của bạn

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // ✅ Loại trừ route VNPay return
  if (location.pathname === '/payments/vnpay/return') {
    return <>{children}</>;
  }

  // Các route khác cần authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

---

### **5. Authentication Guard - Bỏ qua VNPay Return**

**File:** `src/middleware/authGuard.ts` (nếu có)

```typescript
export const authGuard = (to: string) => {
  // ✅ Public routes - không cần auth
  const publicRoutes = [
    '/login',
    '/payments/vnpay/return', // ← THÊM DÒNG NÀY
  ];

  if (publicRoutes.includes(to)) {
    return true; // Cho phép truy cập
  }

  // Check token cho các route khác
  const token = localStorage.getItem('token'); // hoặc cách lưu token của bạn
  return !!token;
};
```

---

## 📋 Checklist Frontend

- [ ] Route `/payments/vnpay/return` là PUBLIC (không protect)
- [ ] Tạo component `VNPayReturnPage` để xử lý callback
- [ ] Parse `vnp_ResponseCode` và `vnp_TxnRef` từ URL params
- [ ] Extract Invoice ID từ `vnp_TxnRef` (format: `INV{invoiceId}_{timestamp}`)
- [ ] Hiển thị success/error message
- [ ] Auto redirect đến `/invoices/{invoiceId}` sau 3 giây (nếu thành công)
- [ ] Redirect về `/pos` nếu thất bại
- [ ] Test với payment thành công (code 00)
- [ ] Test với payment thất bại (code khác 00)

---

## 🔍 Debug Tips

1. **Check URL params:**
   ```typescript
   console.log('VNPay params:', Object.fromEntries(searchParams.entries()));
   ```

2. **Check token:**
   ```typescript
   console.log('Token:', localStorage.getItem('token'));
   ```

3. **Check route protection:**
   - Xem route có trong public routes không
   - Xem ProtectedRoute có loại trừ `/payments/vnpay/return` không

---

## ✅ Expected Flow

```
1. User thanh toán trên VNPay
   ↓
2. VNPay redirect về: http://localhost:8081/api/v1/payments/vnpay/return?params...
   ↓
3. Backend verify signature và redirect về: http://localhost:5173/payments/vnpay/return?params...
   ↓
4. Frontend VNPayReturnPage:
   - Parse params từ URL (KHÔNG CẦN TOKEN)
   - Check vnp_ResponseCode
   - Extract Invoice ID từ vnp_TxnRef
   - Show success message
   - Countdown 3 giây
   ↓
5. Auto redirect đến: /invoices/{invoiceId}
```

---

**Lưu ý:** Route `/payments/vnpay/return` **PHẢI** là public route, không cần authentication vì VNPay redirect về từ bên ngoài.

