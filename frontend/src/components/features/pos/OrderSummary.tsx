import { Trash2, Edit2, Plus, Minus, User, UserPlus, X, Search, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { posAPI } from '@/lib/api/pos';
import { filesAPI } from '@/lib/api/files';
import { customersAPI } from '@/lib/api/customers';
import { Customer } from '@/lib/types';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, formatPoints } from '@/lib/utils';
import PaymentDialog from './PaymentDialog';
import PromotionSelector from './PromotionSelector';
import PaymentSuccessDialog from './PaymentSuccessDialog';

export default function OrderSummary() {
  const navigate = useNavigate();
  const { 
    items, 
    discount,
    promotion,
    customer,
    currentInvoiceId,
    removeItem, 
    updateQuantity,
    setPromotion,
    clearCart,
    setCurrentInvoiceId,
    getSubtotal,
    getTotal
  } = useCartStore();

  const user = useAuthStore((state) => state.user);
  const { selectedTable, orderType, setSelectedTable, setOrderType } = useCartStore();
  const [orderId] = useState(`#B${Math.floor(Math.random() * 1000000)}`);
  const [editingQuantity, setEditingQuantity] = useState<number | null>(null);
  const [quantityInput, setQuantityInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<{ id: number; code: string; total: number; method: string } | null>(null);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [customerTab, setCustomerTab] = useState<'select' | 'create'>('select');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearchKeyword, setCustomerSearchKeyword] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');
  const [invoiceNote, setInvoiceNote] = useState(''); // Ghi chú cho đơn hàng
  const [updatingPendingInvoice, setUpdatingPendingInvoice] = useState(false);

  const subtotal = getSubtotal();
  const total = getTotal();
  const discountAmount = discount;

  // Recalculate discount when subtotal changes
  useEffect(() => {
    if (promotion) {
      setPromotion(promotion); // This will recalculate discount
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  // Debounce customer search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKeyword(customerSearchKeyword);
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearchKeyword]);

  // Load customers when dialog opens
  useEffect(() => {
    if (showAddCustomerDialog && customerTab === 'select') {
      loadCustomers();
    }
  }, [showAddCustomerDialog, customerTab, debouncedSearchKeyword]);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      console.log('Loading customers, search keyword:', debouncedSearchKeyword);
      
      if (debouncedSearchKeyword.trim()) {
        console.log('Searching customers with keyword:', debouncedSearchKeyword);
        const results = await customersAPI.search(debouncedSearchKeyword);
        console.log('Search results:', results);
        setCustomers(Array.isArray(results) ? results : []);
      } else {
        console.log('Loading all customers...');
        const response = await customersAPI.getAll({ page: 0, size: 100 });
        console.log('All customers response:', response);
        console.log('Customers content:', response.content);
        setCustomers(response.content || []);
      }
    } catch (error: any) {
      console.error('Error loading customers:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Không thể tải danh sách khách hàng');
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleOpenPayment = () => {
    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    // Navigate to payment page instead of opening dialog
    navigate('/pos/payment');
  };

  const handleHoldBill = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập lại');
      return;
    }

    if (!user.chiNhanhId) {
      toast.error('Không tìm thấy thông tin chi nhánh. Vui lòng đăng nhập lại.');
      return;
    }

    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    // ✅ Nếu đang resume một đơn, không cho phép treo đơn mới
    if (currentInvoiceId) {
      toast.warning('Đang xử lý đơn hàng khác. Vui lòng hoàn tất hoặc hủy đơn hiện tại trước khi treo đơn mới.');
      return;
    }

    // ✅ Hiển thị popup nhập ghi chú (theo hướng dẫn)
    const note = window.prompt('Nhập ghi chú cho đơn này (ví dụ: "Khách nghe điện thoại", "Bàn 5"):', invoiceNote || `Bàn: ${selectedTable} | Loại: ${orderType}`);
    
    // Nếu user cancel prompt, không treo bill
    if (note === null) {
      return;
    }

    try {
      setProcessing(true);

      // Prepare hold bill request
      // Backend đã có DTO riêng HoldBillRequest - KHÔNG cần phuongThucThanhToan
      const holdBillRequest = {
        khachHangId: customer?.id || undefined,
        nhanVienId: user.id,
        chiNhanhId: user.chiNhanhId,
        items: items.map(item => ({
          sanPhamId: item.product.id,
          soLuong: item.quantity,
          donGia: item.product.giaBan,
          ghiChu: item.note || undefined,
        })),
        // Chỉ gửi giamGia nếu user đã chọn promotion
        giamGia: promotion && discountAmount > 0 ? discountAmount : undefined,
        maKhuyenMai: promotion ? (promotion.maKhuyenMai || promotion.code) : undefined,
        // ❌ KHÔNG gửi phuongThucThanhToan - Backend có DTO riêng HoldBillRequest
        ghiChu: note || `Bàn: ${selectedTable} | Loại: ${orderType}`, // Sử dụng ghi chú từ popup
      };

      console.log('[OrderSummary] Hold bill request:', holdBillRequest);

      // Call hold bill API
      const invoice = await posAPI.holdBill(holdBillRequest);
      console.log('[OrderSummary] Hold bill success, invoice:', invoice);

      toast.success(`Đã treo bill thành công! Mã hóa đơn: ${invoice.maHoaDon}`);

      // Clear cart after holding bill
      clearCart();
      setInvoiceNote(''); // Clear ghi chú

      // Redirect về trang chọn bàn để hiển thị bàn đang treo bill
      navigate('/pos');
    } catch (error: any) {
      console.error('[OrderSummary] Hold bill error:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || 
                          error.response?.data?.message || 
                          'Treo bill thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Auto-update pending invoice khi cart thay đổi (nếu đang resume đơn)
  useEffect(() => {
    if (!currentInvoiceId || !user || !user.chiNhanhId) {
      return;
    }

    // Debounce để tránh gọi API quá nhiều
    const timeoutId = setTimeout(async () => {
      try {
        setUpdatingPendingInvoice(true);
        
        const holdBillRequest = {
          khachHangId: customer?.id || undefined,
          nhanVienId: user.id,
          chiNhanhId: user.chiNhanhId,
          items: items.map(item => ({
            sanPhamId: item.product.id,
            soLuong: item.quantity,
            donGia: item.product.giaBan,
            ghiChu: item.note || undefined,
          })),
          giamGia: promotion && discountAmount > 0 ? discountAmount : undefined,
          maKhuyenMai: promotion ? (promotion.maKhuyenMai || promotion.code) : undefined,
          ghiChu: invoiceNote || `Bàn: ${selectedTable} | Loại: ${orderType}`,
        };

        console.log('[OrderSummary] Auto-updating pending invoice:', currentInvoiceId);
        await posAPI.updatePendingInvoice(currentInvoiceId, holdBillRequest);
        console.log('[OrderSummary] Pending invoice updated successfully');
      } catch (error: any) {
        console.error('[OrderSummary] Error updating pending invoice:', error);
        // Không hiển thị toast để tránh spam, chỉ log
      } finally {
        setUpdatingPendingInvoice(false);
      }
    }, 1000); // Debounce 1 giây

    return () => clearTimeout(timeoutId);
  }, [items, customer, discountAmount, promotion, invoiceNote, selectedTable, orderType, currentInvoiceId, user]);

  const handleConfirmPayment = async (paymentMethod: 'CASH' | 'VISA' | 'MASTER' | 'JCB' | 'BANK_TRANSFER', _cardDetails?: any) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập lại');
      return;
    }

    if (!user.chiNhanhId) {
      toast.error('Không tìm thấy thông tin chi nhánh. Vui lòng đăng nhập lại.');
      return;
    }

    // Map payment method từ frontend sang backend format
    const mapPaymentMethod = (method: string): 'CASH' | 'CARD' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER' | 'OTHER' => {
      if (method === 'CASH') return 'CASH';
      if (method === 'BANK_TRANSFER') return 'BANK_TRANSFER';
      if (method === 'VISA' || method === 'MASTER' || method === 'JCB') return 'CARD';
      return 'OTHER';
    };

    const backendPaymentMethod = mapPaymentMethod(paymentMethod);

    try {
      setProcessing(true);
      setShowPaymentDialog(false);

      // Prepare checkout request
      const checkoutRequest = {
        khachHangId: customer?.id || undefined,
        nhanVienId: user.id,
        chiNhanhId: user.chiNhanhId,
        items: items.map(item => ({
          sanPhamId: item.product.id,
          soLuong: item.quantity,
          donGia: item.product.giaBan, // ✅ REQUIRED: Lấy từ product.giaBan
          ghiChu: item.note || undefined,
        })),
        // Chỉ gửi giamGia nếu user đã chọn promotion
        // Nếu không chọn promotion, không gửi để backend không tự động áp dụng
        giamGia: promotion && discountAmount > 0 ? discountAmount : undefined,
        maKhuyenMai: promotion ? (promotion.maKhuyenMai || promotion.code) : undefined, // Chỉ gửi nếu có promotion
        phuongThucThanhToan: backendPaymentMethod,
        ghiChu: `Bàn: ${selectedTable} | Loại: ${orderType}`,
      };

      // Validate cart first
      const validation = await posAPI.validateCheckout(checkoutRequest);

      if (!validation.valid) {
        toast.error(validation.errors?.join(', ') || 'Giỏ hàng không hợp lệ');
        setProcessing(false);
        return;
      }

      // Checkout
      const invoice = await posAPI.checkout(checkoutRequest);

      // Process payment if not cash
      if (backendPaymentMethod !== 'CASH') {
        try {
          const paymentResult = await posAPI.processPayment({
            invoiceId: invoice.id,
            amount: total,
            paymentMethod: backendPaymentMethod,
            metadata: backendPaymentMethod !== 'BANK_TRANSFER' ? {
              cardNumber: _cardDetails?.cardNumber,
              nameOnCard: _cardDetails?.nameOnCard,
              validOn: _cardDetails?.validOn,
              cvv: _cardDetails?.cvv,
            } : undefined,
          });
          
          // Verify payment for bank transfer
          if (backendPaymentMethod === 'BANK_TRANSFER' && paymentResult.transactionId) {
            // Poll for payment verification (optional)
            setTimeout(async () => {
              try {
                await posAPI.verifyPayment(paymentResult.transactionId);
              } catch (error) {
                console.error('Payment verification error:', error);
              }
            }, 3000);
          }
        } catch (paymentError: any) {
          console.error('Payment processing error:', paymentError);
          // Payment processing failed, but invoice is created
          toast.warning(`Hóa đơn đã được tạo (${invoice.maHoaDon}), nhưng thanh toán chưa hoàn tất. Vui lòng kiểm tra lại.`);
        }
      }

      // Show success dialog
      setSuccessInvoice({
        id: invoice.id,
        code: invoice.maHoaDon,
        total: total,
        method: backendPaymentMethod,
      });
      setShowSuccessDialog(true);
      
      // Clear cart
      clearCart();
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || 
                          error.response?.data?.message || 
                          'Thanh toán thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };


  const handleEditQuantity = (productId: number, currentQuantity: number) => {
    setEditingQuantity(productId);
    setQuantityInput(currentQuantity.toString());
  };

  const handleSaveQuantity = (productId: number) => {
    const newQuantity = parseInt(quantityInput) || 1;
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
    setEditingQuantity(null);
    setQuantityInput('');
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    const item = items.find(i => i.product.id === productId);
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity);
      } else {
        removeItem(productId);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-300 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>
          <span className="text-sm font-medium text-gray-600">{orderId}</span>
        </div>
      </div>

      {/* Ordered Items */}
      <div className="flex-1 overflow-y-auto p-6">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">Chưa có món nào</p>
            <p className="text-sm text-gray-400">Thêm món từ menu</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                  {item.product.hinhAnh ? (
                    <img
                      src={filesAPI.getImageUrl(item.product.hinhAnh)}
                      alt={item.product.tenSanPham}
                      className="w-full h-full object-cover"
                      onError={(e) => {
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
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {item.product.tenSanPham} ({item.quantity})
                    </h4>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditQuantity(item.product.id, item.quantity)}
                        className="text-gray-400 hover:text-orange-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeItem(item.product.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Quantity Controls */}
                  {editingQuantity === item.product.id ? (
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        type="number"
                        min="1"
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                        className="w-20 h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveQuantity(item.product.id);
                          } else if (e.key === 'Escape') {
                            setEditingQuantity(null);
                            setQuantityInput('');
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveQuantity(item.product.id)}
                        className="h-8 px-2"
                      >
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingQuantity(null);
                          setQuantityInput('');
                        }}
                        className="h-8 px-2"
                      >
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, -1)}
                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 bg-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product.id, 1)}
                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 bg-white"
                        disabled={item.quantity >= item.product.tonKho}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mb-1">
                    Ghi chú: {item.note || 'Không có'} Kích thước: Vừa
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
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
        <div className="border-t border-gray-300 p-6 space-y-4 bg-gray-50 flex-shrink-0">
          {/* Financial Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính</span>
              <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giảm giá</span>
                <span className="font-medium text-green-600">-{discountAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-300 flex justify-between items-end">
              <span className="font-semibold text-gray-900">Tổng thanh toán</span>
              <span className="text-xl font-bold text-gray-900">
                {total.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>

          {/* Customer Section */}
          <div className="space-y-3 border-t border-gray-300 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Thành viên</label>
              {customer ? (
                <button
                  onClick={() => {
                    const { setCustomer } = useCartStore.getState();
                    setCustomer(null);
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              ) : null}
            </div>
            {customer ? (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{customer.name || 'Khách hàng'}</p>
                    {customer.phone && (
                      <p className="text-xs text-gray-600">{customer.phone}</p>
                    )}
                    {customer.id && customer.points !== undefined && (
                      <p className="text-xs text-blue-600 mt-1">Điểm tích lũy: {formatPoints(customer.points)}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50"
                onClick={() => setShowAddCustomerDialog(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm thành viên để tích điểm
              </Button>
            )}
          </div>

          {/* Order Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại đơn hàng</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as 'Dine-in' | 'Takeaway' | 'Delivery')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Dine-in">Tại quán</option>
                <option value="Takeaway">Mang đi</option>
                <option value="Delivery">Giao hàng</option>
              </select>
            </div>
          </div>

          {/* Promotion Selector */}
          <PromotionSelector
            subtotal={subtotal}
            selectedPromotion={promotion}
            onSelectPromotion={setPromotion}
          />

          {/* Action Buttons */}
          <div className="space-y-2">
          <Button
            onClick={handleOpenPayment}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 h-auto"
            disabled={processing || items.length === 0}
          >
            {processing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </Button>
            <Button
              onClick={handleHoldBill}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 h-auto"
              disabled={processing || items.length === 0 || currentInvoiceId !== null}
              variant="outline"
            >
              {processing ? 'Đang xử lý...' : 'Treo bill'}
            </Button>
            
            {/* Badge hiển thị khi đang resume đơn */}
            {currentInvoiceId && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">
                    Đang xử lý đơn: {currentInvoiceId}
                  </span>
                  {updatingPendingInvoice && (
                    <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn hủy đơn hiện tại?')) {
                      setCurrentInvoiceId(null);
                      clearCart();
                    }
                  }}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                >
                  Hủy
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        onConfirm={handleConfirmPayment}
        processing={processing}
      />

      {/* Payment Success Dialog */}
      <PaymentSuccessDialog
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          setSuccessInvoice(null);
        }}
        invoiceCode={successInvoice?.code || ''}
        totalAmount={successInvoice?.total || 0}
        paymentMethod={successInvoice?.method || ''}
        onPrint={() => {
          // Print invoice feature not implemented
          toast.info('Tính năng in hóa đơn đang được phát triển');
        }}
        onViewInvoice={() => {
          if (successInvoice?.id) {
            setShowSuccessDialog(false);
            navigate(`/invoices/${successInvoice.id}`);
          }
        }}
      />

      {/* Add Customer Dialog */}
      {showAddCustomerDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thêm thành viên</h3>
              <button
                onClick={() => {
                  setShowAddCustomerDialog(false);
                  setCustomerTab('select');
                  setCustomerPhone('');
                  setCustomerName('');
                  setCustomerEmail('');
                  setCustomerAddress('');
                  setCustomerSearchKeyword('');
                  setCustomers([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              <button
                onClick={() => {
                  setCustomerTab('select');
                  setCustomerPhone('');
                  setCustomerName('');
                  setCustomerEmail('');
                  setCustomerAddress('');
                }}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  customerTab === 'select'
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                Chọn khách hàng
              </button>
              <button
                onClick={() => {
                  setCustomerTab('create');
                  setCustomerSearchKeyword('');
                  setCustomers([]);
                }}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  customerTab === 'create'
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                Tạo mới
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {customerTab === 'select' ? (
                <div className="flex flex-col h-full">
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                        value={customerSearchKeyword}
                        onChange={(e) => setCustomerSearchKeyword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Customer List */}
                  <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                    {loadingCustomers ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Đang tải...</p>
                        </div>
                      </div>
                    ) : customers.length === 0 ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            {customerSearchKeyword ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {customers.map((cust) => (
                          <button
                            key={cust.id}
                            onClick={() => {
                              const { setCustomer } = useCartStore.getState();
                              setCustomer({
                                id: cust.id,
                                name: cust.tenKhachHang,
                                phone: cust.soDienThoai || '',
                                points: cust.diemTichLuy || 0,
                              });
                              toast.success('Đã chọn thành viên');
                              setShowAddCustomerDialog(false);
                              setCustomerTab('select');
                              setCustomerSearchKeyword('');
                              setCustomers([]);
                            }}
                            className="w-full p-4 text-left hover:bg-orange-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-orange-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{cust.tenKhachHang}</p>
                                {cust.soDienThoai && (
                                  <p className="text-sm text-gray-600">{cust.soDienThoai}</p>
                                )}
                                {cust.diemTichLuy !== undefined && (
                                  <p className="text-xs text-blue-600 mt-1">Điểm tích lũy: {formatPoints(cust.diemTichLuy)}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto">
                  <div>
                    <Label htmlFor="customer-phone">Số điện thoại *</Label>
                    <Input
                      id="customer-phone"
                      type="tel"
                      placeholder="0901234567"
                      value={customerPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setCustomerPhone(value);
                        }
                      }}
                      className="mt-1"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-name">Tên khách hàng *</Label>
                    <Input
                      id="customer-name"
                      type="text"
                      placeholder="Nhập tên khách hàng"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="email@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-address">Địa chỉ</Label>
                    <Input
                      id="customer-address"
                      type="text"
                      placeholder="Nhập địa chỉ"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowAddCustomerDialog(false);
                        setCustomerTab('select');
                        setCustomerPhone('');
                        setCustomerName('');
                        setCustomerEmail('');
                        setCustomerAddress('');
                      }}
                      disabled={creatingCustomer}
                    >
                      Hủy
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={async () => {
                        // Validation
                        if (!customerPhone || !customerName) {
                          toast.error('Vui lòng nhập số điện thoại và tên khách hàng');
                          return;
                        }

                        // Format phone number: ensure it's 10 digits (0 + 9 digits)
                        // Backend pattern: ^(\+84|0)[0-9]{9}$
                        let formattedPhone = customerPhone.trim();
                        // Remove all non-digit characters
                        formattedPhone = formattedPhone.replace(/\D/g, '');
                        
                        // If starts with 84, remove it and add 0
                        if (formattedPhone.startsWith('84') && formattedPhone.length === 11) {
                          formattedPhone = '0' + formattedPhone.substring(2);
                        }
                        
                        // Ensure it starts with 0 and has exactly 10 digits
                        if (!formattedPhone.startsWith('0')) {
                          formattedPhone = '0' + formattedPhone;
                        }
                        
                        // Take only first 10 digits
                        formattedPhone = formattedPhone.substring(0, 10);
                        
                        // Validate phone number format
                        if (formattedPhone.length !== 10 || !formattedPhone.startsWith('0')) {
                          toast.error('Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0');
                          return;
                        }

                        // Validate email format if provided
                        if (customerEmail && customerEmail.trim()) {
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (!emailRegex.test(customerEmail.trim())) {
                            toast.error('Email không hợp lệ');
                            return;
                          }
                        }

                        try {
                          setCreatingCustomer(true);
                          
                          // Prepare customer data
                          // Backend will auto-generate maKhachHang (format: KH1234)
                          // Backend will auto-set diemTichLuy = 0
                          // Don't send maKhachHang and diemTichLuy when creating new customer
                          const customerData: Omit<Customer, 'id' | 'maKhachHang' | 'diemTichLuy'> = {
                            tenKhachHang: customerName.trim(),
                            soDienThoai: formattedPhone,
                            email: customerEmail.trim() || undefined,
                            diaChi: customerAddress.trim() || undefined,
                            trangThai: 'ACTIVE',
                          };

                          console.log('[OrderSummary] Creating customer with data:', customerData);

                          // Create customer via API
                          const newCustomer = await customersAPI.create(customerData);
                          
                          // Set customer in cart store
                          const { setCustomer } = useCartStore.getState();
                          setCustomer({
                            id: newCustomer.id,
                            name: newCustomer.tenKhachHang,
                            phone: newCustomer.soDienThoai || formattedPhone,
                            points: newCustomer.diemTichLuy || 0,
                          });
                          
                          // Reload customers list if on select tab
                          if (customerTab === 'select') {
                            await loadCustomers();
                          }
                          
                          toast.success('Đã thêm thành viên mới thành công!');
                          
                          // Reset form and close dialog
                          setShowAddCustomerDialog(false);
                          setCustomerTab('select');
                          setCustomerPhone('');
                          setCustomerName('');
                          setCustomerEmail('');
                          setCustomerAddress('');
                        } catch (error: any) {
                          console.error('[OrderSummary] Error creating customer:', error);
                          console.error('[OrderSummary] Error response:', error.response);
                          console.error('[OrderSummary] Error response data:', error.response?.data);
                          console.error('[OrderSummary] Error response status:', error.response?.status);
                          
                          // Handle different error cases
                          let errorMessage = 'Không thể tạo thành viên';
                          
                          if (error.response?.data) {
                            const errorData = error.response.data;
                            
                            // Check for validation errors (Spring Boot format)
                            if (errorData.errors && Array.isArray(errorData.errors)) {
                              const firstError = errorData.errors[0];
                              errorMessage = firstError.message || firstError.defaultMessage || errorMessage;
                              console.error('[OrderSummary] Validation error:', firstError);
                            } 
                            // Check for duplicate phone number
                            else if (errorData.message) {
                              if (errorData.message.includes('số điện thoại') || 
                                  errorData.message.includes('phone') || 
                                  errorData.message.includes('duplicate') ||
                                  errorData.message.includes('đã tồn tại')) {
                                errorMessage = 'Số điện thoại này đã được sử dụng. Vui lòng chọn khách hàng từ danh sách.';
                              } else {
                                errorMessage = errorData.message;
                              }
                              console.error('[OrderSummary] Error message:', errorData.message);
                            }
                            // Check for other error formats
                            else if (errorData.error) {
                              errorMessage = errorData.error;
                            }
                          } else if (error.message) {
                            errorMessage = error.message;
                          }
                          
                          toast.error(errorMessage);
                        } finally {
                          setCreatingCustomer(false);
                        }
                      }}
                      disabled={creatingCustomer || !customerPhone.trim() || !customerName.trim()}
                    >
                      {creatingCustomer ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        'Tạo mới'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}