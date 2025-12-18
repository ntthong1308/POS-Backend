import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Table, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { posAPI, CheckoutResponse } from '@/lib/api/pos';
import { useAuthStore } from '@/store/authStore';
import { invoicesAPI } from '@/lib/api/invoices';
import { toast } from 'sonner';

// Danh sách bàn từ 1 đến 10
const tables = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  name: `Bàn ${i + 1}`,
}));

export default function TableSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedTable, restoreCartFromInvoice, setCustomer, setDiscount, selectedTable, items, clearCart } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [pendingInvoices, setPendingInvoices] = useState<CheckoutResponse[]>([]);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<number | null>(null);

  // Load danh sách hóa đơn đang treo
  const loadPendingInvoices = useCallback(async () => {
    if (!user?.chiNhanhId) {
      return;
    }

    try {
      console.log('[TableSelection] Loading pending invoices for branch:', user.chiNhanhId);
      const invoices = await posAPI.getPendingInvoices(user.chiNhanhId);
      console.log('[TableSelection] Loaded invoices from API:', invoices);
      console.log('[TableSelection] Total invoices from API:', invoices?.length || 0);
      
      // ✅ QUAN TRỌNG: Filter chỉ lấy invoices có status PENDING
      // Backend có thể trả về cả COMPLETED và CANCELLED invoices, nên cần filter ở frontend
      const pendingOnly = (invoices || []).filter(inv => {
        // Check status: chỉ lấy PENDING invoices (loại bỏ COMPLETED, CANCELLED, REFUNDED)
        const status = inv.trangThai || inv.status || (inv as any).trangThai;
        const statusUpper = status ? String(status).toUpperCase() : '';
        
        // Chỉ chấp nhận PENDING
        const isPending = statusUpper === 'PENDING';
        
        // Loại bỏ tất cả status khác
        const isNotPending = statusUpper === 'COMPLETED' || 
                            statusUpper === 'CANCELLED' || 
                            statusUpper === 'REFUNDED' ||
                            statusUpper === 'CANCELED'; // Có thể có typo
        
        if (isNotPending) {
          console.warn('[TableSelection] ❌ Filtering out invoice:', {
            id: inv.id,
            maHoaDon: inv.maHoaDon,
            status: status,
            statusUpper: statusUpper,
            ghiChu: inv.ghiChu
          });
          return false;
        }
        
        if (!isPending) {
          console.warn('[TableSelection] ⚠️ Invoice with unknown status:', {
            id: inv.id,
            maHoaDon: inv.maHoaDon,
            status: status,
            statusUpper: statusUpper
          });
          return false;
        }
        
        console.log('[TableSelection] ✅ Valid PENDING invoice:', {
          id: inv.id,
          maHoaDon: inv.maHoaDon,
          status: status
        });
        return true;
      });
      
      console.log('[TableSelection] Filtered pending invoices:', pendingOnly);
      console.log('[TableSelection] Total PENDING invoices after filter:', pendingOnly.length);
      setPendingInvoices(pendingOnly);
    } catch (error: any) {
      console.error('[TableSelection] Error loading pending invoices:', error);
      setPendingInvoices([]);
    }
  }, [user?.chiNhanhId]);

  // Load khi component mount hoặc user thay đổi
  useEffect(() => {
    loadPendingInvoices();
  }, [loadPendingInvoices]);

  // Reload khi navigate về từ route khác (ví dụ: từ VNPay callback)
  useEffect(() => {
    // Chỉ reload nếu đang ở route /pos (không phải /pos/table/:id)
    if (location.pathname === '/pos') {
      console.log('[TableSelection] Navigated to /pos, reloading pending invoices...');
      loadPendingInvoices();
    }
  }, [location.pathname, loadPendingInvoices]);

  // Reload khi window focus (user quay lại từ VNPay callback hoặc tab khác)
  useEffect(() => {
    const handleFocus = () => {
      console.log('[TableSelection] Window focused, reloading pending invoices...');
      loadPendingInvoices();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadPendingInvoices]);

  // Reload khi component visible (khi navigate về từ trang khác)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[TableSelection] Page visible, reloading pending invoices...');
        loadPendingInvoices();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadPendingInvoices]);

  // Memoize getTableFromInvoice function to avoid recreating on every render
  const getTableFromInvoice = useCallback((invoice: CheckoutResponse): string | null => {
    if (!invoice.ghiChu) return null;
    const match = invoice.ghiChu.match(/Bàn:\s*(\d+)/i);
    return match ? match[1] : null;
  }, []);

  // Memoize getPendingInvoiceForTable to avoid recalculating on every render
  // ✅ QUAN TRỌNG: Chỉ lấy invoice có status PENDING và lấy invoice mới nhất nếu có nhiều
  const getPendingInvoiceForTable = useCallback((tableId: string): CheckoutResponse | undefined => {
    // Filter invoices cho bàn này và chỉ lấy PENDING
    const invoicesForTable = pendingInvoices.filter(inv => {
      const tableFromInvoice = getTableFromInvoice(inv);
      const status = inv.trangThai || inv.status || (inv as any).trangThai;
      const statusUpper = status ? String(status).toUpperCase() : '';
      const isPending = statusUpper === 'PENDING';
      
      // Chỉ lấy invoice PENDING cho bàn này
      if (tableFromInvoice === tableId && isPending) {
        return true;
      }
      
      // Log nếu có invoice không PENDING cho bàn này
      if (tableFromInvoice === tableId && !isPending) {
        console.warn('[TableSelection] ⚠️ Found non-PENDING invoice for table:', {
          tableId: tableId,
          invoiceId: inv.id,
          maHoaDon: inv.maHoaDon,
          status: status,
          statusUpper: statusUpper,
          ghiChu: inv.ghiChu
        });
      }
      
      return false;
    });
    
    // ✅ QUAN TRỌNG: Nếu có nhiều invoices PENDING cho cùng một bàn
    // → Chỉ hiển thị invoice mới nhất, các invoice cũ nên được complete/xóa bởi backend
    if (invoicesForTable.length > 1) {
      console.warn('[TableSelection] ⚠️ Multiple PENDING invoices for table:', {
        tableId: tableId,
        count: invoicesForTable.length,
        invoiceIds: invoicesForTable.map(inv => inv.id),
        invoiceMaHoaDons: invoicesForTable.map(inv => inv.maHoaDon)
      });
      
      // Sort theo ngayTao giảm dần (mới nhất trước)
      invoicesForTable.sort((a, b) => {
        const dateA = new Date(a.ngayTao).getTime();
        const dateB = new Date(b.ngayTao).getTime();
        return dateB - dateA; // Mới nhất trước
      });
      
      console.log('[TableSelection] Using newest invoice:', {
        invoiceId: invoicesForTable[0].id,
        maHoaDon: invoicesForTable[0].maHoaDon,
        ngayTao: invoicesForTable[0].ngayTao,
        tableId: tableId
      });
      
      // ⚠️ CẢNH BÁO: Có nhiều invoices PENDING cho cùng một bàn
      // Backend nên complete/xóa các invoices cũ khi tạo invoice mới
      if (invoicesForTable.length > 3) {
        console.error('[TableSelection] ❌ CRITICAL: Too many PENDING invoices for table:', {
          tableId: tableId,
          count: invoicesForTable.length,
          message: 'Backend should complete/delete old invoices when creating new ones'
        });
      }
    }
    
    if (invoicesForTable.length > 0) {
      console.log('[TableSelection] ✅ Found PENDING invoice for table:', {
        tableId: tableId,
        invoiceId: invoicesForTable[0].id,
        maHoaDon: invoicesForTable[0].maHoaDon,
        status: invoicesForTable[0].trangThai,
        totalPendingForTable: invoicesForTable.length
      });
    }
    
    return invoicesForTable[0]; // Trả về invoice đầu tiên (mới nhất nếu đã sort)
  }, [pendingInvoices, getTableFromInvoice]);

  const handleTableSelect = useCallback(async (tableId: string) => {
    setSelectedTableId(tableId);
    setSelectedTable(tableId);
    
    // Nếu bàn đang treo bill, load và restore cart
    const pendingInvoice = getPendingInvoiceForTable(tableId);
    if (pendingInvoice) {
      try {
        // ✅ Sử dụng API resume mới để lấy chi tiết đơn PENDING
        console.log('[TableSelection] Resuming invoice:', pendingInvoice.id);
        const invoiceDetails = await posAPI.resumeInvoice(pendingInvoice.id);
        
        // Check status từ backend response
        const actualStatus = invoiceDetails.trangThai || (invoiceDetails as any).trangThai;
        const statusUpper = actualStatus ? String(actualStatus).toUpperCase() : '';
        
        if (statusUpper !== 'PENDING') {
          console.warn('[TableSelection] Invoice is not PENDING, cannot restore:', {
            invoiceId: pendingInvoice.id,
            actualStatus: actualStatus,
            statusUpper: statusUpper
          });
          toast.warning(`Hóa đơn "${pendingInvoice.maHoaDon}" đã ${actualStatus === 'COMPLETED' ? 'hoàn thành' : 'hủy'}, không thể khôi phục. Đang cập nhật danh sách...`);
          // Reload để cập nhật danh sách
          await loadPendingInvoices();
          return;
        }
        
        // Load products để restore cart
        const products = await posAPI.getProducts();
        
        // Restore cart từ invoice (bao gồm cả invoice.id để track)
        restoreCartFromInvoice(invoiceDetails, products);
        
        // Restore customer nếu có
        if (invoiceDetails.khachHangId && invoiceDetails.tenKhachHang) {
          setCustomer({
            id: invoiceDetails.khachHangId,
            name: invoiceDetails.tenKhachHang,
            phone: invoiceDetails.soDienThoaiKhachHang,
            points: invoiceDetails.diemTichLuy,
          });
        }
        
        // KHÔNG restore discount nếu không có promotion
        // Discount chỉ được restore khi có promotion tương ứng
        // Nếu invoice có giamGia nhưng không có maKhuyenMai, không restore discount
        // để tránh hiện "áp mã giảm giá" khi không có promotion
        setDiscount(0); // Clear discount - user có thể chọn promotion lại nếu muốn
        
        console.log('[TableSelection] Restored cart from pending invoice:', invoiceDetails);
        toast.success(`Đã mở lại đơn hàng ${invoiceDetails.maHoaDon}`);
      } catch (error: any) {
        console.error('[TableSelection] Error resuming invoice:', error);
        toast.error(error.response?.data?.message || 'Không thể mở lại đơn hàng. Vui lòng thử lại.');
        // Vẫn navigate dù có lỗi
      }
    }
    
    // Navigate to POS page with table ID
    navigate(`/pos/table/${tableId}`);
  }, [navigate, setSelectedTable, getPendingInvoiceForTable, restoreCartFromInvoice, setCustomer, setDiscount, loadPendingInvoices]);

  // Memoize formatCurrency function
  const formatCurrency = useCallback((amount: number): string => {
    return Math.round(amount).toLocaleString('vi-VN') + '₫';
  }, []);

  // Xóa bill treo - Xóa TẤT CẢ invoices PENDING cũ của bàn đó
  const handleDeletePendingBill = useCallback(async (e: React.MouseEvent, invoice: CheckoutResponse) => {
    e.stopPropagation(); // Ngăn click vào bàn
    e.preventDefault(); // Ngăn default behavior
    
    // Check invoice status - chỉ cho phép xóa PENDING invoices
    const invoiceStatus = (invoice.trangThai || invoice.status || '').toUpperCase();
    if (invoiceStatus && invoiceStatus !== 'PENDING') {
      toast.warning(`Hóa đơn "${invoice.maHoaDon}" đã ${invoiceStatus === 'COMPLETED' ? 'hoàn thành' : 'hủy'} (${invoiceStatus}), không thể xóa. Đang cập nhật danh sách...`);
      // Reload để cập nhật danh sách (invoice sẽ không còn hiển thị nếu đã COMPLETED)
      await loadPendingInvoices();
      return;
    }
    
    // Lấy số bàn từ invoice
    const invoiceTable = getTableFromInvoice(invoice);
    
    // ✅ Tìm TẤT CẢ invoices PENDING cho bàn này
    const allPendingInvoicesForTable = pendingInvoices.filter(inv => {
      const tableFromInvoice = getTableFromInvoice(inv);
      const status = (inv.trangThai || inv.status || '').toUpperCase();
      return tableFromInvoice === invoiceTable && status === 'PENDING';
    });
    
    // Sort theo ngayTao để lấy invoice mới nhất
    allPendingInvoicesForTable.sort((a, b) => {
      const dateA = new Date(a.ngayTao).getTime();
      const dateB = new Date(b.ngayTao).getTime();
      return dateB - dateA; // Mới nhất trước
    });
    
    const newestInvoice = allPendingInvoicesForTable[0];
    const oldInvoices = allPendingInvoicesForTable.slice(1); // Tất cả invoices cũ
    
    // Nếu có nhiều invoices, xóa tất cả (kể cả invoice mới nhất)
    // Nếu chỉ có 1 invoice, xóa nó
    const invoicesToDelete = allPendingInvoicesForTable.length > 1 
      ? allPendingInvoicesForTable // Xóa tất cả
      : [invoice]; // Chỉ xóa 1 invoice
    
    const confirmMessage = invoicesToDelete.length > 1
      ? `Bàn ${invoiceTable} có ${allPendingInvoicesForTable.length} bill treo. Bạn có chắc chắn muốn xóa TẤT CẢ?`
      : `Bạn có chắc chắn muốn xóa bill treo "${invoice.maHoaDon}"?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // Set loading state
    setDeletingInvoiceId(invoice.id);
    
    try {
      console.log('[TableSelection] Deleting pending bills for table:', {
        table: invoiceTable,
        totalInvoices: allPendingInvoicesForTable.length,
        invoicesToDelete: invoicesToDelete.map(inv => ({ id: inv.id, maHoaDon: inv.maHoaDon })),
        newestInvoice: newestInvoice ? { id: newestInvoice.id, maHoaDon: newestInvoice.maHoaDon } : null
      });
      
      // ✅ Sử dụng API cancel-pending mới để hủy đơn PENDING
      // Xóa từng invoice một
      for (const invToDelete of invoicesToDelete) {
        try {
          await posAPI.cancelPendingInvoice(invToDelete.id);
          console.log('[TableSelection] Cancelled pending invoice:', invToDelete.id);
        } catch (error: any) {
          console.error('[TableSelection] Error cancelling invoice:', invToDelete.id, error);
          // Tiếp tục xóa các invoice khác dù có lỗi
        }
      }
      
      // ✅ Optimistic update: Xóa tất cả invoices khỏi state ngay để UI cập nhật tức thì
      setPendingInvoices(prev => prev.filter(inv => {
        const tableFromInvoice = getTableFromInvoice(inv);
        return tableFromInvoice !== invoiceTable; // Xóa tất cả invoices của bàn này
      }));
      
      console.log('[TableSelection] All pending bills cancelled successfully for table:', invoiceTable);
      
      // Nếu đang ở POS page của bàn này và có items trong cart, xóa hết sản phẩm
      if (invoiceTable && selectedTable === invoiceTable && items.length > 0) {
        clearCart();
        toast.info('Đã xóa hết sản phẩm đã chọn trong giỏ hàng');
      }
      
      // ✅ Reload pending invoices để đảm bảo sync với backend
      // Đợi một chút để backend xử lý xong
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload pending invoices
      if (user?.chiNhanhId) {
        try {
          console.log('[TableSelection] Reloading pending invoices after deletion...');
          const updatedPendingInvoices = await posAPI.getPendingInvoices(user.chiNhanhId);
          console.log('[TableSelection] Reloaded invoices from API:', updatedPendingInvoices);
          
          // ✅ QUAN TRỌNG: Filter lại để loại bỏ CANCELLED, COMPLETED, REFUNDED
          const filtered = (updatedPendingInvoices || []).filter(inv => {
            const status = (inv.trangThai || inv.status || '').toUpperCase();
            const isPending = status === 'PENDING';
            const isNotPending = status === 'COMPLETED' || status === 'CANCELLED' || status === 'REFUNDED' || status === 'CANCELED';
            
            if (isNotPending) {
              console.log('[TableSelection] ❌ Filtering out deleted invoice:', inv.id, 'Status:', status);
              return false;
            }
            
            if (isPending) {
              console.log('[TableSelection] ✅ Valid PENDING invoice after deletion:', inv.id, 'Status:', status);
            }
            
            return isPending;
          });
          
          console.log('[TableSelection] Filtered pending invoices after deletion:', filtered);
          
          // Cập nhật state với danh sách đã filter
          setPendingInvoices(filtered);
          
          // Force re-render bằng cách update selectedTableId nếu đang selected
          if (invoiceTable && selectedTableId === invoiceTable) {
            setSelectedTableId(null);
          }
        } catch (reloadError) {
          console.error('[TableSelection] Error reloading pending invoices:', reloadError);
          // Fallback: gọi loadPendingInvoices để filter đúng
          await loadPendingInvoices();
        }
      }
      
      const successMessage = invoicesToDelete.length > 1
        ? `Đã xóa ${invoicesToDelete.length} bill treo của bàn ${invoiceTable} thành công`
        : `Đã xóa bill treo "${invoice.maHoaDon}" thành công`;
      toast.success(successMessage);
    } catch (error: any) {
      console.error('[TableSelection] Error deleting pending bills:', error);
      
      // ✅ Rollback: Reload lại danh sách nếu xóa thất bại
      await loadPendingInvoices();
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.message ||
                          'Xóa bill treo thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      // Clear loading state
      setDeletingInvoiceId(null);
    }
  }, [pendingInvoices, getTableFromInvoice, loadPendingInvoices, selectedTable, items, clearCart, user?.chiNhanhId]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 shadow-lg">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Table className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm">Chọn bàn</h1>
              <p className="text-orange-50 text-sm mt-1 font-medium">Vui lòng chọn bàn để bắt đầu đơn hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {tables.map((table) => {
            const isSelected = selectedTableId === table.id;
            const pendingInvoice = getPendingInvoiceForTable(table.id);
            const hasPendingBill = !!pendingInvoice;

            return (
              <div
                key={table.id}
                className={cn(
                  "relative group rounded-2xl border-2 transition-all duration-300 ease-out",
                  "flex flex-col items-center justify-center",
                  "hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]",
                  isSelected
                    ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-xl shadow-orange-200/50 ring-2 ring-orange-400 ring-offset-2"
                    : hasPendingBill
                    ? "border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg shadow-amber-200/30 hover:border-amber-500"
                    : "border-gray-200 bg-white hover:border-orange-400 hover:bg-gradient-to-br hover:from-white hover:to-orange-50/50 shadow-md hover:shadow-xl",
                  "cursor-pointer overflow-hidden"
                )}
              >
                {/* Animated background gradient on hover */}
                {!isSelected && !hasPendingBill && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all duration-300 rounded-2xl" />
                )}

                {/* Pending Bill Badge & Delete Button */}
                {hasPendingBill && pendingInvoice && (
                  <>
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 shadow-md flex items-center gap-1.5 z-10 border border-amber-300">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Đang treo</span>
                    </div>
                    <button
                      onClick={(e) => handleDeletePendingBill(e, pendingInvoice)}
                      disabled={deletingInvoiceId === pendingInvoice.id}
                      className={cn(
                        "absolute top-3 left-3 p-2 rounded-full transition-all duration-200 z-10 shadow-md",
                        deletingInvoiceId === pendingInvoice.id
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-110 active:scale-95"
                      )}
                      title={deletingInvoiceId === pendingInvoice.id ? "Đang xóa..." : "Xóa bill treo"}
                    >
                      {deletingInvoiceId === pendingInvoice.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
                
                {/* Clickable area for table selection */}
                <button
                  onClick={() => handleTableSelect(table.id)}
                  className="w-full h-full flex flex-col items-center justify-center gap-5 p-8 relative z-0"
                >
                  {/* Table Icon with animated glow */}
                  <div
                    className={cn(
                      "w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300",
                      "shadow-lg relative",
                      isSelected
                        ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-400/50 scale-110"
                        : hasPendingBill
                        ? "bg-gradient-to-br from-amber-300 to-yellow-400 text-amber-900 shadow-amber-300/50"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-orange-100 group-hover:to-orange-200 group-hover:text-orange-600"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 rounded-2xl bg-white/30 animate-pulse" />
                    )}
                    <Table className={cn(
                      "transition-transform duration-300 relative z-10",
                      isSelected ? "w-12 h-12 scale-110" : "w-11 h-11 group-hover:scale-110"
                    )} />
                  </div>

                  {/* Table Name */}
                  <div className="text-center space-y-1">
                    <p className={cn(
                      "text-2xl font-extrabold transition-colors duration-300",
                      isSelected ? "text-orange-700" : hasPendingBill ? "text-amber-900" : "text-gray-800 group-hover:text-orange-700"
                    )}>
                      {table.name}
                    </p>
                    {/* Hiển thị số tiền nếu đang treo bill */}
                    {hasPendingBill && pendingInvoice && (
                      <div className="mt-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200">
                        <p className="text-sm font-bold text-amber-900">
                          {formatCurrency(pendingInvoice.tongTien || pendingInvoice.thanhTien)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selected Indicator with pulse animation */}
                  {isSelected && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                      <div className="w-3 h-3 bg-orange-500 rounded-full absolute" />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
