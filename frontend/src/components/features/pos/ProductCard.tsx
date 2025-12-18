import { Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { filesAPI } from '@/lib/api/files';
import { toast } from 'sonner';
import React from 'react';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  
  const cartItem = items.find(item => item.product.id === product.id);
  const isInCart = !!cartItem;
  const isAvailable = product.trangThai === 'ACTIVE' && product.tonKho > 0;
  const isLowStock = product.tonKho > 0 && product.tonKho < 10;
  const isOutOfStock = product.tonKho === 0;

  const handleAddToCart = () => {
    // Validation: Check stock
    if (product.tonKho <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    // Validation: Check status
    if (product.trangThai !== 'ACTIVE') {
      toast.error('Sản phẩm đã ngừng hoạt động');
      return;
    }

    // Check if adding more would exceed stock
    const currentQuantity = cartItem?.quantity || 0;
    if (currentQuantity >= product.tonKho) {
      toast.error(`Chỉ còn ${product.tonKho} sản phẩm trong kho`);
      return;
    }

    addItem(product);
  };

  return (
    <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-orange-400 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.hinhAnh ? (
          <img
            src={filesAPI.getImageUrl(product.hinhAnh)}
            alt={product.tenSanPham}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              // Nếu load lỗi, ẩn hình ảnh
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
        )}
        
        {/* Stock Badge */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500 text-white shadow-md">
              <AlertTriangle className="w-3 h-3" />
              Hết hàng
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
              <AlertTriangle className="w-3 h-3" />
              Sắp hết ({product.tonKho})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
              <CheckCircle2 className="w-3 h-3" />
              Còn {product.tonKho}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm">
          {product.tenSanPham}
        </h3>
        
        <p className="text-lg font-bold text-gray-900 mb-3">
          {product.giaBan.toLocaleString('vi-VN')}₫
        </p>

        {/* Add Button */}
        {isInCart ? (
          <Button
            onClick={handleAddToCart}
            className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold transition-all group-hover:scale-105"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm thêm ({cartItem.quantity})
          </Button>
        ) : isAvailable ? (
          <Button
            onClick={handleAddToCart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all group-hover:scale-105"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm vào giỏ
          </Button>
        ) : (
          <Button
            disabled
            className="w-full bg-gray-100 text-gray-400 cursor-not-allowed"
            size="sm"
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Hết hàng
          </Button>
        )}
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
// Only re-render if product data changes
export default React.memo(ProductCard, (prevProps, nextProps) => {
  // Re-render if product ID changes
  if (prevProps.product.id !== nextProps.product.id) return false;
  
  // Re-render if product data changes
  if (
    prevProps.product.tenSanPham !== nextProps.product.tenSanPham ||
    prevProps.product.tonKho !== nextProps.product.tonKho ||
    prevProps.product.trangThai !== nextProps.product.trangThai ||
    prevProps.product.giaBan !== nextProps.product.giaBan ||
    prevProps.product.hinhAnh !== nextProps.product.hinhAnh
  ) return false;
  
  // Don't re-render if nothing important changed
  return true;
});
