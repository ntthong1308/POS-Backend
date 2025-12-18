# 📝 Lưu Ý Về Kho Hàng - Nguyên Liệu

## ⚠️ Vấn Đề Hiện Tại

Theo yêu cầu, **Kho hàng** cần được sử dụng cho việc **nhập/xuất nguyên liệu**, không phải sản phẩm.

## 🔍 Kiểm Tra Backend

Theo tài liệu `FRONTEND_COMPLETE_GUIDE.md`, API hiện tại:

### Inventory API Endpoints:
- `POST /api/v1/admin/inventory/import` - Nhập hàng
- `POST /api/v1/admin/inventory/return` - Trả hàng
- `GET /api/v1/admin/inventory/stock/{productId}` - Kiểm tra tồn kho

### Request Body Hiện Tại:
```json
{
  "nhaCungCapId": 1,
  "chiNhanhId": 1,
  "nhanVienId": 1,
  "items": [
    {
      "sanPhamId": 1,  // ⚠️ Đang dùng sanPhamId
      "soLuong": 100,
      "donGia": 8000.00,
      "ghiChu": "Nhập hàng tháng 12"
    }
  ],
  "ghiChu": "Ghi chú nhập hàng"
}
```

## ❓ Cần Xác Nhận Với Backend

1. **Backend có hỗ trợ nguyên liệu (raw materials/ingredients) không?**
   - Có entity `RawMaterial` hoặc `Ingredient` riêng?
   - Hay dùng chung `Product` với một field phân biệt (ví dụ: `loai: 'SAN_PHAM' | 'NGUYEN_LIEU'`)?

2. **Nếu có entity riêng:**
   - Endpoint có thể là: `/api/v1/admin/inventory/raw-materials/import`
   - Hoặc: `/api/v1/admin/inventory/ingredients/import`
   - Request body sẽ dùng `nguyenLieuId` thay vì `sanPhamId`

3. **Nếu dùng chung Product:**
   - Cần thêm field `loai` vào `ProductDTO`
   - Filter products theo `loai = 'NGUYEN_LIEU'` khi hiển thị trong inventory page

## 🔧 Frontend Hiện Tại

Frontend đang:
- Sử dụng `inventoryAPI.import()` với `sanPhamId`
- Hiển thị danh sách sản phẩm trong inventory page
- Chưa có UI để phân biệt sản phẩm và nguyên liệu

## 📋 Đề Xuất

1. **Nếu Backend chưa có:**
   - Cần backend implement API cho nguyên liệu
   - Hoặc mở rộng Product entity để hỗ trợ cả sản phẩm và nguyên liệu

2. **Nếu Backend đã có:**
   - Cập nhật frontend để sử dụng API nguyên liệu
   - Tạo UI riêng cho quản lý nguyên liệu

## 🎯 Next Steps

1. ✅ Kiểm tra với backend xem có API/entity cho nguyên liệu chưa
2. ⏳ Cập nhật frontend theo cấu trúc backend
3. ⏳ Tạo UI cho quản lý nguyên liệu (nếu cần)

