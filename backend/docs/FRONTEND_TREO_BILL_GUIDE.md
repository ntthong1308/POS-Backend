# 📋 HƯỚNG DẪN FRONTEND - CHỨC NĂNG TREO BILL (SUSPEND/RESUME)

**Ngày:** 2025-12-14  
**Mục đích:** Hướng dẫn chi tiết implement chức năng Treo Bill theo flow mới

---

## 📋 TỔNG QUAN FLOW

### 3 Trạng thái Invoice:
- **PENDING** - Đơn đang treo (chưa thanh toán, chưa trừ tồn kho)
- **COMPLETED** - Đơn đã hoàn thành (đã thanh toán, đã trừ tồn kho)
- **CANCELLED** - Đơn đã hủy

### Flow chính:
1. **Treo Bill** → Tạo đơn PENDING
2. **Khôi phục Bill** → Lấy đơn PENDING để tiếp tục xử lý
3. **Cập nhật Bill** → Thêm/sửa/xóa sản phẩm trong đơn PENDING
4. **Thanh toán** → Chuyển PENDING → COMPLETED
5. **Hủy đơn** → Chuyển PENDING → CANCELLED

---

## 🔄 FLOW CHI TIẾT

### 1. Luồng Treo Bill (Suspend Flow)

**Mục tiêu:** Lưu giỏ hàng hiện tại vào Database dưới dạng PENDING để giải phóng màn hình.

**Các bước:**

#### Frontend:

```typescript
// 1. User đang scan sản phẩm vào giỏ hàng
const cart = [
  { sanPhamId: 1, soLuong: 2, ... },
  { sanPhamId: 2, soLuong: 1, ... }
];

// 2. User nhấn nút "Treo đơn" (Suspend)
async function suspendOrder() {
  // 2.1. Kiểm tra giỏ hàng có rỗng không
  if (cart.length === 0) {
    alert("Giỏ hàng trống!");
    return;
  }

  // 2.2. Hiển thị popup nhập Ghi chú (Bắt buộc hoặc tùy chọn)
  const note = prompt("Nhập ghi chú cho đơn này (ví dụ: 'Khách nghe điện thoại', 'Bàn 5'):");
  // Hoặc dùng modal component để nhập ghi chú

  // 2.3. Gọi API treo bill
  const request = {
    nhanVienId: currentUser.id,
    chiNhanhId: currentUser.chiNhanhId,
    khachHangId: selectedCustomer?.id || null,
    items: cart.map(item => ({
      sanPhamId: item.sanPhamId,
      soLuong: item.soLuong,
      ghiChu: item.note || null
    })),
    giamGia: discount || 0,
    maKhuyenMai: promotionCode || null,
    ghiChu: note || null  // Ghi chú từ popup
  };

  try {
    const response = await fetch('/api/v1/pos/checkout/hold', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to suspend order');
    }

    const result = await response.json();
    const invoice = result.data;

    // 2.4. Xóa sạch giỏ hàng trên màn hình
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setPromotionCode(null);

    // 2.5. Thông báo thành công
    showNotification('Đã treo đơn thành công!', 'success');
    
    // 2.6. Sẵn sàng cho khách hàng mới
    // UI đã được reset về trạng thái mới

  } catch (error) {
    console.error('Error suspending order:', error);
    showNotification(error.message || 'Lỗi khi treo đơn', 'error');
  }
}
```

#### API Endpoint:

**POST** `/api/v1/pos/checkout/hold`

