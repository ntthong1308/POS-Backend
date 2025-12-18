# 📘 Phần 4: Mối Quan Hệ Entity

> Tài liệu mô tả mối quan hệ giữa các entity trong hệ thống

---

## 4.1. ER Diagram Tổng Quát

```
┌─────────────┐
│  ChiNhanh   │
└──────┬──────┘
       │
       ├─────────────────────────────────────────────┐
       │                                             │
       │                                             │
┌──────▼──────┐  ┌──────────────┐  ┌──────────────┐ │
│   NhanVien  │  │   SanPham    │  │  NguyenLieu  │ │
└──────┬──────┘  └──────┬───────┘  └──────┬───────┘ │
       │                │                  │         │
       │                │                  │         │
┌──────▼──────┐  ┌──────▼───────┐  ┌──────▼─────────┐
│   HoaDon    │  │ ChiTietHoaDon│  │PhieuNhapXuatNL │
└──────┬──────┘  └──────────────┘  └────────────────┘
       │
       │
┌──────▼──────┐
│  KhachHang  │
└─────────────┘

┌─────────────┐
│NhaCungCap   │
└──────┬──────┘
       │
       │
┌──────▼──────┐  ┌──────────────────┐
│  NhapHang   │  │ ChiTietNhapHang  │
└─────────────┘  └──────────────────┘

┌─────────────┐
│  KhuyenMai  │
└──────┬──────┘
       │
       │
┌──────▼──────────────┐
│ ChiTietKhuyenMai     │
└─────────────────────┘
```

---

## 4.2. Chi Tiết Mối Quan Hệ

### **4.2.1. ChiNhanh (Chi Nhánh)**

**Entity:** `ChiNhanh`

**Quan hệ:**

1. **OneToMany với NhanVien**
   - `NhanVien.chiNhanh` → `ChiNhanh`
   - Một chi nhánh có nhiều nhân viên
   - Fetch: LAZY

2. **OneToMany với SanPham**
   - `SanPham.chiNhanh` → `ChiNhanh`
   - Một chi nhánh có nhiều sản phẩm
   - Fetch: LAZY

3. **OneToMany với HoaDon**
   - `HoaDon.chiNhanh` → `ChiNhanh`
   - Một chi nhánh có nhiều hóa đơn
   - Fetch: LAZY

4. **OneToMany với NhapHang**
   - `NhapHang.chiNhanh` → `ChiNhanh`
   - Một chi nhánh có nhiều phiếu nhập hàng
   - Fetch: LAZY

5. **OneToMany với KhuyenMai**
   - `KhuyenMai.chiNhanh` → `ChiNhanh`
   - Một chi nhánh có nhiều khuyến mãi (nullable - null = áp dụng tất cả)
   - Fetch: LAZY

6. **OneToMany với NguyenLieu**
   - `NguyenLieu.chiNhanh` → `ChiNhanh`
   - Một chi nhánh có nhiều nguyên liệu
   - Fetch: LAZY

**Sử dụng trong module:**
- Product Management
- POS (checkout)
- Inventory Management
- Promotion Management
- Employee Management
- Raw Material Management

---

### **4.2.2. NhanVien (Nhân Viên)**

**Entity:** `NhanVien`

**Quan hệ:**

1. **ManyToOne với ChiNhanh**
   - `NhanVien.chiNhanh` → `ChiNhanh`
   - Một nhân viên thuộc một chi nhánh (nullable)
   - Fetch: LAZY

2. **OneToMany với HoaDon**
   - `HoaDon.nhanVien` → `NhanVien`
   - Một nhân viên tạo nhiều hóa đơn
   - Fetch: LAZY

3. **OneToMany với NhapHang**
   - `NhapHang.nhanVien` → `NhanVien`
   - Một nhân viên tạo nhiều phiếu nhập hàng
   - Fetch: LAZY

4. **OneToMany với PhieuNhapXuatNguyenLieu**
   - `PhieuNhapXuatNguyenLieu.nhanVien` → `NhanVien`
   - Một nhân viên tạo nhiều phiếu nhập/xuất nguyên liệu
   - Fetch: LAZY

