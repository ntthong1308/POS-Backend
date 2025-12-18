# 📋 Danh sách các trang/chức năng chưa hoàn thiện

Dựa trên tài liệu API Documentation, dưới đây là danh sách các trang và chức năng còn thiếu hoặc chưa tích hợp API:

---

## ❌ **HOÀN TOÀN CHƯA CÓ**

### ~~1. **Quản lý Khuyến mãi (Promotions Management)**~~ ✅ **ĐÃ HOÀN THÀNH UI**
**Trạng thái:** ✅ **ĐÃ HOÀN THÀNH** (UI + Mock data)

**Đã tạo:**
- ✅ Trang quản lý khuyến mãi (`/promotions`) - `src/pages/promotions/PromotionsPage.tsx`
- ✅ Form thêm khuyến mãi - `src/components/features/promotions/AddPromotionDialog.tsx`
- ✅ Form chỉnh sửa khuyến mãi - `src/components/features/promotions/EditPromotionDialog.tsx`
- ✅ Chức năng xóa khuyến mãi
- ✅ Chức năng kích hoạt/vô hiệu hóa khuyến mãi
- ✅ Tabs: Tất cả, Đang hoạt động, Tạm dừng, Hết hạn
- ✅ Search, Filter, Sort
- ✅ Hiển thị: Mã khuyến mãi, Tên, Giảm giá, Thời gian, Số lần sử dụng, Trạng thái
- ✅ Progress bar cho số lần sử dụng
- ✅ Route đã thêm vào router
- ✅ Menu item đã thêm vào sidebar

**API Endpoints cần tích hợp (chưa tích hợp API thực):**
- `GET /api/v1/admin/promotions` - Danh sách khuyến mãi
- `GET /api/v1/admin/promotions/{id}` - Chi tiết khuyến mãi
- `POST /api/v1/admin/promotions` - Tạo khuyến mãi mới
- `PUT /api/v1/admin/promotions/{id}` - Cập nhật khuyến mãi
- `DELETE /api/v1/admin/promotions/{id}` - Xóa khuyến mãi
- `GET /api/v1/admin/promotions/code/{code}` - Tìm theo mã
- `GET /api/v1/admin/promotions/branch/{branchId}/active` - Khuyến mãi đang hoạt động
- `POST /api/v1/admin/promotions/{id}/activate` - Kích hoạt
- `POST /api/v1/admin/promotions/{id}/deactivate` - Vô hiệu hóa
- `GET /api/v1/pos/promotions/branch/{branchId}/active` - Xem khuyến mãi trong POS

**Cần làm tiếp:**
- ⚠️ Tạo API client cho promotions (`src/lib/api/promotions.ts`)
- ⚠️ Thay thế mock data bằng API calls thực tế
- ⚠️ Hiển thị khuyến mãi trong POS checkout (UI chưa có)

---

### 2. **Quản lý Nhân viên (Employees Management)**
**Trạng thái:** ✅ **ĐÃ HOÀN THÀNH** (UI + Mock data)

**Đã tạo:**
- ✅ Trang quản lý nhân viên (`/employees`) - `src/pages/employees/EmployeesPage.tsx`
- ✅ Form thêm nhân viên - `src/components/features/employees/AddEmployeeDialog.tsx`
- ✅ Form chỉnh sửa nhân viên - `src/components/features/employees/EditEmployeeDialog.tsx`
- ✅ Chức năng xóa nhân viên
- ✅ Tabs: Active, Onboarding, Off-boarding, Dismissed
- ✅ Search, Filter, Sort
- ✅ Route đã thêm vào router
- ✅ Menu item đã thêm vào sidebar

**API Endpoints cần tích hợp (chưa tích hợp API thực):**
- `GET /api/v1/admin/employees` - Danh sách nhân viên
- `GET /api/v1/admin/employees/{id}` - Chi tiết nhân viên
- `POST /api/v1/admin/employees` - Tạo nhân viên mới
- `PUT /api/v1/admin/employees/{id}` - Cập nhật nhân viên
- `DELETE /api/v1/admin/employees/{id}` - Xóa nhân viên

