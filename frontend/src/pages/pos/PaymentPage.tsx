import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, Wallet, Building2, CheckCircle2, Calendar, Lock, QrCode, Download, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { posAPI } from '@/lib/api/pos';
import { filesAPI } from '@/lib/api/files';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import PaymentSuccessDialog from '@/components/features/pos/PaymentSuccessDialog';

// QR Code Component
const QRCodeDisplay = ({ value, size = 200 }: { value: string; size?: number }) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=2&ecc=H&format=png`;
  
  return (
    <div className="flex flex-col items-center">
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        width={size}
        height={size}
        className="block"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          display: 'block',
          imageRendering: 'crisp-edges',
          maxWidth: '100%'
        }}
        onError={(e) => {
          console.error('QR Code generation failed, value:', value);
          (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent(`
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
              <rect width="${size}" height="${size}" fill="white" stroke="gray" stroke-width="2"/>
              <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="gray">QR Error</text>
            </svg>
          `)}`;
        }}
      />
    </div>
  );
};

type PaymentMethod = 'CASH' | 'VISA' | 'MASTER' | 'JCB' | 'BANK_TRANSFER' | 'VNPAY';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { items, customer, getSubtotal, getTotal, discount, promotion, clearCart, selectedTable, orderType, currentInvoiceId, setCurrentInvoiceId } = useCartStore();
  const user = useAuthStore((state) => state.user);
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cardType, setCardType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [cardDetails, setCardDetails] = useState({
    nameOnCard: customer?.name || '',
    cardNumber: '',
    validOn: '',
    cvv: '',
  });

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };
  const [saveCard, setSaveCard] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<{ id: number; code: string; total: number; method: string } | null>(null);

  const subtotal = getSubtotal();
  const total = getTotal();
  const discountAmount = discount;

  // Map payment method từ frontend sang backend format
  const mapPaymentMethod = (method: string): 'CASH' | 'CARD' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER' | 'VNPAY' | 'OTHER' => {
    if (method === 'CASH') return 'CASH';
    if (method === 'BANK_TRANSFER') return 'BANK_TRANSFER';
    if (method === 'VNPAY') return 'VNPAY';
    if (method === 'VISA' || method === 'MASTER' || method === 'JCB') return 'CARD';
    return 'OTHER';
  };

  // Map payment method cho API complete (theo tài liệu: TIEN_MAT, CHUYEN_KHOAN, THE, VI_DIEN_TU, VNPAY)
  const mapPaymentMethodForComplete = (method: string): string => {
    if (method === 'CASH') return 'TIEN_MAT';
    if (method === 'BANK_TRANSFER') return 'CHUYEN_KHOAN';
    if (method === 'VISA' || method === 'MASTER' || method === 'JCB') return 'THE';
    if (method === 'VNPAY') return 'VNPAY';
    return 'TIEN_MAT'; // Default
  };

  const handlePayment = async () => {
    console.log('[PaymentPage] handlePayment called');
    
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
      navigate('/pos');
      return;
    }

    const backendPaymentMethod = mapPaymentMethod(paymentMethod);
    console.log('[PaymentPage] Payment method:', paymentMethod, '->', backendPaymentMethod);
    console.log('[PaymentPage] User:', { id: user.id, chiNhanhId: user.chiNhanhId });
    console.log('[PaymentPage] Items:', items);
    console.log('[PaymentPage] backendPaymentMethod === "VNPAY":', backendPaymentMethod === 'VNPAY');
    console.log('[PaymentPage] backendPaymentMethod type:', typeof backendPaymentMethod);
    console.log('[PaymentPage] backendPaymentMethod value:', JSON.stringify(backendPaymentMethod));

    // Validate payment method
    if (!backendPaymentMethod || !paymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    try {
      setProcessing(true);

      // Prepare checkout request - DÙNG CHUNG cho tất cả payment methods
      // Backend yêu cầu phuongThucThanhToan trong validate request (REQUIRED, không được null/undefined)
      // Đảm bảo phuongThucThanhToan luôn có giá trị hợp lệ
      const checkoutRequest: {
        khachHangId?: number;
        nhanVienId: number;
        chiNhanhId: number;
        items: Array<{
          sanPhamId: number;
          soLuong: number;
          donGia: number;
          ghiChu?: string;
        }>;
        giamGia?: number;
        maKhuyenMai?: string;
        phuongThucThanhToan: 'CASH' | 'CARD' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER' | 'VNPAY' | 'OTHER'; // ✅ REQUIRED
        ghiChu?: string;
      } = {
        nhanVienId: user.id,
        chiNhanhId: user.chiNhanhId,
        items: items.map(item => ({
          sanPhamId: item.product.id,
          soLuong: item.quantity,
          donGia: item.product.giaBan,
          ...(item.note && { ghiChu: item.note }),
        })),
        // ✅ QUAN TRỌNG: Backend yêu cầu phuongThucThanhToan trong validate request
        // PHẢI là string hợp lệ, không được null hoặc undefined
        // Với VNPay: Vẫn gửi 'VNPAY' để validate, nhưng sau đó dùng hold bill thay vì checkout
        phuongThucThanhToan: backendPaymentMethod, // Type đã được đảm bảo từ mapPaymentMethod
        ghiChu: `Bàn: ${selectedTable || 'N/A'} | Loại: ${orderType || 'N/A'}`,
      };

      // Chỉ thêm các field optional nếu có giá trị (tránh undefined)
      if (customer?.id) {
        checkoutRequest.khachHangId = customer.id;
      }
      if (promotion && discountAmount > 0) {
        checkoutRequest.giamGia = discountAmount;
      }
      if (promotion && (promotion.maKhuyenMai || promotion.code)) {
        checkoutRequest.maKhuyenMai = promotion.maKhuyenMai || promotion.code;
      }

      console.log('[PaymentPage] Checkout request:', checkoutRequest);
      console.log('[PaymentPage] phuongThucThanhToan value:', checkoutRequest.phuongThucThanhToan);
      console.log('[PaymentPage] phuongThucThanhToan type:', typeof checkoutRequest.phuongThucThanhToan);
      console.log('[PaymentPage] phuongThucThanhToan is null?', checkoutRequest.phuongThucThanhToan === null);
      console.log('[PaymentPage] phuongThucThanhToan is undefined?', checkoutRequest.phuongThucThanhToan === undefined);

      // Validate cart - ÁP DỤNG CHO TẤT CẢ payment methods (kể cả VNPay)
      // Backend yêu cầu phuongThucThanhToan trong validate request
      console.log('[PaymentPage] Validating checkout...');
      try {
      const validation = await posAPI.validateCheckout(checkoutRequest);
      console.log('[PaymentPage] Validation result:', validation);
      console.log('[PaymentPage] Validation valid:', validation?.valid);
      console.log('[PaymentPage] Validation errors:', validation?.errors);

      // Handle different validation response formats
      let isValid = true;
      if (validation && typeof validation === 'object' && 'valid' in validation) {
        isValid = validation.valid;
        if (!isValid) {
          toast.error(validation.errors?.join(', ') || 'Giỏ hàng không hợp lệ');
          setProcessing(false);
          return;
        }
      } else if (validation && typeof validation === 'string') {
        isValid = validation.includes('hợp lệ') || validation.includes('valid');
        if (!isValid) {
          toast.error(validation || 'Giỏ hàng không hợp lệ');
          setProcessing(false);
          return;
        }
      } else {
        console.warn('[PaymentPage] Unknown validation format, proceeding with checkout');
        isValid = true;
      }
      
      if (!isValid) {
        console.error('[PaymentPage] Validation failed, stopping checkout');
        setProcessing(false);
        return;
      }
      
      console.log('[PaymentPage] Validation passed, proceeding to checkout');
      } catch (validationError: any) {
        console.error('[PaymentPage] Validation error:', validationError);
        toast.error('Lỗi xác thực giỏ hàng. Vui lòng thử lại.');
        setProcessing(false);
        return;
      }

      // Với VNPay: Sau khi validate, dùng hold bill hoặc update pending invoice
      if (backendPaymentMethod === 'VNPAY') {
        console.log('[PaymentPage] ✅ VNPay detected - using hold bill or update pending invoice');
        
        try {
          let invoice: any;
          
          // ✅ Nếu đang resume đơn PENDING, update thay vì tạo mới
          if (currentInvoiceId) {
            console.log('[PaymentPage] Updating pending invoice for VNPay:', currentInvoiceId);
            
            // Prepare update request
            const updateRequest = {
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
              ghiChu: `Bàn: ${selectedTable || 'N/A'} | Loại: ${orderType || 'N/A'}`,
            };
            
            // Update pending invoice
            invoice = await posAPI.updatePendingInvoice(currentInvoiceId, updateRequest);
            console.log('[PaymentPage] Updated pending invoice for VNPay:', invoice);
          } else {
            // Tạo hold bill mới
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
              ghiChu: `Bàn: ${selectedTable || 'N/A'} | Loại: ${orderType || 'N/A'}`,
            };

            console.log('[PaymentPage] Hold bill request:', holdBillRequest);
            
            // Hold bill
            invoice = await posAPI.holdBill(holdBillRequest);
            console.log('[PaymentPage] Hold bill successful, invoice:', invoice);
          }

          // Process payment
          console.log('[PaymentPage] Processing payment for method: VNPAY');
          const invoiceAmount = invoice.thanhTien || total;
          console.log('[PaymentPage] Invoice amount:', invoiceAmount, 'Cart total:', total);
          const paymentResult = await posAPI.processPayment({
            invoiceId: invoice.id,
            amount: invoiceAmount,
            paymentMethod: 'VNPAY',
            metadata: undefined,
          });
          
          console.log('[PaymentPage] Payment result:', paymentResult);
          
          // Check if payment failed
          if (paymentResult.status === 'FAILED') {
            console.error('[PaymentPage] VNPay payment failed:', paymentResult);
            const errorMsg = paymentResult.errorMessage || paymentResult.message || 'Thanh toán VNPay thất bại';
            toast.error(`Thanh toán VNPay thất bại: ${errorMsg}. Hóa đơn đã được treo (PENDING).`);
            setProcessing(false);
            // Không clear cart và currentInvoiceId nếu đang resume đơn (để user có thể thử lại)
            if (!currentInvoiceId) {
              clearCart();
            }
            navigate('/pos');
            return;
          } else if (paymentResult.paymentUrl) {
            console.log('[PaymentPage] Redirecting to VNPay:', paymentResult.paymentUrl);
            toast.success('Đang chuyển đến VNPay...', { duration: 2000 });
            clearCart();
            window.location.replace(paymentResult.paymentUrl);
            return; // Exit function - don't proceed further
          } else if (paymentResult.redirectUrl) {
            console.log('[PaymentPage] Using redirectUrl:', paymentResult.redirectUrl);
            toast.success('Đang chuyển đến VNPay...', { duration: 2000 });
            clearCart();
            window.location.replace(paymentResult.redirectUrl);
            return; // Exit function - don't proceed further
          } else {
            console.error('[PaymentPage] VNPay payment URL not found in response:', paymentResult);
            toast.warning('Hóa đơn đã được treo (PENDING), nhưng thanh toán VNPay chưa hoàn tất. Vui lòng kiểm tra lại hoặc thanh toán bằng phương thức khác.');
            setProcessing(false);
            clearCart();
            navigate('/pos');
            return; // Exit function - don't proceed further
          }
        } catch (vnpayError: any) {
          console.error('[PaymentPage] VNPay error:', vnpayError);
          const errorMessage = vnpayError.response?.data?.message || 
                              vnpayError.message || 
                              'Không thể xử lý thanh toán VNPay. Vui lòng thử lại.';
          toast.error(errorMessage);
          setProcessing(false);
          clearCart();
          navigate('/pos');
          return; // Exit function - don't proceed further
        }
      }

      // ✅ Nếu đang resume đơn PENDING, sử dụng API complete thay vì checkout mới
      let invoice: any;
      if (currentInvoiceId) {
        console.log('[PaymentPage] Resuming pending invoice:', currentInvoiceId);
        console.log('[PaymentPage] Payment method:', backendPaymentMethod);
        
        // Map payment method sang format backend yêu cầu
        const backendPaymentMethodForComplete = mapPaymentMethodForComplete(backendPaymentMethod);
        console.log('[PaymentPage] Backend payment method for complete:', backendPaymentMethodForComplete);
        
        try {
          // Sử dụng API complete để hoàn tất đơn PENDING
          invoice = await posAPI.completePendingInvoice(currentInvoiceId, backendPaymentMethodForComplete);
          console.log('[PaymentPage] Complete pending invoice successful, invoice:', invoice);
          
          // Reset currentInvoiceId sau khi complete thành công
          setCurrentInvoiceId(null);
        } catch (completeError: any) {
          console.error('[PaymentPage] Complete pending invoice error:', completeError);
          throw completeError;
        }
      } else {
        // Tạo đơn mới - Checkout bình thường
        // VNPay đã được xử lý và return ở trên, nên code này chỉ chạy cho các phương thức khác
        console.log('[PaymentPage] Processing non-VNPay payment method:', backendPaymentMethod);
        
        // Checkout - dùng checkoutRequest đã tạo ở trên (đã có phuongThucThanhToan)
        // Validation đã được thực hiện ở trên, giờ chỉ cần checkout
        console.log('[PaymentPage] Processing checkout...');
        try {
          invoice = await posAPI.checkout(checkoutRequest);
          console.log('[PaymentPage] Checkout successful, invoice:', invoice);
        } catch (checkoutError: any) {
          console.error('[PaymentPage] Checkout error:', checkoutError);
          throw checkoutError;
        }
      }

      // Process payment if not cash
      if (backendPaymentMethod !== 'CASH') {
        try {
          console.log('[PaymentPage] Processing payment for method:', backendPaymentMethod);
          // Use thanhTien from invoice (after discount) instead of total from cart
          const invoiceAmount = invoice.thanhTien || invoice.thanhToan || total;
          console.log('[PaymentPage] Invoice amount:', invoiceAmount, 'Cart total:', total);
          const paymentResult = await posAPI.processPayment({
            invoiceId: invoice.id,
            amount: invoiceAmount, // Use invoice.thanhTien instead of cart total
            paymentMethod: backendPaymentMethod,
            metadata: backendPaymentMethod !== 'BANK_TRANSFER' && backendPaymentMethod !== 'VNPAY' ? {
              cardNumber: cardDetails?.cardNumber,
              nameOnCard: cardDetails?.nameOnCard,
              validOn: cardDetails?.validOn,
              cvv: cardDetails?.cvv,
            } : undefined,
          });
          
          console.log('[PaymentPage] Payment result:', paymentResult);
          
          // Handle VNPay redirect - MUST redirect immediately
          if (backendPaymentMethod === 'VNPAY') {
            // Check if payment failed
            if (paymentResult.status === 'FAILED') {
              console.error('[PaymentPage] VNPay payment failed:', paymentResult);
              const errorMsg = paymentResult.errorMessage || paymentResult.message || 'Thanh toán VNPay thất bại';
              toast.error(`Thanh toán VNPay thất bại: ${errorMsg}. Hóa đơn đã được treo (PENDING).`);
              setProcessing(false);
              // Navigate back to POS để user thấy bàn đang treo bill
              clearCart();
              navigate('/pos');
              return; // Return immediately - don't proceed further
            } else if (paymentResult.paymentUrl) {
              console.log('[PaymentPage] Redirecting to VNPay:', paymentResult.paymentUrl);
              toast.success('Đang chuyển đến VNPay...', { duration: 2000 });
              
              // Clear cart before redirect
              clearCart();
              
              // Redirect immediately - use window.location.replace to prevent back button
              window.location.replace(paymentResult.paymentUrl);
              return; // Exit function - don't show success dialog
            } else if (paymentResult.redirectUrl) {
              console.log('[PaymentPage] Using redirectUrl:', paymentResult.redirectUrl);
              toast.success('Đang chuyển đến VNPay...', { duration: 2000 });
              
              // Clear cart before redirect
              clearCart();
              
              // Redirect immediately
              window.location.replace(paymentResult.redirectUrl);
              return; // Exit function - don't show success dialog
            } else {
              // VNPay payment failed but invoice is already created (PENDING)
              // Show warning and navigate back
              console.error('[PaymentPage] VNPay payment URL not found in response:', paymentResult);
              console.error('[PaymentPage] Payment status:', paymentResult.status);
              toast.warning('Hóa đơn đã được treo (PENDING), nhưng thanh toán VNPay chưa hoàn tất. Vui lòng kiểm tra lại hoặc thanh toán bằng phương thức khác.');
              setProcessing(false);
              clearCart();
              navigate('/pos'); // Navigate back to table selection
              return; // Return - don't proceed to show success dialog for VNPay
            }
          }
          
          // Với VNPay: Sau khi payment thành công, cần complete invoice
          // Nhưng điều này sẽ được xử lý ở VNPay return URL callback
          // Frontend chỉ cần redirect đến VNPay
          
          // Verify payment for bank transfer
          if (backendPaymentMethod === 'BANK_TRANSFER' && paymentResult.transactionId) {
            setTimeout(async () => {
              try {
                await posAPI.verifyPayment(paymentResult.transactionId);
              } catch (error) {
                console.error('Payment verification error:', error);
              }
            }, 3000);
          }
        } catch (paymentError: any) {
          console.error('[PaymentPage] Payment processing error:', paymentError);
          console.error('[PaymentPage] Payment error response:', paymentError.response);
          
          // For VNPay, if payment processing fails, show error and don't proceed
          if (backendPaymentMethod === 'VNPAY') {
            const errorMessage = paymentError.response?.data?.message || 
                                paymentError.message || 
                                'Không thể xử lý thanh toán VNPay. Vui lòng thử lại.';
            toast.error(errorMessage);
            setProcessing(false);
            return; // Don't show success dialog for VNPay errors
          }
          
          // For other payment methods, invoice is already created, just show warning
          toast.warning(`Hóa đơn đã được tạo (${invoice.maHoaDon}), nhưng thanh toán chưa hoàn tất. Vui lòng kiểm tra lại.`);
        }
      }

      // Show success dialog - ONLY for non-VNPay payments
      // VNPay payments will redirect, so we skip this section
      if (backendPaymentMethod === 'VNPAY') {
        // Already redirected above, this code should not execute
        console.log('[PaymentPage] VNPay payment - should have redirected already');
        setProcessing(false);
        return;
      }
      
      // Show success dialog for other payment methods
      if (!invoice || !invoice.id) {
        console.error('[PaymentPage] Invalid invoice response:', invoice);
        toast.error('Không thể lấy thông tin hóa đơn. Vui lòng thử lại.');
        setProcessing(false);
        return;
      }
      
      console.log('[PaymentPage] Setting success invoice:', { id: invoice.id, code: invoice.maHoaDon || invoice.code });
      const invoiceId = invoice.id;
      const invoiceCode = invoice.maHoaDon || invoice.code || `HD${invoice.id}`;
      
      setSuccessInvoice({
        id: invoiceId,
        code: invoiceCode,
        total: total,
        method: backendPaymentMethod,
      });
      
      // Show dialog immediately
      setShowSuccessDialog(true);
      console.log('[PaymentPage] Success dialog opened, invoiceId:', invoiceId);
      
      // Clear cart và reset currentInvoiceId
      clearCart();
      setCurrentInvoiceId(null); // ✅ Reset currentInvoiceId sau khi thanh toán thành công
      
      // ✅ Dispatch custom event để trigger reload invoices list
      window.dispatchEvent(new CustomEvent('invoice-created', { detail: { invoiceId } }));
      
      // Auto navigate to invoice after 3 seconds (give user time to see success message)
      setTimeout(() => {
        console.log('[PaymentPage] Auto navigating to invoice:', invoiceId);
        setShowSuccessDialog(false);
        setSuccessInvoice(null);
        navigate(`/invoices/${invoiceId}`, { state: { from: 'payment' } });
      }, 3000);
    } catch (error: any) {
      console.error('Checkout error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      const errorMessage = error.response?.data?.errors?.[0]?.message || 
                          error.response?.data?.message || 
                          error.message ||
                          'Thanh toán thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  const isCardPayment = paymentMethod !== 'CASH' && paymentMethod !== 'BANK_TRANSFER' && paymentMethod !== 'VNPAY';

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/pos')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Chi tiết đơn hàng</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <img
                      src={filesAPI.getImageUrl(item.product.hinhAnh)}
                      alt={item.product.tenSanPham}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.tenSanPham}</h3>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      {item.note && (
                        <p className="text-xs text-gray-400 mt-1">Ghi chú: {item.note}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {(item.product.giaBan * item.quantity).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
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
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Tổng thanh toán</span>
                  <span className="text-orange-600">{total.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Phương thức thanh toán</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Cash */}
                <button
                  onClick={() => setPaymentMethod('CASH')}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all',
                    paymentMethod === 'CASH'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Wallet className={cn('w-5 h-5', paymentMethod === 'CASH' ? 'text-orange-600' : 'text-gray-400')} />
                    <span className={cn('text-xs font-medium', paymentMethod === 'CASH' ? 'text-orange-600' : 'text-gray-700')}>
                      Tiền mặt
                    </span>
                    {paymentMethod === 'CASH' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                </button>

                {/* Visa */}
                <button
                  onClick={() => setPaymentMethod('VISA')}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all',
                    paymentMethod === 'VISA'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <CreditCard className={cn('w-5 h-5', paymentMethod === 'VISA' ? 'text-orange-600' : 'text-gray-400')} />
                    <span className={cn('text-xs font-medium', paymentMethod === 'VISA' ? 'text-orange-600' : 'text-gray-700')}>
                      Visa
                    </span>
                    {paymentMethod === 'VISA' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                </button>

                {/* Mastercard */}
                <button
                  onClick={() => setPaymentMethod('MASTER')}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all',
                    paymentMethod === 'MASTER'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <CreditCard className={cn('w-5 h-5', paymentMethod === 'MASTER' ? 'text-orange-600' : 'text-gray-400')} />
                    <span className={cn('text-xs font-medium', paymentMethod === 'MASTER' ? 'text-orange-600' : 'text-gray-700')}>
                      Mastercard
                    </span>
                    {paymentMethod === 'MASTER' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                </button>

                {/* JCB */}
                <button
                  onClick={() => setPaymentMethod('JCB')}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all',
                    paymentMethod === 'JCB'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <CreditCard className={cn('w-5 h-5', paymentMethod === 'JCB' ? 'text-orange-600' : 'text-gray-400')} />
                    <span className={cn('text-xs font-medium', paymentMethod === 'JCB' ? 'text-orange-600' : 'text-gray-700')}>
                      JCB
                    </span>
                    {paymentMethod === 'JCB' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                </button>

                {/* Bank Transfer */}
                <button
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all',
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Building2 className={cn('w-5 h-5', paymentMethod === 'BANK_TRANSFER' ? 'text-orange-600' : 'text-gray-400')} />
                    <span className={cn('text-xs font-medium', paymentMethod === 'BANK_TRANSFER' ? 'text-orange-600' : 'text-gray-700')}>
                      Chuyển khoản
                    </span>
                    {paymentMethod === 'BANK_TRANSFER' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                </button>

                {/* VNPay */}
                <button
                  onClick={() => setPaymentMethod('VNPAY')}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all',
                    paymentMethod === 'VNPAY'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <CreditCard className={cn('w-5 h-5', paymentMethod === 'VNPAY' ? 'text-orange-600' : 'text-gray-400')} />
                    <span className={cn('text-xs font-medium', paymentMethod === 'VNPAY' ? 'text-orange-600' : 'text-gray-700')}>
                      VNPay
                    </span>
                    {paymentMethod === 'VNPAY' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                </button>
              </div>

              {/* Card Details Form */}
              {isCardPayment && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-3">
                  <div>
                    <Label className="mb-1.5 block text-sm">Loại thẻ</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCardType('CREDIT')}
                        className={cn(
                          'flex-1 px-3 py-1.5 text-sm rounded border',
                          cardType === 'CREDIT' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-300'
                        )}
                      >
                        Thẻ tín dụng
                      </button>
                      <button
                        onClick={() => setCardType('DEBIT')}
                        className={cn(
                          'flex-1 px-3 py-1.5 text-sm rounded border',
                          cardType === 'DEBIT' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-300'
                        )}
                      >
                        Thẻ ghi nợ
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm">Số thẻ</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        setCardDetails({ ...cardDetails, cardNumber: formatted });
                      }}
                      maxLength={19}
                      className="mt-1 h-9 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Số thẻ hợp lệ: 13-19 chữ số. Ví dụ test: <span className="font-mono text-orange-600 cursor-pointer" onClick={() => {
                        setCardDetails({ ...cardDetails, cardNumber: '4111 1111 1111 1111' });
                      }}>4111 1111 1111 1111</span> (Visa) hoặc <span className="font-mono text-orange-600 cursor-pointer" onClick={() => {
                        setCardDetails({ ...cardDetails, cardNumber: '5555 5555 5555 4444' });
                      }}>5555 5555 5555 4444</span> (Mastercard)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="nameOnCard" className="text-sm">Tên chủ thẻ</Label>
                    <Input
                      id="nameOnCard"
                      placeholder="NGUYEN VAN A"
                      value={cardDetails.nameOnCard}
                      onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="validOn" className="text-sm">Ngày hết hạn</Label>
                      <Input
                        id="validOn"
                        placeholder="MM/YY"
                        value={cardDetails.validOn}
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value);
                          setCardDetails({ ...cardDetails, validOn: formatted });
                        }}
                        maxLength={5}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-sm">CVV</Label>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, '').substring(0, 4);
                          setCardDetails({ ...cardDetails, cvv: cleaned });
                        }}
                        maxLength={4}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="saveCard" className="text-xs text-gray-600 cursor-pointer">
                      Lưu thông tin thẻ
                    </Label>
                  </div>
                </div>
              )}

              {/* VNPay Info */}
              {paymentMethod === 'VNPAY' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Thanh toán qua VNPay</h3>
                      <p className="text-xs text-gray-600">
                        Bạn sẽ được chuyển đến trang thanh toán VNPay để hoàn tất giao dịch. 
                        Hỗ trợ thanh toán bằng thẻ (VISA, Mastercard, JCB) và ví điện tử.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer QR Code */}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="text-center mb-4">
                    <QrCode className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Quét mã QR để thanh toán</h3>
                    <p className="text-sm text-gray-600">Số tiền: {total.toLocaleString('vi-VN')}₫</p>
                  </div>
                  <div className="flex justify-center mb-4">
                    <QRCodeDisplay value={`BANK_TRANSFER|${total}|${Date.now()}`} size={220} />
                  </div>
                  <div className="bg-white rounded-lg p-4 text-sm space-y-2" style={{ fontFamily: 'system-ui, Arial, sans-serif' }}>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngân hàng:</span>
                      <span className="font-semibold text-gray-900">VIETCOMBANK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tài khoản:</span>
                      <span className="font-semibold text-gray-900">0123456789</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chủ tài khoản:</span>
                      <span className="font-semibold text-gray-900">ALL-TIME COFFEE & SPACE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nội dung:</span>
                      <span className="font-semibold text-gray-900">THANH TOAN HD {Date.now().toString().slice(-6)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Tóm tắt thanh toán</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Phương thức</p>
                  <p className="text-sm font-medium text-gray-900">
                    {paymentMethod === 'CASH' ? 'Tiền mặt' :
                     paymentMethod === 'VISA' ? 'Visa' :
                     paymentMethod === 'MASTER' ? 'Mastercard' :
                     paymentMethod === 'JCB' ? 'JCB' :
                     paymentMethod === 'VNPAY' ? 'VNPay' :
                     'Chuyển khoản'}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-600">Giảm giá</span>
                      <span className="font-medium text-green-600">-{discountAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                    <span>Tổng thanh toán</span>
                    <span className="text-orange-600">{total.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('[PaymentPage] Button clicked');
                    handlePayment();
                  }}
                  disabled={processing || items.length === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 h-auto text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Đang xử lý...' : `Thanh toán ${total.toLocaleString('vi-VN')}₫`}
                </Button>
                {isCardPayment && (!cardDetails.cardNumber || !cardDetails.nameOnCard || !cardDetails.validOn || !cardDetails.cvv) && (
                  <div className="text-xs text-orange-600 mt-2 space-y-1">
                    <p className="font-medium">⚠️ Thông tin thẻ chưa đầy đủ:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      {!cardDetails.cardNumber && <li>Số thẻ</li>}
                      {!cardDetails.nameOnCard && <li>Tên chủ thẻ</li>}
                      {!cardDetails.validOn && <li>Ngày hết hạn</li>}
                      {!cardDetails.cvv && <li>CVV</li>}
                    </ul>
                    <p className="text-gray-600 mt-1">Bạn vẫn có thể thanh toán (thông tin sẽ được bỏ qua trong môi trường demo).</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/pos')}
                  className="w-full border-gray-300 text-sm py-2.5 h-auto"
                >
                  Quay lại
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Success Dialog */}
      <PaymentSuccessDialog
        open={showSuccessDialog && !!successInvoice}
        onClose={() => {
          console.log('[PaymentPage] Dialog closed, navigating to invoice:', successInvoice?.id);
          setShowSuccessDialog(false);
          const invoiceId = successInvoice?.id;
          setSuccessInvoice(null);
          // Navigate to invoice detail page
          if (invoiceId) {
            navigate(`/invoices/${invoiceId}`);
          } else {
            navigate('/pos');
          }
        }}
        invoiceCode={successInvoice?.code || ''}
        totalAmount={successInvoice?.total || 0}
        paymentMethod={successInvoice?.method || ''}
        onPrint={() => {
          toast.info('Tính năng in hóa đơn đang được phát triển');
        }}
        onViewInvoice={() => {
          console.log('[PaymentPage] View invoice clicked, navigating to:', successInvoice?.id);
          if (successInvoice?.id) {
            setShowSuccessDialog(false);
            const invoiceId = successInvoice.id;
            setSuccessInvoice(null);
            navigate(`/invoices/${invoiceId}`);
          }
        }}
      />
    </div>
  );
}