**Request Body:**
```json
{
  "nhanVienId": 1,
  "chiNhanhId": 1,
  "khachHangId": 1,  // Optional
  "items": [
    {
      "sanPhamId": 1,
      "soLuong": 2,
      "ghiChu": "Nóng"  // Optional
    }
  ],
  "giamGia": 0,  // Optional
  "maKhuyenMai": "PROMO123",  // Optional
  "ghiChu": "Khách nghe điện thoại"  // Optional - Ghi chú để dễ tìm lại
}
```

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
    "ngayTao": "2025-12-14T00:34:56",
    ...
  }
}
```

---

### 2. Luồng Khôi Phục Bill (Retrieve/Resume Flow)

**Mục tiêu:** Lấy lại đơn hàng PENDING để tiếp tục xử lý.

**Các bước:**

#### Frontend:

```typescript
// 1. User nhấn nút "Danh sách đơn treo"
async function showPendingOrders() {
  try {
    // 2. Gọi API lấy danh sách đơn PENDING
    const response = await fetch(`/api/v1/pos/invoices/pending?chiNhanhId=${currentUser.chiNhanhId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    const pendingInvoices = result.data;

    // 3. Lọc dữ liệu (có thể lọc theo nhân viên hiện tại)
    const filteredInvoices = pendingInvoices.filter(inv => 
      inv.nhanVienId === currentUser.id  // Chỉ hiển thị đơn của nhân viên hiện tại (tùy chọn)
    );

    // 4. Hiển thị danh sách
    // Hiển thị: Thời gian tạo, Tổng tiền, Ghi chú
    showPendingOrdersModal(filteredInvoices);

  } catch (error) {
    console.error('Error loading pending orders:', error);
    showNotification('Lỗi khi tải danh sách đơn treo', 'error');
  }
}

// 5. User chọn đơn cần thanh toán -> Nhấn "Mở lại" (Resume)
async function resumeOrder(invoiceId: number) {
  try {
    // 6. Gọi API lấy chi tiết đơn PENDING
    const response = await fetch(`/api/v1/pos/invoices/${invoiceId}/resume`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to resume order');
    }

    const result = await response.json();
    const invoice = result.data;

    // 7. Load toàn bộ sản phẩm vào màn hình bán hàng
    const cartItems = invoice.chiTietHoaDons.map(item => ({
      sanPhamId: item.sanPham.id,
      tenSanPham: item.sanPham.tenSanPham,
      soLuong: item.soLuong,
      donGia: item.donGia,
      thanhTien: item.thanhTien,
      note: item.ghiChu || null
    }));

    setCart(cartItems);
    setSelectedCustomer(invoice.khachHang ? {
      id: invoice.khachHang.id,
      tenKhachHang: invoice.khachHang.tenKhachHang,
      ...
    } : null);
    setDiscount(invoice.giamGia || 0);
    setCurrentInvoiceId(invoiceId);  // ✅ Lưu lại invoice ID để update sau

    // 8. Ẩn dòng đó khỏi danh sách chờ (hoặc đóng popup)
    closePendingOrdersModal();

    showNotification('Đã mở lại đơn hàng', 'success');

  } catch (error) {
    console.error('Error resuming order:', error);
    showNotification('Lỗi khi mở lại đơn hàng', 'error');
  }
}
```

#### API Endpoints:

**GET** `/api/v1/pos/invoices/pending?chiNhanhId=1`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "maHoaDon": "HD20251214003456",
      "trangThai": "PENDING",
      "tongTien": 50000,
      "thanhTien": 50000,
      "ghiChu": "Khách nghe điện thoại",
      "ngayTao": "2025-12-14T00:34:56",
      "nhanVienId": 1,
      "tenNhanVien": "Nguyễn Văn A",
      ...
    },
    {
      "id": 44,
      "maHoaDon": "HD20251214002345",
      "trangThai": "PENDING",
      "tongTien": 35000,
      "thanhTien": 35000,
      "ghiChu": "Bàn 5",
      "ngayTao": "2025-12-14T00:23:45",
      ...
    }
  ]
}
```

**GET** `/api/v1/pos/invoices/{id}/resume`

**Response:** (Giống như getInvoice nhưng chỉ cho PENDING)
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
          ...
        },
        "soLuong": 2,
        "donGia": 25000,
        "thanhTien": 50000,
        "ghiChu": "Nóng"
      }
    ],
    "khachHang": {
      "id": 1,
      "tenKhachHang": "Nguyễn Văn A",
      ...
    },
    ...
  }
}
```

---

### 3. Luồng Cập nhật Bill (Update PENDING Invoice)

**Mục tiêu:** Thêm/sửa/xóa sản phẩm trong đơn PENDING.

**Các bước:**

#### Frontend:

