import { Product } from '@/lib/types';
import LazyImage from '@/components/common/LazyImage';
import { MoreVertical, ArrowRight, AlertTriangle, Power, PowerOff, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { filesAPI } from '@/lib/api/files';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProductManagementCardProps {
  product: Product;
  getStockStatus: (stock: number) => {
    label: string;
    color: string;
    bgColor: string;
    barColor: string;
    level: number;
  };
  onStatusChange?: (productId: number, newStatus: 'ACTIVE' | 'INACTIVE') => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: number) => void;
}

function ProductManagementCard({ product, getStockStatus, onStatusChange, onEdit, onDelete }: ProductManagementCardProps) {
  const navigate = useNavigate();
  const stockStatus = getStockStatus(product.tonKho);
  const isOutOfStock = product.tonKho === 0;
  const isLowStock = product.tonKho > 0 && product.tonKho < 20;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-xl hover:border-orange-300 transition-all duration-300 hover:-translate-y-1">
      {/* Product Image */}
      <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
        {product.hinhAnh ? (
          <LazyImage
            src={filesAPI.getImageUrl(product.hinhAnh)}
            alt={product.tenSanPham}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Nếu load lỗi, ẩn hình ảnh
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          {isOutOfStock && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500 text-white shadow-md animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              Hết hàng
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
              <AlertTriangle className="w-3 h-3" />
              Sắp hết
            </span>
          )}
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm",
            product.trangThai === 'ACTIVE'
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-gray-100 text-gray-800 border border-gray-300"
          )}>
            {product.trangThai === 'ACTIVE' ? 'Đang bán' : 'Nháp'}
          </span>
        </div>

        {/* Quick Actions - Show on Hover */}
        <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={() => onEdit?.(product)}
            className="p-2 bg-white/95 hover:bg-white rounded-lg shadow-md transition-all hover:scale-110"
            title="Chỉnh sửa"
            aria-label="Chỉnh sửa sản phẩm"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-2 bg-white/95 hover:bg-white rounded-lg shadow-md transition-all hover:scale-110"
                aria-label="Thêm tùy chọn"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onClick={() => navigate(`/products/${product.id}`)}
              className="cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit?.(product)}
              className="cursor-pointer"
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusChange?.(product.id, product.trangThai === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
              className="cursor-pointer"
            >
              {product.trangThai === 'ACTIVE' ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Vô hiệu hóa
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Kích hoạt
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(product.id)}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        {/* Product Name */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
            {product.tenSanPham}
          </h3>
          <p className="text-xs text-gray-500">SKU: {product.maSanPham}</p>
        </div>

        {/* Tags/Categories */}
        <div className="flex flex-wrap gap-1">
          {product.tenDanhMuc ? (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
              {product.tenDanhMuc}
            </span>
          ) : null}
          {product.donViTinh && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
              {product.donViTinh}
            </span>
          )}
        </div>

        {/* Prices */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Giá bán:</span>
            <span className="text-sm font-semibold text-gray-900">
              {product.giaBan.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>

        {/* Stock Information */}
        <div className="space-y-2">
          {isOutOfStock ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-600">Hết hàng</span>
              <button className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">
                Đặt lại hàng
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className={cn("text-sm font-medium", stockStatus.color)}>
                  {product.tonKho} {product.donViTinh} - {stockStatus.label}
                </span>
              </div>
              {/* Stock Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all", stockStatus.barColor)}
                  style={{ width: `${stockStatus.level}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* View Details Button */}
        <button 
          onClick={() => navigate(`/products/${product.id}`)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 transition-all duration-200 group/btn"
        >
          <span>Xem chi tiết</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
// Only re-render if product data or callbacks change
export default React.memo(ProductManagementCard, (prevProps, nextProps) => {
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
  
  // Re-render if callbacks change (reference equality)
  if (
    prevProps.onStatusChange !== nextProps.onStatusChange ||
    prevProps.onEdit !== nextProps.onEdit ||
    prevProps.onDelete !== nextProps.onDelete
  ) return false;
  
  // Don't re-render if nothing important changed
  return true;
});

