import { useState } from 'react';
import { X, CreditCard, Wallet, Building2, CheckCircle2, Calendar, Lock, QrCode, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCartStore } from '@/store/cartStore';
import { filesAPI } from '@/lib/api/files';
import { cn } from '@/lib/utils';

// QR Code Component - Using simple SVG-based QR code
// For production, install: npm install qrcode.react
// Then replace this with: import { QRCodeSVG } from 'qrcode.react';
const QRCodeDisplay = ({ value, size = 200 }: { value: string; size?: number }) => {
  // Generate QR code with proper encoding and high quality
  // Using higher ECC level (H) for better error correction
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
          // Fallback if API fails
          (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent(`
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
              <rect width="${size}" height="${size}" fill="white" stroke="gray" stroke-width="2"/>
              <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="gray">QR Error</text>
            </svg>
          `)}`;
        }}
        onLoad={() => {
          console.log('QR Code loaded successfully');
        }}
      />
    </div>
  );
};

type PaymentMethod = 'CASH' | 'VISA' | 'MASTER' | 'JCB' | 'BANK_TRANSFER' | 'VNPAY';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (paymentMethod: PaymentMethod, cardDetails?: any) => void;
  processing?: boolean;
}

export default function PaymentDialog({
  open,
  onOpenChange,
  onConfirm,
  processing = false,
}: PaymentDialogProps) {
  const { items, customer, getSubtotal, getTax, getTotal, discount } = useCartStore();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cardType, setCardType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [cardDetails, setCardDetails] = useState({
    nameOnCard: customer?.name || '',
    cardNumber: '',
    validOn: '',
    cvv: '',
  });
  const [saveCard, setSaveCard] = useState(false);

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const discountAmount = discount;

  const handlePayment = () => {
    if (paymentMethod === 'CASH') {
      onConfirm('CASH');
    } else {
      // Validate card details for card payments
      if (!cardDetails.nameOnCard || !cardDetails.cardNumber || !cardDetails.validOn || !cardDetails.cvv) {
        return;
      }
      onConfirm(paymentMethod, { ...cardDetails, cardType, saveCard });
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join('-');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const isCardPayment = paymentMethod !== 'CASH' && paymentMethod !== 'BANK_TRANSFER' && paymentMethod !== 'VNPAY';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-screen h-screen max-h-screen overflow-hidden p-0 m-0 rounded-none fixed inset-0 translate-x-0 translate-y-0">
        {/* Close Button for Full Screen */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 z-50 rounded-full bg-white/90 hover:bg-white shadow-lg p-2 transition-all hover:scale-110"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex h-full w-full">
          {/* Left Side - Order Summary */}
          <div className="w-2/5 border-r border-gray-200 flex flex-col bg-gray-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Thanh toán</h2>
              {customer && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-xs">
                      {customer.name?.charAt(0).toUpperCase() || 'K'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{customer.name || 'Khách vãng lai'}</p>
                    <p className="text-xs text-gray-500">{customer.phone || 'Chưa có thông tin'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
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
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-gray-400">No img</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {item.product.tenSanPham}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <button className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                            <span className="text-xs leading-none">-</span>
                          </button>
                          <span className="text-xs font-medium w-5 text-center">{item.quantity}</span>
                          <button className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                            <span className="text-xs leading-none">+</span>
                          </button>
                        </div>
                        <span className="text-xs font-semibold text-gray-900">
                          {(item.product.giaBan * item.quantity).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">Chi tiết hóa đơn</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium text-gray-900">{subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Thuế VAT (10%)</span>
                    <span className="font-medium text-gray-900">{tax.toLocaleString('vi-VN')}₫</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Giảm giá</span>
                      <span className="font-medium text-green-600">-{discountAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">TỔNG CỘNG</span>
                    <span className="text-xl font-bold text-orange-600">
                      {total.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Method */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Progress Indicator */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">1</span>
                  </div>
                  <span className="text-xs text-gray-600">Giỏ hàng</span>
                </div>
                <div className="w-8 h-0.5 bg-orange-500"></div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">2</span>
                  </div>
                  <span className="text-xs font-medium text-orange-600">Thanh toán</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {/* Payment Method Selection */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Phương thức thanh toán</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('CASH')}
                    className={cn(
                      "p-2.5 border-2 rounded-lg transition-all flex items-center justify-between",
                      paymentMethod === 'CASH'
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet className={cn(
                        "w-4 h-4",
                        paymentMethod === 'CASH' ? "text-orange-600" : "text-gray-400"
                      )} />
                      <span className="font-medium text-gray-900 text-xs">Tiền mặt</span>
                    </div>
                    {paymentMethod === 'CASH' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod('VISA')}
                    className={cn(
                      "p-2.5 border-2 rounded-lg transition-all flex items-center justify-between",
                      paymentMethod === 'VISA'
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className={cn(
                        "w-4 h-4",
                        paymentMethod === 'VISA' ? "text-orange-600" : "text-gray-400"
                      )} />
                      <span className="font-medium text-gray-900 text-xs">Visa</span>
                    </div>
                    {paymentMethod === 'VISA' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod('MASTER')}
                    className={cn(
                      "p-2.5 border-2 rounded-lg transition-all flex items-center justify-between",
                      paymentMethod === 'MASTER'
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className={cn(
                        "w-4 h-4",
                        paymentMethod === 'MASTER' ? "text-orange-600" : "text-gray-400"
                      )} />
                      <span className="font-medium text-gray-900 text-xs">Mastercard</span>
                    </div>
                    {paymentMethod === 'MASTER' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod('JCB')}
                    className={cn(
                      "p-2.5 border-2 rounded-lg transition-all flex items-center justify-between",
                      paymentMethod === 'JCB'
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className={cn(
                        "w-4 h-4",
                        paymentMethod === 'JCB' ? "text-orange-600" : "text-gray-400"
                      )} />
                      <span className="font-medium text-gray-900 text-xs">JCB</span>
                    </div>
                    {paymentMethod === 'JCB' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={cn(
                      "p-2.5 border-2 rounded-lg transition-all flex items-center justify-between",
                      paymentMethod === 'BANK_TRANSFER'
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className={cn(
                        "w-4 h-4",
                        paymentMethod === 'BANK_TRANSFER' ? "text-orange-600" : "text-gray-400"
                      )} />
                      <span className="font-medium text-gray-900 text-xs">Chuyển khoản</span>
                    </div>
                    {paymentMethod === 'BANK_TRANSFER' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod('VNPAY')}
                    className={cn(
                      "p-2.5 border-2 rounded-lg transition-all flex items-center justify-between",
                      paymentMethod === 'VNPAY'
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className={cn(
                        "w-4 h-4",
                        paymentMethod === 'VNPAY' ? "text-orange-600" : "text-gray-400"
                      )} />
                      <span className="font-medium text-gray-900 text-xs">VNPay</span>
                    </div>
                    {paymentMethod === 'VNPAY' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Type Selection (for card payments) */}
              {isCardPayment && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Loại thẻ</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCardType('CREDIT')}
                      className={cn(
                        "flex-1 p-2.5 border-2 rounded-lg transition-all flex items-center justify-between",
                        cardType === 'CREDIT'
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className={cn(
                          "w-4 h-4",
                          cardType === 'CREDIT' ? "text-orange-600" : "text-gray-400"
                        )} />
                        <span className="font-medium text-gray-900 text-xs">Thẻ tín dụng</span>
                      </div>
                      {cardType === 'CREDIT' && (
                        <CheckCircle2 className="w-4 h-4 text-orange-600" />
                      )}
                    </button>

                    <button
                      onClick={() => setCardType('DEBIT')}
                      className={cn(
                        "flex-1 p-2.5 border-2 rounded-lg transition-all flex items-center justify-between",
                        cardType === 'DEBIT'
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className={cn(
                          "w-4 h-4",
                          cardType === 'DEBIT' ? "text-orange-600" : "text-gray-400"
                        )} />
                        <span className="font-medium text-gray-900 text-xs">Thẻ ghi nợ</span>
                      </div>
                      {cardType === 'DEBIT' && (
                        <CheckCircle2 className="w-4 h-4 text-orange-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Card Details (for card payments) */}
              {isCardPayment && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-gray-900">Thông tin thẻ</h3>
                  
                  <div>
                    <Label htmlFor="nameOnCard" className="mb-1.5 block text-xs">Tên trên thẻ</Label>
                    <Input
                      id="nameOnCard"
                      placeholder="Nguyễn Văn A"
                      value={cardDetails.nameOnCard}
                      onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                      className="w-full text-sm h-9"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="mb-1.5 block text-xs">Số thẻ</Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        placeholder="1234-5678-9012-3456"
                        value={cardDetails.cardNumber}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          setCardDetails({ ...cardDetails, cardNumber: formatted });
                        }}
                        maxLength={19}
                        className="w-full pr-16 text-sm h-9"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {paymentMethod === 'VISA' && (
                          <span className="text-xs font-semibold text-blue-600">VISA</span>
                        )}
                        {paymentMethod === 'MASTER' && (
                          <span className="text-xs font-semibold text-red-600">MC</span>
                        )}
                        {paymentMethod === 'JCB' && (
                          <span className="text-xs font-semibold text-orange-600">JCB</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="validOn" className="mb-1.5 block text-xs">Ngày hết hạn</Label>
                      <div className="relative">
                        <Input
                          id="validOn"
                          placeholder="MM/YY"
                          value={cardDetails.validOn}
                          onChange={(e) => {
                            const formatted = formatExpiry(e.target.value);
                            setCardDetails({ ...cardDetails, validOn: formatted });
                          }}
                          maxLength={5}
                          className="w-full pr-8 text-sm h-9"
                        />
                        <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cvv" className="mb-1.5 block text-xs">Mã CVV</Label>
                      <div className="relative">
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="***"
                          value={cardDetails.cvv}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 3);
                            setCardDetails({ ...cardDetails, cvv: v });
                          }}
                          maxLength={3}
                          className="w-full pr-8 text-sm h-9"
                        />
                        <Lock className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-3.5 h-3.5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <Label htmlFor="saveCard" className="text-xs text-gray-600 cursor-pointer">
                      Lưu thẻ an toàn để thanh toán nhanh hơn lần sau
                    </Label>
                  </div>
                </div>
              )}

              {/* VNPay Info */}
              {paymentMethod === 'VNPAY' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
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

              {/* Bank Transfer Info with QR Code - New Design */}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="flex flex-col h-full overflow-y-auto">
                  <div className="flex-1 flex items-start justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4 md:p-6 py-8">
                    <div className="bg-white border-2 border-red-500 rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {/* Header */}
                      <div className="text-center mb-4">
                        <p className="text-sm md:text-base text-gray-700 mb-3" style={{ fontFamily: 'system-ui, sans-serif' }}>
                          Quét mã để chuyển tiền đến
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-gray-900 mb-2 uppercase tracking-tight" style={{ fontFamily: 'system-ui, Arial, sans-serif', letterSpacing: '0.5px' }}>
                          ALL-TIME COFFEE & SPACE
                        </p>
                        <p className="text-base md:text-lg text-gray-600 font-medium" style={{ fontFamily: 'system-ui, sans-serif' }}>
                          {customer?.phone || '0365964432'}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-dashed border-gray-300 my-4"></div>

                      {/* VPBank Logo */}
                      <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            {/* VPBank Logo - Red V shape */}
                            <div className="w-12 h-12 md:w-16 md:h-16 relative">
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                <path
                                  d="M50 10 L30 50 L50 90 L70 50 Z"
                                  fill="#DC143C"
                                  className="drop-shadow-md"
                                />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <span className="text-2xl md:text-3xl font-bold text-green-600" style={{ fontFamily: 'Arial, sans-serif' }}>VPBank</span>
                          </div>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="flex justify-center mb-6">
                        <div className="bg-white p-2 flex-shrink-0">
                          <QRCodeDisplay 
                            value={`00020101021238570010A00000072701270006${Math.floor(total).toString().padStart(12, '0')}0208QRIBFTTA53037045406${Math.floor(total).toString().padStart(12, '0')}5802VN62070703***6304`}
                            size={280}
                          />
                        </div>
                      </div>
                      {/* Test QR - Simple format for testing */}
                      {/* Uncomment below to test with simple text */}
                      {/* <div className="flex justify-center mb-6">
                        <div className="bg-white p-2 flex-shrink-0">
                          <QRCodeDisplay 
                            value={`VPBank|1234567890|${Math.floor(total)}|ALL-TIME COFFEE`}
                            size={280}
                          />
                        </div>
                      </div> */}

                      {/* Payment Network Logos */}
                      <div className="flex items-center justify-center gap-6 mb-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <span className="text-red-600 font-bold text-lg md:text-xl" style={{ fontFamily: 'Arial, sans-serif' }}>V</span>
                            <span className="text-red-600 font-semibold text-sm md:text-base" style={{ fontFamily: 'Arial, sans-serif' }}>IETQR</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-gray-900 font-semibold text-sm md:text-base" style={{ fontFamily: 'Arial, sans-serif' }}>napas</span>
                          <span className="text-blue-600 font-semibold text-sm md:text-base" style={{ fontFamily: 'Arial, sans-serif' }}> 247</span>
                        </div>
                      </div>

                      {/* Add Content Button */}
                      <div className="flex justify-center">
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium">
                          <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm leading-none">+</span>
                          </div>
                          <span className="text-sm md:text-base">Thêm nội dung</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Bank Info - Compact */}
                  <div className="p-3 md:p-4 bg-blue-50 border-t border-blue-200 flex-shrink-0">
                    <p className="text-xs md:text-sm text-blue-800 mb-2 font-semibold">
                      Thông tin chuyển khoản thủ công:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs md:text-sm text-blue-700">
                      <p><strong>Ngân hàng:</strong> VPBank</p>
                      <p><strong>Số tài khoản:</strong> 1234567890</p>
                      <p><strong>Chủ tài khoản:</strong> All-Time Coffee & Space</p>
                      <p><strong>Số tiền:</strong> {total.toLocaleString('vi-VN')}₫</p>
                      <p className="col-span-2"><strong>Nội dung:</strong> {`HD${Date.now().toString().slice(-6)}`}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Payment Button */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <Button
                onClick={handlePayment}
                disabled={processing || (isCardPayment && (!cardDetails.nameOnCard || !cardDetails.cardNumber || !cardDetails.validOn || !cardDetails.cvv))}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 h-auto text-base"
              >
                {processing ? 'Đang xử lý...' : `Thanh toán ${total.toLocaleString('vi-VN')}₫`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

