# 📋 CHỨC NĂNG TREO BILL (HÓA ĐƠN TẠM) - UPDATED

**Ngày cập nhật:** 2025-12-14  
**Mục đích:** Tài liệu về chức năng treo bill - Flow đầy đủ với Suspend/Resume/Update/Complete/Cancel

---

## 📋 TỔNG QUAN

**Treo bill** là chức năng cho phép:
- Tạo hóa đơn tạm thời (status = PENDING) chưa thanh toán
- Lưu lại để thanh toán sau
- **Không cần phương thức thanh toán** khi treo (chỉ cần sản phẩm và số tiền)
- Không trừ tồn kho khi treo (chỉ trừ khi thanh toán)
- Không tích điểm khi treo (chỉ tích khi thanh toán)
- Cho phép nhiều đơn PENDING cùng lúc
- Có thể khôi phục, cập nhật, và tiếp tục xử lý đơn PENDING

---

## 🔄 FLOW XỬ LÝ CHI TIẾT

### 1. Luồng Treo Bill (Suspend Flow)

**Mục tiêu:** Lưu giỏ hàng hiện tại vào Database dưới dạng PENDING để giải phóng màn hình.

```
Thu ngân: Đang scan sản phẩm vào giỏ hàng
    ↓
Khách hàng yêu cầu chờ
    ↓
Thu ngân: Nhấn nút "Treo đơn" (Suspend)
    ↓
Frontend: Kiểm tra giỏ hàng có rỗng không? (Nếu rỗng -> Báo lỗi)
    ↓
Frontend: Hiển thị popup nhập Ghi chú (Bắt buộc hoặc tùy chọn)
    ↓
Thu ngân: Nhập ghi chú (ví dụ: "Khách nghe điện thoại") và xác nhận
    ↓
Backend: POST /api/v1/pos/checkout/hold
    ↓
Backend: Tạo mới hóa đơn với Status.PENDING
    ↓
Backend: Lưu chi tiết các món hàng (Order Items)
    ↓
Backend: KHÔNG trừ tồn kho
    ↓
Backend: KHÔNG tích điểm
    ↓
Frontend: Xóa sạch giỏ hàng hiện tại trên màn hình (Reset UI)
    ↓
Frontend: Thông báo "Đã treo đơn thành công"
    ↓
Frontend: Sẵn sàng cho khách hàng mới
```

### 2. Luồng Khôi Phục Bill (Retrieve/Resume Flow)

**Mục tiêu:** Lấy lại đơn hàng PENDING để tiếp tục xử lý và chuyển sang COMPLETED.

```
Thu ngân: Nhấn nút "Danh sách đơn treo"
    ↓
Backend: GET /api/v1/pos/invoices/pending?chiNhanhId=1
    ↓
Backend: Lấy tất cả hóa đơn có Status.PENDING
    ↓
Backend: Sort theo ngày tạo (mới nhất trước)
    ↓
Frontend: Hiển thị danh sách (Thời gian, Tổng tiền, Ghi chú)
    ↓
Frontend: Có thể lọc theo nhân viên hiện tại (tùy chọn)
    ↓
Thu ngân: Tìm đơn cần thanh toán -> Nhấn "Mở lại" (Resume)
    ↓
Backend: GET /api/v1/pos/invoices/{id}/resume
    ↓
Backend: Kiểm tra đơn này có đúng là PENDING không
    ↓
Backend: Trả về chi tiết đơn hàng (List items, customer info...)
    ↓
Frontend: Load toàn bộ sản phẩm của đơn đó vào màn hình bán hàng chính
    ↓
Frontend: Lưu lại invoice_id của đơn này vào biến tạm (để update sau)
    ↓
Frontend: Ẩn dòng đó khỏi danh sách chờ (hoặc đóng popup)
    ↓
Thu ngân: 
    - Tiếp tục scan thêm hàng (nếu khách mua thêm) -> Update vào đơn PENDING đó
    - Hoặc tiến hành thanh toán
```

### 3. Luồng Cập nhật Bill (Update PENDING Invoice)