**Fields quan trọng:**
- `username` - Unique, dùng để login
- `password` - BCrypt encoded
- `role` - ADMIN, MANAGER, CASHIER

**Sử dụng trong module:**
- Authentication (login)
- POS (checkout - nhanVienId)
- Inventory Management
- Raw Material Management

---

### **4.2.3. SanPham (Sản Phẩm)**

**Entity:** `SanPham`

**Quan hệ:**

1. **ManyToOne với ChiNhanh**
   - `SanPham.chiNhanh` → `ChiNhanh`
   - Một sản phẩm thuộc một chi nhánh (nullable)
   - Fetch: LAZY

2. **ManyToOne với NhaCungCap**
   - `SanPham.nhaCungCap` → `NhaCungCap`
   - Một sản phẩm từ một nhà cung cấp (nullable)
   - Fetch: LAZY

3. **OneToMany với ChiTietHoaDon**
   - `ChiTietHoaDon.sanPham` → `SanPham`
   - Một sản phẩm có trong nhiều chi tiết hóa đơn
   - Fetch: LAZY

4. **OneToMany với ChiTietNhapHang**
   - `ChiTietNhapHang.sanPham` → `SanPham`
   - Một sản phẩm có trong nhiều chi tiết nhập hàng
   - Fetch: LAZY

5. **OneToMany với ChiTietKhuyenMai**
   - `ChiTietKhuyenMai.sanPham` → `SanPham`
   - Một sản phẩm có trong nhiều khuyến mãi
   - Fetch: LAZY

**Fields quan trọng:**
- `maSanPham` - Unique
- `barcode` - Unique, nullable
- `tonKho` - Tồn kho hiện tại
- `tonKhoToiThieu` - Tồn kho tối thiểu (cảnh báo)

**Sử dụng trong module:**
- Product Management (CRUD)
- POS (scan, checkout)
- Inventory Management (nhập/xuất)
- Promotion Management (áp dụng khuyến mãi)

---

### **4.2.4. HoaDon (Hóa Đơn)**

**Entity:** `HoaDon`

**Quan hệ:**

1. **ManyToOne với KhachHang**
   - `HoaDon.khachHang` → `KhachHang`
   - Một hóa đơn thuộc một khách hàng (nullable - có thể bán lẻ)
   - Fetch: LAZY

2. **ManyToOne với NhanVien**
   - `HoaDon.nhanVien` → `NhanVien`
   - Một hóa đơn được tạo bởi một nhân viên (required)
   - Fetch: LAZY

3. **ManyToOne với ChiNhanh**
   - `HoaDon.chiNhanh` → `ChiNhanh`
   - Một hóa đơn thuộc một chi nhánh (required)
   - Fetch: LAZY

4. **OneToMany với ChiTietHoaDon**
   - `ChiTietHoaDon.hoaDon` → `HoaDon`
   - Một hóa đơn có nhiều chi tiết hóa đơn
   - Cascade: ALL, orphanRemoval: true
   - BatchSize: 20
   - Fetch: LAZY

**Fields quan trọng:**
- `maHoaDon` - Unique, tự động sinh: `HD-YYYYMMDD-XXXX`
- `tongTien` - Tổng tiền trước giảm giá
- `giamGia` - Tổng giảm giá (thủ công + khuyến mãi)
- `thanhTien` - Số tiền cuối cùng phải trả
- `diemSuDung` - Điểm đã sử dụng
- `diemTichLuy` - Điểm tích lũy mới (1% của thanhTien)

**Sử dụng trong module:**
- POS (checkout, get invoices)
- Reports (doanh thu, bán hàng)

---

### **4.2.5. ChiTietHoaDon (Chi Tiết Hóa Đơn)**

**Entity:** `ChiTietHoaDon`

**Quan hệ:**

1. **ManyToOne với HoaDon**
   - `ChiTietHoaDon.hoaDon` → `HoaDon`
   - Một chi tiết thuộc một hóa đơn (required)
   - Fetch: LAZY

2. **ManyToOne với SanPham**
   - `ChiTietHoaDon.sanPham` → `SanPham`
   - Một chi tiết là một sản phẩm (required)
   - Fetch: LAZY

