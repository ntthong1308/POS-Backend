# 📥 TỔNG HỢP CÁC CHỨC NĂNG DOWNLOAD EXCEL VÀ PDF

**Ngày:** 2025-12-12  
**Mục đích:** Liệt kê tất cả các chức năng download Excel và PDF trong ứng dụng

---

## 📊 EXCEL DOWNLOADS (6 chức năng)

### **1. Báo cáo doanh thu (Revenue Report)**
- **Vị trí:** Dashboard Page → Tab "Hôm nay" → Nút "Báo cáo doanh thu"
- **API:** `GET /api/v1/reports/revenue/excel`
- **File:** `src/lib/api/reports.ts` → `downloadRevenueReport()`
- **Component:** `src/pages/dashboard/DashboardPage.tsx`
- **Trạng thái:** ✅ Đang sử dụng
- **Ghi chú:** Mới thêm vào tab Dashboard

---

### **2. Báo cáo tồn kho (Inventory Report)** ⚠️
- **Vị trí:** ~~Dashboard Page → Tab "Báo cáo"~~ (Đã xóa UI)
- **API:** `GET /api/v1/reports/inventory/excel`
- **File:** `src/lib/api/reports.ts` → `downloadInventoryReport()`
- **Component:** `src/pages/dashboard/DashboardPage.tsx`
- **Trạng thái:** ⚠️ Code còn nhưng UI đã xóa
- **Ghi chú:** Đã xóa nút trong UI nhưng function vẫn còn trong code

---

### **3. Báo cáo bán hàng (Sales Report)** ⚠️
- **Vị trí:** ~~Dashboard Page → Tab "Báo cáo"~~ (Đã xóa UI)
- **API:** `GET /api/v1/reports/sales/excel`
- **File:** `src/lib/api/reports.ts` → `downloadSalesReport()`
- **Component:** `src/pages/dashboard/DashboardPage.tsx`
- **Trạng thái:** ⚠️ Code còn nhưng UI đã xóa
- **Ghi chú:** Đã xóa nút trong UI nhưng function vẫn còn trong code

---

### **4. Xuất Excel tồn kho nguyên liệu**
- **Vị trí:** Inventory Page → Tab "Tồn kho" → Nút "Xuất Excel"
- **API:** `GET /api/v1/admin/nguyen-lieu/ton-kho/excel`
- **File:** `src/lib/api/rawMaterials.ts` → `exportTonKhoExcel()`
- **Component:** `src/pages/inventory/InventoryPage.tsx` → `handleExportTonKhoExcel()`
- **Trạng thái:** ✅ Đang sử dụng
- **File name:** `DanhSachNguyenLieuTonKho_YYYY-MM-DD.xlsx`

---

### **5. Xuất Excel nhập kho**
- **Vị trí:** Inventory Page → Tab "Nhập kho" → Nút "Xuất Excel"
- **API:** `GET /api/v1/admin/nguyen-lieu/nhap-kho/excel`
- **File:** `src/lib/api/rawMaterials.ts` → `exportNhapKhoExcel()`
- **Component:** `src/pages/inventory/InventoryPage.tsx` → `handleExportNhapKhoExcel()`
- **Trạng thái:** ✅ Đang sử dụng
- **File name:** `BangNhapKho_YYYY-MM-DD.xlsx`

---

### **6. Xuất Excel xuất kho**
- **Vị trí:** Inventory Page → Tab "Xuất kho" → Nút "Xuất Excel"
- **API:** `GET /api/v1/admin/nguyen-lieu/xuat-kho/excel`
- **File:** `src/lib/api/rawMaterials.ts` → `exportXuatKhoExcel()`
- **Component:** `src/pages/inventory/InventoryPage.tsx` → `handleExportXuatKhoExcel()`
- **Trạng thái:** ✅ Đang sử dụng
- **File name:** `BangXuatKho_YYYY-MM-DD.xlsx`

---

## 📄 PDF DOWNLOADS (1 chức năng)

### **1. In hóa đơn PDF**
- **Vị trí 1:** Invoices Page → Danh sách hóa đơn → Icon Download
- **Vị trí 2:** Invoice Detail Page → Nút "Xuất PDF"
- **API:** `GET /api/v1/invoices/{id}/print`
- **File:** `src/lib/api/invoices.ts` → `print()`
- **Components:** 
  - `src/pages/invoices/InvoicesPage.tsx` → `handleDownloadPDF()`
  - `src/pages/invoices/InvoiceDetailPage.tsx` → `handleExportPDF()`
- **Trạng thái:** ✅ Đang sử dụng
- **File name:** `invoice-{invoiceId}.pdf` hoặc `invoice-{maHoaDon}.pdf`
- **Fallback:** Nếu backend fail, InvoiceDetailPage sẽ mở `window.print()` dialog

---

## 📋 TỔNG KẾT

| Loại | Số lượng | Trạng thái |
|------|----------|------------|
| **Excel** | 6 | 4 đang dùng, 2 đã xóa UI |
| **PDF** | 1 | 1 đang dùng |
| **Tổng cộng** | **7** | **5 đang dùng, 2 đã xóa UI** |

---

## 🔍 CHI TIẾT CÁC API ENDPOINTS

### **Excel APIs:**
```http
# Báo cáo
GET /api/v1/reports/revenue/excel?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
GET /api/v1/reports/inventory/excel?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
GET /api/v1/reports/sales/excel?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD

# Nguyên liệu
GET /api/v1/admin/nguyen-lieu/ton-kho/excel
GET /api/v1/admin/nguyen-lieu/nhap-kho/excel
GET /api/v1/admin/nguyen-lieu/xuat-kho/excel
```

### **PDF APIs:**
```http
GET /api/v1/invoices/{id}/print
```

---

## ⚠️ LƯU Ý

1. **Báo cáo tồn kho và bán hàng:**
   - UI đã bị xóa nhưng code vẫn còn
   - Có thể xóa code nếu không cần dùng nữa

2. **Báo cáo doanh thu:**
   - Mới thêm vào tab Dashboard
   - Cần implement backend theo tài liệu `DASHBOARD_REVENUE_REPORT_FIELDS.md`

3. **In hóa đơn PDF:**
   - Có fallback mechanism (window.print) nếu backend fail
   - Chỉ trong InvoiceDetailPage

---

## 📁 CÁC FILE LIÊN QUAN

### **API Files:**
- `src/lib/api/reports.ts` - Báo cáo Excel
- `src/lib/api/invoices.ts` - In hóa đơn PDF
- `src/lib/api/rawMaterials.ts` - Xuất Excel nguyên liệu

### **Component Files:**
- `src/pages/dashboard/DashboardPage.tsx` - Báo cáo doanh thu
- `src/pages/inventory/InventoryPage.tsx` - Xuất Excel nguyên liệu
- `src/pages/invoices/InvoicesPage.tsx` - Download PDF từ danh sách
- `src/pages/invoices/InvoiceDetailPage.tsx` - Xuất PDF chi tiết

---

**Cập nhật lần cuối:** 2025-12-12

