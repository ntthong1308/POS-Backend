# 📘 Phần 3: Chi Tiết Từng Module

> Tài liệu mô tả chi tiết từng module: chức năng, flow logic, các file quan trọng

---

## 3.1. Module: Product (Sản Phẩm)

### **3.1.1. Chức Năng**

Module Product quản lý toàn bộ thông tin sản phẩm trong hệ thống, bao gồm:
- CRUD sản phẩm
- Tìm kiếm sản phẩm
- Quét barcode
- Quản lý tồn kho
- Cảnh báo tồn kho thấp

### **3.1.2. API Endpoints**

#### **Admin APIs** (`/api/v1/admin/products`)

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| POST | `/api/v1/admin/products` | Tạo sản phẩm mới | ADMIN, MANAGER |
| PUT | `/api/v1/admin/products/{id}` | Cập nhật sản phẩm | ADMIN, MANAGER |
| GET | `/api/v1/admin/products/{id}` | Lấy sản phẩm theo ID | ADMIN, MANAGER |
| GET | `/api/v1/admin/products` | Lấy danh sách sản phẩm (pagination) | ADMIN, MANAGER |
| GET | `/api/v1/admin/products/search` | Tìm kiếm sản phẩm | ADMIN, MANAGER |
| GET | `/api/v1/admin/products/low-stock` | Lấy sản phẩm tồn kho thấp | ADMIN, MANAGER |
| DELETE | `/api/v1/admin/products/{id}` | Xóa sản phẩm | ADMIN, MANAGER |
| PATCH | `/api/v1/admin/products/{id}/status` | Cập nhật trạng thái | ADMIN, MANAGER |

#### **POS APIs** (`/api/v1/pos/products`)

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| GET | `/api/v1/pos/products/barcode/{barcode}` | Quét sản phẩm bằng barcode | CASHIER, MANAGER, ADMIN |
| GET | `/api/v1/pos/products/search` | Tìm kiếm sản phẩm (POS) | CASHIER, MANAGER, ADMIN |

#### **Public APIs** (`/api/products`)

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| GET | `/api/products/{id}` | Lấy sản phẩm theo ID (public) | Public |

### **3.1.3. Flow Logic Chi Tiết**

#### **Flow 1: Tạo Sản Phẩm**

```
POST /api/v1/admin/products
Request Body: ProductDTO
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductAdminController.createProduct()                  │
│ - @Valid validation                                     │
│ - Call ProductService.create()                          │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductService.create()                                 │
│ @Transactional                                          │
│ @CacheEvict(value = "products", allEntries = true)      │
│                                                          │
│ 1. Validate:                                           │
│    - Check barcode duplicate (if provided)             │
│    - Check maSanPham duplicate                          │
│                                                          │
│ 2. Map DTO → Entity (ProductMapper)                    │
│                                                          │
│ 3. Set default status: Status.ACTIVE                    │
│                                                          │
│ 4. Save to database (SanPhamRepository.save())         │
│                                                          │
│ 5. Clear cache (all products cache)                     │
│                                                          │
│ 6. Map Entity → DTO                                    │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return ProductDTO
```

**Input:**
```json
{
  "maSanPham": "SP001",
  "barcode": "1234567890123",
  "tenSanPham": "Cà phê đen",
  "moTa": "Cà phê đen pha phin",
  "donViTinh": "Ly",
  "giaBan": 25000,
  "giaNhap": 15000,
  "tonKho": 100,
  "tonKhoToiThieu": 20,
  "hinhAnh": "/uploads/products/abc123.jpg",
  "chiNhanhId": 1,
  "nhaCungCapId": 1
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "maSanPham": "SP001",
    "barcode": "1234567890123",
    "tenSanPham": "Cà phê đen",
    ...
  }
}
```

**Error Cases:**
- `DUPLICATE_BARCODE`: Barcode đã tồn tại
- `VALIDATION_ERROR`: Thiếu required fields
- `NOT_FOUND`: Chi nhánh/Nhà cung cấp không tồn tại

---

#### **Flow 2: Tìm Sản Phẩm Theo ID (Cached)**

```
GET /api/v1/admin/products/1
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductAdminController.getProduct()                    │
│ - Call ProductService.findById(1)                      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductService.findById()                               │
│ @Cacheable(value = "products", key = "#id")              │
│                                                          │
│ 1. Check Redis cache:                                   │
│    Key: "retail:products::1"                            │
│    - Cache HIT → Return from cache (fast ~10-50ms)      │
│    - Cache MISS → Continue                             │
│                                                          │
│ 2. Query database (SanPhamRepository.findById())        │
│                                                          │
│ 3. Map Entity → DTO                                     │
│                                                          │
│ 4. Save to Redis cache (TTL: 1 hour)                   │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return ProductDTO
```

**Cache Strategy:**
- **First call:** Query database (~200-500ms)
- **Subsequent calls:** Get from Redis (~10-50ms)
- **TTL:** 1 hour
- **Cache key:** `retail:products::{id}`

---

#### **Flow 3: Quét Barcode (POS)**

```
GET /api/v1/pos/products/barcode/1234567890123
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ PosProductController.scanProduct()                      │
│ - Call PosService.scanProduct(barcode)                  │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ PosService.scanProduct()                                │
│ - Call ProductService.findByBarcode()                   │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductService.findByBarcode()                           │
│ @Cacheable(value = "products", key = "'barcode:' + #barcode") │
│                                                          │
│ 1. Check Redis cache:                                   │
│    Key: "retail:products::barcode:1234567890123"        │
│                                                          │
│ 2. Query database (SanPhamRepository.findByBarcode())   │
│                                                          │
│ 3. Validate:                                            │
│    - Product exists                                     │
│    - Product is ACTIVE                                  │
│    - Stock > 0                                         │
│                                                          │
│ 4. Save to cache                                        │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return ProductDTO
```

**Error Cases:**
- `NOT_FOUND`: Không tìm thấy sản phẩm với barcode
- `INACTIVE_PRODUCT`: Sản phẩm đã ngừng hoạt động
- `OUT_OF_STOCK`: Sản phẩm hết hàng

---

#### **Flow 4: Tìm Kiếm Sản Phẩm**

```
GET /api/v1/admin/products/search?keyword=cà phê&page=0&size=20
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductAdminController.searchProducts()                 │
│ - Call ProductService.search(keyword, pageable)         │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductService.search()                                 │
│                                                          │
│ 1. Call Repository:                                     │
│    SanPhamRepository.searchByKeyword()                 │
│    - Search in: tenSanPham, maSanPham, barcode         │
│    - Case-insensitive                                   │
│    - LIKE '%keyword%'                                   │
│                                                          │
│ 2. Pagination:                                          │
│    - Page: 0 (first page)                              │
│    - Size: 20 items per page                           │
│                                                          │
│ 3. Map Entity → DTO (Page<ProductDTO>)                  │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return Page<ProductDTO>
```

**Query:**
```sql
SELECT s FROM SanPham s WHERE 
  LOWER(s.tenSanPham) LIKE LOWER('%cà phê%') OR
  LOWER(s.maSanPham) LIKE LOWER('%cà phê%') OR
  LOWER(s.barcode) LIKE LOWER('%cà phê%')
```

