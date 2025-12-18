# 📋 Tài Liệu API Báo Cáo - Các Field Chính Xác

> Tài liệu này liệt kê **chính xác** các field trong response của các API báo cáo để Frontend có thể nối API đúng.

---

## 🔌 API 1: Báo Cáo Doanh Thu

### Endpoint
```
GET /api/v1/admin/reports/revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Response Structure

```json
{
  "success": true,
  "message": null,
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

### 📋 Chi Tiết Các Field

| Field Name | Type | Mô Tả | Sử Dụng Cho |
|-----------|------|-------|-------------|
| `startDate` | `LocalDateTime` (String) | Ngày bắt đầu | Info |
| `endDate` | `LocalDateTime` (String) | Ngày kết thúc | Info |
| `totalOrders` | `Long` (Number) | **Tổng số đơn hàng** | Tổng quan doanh số |
| `totalRevenue` | `BigDecimal` (Number) | Tổng doanh thu (trước giảm giá) | - |
| `totalDiscount` | `BigDecimal` (Number) | Tổng giảm giá | - |
| `netRevenue` | `BigDecimal` (Number) | **Doanh thu thực tế** (sau giảm giá) | Tổng quan doanh số |
| `totalProfit` | `BigDecimal` (Number) | **Lợi nhuận** (10% của netRevenue) | Tổng quan doanh số |
| `totalCustomers` | `Long` (Number) | **Tổng số khách hàng** | Tổng quan doanh số |
| `averageOrderValue` | `BigDecimal` (Number) | Giá trị đơn hàng trung bình | - |
| `revenueByMonth` | `Array<RevenueByMonthDTO>` | **Doanh thu theo tháng** | Biểu đồ "Doanh thu theo tháng" |

### 📊 RevenueByMonthDTO Fields

| Field Name | Type | Mô Tả | Format |
|-----------|------|-------|--------|
| `month` | `String` | **Tháng** | `"YYYY-MM"` (ví dụ: `"2025-01"`) |
| `revenue` | `BigDecimal` (Number) | **Doanh thu trong tháng** | Số tiền (VND) |
| `orders` | `Long` (Number) | Số đơn hàng trong tháng | Số nguyên |

### 💻 TypeScript Interface

```typescript
interface RevenueReportResponse {
  success: boolean;
  message: string | null;
  data: {
    startDate: string;           // "2024-12-31T00:00:00"
    endDate: string;             // "2025-12-06T23:59:59"
    totalOrders: number;         // 150
    totalRevenue: number;        // 50000000.00
    totalDiscount: number;       // 500000.00
    netRevenue: number;          // 49500000.00 - Doanh thu thực tế
    totalProfit: number;         // 4950000.00 - Lợi nhuận
    totalCustomers: number;      // 80
    averageOrderValue: number;   // 330000.00
    revenueByMonth: Array<{
      month: string;             // "2025-01"
      revenue: number;           // 15000000.00
      orders: number;            // 45
    }>;
  };
}
```

### 🎯 Cách Sử Dụng

```typescript
// Gọi API
const response = await fetch(
  `/api/v1/admin/reports/revenue?startDate=2024-12-31&endDate=2025-12-06`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const data: RevenueReportResponse = await response.json();

// Sử dụng các field
const report = data.data;

// Tổng quan doanh số
console.log('Tổng doanh thu:', report.netRevenue);
console.log('Tổng lợi nhuận:', report.totalProfit);
console.log('Tổng đơn hàng:', report.totalOrders);
console.log('Tổng khách hàng:', report.totalCustomers);

// Biểu đồ doanh thu theo tháng
report.revenueByMonth.forEach(month => {
  console.log(`${month.month}: ${month.revenue} VND`);
  // month.month = "2025-01"
  // month.revenue = 15000000.00
  // month.orders = 45
});
```

---

## 🔌 API 2: Sản Phẩm Bán Chạy

### Endpoint
```
GET /api/v1/admin/reports/top-products?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=10
```

### Response Structure

```json
{
  "success": true,
  "message": null,
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

### 📋 Chi Tiết Các Field

| Field Name | Type | Mô Tả | Sử Dụng Cho |
|-----------|------|-------|-------------|
| `sanPhamId` | `Long` (Number) | **ID sản phẩm** | - |
| `maSanPham` | `String` | **Mã sản phẩm** | Bảng "Sản phẩm bán chạy" |
| `tenSanPham` | `String` | **Tên sản phẩm** | Bảng "Sản phẩm bán chạy" |
| `totalQuantitySold` | `Long` (Number) | **Số lượng bán** | Bảng "Sản phẩm bán chạy" - Cột "Số lượng bán" |
| `totalRevenue` | `BigDecimal` (Number) | **Doanh thu** | Bảng "Sản phẩm bán chạy" - Cột "Doanh thu" |
| `rank` | `Integer` (Number) | **Hạng sản phẩm** | Bảng "Sản phẩm bán chạy" - Cột "Hạng" |

### 💻 TypeScript Interface

```typescript
interface TopProduct {
  sanPhamId: number;           // 1 - ID sản phẩm
  maSanPham: string;           // "SP001" - Mã sản phẩm
  tenSanPham: string;          // "Cà phê đen" - Tên sản phẩm
  totalQuantitySold: number;   // 150 - Số lượng bán (soLuongBan)
  totalRevenue: number;        // 3000000.00 - Doanh thu (doanhThu)
  rank: number;                // 1 - Hạng (1, 2, 3, ...)
}

interface TopProductsResponse {
  success: boolean;
  message: string | null;
  data: TopProduct[];
}
```

### 🎯 Cách Sử Dụng

```typescript
// Gọi API
const response = await fetch(
  `/api/v1/admin/reports/top-products?startDate=2024-12-31&endDate=2025-12-06&limit=10`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const data: TopProductsResponse = await response.json();

// Hiển thị bảng "Sản phẩm bán chạy"
data.data.forEach(product => {
  console.log(`
    Hạng: ${product.rank}
    Tên sản phẩm: ${product.tenSanPham}
    Mã sản phẩm: ${product.maSanPham}
    Số lượng bán: ${product.totalQuantitySold}
    Doanh thu: ${product.totalRevenue}
  `);
});
```

### 📊 Mapping Field Names

| Field trong Response | Tên hiển thị trong FE | Ví dụ |
|---------------------|----------------------|-------|
| `rank` | `Hạng` | 1, 2, 3, ... |
| `tenSanPham` | `Tên sản phẩm` | "Cà phê đen" |
| `totalQuantitySold` | `Số lượng bán` | 150 |
| `totalRevenue` | `Doanh thu` | 3000000.00 |

---

## 📝 Tóm Tắt Field Mapping

### API Revenue Report → Giao Diện

| Giao Diện | Field trong API | Type |
|-----------|----------------|------|
| **Tổng quan doanh số:** | | |
| - Tổng doanh thu | `data.netRevenue` | Number |
| - Tổng lợi nhuận | `data.totalProfit` | Number |
| - Tổng đơn hàng | `data.totalOrders` | Number |
| - Tổng khách hàng | `data.totalCustomers` | Number |
| **Biểu đồ "Doanh thu theo tháng":** | | |
| - X-axis (Tháng) | `data.revenueByMonth[].month` | String ("YYYY-MM") |
| - Y-axis (Doanh thu) | `data.revenueByMonth[].revenue` | Number |

### API Top Products → Bảng "Sản phẩm bán chạy"

| Cột trong Bảng | Field trong API | Type |
|----------------|----------------|------|
| **Hạng** | `data[].rank` | Number (1, 2, 3, ...) |
| **Tên sản phẩm** | `data[].tenSanPham` | String |
| **Số lượng bán** | `data[].totalQuantitySold` | Number |
| **Doanh thu** | `data[].totalRevenue` | Number |

---

## ⚠️ Lưu Ý Quan Trọng

1. **Field Names**: Sử dụng **chính xác** tên field như trong response (camelCase)
2. **Data Types**: 
   - `Long` → `number` trong TypeScript/JavaScript
   - `BigDecimal` → `number` trong TypeScript/JavaScript
   - `String` → `string`
3. **Month Format**: `revenueByMonth[].month` có format `"YYYY-MM"` (ví dụ: `"2025-01"`)
4. **Rank**: Bắt đầu từ 1, không phải 0

---

## 🔗 Ví Dụ Hoàn Chỉnh

### 1. Gọi API Revenue Report

```typescript
async function getRevenueReport(startDate: string, endDate: string) {
  const response = await fetch(
    `/api/v1/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const result = await response.json();
  return result.data;
}

// Sử dụng
const report = await getRevenueReport('2024-12-31', '2025-12-06');

// Hiển thị tổng quan
console.log('Tổng doanh thu:', report.netRevenue);
console.log('Tổng lợi nhuận:', report.totalProfit);

// Vẽ biểu đồ
const chartData = report.revenueByMonth.map(month => ({
  month: month.month,        // "2025-01"
  revenue: month.revenue,    // 15000000.00
  orders: month.orders       // 45
}));
```

### 2. Gọi API Top Products

```typescript
async function getTopProducts(startDate: string, endDate: string, limit: number = 10) {
  const response = await fetch(
    `/api/v1/admin/reports/top-products?startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const result = await response.json();
  return result.data;
}

// Sử dụng
const products = await getTopProducts('2024-12-31', '2025-12-06', 10);

// Hiển thị bảng
products.forEach(product => {
  console.log(`
    ${product.rank}. ${product.tenSanPham}
    Số lượng: ${product.totalQuantitySold}
    Doanh thu: ${product.totalRevenue} VND
  `);
});
```

---

**Ngày tạo:** 2025-12-07  
**Version:** 1.0  
**Trạng thái:** ✅ Sẵn sàng cho Frontend

