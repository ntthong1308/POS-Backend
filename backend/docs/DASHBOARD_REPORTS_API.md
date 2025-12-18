# 📋 Dashboard & Reports API Specification (Gộp Dashboard và Reports)

## 📌 Tổng Quan

Dashboard và Reports đã được **gộp lại thành một trang duy nhất** với các tabs. Tài liệu này mô tả tất cả các API endpoints và field requirements.

---

## ✅ Đã Implement

### **1. Dashboard API**

**Endpoint:** `GET /api/v1/admin/dashboard?date=YYYY-MM-DD`

**Description:** Lấy thống kê dashboard cho ngày cụ thể (hoặc hôm nay nếu không có date)

**Request Parameters:**
- `date` (optional): Ngày cần xem thống kê, format: `YYYY-MM-DD`. Nếu không có, mặc định là hôm nay.

**Response:**

```json
{
  "success": true,
  "data": {
    "todayStats": {
      "doanhThu": 898996.00,
      "doanhThuChange": 32.2,
      "tongDon": 150,
      "tongDonChange": 15.5,
      "loiNhuan": 89900.00,
      "loiNhuanChange": 28.1,
      "khachHang": 80,
      "khachHangChange": 8.3
    },
    "orderStatsByDate": [
      {
        "date": "2 Jan",
        "donHang": 10,
        "doanhSo": 50000.00
      },
      {
        "date": "3 Jan",
        "donHang": 15,
        "doanhSo": 75000.00
      }
    ],
    "salesOverview": [
      {
        "date": "SAT",
        "doanhSo": 100000.00,
        "loiNhuan": 10000.00
      },
      {
        "date": "SUN",
        "doanhSo": 120000.00,
        "loiNhuan": 12000.00
      }
    ],
    "topProducts": [
      {
        "tenSanPham": "Cà phê đen",
        "soLuongBan": 15
      },
      {
        "tenSanPham": "Cà phê sữa",
        "soLuongBan": 12
      }
    ]
  }
}
```

**Status:** ✅ Đã có, đang sử dụng

---

### **2. Revenue Report API**

**Endpoint:** `GET /api/v1/admin/reports/revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Description:** Lấy báo cáo doanh thu trong khoảng thời gian

**Request Parameters:**
- `startDate` (required): Ngày bắt đầu, format: `YYYY-MM-DD`
- `endDate` (required): Ngày kết thúc, format: `YYYY-MM-DD`

**Response:**

```json
{
  "success": true,
  "data": {
    "startDate": "2024-12-31T00:00:00",
    "endDate": "2025-12-06T23:59:59",
    "totalOrders": 150,
    "totalRevenue": 50000000.00,
    "totalDiscount": 500000.00,
    "netRevenue": 49500000.00,
    "totalProfit": 4950000.00,
    "totalCustomers": 80,
    "averageOrderValue": 330000.00,
    "revenueByMonth": [
      {
        "month": "2024-12",
        "revenue": 20000000.00,
        "orders": 60
      },
      {
        "month": "2025-01",
        "revenue": 15000000.00,
        "orders": 45
      },
      {
        "month": "2025-02",
        "revenue": 14500000.00,
        "orders": 45
      }
    ]
  }
}
```

**Status:** ✅ Đã có, đang sử dụng

---

### **3. Top Products Report API**

**Endpoint:** `GET /api/v1/admin/reports/top-products?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=10`

**Description:** Lấy danh sách sản phẩm bán chạy nhất

**Request Parameters:**
- `startDate` (required): Ngày bắt đầu, format: `YYYY-MM-DD`
- `endDate` (required): Ngày kết thúc, format: `YYYY-MM-DD`
- `limit` (optional, default: 10): Số lượng sản phẩm cần lấy

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "sanPhamId": 1,
      "maSanPham": "SP001",
      "tenSanPham": "Cà phê đen",
      "totalQuantitySold": 150,
      "totalRevenue": 3000000.00,
      "rank": 1
    },
    {
      "sanPhamId": 2,
      "maSanPham": "SP002",
      "tenSanPham": "Cà phê sữa",
      "totalQuantitySold": 120,
      "totalRevenue": 2400000.00,
      "rank": 2
    }
  ]
}
```