---

#### **Flow 5: Cập Nhật Sản Phẩm**

```
PUT /api/v1/admin/products/1
Request Body: ProductDTO
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductService.update()                                 │
│ @Transactional                                          │
│ @Caching(                                                │
│   put = @CachePut(value = "products", key = "#id"),     │
│   evict = @CacheEvict(value = "products", allEntries = true) │
│ )                                                        │
│                                                          │
│ 1. Load existing entity                                 │
│                                                          │
│ 2. Validate:                                            │
│    - Check barcode duplicate (if changed)                │
│                                                          │
│ 3. Update entity from DTO (ProductMapper)               │
│                                                          │
│ 4. Save to database                                     │
│                                                          │
│ 5. Update cache (put)                                   │
│ 6. Clear list cache (evict)                             │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return ProductDTO
```

---

#### **Flow 6: Lấy Sản Phẩm Tồn Kho Thấp**

```
GET /api/v1/admin/products/low-stock
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ProductService.findLowStockProducts()                   │
│                                                          │
│ 1. Query database:                                      │
│    SanPhamRepository.findLowStockProducts()             │
│    - WHERE tonKho < tonKhoToiThieu                     │
│    - AND trangThai = ACTIVE                             │
│                                                          │
│ 2. Map Entity → DTO                                     │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return List<ProductDTO>
```

**Query:**
```sql
SELECT s FROM SanPham s 
WHERE s.tonKho < s.tonKhoToiThieu 
  AND s.trangThai = 'ACTIVE'
```

---

### **3.1.4. Các File Quan Trọng**

#### **Controller:**
- **File:** `retail-admin-api/src/main/java/com/retail/admin/controller/ProductAdminController.java`
- **Chức năng:** Xử lý HTTP requests cho admin APIs
- **Methods:**
  - `createProduct()` - POST `/api/v1/admin/products`
  - `updateProduct()` - PUT `/api/v1/admin/products/{id}`
  - `getProduct()` - GET `/api/v1/admin/products/{id}`
  - `getAllProducts()` - GET `/api/v1/admin/products`
  - `searchProducts()` - GET `/api/v1/admin/products/search`
  - `getLowStockProducts()` - GET `/api/v1/admin/products/low-stock`
  - `deleteProduct()` - DELETE `/api/v1/admin/products/{id}`
  - `updateProductStatus()` - PATCH `/api/v1/admin/products/{id}/status`

- **File:** `retail-pos-api/src/main/java/com/retail/pos/controller/PosProductController.java`
- **Chức năng:** Xử lý HTTP requests cho POS APIs
- **Methods:**
  - `scanProduct()` - GET `/api/v1/pos/products/barcode/{barcode}`
  - `searchProducts()` - GET `/api/v1/pos/products/search`

- **File:** `retail-api/src/main/java/com/retail/api/controller/ProductController.java`
- **Chức năng:** Xử lý HTTP requests cho public APIs
- **Methods:**
  - `getProduct()` - GET `/api/products/{id}`

#### **Service:**
- **File:** `retail-application/src/main/java/com/retail/application/service/product/ProductService.java`
- **Interface:** Định nghĩa các methods

- **File:** `retail-application/src/main/java/com/retail/application/service/product/ProductServiceImpl.java`
- **Implementation:** Business logic
- **Features:**
  - Redis caching (`@Cacheable`, `@CacheEvict`, `@CachePut`)
  - Transaction management (`@Transactional`)
  - Validation (duplicate check)
  - Error handling

#### **Repository:**
- **File:** `retail-persistence/src/main/java/com/retail/persistence/repository/SanPhamRepository.java`
- **Chức năng:** Data access layer
- **Methods:**
  - `findByMaSanPham()` - Tìm theo mã sản phẩm
  - `findByBarcode()` - Tìm theo barcode
  - `existsByBarcode()` - Kiểm tra barcode tồn tại
  - `existsByMaSanPham()` - Kiểm tra mã sản phẩm tồn tại
  - `findByTrangThai()` - Tìm theo trạng thái (pagination)
  - `searchByKeyword()` - Tìm kiếm (JPQL)
  - `findLowStockProducts()` - Tìm sản phẩm tồn kho thấp (JPQL)
  - `findAllForInventoryReport()` - Lấy tất cả cho báo cáo tồn kho

#### **Entity:**
- **File:** `retail-domain/src/main/java/com/retail/domain/entity/SanPham.java`
- **Fields:**
  - `id` - Primary key
  - `maSanPham` - Mã sản phẩm (unique)
  - `barcode` - Barcode (unique, nullable)
  - `tenSanPham` - Tên sản phẩm
  - `moTa` - Mô tả
  - `donViTinh` - Đơn vị tính
  - `giaBan` - Giá bán
  - `giaNhap` - Giá nhập
  - `tonKho` - Tồn kho
  - `tonKhoToiThieu` - Tồn kho tối thiểu
  - `hinhAnh` - URL hình ảnh
  - `chiNhanh` - Chi nhánh (ManyToOne)
  - `nhaCungCap` - Nhà cung cấp (ManyToOne)
  - `trangThai` - Trạng thái (ACTIVE, INACTIVE)

#### **DTO:**
- **File:** `retail-application/src/main/java/com/retail/application/dto/ProductDTO.java`
- **Fields:** Tương tự Entity, nhưng dùng Long cho foreign keys

#### **Mapper:**
- **File:** `retail-application/src/main/java/com/retail/application/mapper/ProductMapper.java`
- **Chức năng:** Map Entity ↔ DTO (MapStruct)
- **Methods:**
  - `toDto(SanPham)` - Entity → DTO
  - `toEntity(ProductDTO)` - DTO → Entity
  - `updateEntityFromDto(ProductDTO, SanPham)` - Update entity từ DTO

---

### **3.1.5. Business Rules**

1. **Barcode phải unique** (nếu có)
2. **Mã sản phẩm phải unique**
3. **Tồn kho không được âm**
4. **Chỉ sản phẩm ACTIVE mới được bán**
5. **Cache TTL: 1 giờ** cho individual products
6. **Cache bị xóa** khi create/update/delete

---

## 3.2. Module: POS (Point of Sale)

### **3.2.1. Chức Năng**

Module POS xử lý toàn bộ nghiệp vụ bán hàng tại quầy:
- Quét sản phẩm
- Validate giỏ hàng
- Thanh toán và tạo hóa đơn
- Áp dụng khuyến mãi
- Tính điểm tích lũy
- Quản lý hóa đơn

### **3.2.2. API Endpoints**

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| POST | `/api/v1/pos/checkout` | Thanh toán và tạo hóa đơn | CASHIER, MANAGER, ADMIN |
| POST | `/api/v1/pos/checkout/validate` | Validate giỏ hàng | CASHIER, MANAGER, ADMIN |
| GET | `/api/v1/pos/invoices/{id}` | Lấy hóa đơn theo ID | CASHIER, MANAGER, ADMIN |
| GET | `/api/v1/pos/invoices/by-date` | Lấy hóa đơn theo ngày | CASHIER, MANAGER, ADMIN |

