# 📊 BÁO CÁO DOANH THU - FIELDS CHO BACKEND

**Ngày:** 2025-12-12  
**Mục đích:** Liệt kê các field cần thiết cho API xuất Excel "Báo cáo doanh thu" (tổng hợp từ Dashboard và Báo cáo)

---

## 🔄 API ENDPOINT

```http
GET /api/v1/admin/reports/revenue/excel?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
Authorization: Bearer {token}
```

**Query Parameters:**
- `fromDate` (required): Ngày bắt đầu (format: `YYYY-MM-DD`)
- `toDate` (required): Ngày kết thúc (format: `YYYY-MM-DD`)
- `branchId` (optional): Filter theo chi nhánh

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File: Excel file (.xlsx)

---

## 📋 CÁC SHEET TRONG EXCEL

### **Sheet 1: Tổng quan (Overview)**

| Field | Mô tả | Kiểu dữ liệu |
|-------|-------|--------------|
| `startDate` | Ngày bắt đầu | Date (YYYY-MM-DD) |
| `endDate` | Ngày kết thúc | Date (YYYY-MM-DD) |
| `totalOrders` | Tổng số đơn hàng | Integer |
| `totalRevenue` | Tổng doanh thu (trước giảm giá) | Decimal |
| `totalDiscount` | Tổng giảm giá | Decimal |
| `netRevenue` | Doanh thu thực tế (sau giảm giá) | Decimal |
| `totalProfit` | Tổng lợi nhuận | Decimal |
| `totalCustomers` | Tổng số khách hàng | Integer |
| `averageOrderValue` | Giá trị đơn hàng trung bình | Decimal |

---

### **Sheet 2: Doanh thu theo tháng (Monthly Revenue)**

| Field | Mô tả | Kiểu dữ liệu |
|-------|-------|--------------|
| `month` | Tháng (format: "YYYY-MM" hoặc "Tháng MM/YYYY") | String |
| `revenue` | Doanh thu trong tháng | Decimal |
| `orders` | Số đơn hàng trong tháng | Integer |
| `profit` | Lợi nhuận trong tháng | Decimal |

**Lưu ý:** Chỉ hiển thị các tháng trong khoảng `fromDate` đến `toDate`

---

### **Sheet 3: Doanh số theo danh mục (Sales by Category)**

| Field | Mô tả | Kiểu dữ liệu |
|-------|-------|--------------|
| `category` | Tên danh mục ("Đồ ăn" hoặc "Đồ uống") | String |
| `revenue` | Doanh thu theo danh mục | Decimal |
| `quantity` | Số lượng sản phẩm bán | Integer |
| `percentage` | % so với tổng doanh thu | Decimal |

**Lưu ý:** Chỉ có 2 danh mục: "Đồ ăn" và "Đồ uống"

---

### **Sheet 4: Sản phẩm bán chạy (Top Products)**

| Field | Mô tả | Kiểu dữ liệu |
|-------|-------|--------------|
| `rank` | Hạng (1, 2, 3, ...) | Integer |
| `maSanPham` | Mã sản phẩm | String |
| `tenSanPham` | Tên sản phẩm | String |
| `tenDanhMuc` | Tên danh mục ("Đồ ăn" hoặc "Đồ uống") | String |
| `totalQuantitySold` | Tổng số lượng bán | Integer |
| `totalRevenue` | Tổng doanh thu | Decimal |
| `averagePrice` | Giá trung bình (revenue / quantity) | Decimal |

**Lưu ý:** 
- Sắp xếp theo `totalRevenue` giảm dần
- Limit: Top 20 sản phẩm

---

### **Sheet 5: Chi tiết đơn hàng (Order Details)**

| Field | Mô tả | Kiểu dữ liệu |
|-------|-------|--------------|
| `maHoaDon` | Mã hóa đơn | String |
| `ngayTao` | Ngày tạo hóa đơn | DateTime |
| `tenKhachHang` | Tên khách hàng (hoặc "Khách vãng lai") | String |
| `tongTien` | Tổng tiền (trước giảm giá) | Decimal |
| `giamGia` | Giảm giá | Decimal |
| `thanhTien` | Thành tiền (sau giảm giá) | Decimal |
| `phuongThucThanhToan` | Phương thức thanh toán | String |
| `trangThai` | Trạng thái ("COMPLETED", "CANCELLED", "PENDING") | String |
| `diemTichLuy` | Điểm tích lũy | Integer |

