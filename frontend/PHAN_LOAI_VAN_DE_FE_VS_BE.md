# 🔍 Phân Loại Vấn Đề: Frontend vs Backend

> Báo cáo chi tiết về các vấn đề chưa hoàn thiện, phân loại rõ ràng Frontend hay Backend

---

## 📋 Tổng Quan

### ✅ Đã Hoàn Thành: ~85%
### ⚠️ Cần Hoàn Thiện: ~15%

---

## 🎨 FRONTEND (FE) - Cần Sửa

### 1. **Dashboard Page - Tích Hợp API** 🔴 FE
**File:** `src/pages/dashboard/DashboardPage.tsx`

**Vấn đề:**
- ❌ Đang dùng mock data (hardcoded)
- ❌ Chưa gọi `dashboardAPI.getStats()`
- ❌ Chưa hiển thị dữ liệu thực từ backend

**Cần làm:**
- ✅ Tạo `useEffect` để gọi API khi component mount
- ✅ Map response từ API vào UI components
- ✅ Handle loading state
- ✅ Handle error state

**Backend:** ✅ Đã có API sẵn (`GET /api/v1/admin/dashboard`)

---

### 2. **Products Page - Pagination & Debounce** 🟡 FE
**File:** `src/pages/products/ProductsPage.tsx`

**Vấn đề:**
- ⚠️ Chưa có pagination UI (có thể đang dùng tất cả data)
- ⚠️ Chưa có debounce cho search input
- ⚠️ Cần kiểm tra xem có dùng đúng admin API không

**Cần làm:**
- ✅ Thêm pagination controls (prev/next, page numbers)
- ✅ Thêm debounce cho search (300-500ms)
- ✅ Kiểm tra xem có dùng `productsAPI.getAll()` với admin endpoint không
- ✅ Hiển thị loading state khi search

**Backend:** ✅ Đã có API sẵn với pagination

---

### 3. **POS Page - Stock & Status Validation** 🟡 FE
**File:** `src/pages/pos/POSPage.tsx`

**Vấn đề:**
- ⚠️ Chưa check `tonKho > 0` trước khi thêm vào cart
- ⚠️ Chưa check `trangThai = "ACTIVE"` trước khi thêm vào cart
- ⚠️ Chưa show error message khi scan sản phẩm không hợp lệ

**Cần làm:**
- ✅ Sau khi scan barcode, check:
  ```typescript
  if (product.tonKho <= 0) {
    toast.error('Sản phẩm đã hết hàng');
    return;
  }
  if (product.trangThai !== 'ACTIVE') {
    toast.error('Sản phẩm đã ngừng hoạt động');
    return;
  }
  ```
- ✅ Handle 404 error khi scan không tìm thấy sản phẩm

**Backend:** ✅ Đã có API sẵn, chỉ cần FE validate response

---

### 4. **Raw Material Management - API File** 🔴 FE
**File:** `src/lib/api/rawMaterials.ts` (CHƯA CÓ)

**Vấn đề:**
- ❌ Chưa có API file cho Raw Material
- ❌ Chưa có UI để quản lý nguyên liệu

**Cần làm:**
- ✅ Tạo file `src/lib/api/rawMaterials.ts` với các methods:
  - `getAll()` - GET `/api/v1/admin/nguyen-lieu`
  - `getById()` - GET `/api/v1/admin/nguyen-lieu/{id}`
  - `create()` - POST `/api/v1/admin/nguyen-lieu`
  - `update()` - PUT `/api/v1/admin/nguyen-lieu/{id}`
  - `delete()` - DELETE `/api/v1/admin/nguyen-lieu/{id}`
  - `import()` - POST `/api/v1/admin/nguyen-lieu/nhap`
  - `export()` - POST `/api/v1/admin/nguyen-lieu/xuat`
  - `getLowStock()` - GET `/api/v1/admin/nguyen-lieu/low-stock`
- ✅ Tạo types cho Raw Material
- ✅ Tạo UI page (nếu cần)

