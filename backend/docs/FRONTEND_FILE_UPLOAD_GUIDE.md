# Hướng Dẫn Tích Hợp File Upload cho Frontend

## 📋 Tổng Quan

Backend đã hỗ trợ upload file hình ảnh thay vì lưu base64. Frontend cần thay đổi để:
1. Upload file trước khi tạo/cập nhật sản phẩm
2. Lưu URL trả về vào field `hinhAnh` của ProductDTO
3. Hiển thị hình ảnh từ URL

---

## 🔗 API Endpoints

### Upload Hình Ảnh Sản Phẩm
```
POST /api/v1/files/products/upload
Content-Type: multipart/form-data

Request:
- file: File (image file, max 10MB)

Response:
{
  "success": true,
  "data": "/uploads/products/550e8400-e29b-41d4-a716-446655440000.jpg",
  "message": null,
  "error": null
}
```

### Base URL
- Development: `http://localhost:8081`
- Production: (cấu hình theo môi trường)

### Full URL để hiển thị hình ảnh
- Development: `http://localhost:8081/uploads/products/550e8400-e29b-41d4-a716-446655440000.jpg`
- Production: `https://your-domain.com/uploads/products/550e8400-e29b-41d4-a716-446655440000.jpg`

---

## 💻 Ví Dụ Code

### 1. React với Hooks

```jsx
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

function ProductForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    tenSanPham: '',
    giaBan: '',
    tonKho: '',
    hinhAnh: '', // Sẽ lưu URL sau khi upload
    // ... other fields
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Chỉ chấp nhận file hình ảnh!');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File không được vượt quá 10MB!');
        return;
      }

      setSelectedFile(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) {
      return null;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/files/products/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        const imageUrl = response.data.data;
        setFormData(prev => ({ ...prev, hinhAnh: imageUrl }));
        setUploading(false);
        return imageUrl;
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Lỗi khi upload hình ảnh: ' + (error.response?.data?.message || error.message));
      setUploading(false);
      return null;
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload file trước (nếu có file mới)
    if (selectedFile) {
      const imageUrl = await handleUpload();
      if (!imageUrl) {
        return; // Upload failed, stop submission
      }
    }

    // Gửi dữ liệu sản phẩm
    try {
      await onSubmit({
        ...formData,
        giaBan: parseFloat(formData.giaBan),
        tonKho: parseInt(formData.tonKho),
      });
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* File input */}
      <div>
        <label>Hình ảnh sản phẩm</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && <p>Đang upload...</p>}
        
        {/* Preview */}
        {previewUrl && (
          <div>
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ maxWidth: '200px', maxHeight: '200px' }}
            />
          </div>
        )}

        {/* Hiển thị hình ảnh hiện tại (khi edit) */}
        {formData.hinhAnh && !previewUrl && (
          <div>
            <img 
              src={`${API_BASE_URL}${formData.hinhAnh}`}
              alt="Current"
              style={{ maxWidth: '200px', maxHeight: '200px' }}
            />
          </div>
        )}
      </div>

      {/* Other form fields */}
      <input
        type="text"
        placeholder="Tên sản phẩm"
        value={formData.tenSanPham}
        onChange={(e) => setFormData(prev => ({ ...prev, tenSanPham: e.target.value }))}
        required
      />

      {/* ... other fields ... */}

      <button type="submit" disabled={uploading}>
        {uploading ? 'Đang upload...' : 'Lưu'}
      </button>
    </form>
  );
}
```

---

