# 📘 Phần 5: Quy Trình Xử Lý Quan Trọng

> Tài liệu mô tả chi tiết các quy trình xử lý nghiệp vụ quan trọng trong hệ thống

---

## 5.1. Flow Thanh Toán (Checkout)

### **Trigger:**
- User click "Thanh toán" trong POS
- Frontend gửi `POST /api/v1/pos/checkout`

### **Input:**
```json
{
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "khachHangId": 1,
  "phuongThucThanhToan": "TIEN_MAT",
  "giamGia": 0,
  "diemSuDung": 0,
  "ghiChu": "",
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

### **Step-by-Step Flow:**

#### **Step 1: Validate Request**
- **Bean Validation** (`@Valid`):
  - `nhanVienId` - NotNull
  - `chiNhanhId` - NotNull
  - `phuongThucThanhToan` - NotBlank
  - `items[].sanPhamId` - NotNull
  - `items[].soLuong` - NotNull, Positive
  - `items[].donGia` - NotNull, Positive

**Error Cases:**
- `VALIDATION_ERROR` - Thiếu required fields
- HTTP Status: `400 BAD REQUEST`

---

#### **Step 2: Validate Cart**
- Gọi `PosService.validateCart()`
- **For each item:**
  - Load `SanPham` từ database
  - Check: Product exists
  - Check: Product is ACTIVE
  - Check: `tonKho >= soLuong`
  - Check: `soLuong > 0`
  - Check: `donGia > 0`

**Error Cases:**
- `NOT_FOUND` - Sản phẩm không tồn tại
- `INACTIVE_PRODUCT` - Sản phẩm đã ngừng hoạt động
- `INSUFFICIENT_STOCK` - Không đủ tồn kho
- `INVALID_QUANTITY` - Số lượng không hợp lệ
- HTTP Status: `400 BAD REQUEST`

---

#### **Step 3: Load Entities**
- Load `NhanVien` (from `nhanVienId`)
- Load `ChiNhanh` (from `chiNhanhId`)
- Load `KhachHang` (from `khachHangId`, optional)

**Error Cases:**
- `NOT_FOUND` - Nhân viên/Chi nhánh/Khách hàng không tồn tại
- HTTP Status: `404 NOT FOUND`

---

#### **Step 4: Create HoaDon**
- Generate invoice code: `HD-YYYYMMDDHHmmss`
- Set `ngayTao = now()`
- Set `trangThai = COMPLETED`
- Set `giamGia` (from request)
- Set `diemSuDung` (from request)
- Set `phuongThucThanhToan` (from request)

---

#### **Step 5: Process Items**
- **For each item:**
  1. Load `SanPham`
  2. Create `ChiTietHoaDon`:
     - `soLuong` (from request)
     - `donGia` (from `SanPham.giaBan`)
     - `thanhTien` = `soLuong * donGia` (auto-calculated)
  3. Add to `HoaDon`
  4. **Update stock:**
     - `sanPham.setTonKho(tonKho - soLuong)`
     - Save `SanPham`
  5. Calculate `tongTien` += `chiTiet.thanhTien`

**Transaction:**
- Tất cả operations trong `@Transactional`
- Nếu có lỗi → Rollback tất cả (stock không bị trừ)

---

#### **Step 6: Apply Promotions**
- Gọi `PromotionService.calculateDiscount()`
- **Input:**
  - `chiNhanhId`
  - `items` (cart items)
  - `tongTien`
- **Process:**
  1. Load active promotions for branch
  2. Check promotion conditions:
     - Time range (ngayBatDau → ngayKetThuc)
     - Status = ACTIVE
     - Minimum amount (giaTriToiThieu)
     - Product eligibility (ChiTietKhuyenMai)
  3. Calculate discount:
     - **PERCENTAGE:** `tongTien * (giaTriKhuyenMai / 100)`
     - **FIXED_AMOUNT:** `giaTriKhuyenMai`
     - **BOGO:** Free items
  4. Apply max discount limit (giamToiDa)
- **Output:** Total discount amount
- **Update:** `hoaDon.setGiamGia(giamGia + promotionDiscount)`

---

#### **Step 7: Calculate Final Amount**
- `thanhTien = tongTien - giamGia - diemSuDung`
- If `thanhTien < 0` → `thanhTien = 0`
- Set `hoaDon.setThanhTien(thanhTien)`

---

#### **Step 8: Calculate Points**
- `diemTichLuy = thanhTien * 0.01` (1%)
- Round to 2 decimal places
- Set `hoaDon.setDiemTichLuy(diemTichLuy)`

---

#### **Step 9: Update Customer Points**
- **If `khachHang` exists:**
  1. **Subtract used points:**
     - `khachHang.diemTichLuy -= diemSuDung`
  2. **Add new points:**
     - `khachHang.diemTichLuy += diemTichLuy`
  3. Save `KhachHang`

---

#### **Step 10: Save Invoice**
- Save `HoaDon` (cascade save `ChiTietHoaDon`)
- Clear invoices cache (`@CacheEvict`)

---

#### **Step 11: Return Response**
- Map `HoaDon` → `InvoiceDTO`
- Return `ApiResponse<InvoiceDTO>`

### **Output:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "maHoaDon": "HD-20251206103000",
    "ngayTao": "2025-12-06T10:30:00",
    "tongTien": 50000,
    "giamGia": 5000,
    "thanhTien": 45000,
    "diemTichLuy": 450,
    "chiTietHoaDons": [...]
  }
}
```

