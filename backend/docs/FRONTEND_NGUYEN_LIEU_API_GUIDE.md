# 📋 HƯỚNG DẪN API XUẤT NHẬP NGUYÊN LIỆU - FRONTEND

**Ngày cập nhật:** 2025-12-14  
**Mục đích:** Hướng dẫn Frontend implement các API xuất nhập nguyên liệu

---

## 📌 TỔNG QUAN

Backend hỗ trợ 2 loại API:
1. **Single Item API** - Nhập/xuất 1 nguyên liệu mỗi lần
2. **Batch API** - Nhập/xuất nhiều nguyên liệu trong 1 request ⭐ **MỚI**

Và chức năng:
3. **Delete Phiếu** - Xóa phiếu nhập/xuất và tự động rollback tồn kho ⭐ **MỚI**

---

## 🔵 1. BATCH NHẬP NGUYÊN LIỆU

### Endpoint
```
POST /api/v1/admin/nguyen-lieu/nhap/batch
```

### Request Body
```typescript
interface BatchNhapXuatRequest {
  nhanVienId: number;           // Required - ID nhân viên
  items: Array<{                 // Required - Danh sách nguyên liệu (ít nhất 1 item)
    nguyenLieuId: number;        // Required - ID nguyên liệu
    soLuong: number;             // Required - Số lượng (phải > 0)
    ghiChu?: string;             // Optional - Ghi chú riêng cho item
  }>;
  ghiChu?: string;               // Optional - Ghi chú chung cho toàn bộ phiếu
  maPhieu?: string;              // Optional - Mã phiếu base (nếu bỏ trống/null thì backend tự động generate)
}
```

### Example Request
```typescript
const request: BatchNhapXuatRequest = {
  nhanVienId: 1,
  items: [
    {
      nguyenLieuId: 1,
      soLuong: 10,
      ghiChu: "Nhập từ nhà cung cấp A"
    },
    {
      nguyenLieuId: 2,
      soLuong: 20,
      ghiChu: "Nhập từ nhà cung cấp B"
    }
  ],
  ghiChu: "Đơn nhập hàng ngày 14/12/2025",
  // maPhieu không cần gửi nếu muốn tự động generate
  // maPhieu: "NHAP-20251214-ABC123" // Optional - Nếu không gửi hoặc gửi null/empty, backend sẽ tự động tạo
};

const response = await fetch('/api/v1/admin/nguyen-lieu/nhap/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(request)
});
```

### Response
```typescript
{
  success: true,
  message: "Nhập 2 nguyên liệu thành công",
  data: null
}
```

### 📌 Cách hoạt động của `maPhieu` tự động:

**✅ Tự động generate khi bỏ trống:**
- Nếu `maPhieu` là `null`, `undefined`, hoặc chuỗi rỗng (`""`) → Backend tự động generate
- Format: `NHAP-{YYYYMMDDHHMMSS}-{UUID8chars}` (ví dụ: `NHAP-20251214032301-7C330F47`)

**✅ Mỗi item có `maPhieu` unique:**
- **Nếu chỉ có 1 item**: Dùng `maPhieu` trực tiếp (hoặc base nếu tự generate)
- **Nếu có nhiều items**: Thêm số thứ tự vào cuối
  - Item 1: `baseMaPhieu-1`
  - Item 2: `baseMaPhieu-2`
  - Item 3: `baseMaPhieu-3`

**✅ Đảm bảo tính duy nhất:**
- Nếu `maPhieu` trùng (hiếm khi xảy ra), backend sẽ tự động thêm random suffix
- Retry tối đa 10 lần để tạo `maPhieu` unique

**Ví dụ:**
```
Request không có maPhieu:
→ Backend generate base: NHAP-20251214032301-7C330F47
→ Item 1: NHAP-20251214032301-7C330F47-1
→ Item 2: NHAP-20251214032301-7C330F47-2

Request có maPhieu: "ABC123"
→ Item 1: ABC123-1
→ Item 2: ABC123-2
```

