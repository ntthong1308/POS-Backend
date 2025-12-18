# ❓ CÂU HỎI VỀ BACKEND API

**Ngày:** 2025-12-14  
**Mục đích:** Các câu hỏi về API backend cần được xác nhận

---

## 1. 🔄 Batch Import/Export API

### Vấn đề hiện tại:
- Frontend đang gọi `/api/v1/admin/nguyen-lieu/nhap/batch` và `/api/v1/admin/nguyen-lieu/xuat/batch`
- Backend trả về **500 Internal Server Error** với `NoResourceFoundException`
- Nghĩa là endpoint batch **không tồn tại**

### Câu hỏi:
1. **Backend có hỗ trợ batch import/export không?**
   - Nếu có, endpoint chính xác là gì?
   - Request body format như thế nào?

2. **Nếu không có batch API:**
   - Backend có hỗ trợ `maPhieu` trong request body của `/api/v1/admin/nguyen-lieu/nhap` và `/api/v1/admin/nguyen-lieu/xuat` không?
   - Nếu có, khi gửi nhiều items với cùng `maPhieu`, backend có tự động gộp vào 1 phiếu không?
   - Nếu không, có cách nào để gộp nhiều nguyên liệu vào 1 phiếu không?

### Request body hiện tại (batch):
```json
{
  "nhanVienId": 1,
  "items": [
    {
      "nguyenLieuId": 1,
      "soLuong": 10,
      "ghiChu": "Ghi chú riêng cho item"
    },
    {
      "nguyenLieuId": 2,
      "soLuong": 20,
      "ghiChu": "Ghi chú riêng cho item"
    }
  ],
  "ghiChu": "Ghi chú chung cho phiếu",
  "maPhieu": "NHAP-20251214023456-ABC123"
}
```

---

## 2. 🗑️ Delete Import/Export Receipts API

### Vấn đề hiện tại:
- Frontend chưa có chức năng xóa phiếu nhập/xuất kho
- Cần API để xóa phiếu nhập/xuất

### Câu hỏi:
1. **Backend có API để xóa phiếu nhập kho không?**
   - Endpoint: `DELETE /api/v1/admin/nguyen-lieu/nhap/{id}`?
   - Hoặc: `DELETE /api/v1/admin/nguyen-lieu/nhap/history/{id}`?
   - Request body có cần gì không?

2. **Backend có API để xóa phiếu xuất kho không?**
   - Endpoint: `DELETE /api/v1/admin/nguyen-lieu/xuat/{id}`?
   - Hoặc: `DELETE /api/v1/admin/nguyen-lieu/xuat/history/{id}`?
   - Request body có cần gì không?

3. **Khi xóa phiếu nhập/xuất:**
   - Có cần rollback tồn kho không? (Ví dụ: xóa phiếu nhập thì trừ lại tồn kho)
   - Có cần permission đặc biệt không? (Ví dụ: chỉ ADMIN mới được xóa)
   - Có giới hạn thời gian không? (Ví dụ: chỉ xóa được phiếu trong 24h)

### Response format mong đợi:
```json
{
  "success": true,
  "message": "Đã xóa phiếu nhập kho thành công",
  "data": null
}
```

---

## 3. 📋 Tóm tắt API cần xác nhận

| Chức năng | Endpoint | Method | Status |
|-----------|----------|--------|--------|
| Batch Import | `/api/v1/admin/nguyen-lieu/nhap/batch` | POST | ❓ Cần xác nhận |
| Batch Export | `/api/v1/admin/nguyen-lieu/xuat/batch` | POST | ❓ Cần xác nhận |
| Delete Import Receipt | `/api/v1/admin/nguyen-lieu/nhap/{id}` | DELETE | ❓ Cần xác nhận |
| Delete Export Receipt | `/api/v1/admin/nguyen-lieu/xuat/{id}` | DELETE | ❓ Cần xác nhận |
| `maPhieu` trong request | `/api/v1/admin/nguyen-lieu/nhap` | POST | ❓ Cần xác nhận |
| `maPhieu` trong request | `/api/v1/admin/nguyen-lieu/xuat` | POST | ❓ Cần xác nhận |

---

## 4. 💡 Đề xuất

Nếu backend chưa có các API trên, có thể:

1. **Batch Import/Export:**
   - Tạo endpoint mới: `POST /api/v1/admin/nguyen-lieu/nhap/batch`
   - Hoặc hỗ trợ `maPhieu` trong request để frontend có thể gộp nhiều items vào 1 phiếu

2. **Delete Receipts:**
   - Tạo endpoint: `DELETE /api/v1/admin/nguyen-lieu/nhap/{id}`
   - Tạo endpoint: `DELETE /api/v1/admin/nguyen-lieu/xuat/{id}`
   - Có thể thêm soft delete (chỉ đánh dấu xóa, không xóa thật)

---

**Vui lòng cung cấp thông tin về các API trên để frontend có thể implement đúng!** 🙏