### **3.2.3. Flow Logic Chi Tiết**

#### **Flow 1: Validate Giỏ Hàng**

```
POST /api/v1/pos/checkout/validate
Request Body: CheckoutRequest
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ PosCheckoutController.validateCart()                     │
│ - @Valid validation                                     │
│ - Call PosService.validateCart()                         │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ PosService.validateCart()                                │
│                                                          │
│ For each item in cart:                                  │
│   1. Load SanPham from database                         │
│   2. Validate:                                          │
│      - Product exists                                   │
│      - Product is ACTIVE                                │
│      - Stock >= quantity                                │
│      - Quantity > 0                                     │
│      - Price > 0                                        │
│                                                          │
│ If any validation fails → throw BusinessException       │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return "Giỏ hàng hợp lệ"
```

**Validation Rules:**
- Sản phẩm phải tồn tại
- Sản phẩm phải ACTIVE
- Tồn kho >= số lượng yêu cầu
- Số lượng > 0
- Đơn giá > 0

---

#### **Flow 2: Checkout (Thanh Toán)**

```
POST /api/v1/pos/checkout
Request Body: CheckoutRequest
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ PosCheckoutController.checkout()                         │
│ - @Valid validation                                     │
│ - Call PosService.checkout()                             │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ PosService.checkout()                                   │
│ @Transactional                                          │
│ @CacheEvict(value = "invoices", allEntries = true)      │
│                                                          │
│ 1. Validate cart:                                      │
│    - Call validateCart()                                │
│                                                          │
│ 2. Load entities:                                       │
│    - NhanVien (from nhanVienId)                         │
│    - ChiNhanh (from chiNhanhId)                         │
│    - KhachHang (from khachHangId, optional)            │
│                                                          │
│ 3. Create HoaDon:                                      │
│    - Generate invoice code (HD-YYYYMMDD-XXXX)          │
│    - Set ngayTao = now()                               │
│    - Set trangThai = COMPLETED                          │
│                                                          │
│ 4. For each item:                                       │
│    a. Load SanPham                                     │
│    b. Create ChiTietHoaDon:                            │
│       - soLuong, donGia, thanhTien                     │
│    c. Add to HoaDon                                     │
│    d. Update stock:                                     │
│       sanPham.setTonKho(tonKho - soLuong)              │
│    e. Save SanPham                                      │
│                                                          │
│ 5. Calculate totals:                                    │
│    - tongTien = sum(chiTiet.thanhTien)                 │
│                                                          │
│ 6. Apply promotions:                                   │
│    - Call PromotionService.calculateDiscount()          │
│    - Add to giamGia                                    │
│                                                          │
│ 7. Calculate final amount:                             │
│    - thanhTien = tongTien - giamGia - diemSuDung       │
│    - If thanhTien < 0 → thanhTien = 0                  │
│                                                          │
│ 8. Calculate points:                                    │
│    - diemTichLuy = thanhTien * 0.01 (1%)                │
│                                                          │
│ 9. Update customer points (if khachHang exists):       │
│    - Subtract diemSuDung                                │
│    - Add diemTichLuy                                    │
│                                                          │
│ 10. Save HoaDon                                        │
│                                                          │
│ 11. Clear invoices cache                               │
│                                                          │
│ 12. Map Entity → DTO                                   │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return InvoiceDTO
```

**Request Body:**
```json
{
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "khachHangId": 1,
  "phuongThucThanhToan": "TIEN_MAT",
  "giamGia": 0,
  "diemSuDung": 0,
  "ghiChu": "Khách hàng VIP",
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "donGia": 25000,
      "ghiChu": "Nóng"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "maHoaDon": "HD-20251206-0001",
    "ngayTao": "2025-12-06T10:30:00",
    "tongTien": 50000,
    "giamGia": 5000,
    "thanhTien": 45000,
    "diemTichLuy": 450,
    "chiTietHoaDons": [...]
  }
}
```

**Error Cases:**
- `VALIDATION_ERROR`: Thiếu required fields
- `NOT_FOUND`: Sản phẩm/Nhân viên/Chi nhánh không tồn tại
- `INSUFFICIENT_STOCK`: Không đủ tồn kho
- `INACTIVE_PRODUCT`: Sản phẩm đã ngừng hoạt động

---

#### **Flow 3: Lấy Hóa Đơn Theo Ngày**

```
GET /api/v1/pos/invoices/by-date?date=2025-12-06
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ PosInvoiceController.getInvoicesByDate()                 │
│ - Parse date parameter                                  │
│ - Call PosService.getInvoicesByDate()                    │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ PosService.getInvoicesByDate()                           │
│                                                          │
│ 1. Parse date string to LocalDate                       │
│                                                          │
│ 2. Query database:                                      │
│    HoaDonRepository.findByNgayTaoBetween()              │
│    - FROM: date 00:00:00                                │
│    - TO: date 23:59:59                                  │
│    - JOIN FETCH chiTietHoaDons                          │
│                                                          │
│ 3. Map Entity → DTO                                     │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return List<InvoiceDTO>
```

**Date Range Query:**
```
GET /api/v1/pos/invoices/by-date?fromDate=2025-12-01&toDate=2025-12-06
```

---

### **3.2.4. Các File Quan Trọng**

#### **Controller:**
- **File:** `retail-pos-api/src/main/java/com/retail/pos/controller/PosCheckoutController.java`
- **Methods:**
  - `checkout()` - POST `/api/v1/pos/checkout`
  - `validateCart()` - POST `/api/v1/pos/checkout/validate`

- **File:** `retail-pos-api/src/main/java/com/retail/pos/controller/PosInvoiceController.java`
- **Methods:**
  - `getInvoice()` - GET `/api/v1/pos/invoices/{id}`
  - `getInvoicesByDate()` - GET `/api/v1/pos/invoices/by-date`

#### **Service:**
- **File:** `retail-application/src/main/java/com/retail/application/service/pos/PosService.java`
- **File:** `retail-application/src/main/java/com/retail/application/service/pos/PosServiceImpl.java`
- **Features:**
  - Transaction management
  - Stock management
  - Promotion calculation
  - Customer points management

#### **Repository:**
- **File:** `retail-persistence/src/main/java/com/retail/persistence/repository/HoaDonRepository.java`
- **Methods:**
  - `findByNgayTaoBetween()` - Tìm hóa đơn theo khoảng ngày
  - `findByIdWithDetails()` - Tìm hóa đơn với chi tiết

#### **DTO:**
- **File:** `retail-application/src/main/java/com/retail/application/dto/CheckoutRequest.java`
- **File:** `retail-application/src/main/java/com/retail/application/dto/CartItemDTO.java`
- **File:** `retail-application/src/main/java/com/retail/application/dto/InvoiceDTO.java`

---

### **3.2.5. Business Rules**

