import { Trash2, Minus, Plus, User, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { filesAPI } from '@/lib/api/files';
import { useState } from 'react';

export default function CartSidebar() {
  const { 
    items, 
    customer, 
    discount,
    removeItem, 
    updateQuantity, 
    setCustomer,
    setDiscount,
    clearCart,
    getSubtotal,
    getTax,
    getTotal
  } = useCartStore();

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  const handleCheckout = () => {
    if (items.length === 0) return;
    // Checkout handled in PaymentPage
    alert('Chức năng thanh toán đang được phát triển');
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Giỏ hàng</h2>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Customer Info */}
        <button
          onClick={() => setShowCustomerModal(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1 text-left">
            {customer ? (
              <>
                <p className="font-medium text-gray-900">{customer.name || 'Khách hàng'}</p>
                <p className="text-sm text-gray-500">{customer.phone}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Chọn khách hàng</p>
            )}
          </div>
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">Giỏ hàng trống</p>
            <p className="text-sm text-gray-400">Thêm sản phẩm để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex gap-3 mb-3">
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    {item.product.hinhAnh ? (
                      <img
                        src={filesAPI.getImageUrl(item.product.hinhAnh)}
                        alt={item.product.tenSanPham}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Nếu load lỗi, ẩn hình ảnh
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm">
                      {item.product.tenSanPham}
                    </h4>
                    <p className="text-sm text-orange-600 font-medium">
                      {item.product.giaBan.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 bg-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 bg-white"
                      disabled={item.quantity >= item.product.tonKho}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-bold text-gray-900">
                    {(item.product.giaBan * item.quantity).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50 flex-shrink-0">
          {/* Discount */}
          <button
            onClick={() => setShowDiscountModal(true)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-white transition-colors flex items-center justify-between bg-white"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {discount > 0 ? `Giảm giá: ${discount.toLocaleString('vi-VN')}₫` : 'Thêm giảm giá'}
              </span>
            </div>
            {discount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDiscount(0);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </button>

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính</span>
              <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Thuế VAT (10%)</span>
              <span className="font-medium">{tax.toLocaleString('vi-VN')}₫</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giảm giá</span>
                <span className="font-medium text-red-600">-{discount.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200 flex justify-between items-end">
              <span className="font-semibold text-gray-900">Tổng cộng</span>
              <span className="text-2xl font-bold text-orange-600">
                {total.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            className="w-full text-lg h-12 shadow-md hover:shadow-lg transition-all"
          >
            Thanh toán ({items.length} món)
          </Button>
        </div>
      )}

      {/* Simple Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Thông tin khách hàng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Số điện thoại</label>
                <Input
                  type="tel"
                  placeholder="0901234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCustomerModal(false);
                    setCustomerPhone('');
                  }}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (customerPhone) {
                      setCustomer({ phone: customerPhone, name: 'Khách hàng mới' });
                    }
                    setShowCustomerModal(false);
                    setCustomerPhone('');
                  }}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Giảm giá đơn hàng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Số tiền giảm (VNĐ)</label>
                <Input
                  type="number"
                  placeholder="0"
                  defaultValue={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => setShowDiscountModal(false)}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}