**Status:** ✅ Đã có, đang sử dụng

---

### **4. Download Reports APIs**

#### **4.1. Download Revenue Report (Excel)**

**Endpoint:** `GET /api/reports/revenue/excel?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Request Parameters:**
- `startDate` (required): Ngày bắt đầu, format: `YYYY-MM-DD`
- `endDate` (required): Ngày kết thúc, format: `YYYY-MM-DD`

**Response:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="BaoCaoDoanhThu_DDMMYYYY_den_DDMMYYYY.xlsx"`
- **Body:** Excel file (binary)

**Status:** ✅ Đã có

**Lưu ý:** Endpoint này **KHÔNG có `/v1`** trong path (`/api/reports/...` chứ không phải `/api/v1/reports/...`)

---

#### **4.2. Download Inventory Report (Excel)**

**Endpoint:** `GET /api/reports/inventory/excel`

**Request Parameters:** Không có (lấy tất cả sản phẩm hiện tại)

**Response:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="BaoCaoTonKho_DDMMYYYY.xlsx"`
- **Body:** Excel file (binary)

**Status:** ✅ Đã có

---

#### **4.3. Download Sales Report (Excel)**

**Endpoint:** `GET /api/reports/sales/excel?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=10`

**Request Parameters:**
- `startDate` (required): Ngày bắt đầu, format: `YYYY-MM-DD`
- `endDate` (required): Ngày kết thúc, format: `YYYY-MM-DD`
- `limit` (optional, default: 10): Số lượng sản phẩm top

**Response:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="BaoCaoBanHang_DDMMYYYY_den_DDMMYYYY.xlsx"`
- **Body:** Excel file (binary)

**Status:** ✅ Đã có

---

## ⚠️ Cần Bổ Sung / Cải Thiện

### **1. Category Breakdown API** (High Priority)

**Mô tả:** Hiện tại Frontend đang tự phân loại sản phẩm dựa trên tên (keyword matching), không chính xác. Cần API trả về breakdown theo category từ backend.

**Endpoint đề xuất:**
```
GET /api/v1/admin/reports/revenue/by-category?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

**Response đề xuất:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "categoryId": 1,
        "categoryName": "Đồ uống",
        "revenue": 20000000.00,
        "percentage": 40.4,
        "orders": 60
      },
      {
        "categoryId": 2,
        "categoryName": "Đồ ăn",
        "revenue": 20000000.00,
        "percentage": 40.4,
        "orders": 55
      },
      {
        "categoryId": 3,
        "categoryName": "Khác",
        "revenue": 9500000.00,
        "percentage": 19.2,
        "orders": 35
      }
    ],
    "totalRevenue": 49500000.00,
    "totalOrders": 150
  }
}
```

**Status:** ➕ Chưa có, cần implement

---

### **2. Period Comparison API** (Medium Priority)

**Mô tả:** So sánh doanh thu kỳ này vs kỳ trước để tính % tăng trưởng chính xác.

**Endpoint đề xuất:**
```
GET /api/v1/admin/reports/revenue/compare?currentStartDate=YYYY-MM-DD&currentEndDate=YYYY-MM-DD&previousStartDate=YYYY-MM-DD&previousEndDate=YYYY-MM-DD
```

**Response đề xuất:**

```json
{
  "success": true,
  "data": {
    "currentPeriod": {
      "startDate": "2025-12-01",
      "endDate": "2025-12-31",
      "totalRevenue": 50000000.00,
      "totalOrders": 150,
      "totalCustomers": 80,
      "totalProfit": 5000000.00
    },
    "previousPeriod": {
      "startDate": "2025-11-01",
      "endDate": "2025-11-30",
      "totalRevenue": 38000000.00,
      "totalOrders": 120,
      "totalCustomers": 65,
      "totalProfit": 3800000.00
    },
    "growth": {
      "revenueGrowth": 31.58,
      "ordersGrowth": 25.0,
      "customersGrowth": 23.08,
      "profitGrowth": 31.58
    }
  }
}
```