1. **Tồn kho phải >= số lượng** trước khi checkout
2. **Sản phẩm phải ACTIVE** mới được bán
3. **Tự động áp dụng khuyến mãi** nếu có
4. **Điểm tích lũy = 1%** của thanhTien
5. **Invoice code tự động sinh:** `HD-YYYYMMDD-XXXX`
6. **Transaction rollback** nếu có lỗi

---

## 3.3. Module: Dashboard

### **3.3.1. Chức Năng**

Module Dashboard cung cấp thống kê tổng quan cho admin/manager:
- Thống kê hôm nay (doanh thu, đơn hàng, lợi nhuận, khách hàng)
- So sánh với hôm qua (% thay đổi)
- Thống kê đơn hàng theo ngày (7 ngày gần nhất)
- Tổng quan doanh số (7 ngày gần nhất)
- Top sản phẩm bán chạy

### **3.3.2. API Endpoints**

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| GET | `/api/v1/admin/dashboard?date=2025-12-06` | Lấy thống kê dashboard | ADMIN, MANAGER |

**Query Parameters:**
- `date` (optional) - Ngày cần thống kê (format: `YYYY-MM-DD`), mặc định: hôm nay

### **3.3.3. Flow Logic Chi Tiết**

#### **Flow: Lấy Dashboard Stats**

```
GET /api/v1/admin/dashboard?date=2025-12-06
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ DashboardController.getDashboardStats()                 │
│ - Parse date parameter (default: today)                 │
│ - Call DashboardService.getDashboardStats()             │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ DashboardService.getDashboardStats()                     │
│                                                          │
│ 1. Calculate Today Stats:                               │
│    - Query invoices for date (COMPLETED)                │
│    - Calculate:                                          │
│      * doanhThu = sum(thanhTien)                        │
│      * tongDon = count(invoices)                        │
│      * loiNhuan = doanhThu * 0.1 (10%)                  │
│      * khachHang = count(distinct khachHang)            │
│    - Query invoices for yesterday                       │
│    - Calculate % change:                                 │
│      * change = ((today - yesterday) / yesterday) * 100 │
│                                                          │
│ 2. Calculate Order Stats By Date (7 days):              │
│    - For each day (date - 6 to date):                  │
│      * Query invoices for that day                     │
│      * Calculate donHang, doanhSo                      │
│      * Format date: "d MMM" (e.g., "2 Jan")            │
│                                                          │
│ 3. Calculate Sales Overview (7 days):                  │
│    - For each day:                                      │
│      * Query invoices                                   │
│      * Calculate doanhSo, loiNhuan                      │
│      * Format day of week: "EEE" (e.g., "SAT")         │
│                                                          │
│ 4. Get Top Products:                                    │
│    - Call ReportService.getTopSellingProducts()         │
│    - Date range: date - 30 days to date                 │
│    - Limit: 10                                          │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return DashboardStatsDTO
```

**Response:**
```json
{
  "data": {
    "todayStats": {
      "doanhThu": 1000000,
      "doanhThuChange": 10.5,
      "tongDon": 50,
      "tongDonChange": 5.2,
      "loiNhuan": 100000,
      "loiNhuanChange": 8.3,
      "khachHang": 30,
      "khachHangChange": 2.1
    },
    "orderStatsByDate": [
      {
        "date": "2 Jan",
        "donHang": 10,
        "doanhSo": 200000
      }
    ],
    "salesOverview": [
      {
        "date": "SAT",
        "doanhSo": 500000,
        "loiNhuan": 50000
      }
    ],
    "topProducts": [
      {
        "sanPhamId": 1,
        "tenSanPham": "Cà phê đen",
        "soLuongBan": 100,
        "totalRevenue": 2500000
      }
    ]
  }
}
```

### **3.3.4. Các File Quan Trọng**

#### **Controller:**
- **File:** `retail-admin-api/src/main/java/com/retail/admin/controller/DashboardController.java`
- **Methods:**
  - `getDashboardStats()` - GET `/api/v1/admin/dashboard`

#### **Service:**
- **File:** `retail-application/src/main/java/com/retail/application/service/dashboard/DashboardService.java`
- **File:** `retail-application/src/main/java/com/retail/application/service/dashboard/DashboardServiceImpl.java`
- **Features:**
  - Calculate today's stats
  - Calculate percentage changes
  - Generate charts data (7 days)
  - Top products analysis

#### **DTO:**
- **File:** `retail-application/src/main/java/com/retail/application/dto/DashboardStatsDTO.java`
- **Nested DTOs:**
  - `TodayStats` - Thống kê hôm nay
  - `OrderStatsByDate` - Thống kê đơn hàng theo ngày
  - `SalesOverview` - Tổng quan doanh số
  - `TopProductDTO` - Top sản phẩm

### **3.3.5. Business Rules**

1. **Lợi nhuận = 10%** của doanh thu (có thể tính chính xác từ giá nhập/giá bán)
2. **% thay đổi** được tính so với hôm qua
3. **Top products** lấy từ 30 ngày gần nhất
4. **Chỉ tính hóa đơn COMPLETED**

---

## 3.4. Module: Raw Material (Nguyên Liệu)

### **3.4.1. Chức Năng**

Module Raw Material quản lý nguyên liệu (nguyên liệu thô) như cà phê, nha đam, etc.:
- CRUD nguyên liệu
- Nhập/xuất nguyên liệu
- Quản lý tồn kho
- Cảnh báo tồn kho thấp

### **3.4.2. API Endpoints**

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| POST | `/api/v1/admin/nguyen-lieu` | Tạo nguyên liệu mới | ADMIN, MANAGER |
| PUT | `/api/v1/admin/nguyen-lieu/{id}` | Cập nhật nguyên liệu | ADMIN, MANAGER |
| GET | `/api/v1/admin/nguyen-lieu/{id}` | Lấy nguyên liệu theo ID | ADMIN, MANAGER |
| GET | `/api/v1/admin/nguyen-lieu` | Lấy danh sách nguyên liệu (pagination) | ADMIN, MANAGER |
| GET | `/api/v1/admin/nguyen-lieu/search` | Tìm kiếm nguyên liệu | ADMIN, MANAGER |
| DELETE | `/api/v1/admin/nguyen-lieu/{id}` | Xóa nguyên liệu | ADMIN, MANAGER |
| PATCH | `/api/v1/admin/nguyen-lieu/{id}/status` | Cập nhật trạng thái | ADMIN, MANAGER |
| POST | `/api/v1/admin/nguyen-lieu/nhap` | Nhập nguyên liệu | ADMIN, MANAGER |
| POST | `/api/v1/admin/nguyen-lieu/xuat` | Xuất nguyên liệu | ADMIN, MANAGER |
| GET | `/api/v1/admin/nguyen-lieu/low-stock` | Lấy nguyên liệu tồn kho thấp | ADMIN, MANAGER |

### **3.4.3. Flow Logic Chi Tiết**

#### **Flow 1: Tạo Nguyên Liệu**

```
POST /api/v1/admin/nguyen-lieu
Request Body: NguyenLieuDTO
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ NguyenLieuService.create()                               │
│ @Transactional                                          │
│                                                          │
│ 1. Validate:                                            │
│    - Check maNguyenLieu duplicate                        │
│                                                          │
│ 2. Map DTO → Entity                                     │
│                                                          │
│ 3. Set default:                                         │
│    - trangThai = ACTIVE                                 │
│    - soLuong = 0 (if null)                              │
│                                                          │
│ 4. Save to database                                     │
└─────────────────────────────────────────────────────────┘
```

