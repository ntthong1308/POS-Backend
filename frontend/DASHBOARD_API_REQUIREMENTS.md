# 📋 API & Field Requirements cho Dashboard (Gộp Reports)

## ✅ Đã Implement

### **1. Dashboard API** (`GET /api/v1/admin/dashboard?date=YYYY-MM-DD`)

**Response hiện tại:**
```json
{
  "success": true,
  "data": {
    "todayStats": {
      "doanhThu": 898996,
      "doanhThuChange": 32.2,
      "tongDon": 150,
      "tongDonChange": 15.5,
      "loiNhuan": 89900,
      "loiNhuanChange": 28.1,
      "khachHang": 80,
      "khachHangChange": 8.3
    },
    "orderStatsByDate": [
      {
        "date": "2 Jan",
        "donHang": 10,
        "doanhSo": 50000
      }
    ],
    "salesOverview": [
      {
        "date": "SAT",
        "doanhSo": 100000,
        "loiNhuan": 10000
      }
    ],
    "topProducts": [
      {
        "tenSanPham": "Cà phê đen",
        "soLuongBan": 15
      }
    ]
  }
}
```

**Status:** ✅ Đã có, đang sử dụng

---

### **2. Reports API - Revenue** (`GET /api/v1/admin/reports/revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`)

**Response hiện tại:**
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
      }
    ]
  }
}
```

**Status:** ✅ Đã có, đang sử dụng

---

### **3. Reports API - Top Products** (`GET /api/v1/admin/reports/top-products?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=10`)

**Response hiện tại:**
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
    }
  ]
}
```

**Status:** ✅ Đã có, đang sử dụng

---

## ⚠️ Cần Bổ Sung / Cải Thiện

### **1. Download Reports APIs**

**Hiện tại đang dùng:**
- `GET /api/reports/revenue/excel?fromDate=...&toDate=...`
- `GET /api/reports/inventory/excel?fromDate=...&toDate=...`
- `GET /api/reports/sales/excel?fromDate=...&toDate=...`

**Cần xác nhận:**
- ✅ Endpoint có đúng không? (có `/v1` không?)
- ✅ Response format: Excel file (blob)
- ✅ Headers: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- ✅ Content-Disposition: `attachment; filename="..."`

**Status:** ⚠️ Cần kiểm tra lại endpoint

---

### **2. Sales Growth Calculation**

**Hiện tại:**
- Frontend đang hardcode `salesGrowth = 32.2%`
- Cần tính toán từ API

**Cần bổ sung:**
- So sánh kỳ này vs kỳ trước
- Tính % tăng trưởng

**Có 2 options:**

#### **Option A: Tính từ RevenueReport**
- So sánh `netRevenue` của kỳ này vs kỳ trước
- Frontend tự tính: `((current - previous) / previous) * 100`

#### **Option B: API trả về sẵn**
- Thêm field `growthPercentage` vào `RevenueReport`
- Backend tính sẵn và trả về

**Đề xuất:** Option A (Frontend tự tính) - Không cần thay đổi API

---

### **3. Category Breakdown**

**Hiện tại:**
- Frontend đang tự phân loại sản phẩm dựa trên tên (keyword matching)
- Không chính xác 100%

**Cần bổ sung:**
- API trả về breakdown theo category từ backend
- Hoặc thêm field `category` vào `TopProduct`

**Có 2 options:**

#### **Option A: API mới - Category Breakdown**
```
GET /api/v1/admin/reports/revenue/by-category?startDate=...&endDate=...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "categoryId": 1,
        "categoryName": "Đồ uống",
        "revenue": 20000000.00,
        "percentage": 40.4
      },
      {
        "categoryId": 2,
        "categoryName": "Đồ ăn",
        "revenue": 20000000.00,
        "percentage": 40.4
      },
      {
        "categoryId": 3,
        "categoryName": "Khác",
        "revenue": 9500000.00,
        "percentage": 19.2
      }
    ],
    "totalRevenue": 49500000.00
  }
}
```

#### **Option B: Thêm category vào TopProduct**
- Thêm field `categoryId`, `categoryName` vào `TopProduct`
- Frontend group theo category

**Đề xuất:** Option A - API riêng cho category breakdown

---

### **4. Period Comparison (So sánh kỳ)**

**Hiện tại:**
- Chưa có chức năng so sánh kỳ này vs kỳ trước