```typescript
// Sau khi resume order, user có thể:
// - Tiếp tục scan thêm hàng
// - Sửa số lượng
// - Xóa sản phẩm

// 9. User tiếp tục scan thêm hàng hoặc sửa giỏ hàng
function addItemToResumedOrder(product: Product) {
  // Thêm vào cart hiện tại
  const existingItem = cart.find(item => item.sanPhamId === product.id);
  
  if (existingItem) {
    existingItem.soLuong += 1;
  } else {
    cart.push({
      sanPhamId: product.id,
      tenSanPham: product.tenSanPham,
      soLuong: 1,
      donGia: product.giaBan,
      ...
    });
  }

  // ✅ Nếu có currentInvoiceId, update đơn PENDING
  if (currentInvoiceId) {
    updatePendingInvoice();
  }
}

// 10. Cập nhật đơn PENDING khi có thay đổi
async function updatePendingInvoice() {
  if (!currentInvoiceId) return;

  try {
    const request = {
      nhanVienId: currentUser.id,
      chiNhanhId: currentUser.chiNhanhId,
      khachHangId: selectedCustomer?.id || null,
      items: cart.map(item => ({
        sanPhamId: item.sanPhamId,
        soLuong: item.soLuong,
        ghiChu: item.note || null
      })),
      giamGia: discount || 0,
      maKhuyenMai: promotionCode || null,
      ghiChu: invoiceNote || null
    };

    const response = await fetch(`/api/v1/pos/invoices/${currentInvoiceId}/update-pending`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error('Failed to update pending invoice');
    }

    const result = await response.json();
    // Invoice đã được cập nhật, vẫn là PENDING

  } catch (error) {
    console.error('Error updating pending invoice:', error);
    showNotification('Lỗi khi cập nhật đơn hàng', 'error');
  }
}

// 11. Hoặc tiến hành thanh toán ngay
async function checkoutResumedOrder() {
  if (!currentInvoiceId) {
    // Nếu không có invoice ID, tạo đơn mới
    await checkoutNewOrder();
    return;
  }

  // Thanh toán đơn PENDING
  await completePendingInvoice(currentInvoiceId);
}
```

#### API Endpoint:

**PUT** `/api/v1/pos/invoices/{id}/update-pending`

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

---

### 4. Luồng Thanh toán (Complete PENDING Invoice)

**Mục tiêu:** Hoàn tất thanh toán đơn PENDING → COMPLETED.

**Các bước:**

#### Frontend:

```typescript
// 12. User tiến hành thanh toán
async function completePendingInvoice(invoiceId: number, paymentMethod: string) {
  try {
    const response = await fetch(`/api/v1/pos/invoices/${invoiceId}/complete?phuongThucThanhToan=${paymentMethod}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete invoice');
    }

    const result = await response.json();
    const invoice = result.data;

    // 13. Kết thúc: Invoice đã chuyển sang COMPLETED
    // - Đã trừ tồn kho
    // - Đã tích điểm
    // - Đã cập nhật status = COMPLETED

    // Reset UI
    setCart([]);
    setSelectedCustomer(null);
    setCurrentInvoiceId(null);
    setDiscount(0);

    showNotification('Thanh toán thành công!', 'success');

    // Có thể hiển thị invoice PDF hoặc redirect
    // window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');

  } catch (error) {
    console.error('Error completing invoice:', error);
    showNotification(error.message || 'Lỗi khi thanh toán', 'error');
  }
}
```

#### API Endpoint:

**POST** `/api/v1/pos/invoices/{id}/complete?phuongThucThanhToan=TIEN_MAT`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "trangThai": "COMPLETED",  // ✅ Đã chuyển sang COMPLETED
    "phuongThucThanhToan": "TIEN_MAT",
    "tongTien": 50000,
    "thanhTien": 50000,
    "diemTichLuy": 50,  // ✅ Đã tích điểm
    ...
  }
}
```

---

### 5. Luồng Hủy đơn (Cancel PENDING Invoice)

**Mục tiêu:** Hủy đơn PENDING → CANCELLED.

**Các bước:**

#### Frontend:

```typescript
// User muốn hủy đơn PENDING
async function cancelPendingInvoice(invoiceId: number) {
  if (!confirm('Bạn có chắc muốn hủy đơn này?')) {
    return;
  }

  try {
    const response = await fetch(`/api/v1/pos/invoices/${invoiceId}/cancel-pending`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to cancel invoice');
    }

    const result = await response.json();
    
    // Invoice đã chuyển sang CANCELLED
    // - Không trừ tồn kho (vì chưa trừ từ đầu)
    // - Không trừ điểm (vì chưa tích điểm)

    showNotification('Đã hủy đơn hàng', 'success');

    // Reload danh sách đơn treo
    await showPendingOrders();

  } catch (error) {
    console.error('Error cancelling invoice:', error);
    showNotification('Lỗi khi hủy đơn hàng', 'error');
  }
}
```

