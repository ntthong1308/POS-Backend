# 📊 Gợi Ý Cải Thiện Trang Báo Cáo

## 🎯 Tổng Quan Hiện Tại

Trang báo cáo hiện có:
1. ✅ 3 nút download: Báo cáo doanh thu, Báo cáo tồn kho, Báo cáo bán hàng
2. ✅ Biểu đồ "Doanh thu theo tháng" - hiển thị doanh thu theo tháng trong năm
3. ✅ "Tổng quan doanh số" - hiển thị tổng doanh thu và breakdown theo category
4. ✅ Bảng "Sản phẩm bán chạy" với dropdown filter (chưa hoạt động)

---

## 💡 Gợi Ý Cải Thiện

### 1. **Thêm Section "Tổng Quan Nhanh" (Key Metrics Cards)**

Hiển thị các chỉ số quan trọng ở đầu trang:

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Tổng Quan Nhanh                                         │
├──────────────┬──────────────┬──────────────┬──────────────┤
│ Tổng Doanh Thu│ Tổng Đơn Hàng│ Tổng Khách  │ Lợi Nhuận    │
│ 898.996₫     │ 150 đơn      │ 80 khách    │ 89.900₫      │
│ ↑ 32.2%      │ ↑ 15.5%      │ ↑ 8.3%      │ ↑ 28.1%      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Dữ liệu từ API:**
- `totalRevenue` hoặc `netRevenue` → Tổng Doanh Thu
- `totalOrders` → Tổng Đơn Hàng
- `totalCustomers` → Tổng Khách Hàng
- `totalProfit` → Lợi Nhuận

**Tính toán tăng trưởng:**
- So sánh với kỳ trước (tháng trước, quý trước, năm trước)

---

### 2. **Cải Thiện "Tổng Quan Doanh Số"**

**Hiện tại:** Chỉ hiển thị tổng doanh thu và breakdown theo category

**Gợi ý cải thiện:**
- Thêm các metrics:
  - **Giá trị đơn hàng trung bình** (`averageOrderValue`)
  - **Tổng giảm giá** (`totalDiscount`)
  - **Tỷ lệ giảm giá** (`totalDiscount / totalRevenue * 100`)

**Visualization:**
- Thêm pie chart hoặc donut chart để hiển thị tỷ lệ category
- Thêm tooltip hiển thị chi tiết khi hover

---

### 3. **Thêm Section "Doanh Thu Theo Ngày" (Line Chart)**

Hiển thị xu hướng doanh thu theo ngày trong tháng:

```
┌─────────────────────────────────────────────────────────────┐
│  📈 Doanh Thu Theo Ngày (Tháng 12)                          │
│                                                              │
│  [Line Chart - Doanh thu theo ngày]                         │
│                                                              │
│  X-axis: Ngày (1-31)                                         │
│  Y-axis: Doanh thu (₫)                                      │
└─────────────────────────────────────────────────────────────┘
```

**Dữ liệu từ API:**
- Sử dụng `revenueByDate` từ `RevenueReport` (nếu có)
- Hoặc tính toán từ dữ liệu invoices theo ngày

---

### 4. **Cải Thiện Bảng "Sản Phẩm Bán Chạy"**

**Hiện tại:** Dropdown filter chưa hoạt động

**Gợi ý cải thiện:**

#### a. **Làm cho Dropdown Filter hoạt động:**
- "Tháng này" → `startDate = đầu tháng hiện tại`, `endDate = hôm nay`
- "Tháng trước" → `startDate = đầu tháng trước`, `endDate = cuối tháng trước`
- "3 Tháng gần đây" → `startDate = 3 tháng trước`, `endDate = hôm nay`
- "6 Tháng gần đây" → `startDate = 6 tháng trước`, `endDate = hôm nay`
- "1 Năm" → `startDate = đầu năm`, `endDate = hôm nay`

#### b. **Thêm cột "Mã SKU":**
- Hiển thị `maSanPham` trong bảng

#### c. **Thêm cột "Tỷ lệ":**
- Hiển thị tỷ lệ doanh thu của sản phẩm so với tổng doanh thu
- Ví dụ: "15.6%" (140.000₫ / 898.996₫ * 100)

#### d. **Thêm pagination:**
- Nếu có nhiều sản phẩm, thêm pagination hoặc "Xem thêm"

---

### 5. **Thêm Section "Sản Phẩm Tồn Kho Thấp"**