**Fields quan trọng:**
- `soLuong` - Số lượng sản phẩm
- `donGia` - Đơn giá tại thời điểm bán
- `thanhTien` - Tự động tính: `soLuong * donGia` (@PrePersist/@PreUpdate)

**Business Logic:**
- `calculateThanhTien()` - Tự động tính thành tiền trước khi save

**Sử dụng trong module:**
- POS (checkout - tạo chi tiết)
- Reports (chi tiết bán hàng)

---

### **4.2.6. KhachHang (Khách Hàng)**

**Entity:** `KhachHang`

**Quan hệ:**

1. **OneToMany với HoaDon**
   - `HoaDon.khachHang` → `KhachHang`
   - Một khách hàng có nhiều hóa đơn
   - Fetch: LAZY

**Fields quan trọng:**
- `maKhachHang` - Unique
- `diemTichLuy` - Điểm tích lũy hiện tại
- `soDienThoai` - Indexed (tìm kiếm)
- `email` - Indexed (tìm kiếm)

**Sử dụng trong module:**
- Customer Management (CRUD)
- POS (checkout - khachHangId, tính điểm)
- Reports (khách hàng)

---

### **4.2.7. NhaCungCap (Nhà Cung Cấp)**

**Entity:** `NhaCungCap`

**Quan hệ:**

1. **OneToMany với SanPham**
   - `SanPham.nhaCungCap` → `NhaCungCap`
   - Một nhà cung cấp cung cấp nhiều sản phẩm
   - Fetch: LAZY

2. **OneToMany với NhapHang**
   - `NhapHang.nhaCungCap` → `NhaCungCap`
   - Một nhà cung cấp có nhiều phiếu nhập hàng
   - Fetch: LAZY

**Sử dụng trong module:**
- Supplier Management (CRUD)
- Product Management (link sản phẩm)
- Inventory Management (nhập hàng)

---

### **4.2.8. NhapHang (Phiếu Nhập Hàng)**

**Entity:** `NhapHang`

**Quan hệ:**

1. **ManyToOne với NhaCungCap**
   - `NhapHang.nhaCungCap` → `NhaCungCap`
   - Một phiếu nhập từ một nhà cung cấp (required)
   - Fetch: LAZY

2. **ManyToOne với ChiNhanh**
   - `NhapHang.chiNhanh` → `ChiNhanh`
   - Một phiếu nhập thuộc một chi nhánh (required)
   - Fetch: LAZY

3. **ManyToOne với NhanVien**
   - `NhapHang.nhanVien` → `NhanVien`
   - Một phiếu nhập được tạo bởi một nhân viên (required)
   - Fetch: LAZY

4. **OneToMany với ChiTietNhapHang**
   - `ChiTietNhapHang.nhapHang` → `NhapHang`
   - Một phiếu nhập có nhiều chi tiết nhập hàng
   - Cascade: ALL, orphanRemoval: true
   - BatchSize: 20
   - Fetch: LAZY

**Fields quan trọng:**
- `maNhapHang` - Unique, tự động sinh
- `tongTien` - Tổng tiền nhập hàng

**Sử dụng trong module:**
- Inventory Management (nhập hàng, cập nhật tồn kho)

---

### **4.2.9. ChiTietNhapHang (Chi Tiết Nhập Hàng)**

**Entity:** `ChiTietNhapHang`

**Quan hệ:**

1. **ManyToOne với NhapHang**
   - `ChiTietNhapHang.nhapHang` → `NhapHang`
   - Một chi tiết thuộc một phiếu nhập (required)
   - Fetch: LAZY

2. **ManyToOne với SanPham**
   - `ChiTietNhapHang.sanPham` → `SanPham`
   - Một chi tiết là một sản phẩm (required)
   - Fetch: LAZY

**Fields quan trọng:**
- `soLuong` - Số lượng nhập
- `donGia` - Đơn giá nhập
- `thanhTien` - Tự động tính: `soLuong * donGia`

**Business Logic:**
- Khi tạo → Tăng `SanPham.tonKho` = `tonKho + soLuong`

**Sử dụng trong module:**
- Inventory Management (nhập hàng)

---

### **4.2.10. KhuyenMai (Khuyến Mãi)**

**Entity:** `KhuyenMai`

**Quan hệ:**