**Input:**
```json
{
  "maNguyenLieu": "NL001",
  "tenNguyenLieu": "Cà phê phin",
  "donViTinh": "Kg",
  "tonKho": 0,
  "tonKhoToiThieu": 10,
  "chiNhanhId": 1
}
```

---

#### **Flow 2: Nhập Nguyên Liệu**

```
POST /api/v1/admin/nguyen-lieu/nhap
Request Body: NhapXuatNguyenLieuRequest
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ NguyenLieuService.nhapNguyenLieu()                       │
│ @Transactional                                          │
│                                                          │
│ 1. Load entities:                                       │
│    - NguyenLieu                                         │
│    - NhanVien                                           │
│                                                          │
│ 2. Tăng số lượng:                                       │
│    - nguyenLieu.tangSoLuong(soLuong)                    │
│    - Save NguyenLieu                                     │
│                                                          │
│ 3. Tạo phiếu nhập:                                      │
│    - Generate code: "NHAP-YYYYMMDDHHmmss-UUID"          │
│    - Set loaiPhieu = NHAP                               │
│    - Set ngayNhapXuat = now()                          │
│    - Save PhieuNhapXuatNguyenLieu                       │
└─────────────────────────────────────────────────────────┘
```

**Input:**
```json
{
  "nguyenLieuId": 1,
  "soLuong": 50,
  "nhanVienId": 1,
  "loaiPhieu": "NHAP",
  "ghiChu": "Nhập từ nhà cung cấp"
}
```

---

#### **Flow 3: Xuất Nguyên Liệu**

```
POST /api/v1/admin/nguyen-lieu/xuat
Request Body: NhapXuatNguyenLieuRequest
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ NguyenLieuService.xuatNguyenLieu()                       │
│ @Transactional                                          │
│                                                          │
│ 1. Load entities:                                       │
│    - NguyenLieu                                         │
│    - NhanVien                                           │
│                                                          │
│ 2. Validate:                                            │
│    - Check: tonKho >= soLuong                           │
│                                                          │
│ 3. Giảm số lượng:                                       │
│    - nguyenLieu.giamSoLuong(soLuong)                    │
│    - Save NguyenLieu                                     │
│                                                          │
│ 4. Tạo phiếu xuất:                                      │
│    - Generate code: "XUAT-YYYYMMDDHHmmss-UUID"          │
│    - Set loaiPhieu = XUAT                               │
│    - Save PhieuNhapXuatNguyenLieu                       │
└─────────────────────────────────────────────────────────┘
```

**Error Cases:**
- `INSUFFICIENT_STOCK` - Không đủ nguyên liệu

---

### **3.4.4. Các File Quan Trọng**

#### **Controller:**
- **File:** `retail-admin-api/src/main/java/com/retail/admin/controller/NguyenLieuAdminController.java`
- **Methods:** CRUD + nhap/xuat operations

#### **Service:**
- **File:** `retail-application/src/main/java/com/retail/application/service/nguyenlieu/NguyenLieuService.java`
- **File:** `retail-application/src/main/java/com/retail/application/service/nguyenlieu/NguyenLieuServiceImpl.java`

#### **Entity:**
- **File:** `retail-domain/src/main/java/com/retail/domain/entity/NguyenLieu.java`
- **File:** `retail-domain/src/main/java/com/retail/domain/entity/PhieuNhapXuatNguyenLieu.java`

### **3.4.5. Business Rules**

1. **Mã nguyên liệu phải unique**
2. **Nhập → Tăng số lượng** (`tangSoLuong()`)
3. **Xuất → Giảm số lượng** (`giamSoLuong()`)
4. **Xuất phải kiểm tra tồn kho** trước
5. **Phiếu code tự động sinh:** `NHAP-YYYYMMDDHHmmss-UUID` hoặc `XUAT-YYYYMMDDHHmmss-UUID`

---

## 3.5. Module: Customer (Khách Hàng)

### **3.5.1. Chức Năng**

Module Customer quản lý thông tin khách hàng:
- CRUD khách hàng
- Tìm kiếm khách hàng (theo SĐT, tên)
- Quản lý điểm tích lũy
- Lịch sử mua hàng

### **3.5.2. API Endpoints**

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| POST | `/api/v1/admin/customers` | Tạo khách hàng mới | ADMIN, MANAGER |
| PUT | `/api/v1/admin/customers/{id}` | Cập nhật khách hàng | ADMIN, MANAGER |
| GET | `/api/v1/admin/customers/{id}` | Lấy khách hàng theo ID | ADMIN, MANAGER |
| GET | `/api/v1/admin/customers/phone/{phone}` | Lấy khách hàng theo SĐT | ADMIN, MANAGER |
| GET | `/api/v1/admin/customers` | Lấy danh sách khách hàng (pagination) | ADMIN, MANAGER |
| GET | `/api/v1/admin/customers/search` | Tìm kiếm khách hàng | ADMIN, MANAGER |
| DELETE | `/api/v1/admin/customers/{id}` | Xóa khách hàng | ADMIN, MANAGER |
| PATCH | `/api/v1/admin/customers/{id}/points` | Cập nhật điểm tích lũy | ADMIN, MANAGER |

### **3.5.3. Flow Logic Chi Tiết**

#### **Flow 1: Tạo Khách Hàng**

```
POST /api/v1/admin/customers
Request Body: CustomerDTO
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ CustomerService.create()                                 │
│ @Transactional                                          │
│ @CacheEvict(value = "customers", allEntries = true)     │
│                                                          │
│ 1. Validate:                                            │
│    - Check soDienThoai duplicate (if provided)          │
│                                                          │
│ 2. Map DTO → Entity                                     │
│                                                          │
│ 3. Set default:                                         │
│    - trangThai = ACTIVE                                 │
│    - diemTichLuy = 0                                    │
│                                                          │
│ 4. Save to database                                     │
│                                                          │
│ 5. Clear cache                                          │
└─────────────────────────────────────────────────────────┘
```

**Input:**
```json
{
  "maKhachHang": "KH001",
  "tenKhachHang": "Nguyễn Văn B",
  "soDienThoai": "0123456789",
  "email": "customer@example.com",
  "diaChi": "123 Đường ABC"
}
```

---

#### **Flow 2: Tìm Khách Hàng Theo SĐT (Cached)**

```
GET /api/v1/admin/customers/phone/0123456789
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ CustomerService.findByPhone()                            │
│ @Cacheable(value = "customers", key = "'phone:' + #phone") │
│                                                          │
│ 1. Check Redis cache:                                   │
│    Key: "retail:customers::phone:0123456789"            │
│                                                          │
│ 2. Query database:                                      │
│    KhachHangRepository.findBySoDienThoai()              │
│                                                          │
│ 3. Save to cache (TTL: 15 minutes)                     │
└─────────────────────────────────────────────────────────┘
```

