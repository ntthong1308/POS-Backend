import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Invoice } from '@/lib/types';
import { Search, RefreshCw, TrendingUp, TrendingDown, Receipt, FileText, DollarSign, Clock, CheckCircle2, Eye, Download, ChevronDown, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { invoicesAPI } from '@/lib/api/invoices';
import { toast } from 'sonner';
import PageLoading from '@/components/common/PageLoading';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { logger } from '@/lib/utils/logger';

// ✅ Helper function để lấy local date string (YYYY-MM-DD) từ Date object
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Mock data for invoices (fallback)
const mockInvoices: Invoice[] = [
  {
    id: 1,
    maHoaDon: 'HD001',
    khachHangId: 1,
    nhanVienId: 1,
    tongTien: 3250000,
    tienGiam: 0,
    thanhToan: 3250000,
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
    tongTien: 2100000,
    tienGiam: 100000,
    thanhToan: 2000000,
    phuongThucThanhToan: 'VISA',
    trangThai: 'COMPLETED',
    ngayTao: '2024-03-16T14:20:00',
  },
  {
    id: 3,
    maHoaDon: 'HD003',
    khachHangId: 3,
    nhanVienId: 1,
    tongTien: 150000,
    tienGiam: 0,
    thanhToan: 150000,
    phuongThucThanhToan: 'CASH',
    trangThai: 'PENDING',
    ngayTao: '2024-02-15T09:15:00',
  },
  {
    id: 4,
    maHoaDon: 'HD004',
    khachHangId: 4,
    nhanVienId: 1,
    tongTien: 840000,
    tienGiam: 50000,
    thanhToan: 790000,
    phuongThucThanhToan: 'MASTER',
    trangThai: 'COMPLETED',
    ngayTao: '2024-03-17T16:45:00',
  },
  {
    id: 5,
    maHoaDon: 'HD005',
    khachHangId: 5,
    nhanVienId: 1,
    tongTien: 360000,
    tienGiam: 0,
    thanhToan: 360000,
    phuongThucThanhToan: 'CASH',
    trangThai: 'COMPLETED',
    ngayTao: '2024-03-10T11:30:00',
  },
  {
    id: 6,
    maHoaDon: 'HD006',
    khachHangId: 1,
    nhanVienId: 1,
    tongTien: 1200000,
    tienGiam: 0,
    thanhToan: 1200000,
    phuongThucThanhToan: 'VISA',
    trangThai: 'COMPLETED',
    ngayTao: '2024-03-12T08:20:00',
  },
  {
    id: 7,
    maHoaDon: 'HD007',
    khachHangId: 2,
    nhanVienId: 1,
    tongTien: 950000,
    tienGiam: 50000,
    thanhToan: 900000,
    phuongThucThanhToan: 'CASH',
    trangThai: 'COMPLETED',
    ngayTao: '2024-03-11T15:30:00',
  },
  {
    id: 8,
    maHoaDon: 'HD008',
    khachHangId: 3,
    nhanVienId: 1,
    tongTien: 550000,
    tienGiam: 0,
    thanhToan: 550000,
    phuongThucThanhToan: 'MASTER',
    trangThai: 'PENDING',
    ngayTao: '2024-03-18T10:00:00',
  },
];

// Mock customer names
const mockCustomerNames: Record<number, string> = {
  1: 'Nguyễn Văn An',
  2: 'Trần Thị Bình',
  3: 'Lê Văn Cường',
  4: 'Phạm Thị Dung',
  5: 'Hoàng Văn Em',
};


type FilterStatus = 'all' | 'completed' | 'cancelled' | 'pending';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm, Dialog } = useConfirmDialog();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]); // Lưu tất cả invoices để tính counts
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const prevLocationRef = useRef<string>('');

  // Quick date filter helpers
  const setQuickDateFilter = (period: 'today' | 'thisWeek' | 'thisMonth' | 'lastMonth') => {
    const today = new Date();
    let from: Date, to: Date = today;

    switch (period) {
      case 'today':
        from = new Date(today);
        from.setHours(0, 0, 0, 0);
        break;
      case 'thisWeek':
        from = new Date(today);
        from.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        from.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
    }

    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to.toISOString().split('T')[0]);
  };


  // Extract loadInvoices function để có thể gọi lại từ nút refresh
  const loadInvoices = useCallback(async (forceIncludeToday = false) => {
    setLoading(true);
    try {
      // Nếu không có dateFrom/dateTo, load hóa đơn trong 30 ngày gần nhất để đảm bảo có đủ dữ liệu
      // Nếu đang filter "Đã hủy" hoặc "Tất cả", mở rộng phạm vi lên 90 ngày để có đủ dữ liệu từ tất cả trạng thái
      // Nếu đang filter "Đang xử lý", chỉ cần 30 ngày (PENDING invoices thường gần đây)
      let fromDate = dateFrom;
      let toDate = dateTo;
      const daysToLoad = (statusFilter === 'cancelled' || statusFilter === 'all') ? 90 : 30;
      
      // ✅ Nếu forceIncludeToday = true (khi reload sau khi tạo invoice mới), đảm bảo date range bao gồm hôm nay
      if (forceIncludeToday) {
        // ✅ QUAN TRỌNG: Luôn lấy ngày hiện tại THỰC SỰ, không dùng state cũ
        // Sử dụng local date để tránh timezone issues
        const now = new Date();
        const todayYear = now.getFullYear();
        const todayMonth = now.getMonth();
        const todayDay = now.getDate();
        const todayStr = `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;
        
        logger.info('[InvoicesPage] ⚠️ forceIncludeToday=true, FORCING date range to include TODAY:', todayStr);
        logger.debug('[InvoicesPage] Current time:', now.toISOString());
        logger.debug('[InvoicesPage] Current state dateFrom:', dateFrom, 'dateTo:', dateTo);
        
        // ✅ FORCE override: LUÔN set toDate = hôm nay THỰC SỰ, bất kể state hiện tại
        toDate = todayStr;
        logger.info('[InvoicesPage] ✅ FORCED toDate to TODAY:', toDate);
        
        // ✅ Đảm bảo fromDate không lớn hơn hôm nay
        // Nếu fromDate > hôm nay hoặc không có fromDate, set từ N ngày trước
        if (fromDate && fromDate > todayStr) {
          const daysAgo = new Date(todayYear, todayMonth, todayDay);
          daysAgo.setDate(daysAgo.getDate() - daysToLoad);
          const daysAgoYear = daysAgo.getFullYear();
          const daysAgoMonth = daysAgo.getMonth();
          const daysAgoDay = daysAgo.getDate();
          fromDate = `${daysAgoYear}-${String(daysAgoMonth + 1).padStart(2, '0')}-${String(daysAgoDay).padStart(2, '0')}`;
          logger.debug('[InvoicesPage] fromDate was in future, reset to:', fromDate);
        } else if (!fromDate) {
          const daysAgo = new Date(todayYear, todayMonth, todayDay);
          daysAgo.setDate(daysAgo.getDate() - daysToLoad);
          const daysAgoYear = daysAgo.getFullYear();
          const daysAgoMonth = daysAgo.getMonth();
          const daysAgoDay = daysAgo.getDate();
          fromDate = `${daysAgoYear}-${String(daysAgoMonth + 1).padStart(2, '0')}-${String(daysAgoDay).padStart(2, '0')}`;
          logger.debug('[InvoicesPage] No fromDate, set to:', fromDate);
        }
        
        logger.info('[InvoicesPage] ✅ FINAL date range for reload (forceIncludeToday):', { fromDate, toDate });
        logger.info('[InvoicesPage] ⚠️ This should include invoices created TODAY:', todayStr);
      } else if (!fromDate && !toDate) {
        // ✅ Nếu không có date filter, load hóa đơn trong N ngày gần nhất
        const today = new Date();
        const daysAgo = new Date();
        daysAgo.setDate(today.getDate() - daysToLoad);
        fromDate = getLocalDateString(daysAgo);
        toDate = getLocalDateString(today);
      } else if (!fromDate && toDate) {
        // ✅ Nếu chỉ có toDate, lấy N ngày trước đó
        // toDate đã là string format YYYY-MM-DD, parse thành Date object để tính toán
        const toDateObj = new Date(toDate + 'T00:00:00'); // Thêm time để parse đúng local time
        const fromDateObj = new Date(toDateObj);
        fromDateObj.setDate(fromDateObj.getDate() - daysToLoad);
        fromDate = getLocalDateString(fromDateObj);
      } else if (fromDate && !toDate) {
        // ✅ Nếu chỉ có fromDate, lấy đến hôm nay
        toDate = getLocalDateString(new Date());
      }
      // ✅ Nếu có cả fromDate và toDate, sử dụng trực tiếp (user đã chọn date range)
      
      let invoices: Invoice[] = [];
      let allInvoicesData: Invoice[] = [];
      
      logger.debug('[InvoicesPage] Loading invoices with params:', { fromDate, toDate, statusFilter });
      
      // Luôn load tất cả invoices để tính counts cho các tab
      const [completed, pending, cancelled] = await Promise.all([
        invoicesAPI.getByDate({ fromDate, toDate, status: 'COMPLETED' }),
        invoicesAPI.getByDate({ fromDate, toDate, status: 'PENDING' }),
        invoicesAPI.getByDate({ fromDate, toDate, status: 'CANCELLED' }),
      ]);
      
      logger.debug('[InvoicesPage] Loaded invoices:', { 
        completed: completed.length, 
        pending: pending.length, 
        cancelled: cancelled.length 
      });
      
      // Merge và loại bỏ duplicate (dựa trên id)
      allInvoicesData = [...completed, ...pending, ...cancelled];
      const uniqueAllInvoices = allInvoicesData.filter((invoice, index, self) =>
        index === self.findIndex(i => i.id === invoice.id)
      );
      
      // Lưu tất cả invoices để tính counts
      setAllInvoices(uniqueAllInvoices.length > 0 ? uniqueAllInvoices : mockInvoices);
      
      // Filter invoices theo tab hiện tại
      if (statusFilter === 'all') {
        invoices = uniqueAllInvoices;
      } else if (statusFilter === 'completed') {
        invoices = completed;
      } else if (statusFilter === 'pending') {
        invoices = pending;
      } else if (statusFilter === 'cancelled') {
        invoices = cancelled;
      }
      
      logger.debug('[InvoicesPage] Filtered invoices for tab:', { 
        statusFilter, 
        count: invoices.length,
        invoiceIds: invoices.map(i => i.id).slice(0, 10) // Log first 10 IDs
      });
      
      setInvoices(invoices.length > 0 ? invoices : mockInvoices);
    } catch (error: any) {
      logger.error('Error loading invoices:', error);
      setInvoices(mockInvoices);
      toast.error('Không thể tải danh sách hóa đơn. Đang dùng dữ liệu mẫu.');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, statusFilter]);

  // ✅ Auto-update date range khi qua ngày mới (check mỗi phút)
  useEffect(() => {
    const checkDateChange = () => {
      // Nếu có dateTo được set và nó < hôm nay, có thể cần update
      // Nhưng chỉ update nếu user không đang filter (dateTo rỗng hoặc = hôm nay)
      const today = new Date();
      const todayStr = getLocalDateString(today);
      
      // Nếu dateTo được set và < hôm nay, và không có dateFrom (user không filter), tự động update
      if (dateTo && dateTo < todayStr && !dateFrom) {
        logger.info('[InvoicesPage] 📅 Date changed! Auto-updating dateTo from', dateTo, 'to', todayStr);
        setDateTo(todayStr);
      }
    };
    
    // Check ngay lập tức
    checkDateChange();
    
    // Check mỗi phút để detect khi qua ngày mới
    const interval = setInterval(checkDateChange, 60 * 1000); // 1 minute
    
    return () => clearInterval(interval);
  }, [dateFrom, dateTo]);

  // Load invoices khi component mount hoặc dependencies thay đổi
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Auto-refresh khi quay lại trang từ invoice detail page (detect route change)
  useEffect(() => {
    // Nếu quay lại từ invoice detail page (/invoices/:id), reload invoices
    if (prevLocationRef.current.startsWith('/invoices/') && location.pathname === '/invoices') {
      logger.debug('[InvoicesPage] Returned from invoice detail page, reloading invoices...');
      loadInvoices();
    }
    // Nếu có state từ payment, reload invoices
    if (location.state?.from === 'payment') {
      logger.debug('[InvoicesPage] Returned from payment, reloading invoices...');
      loadInvoices();
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname, location.state, loadInvoices]);

  // ✅ Listen for custom event when invoice is created (from payment page)
  useEffect(() => {
    const handleInvoiceCreated = (event: CustomEvent) => {
      logger.info('[InvoicesPage] 🔔 Invoice created event received!', event.detail);
      logger.debug('[InvoicesPage] Event detail:', JSON.stringify(event.detail));
      // Reload invoices after a short delay to ensure backend has processed
      // ✅ forceIncludeToday = true để đảm bảo hóa đơn mới (tạo hôm nay) luôn được hiển thị
      setTimeout(() => {
        logger.debug('[InvoicesPage] 🔄 Calling loadInvoices(true) to reload with forceIncludeToday...');
        loadInvoices(true);
      }, 500);
    };

    logger.debug('[InvoicesPage] ✅ Setting up invoice-created event listener');
    window.addEventListener('invoice-created', handleInvoiceCreated as EventListener);
    return () => {
      logger.debug('[InvoicesPage] 🧹 Cleaning up invoice-created event listener');
      window.removeEventListener('invoice-created', handleInvoiceCreated as EventListener);
    };
  }, [loadInvoices]);

  // Auto-refresh khi quay lại trang (visibilitychange event - tốt hơn focus event)
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Reload invoices khi trang trở nên visible (khi quay lại từ invoice detail page)
      if (document.visibilityState === 'visible') {
        logger.debug('[InvoicesPage] Page became visible, reloading invoices...');
        loadInvoices();
      }
    };

    // Cũng listen focus event để đảm bảo reload khi quay lại tab
    const handleFocus = () => {
      logger.debug('[InvoicesPage] Window focused, reloading invoices...');
      loadInvoices();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadInvoices]);

  // Memoize filtered invoices to avoid recalculating on every render
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        result = result.filter(i => i.trangThai === 'COMPLETED');
      } else if (statusFilter === 'cancelled') {
        result = result.filter(i => i.trangThai === 'CANCELLED');
      } else if (statusFilter === 'pending') {
        result = result.filter(i => i.trangThai === 'PENDING');
      }
    }

    // Filter by search
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(i =>
        i.maHoaDon.toLowerCase().includes(keyword) ||
        (i.khachHangId && mockCustomerNames[i.khachHangId]?.toLowerCase().includes(keyword))
      );
    }

    // Filter by payment method
    if (paymentMethodFilter !== 'all') {
      result = result.filter(i => i.phuongThucThanhToan === paymentMethodFilter);
    }

    // Filter by date range - ✅ Sửa: So sánh date string (YYYY-MM-DD) thay vì Date object để tránh timezone issues
    // ⚠️ LƯU Ý: Nếu user đã chọn dateFrom và dateTo, API đã filter rồi, nhưng vẫn filter lại ở client side để đảm bảo chính xác
    if (dateFrom || dateTo) {
      result = result.filter(i => {
        if (!i.ngayTao) return false;
        
        try {
          // ✅ Extract date string (YYYY-MM-DD) từ invoice ngayTao
          const invoiceDate = new Date(i.ngayTao);
          // ✅ Đảm bảo parse đúng local time
          const invoiceDateStr = getLocalDateString(invoiceDate);
          
          if (dateFrom && dateTo) {
            // So sánh date strings trực tiếp (YYYY-MM-DD format)
            // dateFrom và dateTo đã là YYYY-MM-DD format từ input type="date"
            return invoiceDateStr >= dateFrom && invoiceDateStr <= dateTo;
          } else if (dateFrom) {
            return invoiceDateStr >= dateFrom;
          } else if (dateTo) {
            return invoiceDateStr <= dateTo;
          }
          return true;
        } catch (error) {
          logger.error('[InvoicesPage] Error parsing invoice date:', i.ngayTao, error);
          return false;
        }
      });
    }

    return result;
  }, [invoices, statusFilter, searchKeyword, paymentMethodFilter, dateFrom, dateTo]);

  // Handle download PDF
  const handleDeleteInvoice = useCallback(async (invoiceId: number, maHoaDon: string) => {
    const confirmed = await confirm({
      title: 'Xóa hóa đơn',
      message: `Bạn có chắc chắn muốn xóa hóa đơn ${maHoaDon}? Hóa đơn sẽ được hủy và điểm tích lũy sẽ bị trừ.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      variant: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      const deletedInvoice = await invoicesAPI.delete(invoiceId);
      toast.success(`Đã xóa hóa đơn ${maHoaDon} thành công`);
      
      // Reload invoices với cùng filter hiện tại
      const daysToLoad = statusFilter === 'cancelled' ? 90 : 30;
      let fromDate = dateFrom;
      let toDate = dateTo;
      
      if (!fromDate && !toDate) {
        const today = new Date();
        const daysAgo = new Date();
        daysAgo.setDate(today.getDate() - daysToLoad);
        fromDate = getLocalDateString(daysAgo);
        toDate = getLocalDateString(today);
      } else if (!fromDate) {
        const to = new Date(toDate);
        const from = new Date(to);
        from.setDate(from.getDate() - daysToLoad);
        fromDate = getLocalDateString(from);
      } else if (!toDate) {
        toDate = getLocalDateString(new Date());
      }
      
      // Xác định status parameter
      let status: 'COMPLETED' | 'CANCELLED' | 'PENDING' | undefined;
      if (statusFilter === 'cancelled') {
        status = 'CANCELLED';
      } else if (statusFilter === 'completed') {
        status = 'COMPLETED';
      } else if (statusFilter === 'pending') {
        status = 'PENDING';
      }
      
      const invoices = await invoicesAPI.getByDate({
        fromDate,
        toDate,
        status,
      });
      setInvoices(invoices.length > 0 ? invoices : mockInvoices);
    } catch (error: any) {
      logger.error('Error deleting invoice:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa hóa đơn');
    }
  }, [confirm, statusFilter, dateFrom, dateTo, mockInvoices]);

  const handleDownloadPDF = useCallback(async (invoiceId: number) => {
    try {
      // Call API to get PDF from backend
      invoicesAPI.print(invoiceId).then((blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Đã tải hóa đơn PDF thành công');
      }).catch((error: any) => {
        logger.error('Error downloading PDF:', error);
        toast.error(error.response?.data?.message || 'Không thể tải hóa đơn PDF. Vui lòng thử lại.');
      });
    } catch (error) {
      logger.error('Error downloading PDF:', error);
      toast.error('Không thể tải hóa đơn PDF. Vui lòng thử lại.');
    }
  }, []);

  // Calculate KPIs - Cards luôn hiển thị tổng quan (không phụ thuộc tab)
  // Tất cả cards tính từ allInvoices (tất cả trạng thái)
  const totalInvoices = allInvoices.length;
  
    const todayInvoices = allInvoices.filter(i => {
      const today = getLocalDateString(new Date());
      return i.ngayTao.startsWith(today);
    }).length;
  
  // Đã hoàn thành: số lượng COMPLETED từ tất cả invoices
  const completedInvoices = allInvoices.filter(i => i.trangThai === 'COMPLETED').length;
  
  // Tổng doanh thu: chỉ tính từ COMPLETED invoices
  const totalRevenue = allInvoices
    .filter(i => i.trangThai === 'COMPLETED')
    .reduce((sum, i) => sum + (i.thanhToan ?? i.thanhTien ?? 0), 0);

  // Calculate growth (mock)
  const revenueLastMonth = totalRevenue * 0.95; // Mock: 5% increase
  const revenueGrowth = revenueLastMonth > 0
    ? (((totalRevenue - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
    : '0.0';

  const statusCounts = {
    all: allInvoices.length,
    completed: allInvoices.filter(i => i.trangThai === 'COMPLETED').length,
    cancelled: allInvoices.filter(i => i.trangThai === 'CANCELLED').length,
    pending: allInvoices.filter(i => i.trangThai === 'PENDING').length,
  };

  const getStatusBadge = (status: string) => {
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
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'CASH': 'Tiền mặt',
      'VISA': 'Thẻ Visa',
      'MASTER': 'Thẻ Mastercard',
      'JCB': 'Thẻ JCB',
      'BANK_TRANSFER': 'Chuyển khoản',
      'VNPAY': 'VNPay',
      'MOMO': 'MoMo',
      'ZALOPAY': 'ZaloPay',
      'CARD': 'Thẻ',
      'OTHER': 'Khác',
    };
    return labels[method] || method;
  };

  // ✅ Format date: DD/MM/YYYY HH:mm (format Việt Nam)
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  // Format number with thousand separators (safe for undefined/null)
  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    return num.toLocaleString('vi-VN');
  };

  // Format currency (safe for undefined/null)
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '0₫';
    }
    // Làm tròn số tiền về số nguyên gần nhất
    const roundedAmount = Math.round(amount);
    return `${formatNumber(roundedAmount)}₫`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Hóa đơn</h1>
          <button 
            onClick={() => {
              logger.debug('[InvoicesPage] Manual refresh triggered');
              loadInvoices();
              toast.success('Đang tải lại danh sách hóa đơn...');
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Làm mới danh sách"
            disabled={loading}
          >
            <RefreshCw className={cn("w-5 h-5 text-gray-600", loading && "animate-spin")} />
          </button>
        </div>
        </div>
        
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
          <p className="text-xs text-gray-600 mb-1">Tổng hóa đơn</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(totalInvoices)}</p>
          <p className="text-xs text-gray-500">Tất cả thời gian</p>
      </div>

        {/* Today Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Hóa đơn hôm nay</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{todayInvoices}</p>
          <p className="text-xs text-gray-500">Đã tạo trong ngày</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-100">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            {Number(revenueGrowth) >= 0 && totalRevenue > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className="text-xs text-gray-600 mb-1">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(totalRevenue)}</p>
          <p className={cn(
            "text-xs",
            Number(revenueGrowth) >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {Number(revenueGrowth) >= 0 ? '+' : ''}{revenueGrowth}% so với tháng trước
          </p>
        </div>

        {/* Completed Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Đã hoàn thành</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{completedInvoices}</p>
          <p className="text-xs text-gray-500">Thanh toán xong</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { key: 'all', label: 'Tất cả hóa đơn', count: statusCounts.all },
            { key: 'completed', label: 'Đã hoàn thành', count: statusCounts.completed },
            { key: 'pending', label: 'Đang xử lý', count: statusCounts.pending },
            { key: 'cancelled', label: 'Đã hủy', count: statusCounts.cancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as FilterStatus)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                statusFilter === tab.key
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Search and Filters Row */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo mã hóa đơn, tên khách hàng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
            >
              <option value="all">Phương thức thanh toán</option>
              <option value="CASH">Tiền mặt</option>
              <option value="VNPAY">VNPay</option>
              <option value="VISA">Thẻ Visa</option>
              <option value="MASTER">Thẻ Mastercard</option>
              <option value="JCB">Thẻ JCB</option>
              <option value="BANK_TRANSFER">Chuyển khoản</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Từ ngày"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Đến ngày"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Xóa bộ lọc"
              >
                ✕
              </button>
            )}
          </div>
                </div>
              </div>

      {/* Invoices Table */}
      {loading ? (
        <PageLoading message="Đang tải hóa đơn..." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-400px)]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Mã hóa đơn
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Khách hàng
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Ngày tạo
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Tổng tiền
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phương thức</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Không có hóa đơn nào
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const statusBadge = getStatusBadge(invoice.trangThai);
                  // Use tenKhachHang from invoice if available, otherwise fallback to mock data
                  const customerName = invoice.tenKhachHang || 
                                       (invoice.khachHangId ? mockCustomerNames[invoice.khachHangId] : null) || 
                                       'Khách vãng lai';
                  return (
                    <tr key={invoice.id} className={cn(
                      "border-b border-gray-100 transition-all duration-200 group",
                      "hover:bg-orange-50/50 hover:shadow-sm",
                      filteredInvoices.indexOf(invoice) % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    )}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{invoice.maHoaDon}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-900">{customerName}</p>
                      {invoice.khachHangId && (
                        <p className="text-xs text-gray-500">KH{String(invoice.khachHangId).padStart(3, '0')}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {invoice.ngayTao ? formatDate(invoice.ngayTao) : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(invoice.thanhToan ?? invoice.thanhTien)}
                        </p>
                        {(invoice.tienGiam ?? invoice.giamGia ?? 0) > 0 && (
                          <p className="text-xs text-gray-500 line-through">
                            {formatCurrency(invoice.tongTien)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {getPaymentMethodLabel(invoice.phuongThucThanhToan)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        statusBadge.bgColor,
                        statusBadge.color
                      )}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(invoice.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-110"
                          title="Tải xuống PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {invoice.trangThai !== 'CANCELLED' && (
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id, invoice.maHoaDon)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                            title="Xóa hóa đơn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {Dialog}
    </div>
  );
}