**Mục tiêu:** Thêm/sửa/xóa sản phẩm trong đơn PENDING.

```
Thu ngân: Sau khi resume, tiếp tục scan thêm hàng hoặc sửa giỏ hàng
    ↓
Frontend: Cập nhật giỏ hàng trên UI
    ↓
Frontend: (Tự động hoặc manual) Gọi PUT /api/v1/pos/invoices/{id}/update-pending
    ↓
Backend: Kiểm tra đơn phải là PENDING
    ↓
Backend: Xóa tất cả chi tiết cũ
    ↓
Backend: Thêm chi tiết mới từ request
    ↓
Backend: Tính lại tổng tiền
    ↓
Backend: KHÔNG trừ tồn kho (vẫn là PENDING)
    ↓
Backend: Trả về InvoiceDTO đã cập nhật (vẫn PENDING)
```

### 4. Luồng Thanh toán (Complete PENDING Invoice)

**Mục tiêu:** Hoàn tất thanh toán đơn PENDING → COMPLETED.

```
Thu ngân: Tiến hành thanh toán
    ↓
Backend: POST /api/v1/pos/invoices/{id}/complete?phuongThucThanhToan=TIEN_MAT
    ↓
Backend: Kiểm tra hóa đơn phải là PENDING
    ↓
Backend: Cập nhật phương thức thanh toán
    ↓
Backend: Trừ tồn kho cho từng sản phẩm
    ↓
Backend: Tích điểm khách hàng (1.000 VND = 1 điểm)
    ↓
Backend: Chuyển status sang COMPLETED
    ↓
Backend: Trả về InvoiceDTO với status = COMPLETED
    ↓
Frontend: Reset UI, thông báo thành công
```

### 5. Luồng Hủy đơn (Cancel PENDING Invoice)

**Mục tiêu:** Hủy đơn PENDING → CANCELLED.

```
Thu ngân: Nhấn "Hủy" trong danh sách đơn treo
    ↓
Frontend: Confirm dialog
    ↓
Backend: POST /api/v1/pos/invoices/{id}/cancel-pending
    ↓
Backend: Kiểm tra đơn phải là PENDING
    ↓
Backend: Chuyển status sang CANCELLED
    ↓
Backend: KHÔNG trừ tồn kho (vì chưa trừ từ đầu)
    ↓
Backend: KHÔNG trừ điểm (vì chưa tích điểm)
    ↓
Backend: Trả về InvoiceDTO với status = CANCELLED
```

---

## 📡 API ENDPOINTS

### 1. Treo Bill (Suspend)

**Endpoint:** `POST /api/v1/pos/checkout/hold`

**Mô tả:** Tạo hóa đơn tạm thời (PENDING) từ giỏ hàng hiện tại.

**Request:**
```json
{
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "khachHangId": 1,  // Optional
  "giamGia": 0,
  "ghiChu": "Bàn 5",
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "donGia": 25000,
      "ghiChu": "Nóng"
    }
  ]
}
```

**Lưu ý quan trọng:**
- ✅ **KHÔNG cần** `phuongThucThanhToan` khi treo bill
- ✅ Chỉ cần: sản phẩm, số lượng, đơn giá, giảm giá (nếu có)
- ✅ Số tiền cuối cùng sẽ được tính tự động

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "maHoaDon": "HD20251211123456",
    "trangThai": "PENDING",
    "tongTien": 50000,
    "giamGia": 0,
    "thanhTien": 50000,
    "diemTichLuy": 0,  // Chưa tích điểm
    "phuongThucThanhToan": null,  // Chưa có phương thức thanh toán
    ...
  }
}
```

---

### 2. Lấy danh sách hóa đơn đang treo

**Endpoint:** `GET /api/v1/pos/invoices/pending?chiNhanhId=1`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "maHoaDon": "HD20251211123456",
      "trangThai": "PENDING",
      "tongTien": 50000,
      "thanhTien": 50000,
      "phuongThucThanhToan": null,  // Chưa có
      "ngayTao": "2025-12-11T12:00:00",
      ...
    },
    {
      "id": 2,
      "maHoaDon": "HD20251211120000",
      "trangThai": "PENDING",
      ...
    }
  ]
}
```

