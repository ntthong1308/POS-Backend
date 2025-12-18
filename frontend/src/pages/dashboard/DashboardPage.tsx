import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Users, Calendar, Loader2, Download, RefreshCw, Clock } from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { dashboardAPI, DashboardStats, TodayStats, OrderStatsByDate, SalesOverview, TopProduct } from '@/lib/api/dashboard';
import { reportsAPI, RevenueReport, TopProduct as ReportsTopProduct } from '@/lib/api/reports';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { logger } from '@/lib/utils/logger';
import StatCardSkeleton from '@/components/common/StatCardSkeleton';
import ChartSkeleton from '@/components/common/ChartSkeleton';

// ✅ Helper function để lấy local date string (YYYY-MM-DD) từ Date object
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format month name
const formatMonthName = (monthStr: string): string => {
  const monthMap: { [key: string]: string } = {
    '01': 'Tháng 1', '02': 'Tháng 2', '03': 'Tháng 3', '04': 'Tháng 4',
    '05': 'Tháng 5', '06': 'Tháng 6', '07': 'Tháng 7', '08': 'Tháng 8',
    '09': 'Tháng 9', '10': 'Tháng 10', '11': 'Tháng 11', '12': 'Tháng 12',
  };
  if (monthStr.includes('Tháng')) return monthStr;
  const month = monthStr.split('-')[1] || monthStr;
  return monthMap[month] || monthStr;
};

// Helper function to safely format numbers
const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString('vi-VN');
};

// Helper function to safely format currency
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0₫';
  }
  return `${value.toLocaleString('vi-VN')}₫`;
};