### React/TypeScript Example
```typescript
import { useState } from 'react';

interface BatchItem {
  nguyenLieuId: number;
  soLuong: number;
  ghiChu?: string;
}

function NhapKhoBatchForm() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [ghiChu, setGhiChu] = useState('');
  const [maPhieu, setMaPhieu] = useState('');

  const handleSubmit = async () => {
    const request = {
      nhanVienId: currentUser.id,
      items: items,
      ghiChu: ghiChu || undefined,
      maPhieu: maPhieu || undefined
    };

    try {
      const response = await fetch('/api/v1/admin/nguyen-lieu/nhap/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Nhập nguyên liệu thất bại');
      }

      const result = await response.json();
      alert(result.message || 'Nhập nguyên liệu thành công!');
      
      // Reset form
      setItems([]);
      setGhiChu('');
      setMaPhieu('');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Lỗi khi nhập nguyên liệu');
    }
  };

  const addItem = () => {
    setItems([...items, { nguyenLieuId: 0, soLuong: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div>
          <label>Mã phiếu (tùy chọn):</label>
          <input
            type="text"
            value={maPhieu}
            onChange={(e) => setMaPhieu(e.target.value)}
            placeholder="Để trống để backend tự động tạo mã phiếu"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Nếu bỏ trống, backend sẽ tự động tạo mã phiếu duy nhất cho mỗi item
          </p>
        </div>

      <div>
        <label>Ghi chú chung:</label>
        <textarea
          value={ghiChu}
          onChange={(e) => setGhiChu(e.target.value)}
          placeholder="Ghi chú cho toàn bộ phiếu"
        />
      </div>

      <div>
        <h3>Danh sách nguyên liệu:</h3>
        {items.map((item, index) => (
          <div key={index}>
            <select
              value={item.nguyenLieuId}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].nguyenLieuId = parseInt(e.target.value);
                setItems(newItems);
              }}
            >
              <option value={0}>Chọn nguyên liệu</option>
              {nguyenLieuList.map(nl => (
                <option key={nl.id} value={nl.id}>{nl.tenNguyenLieu}</option>
              ))}
            </select>

            <input
              type="number"
              value={item.soLuong}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].soLuong = parseInt(e.target.value) || 0;
                setItems(newItems);
              }}
              placeholder="Số lượng"
              min="1"
            />

            <input
              type="text"
              value={item.ghiChu || ''}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].ghiChu = e.target.value;
                setItems(newItems);
              }}
              placeholder="Ghi chú riêng"
            />

            <button type="button" onClick={() => removeItem(index)}>Xóa</button>
          </div>
        ))}
        <button type="button" onClick={addItem}>Thêm nguyên liệu</button>
      </div>

      <button type="submit" disabled={items.length === 0}>
        Nhập kho
      </button>
    </form>
  );
}
```

---

## 🔴 2. BATCH XUẤT NGUYÊN LIỆU

### Endpoint
```
POST /api/v1/admin/nguyen-lieu/xuat/batch
```

### Request Body
```typescript
// Tương tự như batch nhập
interface BatchNhapXuatRequest {
  nhanVienId: number;
  items: Array<{
    nguyenLieuId: number;
    soLuong: number;
    ghiChu?: string;
  }>;
  ghiChu?: string;
  maPhieu?: string;
}
```

### Lưu ý quan trọng:
- **Backend sẽ kiểm tra tồn kho TRƯỚC khi xử lý**
- Nếu có **bất kỳ item nào** không đủ tồn kho → **Throw error và KHÔNG xử lý item nào**
- Nên kiểm tra tồn kho ở frontend trước khi gửi request

