import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Invoice, InvoiceDetail } from '@/lib/types';
import { cn } from '@/lib/utils';
import { invoicesAPI } from '@/lib/api/invoices';
import { posAPI } from '@/lib/api/pos';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Mock data for invoice details
const mockInvoiceDetails: Record<number, InvoiceDetail[]> = {
  1: [
    { id: 1, hoaDonId: 1, sanPhamId: 1, tenSanPham: 'Cà phê đen đá', soLuong: 2, donGia: 25000, thanhTien: 50000 },
    { id: 2, hoaDonId: 1, sanPhamId: 2, tenSanPham: 'Trà sữa trân châu', soLuong: 3, donGia: 35000, thanhTien: 105000 },
    { id: 3, hoaDonId: 1, sanPhamId: 3, tenSanPham: 'Bánh mì thịt nguội', soLuong: 4, donGia: 30000, thanhTien: 120000 },
    { id: 4, hoaDonId: 1, sanPhamId: 4, tenSanPham: 'Cappuccino', soLuong: 2, donGia: 45000, thanhTien: 90000 },
    { id: 5, hoaDonId: 1, sanPhamId: 5, tenSanPham: 'Sinh tố bơ', soLuong: 1, donGia: 55000, thanhTien: 55000 },
  ],
  2: [
    { id: 6, hoaDonId: 2, sanPhamId: 1, tenSanPham: 'Cà phê đen đá', soLuong: 1, donGia: 25000, thanhTien: 25000 },
    { id: 7, hoaDonId: 2, sanPhamId: 6, tenSanPham: 'Phở bò tái', soLuong: 2, donGia: 75000, thanhTien: 150000 },
    { id: 8, hoaDonId: 2, sanPhamId: 7, tenSanPham: 'Kem chanh dây', soLuong: 1, donGia: 35000, thanhTien: 35000 },
  ],
  3: [
    { id: 9, hoaDonId: 3, sanPhamId: 1, tenSanPham: 'Cà phê đen đá', soLuong: 1, donGia: 25000, thanhTien: 25000 },
    { id: 10, hoaDonId: 3, sanPhamId: 8, tenSanPham: 'Nước ép cam tươi', soLuong: 1, donGia: 40000, thanhTien: 40000 },
  ],
};

// Mock invoice data
const mockInvoices: Invoice[] = [
  {
    id: 1,
    maHoaDon: 'HD001',
    khachHangId: 1,
    nhanVienId: 1,
    tongTien: 420000,
    tienGiam: 0,
    thanhToan: 420000,
    phuongThucThanhToan: 'CASH',
    trangThai: 'COMPLETED',
    ghiChu: 'Khách hàng VIP',
    ngayTao: '2024-03-17T10:30:00',
  },
  {
    id: 2,
    maHoaDon: 'HD002',
    khachHangId: 2,
    nhanVienId: 1,
    tongTien: 210000,
    tienGiam: 10000,
    thanhToan: 200000,
    phuongThucThanhToan: 'VISA',
    trangThai: 'COMPLETED',
    ngayTao: '2024-03-16T14:20:00',
  },
  {
    id: 3,
    maHoaDon: 'HD003',
    khachHangId: 3,
    nhanVienId: 1,
    tongTien: 65000,
    tienGiam: 0,
    thanhToan: 65000,
    phuongThucThanhToan: 'CASH',
    trangThai: 'PENDING',
    ngayTao: '2024-02-15T09:15:00',
  },
];

