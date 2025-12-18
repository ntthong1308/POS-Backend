import { useState, useEffect, useMemo, useCallback } from 'react';
import { Customer } from '@/lib/types';
import { Search, Plus, MoreVertical, RefreshCw, TrendingUp, TrendingDown, Users, UserPlus, Repeat, DollarSign, XCircle, Phone, Mail, MapPin, Star, Edit, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EditCustomerDialog from '@/components/features/customers/EditCustomerDialog';
import AddCustomerDialog from '@/components/features/customers/AddCustomerDialog';
import PointsManagementDialog from '@/components/features/customers/PointsManagementDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatPoints } from '@/lib/utils';
import { toast } from 'sonner';
import { customersAPI } from '@/lib/api/customers';
import { invoicesAPI } from '@/lib/api/invoices';
import PageLoading from '@/components/common/PageLoading';

// Mock data for customers (fallback)
const mockCustomers: Customer[] = [
  {
    id: 1,
    maKhachHang: 'KH001',
    tenKhachHang: 'Nguyễn Văn An',
    soDienThoai: '0901234567',
    email: 'nguyenvanan@gmail.com',
    diaChi: '123 Nguyễn Huệ, Q.1, TP.HCM',
    diemTichLuy: 250,
    trangThai: 'ACTIVE',
  },
  {
    id: 2,
    maKhachHang: 'KH002',
    tenKhachHang: 'Trần Thị Bình',
    soDienThoai: '0902345678',
    email: 'tranthibinh@gmail.com',
    diaChi: '456 Lê Lợi, Q.1, TP.HCM',
    diemTichLuy: 180,
    trangThai: 'ACTIVE',
  },
  {
    id: 3,
    maKhachHang: 'KH003',
    tenKhachHang: 'Lê Văn Cường',
    soDienThoai: '0903456789',
    email: 'levancuong@gmail.com',
    diaChi: '789 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
    diemTichLuy: 420,
    trangThai: 'ACTIVE',
  },
  {
    id: 4,
    maKhachHang: 'KH004',
    tenKhachHang: 'Phạm Thị Dung',
    soDienThoai: '0904567890',
    email: 'phamthidung@gmail.com',
    diaChi: '321 Võ Văn Tần, Q.3, TP.HCM',
    diemTichLuy: 350,
    trangThai: 'ACTIVE',
  },
  {
    id: 5,
    maKhachHang: 'KH005',
    tenKhachHang: 'Hoàng Văn Em',
    soDienThoai: '0905678901',
    email: 'hoangvanem@gmail.com',
    diaChi: '654 Nguyễn Đình Chiểu, Q.3, TP.HCM',
    diemTichLuy: 150,
    trangThai: 'ACTIVE',
  },
];

// Mock order data (in real app, this would come from API)
const mockOrderStats = {
  1: { totalOrders: 45, totalRevenue: 3250000 },
  2: { totalOrders: 32, totalRevenue: 2100000 },
  3: { totalOrders: 68, totalRevenue: 5800000 },
  4: { totalOrders: 28, totalRevenue: 840000 },
  5: { totalOrders: 12, totalRevenue: 360000 },
};

// Get customer rank based on points
const getCustomerRank = (points: number): { label: string; color: string; bgColor: string } => {
  if (points >= 500) {
    return { label: 'Gold', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  } else if (points >= 200) {
    return { label: 'Silver', color: 'text-gray-700', bgColor: 'bg-gray-100' };
  } else {
    return { label: 'Bronze', color: 'text-orange-700', bgColor: 'bg-orange-100' };
  }
};

type FilterStatus = 'all' | 'active';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [orderValueFilter, setOrderValueFilter] = useState<string>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPointsDialogOpen, setIsPointsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerStats, setCustomerStats] = useState<Record<number, { totalOrders: number; totalRevenue: number }>>({});

  useEffect(() => {
    // Load customers from API
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const response = await customersAPI.getAll({ page: 0, size: 100 });
        // Response là PaginatedResponse với structure: { content: [...], totalElements, totalPages, ... }
        const data = response.content || [];
        setCustomers(data);
        
        // Load invoices to calculate stats
        await loadCustomerStats(data);
      } catch (error: any) {
        console.error('Error loading customers:', error);
        setCustomers(mockCustomers);
        toast.error('Không thể tải danh sách khách hàng. Đang dùng dữ liệu mẫu.');
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, []);

  const loadCustomerStats = async (customers: Customer[]) => {
    try {
      // Calculate stats for each customer using the by-customer endpoint
      const stats: Record<number, { totalOrders: number; totalRevenue: number }> = {};
      
      // Load invoices for each customer in parallel
      const statsPromises = customers.map(async (customer) => {
        try {
          const customerInvoices = await invoicesAPI.getByCustomer(customer.id);
          const totalOrders = customerInvoices.length;
          const totalRevenue = customerInvoices.reduce((sum, inv) => {
            return sum + (inv.thanhToan || inv.thanhTien || 0);
          }, 0);
          
          return { customerId: customer.id, totalOrders, totalRevenue };
        } catch (error: any) {
          console.error(`Error loading invoices for customer ${customer.id}:`, error);
          return { customerId: customer.id, totalOrders: 0, totalRevenue: 0 };
        }
      });
      
      const results = await Promise.all(statsPromises);
      results.forEach(result => {
        stats[result.customerId] = { totalOrders: result.totalOrders, totalRevenue: result.totalRevenue };
      });
      
      setCustomerStats(stats);
    } catch (error: any) {
      console.error('Error loading customer stats:', error);
      // Set empty stats on error
      const emptyStats: Record<number, { totalOrders: number; totalRevenue: number }> = {};
      customers.forEach(customer => {
        emptyStats[customer.id] = { totalOrders: 0, totalRevenue: 0 };
      });
      setCustomerStats(emptyStats);
    }
  };

  // Memoize filtered customers to avoid recalculating on every render
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Filter by status
    if (statusFilter === 'active') {
      result = result.filter(c => c.trangThai === 'ACTIVE');
    }

    // Filter by search
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(c =>
        c.tenKhachHang.toLowerCase().includes(keyword) ||
        c.maKhachHang.toLowerCase().includes(keyword) ||
        c.soDienThoai.includes(keyword) ||
        (c.email && c.email.toLowerCase().includes(keyword))
      );
    }

    // Filter by rank
    if (rankFilter !== 'all') {
      result = result.filter(c => {
        const formattedPoints = formatPoints(c.diemTichLuy);
        if (rankFilter === 'gold') return formattedPoints >= 500;
        if (rankFilter === 'silver') return formattedPoints >= 200 && formattedPoints < 500;
        if (rankFilter === 'bronze') return formattedPoints < 200;
        return true;
      });
    }

    // Filter by order value
    if (orderValueFilter !== 'all') {
      result = result.filter(c => {
        // Only check mock stats for existing mock customers (check by ID in mockCustomers array)
        // New customers from backend should have 0 revenue
        const isMockCustomer = mockCustomers.some(mc => mc.id === c.id);
        const stats = (isMockCustomer && mockOrderStats[c.id as keyof typeof mockOrderStats]) ? 
          mockOrderStats[c.id as keyof typeof mockOrderStats] : 
          { totalOrders: 0, totalRevenue: 0 };
        if (orderValueFilter === 'low') return stats.totalRevenue < 100000;
        if (orderValueFilter === 'medium') return stats.totalRevenue >= 100000 && stats.totalRevenue < 500000;
        if (orderValueFilter === 'high') return stats.totalRevenue >= 500000;
        return true;
      });
    }

    return result;
  }, [customers, statusFilter, searchKeyword, rankFilter, orderValueFilter]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleEditCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  }, []);

  const handleSaveCustomer = useCallback(async (updatedCustomer: Customer) => {
    try {
      const savedCustomer = await customersAPI.update(updatedCustomer.id, updatedCustomer);
      setCustomers(customers.map(c => 
        c.id === updatedCustomer.id ? savedCustomer : c
      ));
      toast.success('Đã cập nhật thông tin khách hàng');
      // Reload customers
      const response = await customersAPI.getAll();
      const data = Array.isArray(response) ? response : (response.content || response.data || []);
      setCustomers(data.length > 0 ? data : customers);
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật khách hàng');
    }
  }, [customers]);

  const handleManagePoints = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsPointsDialogOpen(true);
  }, []);

  const handleAddCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'maKhachHang'>) => {
    try {
      // Format phone number: ensure it's 10 digits (0 + 9 digits)
      // Backend pattern: ^(\+84|0)[0-9]{9}$
      let soDienThoai = customerData.soDienThoai?.trim() || '';
      if (soDienThoai) {
        // Remove all non-digit characters
        soDienThoai = soDienThoai.replace(/\D/g, '');
        // If starts with 84, remove it and add 0
        if (soDienThoai.startsWith('84') && soDienThoai.length === 11) {
          soDienThoai = '0' + soDienThoai.substring(2);
        }
        // Ensure it starts with 0 and has exactly 10 digits
        if (!soDienThoai.startsWith('0')) {
          soDienThoai = '0' + soDienThoai;
        }
        // Take only first 10 digits
        soDienThoai = soDienThoai.substring(0, 10);
      }
      
      // Backend will auto-generate maKhachHang, so we don't send it
      const customerDataToSend: Omit<Customer, 'id' | 'maKhachHang'> = {
        ...customerData,
        soDienThoai: soDienThoai || customerData.soDienThoai,
      };
      
      const newCustomer = await customersAPI.create(customerDataToSend);
      setCustomers([...customers, newCustomer]);
      toast.success('Đã tạo khách hàng mới thành công!');
      setIsAddDialogOpen(false);
      // Reload customers
      const response = await customersAPI.getAll();
      const data = Array.isArray(response) ? response : (response.content || response.data || []);
      setCustomers(data.length > 0 ? data : customers);
    } catch (error: any) {
      console.error('Error creating customer:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.message ||
                          'Không thể tạo khách hàng';
      toast.error(errorMessage);
    }
  }, []);

  const handleDeleteCustomer = useCallback(async (customerId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      return;
    }

    try {
      await customersAPI.delete(customerId);
      setCustomers(customers.filter(c => c.id !== customerId));
      toast.success('Đã xóa khách hàng thành công');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa khách hàng');
    }
  }, [customers]);

  const handleUpdatePoints = useCallback(async (customerId: number, newPoints: number, reason: string) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const currentPoints = customer.diemTichLuy || 0;
      // Theo tài liệu: PATCH /api/v1/admin/customers/{id}/points?points={points}
      // points là số điểm mới (tổng điểm), không phải số điểm thêm/trừ
      const updatedCustomer = await customersAPI.updatePoints(customerId, newPoints);

      setCustomers(customers.map(c => 
        c.id === customerId ? updatedCustomer : c
      ));
      toast.success(`Đã cập nhật điểm tích lũy. Lý do: ${reason}`);
    } catch (error: any) {
      console.error('Error updating points:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật điểm tích lũy');
    }
  }, [customers]);

  // Calculate KPIs
  const totalCustomers = customers.length;
  const newCustomersThisMonth = 12; // Mock: 12 new customers this month
  const newCustomersLastMonth = 11; // Mock: for comparison
  const newCustomersGrowth = newCustomersLastMonth > 0 
    ? (((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100).toFixed(0)
    : '0';
  
  const vipCustomers = customers.filter(c => formatPoints(c.diemTichLuy) >= 500).length;
  
  const activeCustomers = customers.filter(c => c.trangThai === 'ACTIVE').length;
  const returnCustomerRate = totalCustomers > 0 
    ? ((activeCustomers / totalCustomers) * 100).toFixed(0) 
    : '0';
  const returnRateLastMonth = 63; // Mock: for comparison
  const returnRateGrowth = returnRateLastMonth > 0
    ? ((Number(returnCustomerRate) - returnRateLastMonth)).toFixed(0)
    : '0';

  const statusCounts = {
    all: customers.length,
    active: customers.filter(c => c.trangThai === 'ACTIVE').length,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo mới
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Tổng khách hàng</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{totalCustomers.toLocaleString('vi-VN')}</p>
          <p className="text-xs text-gray-500">+{newCustomersThisMonth} khách mới tháng này</p>
        </div>

        {/* New Customers */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            {Number(newCustomersGrowth) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className="text-xs text-gray-600 mb-1">Khách hàng mới</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{newCustomersThisMonth}</p>
          <p className={cn(
            "text-xs",
            Number(newCustomersGrowth) >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {Number(newCustomersGrowth) >= 0 ? '+' : ''}{newCustomersGrowth}% so với tháng trước
          </p>
        </div>

        {/* VIP Customers */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Khách VIP</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{vipCustomers}</p>
          <p className="text-xs text-gray-500">≥ 500 điểm</p>
        </div>

        {/* Return Customer Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Repeat className="w-5 h-5 text-purple-600" />
            </div>
            {Number(returnRateGrowth) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className="text-xs text-gray-600 mb-1">Tỷ lệ quay lại</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{returnCustomerRate}%</p>
          <p className={cn(
            "text-xs",
            Number(returnRateGrowth) >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {Number(returnRateGrowth) >= 0 ? '+' : ''}{returnRateGrowth}% so với tháng trước
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { key: 'all', label: 'Tất cả khách hàng', count: statusCounts.all },
            { key: 'active', label: 'Đang hoạt động', count: statusCounts.active },
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
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            + Thêm view
          </button>
        </div>

        {/* Search and Filters Row */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <select
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value)}
              className="px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
            >
              <option value="all">Tất cả hạng</option>
              <option value="gold">Gold (≥ 500 điểm)</option>
              <option value="silver">Silver (200-499 điểm)</option>
              <option value="bronze">Bronze (&lt; 200 điểm)</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={orderValueFilter}
              onChange={(e) => setOrderValueFilter(e.target.value)}
              className="px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
            >
              <option value="all">Giá trị đơn hàng</option>
              <option value="low">Dưới 100.000₫</option>
              <option value="medium">100.000₫ - 500.000₫</option>
              <option value="high">Trên 500.000₫</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">Ẩn</button>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <PageLoading message="Đang tải khách hàng..." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Khách hàng
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Liên hệ</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hạng</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Điểm tích lũy</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Đơn hàng
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Chi tiêu
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Chỉnh sửa</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                // Get stats from loaded customer stats or use mock data for fallback
                const stats = customerStats[customer.id] || {
                  totalOrders: 0,
                  totalRevenue: 0,
                  lastOrder: '-',
                };
                const rank = getCustomerRank(customer.diemTichLuy || 0);
                return (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-orange-50/50 transition-all duration-200 group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar với gradient background */}
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-transform group-hover:scale-110",
                          rank.bgColor,
                          rank.color
                        )}>
                          {getInitials(customer.tenKhachHang)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-orange-600 transition-colors">
                            {customer.tenKhachHang}
                          </p>
                          <p className="text-xs text-gray-500">{customer.maKhachHang}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{customer.soDienThoai}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.diaChi && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="line-clamp-1">{customer.diaChi}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border",
                        rank.bgColor,
                        rank.color,
                        rank.label === 'Gold' ? 'border-yellow-300' : 
                        rank.label === 'Silver' ? 'border-gray-300' : 'border-orange-300'
                      )}>
                        <Star className={cn(
                          "w-3.5 h-3.5",
                          rank.label === 'Gold' ? 'fill-yellow-500 text-yellow-500' :
                          rank.label === 'Silver' ? 'fill-gray-500 text-gray-500' :
                          'fill-orange-500 text-orange-500'
                        )} />
                        {rank.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleManagePoints(customer)}
                        className="flex items-center gap-1.5 hover:bg-orange-50 px-2 py-1 rounded-lg transition-colors cursor-pointer group"
                        title="Click để quản lý điểm tích lũy"
                      >
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-gray-900 group-hover:text-orange-600">
                          {formatPoints(customer.diemTichLuy)}
                        </span>
                      </button>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{stats.totalOrders}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                      {stats.totalRevenue.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all hover:scale-110">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleEditCustomer(customer)}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleManagePoints(customer)}
                            className="cursor-pointer"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Quản lý điểm
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddCustomer}
      />

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        open={isEditDialogOpen}
        customer={selectedCustomer}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
      />

      {/* Points Management Dialog */}
      <PointsManagementDialog
        open={isPointsDialogOpen}
        customer={selectedCustomer}
        onClose={() => {
          setIsPointsDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onUpdatePoints={handleUpdatePoints}
      />
    </div>
  );
}
