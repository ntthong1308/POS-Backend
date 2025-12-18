# 📊 Dashboard API Guide - Hướng Dẫn API cho Dashboard

> Tài liệu này mô tả các API cần sử dụng để hiển thị dashboard như trong giao diện

---

## 📋 Tổng Quan

Dashboard cần hiển thị:
1. **4 Key Metric Cards** - Thống kê hôm nay với % thay đổi
2. **Bar Chart** - Thống kê đơn hàng theo ngày (7 ngày)
3. **Line Chart** - Tổng quan doanh số (7 ngày)
4. **Table** - Sản phẩm bán chạy
5. **Date Range Picker** - Chọn khoảng thời gian
6. **Export Report Button** - Xuất báo cáo Excel

---

## 🔌 API Endpoints

### 1. **Lấy Thống Kê Dashboard (Main API)**

**Endpoint:** `GET /api/v1/admin/dashboard`

**Query Parameters:**
- `date` (optional): Format `YYYY-MM-DD` (ví dụ: `2025-12-06`)
  - Nếu không có: mặc định = hôm nay
  - Dùng để filter thống kê theo ngày cụ thể

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": {
    "todayStats": {
      "doanhThu": 35546000.00,           // Doanh thu hôm nay
      "doanhThuChange": 16.0,             // % thay đổi (+16%)
      "tongDon": 467,                     // Tổng đơn hôm nay
      "tongDonChange": 13.0,              // % thay đổi (+13%)
      "loiNhuan": 1679000.00,             // Lợi nhuận hôm nay
      "loiNhuanChange": 14.0,             // % thay đổi (+14%)
      "khachHang": 3290,                  // Khách hàng hôm nay
      "khachHangChange": -2.9             // % thay đổi (-2.9%)
    },
    "orderStatsByDate": [
      {
        "date": "2 Jan",                  // Format: "d MMM"
        "donHang": 100,                   // Số đơn hàng
        "doanhSo": 5000000.00             // Doanh số
      },
      {
        "date": "3 Jan",
        "donHang": 120,
        "doanhSo": 6000000.00
      }
      // ... 7 ngày
    ],
    "salesOverview": [
      {
        "date": "SAT",                    // Format: "EEE" (SAT, SUN, MON, etc.)
        "doanhSo": 10000000.00,           // Doanh số
        "loiNhuan": 1000000.00            // Lợi nhuận
      },
      {
        "date": "SUN",
        "doanhSo": 12000000.00,
        "loiNhuan": 1200000.00
      }
      // ... 7 ngày
    ],
    "topProducts": [
      {
        "sanPhamId": 1,
        "maSanPham": "CF001",
        "tenSanPham": "Cà phê đá",
        "totalQuantitySold": 120,         // ĐÃ BÁN
        "totalRevenue": 6720000.00        // TỔNG BÁN (doanh thu)
      }
      // ... top 10
    ]
  },
  "meta": {
    "timestamp": "2025-12-06T14:00:00"
  }
}
```

**Frontend Usage:**
```javascript
// Lấy thống kê hôm nay
const response = await fetch('/api/v1/admin/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Lấy thống kê theo ngày cụ thể
const response = await fetch('/api/v1/admin/dashboard?date=2025-12-06', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
const stats = data.data;

// Hiển thị 4 cards
const todayStats = stats.todayStats;
// todayStats.doanhThu → 35.546.000₫
// todayStats.doanhThuChange → +16%

// Hiển thị bar chart
const orderStats = stats.orderStatsByDate;
// orderStats[0].date → "2 Jan"
// orderStats[0].donHang → 100
// orderStats[0].doanhSo → 5000000

// Hiển thị line chart
const salesOverview = stats.salesOverview;
// salesOverview[0].date → "SAT"
// salesOverview[0].doanhSo → 10000000
// salesOverview[0].loiNhuan → 1000000

// Hiển thị table
const topProducts = stats.topProducts;
```

---

### 2. **Xuất Báo Cáo Excel**

**Endpoint:** `GET /api/reports/revenue/excel`

**Query Parameters:**
- `startDate` (required): Format `YYYY-MM-DD`
- `endDate` (required): Format `YYYY-MM-DD`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File binary (Excel file)

**Frontend Usage:**
```javascript
// Khi click button "Xuất báo cáo"
async function exportReport(startDate, endDate) {
  const url = `/api/reports/revenue/excel?startDate=${startDate}&endDate=${endDate}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Tạo blob và download
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `BaoCaoDoanhThu_${startDate}_${endDate}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(downloadUrl);
}

// Sử dụng với date range từ picker
const startDate = '2025-12-01';
const endDate = '2025-12-06';
exportReport(startDate, endDate);
```

---

## 📊 Mapping Dữ Liệu cho Giao Diện

### 1. **4 Key Metric Cards**

**Card 1: Doanh thu hôm nay**
```javascript
const card1 = {
  title: "Doanh thu hôm nay",
  value: formatCurrency(stats.todayStats.doanhThu),  // "35.546.000₫"
  change: stats.todayStats.doanhThuChange,            // 16.0
  changeType: stats.todayStats.doanhThuChange >= 0 ? "up" : "down",
  icon: "dollar-sign",
  color: "green"
};
```

**Card 2: Tổng đơn hôm nay**
```javascript
const card2 = {
  title: "Tổng đơn hôm nay",
  value: stats.todayStats.tongDon.toString(),        // "467"
  change: stats.todayStats.tongDonChange,             // 13.0
  changeType: stats.todayStats.tongDonChange >= 0 ? "up" : "down",
  icon: "shopping-bag",
  color: "blue"
};
```

**Card 3: Lợi nhuận hôm nay**
```javascript
const card3 = {
  title: "Lợi nhuận hôm nay",
  value: formatCurrency(stats.todayStats.loiNhuan),  // "1.679.000₫"
  change: stats.todayStats.loiNhuanChange,            // 14.0
  changeType: stats.todayStats.loiNhuanChange >= 0 ? "up" : "down",
  icon: "trending-up",
  color: "orange"
};
```

**Card 4: Khách hàng hôm nay**
```javascript
const card4 = {
  title: "Khách hàng hôm nay",
  value: stats.todayStats.khachHang.toString(),       // "3.290"
  change: stats.todayStats.khachHangChange,          // -2.9
  changeType: stats.todayStats.khachHangChange >= 0 ? "up" : "down",
  icon: "users",
  color: "purple"
};
```

---

### 2. **Bar Chart - Thống kê đơn hàng**

**Chart Type:** Bar Chart (2 series)

**Data:**
```javascript
const chartData = {
  labels: stats.orderStatsByDate.map(item => item.date),  // ["2 Jan", "3 Jan", ...]
  datasets: [
    {
      label: "Đơn hàng",
      data: stats.orderStatsByDate.map(item => item.donHang),  // [100, 120, ...]
      backgroundColor: "blue"
    },
    {
      label: "Doanh số",
      data: stats.orderStatsByDate.map(item => item.doanhSo),   // [5000000, 6000000, ...]
      backgroundColor: "light-blue"
    }
  ]
};
```

**Chart.js Example:**
```javascript
new Chart(ctx, {
  type: 'bar',
  data: chartData,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
```

---

### 3. **Line Chart - Tổng quan doanh số**

**Chart Type:** Line Chart (2 lines)

**Data:**
```javascript
const lineChartData = {
  labels: stats.salesOverview.map(item => item.date),  // ["SAT", "SUN", "MON", ...]
  datasets: [
    {
      label: "Doanh số",
      data: stats.salesOverview.map(item => item.doanhSo),     // [10000000, 12000000, ...]
      borderColor: "blue",
      backgroundColor: "transparent"
    },
    {
      label: "Lợi nhuận",
      data: stats.salesOverview.map(item => item.loiNhuan),     // [1000000, 1200000, ...]
      borderColor: "green",
      backgroundColor: "transparent"
    }
  ]
};
```

**Overall Value:**
```javascript
// Tính tổng doanh số 7 ngày
const totalDoanhSo = stats.salesOverview.reduce((sum, item) => sum + item.doanhSo, 0);
// Format: "68.873.240₫ ↑+20%"
// (Cần tính % thay đổi so với 7 ngày trước đó)
```

---

### 4. **Table - Sản phẩm bán chạy**

**⚠️ Lưu ý:** API hiện tại chỉ trả về:
- `sanPhamId`
- `maSanPham` (MÃ SKU)
- `tenSanPham` (TÊN SẢN PHẨM)
- `totalQuantitySold` (ĐÃ BÁN)
- `totalRevenue` (TỔNG BÁN - doanh thu)

**Thiếu:**
- `tonKho` (TỔNG BÁN - tồn kho) ❌
- `trangThai` (TRẠNG THÁI) ❌
- `giaBan` (GIÁ) ❌

**Giải pháp:** Cần gọi thêm API để lấy thông tin sản phẩm

**Option 1: Gọi API lấy sản phẩm theo ID**
```javascript
// Sau khi có topProducts, gọi API để lấy thông tin chi tiết
const productIds = stats.topProducts.map(p => p.sanPhamId);

// Gọi API lấy sản phẩm (có thể batch hoặc từng cái)
const products = await Promise.all(
  productIds.map(id => 
    fetch(`/api/v1/admin/products/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
  )
);

// Merge data
const tableData = stats.topProducts.map(topProduct => {
  const product = products.find(p => p.data.id === topProduct.sanPhamId);
  return {
    tenSanPham: topProduct.tenSanPham,
    maSKU: topProduct.maSanPham,
    daBan: topProduct.totalQuantitySold,
    tongBan: product?.data.tonKho || 0,        // Tồn kho
    trangThai: getStatusLabel(product?.data.trangThai),  // "Hoạt động", "Còn hàng", etc.
    gia: product?.data.giaBan || 0
  };
});
```

**Option 2: Cải thiện API để trả về đầy đủ thông tin** (Recommended)

Cần update `TopProductDTO` và service để include thêm:
- `tonKho` - Tồn kho hiện tại
- `trangThai` - Trạng thái sản phẩm
- `giaBan` - Giá bán

---

## 🔄 Workflow Frontend

### 1. **Khi Load Dashboard**

```javascript
async function loadDashboard(date = null) {
  try {
    // 1. Lấy thống kê dashboard
    const url = date 
      ? `/api/v1/admin/dashboard?date=${date}`
      : '/api/v1/admin/dashboard';
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    const stats = data.data;
    
    // 2. Hiển thị 4 cards
    renderMetricCards(stats.todayStats);
    
    // 3. Hiển thị bar chart
    renderBarChart(stats.orderStatsByDate);
    
    // 4. Hiển thị line chart
    renderLineChart(stats.salesOverview);
    
    // 5. Hiển thị table (cần gọi thêm API để lấy thông tin sản phẩm)
    await renderTopProductsTable(stats.topProducts);
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}
```

### 2. **Khi Chọn Date Range**

```javascript
function onDateRangeChange(startDate, endDate) {
  // Format: YYYY-MM-DD
  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);
  
  // Reload dashboard với ngày cuối cùng
  loadDashboard(formattedEnd);
  
  // Update date range picker display
  updateDateRangeDisplay(formattedStart, formattedEnd);
}
```

### 3. **Khi Click Export Report**

```javascript
async function onExportReport(startDate, endDate) {
  try {
    const url = `/api/reports/revenue/excel?startDate=${startDate}&endDate=${endDate}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    // Download file
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `BaoCaoDoanhThu_${startDate}_${endDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
  } catch (error) {
    console.error('Error exporting report:', error);
    alert('Lỗi khi xuất báo cáo');
  }
}
```

---

## 📝 Checklist Frontend

- [ ] Gọi API `/api/v1/admin/dashboard` khi load trang
- [ ] Hiển thị 4 metric cards với % thay đổi
- [ ] Render bar chart với 2 series (Đơn hàng, Doanh số)
- [ ] Render line chart với 2 lines (Doanh số, Lợi nhuận)
- [ ] Hiển thị table sản phẩm bán chạy
- [ ] Gọi thêm API để lấy thông tin sản phẩm (tonKho, trangThai, giaBan)
- [ ] Implement date range picker
- [ ] Reload dashboard khi chọn date range
- [ ] Implement export report button
- [ ] Format số tiền (35.546.000₫)
- [ ] Format % thay đổi (+16%, -2.9%)
- [ ] Hiển thị icon và màu sắc cho từng card

---

## ⚠️ Lưu Ý Quan Trọng

### 1. **Top Products Table**

API hiện tại **KHÔNG** trả về đầy đủ thông tin cho table:
- ❌ `tonKho` (TỔNG BÁN - tồn kho)
- ❌ `trangThai` (TRẠNG THÁI)
- ❌ `giaBan` (GIÁ)

**Giải pháp:**
- Gọi thêm API `/api/v1/admin/products/{id}` cho mỗi sản phẩm
- Hoặc cải thiện backend để trả về đầy đủ trong `TopProductDTO`

### 2. **Date Range**

API hiện tại chỉ hỗ trợ filter theo **1 ngày** (`date` parameter).

**Nếu cần filter theo date range:**
- Cần cải thiện backend để hỗ trợ `startDate` và `endDate`
- Hoặc frontend gọi API nhiều lần và aggregate data

### 3. **Lợi nhuận**

Lợi nhuận hiện tính = 10% doanh thu (hardcoded).

**Nếu cần tính chính xác:**
- Cần lưu `giaNhap` và `giaBan` trong database
- Tính: `lợi nhuận = (giaBan - giaNhap) * soLuong`

---

## 🔧 Cải Thiện Backend (Optional)

### 1. **Cải thiện TopProductDTO**

```java
@Data
@Builder
public class TopProductDTO {
    private Long sanPhamId;
    private String maSanPham;
    private String tenSanPham;
    private Long totalQuantitySold;    // ĐÃ BÁN
    private BigDecimal totalRevenue;   // TỔNG BÁN (doanh thu)
    
    // Thêm các field này:
    private Integer tonKho;            // TỔNG BÁN (tồn kho)
    private Status trangThai;          // TRẠNG THÁI
    private BigDecimal giaBan;         // GIÁ
}
```

### 2. **Cải thiện Dashboard API để hỗ trợ date range**

```java
@GetMapping
public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
    
    // Nếu có startDate và endDate → filter theo range
    // Nếu chỉ có date → filter theo 1 ngày
    // Nếu không có gì → hôm nay
}
```

---

**📚 Tài liệu liên quan:**
- [FRONTEND_COMPLETE_GUIDE.md](./FRONTEND_COMPLETE_GUIDE.md) - Tài liệu API đầy đủ
- [API_CLARIFICATIONS.md](./API_CLARIFICATIONS.md) - Câu trả lời các câu hỏi về API