const mockCustomerNames: Record<number, string> = {
  1: 'Nguyễn Văn A',
  2: 'Trần Thị B',
  3: 'Lê Văn C',
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(''); // QR code URL - can be set from props or API

  useEffect(() => {
    const loadInvoice = async () => {
      if (id) {
        setLoading(true);
        try {
          const invoiceId = parseInt(id);
          console.log('[InvoiceDetail] Loading invoice:', invoiceId);
          
          const invoiceData = await invoicesAPI.getInvoiceDetails(invoiceId);
          console.log('[InvoiceDetail] Invoice data loaded:', invoiceData);
          
          setInvoice(invoiceData);
          
          // Extract details from invoice response
          if (invoiceData.chiTietHoaDons && Array.isArray(invoiceData.chiTietHoaDons)) {
            console.log('[InvoiceDetail] Invoice details:', invoiceData.chiTietHoaDons);
            setInvoiceDetails(invoiceData.chiTietHoaDons);
          } else {
            console.warn('[InvoiceDetail] No chiTietHoaDons, using mock data');
            setInvoiceDetails(mockInvoiceDetails[invoiceId] || []);
          }

          // Load transactions for this invoice
          try {
            const invoiceTransactions = await posAPI.getTransactionsByInvoice(invoiceId);
            console.log('[InvoiceDetail] Transactions loaded:', invoiceTransactions);
            setTransactions(invoiceTransactions || []);
          } catch (error) {
            console.error('[InvoiceDetail] Error loading transactions:', error);
            setTransactions([]);
          }
        } catch (error: any) {
          console.error('[InvoiceDetail] Error loading invoice:', error);
          console.error('[InvoiceDetail] Error response:', error.response);
          console.error('[InvoiceDetail] Error status:', error.response?.status);
          console.error('[InvoiceDetail] Error data:', error.response?.data);
          
          // Fallback to mock data
          const invoiceId = parseInt(id);
          const foundInvoice = mockInvoices.find(inv => inv.id === invoiceId);
          if (foundInvoice) {
            setInvoice(foundInvoice);
            setInvoiceDetails(mockInvoiceDetails[invoiceId] || []);
          } else {
            // Nếu không tìm thấy invoice, có thể invoice chưa được tạo hoặc đã bị xóa
            toast.error(`Không tìm thấy hóa đơn #${invoiceId}. Có thể hóa đơn chưa được tạo hoặc đã bị xóa.`);
          }
        } finally {
          setLoading(false);
        }
      }
    };
    loadInvoice();
  }, [id]);

  const handleExportPDF = useCallback(async () => {
    if (!invoice) return;

    try {
      setExportingPDF(true);
      
      // Try to get PDF from backend first (better quality, includes all formatting)
      try {
        const blob = await invoicesAPI.print(invoice.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoice.maHoaDon || invoice.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Đã xuất hóa đơn PDF thành công');
        return;
      } catch (backendError) {
        console.warn('Backend PDF generation failed, trying frontend fallback:', backendError);
        // Fallback to frontend generation if backend fails
      }

      // Fallback: Generate PDF from HTML content using window.print() which handles CSS better
      // This is more reliable than html2canvas for complex CSS
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Không thể mở cửa sổ in. Vui lòng cho phép popup.');
      }

      // Create print content with proper discount display
      const printContent = invoiceRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Hóa đơn ${invoice.maHoaDon || invoice.id}</title>
            <style>
              @media print {
                @page {
                  margin: 10mm;
                  size: A4;
                }
                body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                }
              }
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                background: white;
              }
              * {
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      toast.success('Đã mở cửa sổ in. Vui lòng chọn "Lưu dưới dạng PDF" trong hộp thoại in.');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error('Không thể tạo hóa đơn PDF. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
    } finally {
      setExportingPDF(false);
    }
  }, [invoice]);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Đã hoàn thành', color: 'text-green-800', bgColor: 'bg-green-100' };
      case 'PENDING':
        return { label: 'Đang xử lý', color: 'text-orange-800', bgColor: 'bg-orange-100' };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'text-red-800', bgColor: 'bg-red-100' };
      default:
        return { label: status, color: 'text-gray-800', bgColor: 'bg-gray-100' };
    }
  }, []);

  const getPaymentMethodLabel = useCallback((method: string) => {
    const labels: Record<string, string> = {
      'CASH': 'Tiền mặt',
      'VISA': 'Thẻ Visa',
      'MASTER': 'Thẻ Mastercard',
      'JCB': 'Thẻ JCB',
      'BANK_TRANSFER': 'Chuyển khoản',
    };
    return labels[method] || method;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    try {
    const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      });
    } catch {
      return dateString;
    }
  }, []);

  const formatTime = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    } catch {
      return '';
    }
  }, []);

  // Format currency with rounding (làm tròn số tiền)
  const formatCurrency = (amount: number): string => {
    // Làm tròn gần nhất (Math.round) để bỏ phần thập phân
    // Ví dụ: 39.000,2₫ → 39.000₫, 25.998,8₫ → 25.999₫
    const rounded = Math.round(amount);
    return rounded.toLocaleString('vi-VN') + '₫';
  };

  const handleRefund = useCallback(async () => {
    if (!invoice || transactions.length === 0) {
      toast.error('Không có giao dịch để hoàn tiền');
      return;
    }

    const lastTransaction = transactions[0];
    if (!lastTransaction.transactionId) {
      toast.error('Không tìm thấy thông tin giao dịch');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn hoàn tiền cho hóa đơn ${invoice.maHoaDon}?`)) {
      return;
    }

    try {
      setRefunding(true);
      // Theo tài liệu: POST /api/v1/pos/payments/refund?transactionId={id}&amount={amount}
      const result = await posAPI.refund(
        lastTransaction.transactionId,
        invoice.thanhTien || invoice.thanhToan || 0
      );
      
      toast.success(`Đã hoàn tiền thành công cho hóa đơn ${invoice.maHoaDon}`);
      
      // Reload transactions
      const invoiceTransactions = await posAPI.getTransactionsByInvoice(invoice.id);
      setTransactions(invoiceTransactions || []);
    } catch (error: any) {
      console.error('Error processing refund:', error);
      toast.error(error.response?.data?.message || 'Không thể hoàn tiền');
    } finally {
      setRefunding(false);
    }
  }, [invoice, transactions]);

  const handleReconcile = useCallback(async (transactionId: string) => {
    try {
      await posAPI.reconcile(transactionId);
      toast.success('Đã đối soát thanh toán thành công');
      
      // Reload transactions
      if (invoice) {
        const invoiceTransactions = await posAPI.getTransactionsByInvoice(invoice.id);
        setTransactions(invoiceTransactions || []);
      }
    } catch (error: any) {
      console.error('Error reconciling payment:', error);
      toast.error(error.response?.data?.message || 'Không thể đối soát thanh toán');
    }
  }, [invoice]);

  const handleDeleteInvoice = useCallback(async () => {
    if (!invoice) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa hóa đơn ${invoice.maHoaDon}?`)) {
      return;
    }

    try {
      await invoicesAPI.delete(invoice.id);
      toast.success('Đã xóa hóa đơn thành công');
      navigate('/invoices');
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa hóa đơn');
    }
  }, [invoice, navigate]);

  // Memoize calculated values to avoid recalculating on every render
  // Calculate summary - use actual invoice fields from backend
  // tongTien = tổng tiền trước giảm giá (tổng từ các sản phẩm)
  // giamGia = số tiền giảm giá
  // thanhTien = tổng tiền sau giảm giá = tongTien - giamGia
  // Tính subtotal từ invoiceDetails (tổng thành tiền của từng sản phẩm)
  const calculatedSubtotal = useMemo(() => {
    return invoiceDetails.reduce((sum, item) => sum + (item.thanhTien || 0), 0);
  }, [invoiceDetails]);
  
  // Ưu tiên dùng tongTien từ backend, nếu không có thì tính từ details
  const subtotal = useMemo(() => {
    return invoice?.tongTien ?? calculatedSubtotal;
  }, [invoice?.tongTien, calculatedSubtotal]);
  
  const discount = useMemo(() => {
    return invoice?.giamGia || invoice?.tienGiam || 0;
  }, [invoice?.giamGia, invoice?.tienGiam]);
  
  // Tính total: subtotal - discount, hoặc dùng thanhTien từ backend nếu có
  const calculatedTotal = useMemo(() => {
    return subtotal - discount;
  }, [subtotal, discount]);
  
  const total = useMemo(() => {
    return invoice?.thanhTien || invoice?.thanhToan || calculatedTotal;
  }, [invoice?.thanhTien, invoice?.thanhToan, calculatedTotal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải chi tiết hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy hóa đơn</h2>
          <p className="text-gray-600 mb-4">Hóa đơn bạn đang tìm không tồn tại.</p>
          <Button onClick={() => navigate('/invoices')} className="bg-orange-500 hover:bg-orange-600 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(invoice.trangThai);
  // Use tenKhachHang from invoice if available, otherwise fallback to mock data
  const customerName = invoice.tenKhachHang || 
                       (invoice.khachHangId ? mockCustomerNames[invoice.khachHangId] : null) || 
                       'Khách vãng lai';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/invoices')}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết hóa đơn</h1>
            <p className="text-sm text-gray-500 mt-1">Mã hóa đơn: {invoice.maHoaDon}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {invoice?.trangThai === 'COMPLETED' && transactions.length > 0 && (
            <Button 
              variant="outline" 
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={handleRefund}
              disabled={refunding}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", refunding && "animate-spin")} />
              {refunding ? 'Đang xử lý...' : 'Hoàn tiền'}
            </Button>
          )}
          {invoice.trangThai !== 'CANCELLED' && (
            <Button
              onClick={handleDeleteInvoice}
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa hóa đơn
            </Button>
          )}
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleExportPDF}
            disabled={exportingPDF}
          >
            <Download className={cn("w-4 h-4 mr-2", exportingPDF && "animate-spin")} />
            {exportingPDF ? 'Đang tải...' : 'Xuất PDF'}
          </Button>
        </div>
      </div>

      {/* Invoice Content - For Display and Print */}
      <div ref={invoiceRef} className="invoice-content bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        {/* Invoice Header */}
        <div className="text-center border-b border-gray-200 pb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ALL-TIME</h2>
          <p className="text-sm text-gray-600">Coffee & Space</p>
          <p className="text-xs text-gray-500 mt-2">Hóa đơn bán hàng</p>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Mã hóa đơn</p>
            <p className="text-base font-semibold text-gray-900">{invoice.maHoaDon}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Ngày tạo</p>
            <p className="text-base font-semibold text-gray-900">{formatDate(invoice.ngayTao)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
            <p className="text-base font-semibold text-gray-900">{customerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
              statusBadge.bgColor,
              statusBadge.color
            )}>
              {statusBadge.label}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Phương thức thanh toán</p>
            <p className="text-base font-semibold text-gray-900">{getPaymentMethodLabel(invoice.phuongThucThanhToan)}</p>
          </div>
          {invoice.ghiChu && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
              <p className="text-base text-gray-900">{invoice.ghiChu}</p>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách sản phẩm</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">STT</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tên sản phẩm</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Số lượng</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Đơn giá</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {invoiceDetails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Không có sản phẩm nào trong hóa đơn này
                    </td>
                  </tr>
                ) : (
                  invoiceDetails.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{item.tenSanPham}</td>
                      <td className="py-4 px-4 text-sm text-gray-600 text-right">{item.soLuong}</td>
                      <td className="py-4 px-4 text-sm text-gray-600 text-right">
                        {formatCurrency(item.donGia)}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(item.thanhTien)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Calculation */}
        <div className="border-t border-gray-200 pt-6">
          <div className="max-w-md ml-auto space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            {/* Always show discount row if discount > 0, even in print */}
            {discount > 0 ? (
              <div className="flex items-center justify-between text-sm print:block">
                <span className="text-gray-600">Giảm giá:</span>
                <span className="font-medium text-red-600">-{formatCurrency(discount)}</span>
              </div>
            ) : null}
            <div className="border-t-2 border-gray-300 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Tổng thanh toán:</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(total)}
                </span>
              </div>
              {/* Hiển thị điểm tích lũy nếu có */}
              {invoice.diemTichLuy !== undefined && invoice.diemTichLuy > 0 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Điểm tích lũy:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {invoice.diemTichLuy} điểm
                  </span>
                  <span className="text-xs text-gray-500 ml-1">(1.000 VND = 1 điểm)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
          <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
          <p className="mt-1">All time mở cửa – mọi cảm hứng bắt đầu từ đây.</p>
        </div>
      </div>



    </div>
  );
}

