# 🔧 FIX: Token Reset Logic - Giải Quyết Vấn Đề Phải Đăng Nhập Lại

## ❌ VẤN ĐỀ

Khi reload trang, user phải đăng nhập lại dù token vẫn còn valid.

---

## 🔍 NGUYÊN NHÂN

### 1. **Logic `isTokenExpired` quá strict**

**Vấn đề:**
```typescript
// ❌ SAI - Nếu JWT parsing fail, return true (expired)
const isTokenExpired = (token: string | null): boolean => {
  const jwtExpired = isJWTExpired(token);
  if (jwtExpired !== null) {
    return jwtExpired;
  }
  return true; // ❌ SAI - Nếu không parse được JWT, coi là expired
};
```

**Hệ quả:**
- Nếu token không phải JWT format hoặc parsing fail
- Token bị coi là expired và bị clear
- User phải đăng nhập lại

### 2. **`initialize()` quá strict**

**Vấn đề:**
- Check `isTokenExpired()` và clear token nếu true
- Nhưng `isTokenExpired()` có thể return true ngay cả khi JWT parsing fail
- Token hợp lệ bị clear

### 3. **API Client check token quá sớm**

**Vấn đề:**
- Check token expired trước mỗi request
- Nếu parsing fail, redirect ngay → không cho backend validate

---

## ✅ GIẢI PHÁP

### 1. **Sửa `isTokenExpired` - Chỉ clear khi CERTAIN expired**

```typescript
// ✅ ĐÚNG - Chỉ return true nếu CERTAIN expired
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  const jwtExpired = isJWTExpired(token);
  if (jwtExpired !== null) {
    return jwtExpired; // true = expired, false = valid
  }
  
  // ✅ Nếu JWT parsing fail, return false (không expired)
  // Để backend validate - nếu invalid, backend sẽ return 401
  return false;
};
```

### 2. **Sửa `initialize()` - Chỉ clear khi CERTAIN expired**

```typescript
initialize: () => {
  const savedToken = localStorage.getItem(TOKEN_KEY);
  const savedUser = localStorage.getItem(USER_KEY);
  
  if (!savedToken || !savedUser) {
    return;
  }
  
  // ✅ Chỉ clear nếu CERTAIN expired (JWT parsed và expired = true)
  const jwtExpired = isJWTExpired(savedToken);
  if (jwtExpired === true) {
    // Token definitely expired
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return;
  }
  
  // ✅ Nếu parsing fail (null), vẫn restore token
  // Backend sẽ validate và return 401 nếu invalid
  
  try {
    const user = JSON.parse(savedUser);
    if (user && user.token === savedToken) {
      set({ 
        user, 
        token: savedToken, 
        isAuthenticated: true 
      });
    }
  } catch (error) {
    // Clear invalid data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
},
```

### 3. **Sửa API Client - Không redirect quá sớm**

```typescript
// ✅ Chỉ reject nếu CERTAIN expired
const expired = isJWTExpired(token);
if (expired === true) {
  // Token definitely expired
  localStorage.removeItem('retail_pos_token');
  localStorage.removeItem('retail_pos_user');
  // Don't redirect here - let response interceptor handle 401
  return Promise.reject(new Error('Token expired'));
}

// ✅ Nếu parsing fail, vẫn add token
// Backend will validate
config.headers.Authorization = `Bearer ${token}`;
```

### 4. **Cải thiện Response Interceptor**

```typescript
// ✅ Chỉ redirect nếu không phải login page
if (error.response?.status === 401) {
  localStorage.removeItem('retail_pos_token');
  localStorage.removeItem('retail_pos_user');
  
  // ✅ Chỉ redirect nếu không phải login page
  if (window.location.pathname !== '/login' && 
      window.location.pathname !== '/payments/vnpay/return') {
    window.location.href = '/login';
  }
}
```

### 5. **Cải thiện ProtectedRoute**

```typescript
// ✅ Initialize auth khi component mount
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialize } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    initialize: state.initialize,
  }));
  
  // ✅ Initialize nếu chưa authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      initialize();
    }
  }, [isAuthenticated, initialize]);
  
  // ✅ Check lại sau khi initialize
  const authState = useAuthStore((state) => state.isAuthenticated);
  
  if (!authState) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

---

## 🎯 LOGIC MỚI

### Token Validation Flow:

1. **On App Load:**
   - ✅ Restore token từ localStorage
   - ✅ Check JWT expiry:
     - Nếu **CERTAIN expired** (JWT parsed và expired = true) → Clear token
     - Nếu **parsing fail** (null) → Vẫn restore, để backend validate
   - ✅ Set `isAuthenticated = true` nếu token restored

2. **On API Request:**
   - ✅ Check JWT expiry:
     - Nếu **CERTAIN expired** → Reject request
     - Nếu **parsing fail** → Vẫn add token, để backend validate
   - ✅ Backend validate:
     - Nếu invalid → Return 401
     - Response interceptor → Clear token và redirect

3. **On 401 Response:**
   - ✅ Clear token
   - ✅ Redirect to login (chỉ nếu không phải login page)

---

## ✅ KẾT QUẢ

- ✅ Token được restore đúng cách khi reload
- ✅ Không bị clear nếu JWT parsing fail
- ✅ Backend validate token thay vì frontend quá strict
- ✅ User không phải đăng nhập lại nếu token vẫn valid

---

## 🧪 TEST CASES

### Test Case 1: Valid JWT Token
```
1. Login thành công → Token saved
2. Reload trang
3. ✅ Token được restore → Không phải đăng nhập lại
```

### Test Case 2: Expired JWT Token
```
1. Login với token đã expired
2. Reload trang
3. ✅ Token bị clear → Phải đăng nhập lại
```

### Test Case 3: Invalid JWT Format
```
1. Token không phải JWT format (parsing fail)
2. Reload trang
3. ✅ Token vẫn được restore
4. ✅ Backend validate → Return 401 nếu invalid
5. ✅ Redirect to login
```

---

## 📝 NOTES

- ✅ Logic mới **less strict** - chỉ clear khi CERTAIN expired
- ✅ **Backend validation** là source of truth
- ✅ **User experience** tốt hơn - không phải đăng nhập lại không cần thiết
- ✅ **Security** vẫn đảm bảo - backend validate token

---

**Status:** ✅ Fixed  
**Impact:** User không còn phải đăng nhập lại khi reload trang nếu token vẫn valid

