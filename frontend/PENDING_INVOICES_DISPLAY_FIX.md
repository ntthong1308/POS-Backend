# 🔧 Fix: Hiển thị "Đang treo" dù đã thanh toán xong

## ❌ Vấn đề

Sau khi thanh toán thành công (VNPay hoặc phương thức khác):
- Invoice đã được complete (status: PENDING → COMPLETED)
- Nhưng vẫn hiển thị "Đang treo" trên bàn
- Sau khi đăng xuất/đăng nhập lại vẫn bị
- Không thể xóa bill treo

## 🔍 Nguyên nhân

**Backend API `/pos/invoices/pending` vẫn trả về invoices đã COMPLETED**

Frontend đã filter ở client-side nhưng:
- Tốn bandwidth không cần thiết
- Có thể có edge cases
- Backend nên filter ở server-side để tối ưu

## ✅ Frontend đã sửa

### 1. Cải thiện Filter Logic
- Filter chặt chẽ hơn: chỉ chấp nhận `status === 'PENDING'` (uppercase)
- Loại bỏ tất cả: `COMPLETED`, `CANCELLED`, `REFUNDED`, `CANCELED`
- Log chi tiết để debug

### 2. Thêm Verification
- Verify invoice status từ backend trước khi restore cart
- Nếu invoice không PENDING → không restore, reload danh sách

### 3. Cải thiện Error Handling
- Check status trước khi xóa
- Hiển thị warning nếu invoice không PENDING
- Auto reload sau khi xóa

### 4. Logging chi tiết
- Log tất cả invoices từ API
- Log invoices bị filter
- Log invoices được chọn để hiển thị

## 📋 Yêu cầu Backend

### API: `GET /api/v1/pos/invoices/pending`

**Yêu cầu:**
- ✅ **CHỈ trả về invoices có `trangThai = "PENDING"`**
- ❌ **KHÔNG trả về invoices có `trangThai = "COMPLETED"`**
- ❌ **KHÔNG trả về invoices có `trangThai = "CANCELLED"`**
- ❌ **KHÔNG trả về invoices có `trangThai = "REFUNDED"`**

### Filter ở Database Level

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

## 🧪 Test Cases

### Test Case 1: Invoice PENDING
```
1. Tạo invoice với status = PENDING
2. Gọi GET /pos/invoices/pending?chiNhanhId=1
3. Kết quả: Invoice này CÓ trong response ✅
```

### Test Case 2: Invoice COMPLETED
```
1. Tạo invoice với status = PENDING
2. Complete invoice (status → COMPLETED)
3. Gọi GET /pos/invoices/pending?chiNhanhId=1
4. Kết quả: Invoice này KHÔNG có trong response ✅
```

### Test Case 3: Invoice CANCELLED
```
1. Tạo invoice với status = PENDING
2. Delete invoice (status → CANCELLED)
3. Gọi GET /pos/invoices/pending?chiNhanhId=1
4. Kết quả: Invoice này KHÔNG có trong response ✅
```

## 🔍 Debug Steps

### 1. Kiểm tra Console Logs

Mở browser console (F12) và xem:

```
[TableSelection] Loaded invoices from API: [...]
[TableSelection] Total invoices from API: X
[TableSelection] ❌ Filtering out invoice: {id: X, status: "COMPLETED"}
[TableSelection] ✅ Valid PENDING invoice: {id: Y, status: "PENDING"}
[TableSelection] Total PENDING invoices after filter: Y
```

### 2. Kiểm tra Response từ Backend

```bash
curl -X GET "http://localhost:8081/api/v1/pos/invoices/pending?chiNhanhId=1" \
  -H "Authorization: Bearer {token}"
```

**Kiểm tra:**
- Có invoices với `trangThai = "COMPLETED"` không?
- Có invoices với `trangThai = "CANCELLED"` không?
- Chỉ có invoices với `trangThai = "PENDING"` không?

### 3. Kiểm tra Database

```sql
-- Kiểm tra invoices trong database
SELECT id, maHoaDon, trangThai, ghiChu 
FROM invoices 
WHERE chiNhanhId = 1 
ORDER BY ngayTao DESC;
```

**Kiểm tra:**
- Có invoices với `trangThai = "COMPLETED"` không?
- Có invoices với `trangThai = "PENDING"` không?

## ✅ Checklist

- [ ] Backend API `/pos/invoices/pending` CHỈ trả về invoices có `trangThai = "PENDING"`
- [ ] KHÔNG trả về invoices có `trangThai = "COMPLETED"`
- [ ] KHÔNG trả về invoices có `trangThai = "CANCELLED"`
- [ ] KHÔNG trả về invoices có `trangThai = "REFUNDED"`
- [ ] Test với invoice PENDING → có trong response
- [ ] Test với invoice COMPLETED → không có trong response
- [ ] Test với invoice CANCELLED → không có trong response
- [ ] Đảm bảo status values đúng format (uppercase: `PENDING`, `COMPLETED`, etc.)

## 📝 Notes

- Frontend đã filter ở client-side để đảm bảo chỉ hiển thị PENDING invoices
- Nhưng backend nên filter ở server-side để tối ưu performance
- Nếu vẫn còn vấn đề, vui lòng cung cấp:
  - Response từ API `/pos/invoices/pending`
  - Console logs từ browser
  - Database query results