**Cần làm tiếp:**
- ⚠️ Tạo API client cho employees (`src/lib/api/employees.ts`)
- ⚠️ Thay thế mock data bằng API calls thực tế

---

## ⚠️ **CÓ UI NHƯNG CHƯA TÍCH HỢP API (Đang dùng Mock Data)**

### 3. **Hóa đơn (Invoices)**
**Trạng thái:** Có UI nhưng đang dùng mock data

**Files:**
- `src/pages/invoices/InvoicesPage.tsx` - Đang dùng mock data
- `src/pages/invoices/InvoiceDetailPage.tsx` - Đang dùng mock data

**API Endpoints cần tích hợp:**
- `GET /api/invoices/{id}` - Chi tiết hóa đơn ✅ (đã có API client)
- `GET /api/invoices/by-date` - Lấy hóa đơn theo ngày ✅ (đã có API client)
- `GET /api/invoices/{id}/print` - Xuất PDF hóa đơn ❌ (chưa có)

**Cần làm:**
- Thay thế mock data bằng API calls thực tế
- Tích hợp API `/api/invoices/{id}/print` để xuất PDF từ server
- Cập nhật `InvoiceDetailPage` để fetch data từ API

---

### 4. **Báo cáo (Reports)**
**Trạng thái:** Có UI nhưng chưa tích hợp API

**File:** `src/pages/reports/ReportsPage.tsx` - Đang dùng mock data

**API Endpoints cần tích hợp:**
- `GET /api/reports/revenue/excel` - Báo cáo doanh thu (Excel)
- `GET /api/reports/inventory/excel` - Báo cáo tồn kho (Excel)
- `GET /api/reports/sales/excel` - Báo cáo sản phẩm bán chạy (Excel)

**Cần làm:**
- Tạo API client cho reports (`src/lib/api/reports.ts`)
- Tích hợp download Excel reports
- Hiển thị dữ liệu thực từ API (nếu có endpoint trả về JSON)

---

### 5. **Kho hàng (Inventory)**
**Trạng thái:** Có UI nhưng chưa tích hợp API

**File:** `src/pages/inventory/InventoryPage.tsx` - Đang dùng mock data

**API Endpoints cần tích hợp:**
- `POST /api/v1/admin/inventory/import` - Nhập hàng
- `POST /api/v1/admin/inventory/return` - Trả hàng
- `GET /api/v1/admin/inventory/stock/{productId}` - Kiểm tra tồn kho
- `GET /api/v1/admin/products/low-stock` - Sản phẩm sắp hết hàng

**Cần làm:**
- Tạo API client cho inventory (`src/lib/api/inventory.ts`)
- Tích hợp nhập hàng, trả hàng
- Hiển thị sản phẩm sắp hết hàng từ API

---

## 🔧 **CẦN BỔ SUNG CHỨC NĂNG**

### 6. **Quản lý Sản phẩm (Admin)**
**Trạng thái:** Có trang nhưng thiếu một số chức năng

**File:** `src/pages/products/ProductsPage.tsx`

**API Endpoints còn thiếu:**
- `GET /api/v1/admin/products/low-stock` - Sản phẩm sắp hết hàng
- `PATCH /api/v1/admin/products/{id}/status` - Cập nhật trạng thái

**Cần bổ sung:**
- Hiển thị cảnh báo sản phẩm sắp hết hàng
- Chức năng cập nhật trạng thái sản phẩm

---

### 7. **Quản lý Khách hàng (Admin)**
**Trạng thái:** Có trang nhưng thiếu một số chức năng

**File:** `src/pages/customers/CustomersPage.tsx`

**API Endpoints còn thiếu:**
- `PATCH /api/v1/admin/customers/{id}/points` - Cập nhật điểm tích lũy

**Cần bổ sung:**
- Form cập nhật điểm tích lũy cho khách hàng
- Hiển thị lịch sử tích lũy/sử dụng điểm

---

