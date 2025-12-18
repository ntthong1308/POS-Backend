import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Plus, MoreVertical, Filter, ArrowUpDown, Check, ChevronDown, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import AddPromotionDialog from '@/components/features/promotions/AddPromotionDialog';
import EditPromotionDialog from '@/components/features/promotions/EditPromotionDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { promotionsAPI } from '@/lib/api/promotions';
import { Promotion } from '@/store/cartStore';
import PageLoading from '@/components/common/PageLoading';

// Mock data (fallback)
const mockPromotions: Promotion[] = [
  {
    id: 1,
    code: 'GIAM20',
    name: 'Giảm 20% cho đơn hàng trên 200k',
    description: 'Áp dụng cho tất cả sản phẩm',
    type: 'PERCENTAGE',
    value: 20,
    minPurchaseAmount: 200000,
    maxDiscountAmount: 50000,
    startDate: '1 Jan, 2024',
    endDate: '31 Dec, 2024',
    branchId: 1,
    branchName: 'Chi nhánh Trung tâm',
    isActive: true,
    usageLimit: 1000,
    usedCount: 245,
  },
  {
    id: 2,
    code: 'FREESHIP',
    name: 'Miễn phí vận chuyển',
    description: 'Áp dụng cho đơn hàng trên 150k',
    type: 'FIXED_AMOUNT',
    value: 30000,
    minPurchaseAmount: 150000,
    startDate: '1 Feb, 2024',
    endDate: '28 Feb, 2024',
    branchId: 1,
    branchName: 'Chi nhánh Trung tâm',
    isActive: true,
    usageLimit: 500,
    usedCount: 89,
  },
  {
    id: 3,
    code: 'NEWYEAR50',
    name: 'Năm mới giảm 50k',
    description: 'Áp dụng cho đơn hàng trên 300k',
    type: 'FIXED_AMOUNT',
    value: 50000,
    minPurchaseAmount: 300000,
    startDate: '1 Jan, 2024',
    endDate: '7 Jan, 2024',
    branchId: 1,
    branchName: 'Chi nhánh Trung tâm',
    isActive: false,
    usageLimit: 200,
    usedCount: 198,
  },
  {
    id: 4,
    code: 'WEEKEND15',
    name: 'Cuối tuần giảm 15%',
    description: 'Chỉ áp dụng thứ 7 và Chủ nhật',
    type: 'PERCENTAGE',
    value: 15,
    minPurchaseAmount: 100000,
    startDate: '1 Mar, 2024',
    endDate: '31 Mar, 2024',
    branchId: 1,
    branchName: 'Chi nhánh Trung tâm',
    isActive: true,
    usageLimit: undefined,
    usedCount: 156,
  },
];

