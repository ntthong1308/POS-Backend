import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { X, Upload, Save, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { filesAPI } from '@/lib/api/files';
import { categoriesAPI, Category } from '@/lib/api/categories';
import { toast } from 'sonner';
import * as React from 'react';
import { productSchema, validateFormWithToast } from '@/lib/validation';
import { getFieldError } from '@/lib/validation/validate';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/utils/errorHandler';

interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
  editingProduct?: Product | null;
  onUpdate?: (productId: number, product: Partial<Product>) => void;
}

export default function AddProductDialog({ open, onClose, onSave, editingProduct, onUpdate }: AddProductDialogProps) {
  const [formData, setFormData] = useState({
    maSanPham: '',
    tenSanPham: '',
    moTa: '',
    giaBan: '',
    tonKho: '',
    donViTinh: 'Ly',
    trangThai: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    hinhAnh: '',
    danhMucId: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false); // Loading state khi đang lưu
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(''); // URL hiện tại khi edit
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const units = [
    { value: 'Ly', label: 'Ly' },
    { value: 'Cái', label: 'Cái' },
    { value: 'Phần', label: 'Phần' },
    { value: 'Tô', label: 'Tô' },
    { value: 'Kg', label: 'Kg' },
  ];

  // Load categories when dialog opens
  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoriesAPI.getAll({ page: 0, size: 100 });
      setCategories(response.content || []);
    } catch (error: unknown) {
      logger.error('Error loading categories:', error);
      // ✅ Standardized error handling với handleApiError utility
      const errorMessage = handleApiError(error, 'Không thể tải danh mục');
      toast.error(errorMessage);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Xử lý chọn file
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ chấp nhận file hình ảnh!');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File không được vượt quá 10MB!');
        return;
      }

      setSelectedFile(file);

      // Tạo preview từ file
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload file
  const handleUploadFile = async (): Promise<string | null> => {
    if (!selectedFile) {
      return formData.hinhAnh || null; // Trả về URL hiện tại nếu không có file mới
    }

    setUploading(true);
    try {
      const imageUrl = await filesAPI.uploadProductImage(selectedFile);
      setFormData(prev => ({ ...prev, hinhAnh: imageUrl }));
      setUploading(false);
      toast.success('Upload hình ảnh thành công!');
      return imageUrl;
    } catch (error: unknown) {
      logger.error('Upload error:', error);
      // ✅ Standardized error handling với handleApiError utility
      const errorMessage = handleApiError(error, 'Lỗi khi upload hình ảnh');
      toast.error(errorMessage);
      setUploading(false);
      return null;
    }
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    // Clear previous errors
    setValidationErrors({});

    // Prepare data for validation
    const productDataForValidation = {
      maSanPham: formData.maSanPham,
      tenSanPham: formData.tenSanPham,
      moTa: formData.moTa || undefined,
      giaBan: formData.giaBan,
      tonKho: formData.tonKho,
      donViTinh: formData.donViTinh,
      trangThai: formData.trangThai,
      hinhAnh: formData.hinhAnh || undefined,
      danhMucId: formData.danhMucId || undefined,
    };

    // Validate with schema
    const validation = validateFormWithToast(productSchema, productDataForValidation);
    if (!validation.success) {
      // Get errors for field display
      const result = productSchema.safeParse(productDataForValidation);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (path) {
            errors[path] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return;
    }

    // Upload file trước (nếu có file mới) và lấy URL
    let imageUrl: string | null = null;
    if (selectedFile) {
      imageUrl = await handleUploadFile();
      if (!imageUrl) {
        return; // Upload failed, stop submission
      }
    }

    // Use validated data
    const validatedData = validation.data!;

    // Helper function để normalize empty string thành null (theo hướng dẫn API)
    const normalizeField = (value: any): any => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
      }
      return value === undefined ? null : value;
    };

    // Tạo product object với required fields
    const productData: any = {
      maSanPham: validatedData.maSanPham.trim(),
      tenSanPham: validatedData.tenSanPham.trim(),
      giaBan: typeof validatedData.giaBan === 'number' ? validatedData.giaBan : Number(validatedData.giaBan),
      tonKho: typeof validatedData.tonKho === 'number' ? validatedData.tonKho : Number(validatedData.tonKho),
      trangThai: validatedData.trangThai,
    };

    // Normalize và thêm optional fields
    // Theo hướng dẫn: normalize empty string thành null
    if (validatedData.donViTinh) {
      const normalizedDonViTinh = normalizeField(validatedData.donViTinh);
      if (normalizedDonViTinh !== null) {
        productData.donViTinh = normalizedDonViTinh;
      }
    }

    if (validatedData.moTa) {
      const normalizedMoTa = normalizeField(validatedData.moTa);
      if (normalizedMoTa !== null) {
        productData.moTa = normalizedMoTa;
      }
    }

    if (imageUrl || validatedData.hinhAnh) {
      const normalizedHinhAnh = normalizeField(imageUrl || validatedData.hinhAnh);
      if (normalizedHinhAnh !== null) {
        productData.hinhAnh = normalizedHinhAnh;
      }
    }

    // Add danhMucId if selected
    if (validatedData.danhMucId) {
      productData.danhMucId = typeof validatedData.danhMucId === 'number' 
        ? validatedData.danhMucId 
        : Number(validatedData.danhMucId);
    }

    // QUAN TRỌNG: Xử lý barcode theo hướng dẫn API
    // - Nếu không có barcode: không gửi field hoặc gửi null
    // - Nếu có barcode: normalize empty string thành null, chỉ gửi nếu có giá trị hợp lệ
    // Lưu ý: Hiện tại form không có field barcode, nhưng để đảm bảo an toàn
    // Nếu có barcode trong validatedData, normalize nó
    if ('barcode' in validatedData) {
      const normalizedBarcode = normalizeField(validatedData.barcode);
      // Chỉ gửi barcode nếu có giá trị hợp lệ (không phải null)
      // Theo hướng dẫn: không gửi empty string, chỉ gửi null hoặc giá trị hợp lệ
      if (normalizedBarcode !== null && normalizedBarcode !== '') {
        productData.barcode = normalizedBarcode;
      }
      // Nếu normalizedBarcode === null, không gửi field (theo best practice)
    }

    // Loại bỏ các trường undefined (nhưng giữ null cho các optional fields nếu cần)
    // Theo hướng dẫn: không gửi undefined, nhưng có thể gửi null cho optional fields
    const cleanedProductData: any = {};
    Object.keys(productData).forEach(key => {
      const value = productData[key];
      // Chỉ thêm nếu không phải undefined
      // Giữ null cho các optional fields (backend sẽ xử lý)
      if (value !== undefined) {
        cleanedProductData[key] = value;
      }
    });

    // Log dữ liệu sẽ gửi lên (chỉ trong development)
    logger.debug('[AddProductDialog] Data to send:', cleanedProductData);

    const product: Omit<Product, 'id'> = cleanedProductData;

    // Set saving state
    setSaving(true);

    try {
      if (editingProduct && onUpdate) {
        await onUpdate(editingProduct.id, product);
      } else {
        await onSave(product);
      }
      // Reset form sau khi lưu thành công
      handleReset();
    } catch (error) {
      // Error đã được xử lý trong ProductsPage, nhưng cần re-throw để đảm bảo toast hiển thị
      console.error('Error saving product:', error);
      // Re-throw để ProductsPage có thể xử lý và hiển thị toast
      throw error;
    } finally {
      setSaving(false);
    }
  };


  const handleReset = () => {
    setFormData({
      maSanPham: '',
      tenSanPham: '',
      moTa: '',
      giaBan: '',
      tonKho: '',
      donViTinh: 'Ly',
      trangThai: 'ACTIVE',
      hinhAnh: '',
      danhMucId: '',
    });
    setPreviewImage('');
    setSelectedFile(null);
    setCurrentImageUrl('');
  };

  // Load editing product data
  useEffect(() => {
    if (open && editingProduct) {
      setFormData({
        maSanPham: editingProduct.maSanPham || '',
        tenSanPham: editingProduct.tenSanPham || '',
        moTa: editingProduct.moTa || '',
        giaBan: editingProduct.giaBan?.toString() || '',
        tonKho: editingProduct.tonKho?.toString() || '',
        donViTinh: editingProduct.donViTinh || 'Ly',
        trangThai: editingProduct.trangThai || 'ACTIVE',
        hinhAnh: editingProduct.hinhAnh || '',
        danhMucId: editingProduct.danhMucId?.toString() || '',
      });
      
      // Hiển thị hình ảnh hiện tại từ URL
      if (editingProduct.hinhAnh) {
        const imageUrl = filesAPI.getImageUrl(editingProduct.hinhAnh);
        setCurrentImageUrl(imageUrl);
        setPreviewImage(''); // Clear preview khi edit
      } else {
        setCurrentImageUrl('');
        setPreviewImage('');
      }
      setSelectedFile(null);
    } else if (open && !editingProduct) {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingProduct]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!formData.maSanPham || !formData.tenSanPham || !formData.giaBan || !formData.tonKho || uploading || saving}
            >
              {uploading || saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? 'Đang upload...' : (editingProduct ? 'Đang cập nhật...' : 'Đang tạo...')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                </>
              )}
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin sản phẩm</h3>
                <p className="text-sm text-gray-600 mb-6">Nhập thông tin chi tiết về sản phẩm</p>

                <div className="space-y-4">
                  {/* Mã sản phẩm */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="VD: CF001"
                      value={formData.maSanPham}
                      onChange={(e) => setFormData({ ...formData, maSanPham: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  {/* Tên sản phẩm */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="VD: Cà phê đen đá"
                      value={formData.tenSanPham}
                      onChange={(e) => setFormData({ ...formData, tenSanPham: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  {/* Mô tả */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      placeholder="Mô tả chi tiết về sản phẩm..."
                      value={formData.moTa}
                      onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                    />
                  </div>

                  {/* Giá bán và Tồn kho */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá bán (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="25000"
                        value={formData.giaBan}
                        onChange={(e) => setFormData({ ...formData, giaBan: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tồn kho <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={formData.tonKho}
                        onChange={(e) => setFormData({ ...formData, tonKho: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Danh mục */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục
                    </label>
                    <select
                      value={formData.danhMucId}
                      onChange={(e) => setFormData({ ...formData, danhMucId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={loadingCategories}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.tenDanhMuc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Đơn vị tính */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đơn vị tính
                    </label>
                    <select
                      value={formData.donViTinh}
                      onChange={(e) => setFormData({ ...formData, donViTinh: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {units.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Trạng thái */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={formData.trangThai}
                      onChange={(e) => setFormData({ ...formData, trangThai: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="ACTIVE">Đang bán</option>
                      <option value="INACTIVE">Tạm ngưng</option>
                    </select>
                  </div>

                  {/* Upload Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh sản phẩm
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="image-upload"
                        className={cn(
                          "cursor-pointer flex flex-col items-center gap-2",
                          uploading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                            <p className="text-sm text-gray-600">Đang upload...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Tải lên hình ảnh, hoặc{' '}
                              <span className="text-orange-500 hover:text-orange-600">chọn từ thư viện</span>
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG, GIF tối đa 10MB</p>
                          </>
                        )}
                      </label>
                    </div>
                    
                    {/* Preview khi chọn file mới */}
                    {previewImage && (
                      <div className="mt-4 relative">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setPreviewImage('');
                            setSelectedFile(null);
                            // Giữ lại URL hiện tại nếu đang edit
                            if (editingProduct && editingProduct.hinhAnh) {
                              setCurrentImageUrl(filesAPI.getImageUrl(editingProduct.hinhAnh));
                            }
                          }}
                          className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
                          disabled={uploading}
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    )}

                    {/* Hiển thị hình ảnh hiện tại (khi edit và không có preview) */}
                    {currentImageUrl && !previewImage && (
                      <div className="mt-4 relative">
                        <img
                          src={currentImageUrl}
                          alt="Current"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={() => {
                            // Nếu load lỗi, ẩn hình ảnh
                            setCurrentImageUrl('');
                          }}
                        />
                        <button
                          onClick={() => {
                            setCurrentImageUrl('');
                            setFormData(prev => ({ ...prev, hinhAnh: '' }));
                          }}
                          className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
                          disabled={uploading}
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Xem trước sản phẩm</h3>
                <p className="text-sm text-gray-600 mb-6">Xem trước cách sản phẩm sẽ hiển thị</p>

                {/* Preview Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  {/* Product Image */}
                  <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : currentImageUrl ? (
                      <img
                        src={currentImageUrl}
                        alt="Current"
                        className="w-full h-full object-cover"
                        onError={() => {
                          // Nếu load lỗi, hiển thị placeholder
                          setCurrentImageUrl('');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-16 h-16" />
                      </div>
                    )}
                    {formData.trangThai === 'ACTIVE' && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Đang bán
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {formData.tenSanPham || 'Tên sản phẩm'}
                      </h4>
                      <p className="text-xs text-gray-500">SKU: {formData.maSanPham || 'Mã sản phẩm'}</p>
                    </div>

                    {formData.donViTinh && (
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {formData.donViTinh}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Giá bán:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formData.giaBan ? `${Number(formData.giaBan).toLocaleString('vi-VN')}₫` : '0₫'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Tồn kho:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formData.tonKho || '0'} {formData.donViTinh}
                      </span>
                    </div>

                    {formData.moTa && (
                      <p className="text-xs text-gray-600 line-clamp-2">{formData.moTa}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
