# ⚠️ Vấn đề: Nhiều invoices PENDING cho cùng một bàn

## 🔍 Phát hiện từ Console Logs

Từ console logs, phát hiện:
- **11 invoices PENDING** cho bàn 1
- Tất cả đều có `status = 'PENDING'`
- Hệ thống đang chọn invoice mới nhất (ID: 45)

**Điều này KHÔNG BÌNH THƯỜNG!**

## ❌ Vấn đề

### 1. Nhiều invoices PENDING cho cùng một bàn
- Khi tạo invoice mới cho một bàn, các invoices cũ vẫn còn PENDING
- Backend không tự động complete/xóa invoices cũ
- Dẫn đến tích lũy nhiều invoices PENDING cho cùng một bàn

### 2. Hiển thị "Đang treo" dù đã thanh toán
- Có thể có invoice cũ vẫn PENDING
- Invoice mới đã COMPLETED nhưng invoice cũ vẫn hiển thị
- Frontend chọn invoice mới nhất, nhưng có thể có invoice cũ vẫn PENDING

## ✅ Frontend đã xử lý

### 1. Chọn invoice mới nhất
- Nếu có nhiều invoices PENDING cho cùng một bàn
- Frontend sẽ chọn invoice mới nhất (theo `ngayTao`)
- Log cảnh báo khi có nhiều invoices

### 2. Logging chi tiết
- Log số lượng invoices PENDING cho mỗi bàn
- Cảnh báo khi có quá nhiều (> 3 invoices)
- Log invoice được chọn để hiển thị

## 📋 Yêu cầu Backend

### 1. Complete/Xóa invoices cũ khi tạo invoice mới

**Khi tạo invoice mới cho một bàn:**
- ✅ Tự động complete các invoices PENDING cũ của bàn đó
- ✅ Hoặc xóa (set status = CANCELLED) các invoices cũ
- ✅ Chỉ giữ lại invoice mới nhất

**Logic đề xuất:**
```java
// Khi tạo invoice mới cho bàn X
1. Tìm tất cả invoices PENDING của bàn X
2. Complete hoặc cancel các invoices cũ
3. Tạo invoice mới
```

### 2. API `/pos/invoices/pending` chỉ trả về invoice mới nhất

**Hoặc filter ở database:**
```sql
-- Chỉ lấy invoice mới nhất cho mỗi bàn
SELECT DISTINCT ON (table_id) *
FROM invoices
WHERE chiNhanhId = ?
  AND trangThai = 'PENDING'
ORDER BY table_id, ngayTao DESC;
```

### 3. Cleanup job (tùy chọn)

**Tạo job tự động cleanup:**
- Tìm các invoices PENDING cũ (ví dụ: > 24 giờ)
- Tự động complete hoặc cancel
- Chạy định kỳ (ví dụ: mỗi giờ)

## 🧪 Test Cases

### Test Case 1: Tạo invoice mới cho bàn đã có invoice PENDING
```
1. Tạo invoice PENDING cho bàn 1
2. Tạo invoice PENDING mới cho bàn 1
3. Kết quả: Invoice cũ được complete/cancel ✅
4. Gọi GET /pos/invoices/pending?chiNhanhId=1
5. Kết quả: Chỉ có 1 invoice PENDING cho bàn 1 ✅
```

### Test Case 2: Nhiều invoices PENDING
```
1. Tạo 5 invoices PENDING cho bàn 1
2. Gọi GET /pos/invoices/pending?chiNhanhId=1
3. Kết quả: Chỉ có 1 invoice PENDING (mới nhất) ✅
```

## 🔍 Debug Information

### Console Logs hiện tại:
```
[TableSelection] Multiple PENDING invoices for table: 1
Count: 11
[TableSelection] Using newest invoice: 45 for table: 1
```

### Vấn đề:
- Có 11 invoices PENDING cho bàn 1
- Tất cả đều có status = 'PENDING'
- Frontend chọn invoice mới nhất (ID: 45)

### Giải pháp:
- Backend nên complete/cancel các invoices cũ khi tạo invoice mới
- Hoặc filter để chỉ trả về invoice mới nhất cho mỗi bàn

## ✅ Checklist

- [ ] Backend complete/cancel invoices cũ khi tạo invoice mới
- [ ] API `/pos/invoices/pending` chỉ trả về invoice mới nhất cho mỗi bàn
- [ ] Test với nhiều invoices PENDING → chỉ có 1 invoice trong response
- [ ] Cleanup job tự động (tùy chọn)

## 📝 Notes

- Frontend đã xử lý bằng cách chọn invoice mới nhất
- Nhưng backend nên xử lý ở server-side để tránh tích lũy invoices
- Nếu vẫn còn vấn đề, vui lòng cung cấp:
  - Logic tạo invoice hiện tại
  - Có complete/cancel invoices cũ không?
  - Response từ API `/pos/invoices/pending`