type TabStatus = 'all' | 'active' | 'inactive' | 'expired';
type SortField = 'code' | 'name' | 'startDate' | 'endDate' | 'usedCount';
type SortOrder = 'asc' | 'desc';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPromotions, setSelectedPromotions] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // Load promotions function - export để có thể gọi từ bên ngoài
  const loadPromotions = async () => {
    setLoading(true);
    try {
      const response = await promotionsAPI.getAll();
      // Handle paginated response
      const data = Array.isArray(response) ? response : (response.content || response.data || []);
      setPromotions(data);
    } catch (error: any) {
      console.error('Error loading promotions:', error);
      // Fallback to mock data on error
      setPromotions(mockPromotions);
      toast.error('Không thể tải danh sách khuyến mãi. Đang dùng dữ liệu mẫu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load promotions from API on mount
    loadPromotions();
    
    // Reload promotions when page becomes visible (user navigates back to promotions page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadPromotions();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also reload when window gains focus (user switches back to tab)
    const handleFocus = () => {
      loadPromotions();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu]);

  // Memoize filtered promotions to avoid recalculating on every render
  const filteredPromotions = useMemo(() => {
    // Filter promotions by status
    let filtered = [...promotions];

    if (activeTab === 'active') {
      // Dùng trangThai hoặc isActive, và ngayKetThuc
      filtered = filtered.filter(p => {
        const isActive = p.trangThai === 'ACTIVE' || p.isActive;
        const endDate = p.ngayKetThuc || p.endDate || '';
        return isActive && new Date(endDate) >= new Date();
      });
    } else if (activeTab === 'inactive') {
      // Chỉ hiển thị mã tạm dừng (INACTIVE) và chưa hết hạn
      filtered = filtered.filter(p => {
        const isInactive = p.trangThai === 'INACTIVE' || !p.isActive;
        const endDate = p.ngayKetThuc || p.endDate || '';
        const isExpired = endDate && new Date(endDate) < new Date();
        return isInactive && !isExpired;
      });
    } else if (activeTab === 'expired') {
      filtered = filtered.filter(p => {
        const endDate = p.ngayKetThuc || p.endDate || '';
        return new Date(endDate) < new Date();
      });
    }

    // Filter by search keyword (dùng field chính)
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        p => {
          const maKM = p.maKhuyenMai || p.code || '';
          const tenKM = p.tenKhuyenMai || p.name || '';
          const moTa = p.moTa || p.description || '';
          return maKM.toLowerCase().includes(keyword) ||
                 tenKM.toLowerCase().includes(keyword) ||
                 moTa.toLowerCase().includes(keyword);
        }
      );
    }

    // Sort promotions (dùng field chính)
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'code':
          aValue = a.maKhuyenMai || a.code || '';
          bValue = b.maKhuyenMai || b.code || '';
          break;
        case 'name':
          aValue = a.tenKhuyenMai || a.name || '';
          bValue = b.tenKhuyenMai || b.name || '';
          break;
        case 'startDate':
          const aStart = a.ngayBatDau || a.startDate || '';
          const bStart = b.ngayBatDau || b.startDate || '';
          aValue = new Date(aStart).getTime();
          bValue = new Date(bStart).getTime();
          break;
        case 'endDate':
          const aEnd = a.ngayKetThuc || a.endDate || '';
          const bEnd = b.ngayKetThuc || b.endDate || '';
          aValue = new Date(aEnd).getTime();
          bValue = new Date(bEnd).getTime();
          break;
        case 'usedCount':
          aValue = a.soLanDaSuDung || a.usedCount || 0;
          bValue = b.soLanDaSuDung || b.usedCount || 0;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [promotions, activeTab, searchKeyword, sortField, sortOrder]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedPromotions(filteredPromotions.map(p => p.id));
    } else {
      setSelectedPromotions([]);
    }
  }, [filteredPromotions]);

  const handleSelectPromotion = useCallback((id: number, checked: boolean) => {
    if (checked) {
      setSelectedPromotions(prev => [...prev, id]);
    } else {
      setSelectedPromotions(prev => prev.filter(pId => pId !== id));
    }
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setShowSortMenu(false);
  }, [sortField, sortOrder]);

  const handleAddPromotion = useCallback(async (promotionData: Omit<Promotion, 'id' | 'soLanDaSuDung' | 'usedCount'>) => {
    try {
      const newPromotion = await promotionsAPI.create(promotionData);
      setPromotions([...promotions, newPromotion]);
      toast.success('Đã thêm khuyến mãi mới thành công');
      // Reload promotions to get latest data
      const response = await promotionsAPI.getAll();
      const data = Array.isArray(response) ? response : (response.content || response.data || []);
      setPromotions(data);
    } catch (error: any) {
      console.error('Error adding promotion:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm khuyến mãi');
    }
  }, [promotions]);

  const handleUpdatePromotion = useCallback(async (id: number, promotionData: Omit<Promotion, 'id' | 'soLanDaSuDung' | 'usedCount'>) => {
    try {
      console.log('[PromotionsPage] Updating promotion:', id, promotionData);
      const updatedPromotion = await promotionsAPI.update(id, promotionData);
      console.log('[PromotionsPage] Updated promotion response:', updatedPromotion);
      
      // Update local state immediately
      setPromotions(promotions.map(p => (p.id === id ? { ...updatedPromotion, id } : p)));
      toast.success('Đã cập nhật thông tin khuyến mãi');
      
      // Reload promotions to get latest data from backend
      try {
        const response = await promotionsAPI.getAll();
        const data = Array.isArray(response) ? response : (response.content || response.data || []);
        console.log('[PromotionsPage] Reloaded promotions:', data);
        setPromotions(data);
      } catch (reloadError) {
        console.error('Error reloading promotions:', reloadError);
        // Don't show error, local state already updated
      }
    } catch (error: any) {
      console.error('Error updating promotion:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Không thể cập nhật khuyến mãi');
    }
  }, [promotions]);

  const handleDeletePromotion = useCallback(async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      try {
        await promotionsAPI.delete(id);
        setPromotions(promotions.filter(p => p.id !== id));
        setSelectedPromotions(selectedPromotions.filter(pId => pId !== id));
        toast.success('Đã xóa khuyến mãi thành công');
      } catch (error: any) {
        console.error('Error deleting promotion:', error);
        toast.error(error.response?.data?.message || 'Không thể xóa khuyến mãi');
      }
    }
  }, [promotions, selectedPromotions]);

  const handleToggleActive = useCallback(async (id: number) => {
    const promotion = promotions.find(p => p.id === id);
    try {
      const isActive = promotion?.trangThai === 'ACTIVE' || promotion?.isActive;
      if (isActive) {
        await promotionsAPI.deactivate(id);
        setPromotions(promotions.map(p => 
          p.id === id ? { ...p, trangThai: 'INACTIVE' as const, isActive: false } : p
        ));
        toast.success('Đã vô hiệu hóa khuyến mãi');
      } else {
        await promotionsAPI.activate(id);
        setPromotions(promotions.map(p => 
          p.id === id ? { ...p, trangThai: 'ACTIVE' as const, isActive: true } : p
        ));
        toast.success('Đã kích hoạt khuyến mãi');
      }
    } catch (error: any) {
      console.error('Error toggling promotion:', error);
      toast.error(error.response?.data?.message || 'Không thể thay đổi trạng thái khuyến mãi');
    }
  }, [promotions]);

  const handleEditClick = useCallback((promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowEditDialog(true);
  }, []);

  const handleDeleteClick = useCallback((promotion: Promotion) => {
    handleDeletePromotion(promotion.id);
  }, [handleDeletePromotion]);

  const tabs = [
    { id: 'all' as TabStatus, label: 'Tất cả', count: promotions.length },
    { 
      id: 'active' as TabStatus, 
      label: 'Đang hoạt động', 
      count: promotions.filter(p => {
        const isActive = p.trangThai === 'ACTIVE' || p.isActive;
        const endDate = p.ngayKetThuc || p.endDate || '';
        return isActive && new Date(endDate) >= new Date();
      }).length 
    },
    { 
      id: 'inactive' as TabStatus, 
      label: 'Tạm dừng', 
      count: promotions.filter(p => {
        const isInactive = p.trangThai === 'INACTIVE' || !p.isActive;
        const endDate = p.ngayKetThuc || p.endDate || '';
        const isExpired = endDate && new Date(endDate) < new Date();
        return isInactive && !isExpired;
      }).length 
    },
    { 
      id: 'expired' as TabStatus, 
      label: 'Hết hạn', 
      count: promotions.filter(p => {
        const endDate = p.ngayKetThuc || p.endDate || '';
        return new Date(endDate) < new Date();
      }).length 
    },
  ];

  const sortOptions = [
    { field: 'code' as SortField, label: 'Mã khuyến mãi' },
    { field: 'name' as SortField, label: 'Tên khuyến mãi' },
    { field: 'startDate' as SortField, label: 'Ngày bắt đầu' },
    { field: 'endDate' as SortField, label: 'Ngày kết thúc' },
    { field: 'usedCount' as SortField, label: 'Số lần sử dụng' },
  ];

  const formatDiscount = (promotion: Promotion) => {
    const loaiKM = promotion.loaiKhuyenMai || promotion.type;
    const giaTriKM = promotion.giaTriKhuyenMai || promotion.value;
    if (loaiKM === 'PERCENTAGE') {
      return `${giaTriKM}%`;
    } else {
      return `${giaTriKM.toLocaleString('vi-VN')}₫`;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Khuyến mãi</h1>
            <p className="text-gray-600 mt-1">Quản lý các chương trình khuyến mãi và giảm giá</p>
          </div>
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm khuyến mãi
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors relative flex items-center',
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    'ml-2 px-2 py-0.5 rounded-full text-xs font-medium',
                    activeTab === tab.id
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search, Filter, Sort Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo mã, tên khuyến mãi..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'bg-orange-50 border-orange-200')}
          >
            <Filter className="w-4 h-4 mr-2" />
            Bộ lọc
          </Button>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortMenuRef}>
            <Button
              variant="outline"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="min-w-[140px] justify-between"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <span>Sắp xếp</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  {sortOptions.map(option => (
                    <button
                      key={option.field}
                      onClick={() => handleSort(option.field)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 flex items-center justify-between',
                        sortField === option.field && 'bg-orange-50 text-orange-600'
                      )}
                    >
                      <span>{option.label}</span>
                      {sortField === option.field && (
                        <Check className="w-4 h-4 text-orange-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <PageLoading message="Đang tải khuyến mãi..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('code')}
                      className="flex items-center gap-1 hover:text-orange-600"
                    >
                      Mã khuyến mãi
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-orange-600"
                    >
                      Tên khuyến mãi
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Giảm giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('startDate')}
                      className="flex items-center gap-1 hover:text-orange-600"
                    >
                      Thời gian
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('usedCount')}
                      className="flex items-center gap-1 hover:text-orange-600"
                    >
                      Sử dụng
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPromotions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy khuyến mãi nào
                    </td>
                  </tr>
                ) : (
                  filteredPromotions.map(promotion => (
                    <tr key={promotion.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          {promotion.maKhuyenMai || promotion.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{promotion.tenKhuyenMai || promotion.name}</p>
                          {(promotion.moTa || promotion.description) && (
                            <p className="text-sm text-gray-500 mt-1">{promotion.moTa || promotion.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-orange-600 text-lg">
                            {formatDiscount(promotion)}
                          </span>
                          {(promotion.giaTriToiThieu || promotion.minPurchaseAmount) && (
                            <span className="text-xs text-gray-500">
                              Đơn tối thiểu: {(promotion.giaTriToiThieu || promotion.minPurchaseAmount || 0).toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span>Từ: {promotion.ngayBatDau || promotion.startDate}</span>
                          <span>Đến: {promotion.ngayKetThuc || promotion.endDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {promotion.soLanDaSuDung || promotion.usedCount || 0} / {promotion.soLanSuDungToiDa || promotion.usageLimit || '∞'}
                          </span>
                          {(promotion.soLanSuDungToiDa || promotion.usageLimit) && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-orange-500 h-1.5 rounded-full"
                                style={{ 
                                  width: `${((promotion.soLanDaSuDung || promotion.usedCount || 0) / (promotion.soLanSuDungToiDa || promotion.usageLimit || 1)) * 100}%` 
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const endDate = promotion.ngayKetThuc || promotion.endDate || '';
                          const isExpired = endDate && new Date(endDate) < new Date();
                          const isActive = promotion.trangThai === 'ACTIVE' || promotion.isActive;
                          
                          // Ưu tiên kiểm tra hết hạn trước
                          if (isExpired) {
                            return (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                Hết hạn
                              </span>
                            );
                          }
                          
                          // Sau đó kiểm tra trạng thái active
                          if (isActive) {
                            return (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                Đang hoạt động
                              </span>
                            );
                          }
                          
                          // Còn lại là tạm dừng
                          return (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                              Tạm dừng
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(promotion)}
                              className="cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(promotion.id)}
                              className="cursor-pointer"
                            >
                              {promotion.isActive ? (
                                <>
                                  <PowerOff className="w-4 h-4 mr-2" />
                                  Vô hiệu hóa
                                </>
                              ) : (
                                <>
                                  <Power className="w-4 h-4 mr-2" />
                                  Kích hoạt
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(promotion)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Promotion Dialog */}
      <AddPromotionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddPromotion}
      />

      {/* Edit Promotion Dialog */}
      <EditPromotionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        promotion={selectedPromotion}
        onUpdate={handleUpdatePromotion}
      />
    </div>
  );
}