**Cache Strategy:**
- **TTL:** 15 minutes
- **Cache key:** `retail:customers::phone:{phone}`

---

#### **Flow 3: Cập Nhật Điểm Tích Lũy**

```
PATCH /api/v1/admin/customers/1/points?points=100
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ CustomerService.updatePoints()                           │
│ @Transactional                                          │
│ @CacheEvict(value = "customers", key = "#id")            │
│ @CacheEvict(value = "customers", allEntries = true)      │
│                                                          │
│ 1. Load KhachHang                                       │
│                                                          │
│ 2. Update points:                                       │
│    - diemTichLuy += points (add, not replace)            │
│                                                          │
│ 3. Save                                                 │
│                                                          │
│ 4. Clear cache                                          │
└─────────────────────────────────────────────────────────┘
```

**Note:** Points được **cộng thêm**, không thay thế

---

### **3.5.4. Các File Quan Trọng**

#### **Controller:**
- **File:** `retail-admin-api/src/main/java/com/retail/admin/controller/CustomerAdminController.java`

#### **Service:**
- **File:** `retail-application/src/main/java/com/retail/application/service/customer/CustomerServiceImpl.java`
- **Features:**
  - Redis caching (15 minutes TTL)
  - Phone number search (cached)
  - Points management

#### **Repository:**
- **File:** `retail-persistence/src/main/java/com/retail/persistence/repository/KhachHangRepository.java`
- **Methods:**
  - `findBySoDienThoai()` - Tìm theo SĐT
  - `searchByKeyword()` - Tìm kiếm (tên, SĐT, email)

### **3.5.5. Business Rules**

1. **Số điện thoại phải unique** (nếu có)
2. **Điểm tích lũy mặc định = 0**
3. **Cache TTL: 15 phút**
4. **Soft delete** (set trangThai = DELETED)

---

## 3.6. Module: Employee (Nhân Viên)

### **3.6.1. Chức Năng**

Module Employee quản lý thông tin nhân viên:
- CRUD nhân viên
- Quản lý password
- Phân quyền (role)
- Tìm kiếm theo role

### **3.6.2. API Endpoints**

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| POST | `/api/v1/admin/employees` | Tạo nhân viên mới | ADMIN |
| PUT | `/api/v1/admin/employees/{id}` | Cập nhật nhân viên | ADMIN |
| GET | `/api/v1/admin/employees/{id}` | Lấy nhân viên theo ID | ADMIN |
| GET | `/api/v1/admin/employees` | Lấy danh sách nhân viên | ADMIN |
| GET | `/api/v1/admin/employees/by-role?role=ADMIN` | Lấy nhân viên theo role | ADMIN |
| DELETE | `/api/v1/admin/employees/{id}` | Xóa nhân viên | ADMIN |
| POST | `/api/v1/admin/employees/{id}/change-password` | Đổi mật khẩu | ADMIN |

### **3.6.3. Flow Logic Chi Tiết**

#### **Flow 1: Tạo Nhân Viên**

```
POST /api/v1/admin/employees
Request Body: EmployeeDTO
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ EmployeeService.create()                                │
│ @Transactional                                          │
│                                                          │
│ 1. Validate:                                            │
│    - Check username duplicate                           │
│    - Check maNhanVien duplicate                         │
│                                                          │
│ 2. Map DTO → Entity                                     │
│                                                          │
│ 3. Encode password:                                     │
│    - passwordEncoder.encode(password)                   │
│                                                          │
│ 4. Set default:                                         │
│    - trangThai = ACTIVE                                 │
│                                                          │
│ 5. Save to database                                     │
└─────────────────────────────────────────────────────────┘
```

**Input:**
```json
{
  "maNhanVien": "NV001",
  "tenNhanVien": "Nguyễn Văn A",
  "username": "admin",
  "password": "123456",
  "email": "admin@example.com",
  "role": "ADMIN",
  "chiNhanhId": 1
}
```

**Note:** Password được **BCrypt encoded** trước khi lưu

---

#### **Flow 2: Đổi Mật Khẩu**

```
POST /api/v1/admin/employees/1/change-password
Query Params: oldPassword, newPassword
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ EmployeeService.changePassword()                        │
│ @Transactional                                          │
│                                                          │
│ 1. Load NhanVien                                       │
│                                                          │
│ 2. Verify old password:                                │
│    - passwordEncoder.matches(oldPassword, storedHash)  │
│                                                          │
│ 3. Encode new password:                                │
│    - passwordEncoder.encode(newPassword)               │
│                                                          │
│ 4. Save                                                │
└─────────────────────────────────────────────────────────┘
```

**Error Cases:**
- `INVALID_CREDENTIALS` - Mật khẩu cũ không chính xác

---

### **3.6.4. Các File Quan Trọng**

#### **Controller:**
- **File:** `retail-admin-api/src/main/java/com/retail/admin/controller/EmployeeAdminController.java`

#### **Service:**
- **File:** `retail-application/src/main/java/com/retail/application/service/employee/EmployeeServiceImpl.java`
- **Features:**
  - Password encoding (BCrypt)
  - Username uniqueness validation
  - Role-based filtering

### **3.6.5. Business Rules**

1. **Username phải unique**
2. **Mã nhân viên phải unique**
3. **Password được BCrypt encoded**
4. **Chỉ ADMIN** mới được quản lý nhân viên
5. **Soft delete** (set trangThai = DELETED)

---

## 3.7. Module: Inventory (Tồn Kho)

### **3.7.1. Chức Năng**

Module Inventory quản lý tồn kho sản phẩm:
- Nhập hàng từ nhà cung cấp
- Trả hàng (return goods)
- Kiểm tra tồn kho
- Cập nhật giá nhập

### **3.7.2. API Endpoints**

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| POST | `/api/v1/admin/inventory/import` | Nhập hàng | ADMIN, MANAGER |
| POST | `/api/v1/admin/inventory/return` | Trả hàng | ADMIN, MANAGER |
| GET | `/api/v1/admin/inventory/stock/{productId}` | Kiểm tra tồn kho | ADMIN, MANAGER |

### **3.7.3. Flow Logic Chi Tiết**

#### **Flow 1: Nhập Hàng**

```
POST /api/v1/admin/inventory/import
Request Body: ImportGoodsRequest
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ InventoryService.importGoods()                           │
│ @Transactional                                          │
│                                                          │
│ 1. Load entities:                                       │
│    - NhaCungCap                                         │
│    - ChiNhanh                                           │
│    - NhanVien                                           │
│                                                          │
│ 2. Create NhapHang:                                     │
│    - Generate code: "NH-YYYYMMDDHHmmss"                 │
│    - Set ngayNhap = now()                               │
│    - Set trangThai = COMPLETED                          │
│                                                          │
│ 3. For each item:                                       │
│    a. Load SanPham                                     │
│    b. Create ChiTietNhapHang                            │
│    c. Update stock:                                    │
│       sanPham.setTonKho(tonKho + soLuong)              │
│    d. Update import price:                             │
│       sanPham.setGiaNhap(donGia)                       │
│    e. Save SanPham                                     │
│                                                          │
│ 4. Calculate tongTien                                   │
│                                                          │
│ 5. Save NhapHang                                       │
└─────────────────────────────────────────────────────────┘
```

