import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '@/lib/types';
import { ArrowLeft, Edit, MoreVertical, Image as ImageIcon, Package, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { filesAPI } from '@/lib/api/files';
import { productsAPI } from '@/lib/api/products';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productId = Number(id);
        if (isNaN(productId)) {
          setProduct(null);
          return;
        }

        const productData = await productsAPI.getById(productId);
        setProduct(productData);
      } catch (error: any) {
        console.error('Error loading product:', error);
        toast.error('Không thể tải thông tin sản phẩm');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Hết hàng', color: 'text-red-600', bgColor: 'bg-red-50', level: 0 };
    if (stock < 20) return { label: 'Thấp', color: 'text-red-600', bgColor: 'bg-red-50', level: 33 };
    if (stock < 50) return { label: 'Trung bình', color: 'text-orange-600', bgColor: 'bg-orange-50', level: 66 };
    return { label: 'Cao', color: 'text-green-600', bgColor: 'bg-green-50', level: 100 };
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
        <p className="text-gray-600 mb-4">Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
        <Button onClick={() => navigate('/products')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.tonKho);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/products')}
            className="border-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.tenSanPham}</h1>
            <p className="text-sm text-gray-600">Mã sản phẩm: {product.maSanPham}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh sản phẩm</h3>
            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              {product.hinhAnh ? (
                <img
                  src={filesAPI.getImageUrl(product.hinhAnh)}
                  alt={product.tenSanPham}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-20 h-20" />
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chi tiết</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Mô tả sản phẩm</label>
                <p className="mt-1 text-gray-900">{product.moTa || 'Chưa có mô tả'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Đơn vị tính</label>
                  <p className="mt-1 text-gray-900">{product.donViTinh}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Danh mục</label>
                  <div className="mt-1">
                    {product.tenDanhMuc ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {product.tenDanhMuc}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">Chưa phân loại</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Trạng thái</label>
                  <div className="mt-1">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                      product.trangThai === 'ACTIVE'
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    )}>
                      {product.trangThai === 'ACTIVE' ? 'Đang bán' : 'Tạm ngưng'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Mã sản phẩm</label>
                  <p className="mt-1 text-gray-900 font-mono">{product.maSanPham}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stats & Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin nhanh</h3>
            <div className="space-y-4">
              {/* Price */}
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Giá bán</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {product.giaBan.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>

              {/* Stock */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Tồn kho</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">
                    {product.tonKho} {product.donViTinh}
                  </span>
                  <div className="mt-1">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      stockStatus.bgColor,
                      stockStatus.color
                    )}>
                      {stockStatus.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Mức tồn kho</span>
                  <span className={cn("text-sm font-medium", stockStatus.color)}>
                    {stockStatus.label}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all", stockStatus.bgColor.replace('bg-', 'bg-').replace('-50', '-500'))}
                    style={{ width: `${stockStatus.level}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác</h3>
            <div className="space-y-2">
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => navigate(`/products?edit=${product.id}`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa sản phẩm
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-300"
                disabled
                title="Tính năng đang phát triển"
              >
                Xem lịch sử
              </Button>
            </div>
          </div>

          {/* Status Alert */}
          {product.tonKho === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Sản phẩm hết hàng</h4>
                  <p className="text-sm text-red-700">Sản phẩm này hiện đang hết hàng. Vui lòng nhập hàng để tiếp tục bán.</p>
                  <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700 text-white">
                    Đặt lại hàng
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

