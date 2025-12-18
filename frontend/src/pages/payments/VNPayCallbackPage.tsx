import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { posAPI } from '@/lib/api/pos';

// ✅ PUBLIC PAGE - Không cần authentication để hiển thị
// Nhưng cần restore token trước khi navigate đến protected routes (invoice detail)
// VNPay redirect về từ bên ngoài, không có token
// Backend đã verify signature rồi, frontend chỉ cần parse params và redirect

interface VNPayCallbackParams {
  vnp_Amount: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_SecureHashType?: string;
}

export default function VNPayCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'failed' | 'processing'>('processing');
  const [message, setMessage] = useState('');
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [transactionCode, setTransactionCode] = useState<string>('');
  const [countdown, setCountdown] = useState(3);

  // Restore auth state từ localStorage (cần để navigate đến protected routes)
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('[VNPayCallback] Restoring auth state for navigation...');
      initialize();
    }
  }, [isAuthenticated, initialize]);

  useEffect(() => {
    handleVNPayCallback();
  }, []);

  const parseVNPayParams = (): VNPayCallbackParams | null => {
    // Parse query params từ URL
    // Example: /payments/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=INV49_1765531668630&...
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');
    
    console.log('[VNPayCallback] Parsing URL params...');
    console.log('[VNPayCallback] vnp_ResponseCode:', vnp_ResponseCode);
    console.log('[VNPayCallback] vnp_TxnRef:', vnp_TxnRef);
    console.log('[VNPayCallback] All search params:', Object.fromEntries(searchParams.entries()));
    
    if (!vnp_ResponseCode || !vnp_TxnRef) {
      console.error('[VNPayCallback] Missing required params:', { vnp_ResponseCode, vnp_TxnRef });
      return null;
    }

    const params: VNPayCallbackParams = {
      vnp_Amount: searchParams.get('vnp_Amount') || '',
      vnp_BankCode: searchParams.get('vnp_BankCode') || undefined,
      vnp_BankTranNo: searchParams.get('vnp_BankTranNo') || undefined,
      vnp_CardType: searchParams.get('vnp_CardType') || undefined,
      vnp_OrderInfo: searchParams.get('vnp_OrderInfo') || '',
      vnp_PayDate: searchParams.get('vnp_PayDate') || '',
      vnp_ResponseCode,
      vnp_TmnCode: searchParams.get('vnp_TmnCode') || '',
      vnp_TransactionNo: searchParams.get('vnp_TransactionNo') || '',
      vnp_TransactionStatus: searchParams.get('vnp_TransactionStatus') || '',
      vnp_TxnRef,
      vnp_SecureHash: searchParams.get('vnp_SecureHash') || '',
      vnp_SecureHashType: searchParams.get('vnp_SecureHashType') || undefined,
    };

    console.log('[VNPayCallback] Parsed params:', params);
    return params;
  };

  const extractInvoiceId = (txnRef: string): number | null => {
    // Format: "INV{invoiceId}_{timestamp}"
    // Example: "INV49_1765531668630" → invoiceId = 49
    console.log('[VNPayCallback] Extracting invoice ID from txnRef:', txnRef);
    
    if (!txnRef) {
      console.error('[VNPayCallback] txnRef is empty');
      return null;
    }

    // Method 1: Regex match (preferred)
    const match = txnRef.match(/^INV(\d+)_/);
    if (match && match[1]) {
      const invoiceId = parseInt(match[1], 10);
      console.log('[VNPayCallback] Extracted invoice ID (regex):', invoiceId);
      return invoiceId;
    }

    // Method 2: Fallback - try to extract from format "INV{id}_{timestamp}"
    // Remove "INV" prefix and split by "_"
    if (txnRef.startsWith('INV')) {
      const withoutPrefix = txnRef.replace(/^INV/, '');
      const parts = withoutPrefix.split('_');
      if (parts.length > 0 && parts[0]) {
        const invoiceId = parseInt(parts[0], 10);
        if (!isNaN(invoiceId)) {
          console.log('[VNPayCallback] Extracted invoice ID (fallback):', invoiceId);
          return invoiceId;
        }
      }
    }

    // Method 3: Try to extract from OrderInfo if available
    // Some implementations use OrderInfo instead of TxnRef
    console.warn('[VNPayCallback] Could not extract invoice ID from txnRef:', txnRef);
    return null;
  };

  const parseAmount = (vnp_Amount: string): number => {
    // VNPay dùng đơn vị nhỏ nhất, chia 100 để có VND
    return vnp_Amount ? parseFloat(vnp_Amount) / 100 : 0;
  };

  const parsePayDate = (payDateStr: string): Date | null => {
    // Format: yyyyMMddHHmmss (14 ký tự)
    if (!payDateStr || payDateStr.length !== 14) {
      return null;
    }

    try {
      const year = parseInt(payDateStr.substring(0, 4));
      const month = parseInt(payDateStr.substring(4, 6)) - 1; // 0-based
      const day = parseInt(payDateStr.substring(6, 8));
      const hour = parseInt(payDateStr.substring(8, 10));
      const minute = parseInt(payDateStr.substring(10, 12));
      const second = parseInt(payDateStr.substring(12, 14));
      
      return new Date(year, month, day, hour, minute, second);
    } catch (error) {
      console.error('Error parsing pay date:', error);
      return null;
    }
  };

  const handleVNPayCallback = async () => {
    try {
      setLoading(true);
      
      console.log('[VNPayCallback] Starting callback handling...');
      console.log('[VNPayCallback] Current URL:', window.location.href);
      console.log('[VNPayCallback] Search params:', window.location.search);
      
      // Parse params từ URL
      // Example: /payments/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=INV49_1765531668630&...
      const params = parseVNPayParams();
      
      if (!params) {
        console.error('[VNPayCallback] Failed to parse params');
        setStatus('failed');
        setMessage('Không tìm thấy thông tin thanh toán từ VNPay');
        toast.error('Không tìm thấy thông tin thanh toán');
        return;
      }

      console.log('[VNPayCallback] Parsed params successfully:', params);

      // Extract invoice ID từ transaction code
      // Format: "INV{invoiceId}_{timestamp}" → invoiceId = {invoiceId}
      // Example: "INV49_1765531668630" → invoiceId = 49
      const extractedInvoiceId = extractInvoiceId(params.vnp_TxnRef);
      console.log('[VNPayCallback] Extracted invoice ID:', extractedInvoiceId);
      
      if (extractedInvoiceId) {
        setInvoiceId(extractedInvoiceId);
      } else {
        console.warn('[VNPayCallback] Could not extract invoice ID, will try to get from OrderInfo');
        // Try to extract from OrderInfo as fallback
        if (params.vnp_OrderInfo) {
          const orderInfoMatch = params.vnp_OrderInfo.match(/Invoice(\d+)/i);
          if (orderInfoMatch && orderInfoMatch[1]) {
            const invoiceIdFromOrderInfo = parseInt(orderInfoMatch[1], 10);
            console.log('[VNPayCallback] Extracted invoice ID from OrderInfo:', invoiceIdFromOrderInfo);
            setInvoiceId(invoiceIdFromOrderInfo);
          }
        }
      }
      
      setTransactionCode(params.vnp_TxnRef);
      
      // Parse amount
      // VNPay dùng đơn vị nhỏ nhất (ví dụ: 6499900 = 64999 VND)
      const parsedAmount = parseAmount(params.vnp_Amount);
      console.log('[VNPayCallback] Parsed amount:', parsedAmount, 'from', params.vnp_Amount);
      setAmount(parsedAmount);

      // Check status từ response code
      // vnp_ResponseCode = '00' → Thanh toán thành công
      // vnp_TransactionStatus = '00' → Giao dịch thành công
      const isSuccess = params.vnp_ResponseCode === '00' && 
                        params.vnp_TransactionStatus === '00';
      
      console.log('[VNPayCallback] Payment status check:', {
        vnp_ResponseCode: params.vnp_ResponseCode,
        vnp_TransactionStatus: params.vnp_TransactionStatus,
        isSuccess,
      });

      if (isSuccess) {
        // ✅ Thanh toán thành công
        // QUAN TRỌNG: Cần complete invoice để:
        // - Cập nhật status từ PENDING → COMPLETED
        // - Cộng điểm cho khách hàng
        // - Trừ kho sản phẩm
        
        const finalInvoiceId = extractedInvoiceId || (invoiceId ? parseInt(String(invoiceId)) : null);
        
        if (finalInvoiceId) {
          console.log('[VNPayCallback] Completing pending invoice:', finalInvoiceId);
          
          // Đảm bảo auth state đã được restore trước khi gọi API
          // API completePendingInvoice cần authentication
          if (!isAuthenticated) {
            console.log('[VNPayCallback] Restoring auth state before completing invoice...');
            initialize();
            // Đợi một chút để auth state được restore
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          try {
            // Complete invoice với phương thức thanh toán VNPAY
            // API này sẽ:
            // - Cập nhật invoice status: PENDING → COMPLETED
            // - Cộng điểm cho khách hàng
            // - Trừ kho sản phẩm
            await posAPI.completePendingInvoice(finalInvoiceId, 'VNPAY');
            console.log('[VNPayCallback] Invoice completed successfully');
            toast.success('Hóa đơn đã được hoàn tất. Điểm và kho đã được cập nhật.');
          } catch (completeError: any) {
            console.error('[VNPayCallback] Error completing invoice:', completeError);
            console.error('[VNPayCallback] Complete error response:', completeError.response);
            // Nếu complete fail, vẫn hiển thị success nhưng cảnh báo
            const errorMsg = completeError.response?.data?.message || 
                           completeError.message || 
                           'Không thể hoàn tất hóa đơn. Vui lòng kiểm tra lại.';
            toast.warning(`Thanh toán thành công, nhưng ${errorMsg}`);
          }
        } else {
          console.warn('[VNPayCallback] Cannot complete invoice: invoice ID not found');
        }
        
        setStatus('success');
        setMessage('Thanh toán thành công!');
        toast.success(`Thanh toán thành công! Số tiền: ${parsedAmount.toLocaleString('vi-VN')}₫`);
        
        // ✅ Dispatch custom event để trigger reload invoices list
        if (finalInvoiceId) {
          window.dispatchEvent(new CustomEvent('invoice-created', { detail: { invoiceId: finalInvoiceId } }));
        }
        
        // Auto redirect đến invoice sau 3 giây (giống các phương thức thanh toán khác)
        if (finalInvoiceId) {
          console.log('[VNPayCallback] Will navigate to invoice:', finalInvoiceId);
          
          // Đảm bảo auth state đã được restore trước khi navigate
          // Invoice detail page là protected route, cần authentication
          const ensureAuthAndNavigate = async () => {
            console.log('[VNPayCallback] Ensuring auth before navigate, isAuthenticated:', isAuthenticated);
            
            // Restore auth nếu chưa có
            if (!isAuthenticated) {
              console.log('[VNPayCallback] Restoring auth state...');
              initialize();
              // Đợi một chút để auth state được restore
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            console.log('[VNPayCallback] Navigating to invoice:', finalInvoiceId);
            // Navigate đến invoice detail page với state để trigger reload
            navigate(`/invoices/${finalInvoiceId}`, { state: { from: 'payment' } });
          };
          
          // Countdown và redirect
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                ensureAuthAndNavigate();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(interval);
        } else {
          console.warn('[VNPayCallback] No invoice ID extracted, redirecting to POS');
          // Nếu không có invoiceId, redirect về POS sau 3 giây
          setTimeout(() => {
            navigate('/pos');
          }, 3000);
        }
      } else {
        // ❌ Thanh toán thất bại
        setStatus('failed');
        
        // Map error codes
        const errorMessages: Record<string, string> = {
          '07': 'Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
          '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking',
          '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
          '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch',
          '12': 'Thẻ/Tài khoản bị khóa',
          '24': 'Khách hàng hủy giao dịch',
        };

        const errorMsg = errorMessages[params.vnp_ResponseCode] || 
                        `Thanh toán thất bại. Mã lỗi: ${params.vnp_ResponseCode}`;
        
        setMessage(errorMsg);
        toast.error(errorMsg);
        
        // Redirect về POS sau 3 giây nếu thất bại
        setTimeout(() => {
          navigate('/pos');
        }, 3000);
      }
    } catch (error: any) {
      console.error('[VNPayCallback] Error:', error);
      setStatus('failed');
      setMessage('Lỗi xử lý kết quả thanh toán. Vui lòng thử lại.');
      toast.error('Lỗi xử lý kết quả thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = () => {
    // Đảm bảo auth state đã được restore trước khi navigate
    if (!isAuthenticated) {
      initialize();
      setTimeout(() => {
        if (invoiceId) {
          navigate(`/invoices/${invoiceId}`);
        } else {
          navigate('/invoices');
        }
      }, 300);
    } else {
      if (invoiceId) {
        navigate(`/invoices/${invoiceId}`);
      } else {
        navigate('/invoices');
      }
    }
  };

  const handleBackToPOS = () => {
    // Navigate về POS
    // TableSelectionPage sẽ tự động reload pending invoices khi focus/visibility change
    navigate('/pos');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        {loading ? (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Đang xử lý...</h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </div>
        ) : status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            
            {amount > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Số tiền thanh toán</p>
                <p className="text-2xl font-bold text-gray-900">
                  {amount.toLocaleString('vi-VN')}₫
                </p>
              </div>
            )}
            
            {transactionCode && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Mã giao dịch</p>
                <p className="text-sm font-mono text-gray-900">{transactionCode}</p>
              </div>
            )}

            {/* Countdown message */}
            {invoiceId && countdown > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Chuyển hướng đến trang hóa đơn sau {countdown} giây...
              </p>
            )}

            <div className="flex gap-3 mt-6">
              {invoiceId && (
                <Button
                  onClick={handleViewInvoice}
                  className="flex-1"
                >
                  Xem hóa đơn
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleBackToPOS}
                className="flex-1"
              >
                Về POS
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-4">{message}</p>

            <div className="flex gap-3 mt-6">
              {invoiceId && (
                <Button
                  variant="outline"
                  onClick={handleViewInvoice}
                  className="flex-1"
                >
                  Xem hóa đơn
                </Button>
              )}
              <Button
                onClick={handleBackToPOS}
                className="flex-1"
              >
                Về POS
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
