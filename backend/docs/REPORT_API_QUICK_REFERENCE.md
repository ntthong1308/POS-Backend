# 📌 API Báo Cáo - Quick Reference

> Bảng tóm tắt nhanh các field trong response để Frontend tra cứu

---

## 🎯 API 1: Báo Cáo Doanh Thu

**Endpoint:** `GET /api/v1/admin/reports/revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

### Response Fields

```typescript
{
  success: boolean;
  data: {
    // ⭐ CÁC FIELD CHÍNH ĐỂ HIỂN THỊ
    netRevenue: number;        // Doanh thu thực tế → "Tổng quan doanh số"
    totalProfit: number;       // Lợi nhuận → "Tổng quan doanh số"
    totalOrders: number;       // Tổng đơn hàng → "Tổng quan doanh số"
    totalCustomers: number;    // Tổng khách hàng → "Tổng quan doanh số"
    
    // ⭐ BIỂU ĐỒ "Doanh thu theo tháng"
    revenueByMonth: Array<{
      month: string;           // "2025-01" → X-axis
      revenue: number;         // 15000000.00 → Y-axis
      orders: number;          // 45
    }>;
    
    // Các field khác (không cần thiết cho giao diện)
    startDate: string;
    endDate: string;
    totalRevenue: number;
    totalDiscount: number;
    averageOrderValue: number;
  };
}
```

### 📊 Mapping Với Giao Diện

| Giao Diện | Field Path | Type |
|-----------|-----------|------|
| **"Tổng quan doanh số" - Số tiền lớn** | `data.netRevenue` | Number |
| **"Tổng quan doanh số" - % thay đổi** | Tính toán từ `netRevenue` | Number |
| **Biểu đồ "Doanh thu theo tháng" - X-axis** | `data.revenueByMonth[].month` | String ("YYYY-MM") |
| **Biểu đồ "Doanh thu theo tháng" - Y-axis** | `data.revenueByMonth[].revenue` | Number |

---

## 🎯 API 2: Sản Phẩm Bán Chạy

**Endpoint:** `GET /api/v1/admin/reports/top-products?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=10`

### Response Fields

```typescript
{
  success: boolean;
  data: Array<{
    rank: number;                  // ⭐ Hạng (1, 2, 3, ...) → Cột "Hạng"
    tenSanPham: string;            // ⭐ Tên sản phẩm → Cột "Tên sản phẩm"
    totalQuantitySold: number;     // ⭐ Số lượng bán → Cột "Số lượng bán"
    totalRevenue: number;          // ⭐ Doanh thu → Cột "Doanh thu"
    
    // Các field khác (có thể dùng hoặc không)
    sanPhamId: number;
    maSanPham: string;
  }>;
}
```

### 📊 Mapping Với Bảng "Sản phẩm bán chạy"

| Cột trong Bảng | Field Path | Type | Ví dụ |
|----------------|-----------|------|-------|
| **Hạng** | `data[].rank` | Number | 1, 2, 3 |
| **Tên sản phẩm** | `data[].tenSanPham` | String | "Cà phê đen" |
| **Số lượng bán** | `data[].totalQuantitySold` | Number | 150 |
| **Doanh thu** | `data[].totalRevenue` | Number | 3000000.00 |

---

## 📝 Code Mẫu Nhanh

### 1. Lấy Revenue Report

```typescript
const res = await fetch(
  `/api/v1/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const { data } = await res.json();

// Sử dụng
const totalRevenue = data.netRevenue;      // Tổng doanh thu
const totalProfit = data.totalProfit;      // Tổng lợi nhuận
const chartData = data.revenueByMonth;     // Dữ liệu biểu đồ
```

### 2. Lấy Top Products

```typescript
const res = await fetch(
  `/api/v1/admin/reports/top-products?startDate=${startDate}&endDate=${endDate}&limit=10`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const { data } = await res.json();

// Sử dụng
data.forEach(product => {
  product.rank;                  // Hạng
  product.tenSanPham;            // Tên
  product.totalQuantitySold;     // Số lượng
  product.totalRevenue;          // Doanh thu
});
```

---

## ⚠️ Lưu Ý

1. ✅ Tất cả số tiền là `number` (BigDecimal/Long trong Java → number trong JS)
2. ✅ `month` format: `"YYYY-MM"` (ví dụ: `"2025-01"`)
3. ✅ `rank` bắt đầu từ 1, không phải 0
4. ✅ Response luôn wrap trong `ApiResponse<T>` → dùng `data.data` hoặc `data.data[]`

---

**File chi tiết:** Xem `docs/REPORT_API_FIELDS.md`