**Status:** ➕ Chưa có, có thể thêm sau

---

### **3. Thêm Category vào TopProduct** (Medium Priority)

**Mô tả:** Thêm field `categoryId` và `categoryName` vào `TopProductDTO` để Frontend có thể phân loại sản phẩm chính xác.

**Response đề xuất:**

```json
{
  "success": true,
  "data": [
    {
      "sanPhamId": 1,
      "maSanPham": "SP001",
      "tenSanPham": "Cà phê đen",
      "totalQuantitySold": 150,
      "totalRevenue": 3000000.00,
      "rank": 1,
      "categoryId": 1,
      "categoryName": "Đồ uống"
    }
  ]
}
```

**Status:** ➕ Chưa có, có thể thêm sau

---

## 📊 Field Requirements Chi Tiết

### **Dashboard API Fields**

| Field Path | Type | Required | Description | Status |
|-----------|------|----------|-------------|--------|
| `todayStats.doanhThu` | Number (BigDecimal) | ✅ | Doanh thu hôm nay | ✅ Có |
| `todayStats.doanhThuChange` | Number (BigDecimal) | ✅ | % thay đổi so với hôm qua | ✅ Có |
| `todayStats.tongDon` | Number (Long) | ✅ | Tổng số đơn hôm nay | ✅ Có |
| `todayStats.tongDonChange` | Number (BigDecimal) | ✅ | % thay đổi số đơn | ✅ Có |
| `todayStats.loiNhuan` | Number (BigDecimal) | ✅ | Lợi nhuận hôm nay | ✅ Có |
| `todayStats.loiNhuanChange` | Number (BigDecimal) | ✅ | % thay đổi lợi nhuận | ✅ Có |
| `todayStats.khachHang` | Number (Long) | ✅ | Số khách hàng hôm nay | ✅ Có |
| `todayStats.khachHangChange` | Number (BigDecimal) | ✅ | % thay đổi khách hàng | ✅ Có |
| `orderStatsByDate[].date` | String | ✅ | Ngày, format: "d MMM" (e.g., "2 Jan") | ✅ Có |
| `orderStatsByDate[].donHang` | Number (Long) | ✅ | Số đơn hàng | ✅ Có |
| `orderStatsByDate[].doanhSo` | Number (BigDecimal) | ✅ | Doanh số | ✅ Có |
| `salesOverview[].date` | String | ✅ | Thứ trong tuần, format: "EEE" (e.g., "SAT") | ✅ Có |
| `salesOverview[].doanhSo` | Number (BigDecimal) | ✅ | Doanh số | ✅ Có |
| `salesOverview[].loiNhuan` | Number (BigDecimal) | ✅ | Lợi nhuận | ✅ Có |
| `topProducts[].tenSanPham` | String | ✅ | Tên sản phẩm | ✅ Có |
| `topProducts[].soLuongBan` | Number (Long) | ✅ | Số lượng đã bán | ✅ Có |

---

### **Revenue Report API Fields**