### Example với validation
```typescript
async function xuatKhoBatch(request: BatchNhapXuatRequest) {
  // 1. Kiểm tra tồn kho trước
  for (const item of request.items) {
    const nguyenLieu = await getNguyenLieuById(item.nguyenLieuId);
    if (nguyenLieu.soLuong < item.soLuong) {
      throw new Error(
        `Nguyên liệu "${nguyenLieu.tenNguyenLieu}" không đủ tồn kho. ` +
        `Còn lại: ${nguyenLieu.soLuong}, yêu cầu: ${item.soLuong}`
      );
    }
  }

  // 2. Gửi request
  const response = await fetch('/api/v1/admin/nguyen-lieu/xuat/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Xuất nguyên liệu thất bại');
  }

  return await response.json();
}
```

### Response
```typescript
{
  success: true,
  message: "Xuất 2 nguyên liệu thành công",
  data: null
}
```

---

## 🗑️ 3. XÓA PHIẾU NHẬP/XUẤT

### Endpoint
```
DELETE /api/v1/admin/nguyen-lieu/phieu/{id}
```

### Request
```typescript
// Chỉ cần gửi DELETE request với ID của phiếu
// Không cần request body
```

### Response
```typescript
{
  success: true,
  message: "Xóa phiếu thành công. Tồn kho đã được rollback.",
  data: null
}
```

### React/TypeScript Example
```typescript
async function deletePhieu(phieuId: number, loaiPhieu: 'NHAP' | 'XUAT') {
  // Confirm trước khi xóa
  const confirmMessage = loaiPhieu === 'NHAP' 
    ? 'Bạn có chắc muốn xóa phiếu nhập này? Tồn kho sẽ được giảm lại.'
    : 'Bạn có chắc muốn xóa phiếu xuất này? Tồn kho sẽ được tăng lại.';

  if (!window.confirm(confirmMessage)) {
    return;
  }

  try {
    const response = await fetch(`/api/v1/admin/nguyen-lieu/phieu/${phieuId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Xóa phiếu thất bại');
    }

    const result = await response.json();
    alert(result.message || 'Xóa phiếu thành công!');
    
    // Reload danh sách phiếu
    loadDanhSachPhieu();
  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Lỗi khi xóa phiếu');
  }
}