**Lưu ý:**
- ✅ Sắp xếp theo ngày tạo (mới nhất trước)
- ✅ Chỉ lấy hóa đơn có Status.PENDING
- ✅ Filter theo chiNhanhId

---

### 3. Khôi phục đơn PENDING (Resume)

**Endpoint:** `GET /api/v1/pos/invoices/{id}/resume`

**Mô tả:** Lấy chi tiết đơn PENDING để tiếp tục xử lý (load vào màn hình bán hàng).

**Authentication:** Required (CASHIER, MANAGER, ADMIN)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "maHoaDon": "HD20251214003456",
    "trangThai": "PENDING",
    "tongTien": 50000,
    "thanhTien": 50000,
    "ghiChu": "Khách nghe điện thoại",
    "chiTietHoaDons": [
      {
        "id": 1,
        "sanPham": {
          "id": 1,
          "tenSanPham": "Cà phê đen",
          "maSanPham": "CF001",
          ...
        },
        "soLuong": 2,
        "donGia": 25000,
        "thanhTien": 50000,
        "ghiChu": "Nóng"
      }
    ],
    "khachHang": { ... },
    "nhanVien": { ... },
    ...
  }
}
```

**Lưu ý:**
- Chỉ lấy được đơn có status = PENDING
- Trả về đầy đủ chi tiết để frontend load vào giỏ hàng

---

### 4. Cập nhật đơn PENDING

**Endpoint:** `PUT /api/v1/pos/invoices/{id}/update-pending`

**Mô tả:** Cập nhật đơn PENDING - Thêm/sửa/xóa sản phẩm (vẫn giữ PENDING, không trừ tồn kho).

**Authentication:** Required (CASHIER, MANAGER, ADMIN)

**Request Body:** (Giống như HoldBillRequest)
```json
{
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "khachHangId": 1,
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 3,  // Đã tăng từ 2 lên 3
      "ghiChu": "Nóng"
    },
    {
      "sanPhamId": 3,  // Thêm sản phẩm mới
      "soLuong": 1,
      "ghiChu": null
    }
  ],
  "giamGia": 5000,
  "maKhuyenMai": null,
  "ghiChu": "Khách nghe điện thoại - Đã thêm nước"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "trangThai": "PENDING",  // Vẫn là PENDING
    "tongTien": 80000,  // Đã cập nhật
    "thanhTien": 75000,
    ...
  }
}
```

**Lưu ý:**
- Xóa tất cả chi tiết cũ và thêm chi tiết mới từ request
- Không trừ tồn kho (vẫn là PENDING)
- Có thể cập nhật ghi chú

---

### 5. Hủy đơn PENDING

**Endpoint:** `POST /api/v1/pos/invoices/{id}/cancel-pending`

**Mô tả:** Hủy đơn PENDING - Chuyển sang CANCELLED (không trừ tồn kho, không trừ điểm).

**Authentication:** Required (CASHIER, MANAGER, ADMIN)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "trangThai": "CANCELLED",  // Đã chuyển sang CANCELLED
    ...
  }
}
```

**Lưu ý:**
- Chỉ hủy được đơn có status = PENDING
- Không trừ tồn kho (vì chưa trừ từ đầu)
- Không trừ điểm (vì chưa tích điểm)

---

### 6. Thanh toán hóa đơn đã treo (Complete)

**Endpoint:** `POST /api/v1/pos/invoices/{id}/complete?phuongThucThanhToan=TIEN_MAT`

**Mô tả:** Hoàn tất thanh toán đơn PENDING - Chuyển sang COMPLETED (trừ tồn kho, tích điểm).

**Authentication:** Required (CASHIER, MANAGER, ADMIN)