**Lưu ý:** 
- Chỉ lấy hóa đơn có `trangThai = 'COMPLETED'`
- Sắp xếp theo `ngayTao` giảm dần

---

### **Sheet 6: Thống kê theo ngày (Daily Statistics)**

| Field | Mô tả | Kiểu dữ liệu |
|-------|-------|--------------|
| `date` | Ngày (format: "DD/MM/YYYY") | String |
| `orders` | Số đơn hàng | Integer |
| `revenue` | Doanh thu | Decimal |
| `profit` | Lợi nhuận | Decimal |
| `customers` | Số khách hàng | Integer |
| `averageOrderValue` | Giá trị đơn hàng trung bình | Decimal |

**Lưu ý:** 
- Mỗi dòng = 1 ngày trong khoảng `fromDate` đến `toDate`
- Sắp xếp theo `date` tăng dần

---

## 📊 CẤU TRÚC EXCEL FILE

```
📁 Dashboard_Revenue_Report_YYYY-MM-DD.xlsx
├── 📄 Sheet 1: Tổng quan
│   └── Bảng tổng hợp các chỉ số chính
├── 📄 Sheet 2: Doanh thu theo tháng
│   └── Bảng doanh thu theo từng tháng
├── 📄 Sheet 3: Doanh số theo danh mục
│   └── Bảng phân loại doanh số: Đồ ăn vs Đồ uống
├── 📄 Sheet 4: Sản phẩm bán chạy
│   └── Top 20 sản phẩm bán chạy nhất
├── 📄 Sheet 5: Chi tiết đơn hàng
│   └── Danh sách tất cả hóa đơn trong khoảng thời gian
└── 📄 Sheet 6: Thống kê theo ngày
    └── Thống kê chi tiết từng ngày
```

---

## 🔍 QUERY REQUIREMENTS

### **1. Tổng quan (Overview)**
```sql
-- Tổng số đơn hàng
SELECT COUNT(*) FROM hoa_don 
WHERE ngay_tao BETWEEN :fromDate AND :toDate 
AND trang_thai = 'COMPLETED'

-- Tổng doanh thu
SELECT SUM(tong_tien) FROM hoa_don 
WHERE ngay_tao BETWEEN :fromDate AND :toDate 
AND trang_thai = 'COMPLETED'

-- Tổng giảm giá
SELECT SUM(giam_gia) FROM hoa_don 
WHERE ngay_tao BETWEEN :fromDate AND :toDate 
AND trang_thai = 'COMPLETED'

-- Tổng lợi nhuận
SELECT SUM(loi_nhuan) FROM hoa_don 
WHERE ngay_tao BETWEEN :fromDate AND :toDate 
AND trang_thai = 'COMPLETED'

-- Tổng số khách hàng
SELECT COUNT(DISTINCT khach_hang_id) FROM hoa_don 
WHERE ngay_tao BETWEEN :fromDate AND :toDate 
AND trang_thai = 'COMPLETED'
AND khach_hang_id IS NOT NULL
```

### **2. Doanh thu theo tháng**
```sql
SELECT 
  DATE_FORMAT(ngay_tao, '%Y-%m') as month,
  SUM(thanh_tien) as revenue,
  COUNT(*) as orders,
  SUM(loi_nhuan) as profit
FROM hoa_don
WHERE ngay_tao BETWEEN :fromDate AND :toDate
AND trang_thai = 'COMPLETED'
GROUP BY DATE_FORMAT(ngay_tao, '%Y-%m')
ORDER BY month ASC
```

### **3. Doanh số theo danh mục**
```sql
SELECT 
  dm.ten_danh_muc as category,
  SUM(cthd.thanh_tien) as revenue,
  SUM(cthd.so_luong) as quantity
FROM chi_tiet_hoa_don cthd
INNER JOIN san_pham sp ON cthd.san_pham_id = sp.id
INNER JOIN danh_muc dm ON sp.danh_muc_id = dm.id
INNER JOIN hoa_don hd ON cthd.hoa_don_id = hd.id
WHERE hd.ngay_tao BETWEEN :fromDate AND :toDate
AND hd.trang_thai = 'COMPLETED'
GROUP BY dm.ten_danh_muc
ORDER BY revenue DESC
```