**Input:**
```json
{
  "nhaCungCapId": 1,
  "chiNhanhId": 1,
  "nhanVienId": 1,
  "ghiChu": "Nhập hàng tháng 12",
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 100,
      "donGia": 15000,
      "ghiChu": ""
    }
  ]
}
```

---

#### **Flow 2: Trả Hàng**

```
POST /api/v1/admin/inventory/return
Request Body: ReturnRequest
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ InventoryService.returnGoods()                          │
│ @Transactional                                          │
│                                                          │
│ 1. Load entities:                                       │
│    - HoaDon (original invoice)                          │
│    - SanPham                                            │
│    - NhanVien                                           │
│                                                          │
│ 2. Validate:                                            │
│    - Check: Product exists in invoice                  │
│    - Check: soLuongTra <= soLuongDaMua                  │
│                                                          │
│ 3. Create PhieuTraHang:                                 │
│    - Generate code: "TH-YYYYMMDDHHmmss"                 │
│    - Set donGia = original price from invoice           │
│    - Set trangThai = COMPLETED                          │
│                                                          │
│ 4. Update stock:                                        │
│    - sanPham.setTonKho(tonKho + soLuongTra)            │
│    - Save SanPham                                       │
│                                                          │
│ 5. Save PhieuTraHang                                   │
└─────────────────────────────────────────────────────────┘
```

**Input:**
```json
{
  "hoaDonGocId": 1,
  "sanPhamId": 1,
  "soLuongTra": 1,
  "nhanVienId": 1,
  "lyDoTra": "Hàng lỗi"
}
```

**Error Cases:**
- `INVALID_RETURN` - Sản phẩm không có trong hóa đơn hoặc số lượng không hợp lệ

---

### **3.7.4. Các File Quan Trọng**

#### **Controller:**
- **File:** `retail-admin-api/src/main/java/com/retail/admin/controller/InventoryAdminController.java`

#### **Service:**
- **File:** `retail-application/src/main/java/com/retail/application/service/inventory/InventoryServiceImpl.java`

#### **DTO:**
- **File:** `retail-application/src/main/java/com/retail/application/dto/ImportGoodsRequest.java`
- **File:** `retail-application/src/main/java/com/retail/application/dto/ReturnRequest.java`

### **3.7.5. Business Rules**

1. **Nhập hàng → Tăng tồn kho** và **cập nhật giá nhập**
2. **Trả hàng → Tăng tồn kho** (trả lại vào kho)
3. **Số lượng trả ≤ số lượng đã mua**
4. **Import code tự động sinh:** `NH-YYYYMMDDHHmmss`
5. **Return code tự động sinh:** `TH-YYYYMMDDHHmmss`

---

## 3.8. Module: Promotion (Khuyến Mãi)

### **3.8.1. Chức Năng**

Module Promotion quản lý các chương trình khuyến mãi:
- CRUD khuyến mãi
- Nhiều loại khuyến mãi (PERCENTAGE, FIXED_AMOUNT, BOGO, BUNDLE, BUY_X_GET_Y)
- Áp dụng tự động khi checkout
- Quản lý thời gian áp dụng
- Giới hạn số lần sử dụng

### **3.8.2. API Endpoints**

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| POST | `/api/v1/admin/promotions` | Tạo khuyến mãi mới | ADMIN, MANAGER |
| PUT | `/api/v1/admin/promotions/{id}` | Cập nhật khuyến mãi | ADMIN, MANAGER |
| GET | `/api/v1/admin/promotions/{id}` | Lấy khuyến mãi theo ID | ADMIN, MANAGER |
| GET | `/api/v1/admin/promotions/code/{code}` | Lấy khuyến mãi theo mã | ADMIN, MANAGER |
| GET | `/api/v1/admin/promotions` | Lấy tất cả khuyến mãi | ADMIN, MANAGER |
| GET | `/api/v1/admin/promotions/branch/{branchId}/active` | Lấy khuyến mãi active cho chi nhánh | ADMIN, MANAGER |
| POST | `/api/v1/admin/promotions/{id}/activate` | Kích hoạt khuyến mãi | ADMIN, MANAGER |
| POST | `/api/v1/admin/promotions/{id}/deactivate` | Vô hiệu hóa khuyến mãi | ADMIN, MANAGER |
| DELETE | `/api/v1/admin/promotions/{id}` | Xóa khuyến mãi | ADMIN, MANAGER |

### **3.8.3. Flow Logic Chi Tiết**

#### **Flow 1: Tạo Khuyến Mãi**

```
POST /api/v1/admin/promotions
Request Body: PromotionDTO
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ PromotionService.create()                                │
│ @Transactional                                          │
│ @CacheEvict(value = "promotions", allEntries = true)    │
│                                                          │
│ 1. Validate:                                            │
│    - Check maKhuyenMai duplicate                         │
│                                                          │
│ 2. Map DTO → Entity                                     │
│                                                          │
│ 3. Set branch (if provided)                             │
│                                                          │
│ 4. Save KhuyenMai                                       │
│                                                          │
│ 5. Add product relationships:                          │
│    - For each sanPhamId in dto.sanPhamIds:             │
│      * Create ChiTietKhuyenMai                           │
│      * Link to KhuyenMai                                │
│                                                          │
│ 6. Save again (with relationships)                      │
│                                                          │
│ 7. Clear cache                                          │
└─────────────────────────────────────────────────────────┘
```

**Input:**
```json
{
  "maKhuyenMai": "KM001",
  "tenKhuyenMai": "Giảm 10% cho cà phê",
  "loaiKhuyenMai": "PERCENTAGE",
  "giaTriKhuyenMai": 10,
  "giaTriToiThieu": 50000,
  "giamToiDa": 20000,
  "ngayBatDau": "2025-12-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "chiNhanhId": 1,
  "sanPhamIds": [1, 2, 3]
}
```

---

#### **Flow 2: Tính Giảm Giá (Tự Động Khi Checkout)**

```
PromotionService.calculateDiscount()
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Load active promotions for branch:                    │
│    - Query: trangThai = ACTIVE                          │
│    - Time range: ngayBatDau <= now <= ngayKetThuc      │
│    - Branch: chiNhanhId OR chiNhanhId IS NULL           │
│                                                          │
│ 2. Filter eligible promotions:                          │
│    - Check minimum amount (giaTriToiThieu)               │
│    - Check product eligibility (ChiTietKhuyenMai)       │
│                                                          │
│ 3. Calculate discount for each promotion:               │
│                                                          │
│    PERCENTAGE:                                          │
│    discount = tongTien * (giaTriKhuyenMai / 100)        │
│    if (giamToiDa != null && discount > giamToiDa):     │
│      discount = giamToiDa                               │
│                                                          │
│    FIXED_AMOUNT:                                        │
│    discount = giaTriKhuyenMai                           │
│                                                          │
│    BOGO (Buy One Get One):                              │
│    For each eligible product:                           │
│      if (soLuong >= soLuongMua):                        │
│        freeItems = (soLuong / soLuongMua) * soLuongTang │
│        discount += freeItems * donGia                   │
│                                                          │
│ 4. Select best promotion (highest discount)             │
│                                                          │
│ 5. Update promotion usage:                              │
│    - promotion.incrementUsage()                         │
│    - Save promotion                                     │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Return total discount amount
```