### **Error Cases Summary:**
- `VALIDATION_ERROR` - Invalid request
- `NOT_FOUND` - Entity not found
- `INSUFFICIENT_STOCK` - Not enough stock
- `INACTIVE_PRODUCT` - Product inactive
- `INTERNAL_ERROR` - System error

---

## 5.2. Flow Nhập Hàng (Import Goods)

### **Trigger:**
- Admin/Manager nhập hàng từ nhà cung cấp
- Frontend gửi `POST /api/v1/admin/inventory/import`

### **Input:**
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

### **Step-by-Step Flow:**

#### **Step 1: Validate Request**
- Bean Validation
- Check: `items` not empty

#### **Step 2: Load Entities**
- Load `NhaCungCap`
- Load `ChiNhanh`
- Load `NhanVien`

#### **Step 3: Create NhapHang**
- Generate code: `NH-YYYYMMDDHHmmss`
- Set `ngayNhap = now()`
- Set `trangThai = COMPLETED`

#### **Step 4: Process Items**
- **For each item:**
  1. Load `SanPham`
  2. Create `ChiTietNhapHang`:
     - `soLuong` (from request)
     - `donGia` (from request)
     - `thanhTien` = `soLuong * donGia` (auto-calculated)
  3. Add to `NhapHang`
  4. **Update stock:**
     - `sanPham.setTonKho(tonKho + soLuong)`
     - `sanPham.setGiaNhap(donGia)` (update import price)
     - Save `SanPham`
  5. Calculate `tongTien` += `chiTiet.thanhTien`

#### **Step 5: Save**
- Save `NhapHang` (cascade save `ChiTietNhapHang`)

### **Output:**
```json
{
  "success": true,
  "message": "Nhập hàng thành công"
}
```

### **Error Cases:**
- `NOT_FOUND` - Entity not found
- `VALIDATION_ERROR` - Invalid request
- `INTERNAL_ERROR` - System error

---

## 5.3. Flow Trả Hàng (Return Goods)

### **Trigger:**
- Customer trả hàng
- Frontend gửi `POST /api/v1/admin/inventory/return`

### **Input:**
```json
{
  "hoaDonGocId": 1,
  "sanPhamId": 1,
  "soLuongTra": 1,
  "nhanVienId": 1,
  "lyDoTra": "Hàng lỗi"
}
```