**Backend:** ✅ Đã có API sẵn (theo tài liệu)

---

### 5. **Performance Optimization** 🟡 FE
**Files:** Nhiều files

**Vấn đề:**
- ⚠️ Chưa có debounce cho search inputs
- ⚠️ Chưa có caching cho product/customer data
- ⚠️ Có thể đang load tất cả data thay vì pagination

**Cần làm:**
- ✅ Thêm debounce cho search (dùng `useDebounce` hook hoặc `lodash.debounce`)
- ✅ Thêm caching cho data ít thay đổi (products, customers)
- ✅ Đảm bảo dùng pagination thay vì load all

**Backend:** ✅ Đã hỗ trợ pagination và caching (Redis)

---

### 6. **Confirmation Dialogs** 🟡 FE
**Files:** `src/pages/products/ProductsPage.tsx`, `src/pages/inventory/InventoryPage.tsx`

**Vấn đề:**
- ⚠️ Chưa có confirmation dialog trước khi delete
- ⚠️ Chưa có confirmation dialog trước khi return goods

**Cần làm:**
- ✅ Thêm confirmation dialog trước khi delete product
- ✅ Thêm confirmation dialog trước khi return goods
- ✅ Có thể dùng `window.confirm()` hoặc custom Dialog component

**Backend:** ✅ Không cần thay đổi

---

### 7. **Token Storage Security** 🟡 FE (Optional)
**File:** `src/store/authStore.ts`

**Vấn đề:**
- ⚠️ Đang dùng `localStorage` (có thể bị XSS attack)
- ⚠️ Nên dùng `sessionStorage` hoặc httpOnly cookie

**Cần làm:**
- ✅ Cân nhắc chuyển sang `sessionStorage` (tự động clear khi close tab)
- ✅ Hoặc dùng httpOnly cookie (cần backend hỗ trợ)

**Backend:** ⚠️ Có thể cần thay đổi nếu dùng httpOnly cookie

---

## 🔧 BACKEND (BE) - Cần Kiểm Tra

### 1. **Refresh Token API** ⚠️ BE (Chưa có)
**Vấn đề:**
- ❌ Chưa có API để refresh token
- ❌ Token hiện tại expire sau 24h, không có cách refresh

**Cần làm:**
- ✅ Tạo endpoint: `POST /api/v1/auth/refresh`
- ✅ Accept refresh token và trả về new access token
- ✅ Frontend sẽ gọi API này khi token sắp expire

**Frontend:** ⚠️ Cần implement refresh logic sau khi BE có API

---

### 2. **Dashboard API Response Format** ⚠️ BE (Cần kiểm tra)
**Vấn đề:**
- ⚠️ Cần kiểm tra xem response format có đúng với `DashboardStatsDTO` không
- ⚠️ Cần kiểm tra xem có trả về đúng structure:
  ```json
  {
    "data": {
      "todayStats": { ... },
      "orderStatsByDate": [ ... ],
      "salesOverview": [ ... ],
      "topProducts": [ ... ]
    }
  }
  ```

**Cần làm:**
- ✅ Test API endpoint: `GET /api/v1/admin/dashboard?date=2025-12-06`
- ✅ Verify response format khớp với tài liệu
- ✅ Nếu không khớp → Backend cần sửa

**Frontend:** ⚠️ Đang chờ BE confirm response format

---

### 3. **File Upload Security** ⚠️ BE (Cần kiểm tra)
**Vấn đề:**
- ⚠️ Cần kiểm tra xem `/uploads/**` có public access không
- ⚠️ Trước đây có lỗi 403 Forbidden khi load images

**Cần làm:**
- ✅ Kiểm tra Spring Security config
- ✅ Đảm bảo `/uploads/**` được permitAll() hoặc có authentication
- ✅ Test load image từ browser

**Frontend:** ✅ Đã xử lý error handling

---

## 📊 Tổng Kết

### 🎨 FRONTEND (FE) - Cần Sửa: **7 vấn đề**