**Cần bổ sung:**
- API so sánh 2 kỳ

**API đề xuất:**
```
GET /api/v1/admin/reports/revenue/compare?currentStartDate=...&currentEndDate=...&previousStartDate=...&previousEndDate=...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPeriod": {
      "startDate": "2025-12-01",
      "endDate": "2025-12-31",
      "totalRevenue": 50000000.00,
      "totalOrders": 150,
      "totalCustomers": 80
    },
    "previousPeriod": {
      "startDate": "2025-11-01",
      "endDate": "2025-11-30",
      "totalRevenue": 38000000.00,
      "totalOrders": 120,
      "totalCustomers": 65
    },
    "growth": {
      "revenueGrowth": 31.58,
      "ordersGrowth": 25.0,
      "customersGrowth": 23.08
    }
  }
}
```

**Status:** ➕ Có thể thêm sau (không bắt buộc ngay)

---

## 📊 Tóm Tắt Field Requirements

### **Dashboard API** (`/admin/dashboard`)

| Field | Type | Required | Status |
|-------|------|----------|--------|
| `todayStats.doanhThu` | Number | ✅ | ✅ Có |
| `todayStats.doanhThuChange` | Number | ✅ | ✅ Có |
| `todayStats.tongDon` | Number | ✅ | ✅ Có |
| `todayStats.tongDonChange` | Number | ✅ | ✅ Có |
| `todayStats.loiNhuan` | Number | ✅ | ✅ Có |
| `todayStats.loiNhuanChange` | Number | ✅ | ✅ Có |
| `todayStats.khachHang` | Number | ✅ | ✅ Có |
| `todayStats.khachHangChange` | Number | ✅ | ✅ Có |
| `orderStatsByDate[].date` | String | ✅ | ✅ Có |
| `orderStatsByDate[].donHang` | Number | ✅ | ✅ Có |
| `orderStatsByDate[].doanhSo` | Number | ✅ | ✅ Có |
| `salesOverview[].date` | String | ✅ | ✅ Có |
| `salesOverview[].doanhSo` | Number | ✅ | ✅ Có |
| `salesOverview[].loiNhuan` | Number | ✅ | ✅ Có |
| `topProducts[].tenSanPham` | String | ✅ | ✅ Có |
| `topProducts[].soLuongBan` | Number | ✅ | ✅ Có |

---

### **Revenue Report API** (`/admin/reports/revenue`)

| Field | Type | Required | Status |
|-------|------|----------|--------|
| `totalOrders` | Number | ✅ | ✅ Có |
| `totalRevenue` | Number | ✅ | ✅ Có |
| `totalDiscount` | Number | ✅ | ✅ Có |
| `netRevenue` | Number | ✅ | ✅ Có |
| `totalProfit` | Number | ✅ | ✅ Có |
| `totalCustomers` | Number | ✅ | ✅ Có |
| `averageOrderValue` | Number | ✅ | ✅ Có |
| `revenueByMonth[].month` | String | ✅ | ✅ Có |
| `revenueByMonth[].revenue` | Number | ✅ | ✅ Có |
| `revenueByMonth[].orders` | Number | ✅ | ✅ Có |

---

### **Top Products API** (`/admin/reports/top-products`)

| Field | Type | Required | Status |
|-------|------|----------|--------|
| `sanPhamId` | Number | ✅ | ✅ Có |
| `maSanPham` | String | ✅ | ✅ Có |
| `tenSanPham` | String | ✅ | ✅ Có |
| `totalQuantitySold` | Number | ✅ | ✅ Có |
| `totalRevenue` | Number | ✅ | ✅ Có |
| `rank` | Number | ✅ | ✅ Có |
| `categoryId` | Number | ❌ | ➕ Nên có |
| `categoryName` | String | ❌ | ➕ Nên có |

---

## 🎯 Priority

### **High Priority (Cần ngay):**
1. ✅ **Xác nhận Download Reports APIs** - Endpoint có đúng không?
2. ➕ **Category Breakdown API** - Để hiển thị chính xác "Tổng quan doanh số" theo category

### **Medium Priority (Có thể làm sau):**
3. ➕ **Period Comparison API** - Để tính `salesGrowth` chính xác
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

---

**Ngày tạo:** 2025-12-07  
**Version:** 1.0  
**Status:** ✅ Đã implement, ⚠️ Cần xác nhận API, ➕ Cần bổ sung

