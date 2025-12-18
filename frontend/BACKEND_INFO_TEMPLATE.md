# 📋 Backend Information Template - Điền thông tin từ Backend

Vui lòng điền thông tin sau từ Backend và gửi lại:

---

## 1. API Endpoint: `/pos/invoices/pending`

### Request Format
```
GET /api/v1/pos/invoices/pending?chiNhanhId={chiNhanhId}
Headers: Authorization: Bearer {token}
```

### Response Format hiện tại
```json
{
  "data": [
    {
      "id": ?,
      "maHoaDon": ?,
      "trangThai": ?,  // ← Status field name và values
      "ghiChu": ?,
      ...
    }
  ],
  "meta": {...}
}
```

**Vui lòng điền:**
- [ ] Status field name: `_____________` (ví dụ: `trangThai`, `status`, `invoiceStatus`)
- [ ] Status values: `_____________` (ví dụ: `PENDING`, `COMPLETED`, `CANCELLED`, `REFUNDED`)
- [ ] Response structure: `_____________` (ví dụ: `{ data: [...], meta: {...} }`)

---

## 2. Database Schema

### Invoice Table
- [ ] Table name: `_____________` (ví dụ: `invoices`, `hoa_don`, `invoice`)
- [ ] Status column name: `_____________` (ví dụ: `trang_thai`, `status`, `invoice_status`)
- [ ] Status column type: `_____________` (ví dụ: `VARCHAR`, `ENUM`, `INT`)
- [ ] Possible values: `_____________` (ví dụ: `'PENDING'`, `'COMPLETED'`, `'CANCELLED'`, `'REFUNDED'`)

---

## 3. Current Implementation

### Code/Logic hiện tại
```java
// Vui lòng paste code của endpoint /pos/invoices/pending
// Hoặc mô tả logic hiện tại

```

### Filter Logic
- [ ] Có filter theo status không? `_____________` (Có / Không)
- [ ] Nếu có, filter như thế nào? `_____________`

### Query/SQL hiện tại
```sql
-- Vui lòng paste SQL query hiện tại
-- Hoặc mô tả query logic

```

---

## 4. Test Results

### Test Case 1: Invoice PENDING
- [ ] Tạo invoice với status = PENDING
- [ ] Gọi API: `GET /pos/invoices/pending?chiNhanhId=1`
- [ ] Kết quả: Invoice này **CÓ** trong response? `_____________` (Có / Không)
- [ ] Response: `_____________` (paste response JSON)

### Test Case 2: Invoice COMPLETED
- [ ] Tạo invoice với status = PENDING
- [ ] Complete invoice (status → COMPLETED)
- [ ] Gọi API: `GET /pos/invoices/pending?chiNhanhId=1`
- [ ] Kết quả: Invoice này **KHÔNG** có trong response? `_____________` (Có / Không)
- [ ] Response: `_____________` (paste response JSON)

### Test Case 3: Invoice CANCELLED
- [ ] Tạo invoice với status = PENDING
- [ ] Delete invoice (status → CANCELLED)
- [ ] Gọi API: `GET /pos/invoices/pending?chiNhanhId=1`
- [ ] Kết quả: Invoice này **KHÔNG** có trong response? `_____________` (Có / Không)
- [ ] Response: `_____________` (paste response JSON)

---

## 5. Sample Response

Vui lòng cung cấp **sample response** từ API:

```json
{
  "data": [
    {
      "id": 55,
      "maHoaDon": "HD20251212171005",
      "trangThai": "PENDING",  // ← Status value
      "ghiChu": "Bàn: 1 | Loại: Dine-in [TREO BILL]",
      "tongTien": 64999,
      "thanhTien": 64999,
      "ngayTao": "2025-12-12T17:10:05",
      ...
    }
  ],
  "meta": {
    "total": 1,
    "page": 0,
    "size": 10
  }
}
```

**Vui lòng paste response thực tế từ backend:**

```json
// Paste response ở đây
```

---

## 6. Issues Found

Nếu backend phát hiện vấn đề, vui lòng mô tả:

- [ ] Vấn đề 1: `_____________`
- [ ] Vấn đề 2: `_____________`
- [ ] Vấn đề 3: `_____________`

---

## 7. Fix Applied (nếu có)

Nếu backend đã sửa, vui lòng mô tả:

- [ ] Fix 1: `_____________`
- [ ] Fix 2: `_____________`
- [ ] Fix 3: `_____________`

---

## 8. Additional Information

Bất kỳ thông tin bổ sung nào:

```
// Paste thông tin bổ sung ở đây
```

---

## 📝 Notes

- Vui lòng điền đầy đủ thông tin
- Nếu không chắc, vui lòng ghi rõ "Không rõ" hoặc "Cần kiểm tra"
- Có thể thêm screenshots hoặc logs nếu cần

