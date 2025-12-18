# 📋 Báo cáo API chưa có UI tương ứng

## ❌ API không có chức năng UI tương ứng

### 1. Product APIs (Admin)
- ❌ `PUT /api/v1/admin/products/{id}` - **Cập nhật sản phẩm**
  - **Lý do:** Chỉ có dialog thêm sản phẩm, không có dialog chỉnh sửa
  - **Cần:** Tạo EditProductDialog hoặc thêm chức năng edit vào AddProductDialog

- ❌ `DELETE /api/v1/admin/products/{id}` - **Xóa sản phẩm**
  - **Lý do:** Không có nút xóa hoặc menu xóa trong ProductsPage
  - **Cần:** Thêm dropdown menu với option "Xóa" trong ProductManagementCard

- ❌ `GET /api/v1/admin/products` - **Danh sách sản phẩm (admin)**
  - **Lý do:** Đang dùng public API `/api/products`
  - **Ghi chú:** Có thể giữ nguyên nếu không cần phân quyền

- ❌ `GET /api/v1/admin/products/{id}` - **Chi tiết sản phẩm (admin)**
  - **Lý do:** Chưa có trang chi tiết sản phẩm
  - **Ghi chú:** Có thể dùng public API nếu không cần phân quyền

- ❌ `GET /api/v1/admin/products/search` - **Tìm kiếm sản phẩm (admin)**
  - **Lý do:** Đang dùng public API `/api/products/search`
  - **Ghi chú:** Có thể giữ nguyên nếu không cần phân quyền

### 2. Customer APIs (Admin)
- ❌ `POST /api/v1/admin/customers` - **Tạo khách hàng mới**
  - **Lý do:** Có nút "Tạo mới" nhưng chưa có dialog hoặc handler
  - **Cần:** Tạo AddCustomerDialog hoặc thêm handler cho nút "Tạo mới"

- ❌ `DELETE /api/v1/admin/customers/{id}` - **Xóa khách hàng**
  - **Lý do:** Không có nút xóa hoặc menu xóa trong CustomersPage
  - **Cần:** Thêm dropdown menu với option "Xóa" trong customer table

- ❌ `GET /api/v1/admin/customers` - **Danh sách khách hàng (admin)**
  - **Lý do:** Đang dùng public API `/api/customers`
  - **Ghi chú:** Có thể giữ nguyên nếu không cần phân quyền

- ❌ `GET /api/v1/admin/customers/{id}` - **Chi tiết khách hàng (admin)**
  - **Lý do:** Chưa có trang chi tiết khách hàng
  - **Ghi chú:** Có thể dùng public API nếu không cần phân quyền

- ❌ `GET /api/v1/admin/customers/phone/{phone}` - **Tìm theo số điện thoại (admin)**
  - **Lý do:** Chưa có chức năng tìm kiếm theo số điện thoại riêng
  - **Ghi chú:** Có thể dùng public API `/api/customers/phone/{phone}`

- ❌ `GET /api/v1/admin/customers/search` - **Tìm kiếm khách hàng (admin)**
  - **Lý do:** Đang dùng public API `/api/customers/search`
  - **Ghi chú:** Có thể giữ nguyên nếu không cần phân quyền

### 3. Inventory APIs
- ❌ `GET /api/v1/admin/inventory/stock/{productId}` - **Kiểm tra tồn kho**
  - **Lý do:** Chưa có chức năng kiểm tra tồn kho riêng cho từng sản phẩm
  - **Cần:** Thêm button "Kiểm tra tồn kho" trong InventoryPage hoặc ProductManagementCard

### 4. POS Payment APIs
- ❌ `POST /api/v1/pos/payments/refund` - **Hoàn tiền**
  - **Lý do:** Không có UI cho hoàn tiền
  - **Cần:** Thêm button "Hoàn tiền" trong InvoiceDetailPage hoặc InvoicesPage

- ❌ `GET /api/v1/pos/payments/{transactionId}` - **Lấy giao dịch thanh toán**
  - **Lý do:** Không có UI hiển thị chi tiết giao dịch
  - **Cần:** Thêm section hiển thị transaction details trong InvoiceDetailPage

- ❌ `GET /api/v1/pos/payments/invoice/{invoiceId}` - **Lấy danh sách giao dịch theo hóa đơn**
  - **Lý do:** Không có UI hiển thị danh sách giao dịch
  - **Cần:** Thêm section hiển thị transactions trong InvoiceDetailPage

- ❌ `POST /api/v1/pos/payments/reconcile/{transactionId}` - **Đối soát thanh toán**
  - **Lý do:** Không có UI cho đối soát
  - **Cần:** Thêm button "Đối soát" trong InvoiceDetailPage hoặc ReportsPage

## ✅ API đã kết nối (có UI tương ứng)

### 1. Product APIs
- ✅ `POST /api/v1/admin/products` - Tạo sản phẩm mới (AddProductDialog)
- ✅ `PUT /api/v1/admin/products/{id}` - Cập nhật sản phẩm (AddProductDialog - edit mode)
- ✅ `DELETE /api/v1/admin/products/{id}` - Xóa sản phẩm (ProductManagementCard dropdown)
- ✅ `PATCH /api/v1/admin/products/{id}/status` - Cập nhật trạng thái (ProductManagementCard)

### 2. Customer APIs
- ✅ `POST /api/v1/admin/customers` - Tạo khách hàng mới (AddCustomerDialog)
- ✅ `PUT /api/v1/admin/customers/{id}` - Cập nhật khách hàng (EditCustomerDialog)
- ✅ `DELETE /api/v1/admin/customers/{id}` - Xóa khách hàng (CustomersPage dropdown)
- ✅ `PATCH /api/v1/admin/customers/{id}/points` - Cập nhật điểm tích lũy (PointsManagementDialog)

### 3. Inventory APIs
- ✅ `POST /api/v1/admin/inventory/import` - Nhập hàng (InventoryPage)
- ✅ `POST /api/v1/admin/inventory/return` - Trả hàng (InventoryPage)
- ✅ `GET /api/v1/admin/inventory/stock/{productId}` - Kiểm tra tồn kho (InventoryPage button)

### 4. POS Payment APIs
- ✅ `POST /api/v1/pos/payments/refund` - Hoàn tiền (InvoiceDetailPage button)
- ✅ `GET /api/v1/pos/payments/invoice/{invoiceId}` - Lấy danh sách giao dịch (InvoiceDetailPage section)
- ✅ `POST /api/v1/pos/payments/reconcile/{transactionId}` - Đối soát thanh toán (InvoiceDetailPage button)

## 📝 Tổng kết

**API đã kết nối:** 13 endpoints  
**API chưa có UI:** 8 endpoints (chủ yếu là GET endpoints cho admin, có thể dùng public API thay thế)

**Các API còn lại không có UI:**
- `GET /api/v1/admin/products` - Có thể dùng public API
- `GET /api/v1/admin/products/{id}` - Có thể dùng public API
- `GET /api/v1/admin/products/search` - Có thể dùng public API
- `GET /api/v1/admin/customers` - Có thể dùng public API
- `GET /api/v1/admin/customers/{id}` - Có thể dùng public API
- `GET /api/v1/admin/customers/phone/{phone}` - Có thể dùng public API
- `GET /api/v1/admin/customers/search` - Có thể dùng public API
- `GET /api/v1/pos/payments/{transactionId}` - Có thể hiển thị trong transaction list (đã có)