### **Step-by-Step Flow:**

#### **Step 1: Validate Request**
- Bean Validation

#### **Step 2: Load Entities**
- Load `HoaDon` (original invoice)
- Load `SanPham`
- Load `NhanVien`

#### **Step 3: Validate Return**
- Check: Product exists in original invoice
- Check: `soLuongTra <= soLuongDaMua`
- Check: `soLuongTra > 0`

**Error Cases:**
- `INVALID_RETURN` - Product not in invoice or quantity invalid

#### **Step 4: Create PhieuTraHang**
- Generate code: `TH-YYYYMMDDHHmmss`
- Set `ngayTra = now()`
- Set `donGia` = original price from invoice
- Set `trangThai = COMPLETED`

#### **Step 5: Update Stock**
- `sanPham.setTonKho(tonKho + soLuongTra)`
- Save `SanPham`

#### **Step 6: Save**
- Save `PhieuTraHang`

### **Output:**
```json
{
  "success": true,
  "message": "Trả hàng thành công"
}
```

---

## 5.4. Flow Đăng Nhập (Login)

### **Trigger:**
- User nhập username/password và click "Đăng nhập"
- Frontend gửi `POST /api/v1/auth/login`

### **Input:**
```json
{
  "username": "admin",
  "password": "123456"
}
```

### **Step-by-Step Flow:**

#### **Step 1: Validate Request**
- Bean Validation:
  - `username` - NotBlank
  - `password` - NotBlank

#### **Step 2: Authenticate**
- `AuthenticationManager.authenticate()`
- **Process:**
  1. Load `UserDetails` từ `UserDetailsService`
  2. Verify password (BCrypt):
     - Encode input password
     - Compare with stored hash
  3. Check: User exists
  4. Check: User is active

**Error Cases:**
- `UNAUTHORIZED` - Invalid username/password
- HTTP Status: `401 UNAUTHORIZED`

#### **Step 3: Generate JWT Token**
- `JwtUtils.generateJwtToken()`
- **Token contains:**
  - `subject` = username
  - `issuedAt` = now
  - `expiration` = now + 24 hours
  - `signature` = HMAC SHA-512

#### **Step 4: Load Employee Details**
- `EmployeeService.findByUsername()`
- Load: id, username, tenNhanVien, email, role, chiNhanhId

#### **Step 5: Build Response**
- `LoginResponse`:
  - `token` - JWT token
  - `type` - "Bearer"
  - `id`, `username`, `tenNhanVien`, `email`, `role`, `chiNhanhId`