### 2. Vue 3 với Composition API

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- File input -->
    <div>
      <label>Hình ảnh sản phẩm</label>
      <input
        type="file"
        accept="image/*"
        @change="handleFileChange"
        :disabled="uploading"
      />
      <p v-if="uploading">Đang upload...</p>

      <!-- Preview -->
      <img
        v-if="previewUrl"
        :src="previewUrl"
        alt="Preview"
        style="max-width: 200px; max-height: 200px;"
      />

      <!-- Current image (when editing) -->
      <img
        v-if="formData.hinhAnh && !previewUrl"
        :src="`${API_BASE_URL}${formData.hinhAnh}`"
        alt="Current"
        style="max-width: 200px; max-height: 200px;"
      />
    </div>

    <!-- Other form fields -->
    <input
      v-model="formData.tenSanPham"
      type="text"
      placeholder="Tên sản phẩm"
      required
    />

    <button type="submit" :disabled="uploading">
      {{ uploading ? 'Đang upload...' : 'Lưu' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

const formData = ref({
  tenSanPham: '',
  giaBan: '',
  tonKho: '',
  hinhAnh: '',
  // ... other fields
});

const selectedFile = ref(null);
const previewUrl = ref(null);
const uploading = ref(false);

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate
    if (!file.type.startsWith('image/')) {
      alert('Chỉ chấp nhận file hình ảnh!');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File không được vượt quá 10MB!');
      return;
    }

    selectedFile.value = file;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      previewUrl.value = reader.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleUpload = async () => {
  if (!selectedFile.value) return null;

  uploading.value = true;
  try {
    const formDataUpload = new FormData();
    formDataUpload.append('file', selectedFile.value);

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/files/products/upload`,
      formDataUpload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      const imageUrl = response.data.data;
      formData.value.hinhAnh = imageUrl;
      uploading.value = false;
      return imageUrl;
    } else {
      throw new Error(response.data.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Lỗi khi upload hình ảnh: ' + (error.response?.data?.message || error.message));
    uploading.value = false;
    return null;
  }
};

const handleSubmit = async () => {
  // Upload file trước (nếu có file mới)
  if (selectedFile.value) {
    const imageUrl = await handleUpload();
    if (!imageUrl) return;
  }

  // Submit form data
  try {
    await axios.post(`${API_BASE_URL}/api/v1/admin/products`, {
      ...formData.value,
      giaBan: parseFloat(formData.value.giaBan),
      tonKho: parseInt(formData.value.tonKho),
    });
    alert('Tạo sản phẩm thành công!');
  } catch (error) {
    console.error('Submit error:', error);
    alert('Lỗi khi tạo sản phẩm: ' + (error.response?.data?.message || error.message));
  }
};
</script>
```

---

### 3. Angular với Reactive Forms

```typescript
// product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  readonly API_BASE_URL = environment.apiUrl || 'http://localhost:8081';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.productForm = this.fb.group({
      tenSanPham: ['', Validators.required],
      giaBan: ['', [Validators.required, Validators.min(0)]],
      tonKho: ['', [Validators.required, Validators.min(0)]],
      hinhAnh: [''], // URL sẽ được set sau khi upload
      // ... other fields
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate
      if (!file.type.startsWith('image/')) {
        alert('Chỉ chấp nhận file hình ảnh!');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File không được vượt quá 10MB!');
        return;
      }

      this.selectedFile = file;

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadFile(): Promise<string | null> {
    if (!this.selectedFile) return null;

    this.uploading = true;
    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const response: any = await this.http
        .post(`${this.API_BASE_URL}/api/v1/files/products/upload`, formData)
        .toPromise();

      if (response.success) {
        const imageUrl = response.data;
        this.productForm.patchValue({ hinhAnh: imageUrl });
        this.uploading = false;
        return imageUrl;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Lỗi khi upload hình ảnh: ' + (error.error?.message || error.message));
      this.uploading = false;
      return null;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      return;
    }

    // Upload file trước (nếu có file mới)
    if (this.selectedFile) {
      const imageUrl = await this.uploadFile();
      if (!imageUrl) return;
    }

    // Submit form
    try {
      const productData = {
        ...this.productForm.value,
        giaBan: parseFloat(this.productForm.value.giaBan),
        tonKho: parseInt(this.productForm.value.tonKho),
      };

      await this.http
        .post(`${this.API_BASE_URL}/api/v1/admin/products`, productData)
        .toPromise();

      alert('Tạo sản phẩm thành công!');
    } catch (error: any) {
      console.error('Submit error:', error);
      alert('Lỗi khi tạo sản phẩm: ' + (error.error?.message || error.message));
    }
  }

  getImageUrl(): string {
    const hinhAnh = this.productForm.get('hinhAnh')?.value;
    if (hinhAnh) {
      return `${this.API_BASE_URL}${hinhAnh}`;
    }
    return '';
  }
}
```

```html
<!-- product-form.component.html -->
<form [formGroup]="productForm" (ngSubmit)="onSubmit()">
  <!-- File input -->
  <div>
    <label>Hình ảnh sản phẩm</label>
    <input
      type="file"
      accept="image/*"
      (change)="onFileSelected($event)"
      [disabled]="uploading"
    />
    <p *ngIf="uploading">Đang upload...</p>

    <!-- Preview -->
    <img
      *ngIf="previewUrl"
      [src]="previewUrl"
      alt="Preview"
      style="max-width: 200px; max-height: 200px;"
    />

    <!-- Current image (when editing) -->
    <img
      *ngIf="getImageUrl() && !previewUrl"
      [src]="getImageUrl()"
      alt="Current"
      style="max-width: 200px; max-height: 200px;"
    />
  </div>

  <!-- Other form fields -->
  <input
    formControlName="tenSanPham"
    type="text"
    placeholder="Tên sản phẩm"
  />

  <button type="submit" [disabled]="uploading || productForm.invalid">
    {{ uploading ? 'Đang upload...' : 'Lưu' }}
  </button>
</form>
```

---

## 🔄 Workflow Tích Hợp

### Khi Tạo Sản Phẩm Mới:
1. User chọn file hình ảnh
2. Frontend hiển thị preview
3. User điền form và submit
4. Frontend upload file trước → nhận URL
5. Frontend gửi ProductDTO với `hinhAnh` = URL vừa nhận

### Khi Cập Nhật Sản Phẩm:
1. Load dữ liệu sản phẩm hiện tại (có `hinhAnh` URL)
2. Hiển thị hình ảnh từ URL
3. Nếu user chọn file mới:
   - Upload file mới → nhận URL mới
   - Cập nhật `hinhAnh` với URL mới
4. Nếu user không chọn file mới:
   - Giữ nguyên `hinhAnh` hiện tại
5. Submit form với `hinhAnh` đã cập nhật

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Validation File
- ✅ Chỉ chấp nhận file hình ảnh (`image/*`)
- ✅ Max size: 10MB
- ✅ Validate trước khi upload để tránh lãng phí bandwidth

### 2. Error Handling
- Xử lý lỗi upload (network, server error, etc.)
- Hiển thị thông báo lỗi rõ ràng cho user
- Không submit form nếu upload thất bại

### 3. Loading States
- Hiển thị loading indicator khi đang upload
- Disable form khi đang upload
- Prevent multiple uploads cùng lúc

### 4. URL Handling
- Backend trả về relative URL: `/uploads/products/abc123.jpg`
- Frontend cần thêm base URL để hiển thị: `http://localhost:8081/uploads/products/abc123.jpg`
- Lưu relative URL vào database (không lưu full URL)

### 5. CORS
- Backend đã cấu hình CORS cho `http://localhost:5173` (Vite)
- Nếu dùng port khác, cần cập nhật `SecurityConfig.java`

---

## 🧪 Testing

### Test Cases:
1. ✅ Upload file hợp lệ (jpg, png, gif)
2. ✅ Upload file quá lớn (>10MB) → Error
3. ✅ Upload file không phải image → Error
4. ✅ Upload thành công → Nhận URL
5. ✅ Tạo sản phẩm với URL từ upload
6. ✅ Cập nhật sản phẩm với hình ảnh mới
7. ✅ Cập nhật sản phẩm không thay đổi hình ảnh
8. ✅ Hiển thị hình ảnh từ URL

---

## 📝 Checklist Tích Hợp

- [ ] Thêm file input vào form tạo/sửa sản phẩm
- [ ] Implement upload function
- [ ] Validate file type và size
- [ ] Hiển thị preview trước khi upload
- [ ] Upload file trước khi submit form
- [ ] Lưu URL vào field `hinhAnh`
- [ ] Hiển thị hình ảnh từ URL (khi edit)
- [ ] Xử lý lỗi upload
- [ ] Loading states
- [ ] Test các trường hợp edge cases

---

## 🔗 Tài Liệu Liên Quan

- [FRONTEND_API_REFERENCE.md](./FRONTEND_API_REFERENCE.md) - Tài liệu API đầy đủ
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Swagger documentation

---

## 💡 Tips

1. **Optimize Images**: Nén hình ảnh trước khi upload để giảm kích thước file
2. **Progress Bar**: Có thể thêm progress bar cho upload lớn
3. **Image Cropping**: Có thể thêm tính năng crop hình ảnh trước khi upload
4. **Multiple Images**: Hiện tại chỉ hỗ trợ 1 hình ảnh, có thể mở rộng sau
5. **Cloud Storage**: Có thể migrate sang S3/Cloudinary sau nếu cần scale

---

**Chúc bạn tích hợp thành công! 🚀**