1. **ManyToOne với ChiNhanh**
   - `KhuyenMai.chiNhanh` → `ChiNhanh`
   - Một khuyến mãi thuộc một chi nhánh (nullable - null = áp dụng tất cả)
   - Fetch: LAZY

2. **OneToMany với ChiTietKhuyenMai**
   - `ChiTietKhuyenMai.khuyenMai` → `KhuyenMai`
   - Một khuyến mãi có nhiều chi tiết khuyến mãi
   - Cascade: ALL, orphanRemoval: true
   - BatchSize: 20
   - Fetch: LAZY

**Fields quan trọng:**
- `loaiKhuyenMai` - PERCENTAGE, FIXED_AMOUNT, BOGO, BUY_X_GET_Y
- `giaTriKhuyenMai` - Giá trị khuyến mãi
- `giaTriToiThieu` - Số tiền tối thiểu để áp dụng
- `giamToiDa` - Số tiền giảm tối đa
- `ngayBatDau`, `ngayKetThuc` - Thời gian áp dụng
- `soLanDaSuDung` - Số lần đã sử dụng

**Business Logic:**
- `isActive()` - Kiểm tra khuyến mãi có đang active không
- `incrementUsage()` - Tăng số lần sử dụng

**Sử dụng trong module:**
- Promotion Management (CRUD)
- POS (tự động áp dụng khi checkout)

---

### **4.2.11. ChiTietKhuyenMai (Chi Tiết Khuyến Mãi)**

**Entity:** `ChiTietKhuyenMai`

**Quan hệ:**

1. **ManyToOne với KhuyenMai**
   - `ChiTietKhuyenMai.khuyenMai` → `KhuyenMai`
   - Một chi tiết thuộc một khuyến mãi (required)
   - Fetch: LAZY

2. **ManyToOne với SanPham**
   - `ChiTietKhuyenMai.sanPham` → `SanPham`
   - Một chi tiết là một sản phẩm (required)
   - Fetch: LAZY

**Fields quan trọng:**
- `apDung` - Boolean, true = áp dụng cho sản phẩm này

**Sử dụng trong module:**
- Promotion Management (link sản phẩm với khuyến mãi)

---

### **4.2.12. NguyenLieu (Nguyên Liệu)**

**Entity:** `NguyenLieu`

**Quan hệ:**

1. **ManyToOne với ChiNhanh**
   - `NguyenLieu.chiNhanh` → `ChiNhanh`
   - Một nguyên liệu thuộc một chi nhánh (nullable)
   - Fetch: LAZY

2. **OneToMany với PhieuNhapXuatNguyenLieu**
   - `PhieuNhapXuatNguyenLieu.nguyenLieu` → `NguyenLieu`
   - Một nguyên liệu có nhiều phiếu nhập/xuất
   - Fetch: LAZY

**Fields quan trọng:**
- `maNguyenLieu` - Unique
- `tonKho` - Tồn kho hiện tại (BigDecimal)
- `tonKhoToiThieu` - Tồn kho tối thiểu

**Business Logic:**
- `tangSoLuong()` - Tăng số lượng khi nhập
- `giamSoLuong()` - Giảm số lượng khi xuất

**Sử dụng trong module:**
- Raw Material Management (CRUD, nhập/xuất)

---

### **4.2.13. PhieuNhapXuatNguyenLieu (Phiếu Nhập/Xuất Nguyên Liệu)**

**Entity:** `PhieuNhapXuatNguyenLieu`

**Quan hệ:**

1. **ManyToOne với NguyenLieu**
   - `PhieuNhapXuatNguyenLieu.nguyenLieu` → `NguyenLieu`
   - Một phiếu thuộc một nguyên liệu (required)
   - Fetch: LAZY

2. **ManyToOne với NhanVien**
   - `PhieuNhapXuatNguyenLieu.nhanVien` → `NhanVien`
   - Một phiếu được tạo bởi một nhân viên (required)
   - Fetch: LAZY

**Fields quan trọng:**
- `maPhieu` - Unique, tự động sinh
- `loaiPhieu` - NHAP (nhập) hoặc XUAT (xuất)
- `soLuong` - Số lượng nhập/xuất

