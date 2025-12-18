# 📊 Báo cáo tích hợp API

## ✅ API đã kết nối và sử dụng

### 1. Authentication APIs
- ✅ `POST /api/v1/auth/login` - Đăng nhập
- ✅ `GET /api/v1/auth/me` - Lấy thông tin user (qua interceptor)
- ✅ `POST /api/v1/auth/logout` - Đăng xuất

### 2. Product APIs
- ✅ `GET /api/products` - Danh sách sản phẩm (ProductsPage)
- ✅ `GET /api/products/{id}` - Chi tiết sản phẩm
- ✅ `GET /api/products/search` - Tìm kiếm sản phẩm
- ✅ `GET /api/products/barcode/{barcode}` - Tìm theo barcode
- ✅ `GET /api/v1/admin/products/low-stock` - Sản phẩm sắp hết hàng (ProductsPage)
- ✅ `PATCH /api/v1/admin/products/{id}/status` - Cập nhật trạng thái (ProductsPage)

### 3. Customer APIs
- ✅ `GET /api/customers` - Danh sách khách hàng (CustomersPage)
- ✅ `GET /api/customers/{id}` - Chi tiết khách hàng
- ✅ `GET /api/customers/phone/{phone}` - Tìm theo số điện thoại
- ✅ `GET /api/customers/search` - Tìm kiếm khách hàng
- ✅ `PATCH /api/v1/admin/customers/{id}/points` - Cập nhật điểm tích lũy (CustomersPage)

### 4. POS APIs
- ✅ `GET /api/v1/pos/products` - Danh sách sản phẩm cho POS (POSPage)
- ✅ `GET /api/v1/pos/products/search` - Tìm kiếm sản phẩm (POSPage)
- ✅ `GET /api/v1/pos/products/scan/{barcode}` - Scan barcode
- ✅ `GET /api/v1/pos/products/{id}` - Chi tiết sản phẩm
- ✅ `POST /api/v1/pos/checkout/validate` - Validate giỏ hàng (OrderSummary)
- ✅ `POST /api/v1/pos/checkout` - Checkout (OrderSummary)
- ✅ `POST /api/v1/pos/payments/process` - Xử lý thanh toán (OrderSummary)
- ✅ `GET /api/v1/pos/payments/verify/{transactionId}` - Xác minh thanh toán (OrderSummary)
- ✅ `GET /api/v1/pos/promotions/branch/{branchId}/active` - Khuyến mãi đang hoạt động (PromotionSelector)

### 5. Invoice APIs
- ✅ `GET /api/invoices/{id}` - Chi tiết hóa đơn (InvoiceDetailPage)
- ✅ `GET /api/v1/pos/invoices/by-date` - Hóa đơn theo ngày (InvoicesPage)
- ✅ `GET /api/v1/pos/invoices/{id}` - Chi tiết hóa đơn từ POS (InvoiceDetailPage)
- ✅ `GET /api/invoices/{id}/print` - Xuất PDF hóa đơn (InvoiceDetailPage)

### 6. Promotion APIs
- ✅ `GET /api/v1/admin/promotions` - Danh sách khuyến mãi (PromotionsPage)
- ✅ `GET /api/v1/admin/promotions/{id}` - Chi tiết khuyến mãi
- ✅ `POST /api/v1/admin/promotions` - Tạo khuyến mãi (PromotionsPage)
- ✅ `PUT /api/v1/admin/promotions/{id}` - Cập nhật khuyến mãi (PromotionsPage)
- ✅ `DELETE /api/v1/admin/promotions/{id}` - Xóa khuyến mãi (PromotionsPage)
- ✅ `GET /api/v1/admin/promotions/code/{code}` - Tìm theo mã
- ✅ `GET /api/v1/admin/promotions/branch/{branchId}/active` - Khuyến mãi đang hoạt động
- ✅ `POST /api/v1/admin/promotions/{id}/activate` - Kích hoạt (PromotionsPage)
- ✅ `POST /api/v1/admin/promotions/{id}/deactivate` - Vô hiệu hóa (PromotionsPage)