---

### **3.8.4. Các File Quan Trọng**

#### **Controller:**
- **File:** `retail-admin-api/src/main/java/com/retail/admin/controller/PromotionController.java`

#### **Service:**
- **File:** `retail-application/src/main/java/com/retail/application/service/promotion/PromotionServiceImpl.java`
- **Features:**
  - Multiple promotion types
  - Automatic application
  - Usage tracking
  - Redis caching (15 minutes TTL)

#### **Entity:**
- **File:** `retail-domain/src/main/java/com/retail/domain/entity/KhuyenMai.java`
- **File:** `retail-domain/src/main/java/com/retail/domain/entity/ChiTietKhuyenMai.java`

### **3.8.5. Business Rules**

1. **Mã khuyến mãi phải unique**
2. **Tự động áp dụng** khi checkout (không cần gọi API riêng)
3. **Kiểm tra thời gian** (ngayBatDau → ngayKetThuc)
4. **Kiểm tra số lần sử dụng** (nếu có giới hạn)
5. **Áp dụng giảm giá tối đa** (giamToiDa)
6. **Cache TTL: 15 phút**

---

## 3.9. Module: Reports (Báo Cáo)

### **3.9.1. Chức Năng**

Module Reports cung cấp các báo cáo:
- Báo cáo doanh thu (theo ngày, theo chi nhánh)
- Top sản phẩm bán chạy
- Sản phẩm tồn kho thấp
- Export Excel/PDF

### **3.9.2. API Endpoints**

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| GET | `/api/v1/admin/reports/revenue?startDate=2025-12-01&endDate=2025-12-06` | Báo cáo doanh thu | ADMIN, MANAGER |
| GET | `/api/v1/admin/reports/revenue/branch/{branchId}?startDate=...&endDate=...` | Báo cáo doanh thu theo chi nhánh | ADMIN, MANAGER |
| GET | `/api/v1/admin/reports/top-products?startDate=...&endDate=...&limit=10` | Top sản phẩm bán chạy | ADMIN, MANAGER |
| GET | `/api/v1/admin/reports/low-stock` | Sản phẩm tồn kho thấp | ADMIN, MANAGER |

### **3.9.3. Flow Logic Chi Tiết**

#### **Flow 1: Báo Cáo Doanh Thu**

```
GET /api/v1/admin/reports/revenue?startDate=2025-12-01&endDate=2025-12-06
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ReportService.getRevenueReport()                        │
│ @Transactional(readOnly = true)                         │
│                                                          │
│ 1. Parse date range:                                    │
│    - startDateTime = startDate.atStartOfDay()           │
│    - endDateTime = endDate.plusDays(1).atStartOfDay()   │
│                                                          │
│ 2. Query invoices:                                      │
│    HoaDonRepository.findByDateRange()                   │
│    - WHERE ngayTao BETWEEN start AND end                │
│    - AND trangThai = COMPLETED                          │
│    - JOIN FETCH chiTietHoaDons                          │
│                                                          │
│ 3. Calculate statistics:                                │
│    - tongDoanhThu = sum(thanhTien)                      │
│    - tongDonHang = count(invoices)                      │
│    - trungBinhDonHang = tongDoanhThu / tongDonHang     │
│    - tongGiamGia = sum(giamGia)                         │
│    - tongDiemTichLuy = sum(diemTichLuy)                 │
│                                                          │
│ 4. Group by date (daily breakdown):                     │
│    - For each day in range:                             │
│      * Calculate daily revenue                          │
│                                                          │
│ 5. Build RevenueReportDTO                               │
└─────────────────────────────────────────────────────────┘
```

**Response:**
```json
{
  "data": {
    "tongDoanhThu": 5000000,
    "tongDonHang": 100,
    "trungBinhDonHang": 50000,
    "tongGiamGia": 500000,
    "tongDiemTichLuy": 45000,
    "dailyBreakdown": [
      {
        "date": "2025-12-01",
        "doanhThu": 1000000,
        "donHang": 20
      }
    ]
  }
}
```

---

#### **Flow 2: Top Sản Phẩm Bán Chạy**

```
GET /api/v1/admin/reports/top-products?startDate=...&endDate=...&limit=10
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ ReportService.getTopSellingProducts()                    │
│ @Transactional(readOnly = true)                         │
│                                                          │
│ 1. Query database:                                      │
│    ChiTietHoaDonRepository.getTopSellingProductsReport() │
│    - GROUP BY sanPhamId                                 │
│    - SUM(soLuong) as totalQuantity                       │
│    - SUM(thanhTien) as totalRevenue                      │
│    - ORDER BY totalQuantity DESC                        │
│                                                          │
│ 2. Limit results (top N)                                │
│                                                          │
│ 3. Map to TopProductDTO                                 │
└─────────────────────────────────────────────────────────┘
```

**Query:**
```sql
SELECT 
  ct.san_pham_id,
  s.ten_san_pham,
  SUM(ct.so_luong) as total_quantity,
  SUM(ct.thanh_tien) as total_revenue
FROM chi_tiet_hoa_don ct
JOIN hoa_don hd ON ct.hoa_don_id = hd.id
JOIN san_pham s ON ct.san_pham_id = s.id
WHERE hd.ngay_tao BETWEEN :startDate AND :endDate
  AND hd.trang_thai = 'COMPLETED'
GROUP BY ct.san_pham_id, s.ten_san_pham
ORDER BY total_quantity DESC
LIMIT :limit
```

---

### **3.9.4. Các File Quan Trọng**

#### **Controller:**
- **File:** `retail-admin-api/src/main/java/com/retail/admin/controller/ReportAdminController.java`

#### **Service:**
- **File:** `retail-application/src/main/java/com/retail/application/service/report/ReportServiceImpl.java`
- **File:** `retail-application/src/main/java/com/retail/application/service/report/RevenueReportService.java`
- **File:** `retail-application/src/main/java/com/retail/application/service/report/SalesReportService.java`

#### **DTO:**
- **File:** `retail-application/src/main/java/com/retail/application/dto/RevenueReportDTO.java`
- **File:** `retail-application/src/main/java/com/retail/application/dto/TopProductDTO.java`

### **3.9.5. Business Rules**

1. **Chỉ tính hóa đơn COMPLETED**
2. **Date range** phải hợp lệ (startDate <= endDate)
3. **Top products** được sắp xếp theo số lượng bán
4. **Có thể filter theo chi nhánh**

---

**📝 Tài liệu tiếp theo:**
- [Phần 4: Mối Quan Hệ Entity](./04_MOI_QUAN_HE_ENTITY.md)
- [Phần 5: Quy Trình Xử Lý Quan Trọng](./05_QUY_TRINH_XU_LY.md)