**Business Logic:**
- Khi `loaiPhieu = NHAP` → Tăng `NguyenLieu.tonKho`
- Khi `loaiPhieu = XUAT` → Giảm `NguyenLieu.tonKho`

**Sử dụng trong module:**
- Raw Material Management (nhập/xuất)

---

## 4.3. Tóm Tắt Mối Quan Hệ

### **OneToMany Relationships:**

| Parent Entity | Child Entity | Cascade | Orphan Removal |
|--------------|-------------|---------|----------------|
| ChiNhanh | NhanVien | - | - |
| ChiNhanh | SanPham | - | - |
| ChiNhanh | HoaDon | - | - |
| ChiNhanh | NhapHang | - | - |
| ChiNhanh | KhuyenMai | - | - |
| ChiNhanh | NguyenLieu | - | - |
| HoaDon | ChiTietHoaDon | ALL | true |
| NhapHang | ChiTietNhapHang | ALL | true |
| KhuyenMai | ChiTietKhuyenMai | ALL | true |
| NhanVien | HoaDon | - | - |
| NhanVien | NhapHang | - | - |
| NhanVien | PhieuNhapXuatNguyenLieu | - | - |
| KhachHang | HoaDon | - | - |
| NhaCungCap | SanPham | - | - |
| NhaCungCap | NhapHang | - | - |
| SanPham | ChiTietHoaDon | - | - |
| SanPham | ChiTietNhapHang | - | - |
| SanPham | ChiTietKhuyenMai | - | - |
| NguyenLieu | PhieuNhapXuatNguyenLieu | - | - |

### **ManyToOne Relationships:**

Tất cả các quan hệ ManyToOne đều:
- Fetch: LAZY
- JoinColumn: Foreign key column
- Nullable: Tùy theo business rule

---

## 4.4. Entity Usage trong Modules

### **Product Module:**
- `SanPham`
- `ChiNhanh`
- `NhaCungCap`

### **POS Module:**
- `HoaDon`
- `ChiTietHoaDon`
- `SanPham`
- `KhachHang`
- `NhanVien`
- `ChiNhanh`
- `KhuyenMai`
- `ChiTietKhuyenMai`

### **Inventory Module:**
- `NhapHang`
- `ChiTietNhapHang`
- `SanPham`
- `NhaCungCap`
- `ChiNhanh`
- `NhanVien`

### **Promotion Module:**
- `KhuyenMai`
- `ChiTietKhuyenMai`
- `SanPham`
- `ChiNhanh`

### **Customer Module:**
- `KhachHang`
- `HoaDon`

### **Employee Module:**
- `NhanVien`
- `ChiNhanh`

### **Raw Material Module:**
- `NguyenLieu`
- `PhieuNhapXuatNguyenLieu`
- `ChiNhanh`
- `NhanVien`

---

## 4.5. Lưu Ý Quan Trọng

### **1. Fetch Strategy:**
- Tất cả relationships đều dùng **LAZY loading**
- Sử dụng `JOIN FETCH` trong queries khi cần eager load

### **2. Cascade:**
- Chỉ có các quan hệ OneToMany với chi tiết mới có cascade:
  - `HoaDon` → `ChiTietHoaDon` (Cascade.ALL)
  - `NhapHang` → `ChiTietNhapHang` (Cascade.ALL)
  - `KhuyenMai` → `ChiTietKhuyenMai` (Cascade.ALL)

### **3. Orphan Removal:**
- Khi xóa parent, tự động xóa children:
  - Xóa `HoaDon` → Xóa tất cả `ChiTietHoaDon`
  - Xóa `NhapHang` → Xóa tất cả `ChiTietNhapHang`
  - Xóa `KhuyenMai` → Xóa tất cả `ChiTietKhuyenMai`

### **4. BatchSize:**
- Các collection có `@BatchSize(size = 20)` để tối ưu N+1 queries

### **5. Indexes:**
- Foreign keys đều có indexes
- Các trường tìm kiếm thường xuyên có indexes (barcode, maSanPham, etc.)

---

**📝 Tài liệu tiếp theo:**
- [Phần 5: Quy Trình Xử Lý Quan Trọng](./05_QUY_TRINH_XU_LY.md)