### **Output:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "type": "Bearer",
    "id": 1,
    "username": "admin",
    "tenNhanVien": "Nguyễn Văn A",
    "email": "admin@example.com",
    "role": "ADMIN",
    "chiNhanhId": 1,
    "tenChiNhanh": "Chi nhánh 1"
  }
}
```

### **Error Cases:**
- `UNAUTHORIZED` - Invalid credentials
- `NOT_FOUND` - User not found
- HTTP Status: `401 UNAUTHORIZED`

---

## 5.5. Flow Phân Quyền (Authorization)

### **Trigger:**
- User gửi request đến protected endpoint
- JWT token trong header `Authorization: Bearer {token}`

### **Step-by-Step Flow:**

#### **Step 1: Parse JWT Token**
- `JwtAuthFilter.parseJwt()`
- Extract token từ header `Authorization`
- Format: `Bearer {token}`

#### **Step 2: Validate JWT Token**
- `JwtUtils.validateJwtToken()`
- **Checks:**
  1. Token format valid
  2. Signature valid
  3. Token not expired
  4. Token not malformed

**Error Cases:**
- Token invalid → Request continues (may be public endpoint)
- Token expired → Request continues (Security Filter Chain will deny)

#### **Step 3: Extract Username**
- `JwtUtils.getUserNameFromJwtToken()`
- Get `subject` from token claims

#### **Step 4: Load UserDetails**
- `UserDetailsService.loadUserByUsername()`
- Load user with authorities (roles)

#### **Step 5: Set Authentication**
- Create `UsernamePasswordAuthenticationToken`
- Set in `SecurityContextHolder`

#### **Step 6: Check Authorization**
- `SecurityFilterChain` checks:
  1. **Public endpoints** → Allow
  2. **Role-based:**
     - `/api/v1/pos/**` → `hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')`
     - `/api/v1/admin/**` → `hasAnyRole('ADMIN', 'MANAGER')`
  3. **Other** → `authenticated()`

**Error Cases:**
- `FORBIDDEN` - Insufficient permissions
- HTTP Status: `403 FORBIDDEN`

### **Role Hierarchy:**
- **ADMIN:** Full access
- **MANAGER:** Admin APIs + POS APIs
- **CASHIER:** POS APIs only

---

## 5.6. Flow Áp Dụng Khuyến Mãi (Apply Promotion)

### **Trigger:**
- Tự động khi checkout
- Gọi `PromotionService.calculateDiscount()`

### **Input:**
- `chiNhanhId` - Chi nhánh
- `items` - Cart items
- `tongTien` - Total amount

### **Step-by-Step Flow:**

#### **Step 1: Load Active Promotions**
- Query `KhuyenMaiRepository`:
  - `chiNhanhId` = provided OR `chiNhanhId` IS NULL
  - `trangThai` = ACTIVE
  - `ngayBatDau` <= now
  - `ngayKetThuc` >= now
  - `soLanDaSuDung` < `tongSoLanSuDungToiDa` (if limited)

#### **Step 2: Filter Eligible Promotions**
- **For each promotion:**
  1. Check minimum amount:
     - If `giaTriToiThieu` != null:
       - `tongTien >= giaTriToiThieu`
  2. Check product eligibility:
     - If `ChiTietKhuyenMai` exists:
       - Check if any cart item matches `sanPhamId`
     - If no `ChiTietKhuyenMai`:
       - Apply to all products

#### **Step 3: Calculate Discount**
- **For each eligible promotion:**

  **PERCENTAGE:**
  ```
  discount = tongTien * (giaTriKhuyenMai / 100)
  if (giamToiDa != null && discount > giamToiDa):
    discount = giamToiDa
  ```

  **FIXED_AMOUNT:**
  ```
  discount = giaTriKhuyenMai
  if (giamToiDa != null && discount > giamToiDa):
    discount = giamToiDa
  ```

  **BOGO (Buy One Get One):**
  ```
  For each eligible product:
    if (soLuong >= soLuongMua):
      freeItems = (soLuong / soLuongMua) * soLuongTang
      discount += freeItems * donGia
  ```

#### **Step 4: Select Best Promotion**
- Choose promotion with highest discount
- Or apply multiple promotions (if allowed)

#### **Step 5: Update Promotion Usage**
- `promotion.incrementUsage()`
- Save promotion

### **Output:**
- Total discount amount (BigDecimal)

### **Error Cases:**
- None (returns 0 if no eligible promotions)

---

## 5.7. Flow Nhập/Xuất Nguyên Liệu

### **Trigger:**
- Admin/Manager nhập/xuất nguyên liệu
- Frontend gửi `POST /api/v1/admin/nguyen-lieu/nhap` hoặc `/xuat`

### **Input (Nhập):**
```json
{
  "nguyenLieuId": 1,
  "soLuong": 50,
  "nhanVienId": 1,
  "loaiPhieu": "NHAP",
  "ghiChu": "Nhập từ nhà cung cấp"
}
```

### **Step-by-Step Flow (Nhập):**

#### **Step 1: Validate Request**
- Bean Validation
- Check: `soLuong > 0`
- Check: `loaiPhieu` = NHAP or XUAT

#### **Step 2: Load Entities**
- Load `NguyenLieu`
- Load `NhanVien`
- Load `ChiNhanh` (from `NhanVien`)

#### **Step 3: Validate (Xuất)**
- **If `loaiPhieu = XUAT`:**
  - Check: `nguyenLieu.tonKho >= soLuong`

**Error Cases:**
- `INSUFFICIENT_STOCK` - Không đủ nguyên liệu

#### **Step 4: Create PhieuNhapXuatNguyenLieu**
- Generate code: `PN-YYYYMMDDHHmmss` (nhập) hoặc `PX-YYYYMMDDHHmmss` (xuất)
- Set `ngayNhapXuat = now()`
- Set `loaiPhieu`
- Set `trangThai = COMPLETED`

#### **Step 5: Update Stock**
- **If `loaiPhieu = NHAP`:**
  - `nguyenLieu.tangSoLuong(soLuong)`
- **If `loaiPhieu = XUAT`:**
  - `nguyenLieu.giamSoLuong(soLuong)`
- Save `NguyenLieu`

#### **Step 6: Save**
- Save `PhieuNhapXuatNguyenLieu`

### **Output:**
```json
{
  "success": true,
  "message": "Nhập nguyên liệu thành công"
}
```

---

## 5.8. Flow Tạo Sản Phẩm

### **Trigger:**
- Admin/Manager tạo sản phẩm mới
- Frontend gửi `POST /api/v1/admin/products`

### **Input:**
```json
{
  "maSanPham": "SP001",
  "barcode": "1234567890123",
  "tenSanPham": "Cà phê đen",
  "giaBan": 25000,
  "tonKho": 100,
  "chiNhanhId": 1
}
```

### **Step-by-Step Flow:**

#### **Step 1: Validate Request**
- Bean Validation
- Check: `maSanPham` not empty
- Check: `tenSanPham` not empty
- Check: `giaBan > 0`

#### **Step 2: Check Duplicates**
- Check: `existsByMaSanPham(maSanPham)`
- Check: `existsByBarcode(barcode)` (if provided)

**Error Cases:**
- `DUPLICATE_BARCODE` - Barcode đã tồn tại
- `DUPLICATE_CODE` - Mã sản phẩm đã tồn tại

#### **Step 3: Map DTO to Entity**
- `ProductMapper.toEntity()`
- Set default: `trangThai = ACTIVE`

#### **Step 4: Save**
- `SanPhamRepository.save()`
- Clear products cache

#### **Step 5: Return**
- Map Entity → DTO
- Return `ProductDTO`

### **Output:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "maSanPham": "SP001",
    ...
  }
}
```

---

## 5.9. Tóm Tắt Error Handling

### **Error Types:**

1. **VALIDATION_ERROR**
   - HTTP: `400 BAD REQUEST`
   - Cause: Invalid input
   - Fix: Check request body

2. **NOT_FOUND**
   - HTTP: `404 NOT FOUND`
   - Cause: Entity không tồn tại
   - Fix: Check ID

3. **INSUFFICIENT_STOCK**
   - HTTP: `400 BAD REQUEST`
   - Cause: Không đủ tồn kho
   - Fix: Giảm số lượng hoặc nhập thêm

4. **INACTIVE_PRODUCT**
   - HTTP: `400 BAD REQUEST`
   - Cause: Sản phẩm đã ngừng hoạt động
   - Fix: Kích hoạt sản phẩm

5. **UNAUTHORIZED**
   - HTTP: `401 UNAUTHORIZED`
   - Cause: Invalid credentials
   - Fix: Check username/password

6. **FORBIDDEN**
   - HTTP: `403 FORBIDDEN`
   - Cause: Insufficient permissions
   - Fix: Check user role

7. **INTERNAL_ERROR**
   - HTTP: `500 INTERNAL SERVER ERROR`
   - Cause: System error
   - Fix: Check logs

---

**📝 Tài liệu tiếp theo:**
- [Phần 6: Chuẩn Cho FE](./06_CHUAN_CHO_FE.md)