### 7. Employee APIs
- ✅ `GET /api/v1/admin/employees` - Danh sách nhân viên (EmployeesPage)
- ✅ `GET /api/v1/admin/employees/{id}` - Chi tiết nhân viên
- ✅ `POST /api/v1/admin/employees` - Tạo nhân viên (EmployeesPage)
- ✅ `PUT /api/v1/admin/employees/{id}` - Cập nhật nhân viên (EmployeesPage)
- ✅ `DELETE /api/v1/admin/employees/{id}` - Xóa nhân viên (EmployeesPage)

### 8. Report APIs
- ✅ `GET /api/reports/revenue/excel` - Báo cáo doanh thu Excel (ReportsPage)
- ✅ `GET /api/reports/inventory/excel` - Báo cáo tồn kho Excel (ReportsPage)
- ✅ `GET /api/reports/sales/excel` - Báo cáo bán hàng Excel (ReportsPage)

## ❌ API chưa sử dụng (có trong documentation nhưng chưa tích hợp)

### 1. Product APIs (Admin)
- ❌ `POST /api/v1/admin/products` - Tạo sản phẩm mới
- ❌ `PUT /api/v1/admin/products/{id}` - Cập nhật sản phẩm
- ❌ `GET /api/v1/admin/products` - Danh sách sản phẩm (admin)
- ❌ `GET /api/v1/admin/products/{id}` - Chi tiết sản phẩm (admin)
- ❌ `GET /api/v1/admin/products/search` - Tìm kiếm sản phẩm (admin)
- ❌ `DELETE /api/v1/admin/products/{id}` - Xóa sản phẩm

### 2. Customer APIs (Admin)
- ❌ `POST /api/v1/admin/customers` - Tạo khách hàng mới
- ❌ `PUT /api/v1/admin/customers/{id}` - Cập nhật khách hàng
- ❌ `GET /api/v1/admin/customers` - Danh sách khách hàng (admin)
- ❌ `GET /api/v1/admin/customers/{id}` - Chi tiết khách hàng (admin)
- ❌ `GET /api/v1/admin/customers/phone/{phone}` - Tìm theo số điện thoại (admin)
- ❌ `GET /api/v1/admin/customers/search` - Tìm kiếm khách hàng (admin)
- ❌ `DELETE /api/v1/admin/customers/{id}` - Xóa khách hàng

### 3. Inventory APIs
- ❌ `POST /api/v1/admin/inventory/import` - Nhập hàng
- ❌ `POST /api/v1/admin/inventory/return` - Trả hàng
- ❌ `GET /api/v1/admin/inventory/stock/{productId}` - Kiểm tra tồn kho

### 4. POS Payment APIs
- ❌ `POST /api/v1/pos/payments/refund` - Hoàn tiền
- ❌ `GET /api/v1/pos/payments/{transactionId}` - Lấy giao dịch thanh toán
- ❌ `GET /api/v1/pos/payments/invoice/{invoiceId}` - Lấy danh sách giao dịch theo hóa đơn
- ❌ `POST /api/v1/pos/payments/reconcile/{transactionId}` - Đối soát thanh toán

## 📝 Ghi chú

1. **Mock API đã được loại bỏ**: Tất cả các API client đã được cập nhật để sử dụng API thực tế thay vì mock API.

2. **Fallback data**: Một số trang vẫn có mock data làm fallback khi API thất bại để đảm bảo trải nghiệm người dùng.

3. **Error handling**: Tất cả các API call đều có error handling và hiển thị thông báo lỗi phù hợp.

4. **Authentication**: Tất cả các API call đều tự động thêm JWT token vào header thông qua interceptor.

5. **API Base URLs**:
   - Public APIs: `http://localhost:8081/api`
   - V1 APIs: `http://localhost:8081/api/v1`

## 🔄 Các API có thể cần tích hợp thêm

1. **Product Management**: Thêm/sửa/xóa sản phẩm trong ProductsPage
2. **Customer Management**: Thêm/sửa/xóa khách hàng trong CustomersPage
3. **Inventory Management**: Nhập hàng và trả hàng trong InventoryPage
4. **Payment Refund**: Hoàn tiền trong InvoiceDetailPage hoặc POS
5. **Payment Reconciliation**: Đối soát thanh toán trong ReportsPage hoặc InvoicesPage