Hiển thị cảnh báo sản phẩm sắp hết hàng:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Sản Phẩm Tồn Kho Thấp                                   │
│                                                              │
│  [Table: Mã SP | Tên SP | Số lượng tồn | Trạng thái]       │
│                                                              │
│  - SP001 | Cà phê đen | 5 | ⚠️ Sắp hết                      │
│  - SP002 | Cà phê sữa | 2 | 🔴 Hết hàng                     │
└─────────────────────────────────────────────────────────────┘
```

**Dữ liệu từ API:**
- Sử dụng `reportsAPI.getLowStock()`

---

### 6. **Thêm Section "So Sánh Kỳ" (Period Comparison)**

So sánh doanh thu giữa các kỳ:

```
┌─────────────────────────────────────────────────────────────┐
│  📊 So Sánh Kỳ                                              │
│                                                              │
│  Kỳ này: 898.996₫  |  Kỳ trước: 680.000₫  |  Tăng: +32.2%   │
│                                                              │
│  [Bar Chart - So sánh 2 kỳ]                                 │
└─────────────────────────────────────────────────────────────┘
```

**Logic:**
- Nếu đang xem "Tháng này" → So sánh với "Tháng trước"
- Nếu đang xem "Quý này" → So sánh với "Quý trước"
- Nếu đang xem "Năm này" → So sánh với "Năm trước"

---

### 7. **Thêm Section "Top Khách Hàng" (Nếu có API)**

Hiển thị khách hàng mua nhiều nhất:

```
┌─────────────────────────────────────────────────────────────┐
│  👥 Top Khách Hàng                                          │
│                                                              │
│  [Table: Hạng | Tên KH | Số đơn | Tổng chi tiêu]           │
└─────────────────────────────────────────────────────────────┘
```

**Lưu ý:** Cần API endpoint mới: `GET /api/v1/admin/reports/top-customers`

---

### 8. **Thêm Date Range Picker**

Thay vì chỉ có dropdown filter, thêm date range picker để chọn khoảng thời gian tùy chỉnh:

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Chọn Khoảng Thời Gian                                    │
│                                                              │
│  [Date Picker: Từ ngày] - [Date Picker: Đến ngày]           │
│  [Button: Áp dụng]                                           │
└─────────────────────────────────────────────────────────────┘
```

---

### 9. **Thêm Export Options**

Mở rộng các tùy chọn export:

- ✅ Export Excel (hiện có)
- ➕ Export PDF
- ➕ Export CSV
- ➕ In báo cáo (Print)

---

### 10. **Thêm Real-time Updates**

Nếu có WebSocket hoặc polling:
- Tự động refresh dữ liệu mỗi 5-10 phút
- Hiển thị "Cập nhật lần cuối: 14:30:25"

---

## 📋 Layout Đề Xuất

```
┌─────────────────────────────────────────────────────────────┐
│  [Header: 3 nút Download]                                    │
├─────────────────────────────────────────────────────────────┤
│  [Section 1: Tổng Quan Nhanh - 4 Cards]                     │
├─────────────────────────────────────────────────────────────┤
│  [Section 2: 2 Charts - Doanh thu theo tháng + Tổng quan]   │
├─────────────────────────────────────────────────────────────┤
│  [Section 3: Doanh thu theo ngày (Line Chart)]              │
├─────────────────────────────────────────────────────────────┤
│  [Section 4: Sản phẩm bán chạy (Table)]                      │
├─────────────────────────────────────────────────────────────┤
│  [Section 5: Sản phẩm tồn kho thấp (Table)]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI/UX Improvements

### 1. **Loading States**
- Skeleton loaders thay vì "Đang tải..."
- Progressive loading (load từng section)

### 2. **Empty States**
- Hiển thị message và icon khi không có dữ liệu
- Gợi ý hành động (ví dụ: "Chưa có dữ liệu. Hãy tạo đơn hàng đầu tiên!")

### 3. **Error Handling**
- Hiển thị error message rõ ràng
- Retry button khi có lỗi

### 4. **Responsive Design**
- Mobile-friendly layout
- Stack charts vertically trên mobile

### 5. **Tooltips & Help**
- Tooltip giải thích các metrics
- Icon "?" với popover giải thích

---

## 🔧 Technical Implementation

### 1. **State Management**
```typescript
const [dateRange, setDateRange] = useState({
  startDate: startOfYear,
  endDate: today,
  period: 'year' // 'month' | 'quarter' | 'year' | 'custom'
});
```

### 2. **API Calls**
```typescript
// Load all data based on date range
useEffect(() => {
  loadRevenueReport(dateRange);
  loadTopProducts(dateRange);
  loadLowStock();
}, [dateRange]);
```

### 3. **Chart Libraries**
- Hiện tại: Recharts ✅
- Có thể thêm: Chart.js hoặc ApexCharts cho advanced charts

---

## 📊 Priority Implementation

### **High Priority (Nên làm ngay):**
1. ✅ Làm cho dropdown filter "Sản phẩm bán chạy" hoạt động
2. ✅ Thêm Section "Tổng Quan Nhanh" (4 cards metrics)
3. ✅ Cải thiện "Tổng Quan Doanh Số" với thêm metrics
4. ✅ Thêm Section "Sản Phẩm Tồn Kho Thấp"

### **Medium Priority (Nên làm sau):**
5. ➕ Thêm Date Range Picker
6. ➕ Thêm Section "So Sánh Kỳ"
7. ➕ Cải thiện UI/UX (loading states, empty states)

### **Low Priority (Có thể làm sau):**
8. ➕ Thêm Section "Doanh Thu Theo Ngày" (Line Chart)
9. ➕ Thêm Section "Top Khách Hàng" (nếu có API)
10. ➕ Export PDF/CSV

---

## 📝 Notes

- Tất cả các gợi ý đều dựa trên API hiện có hoặc có thể mở rộng
- Ưu tiên sử dụng dữ liệu từ `RevenueReport` và `TopProduct`
- Đảm bảo responsive và performance tốt

---

**Ngày tạo:** 2025-12-07  
**Version:** 1.0