| Field Path | Type | Required | Description | Status |
|-----------|------|----------|-------------|--------|
| `startDate` | String (DateTime) | ✅ | Ngày bắt đầu | ✅ Có |
| `endDate` | String (DateTime) | ✅ | Ngày kết thúc | ✅ Có |
| `totalOrders` | Number (Long) | ✅ | Tổng số đơn hàng | ✅ Có |
| `totalRevenue` | Number (BigDecimal) | ✅ | Tổng doanh thu | ✅ Có |
| `totalDiscount` | Number (BigDecimal) | ✅ | Tổng giảm giá | ✅ Có |
| `netRevenue` | Number (BigDecimal) | ✅ | Doanh thu sau giảm giá | ✅ Có |
| `totalProfit` | Number (BigDecimal) | ✅ | Tổng lợi nhuận (10% của netRevenue) | ✅ Có |
| `totalCustomers` | Number (Long) | ✅ | Tổng số khách hàng | ✅ Có |
| `averageOrderValue` | Number (BigDecimal) | ✅ | Giá trị đơn hàng trung bình | ✅ Có |
| `revenueByMonth[].month` | String | ✅ | Tháng, format: "YYYY-MM" | ✅ Có |
| `revenueByMonth[].revenue` | Number (BigDecimal) | ✅ | Doanh thu trong tháng | ✅ Có |
| `revenueByMonth[].orders` | Number (Long) | ✅ | Số đơn hàng trong tháng | ✅ Có |

---

### **Top Products Report API Fields**

| Field Path | Type | Required | Description | Status |
|-----------|------|----------|-------------|--------|
| `sanPhamId` | Number (Long) | ✅ | ID sản phẩm | ✅ Có |
| `maSanPham` | String | ✅ | Mã sản phẩm | ✅ Có |
| `tenSanPham` | String | ✅ | Tên sản phẩm | ✅ Có |
| `totalQuantitySold` | Number (Long) | ✅ | Tổng số lượng đã bán | ✅ Có |
| `totalRevenue` | Number (BigDecimal) | ✅ | Tổng doanh thu | ✅ Có |
| `rank` | Number (Integer) | ✅ | Hạng sản phẩm (1, 2, 3, ...) | ✅ Có |
| `categoryId` | Number (Long) | ❌ | ID danh mục | ➕ Nên có |
| `categoryName` | String | ❌ | Tên danh mục | ➕ Nên có |

---

## 🎯 Priority

### **High Priority (Cần ngay):**

1. ✅ **Xác nhận Download Reports APIs** - Đã có, endpoint: `/api/reports/*/excel` (KHÔNG có `/v1`)
2. ➕ **Category Breakdown API** - Cần implement để hiển thị chính xác "Tổng quan doanh số" theo category

### **Medium Priority (Có thể làm sau):**

3. ➕ **Period Comparison API** - Để tính `salesGrowth` chính xác từ backend
4. ➕ **Thêm `categoryId`, `categoryName` vào TopProduct** - Để phân loại sản phẩm chính xác

### **Low Priority (Nice to have):**

5. ➕ **Real-time updates via WebSocket** - Thay vì polling mỗi 5 phút

---

## 📝 Notes

1. **Auto-refresh:** Frontend đã implement auto-refresh mỗi 5 phút (300000ms)
2. **Last update time:** Frontend đã hiển thị "Cập nhật lần cuối: HH:MM:SS"
3. **Manual refresh:** Có nút "Làm mới" để refresh thủ công
4. **Tabs:** Đã gộp Dashboard và Reports vào 1 trang với Tabs
5. **Routes:** `/reports` redirect về `/dashboard?tab=reports`
6. **Download APIs:** Các endpoint download Excel **KHÔNG có `/v1`** trong path (`/api/reports/...`)

---

## 🔄 Sales Growth Calculation

**Hiện tại:**
- Frontend đang hardcode `salesGrowth = 32.2%`
- Cần tính toán từ API

**Có 2 options:**

### **Option A: Tính từ RevenueReport (Đề xuất)**
- Frontend tự tính: So sánh `netRevenue` của kỳ này vs kỳ trước
- Formula: `((current - previous) / previous) * 100`
- Không cần thay đổi API

### **Option B: API trả về sẵn**
- Sử dụng Period Comparison API (nếu implement)
- Backend tính sẵn và trả về trong `growth.revenueGrowth`

**Đề xuất:** Option A - Frontend tự tính (không cần thay đổi API ngay)

---

**Ngày tạo:** 2025-12-07  
**Version:** 1.0  
**Status:** ✅ Đã implement, ⚠️ Cần xác nhận API, ➕ Cần bổ sung