#### API Endpoint:

**POST** `/api/v1/pos/invoices/{id}/cancel-pending`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "trangThai": "CANCELLED",  // ✅ Đã chuyển sang CANCELLED
    ...
  }
}
```

---

## 🎨 UI/UX RECOMMENDATIONS

### 1. Danh sách đơn treo (Pending Orders Modal)

**Hiển thị:**

| Thời gian | Mã đơn | Tổng tiền | Ghi chú | Nhân viên | Hành động |
|-----------|--------|-----------|---------|-----------|-----------|
| 14:30 | HD001 | 50,000 ₫ | Khách nghe điện thoại | Nguyễn Văn A | [Mở lại] [Hủy] |
| 14:15 | HD002 | 35,000 ₫ | Bàn 5 | Trần Thị B | [Mở lại] [Hủy] |

**Code Example:**

```typescript
function PendingOrdersModal({ isOpen, onClose, onResume }) {
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadPendingOrders();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Danh sách đơn treo</h2>
      <table>
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Mã đơn</th>
            <th>Tổng tiền</th>
            <th>Ghi chú</th>
            <th>Nhân viên</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pendingOrders.map(order => (
            <tr key={order.id}>
              <td>{formatDateTime(order.ngayTao)}</td>
              <td>{order.maHoaDon}</td>
              <td>{formatCurrency(order.thanhTien)}</td>
              <td>{order.ghiChu || '-'}</td>
              <td>{order.tenNhanVien}</td>
              <td>
                <button onClick={() => onResume(order.id)}>Mở lại</button>
                <button onClick={() => cancelOrder(order.id)}>Hủy</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}
```

### 2. Nút "Treo đơn" trên màn hình bán hàng

**Vị trí:** Bên cạnh nút "Thanh toán"

**Điều kiện hiển thị:**
- Giỏ hàng không rỗng
- Chưa có đơn đang được resume (currentInvoiceId === null)

**Code Example:**

```typescript
function PosScreen() {
  const [cart, setCart] = useState([]);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);

  return (
    <div>
      {/* Giỏ hàng */}
      <CartDisplay items={cart} />

      {/* Buttons */}
      <div className="actions">
        <button onClick={suspendOrder} disabled={cart.length === 0 || currentInvoiceId !== null}>
          Treo đơn
        </button>
        <button onClick={() => showPendingOrdersModal(true)}>
          Danh sách đơn treo
        </button>
        <button onClick={checkout} disabled={cart.length === 0}>
          Thanh toán
        </button>
      </div>

      {/* Badge hiển thị nếu đang resume đơn */}
      {currentInvoiceId && (
        <div className="resume-badge">
          Đang xử lý đơn: {currentInvoiceId}
          <button onClick={() => {
            setCurrentInvoiceId(null);
            setCart([]);
          }}>Hủy</button>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 STATE MANAGEMENT

### State cần quản lý:

```typescript
interface PosState {
  // Giỏ hàng hiện tại
  cart: CartItem[];
  
  // Đơn đang được resume (nếu có)
  currentInvoiceId: number | null;
  
  // Khách hàng đã chọn
  selectedCustomer: Customer | null;
  
  // Giảm giá
  discount: number;
  
  // Mã khuyến mãi
  promotionCode: string | null;
  
  // Ghi chú đơn hàng
  invoiceNote: string | null;
}
```

### Logic quan trọng:

```typescript
// Khi resume đơn
function resumeOrder(invoiceId: number) {
  // 1. Load invoice details
  // 2. Set cart từ invoice.chiTietHoaDons
  // 3. Set currentInvoiceId = invoiceId
  // 4. Set selectedCustomer, discount, etc.
}

// Khi thêm/sửa/xóa sản phẩm
function updateCart(newCart: CartItem[]) {
  setCart(newCart);
  
  // ✅ Nếu có currentInvoiceId, tự động update đơn PENDING
  if (currentInvoiceId) {
    updatePendingInvoice();
  }
}

// Khi thanh toán
async function checkout() {
  if (currentInvoiceId) {
    // Thanh toán đơn PENDING
    await completePendingInvoice(currentInvoiceId, paymentMethod);
  } else {
    // Tạo đơn mới
    await checkoutNewOrder();
  }
}
```

---

## ✅ CHECKLIST IMPLEMENTATION

### Frontend cần implement:

- [ ] **Nút "Treo đơn"** trên màn hình bán hàng
  - [ ] Kiểm tra giỏ hàng không rỗng
  - [ ] Popup nhập ghi chú (tùy chọn nhưng nên có)
  - [ ] Gọi API `/api/v1/pos/checkout/hold`
  - [ ] Xóa sạch giỏ hàng sau khi treo thành công
  - [ ] Thông báo thành công

- [ ] **Nút "Danh sách đơn treo"**
  - [ ] Gọi API `/api/v1/pos/invoices/pending`
  - [ ] Hiển thị modal với danh sách đơn PENDING
  - [ ] Hiển thị: Thời gian, Mã đơn, Tổng tiền, Ghi chú, Nhân viên
  - [ ] Có thể lọc theo nhân viên hiện tại (tùy chọn)

- [ ] **Nút "Mở lại" (Resume)**
  - [ ] Gọi API `/api/v1/pos/invoices/{id}/resume`
  - [ ] Load items vào giỏ hàng
  - [ ] Set `currentInvoiceId` để track đơn đang resume
  - [ ] Load customer, discount, promotion nếu có
  - [ ] Đóng modal danh sách

- [ ] **Logic cập nhật đơn PENDING**
  - [ ] Khi có `currentInvoiceId` và cart thay đổi → Gọi API `/api/v1/pos/invoices/{id}/update-pending`
  - [ ] Có thể tự động update hoặc có nút "Lưu thay đổi"
  - [ ] Hiển thị indicator khi đang update

- [ ] **Thanh toán đơn PENDING**
  - [ ] Kiểm tra `currentInvoiceId`
  - [ ] Nếu có → Gọi API `/api/v1/pos/invoices/{id}/complete`
  - [ ] Nếu không → Tạo đơn mới như bình thường
  - [ ] Reset tất cả state sau khi thanh toán thành công

- [ ] **Hủy đơn PENDING**
  - [ ] Nút "Hủy" trong modal danh sách
  - [ ] Confirm dialog
  - [ ] Gọi API `/api/v1/pos/invoices/{id}/cancel-pending`
  - [ ] Reload danh sách sau khi hủy

- [ ] **UI Indicators**
  - [ ] Badge hiển thị khi đang resume đơn
  - [ ] Disable nút "Treo đơn" khi đang resume
  - [ ] Hiển thị loading state khi đang update

---

## 🔍 ERROR HANDLING

### Các lỗi có thể xảy ra:

```typescript
// 1. Đơn không còn PENDING (đã bị thanh toán hoặc hủy)
if (response.status === 400 && error.message.includes('trạng thái')) {
  showNotification('Đơn hàng không còn ở trạng thái treo', 'warning');
  // Reload danh sách đơn treo
  await showPendingOrders();
}

// 2. Tồn kho không đủ khi thanh toán
if (response.status === 400 && error.message.includes('tồn kho')) {
  showNotification('Sản phẩm không đủ tồn kho. Vui lòng kiểm tra lại.', 'error');
}

// 3. Network error
try {
  await suspendOrder();
} catch (error) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    showNotification('Lỗi kết nối. Vui lòng thử lại.', 'error');
  }
}
```

---

## 📝 NOTES

### Quan trọng:

1. **Ghi chú (ghiChu)**: Nên bắt buộc hoặc khuyến khích user nhập để dễ tìm lại đơn
2. **currentInvoiceId**: Phải track để biết đang resume đơn nào
3. **Auto-update**: Có thể tự động update khi cart thay đổi, hoặc có nút "Lưu thay đổi"
4. **Validation**: Kiểm tra giỏ hàng không rỗng trước khi treo
5. **State management**: Reset `currentInvoiceId` sau khi thanh toán/hủy thành công

### Best Practices:

- ✅ Luôn validate giỏ hàng trước khi treo
- ✅ Hiển thị loading state khi đang xử lý
- ✅ Thông báo rõ ràng cho user (success/error)
- ✅ Auto-refresh danh sách đơn treo sau khi thao tác
- ✅ Disable nút "Treo đơn" khi đang resume một đơn khác

---

## 🔗 RELATED DOCUMENTS

- [TREO_BILL_FEATURE.md](TREO_BILL_FEATURE.md) - Backend documentation
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Full API reference

---

**Happy coding! 🚀**