### **4. Sản phẩm bán chạy**
```sql
SELECT 
  ROW_NUMBER() OVER (ORDER BY SUM(cthd.thanh_tien) DESC) as rank,
  sp.ma_san_pham,
  sp.ten_san_pham,
  dm.ten_danh_muc,
  SUM(cthd.so_luong) as total_quantity_sold,
  SUM(cthd.thanh_tien) as total_revenue,
  AVG(cthd.don_gia) as average_price
FROM chi_tiet_hoa_don cthd
INNER JOIN san_pham sp ON cthd.san_pham_id = sp.id
INNER JOIN danh_muc dm ON sp.danh_muc_id = dm.id
INNER JOIN hoa_don hd ON cthd.hoa_don_id = hd.id
WHERE hd.ngay_tao BETWEEN :fromDate AND :toDate
AND hd.trang_thai = 'COMPLETED'
GROUP BY sp.id, sp.ma_san_pham, sp.ten_san_pham, dm.ten_danh_muc
ORDER BY total_revenue DESC
LIMIT 20
```

### **5. Chi tiết đơn hàng**
```sql
SELECT 
  hd.ma_hoa_don,
  hd.ngay_tao,
  COALESCE(kh.ten_khach_hang, 'Khách vãng lai') as ten_khach_hang,
  hd.tong_tien,
  hd.giam_gia,
  hd.thanh_tien,
  hd.phuong_thuc_thanh_toan,
  hd.trang_thai,
  hd.diem_tich_luy
FROM hoa_don hd
LEFT JOIN khach_hang kh ON hd.khach_hang_id = kh.id
WHERE hd.ngay_tao BETWEEN :fromDate AND :toDate
AND hd.trang_thai = 'COMPLETED'
ORDER BY hd.ngay_tao DESC
```

### **6. Thống kê theo ngày**
```sql
SELECT 
  DATE(hd.ngay_tao) as date,
  COUNT(*) as orders,
  SUM(hd.thanh_tien) as revenue,
  SUM(hd.loi_nhuan) as profit,
  COUNT(DISTINCT hd.khach_hang_id) as customers,
  AVG(hd.thanh_tien) as average_order_value
FROM hoa_don hd
WHERE hd.ngay_tao BETWEEN :fromDate AND :toDate
AND hd.trang_thai = 'COMPLETED'
GROUP BY DATE(hd.ngay_tao)
ORDER BY date ASC
```

---

## 📝 FORMATTING REQUIREMENTS

### **1. Header Row**
- Font: **Bold**, Size: 12
- Background: **#F97316** (Orange)
- Text Color: **White**
- Alignment: **Center**

### **2. Data Rows**
- Font: Regular, Size: 11
- Alignment: 
  - Text: **Left**
  - Numbers: **Right**
  - Dates: **Center**

### **3. Currency Format**
- Format: `#,##0.00 ₫`
- Example: `1,234,567.89 ₫`

### **4. Date Format**
- Format: `DD/MM/YYYY`
- Example: `12/12/2025`

### **5. Percentage Format**
- Format: `0.00%`
- Example: `32.20%`

---

## ✅ CHECKLIST IMPLEMENTATION

- [ ] Tạo API endpoint `/admin/reports/revenue/excel`
- [ ] Implement query cho Sheet 1: Tổng quan
- [ ] Implement query cho Sheet 2: Doanh thu theo tháng
- [ ] Implement query cho Sheet 3: Doanh số theo danh mục
- [ ] Implement query cho Sheet 4: Sản phẩm bán chạy
- [ ] Implement query cho Sheet 5: Chi tiết đơn hàng
- [ ] Implement query cho Sheet 6: Thống kê theo ngày
- [ ] Tạo Excel file với 6 sheets
- [ ] Apply formatting (header, currency, date, percentage)
- [ ] Test với các khoảng thời gian khác nhau
- [ ] Test với dữ liệu lớn (performance)

---

**Trạng thái:** ✅ Frontend đã sẵn sàng, chỉ cần implement ở Backend

