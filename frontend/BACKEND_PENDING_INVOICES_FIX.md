# 🔧 Backend Pending Invoices Fix - Yêu cầu

## ❌ Vấn đề hiện tại

Sau khi VNPay thanh toán thành công và invoice được complete (status: PENDING → COMPLETED), invoice vẫn hiển thị "Đang treo" trên bàn khi đăng nhập lại.

**Nguyên nhân có thể:**
- Backend API `/pos/invoices/pending` vẫn trả về invoices đã COMPLETED
- Backend không filter đúng status PENDING
- Có nhiều invoices cho cùng một bàn (một PENDING, một COMPLETED)

---

## 📋 Yêu cầu Backend

### 1. API Endpoint: `GET /api/v1/pos/invoices/pending`

**Request:**
```
GET /api/v1/pos/invoices/pending?chiNhanhId={chiNhanhId}
```

**Response hiện tại (cần kiểm tra):**
```json
{
  "data": [
    {
      "id": 55,
      "maHoaDon": "HD20251212171005",
      "trangThai": "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED",
      "ghiChu": "Bàn: 1 | Loại: Dine-in [TREO BILL]",
      ...
    }
  ],
  "meta": {...}
}
```

**Yêu cầu:**
- ✅ **CHỈ trả về invoices có `trangThai = "PENDING"`**
- ❌ **KHÔNG trả về invoices có `trangThai = "COMPLETED"`**
- ❌ **KHÔNG trả về invoices có `trangThai = "CANCELLED"`**
- ❌ **KHÔNG trả về invoices có `trangThai = "REFUNDED"`**

### 2. Status Values

Backend cần đảm bảo các status values:
- `PENDING` - Hóa đơn đang treo (chưa thanh toán)
- `COMPLETED` - Hóa đơn đã hoàn thành (đã thanh toán)
- `CANCELLED` - Hóa đơn đã hủy
- `REFUNDED` - Hóa đơn đã hoàn tiền

### 3. Filter Logic

Backend cần filter ở database level:
```sql
-- Ví dụ (tùy backend framework)
SELECT * FROM invoices 
WHERE chiNhanhId = ? 
  AND trangThai = 'PENDING'
ORDER BY ngayTao DESC;
```

**KHÔNG nên:**
```sql
-- ❌ SAI - Trả về tất cả invoices
SELECT * FROM invoices WHERE chiNhanhId = ?;
```

---

## 🔍 Thông tin cần Backend cung cấp

### 1. API Response Format

Vui lòng cung cấp:
- **Response structure** của `/pos/invoices/pending`
- **Status field name** (có phải là `trangThai` không?)
- **Status values** (có phải là `PENDING`, `COMPLETED`, `CANCELLED`, `REFUNDED` không?)

### 2. Database Schema

Vui lòng cung cấp:
- **Table name** chứa invoices
- **Status column name** và **data type**
- **Possible values** của status column

### 3. Current Implementation

Vui lòng cung cấp:
- **Code/Logic** hiện tại của endpoint `/pos/invoices/pending`
- **Filter logic** (nếu có)
- **Query/SQL** đang sử dụng

### 4. Test Cases

Vui lòng test và cung cấp kết quả:

**Test Case 1: Invoice PENDING**
```
1. Tạo invoice với status = PENDING
2. Gọi GET /pos/invoices/pending?chiNhanhId=1
3. Kết quả: Invoice này CÓ trong response ✅
```

**Test Case 2: Invoice COMPLETED**
```
1. Tạo invoice với status = PENDING
2. Complete invoice (status → COMPLETED)
3. Gọi GET /pos/invoices/pending?chiNhanhId=1
4. Kết quả: Invoice này KHÔNG có trong response ✅
```

**Test Case 3: Invoice CANCELLED**
```
1. Tạo invoice với status = PENDING
2. Delete invoice (status → CANCELLED)
3. Gọi GET /pos/invoices/pending?chiNhanhId=1
4. Kết quả: Invoice này KHÔNG có trong response ✅
```

---

## 📝 Frontend đã xử lý

Frontend đã filter ở client-side để đảm bảo chỉ hiển thị PENDING invoices:

```typescript
// Filter chỉ lấy invoices có status PENDING
const pendingOnly = invoices.filter(inv => {
  const status = inv.trangThai || inv.status;
  return status === 'PENDING' || status === 'pending';
});
```

**NHƯNG** nếu backend trả về quá nhiều invoices không PENDING, sẽ:
- ❌ Tốn bandwidth không cần thiết
- ❌ Tăng thời gian xử lý
- ❌ Có thể gây confusion

**KHUYẾN NGHỊ:** Backend nên filter ở server-side để tối ưu performance.

---

## ✅ Checklist cho Backend

- [ ] API `/pos/invoices/pending` CHỈ trả về invoices có `trangThai = "PENDING"`
- [ ] KHÔNG trả về invoices có `trangThai = "COMPLETED"`
- [ ] KHÔNG trả về invoices có `trangThai = "CANCELLED"`
- [ ] KHÔNG trả về invoices có `trangThai = "REFUNDED"`
- [ ] Test với invoice PENDING → có trong response
- [ ] Test với invoice COMPLETED → không có trong response
- [ ] Test với invoice CANCELLED → không có trong response
- [ ] Đảm bảo status values đúng format (uppercase: `PENDING`, `COMPLETED`, etc.)

---

## 🐛 Debug Information

Nếu vẫn còn vấn đề, vui lòng cung cấp:

1. **Response từ API:**
```bash
curl -X GET "http://localhost:8081/api/v1/pos/invoices/pending?chiNhanhId=1" \
  -H "Authorization: Bearer {token}"
```

2. **Console logs từ Frontend:**
- Mở browser console (F12)
- Xem logs: `[TableSelection] Loaded invoices from API:`
- Xem logs: `[TableSelection] Filtering out invoice:`

3. **Database query:**
- Query để lấy pending invoices
- Kết quả query (có bao nhiêu invoices, status của từng invoice)

---

## 📞 Liên hệ

Nếu có thắc mắc hoặc cần thêm thông tin, vui lòng liên hệ frontend team.