### 8. **POS - Thanh toán (Payment)**
**Trạng thái:** Có UI checkout nhưng chưa tích hợp đầy đủ

**Files:**
- `src/components/features/pos/OrderSummary.tsx`
- `src/components/features/pos/CartSidebar.tsx`

**API Endpoints còn thiếu:**
- `POST /api/v1/pos/payments/process` - Xử lý thanh toán
- `GET /api/v1/pos/payments/verify/{transactionId}` - Xác minh thanh toán
- `POST /api/v1/pos/payments/refund` - Hoàn tiền
- `GET /api/v1/pos/payments/{transactionId}` - Lấy giao dịch
- `GET /api/v1/pos/payments/invoice/{invoiceId}` - Giao dịch theo hóa đơn
- `POST /api/v1/pos/payments/reconcile/{transactionId}` - Đối soát

**Cần bổ sung:**
- Tích hợp xử lý thanh toán
- Hiển thị khuyến mãi đang hoạt động trong POS
- Xử lý hoàn tiền

---

### 9. **POS - Khuyến mãi**
**Trạng thái:** Chưa hiển thị/áp dụng khuyến mãi trong POS

**API Endpoints cần tích hợp:**
- `GET /api/v1/pos/promotions/branch/{branchId}/active` - Khuyến mãi đang hoạt động

**Cần bổ sung:**
- Hiển thị khuyến mãi trong POS
- Tự động áp dụng khuyến mãi khi checkout
- Cho phép chọn khuyến mãi thủ công

---

## 📝 **TÓM TẮT THEO ĐỘ ƯU TIÊN**

### **Ưu tiên cao (Core Features):**
1. ✅ Tích hợp API cho Invoices (thay mock data)
2. ✅ Tích hợp API cho Inventory (nhập hàng, trả hàng)
3. ✅ Tích hợp Payment trong POS
4. ✅ Hiển thị và áp dụng Khuyến mãi trong POS

### **Ưu tiên trung bình (Admin Features):**
5. ⚠️ Trang quản lý Khuyến mãi
6. ⚠️ Trang quản lý Nhân viên
7. ⚠️ Tích hợp Reports API (Excel export)
8. ⚠️ Bổ sung chức năng quản lý điểm tích lũy

### **Ưu tiên thấp (Nice to have):**
9. 🔧 Cảnh báo sản phẩm sắp hết hàng
10. 🔧 Cập nhật trạng thái sản phẩm

---

## 📂 **CẤU TRÚC FILE CẦN TẠO**

```
src/
├── lib/
│   └── api/
│       ├── promotions.ts      ❌ Chưa có
│       ├── employees.ts       ❌ Chưa có
│       ├── inventory.ts       ❌ Chưa có
│       └── reports.ts         ❌ Chưa có
│
├── pages/
│   ├── promotions/            ✅ Đã có (UI + Mock data)
│   │   └── PromotionsPage.tsx
│   └── employees/             ✅ Đã có (UI + Mock data)
│       └── EmployeesPage.tsx
│
└── components/
    └── features/
        ├── promotions/         ✅ Đã có (AddPromotionDialog, EditPromotionDialog)
        └── employees/          ✅ Đã có (AddEmployeeDialog, EditEmployeeDialog)
```

---

## 🔗 **API CLIENT CẦN TẠO**

### 1. `src/lib/api/promotions.ts`
```typescript
- getAll()
- getById(id)
- create(data)
- update(id, data)
- delete(id)
- getByCode(code)
- getActiveByBranch(branchId)
- activate(id)
- deactivate(id)
```

### 2. `src/lib/api/employees.ts`
```typescript
- getAll()
- getById(id)
- create(data)
- update(id, data)
```

### 3. `src/lib/api/inventory.ts`
```typescript
- import(data)
- return(data)
- getStock(productId)
- getLowStock()
```

### 4. `src/lib/api/reports.ts`
```typescript
- downloadRevenueReport(params)
- downloadInventoryReport(params)
- downloadSalesReport(params)
```

---

**Cập nhật:** 2025-01-15
**Dựa trên:** API_DOCUMENTATION.md