**Request Parameters:**
- `id` (path): ID hóa đơn
- `phuongThucThanhToan` (query): Phương thức thanh toán (TIEN_MAT, VISA, VNPAY, ...)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "maHoaDon": "HD20251211123456",
    "trangThai": "COMPLETED",  // ✅ Đã chuyển sang COMPLETED
    "tongTien": 50000,
    "thanhTien": 50000,
    "diemTichLuy": 50,  // ✅ Đã tích điểm (50,000 / 1,000 = 50 điểm)
    "phuongThucThanhToan": "TIEN_MAT",  // ✅ Đã cập nhật
    ...
  }
}
```

**Lưu ý:**
- ✅ Chỉ có thể thanh toán hóa đơn có Status.PENDING
- ✅ **Bắt buộc** phải cung cấp `phuongThucThanhToan` khi thanh toán
- ✅ Trừ tồn kho khi thanh toán
- ✅ Tích điểm khách hàng (1.000 VND = 1 điểm)
- ✅ Chuyển status sang COMPLETED

---

## 🔍 SO SÁNH: CHECKOUT vs TREO BILL

| Tính năng | Checkout | Treo Bill |
|-----------|----------|-----------|
| **Status** | `COMPLETED` | `PENDING` |
| **Trừ tồn kho** | ✅ Có | ❌ Không |
| **Tích điểm** | ✅ Có | ❌ Không |
| **Phương thức thanh toán** | ✅ **Bắt buộc** | ❌ **Không cần** |
| **Cập nhật promotion usage** | ✅ Có | ❌ Không |
| **Khi nào dùng** | Thanh toán ngay | Thanh toán sau |

---

## 💻 CODE IMPLEMENTATION

### 1. HoldBillRequest DTO

```java
/**
 * DTO cho chức năng treo bill (hóa đơn tạm)
 * - Không yêu cầu phương thức thanh toán (vì chưa thanh toán)
 * - Chỉ cần thông tin sản phẩm và số tiền
 */
public class HoldBillRequest {
    private Long khachHangId;
    
    @NotNull
    private Long nhanVienId;
    
    @NotNull
    private Long chiNhanhId;
    
    @NotEmpty
    private List<CartItemDTO> items;
    
    private BigDecimal giamGia;
    
    // ❌ KHÔNG có @NotBlank - Vì treo bill chưa cần phương thức thanh toán
    private String phuongThucThanhToan;
    
    private String maKhuyenMai;
    private String ghiChu;
}
```

### 2. PosService Interface

```java
/**
 * Treo bill - Tạo hóa đơn tạm thời (PENDING) chưa thanh toán
 * - Không trừ tồn kho
 * - Không tích điểm
 * - Không yêu cầu phương thức thanh toán
 */
InvoiceDTO holdBill(HoldBillRequest request);

/**
 * Lấy danh sách hóa đơn đang treo (PENDING) theo chi nhánh
 */
List<InvoiceDTO> getPendingInvoices(Long chiNhanhId);

/**
 * Thanh toán hóa đơn đã treo (chuyển từ PENDING sang COMPLETED)
 */
InvoiceDTO completePendingInvoice(Long invoiceId, String phuongThucThanhToan);
```

### 3. PosServiceImpl

**holdBill():**
- Tạo hóa đơn với `Status.PENDING`
- Không trừ tồn kho
- Không tích điểm
- Không yêu cầu `phuongThucThanhToan`
- `phuongThucThanhToan = null` trong database

**getPendingInvoices():**
- Query: `findByChiNhanhIdAndTrangThai(chiNhanhId, Status.PENDING)`
- Sort by `ngayTao DESC`

**completePendingInvoice():**
- Kiểm tra status phải là PENDING
- **Bắt buộc** phải có `phuongThucThanhToan`
- Trừ tồn kho cho từng sản phẩm
- Tích điểm khách hàng
- Chuyển status sang COMPLETED

---

## 🎯 USE CASES

### Use Case 1: Khách hàng chưa thanh toán ngay

```
1. Nhân viên chọn món cho khách hàng
2. Khách hàng chưa muốn thanh toán (đi vệ sinh, gọi điện, ...)
3. Nhân viên chọn "Treo bill"
   - KHÔNG cần chọn phương thức thanh toán
   - Chỉ cần xác nhận sản phẩm và số tiền