// Format change percentage
const formatChange = (change: number | undefined | null): string => {
  if (change === undefined || change === null || isNaN(change)) {
    return '0.0%';
  }
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

// Get change type (positive/negative)
const getChangeType = (change: number | undefined | null): 'positive' | 'negative' => {
  if (change === undefined || change === null || isNaN(change)) {
    return 'positive';
  }
  return change >= 0 ? 'positive' : 'negative';
};

// Calculate max value for chart scaling
const getMaxValue = (data: number[]): number => {
  return Math.max(...data, 1) * 1.1;
};

// Normalize data for chart (0-100%)
const normalizeData = (data: number[], maxValue: number): number[] => {
  return data.map(val => (val / maxValue) * 100);
};

// Format last update time
const formatLastUpdate = (date: Date): string => {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'reports'>('today');
  
  // Dashboard states
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // ✅ Sử dụng local time, không dùng UTC
    return getLocalDateString(new Date());
  });
  // ✅ Track xem user đã manually chọn ngày hay chưa (để tránh auto reset)
  const [userSelectedDate, setUserSelectedDate] = useState<boolean>(false);
  
  // Reports states
  const [reportsLoading, setReportsLoading] = useState(true);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [topProducts, setTopProducts] = useState<ReportsTopProduct[]>([]);
  const [reportPeriod, setReportPeriod] = useState<'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear'>('thisYear');
  const [downloading, setDownloading] = useState<string | null>(null);
  
  // Last update time
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh every 5 minutes (300000ms)
  useEffect(() => {
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

    const startAutoRefresh = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      refreshIntervalRef.current = setInterval(() => {
        if (activeTab === 'today') {
          loadDashboardStats(true);
        } else {
          loadReportsData(true);
        }
      }, REFRESH_INTERVAL);
    };

    startAutoRefresh();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [activeTab]);

  // ✅ Listen for custom event when invoice is created (from payment page)
  useEffect(() => {
    const handleInvoiceCreated = (event: CustomEvent) => {
      logger.info('[DashboardPage] Invoice created event received, reloading dashboard...', event.detail);
      // Reload dashboard after a short delay to ensure backend has processed
      setTimeout(() => {
        if (activeTab === 'today') {
          loadDashboardStats(true);
        } else {
          loadReportsData(true);
        }
      }, 500);
    };

    window.addEventListener('invoice-created', handleInvoiceCreated as EventListener);
    return () => {
      window.removeEventListener('invoice-created', handleInvoiceCreated as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Load dashboard stats
  const loadDashboardStats = async (silent = false) => {
    if (!silent) setDashboardLoading(true);
    try {
      const data = await dashboardAPI.getStats({ date: selectedDate });
      setDashboardStats(data);
      setLastUpdate(new Date());
    } catch (error: any) {
      logger.error('Error loading dashboard stats:', error);
      if (!silent) {
        toast.error('Không thể tải thống kê. Vui lòng thử lại.');
      }
    } finally {
      if (!silent) setDashboardLoading(false);
    }
  };

  // Load reports data
  const getDateRange = (period: string) => {
    const today = new Date();
    let startDate: Date;

    switch (period) {
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          startDate: getLocalDateString(startDate),
          endDate: getLocalDateString(endDate),
        };
      case 'last3Months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        break;
      case 'last6Months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        break;
      case 'thisYear':
      default:
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
    }

    return {
      startDate: getLocalDateString(startDate),
      endDate: getLocalDateString(today),
    };
  };

  const loadReportsData = async (silent = false) => {
    if (!silent) setReportsLoading(true);
    try {
      const { startDate, endDate } = getDateRange(reportPeriod);
      const [revenueData, topProductsData] = await Promise.all([
        reportsAPI.getRevenueReport({ startDate, endDate }),
        reportsAPI.getTopProducts({ startDate, endDate, limit: 10 }),
      ]);
      setRevenueReport(revenueData);
      setTopProducts(topProductsData || []);
      setLastUpdate(new Date());
    } catch (error: any) {
      logger.error('Error loading reports:', error);
      if (!silent) {
        toast.error('Không thể tải dữ liệu báo cáo');
      }
    } finally {
      if (!silent) setReportsLoading(false);
    }
  };

  // ✅ Auto-update selectedDate CHỈ khi user đang xem ngày hôm nay và qua ngày mới
  // KHÔNG auto update khi user đã manually chọn ngày khác
  useEffect(() => {
    const checkDateChange = () => {
      // ✅ Sử dụng local time, không dùng UTC
      const today = new Date();
      const todayStr = getLocalDateString(today);
      
      // ✅ CHỈ auto update nếu:
      // 1. Đang ở tab "Hôm nay" VÀ
      // 2. User CHƯA manually chọn ngày (userSelectedDate === false) VÀ
      // 3. selectedDate === hôm nay (user đang xem ngày hôm nay)
      // → Khi qua ngày mới, tự động update selectedDate về ngày mới
      if (activeTab === 'today' && !userSelectedDate && selectedDate === todayStr) {
        // User đang xem hôm nay và chưa manually chọn ngày, không cần update
        return;
      }
      
      // ✅ Nếu user đã manually chọn ngày khác, KHÔNG auto update
      if (userSelectedDate) {
        return;
      }
      
      // ✅ Chỉ auto update khi user chưa chọn ngày và đang ở tab "Hôm nay"
      // Nếu selectedDate khác hôm nay (và user chưa chọn), có thể đã qua ngày mới
      // Nhưng trong trường hợp này, chúng ta chỉ update nếu selectedDate < hôm nay (ngày cũ)
      // Không update nếu selectedDate > hôm nay (ngày tương lai - có thể user đã chọn)
      if (activeTab === 'today' && !userSelectedDate && selectedDate < todayStr) {
        logger.info('[DashboardPage] 📅 Date changed! Auto-updating selectedDate from', selectedDate, 'to', todayStr, '(was viewing old date, auto-update)');
        setSelectedDate(todayStr);
        // ✅ Reset flag khi auto update (để cho phép auto update tiếp tục khi qua ngày mới)
        setUserSelectedDate(false);
      }
    };
    
    // Check ngay lập tức
    checkDateChange();
    
    // Check mỗi phút để detect khi qua ngày mới
    const interval = setInterval(checkDateChange, 60 * 1000); // 1 minute
    
    return () => clearInterval(interval);
  }, [selectedDate, activeTab, userSelectedDate]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'today') {
      loadDashboardStats();
    } else {
      loadReportsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate, reportPeriod]);

  // ✅ Reset userSelectedDate khi switch tab hoặc khi selectedDate được set về hôm nay tự động
  useEffect(() => {
    const todayStr = getLocalDateString(new Date());
    // Nếu selectedDate === hôm nay và userSelectedDate === true, có thể reset flag
    // (user có thể đã chọn hôm nay, nhưng nếu auto update về hôm nay thì không cần giữ flag)
    if (selectedDate === todayStr) {
      // Giữ nguyên flag, chỉ reset khi user chuyển tab hoặc refresh
    }
  }, [selectedDate]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleDownloadReport = useCallback(async () => {
    setDownloading('revenue');
    try {
      // ✅ Lấy ngày đã chọn từ date picker (hoặc hôm nay nếu chưa chọn)
      const endDate = selectedDate || getLocalDateString(new Date());
      
      // ✅ Tính startDate: Từ đầu tháng đến ngày đã chọn
      // Ví dụ: Nếu chọn 14/12/2025, thì startDate = 01/12/2025
      const selectedDateObj = new Date(endDate + 'T00:00:00');
      const startOfMonth = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1);
      const startDate = getLocalDateString(startOfMonth);
      
      logger.info('[DashboardPage] 📊 Exporting revenue report:', { startDate, endDate });
      
      // ✅ Gửi startDate và endDate (backend sử dụng startDate/endDate)
      const blob = await reportsAPI.downloadRevenueReport({
        startDate: startDate,
        endDate: endDate,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // ✅ Tên file với date range: BaoCao_doanh_thu_2025-12-01_2025-12-14.xlsx
      a.download = `BaoCao_doanh_thu_${startDate}_${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Đã tải xuống báo cáo doanh thu từ ${startDate} đến ${endDate}`);
    } catch (error: any) {
      logger.error('Error downloading revenue report:', error);
      toast.error('Không thể tải xuống báo cáo doanh thu');
    } finally {
      setDownloading(null);
    }
  }, [selectedDate]);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    if (activeTab === 'today') {
      loadDashboardStats();
    } else {
      loadReportsData();
    }
  }, [activeTab]);

  // Dashboard data processing - memoize to avoid recalculating on every render
  const todayStats = dashboardStats?.todayStats;
  const orderStats = dashboardStats?.orderStatsByDate || [];
  const salesOverview = dashboardStats?.salesOverview || [];
  const dashboardTopProducts = dashboardStats?.topProducts || [];

  const salesLineData = useMemo(() => salesOverview.map(s => s.doanhSo), [salesOverview]);
  const profitData = useMemo(() => salesOverview.map(s => s.loiNhuan), [salesOverview]);
  const maxSalesValue = useMemo(() => getMaxValue([...salesLineData, ...profitData]), [salesLineData, profitData]);
  const normalizedSalesLineData = useMemo(() => normalizeData(salesLineData, maxSalesValue), [salesLineData, maxSalesValue]);
  const normalizedProfitData = useMemo(() => normalizeData(profitData, maxSalesValue), [profitData, maxSalesValue]);

  // Reports data processing - memoize to avoid recalculating on every render
  const monthlyRevenueData = useMemo(() => {
    if (!revenueReport?.revenueByMonth || revenueReport.revenueByMonth.length === 0) return [];
    return revenueReport.revenueByMonth.map(item => ({
      month: formatMonthName(item.month || ''),
      revenue: item.revenue || 0,
    }));
  }, [revenueReport?.revenueByMonth]);

  const bestSellerData = useMemo(() => {
    return topProducts.map((product) => ({
      name: product.tenSanPham || 'N/A',
      tenDanhMuc: product.tenDanhMuc || '', // Lấy từ backend
      quantity: product.totalQuantitySold || 0,
      revenue: product.totalRevenue || 0,
      rank: product.rank || 0,
    }));
  }, [topProducts]);

  const totalRevenueFromTopProducts = useMemo(() => {
    return bestSellerData.reduce((sum, p) => sum + (p.revenue || 0), 0);
  }, [bestSellerData]);

  const totalRevenueFromReport = useMemo(() => {
    return revenueReport?.netRevenue || revenueReport?.totalRevenue || 0;
  }, [revenueReport]);

  const useTopProductsData = useMemo(() => {
    return totalRevenueFromTopProducts > 0 && bestSellerData.length > 0;
  }, [totalRevenueFromTopProducts, bestSellerData.length]);

  // Memoize categorizeProduct function to avoid recreating on every render
  const categorizeProduct = useCallback((product: typeof bestSellerData[0]): 'Đồ uống' | 'Đồ ăn' => {
    // Ưu tiên dùng tenDanhMuc từ backend
    if (product.tenDanhMuc) {
      if (product.tenDanhMuc.toLowerCase().includes('uống') || product.tenDanhMuc === 'Đồ uống') {
        return 'Đồ uống';
      }
      if (product.tenDanhMuc.toLowerCase().includes('ăn') || product.tenDanhMuc === 'Đồ ăn') {
        return 'Đồ ăn';
      }
    }
    
    // Fallback: keyword matching nếu không có tenDanhMuc
    const name = product.name.toLowerCase();
    const drinkKeywords = ['cà phê', 'trà', 'nước', 'sinh tố', 'cola', 'pepsi', 'xoài', 'việt quất', 'smoothie', 'juice', 'nước ép'];
    const foodKeywords = ['bánh', 'mì', 'snack', 'oishi', 'hảo hảo', 'chocopie'];
    
    if (drinkKeywords.some(keyword => name.includes(keyword))) {
      return 'Đồ uống';
    }
    if (foodKeywords.some(keyword => name.includes(keyword))) {
      return 'Đồ ăn';
    }
    
    // Default: nếu không match, coi là đồ uống (vì xoài việt quất là đồ uống)
    return 'Đồ uống';
  }, []);

  const salesOverviewData = useMemo(() => {
    return useTopProductsData ? [
    { category: 'Đồ uống', value: bestSellerData
      .filter(p => categorizeProduct(p) === 'Đồ uống')
      .reduce((sum, p) => sum + (p.revenue || 0), 0) },
    { category: 'Đồ ăn', value: bestSellerData
      .filter(p => categorizeProduct(p) === 'Đồ ăn')
      .reduce((sum, p) => sum + (p.revenue || 0), 0) },
  ] : [
      { category: 'Đồ uống', value: Math.round(totalRevenueFromReport * 0.5) },
      { category: 'Đồ ăn', value: Math.round(totalRevenueFromReport * 0.5) },
    ];
  }, [useTopProductsData, bestSellerData, categorizeProduct, totalRevenueFromReport]);

  const totalSales = useMemo(() => {
    return revenueReport?.netRevenue || revenueReport?.totalRevenue || 0;
  }, [revenueReport]);
  const salesGrowth = 32.2; // Mock data for demo

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header with Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Cập nhật lần cuối: {formatLastUpdate(lastUpdate)}</span>
              </div>
            )}
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'today' | 'reports')}>
          <TabsList>
            <TabsTrigger value="today">Hôm nay</TabsTrigger>
            <TabsTrigger value="reports">Báo cáo</TabsTrigger>
          </TabsList>

          {/* Tab: Hôm nay */}
          <TabsContent value="today">
            {dashboardLoading && !dashboardStats ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : !dashboardStats ? (
              <div className="text-center py-12 text-gray-500">
                <p>Không thể tải thống kê</p>
                <Button onClick={() => loadDashboardStats()} className="mt-4">
                  Thử lại
                </Button>
              </div>
            ) : (
              <>
                {/* Date Picker and Download Button */}
                <div className="flex items-center justify-between mb-6">
                  <div></div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleDownloadReport('revenue')}
                      disabled={downloading === 'revenue'}
                      variant="outline"
                      className="border-gray-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {downloading === 'revenue' ? 'Đang tải...' : 'Báo cáo doanh thu'}
                    </Button>
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          // ✅ Khi user manually chọn ngày, đánh dấu là đã chọn
                          setUserSelectedDate(true);
                          setSelectedDate(e.target.value);
                          logger.info('[DashboardPage] 📅 User manually selected date:', e.target.value);
                        }}
                        className="border-none outline-none bg-transparent text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {dashboardLoading && !dashboardStats ? (
                    <>
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                    </>
                  ) : (
                    <>
                      <StatCard
                        title="Doanh thu hôm nay"
                        value={formatCurrency(todayStats?.doanhThu)}
                        change={formatChange(todayStats?.doanhThuChange)}
                        changeType={getChangeType(todayStats?.doanhThuChange)}
                        icon={DollarSign}
                        iconBgColor="bg-green-100"
                        iconColor="text-green-600"
                      />
                      <StatCard
                        title="Tổng đơn hôm nay"
                        value={formatNumber(todayStats?.tongDon)}
                        change={formatChange(todayStats?.tongDonChange)}
                        changeType={getChangeType(todayStats?.tongDonChange)}
                        icon={ShoppingBag}
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-600"
                      />
                      <StatCard
                        title="Lợi nhuận hôm nay"
                        value={formatCurrency(todayStats?.loiNhuan)}
                        change={formatChange(todayStats?.loiNhuanChange)}
                        changeType={getChangeType(todayStats?.loiNhuanChange)}
                        icon={TrendingUp}
                        iconBgColor="bg-orange-100"
                        iconColor="text-orange-600"
                      />
                      <StatCard
                        title="Khách hàng hôm nay"
                        value={formatNumber(todayStats?.khachHang)}
                        change={formatChange(todayStats?.khachHangChange)}
                        changeType={getChangeType(todayStats?.khachHangChange)}
                        icon={Users}
                        iconBgColor="bg-purple-100"
                        iconColor="text-purple-600"
                      />
                    </>
                  )}
                </div>

                {/* Sales Overview Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  {dashboardLoading && !dashboardStats ? (
                    <ChartSkeleton />
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Tổng quan doanh số</h3>
                        {salesOverview.length > 0 && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-green-600">
                              <span className="font-semibold">
                                {formatCurrency(salesOverview.reduce((sum, s) => sum + s.doanhSo, 0))}
                              </span>
                              <TrendingUp className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                      {salesOverview.length > 0 ? (
                    <div className="h-64 relative">
                      <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                        {[0, 25, 50, 75, 100].map((y) => (
                          <line
                            key={y}
                            x1="0"
                            y1={y * 2}
                            x2="400"
                            y2={y * 2}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                        ))}
                        <polyline
                          points={normalizedSalesLineData.map((val, i) => `${(i * 400) / (normalizedSalesLineData.length - 1 || 1)},${200 - val * 2}`).join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                        <polyline
                          points={normalizedProfitData.map((val, i) => `${(i * 400) / (normalizedProfitData.length - 1 || 1)},${200 - val * 2}`).join(' ')}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                        />
                      </svg>
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                        {salesOverview.map((stat) => (
                          <span key={stat.date}>{stat.date}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <p>Không có dữ liệu</p>
                    </div>
                  )}
                      <div className="flex items-center gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">Doanh số</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">Lợi nhuận</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Products Sold Today Table */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Sản phẩm bán được trong ngày</h3>
                  {dashboardTopProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">TÊN SẢN PHẨM</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ĐÃ BÁN</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardTopProducts.map((product, index) => (
                            <tr key={`${product.tenSanPham}-${index}`} className="border-b border-gray-100 hover:bg-orange-50/50 transition-colors">
                              <td className="py-4 px-4 text-sm font-medium text-gray-900">{product.tenSanPham}</td>
                              <td className="py-4 px-4 text-sm text-gray-600">{formatNumber(product.soLuongBan)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <p>Không có sản phẩm nào được bán trong ngày</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Tab: Báo cáo */}
          <TabsContent value="reports">

            {reportsLoading && !revenueReport ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Monthly Revenue */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Doanh thu theo tháng</h3>
                    </div>
                    {monthlyRevenueData.length === 0 ? (
                      <div className="flex items-center justify-center h-[250px]">
                        <div className="text-gray-500">Không có dữ liệu</div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyRevenueData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            type="number"
                            tick={{ fontSize: 12 }} 
                            stroke="#6B7280"
                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                          />
                          <YAxis 
                            type="category"
                            dataKey="month" 
                            tick={{ fontSize: 12 }} 
                            stroke="#6B7280"
                            width={80}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                          />
                          <Bar 
                            dataKey="revenue" 
                            fill="#F97316"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Sales Overview */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Tổng quan doanh số</h3>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 mb-2">
                        <p className="text-3xl font-bold text-gray-900">
                          {formatCurrency(totalSales)}
                        </p>
                        {salesGrowth > 0 && (
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">{salesGrowth}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={salesOverviewData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          type="number"
                          tick={{ fontSize: 12 }} 
                          stroke="#6B7280"
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <YAxis 
                          type="category"
                          dataKey="category"
                          tick={{ fontSize: 12 }} 
                          stroke="#6B7280"
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Doanh số']}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="#F97316"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-800 rounded"></div>
                        <span>Đồ uống</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-600 rounded"></div>
                        <span>Đồ ăn</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Seller Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Sản phẩm bán chạy (Best Seller)</h3>
                    <select 
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value as any)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="thisMonth">Tháng này</option>
                      <option value="lastMonth">Tháng trước</option>
                      <option value="last3Months">3 Tháng gần đây</option>
                      <option value="last6Months">6 Tháng gần đây</option>
                      <option value="thisYear">1 Năm</option>
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Hạng</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tên sản phẩm</th>
                          <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Số lượng bán</th>
                          <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bestSellerData.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-gray-500">
                              Không có dữ liệu
                            </td>
                          </tr>
                        ) : (
                          bestSellerData.map((product) => (
                            <tr key={product.rank} className="hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm">
                                  {product.rank}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-sm font-medium text-gray-900">{product.name}</span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="text-sm text-gray-900">{formatNumber(product.quantity)}</span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(product.revenue)}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}