// Sử dụng trong component
function PhieuList({ phieuList, onReload }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Mã phiếu</th>
          <th>Nguyên liệu</th>
          <th>Số lượng</th>
          <th>Loại</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {phieuList.map(phieu => (
          <tr key={phieu.id}>
            <td>{phieu.maPhieu}</td>
            <td>{phieu.tenNguyenLieu}</td>
            <td>{phieu.soLuong}</td>
            <td>{phieu.loaiPhieu === 'NHAP' ? 'Nhập' : 'Xuất'}</td>
            <td>
              <button 
                onClick={() => deletePhieu(phieu.id, phieu.loaiPhieu)}
                className="btn-delete"
              >
                Xóa
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Logic Rollback tự động:

Backend sẽ tự động rollback tồn kho khi xóa phiếu:

| Loại phiếu | Hành động rollback |
|------------|-------------------|
| **NHAP** | Trừ lại số lượng từ tồn kho |
| **XUAT** | Cộng lại số lượng vào tồn kho |
| **DIEU_CHINH** | Khôi phục số lượng cũ |

**Ví dụ:**
- Nhập 10 nguyên liệu → Tồn kho tăng 10
- Xóa phiếu nhập → Tồn kho giảm 10 (về như cũ)
- Xuất 5 nguyên liệu → Tồn kho giảm 5
- Xóa phiếu xuất → Tồn kho tăng 5 (về như cũ)

---

## 🔄 4. SINGLE ITEM API (BACKWARD COMPATIBLE)

### Nhập nguyên liệu (single)
```
POST /api/v1/admin/nguyen-lieu/nhap
```

### Request Body
```typescript
{
  nguyenLieuId: number;    // Required
  soLuong: number;         // Required, > 0
  nhanVienId: number;      // Required
  ghiChu?: string;         // Optional
}
```

### Xuất nguyên liệu (single)
```
POST /api/v1/admin/nguyen-lieu/xuat
```

### Request Body
```typescript
// Tương tự như nhập
{
  nguyenLieuId: number;
  soLuong: number;
  nhanVienId: number;
  ghiChu?: string;
}
```

**Lưu ý:** Các API single item vẫn hoạt động bình thường, chỉ dùng khi cần nhập/xuất 1 nguyên liệu.

---

## 📊 5. API LẤY LỊCH SỬ

### Lịch sử nhập kho
```
GET /api/v1/admin/nguyen-lieu/nhap/history?page=0&size=20
```

### Lịch sử xuất kho
```
GET /api/v1/admin/nguyen-lieu/xuat/history?page=0&size=20
```

### Tất cả giao dịch
```
GET /api/v1/admin/nguyen-lieu/transactions?page=0&size=20
```

### Response Format
```typescript
{
  success: true,
  data: {
    content: [
      {
        id: 1,
        maPhieu: "NHAP-20251214123456-ABC123",
        nguyenLieuId: 1,
        tenNguyenLieu: "Cà phê Arabica",
        maNguyenLieu: "NL001",
        ngayNhapXuat: "2025-12-14T12:34:56",
        loaiPhieu: "NHAP",  // NHAP, XUAT, DIEU_CHINH
        soLuong: 10,
        soLuongTruoc: 50,
        soLuongConLai: 60,
        nhanVienId: 1,
        tenNhanVien: "Nguyễn Văn A",
        ghiChu: "Nhập từ nhà cung cấp"
      }
    ],
    page: 0,
    size: 20,
    totalElements: 100,
    totalPages: 5
  }
}
```

---

## ⚠️ 6. ERROR HANDLING

### Các lỗi thường gặp:

#### 1. Validation Error (400)
```typescript
{
  success: false,
  message: "Nguyên liệu ID không được để trống",
  errorCode: "VALIDATION_ERROR"
}
```

#### 2. Insufficient Stock (400)
```typescript
{
  success: false,
  message: "Nguyên liệu 'Cà phê Arabica' không đủ số lượng. Còn lại: 5, yêu cầu: 10",
  errorCode: "INSUFFICIENT_STOCK"
}
```

#### 3. Resource Not Found (404)
```typescript
{
  success: false,
  message: "Không tìm thấy nguyên liệu với ID: 999",
  errorCode: "RESOURCE_NOT_FOUND"
}
```

#### 4. Duplicate MaPhieu (400)
```typescript
{
  success: false,
  message: "Mã phiếu đã tồn tại: NHAP-20251214-ABC123",
  errorCode: "DUPLICATE_BARCODE"
}
```

### Error Handling Example
```typescript
async function handleApiCall(apiCall: () => Promise<Response>) {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (error.errorCode) {
        case 'INSUFFICIENT_STOCK':
          alert(`⚠️ Không đủ tồn kho: ${error.message}`);
          break;
        case 'VALIDATION_ERROR':
          alert(`❌ Dữ liệu không hợp lệ: ${error.message}`);
          break;
        case 'RESOURCE_NOT_FOUND':
          alert(`❌ Không tìm thấy: ${error.message}`);
          break;
        default:
          alert(`❌ Lỗi: ${error.message || 'Có lỗi xảy ra'}`);
      }
      
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## ✅ 7. BEST PRACTICES

### 1. Luôn validate ở Frontend trước khi gửi request

```typescript
function validateBatchRequest(request: BatchNhapXuatRequest): string | null {
  if (!request.nhanVienId) {
    return 'Nhân viên ID không được để trống';
  }
  
  if (!request.items || request.items.length === 0) {
    return 'Danh sách nguyên liệu không được trống';
  }
  
  for (const item of request.items) {
    if (!item.nguyenLieuId || item.nguyenLieuId <= 0) {
      return 'Vui lòng chọn nguyên liệu';
    }
    
    if (!item.soLuong || item.soLuong <= 0) {
      return 'Số lượng phải lớn hơn 0';
    }
  }
  
  return null; // Valid
}
```

### 2. Kiểm tra tồn kho trước khi xuất (batch)

```typescript
async function validateStockBeforeXuat(items: BatchItem[]): Promise<string | null> {
  for (const item of items) {
    const nguyenLieu = await getNguyenLieuById(item.nguyenLieuId);
    
    if (nguyenLieu.soLuong < item.soLuong) {
      return `Nguyên liệu "${nguyenLieu.tenNguyenLieu}" không đủ tồn kho. ` +
             `Còn lại: ${nguyenLieu.soLuong}, yêu cầu: ${item.soLuong}`;
    }
  }
  
  return null; // All items have sufficient stock
}
```

### 3. Confirm trước khi xóa phiếu

```typescript
function confirmDelete(phieu: PhieuDTO): boolean {
  const message = phieu.loaiPhieu === 'NHAP'
    ? `Bạn có chắc muốn xóa phiếu nhập "${phieu.maPhieu}"?\n` +
      `Tồn kho của "${phieu.tenNguyenLieu}" sẽ giảm ${phieu.soLuong}.`
    : `Bạn có chắc muốn xóa phiếu xuất "${phieu.maPhieu}"?\n` +
      `Tồn kho của "${phieu.tenNguyenLieu}" sẽ tăng ${phieu.soLuong}.`;
  
  return window.confirm(message);
}
```

### 4. Reload danh sách sau khi thao tác thành công

```typescript
async function nhapKhoAndReload(request: BatchNhapXuatRequest) {
  try {
    await nhapKhoBatch(request);
    
    // Reload danh sách
    await loadDanhSachPhieu();
    await loadTonKho();
    
    // Show success message
    showSuccessMessage('Nhập kho thành công!');
  } catch (error) {
    showErrorMessage(error.message);
  }
}
```

### 5. Sử dụng loading state

```typescript
const [loading, setLoading] = useState(false);

async function handleSubmit() {
  setLoading(true);
  try {
    await nhapKhoBatch(request);
  } finally {
    setLoading(false);
  }
}

return (
  <button type="submit" disabled={loading}>
    {loading ? 'Đang xử lý...' : 'Nhập kho'}
  </button>
);
```

---

## 📝 8. CHECKLIST IMPLEMENTATION

- [ ] **Batch Nhập:**
  - [ ] Form nhập nhiều nguyên liệu
  - [ ] Validation input (số lượng > 0, chọn nguyên liệu)
  - [ ] Hỗ trợ `maPhieu` tùy chọn
  - [ ] Error handling đầy đủ
  - [ ] Reload danh sách sau khi nhập thành công

- [ ] **Batch Xuất:**
  - [ ] Form xuất nhiều nguyên liệu
  - [ ] Kiểm tra tồn kho trước khi xuất
  - [ ] Validation và error handling
  - [ ] Reload danh sách sau khi xuất thành công

- [ ] **Delete Phiếu:**
  - [ ] Nút xóa trong danh sách phiếu
  - [ ] Confirm dialog trước khi xóa
  - [ ] Hiển thị thông báo rollback tồn kho
  - [ ] Reload danh sách sau khi xóa thành công

- [ ] **UI/UX:**
  - [ ] Loading states
  - [ ] Success/Error messages
  - [ ] Disable buttons khi đang xử lý
  - [ ] Responsive design

---

## 🎯 9. EXAMPLE: COMPLETE BATCH FORM COMPONENT

```typescript
import React, { useState, useEffect } from 'react';

interface NguyenLieu {
  id: number;
  tenNguyenLieu: string;
  maNguyenLieu: string;
  soLuong: number;
}

interface BatchItem {
  nguyenLieuId: number;
  soLuong: number;
  ghiChu?: string;
}

function NhapKhoBatchPage() {
  const [nguyenLieuList, setNguyenLieuList] = useState<NguyenLieu[]>([]);
  const [items, setItems] = useState<BatchItem[]>([{ nguyenLieuId: 0, soLuong: 0 }]);
  const [ghiChu, setGhiChu] = useState('');
  const [maPhieu, setMaPhieu] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNguyenLieuList();
  }, []);

  const loadNguyenLieuList = async () => {
    try {
      const response = await fetch('/api/v1/admin/nguyen-lieu?page=0&size=100');
      const data = await response.json();
      setNguyenLieuList(data.data.content);
    } catch (error) {
      console.error('Error loading nguyen lieu:', error);
    }
  };

  const addItem = () => {
    setItems([...items, { nguyenLieuId: 0, soLuong: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof BatchItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const validate = (): string | null => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.nguyenLieuId || item.nguyenLieuId <= 0) {
        return `Dòng ${i + 1}: Vui lòng chọn nguyên liệu`;
      }
      if (!item.soLuong || item.soLuong <= 0) {
        return `Dòng ${i + 1}: Số lượng phải lớn hơn 0`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validate();
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);
    try {
      const request = {
        nhanVienId: currentUser.id,
        items: items.map(item => ({
          nguyenLieuId: item.nguyenLieuId,
          soLuong: item.soLuong,
          ghiChu: item.ghiChu || undefined
        })),
        ghiChu: ghiChu || undefined,
        // Chỉ gửi maPhieu nếu user đã nhập (không rỗng)
        // Nếu không gửi hoặc gửi null/empty → Backend tự động generate
        ...(maPhieu.trim() ? { maPhieu: maPhieu.trim() } : {})
      };

      const response = await fetch('/api/v1/admin/nguyen-lieu/nhap/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Nhập nguyên liệu thất bại');
      }

      const result = await response.json();
      alert(result.message || 'Nhập nguyên liệu thành công!');
      
      // Reset form
      setItems([{ nguyenLieuId: 0, soLuong: 0 }]);
      setGhiChu('');
      setMaPhieu('');
    } catch (error: any) {
      alert(error.message || 'Lỗi khi nhập nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nhap-kho-batch">
      <h2>Nhập kho nguyên liệu (Batch)</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Mã phiếu (tùy chọn):</label>
          <input
            type="text"
            value={maPhieu}
            onChange={(e) => setMaPhieu(e.target.value)}
            placeholder="Để trống để tự động tạo mã phiếu"
          />
        </div>

        <div className="form-group">
          <label>Ghi chú chung:</label>
          <textarea
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            placeholder="Ghi chú cho toàn bộ phiếu"
            rows={3}
          />
        </div>

        <div className="form-group">
          <h3>Danh sách nguyên liệu:</h3>
          <table>
            <thead>
              <tr>
                <th>Nguyên liệu</th>
                <th>Số lượng</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <select
                      value={item.nguyenLieuId}
                      onChange={(e) => updateItem(index, 'nguyenLieuId', parseInt(e.target.value))}
                      required
                    >
                      <option value={0}>Chọn nguyên liệu</option>
                      {nguyenLieuList.map(nl => (
                        <option key={nl.id} value={nl.id}>
                          {nl.tenNguyenLieu} ({nl.maNguyenLieu}) - Tồn: {nl.soLuong}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.soLuong}
                      onChange={(e) => updateItem(index, 'soLuong', parseInt(e.target.value) || 0)}
                      min="1"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.ghiChu || ''}
                      onChange={(e) => updateItem(index, 'ghiChu', e.target.value)}
                      placeholder="Ghi chú riêng"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addItem}>+ Thêm nguyên liệu</button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Nhập kho'}
        </button>
      </form>
    </div>
  );
}

export default NhapKhoBatchPage;
```

---

**Chúc bạn implement thành công! 🎉**

Nếu có thắc mắc, vui lòng liên hệ Backend team.