4. Hóa đơn được lưu với status PENDING
5. Sau đó khách hàng quay lại thanh toán
6. Nhân viên chọn hóa đơn đang treo → Chọn phương thức thanh toán → Thanh toán
7. Hóa đơn chuyển sang COMPLETED, trừ tồn kho, tích điểm
```

### Use Case 2: Quản lý hóa đơn đang treo

```
1. Nhân viên xem danh sách hóa đơn đang treo
2. Chọn hóa đơn cần thanh toán
3. Chọn phương thức thanh toán (TIEN_MAT, VISA, VNPAY, ...)
4. Hoàn tất thanh toán
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Phương thức thanh toán

- **Khi treo bill:** ❌ **KHÔNG cần** `phuongThucThanhToan`
- **Khi thanh toán:** ✅ **Bắt buộc** phải có `phuongThucThanhToan`

### 2. Tồn kho

- **Khi treo bill:** Không trừ tồn kho
- **Khi thanh toán:** Kiểm tra tồn kho còn đủ không
- **Nếu không đủ:** Throw `INSUFFICIENT_STOCK` error

### 3. Điểm tích lũy

- **Khi treo bill:** Không tích điểm
- **Khi thanh toán:** Tích điểm theo công thức 1.000 VND = 1 điểm

### 4. Promotion

- **Khi treo bill:** Vẫn tính promotion discount, nhưng không cập nhật usage
- **Khi thanh toán:** Cập nhật promotion usage

### 5. Status

- **PENDING:** Hóa đơn đang treo (chưa thanh toán)
- **COMPLETED:** Hóa đơn đã thanh toán
- **CANCELLED:** Hóa đơn đã hủy

---

## 📝 FRONTEND INTEGRATION

### 1. Treo Bill

```typescript
// Treo bill - KHÔNG cần phương thức thanh toán
const holdBill = async (holdBillRequest: HoldBillRequest) => {
  const response = await fetch('/api/v1/pos/checkout/hold', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      nhanVienId: holdBillRequest.nhanVienId,
      chiNhanhId: holdBillRequest.chiNhanhId,
      khachHangId: holdBillRequest.khachHangId,  // Optional
      giamGia: holdBillRequest.giamGia || 0,
      ghiChu: holdBillRequest.ghiChu,
      items: holdBillRequest.items
      // ❌ KHÔNG gửi phuongThucThanhToan
    })
  });
  
  const data = await response.json();
  return data.data; // InvoiceDTO với status = PENDING
};
```

### 2. Lấy danh sách hóa đơn đang treo

```typescript
// Lấy danh sách hóa đơn đang treo
const getPendingInvoices = async (chiNhanhId: number) => {
  const response = await fetch(
    `/api/v1/pos/invoices/pending?chiNhanhId=${chiNhanhId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  return data.data; // List<InvoiceDTO>
};
```

### 3. Thanh toán hóa đơn đã treo

```typescript
// Thanh toán hóa đơn đã treo - BẮT BUỘC phải có phương thức thanh toán
const completePendingInvoice = async (
  invoiceId: number, 
  phuongThucThanhToan: string  // ✅ Bắt buộc
) => {
  const response = await fetch(
    `/api/v1/pos/invoices/${invoiceId}/complete?phuongThucThanhToan=${phuongThucThanhToan}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  return data.data; // InvoiceDTO với status = COMPLETED
};
```

---

## ✅ KIỂM TRA

- [ ] Treo bill thành công → Status = PENDING
- [ ] Treo bill không yêu cầu phương thức thanh toán
- [ ] Treo bill không trừ tồn kho
- [ ] Treo bill không tích điểm
- [ ] Lấy danh sách hóa đơn đang treo → Trả về đúng
- [ ] Thanh toán hóa đơn treo → Bắt buộc phải có phương thức thanh toán
- [ ] Thanh toán hóa đơn treo → Status = COMPLETED
- [ ] Thanh toán hóa đơn treo → Trừ tồn kho
- [ ] Thanh toán hóa đơn treo → Tích điểm
- [ ] Không thể thanh toán hóa đơn không phải PENDING

---

**Ngày hoàn thành:** 2025-12-11  
**Trạng thái:** ✅ Đã implement xong