| # | Vấn đề | Mức độ | File | Thời gian ước tính |
|---|--------|--------|------|-------------------|
| 1 | Dashboard Page - Tích hợp API | 🔴 Cao | `src/pages/dashboard/DashboardPage.tsx` | 2-3 giờ |
| 2 | Products Page - Pagination & Debounce | 🟡 Trung bình | `src/pages/products/ProductsPage.tsx` | 1-2 giờ |
| 3 | POS Page - Stock & Status Validation | 🟡 Trung bình | `src/pages/pos/POSPage.tsx` | 1 giờ |
| 4 | Raw Material - API File | 🔴 Cao | `src/lib/api/rawMaterials.ts` (mới) | 1-2 giờ |
| 5 | Performance Optimization | 🟡 Trung bình | Nhiều files | 2-3 giờ |
| 6 | Confirmation Dialogs | 🟢 Thấp | Nhiều files | 1 giờ |
| 7 | Token Storage Security | 🟢 Thấp (Optional) | `src/store/authStore.ts` | 30 phút |

**Tổng thời gian ước tính:** 8-12 giờ

---

### 🔧 BACKEND (BE) - Cần Kiểm Tra: **3 vấn đề**

| # | Vấn đề | Mức độ | Endpoint | Thời gian ước tính |
|---|--------|--------|----------|-------------------|
| 1 | Refresh Token API | 🟡 Trung bình | `POST /api/v1/auth/refresh` | 2-3 giờ |
| 2 | Dashboard API Response Format | 🟢 Thấp | `GET /api/v1/admin/dashboard` | 30 phút (test) |
| 3 | File Upload Security | 🟢 Thấp | `/uploads/**` | 30 phút (config) |

**Tổng thời gian ước tính:** 3-4 giờ

---

## 🎯 Ưu Tiên

### **Frontend - Ưu tiên cao:**
1. ✅ **Dashboard Page** - Tích hợp API (quan trọng cho admin/manager)
2. ✅ **Raw Material API File** - Cần thiết nếu muốn quản lý nguyên liệu
3. ✅ **POS Page Validation** - Cải thiện UX, tránh lỗi

### **Frontend - Ưu tiên trung bình:**
4. ✅ **Products Page** - Pagination & Debounce (cải thiện performance)
5. ✅ **Performance Optimization** - Cải thiện trải nghiệm người dùng

### **Frontend - Ưu tiên thấp:**
6. ✅ **Confirmation Dialogs** - Nice to have
7. ✅ **Token Storage Security** - Optional, có thể làm sau

### **Backend - Ưu tiên:**
1. ✅ **Dashboard API Response Format** - Kiểm tra ngay (FE đang chờ)
2. ✅ **File Upload Security** - Kiểm tra nếu còn lỗi 403
3. ✅ **Refresh Token API** - Có thể làm sau (không bắt buộc)

---

## 📝 Lưu Ý

### **Frontend có thể làm ngay:**
- ✅ Dashboard Page - Tích hợp API (BE đã có sẵn)
- ✅ Products Page - Pagination & Debounce (BE đã hỗ trợ)
- ✅ POS Page - Validation (BE đã trả về đủ thông tin)
- ✅ Raw Material API File (BE đã có API sẵn)

### **Backend cần kiểm tra:**
- ⚠️ Dashboard API response format có đúng không?
- ⚠️ File upload security có còn lỗi 403 không?
- ⚠️ Có muốn implement refresh token không?

---

## ✅ Kết Luận

**Hầu hết các vấn đề là ở Frontend (~90%)**, cần:
- Tích hợp API vào UI
- Thêm validation
- Cải thiện performance
- Tạo API files còn thiếu

**Backend chỉ cần kiểm tra (~10%)**:
- Response format có đúng không
- Security config có đúng không
- Có muốn thêm refresh token không

**🎯 Khuyến nghị:** Frontend có thể bắt đầu làm ngay các vấn đề ưu tiên cao, không cần chờ Backend (trừ khi cần confirm response format).

