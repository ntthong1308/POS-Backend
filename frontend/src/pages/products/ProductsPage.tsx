import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '@/lib/types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productsAPI } from '@/lib/api/products';
import { filesAPI } from '@/lib/api/files';
import { toast } from 'sonner';
import { Search, Filter, Grid3x3, List, Plus, RefreshCw, ChevronRight, MoreVertical, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductManagementCard from '@/components/features/products/ProductManagementCard';
import AddProductDialog from '@/components/features/products/AddProductDialog';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import EmptyState from '@/components/common/EmptyState';
import PageLoading from '@/components/common/PageLoading';
import LazyImage from '@/components/common/LazyImage';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/utils/errorHandler';

// Mock data for food & beverages
const mockProducts: Product[] = [
  {
    id: 1,
    maSanPham: 'CF001',
    tenSanPham: 'Cà phê đen đá',
    moTa: 'Cà phê đen truyền thống pha từ hạt Arabica',
    giaBan: 25000,
    tonKho: 210,
    donViTinh: 'Ly',
    danhMuc: 'Beverages',
    trangThai: 'ACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
  },
  {
    id: 2,
    maSanPham: 'TS002',
    tenSanPham: 'Trà sữa trân châu',
    moTa: 'Trà sữa trân châu đường đen thơm ngon',
    giaBan: 35000,
    tonKho: 12,
    donViTinh: 'Ly',
    danhMuc: 'Beverages',
    trangThai: 'ACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1525385444278-5d59a51f66c7?w=400',
  },
  {
    id: 3,
    maSanPham: 'BM003',
    tenSanPham: 'Bánh mì thịt nguội',
    moTa: 'Bánh mì thịt nguội pate đặc biệt',
    giaBan: 20000,
    tonKho: 0,
    donViTinh: 'Cái',
    danhMuc: 'Main Course',
    trangThai: 'ACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1619894991209-4f6106c0c8f9?w=400',
  },
  {
    id: 4,
    maSanPham: 'ST004',
    tenSanPham: 'Sinh tố bơ',
    moTa: 'Sinh tố bơ sữa đặc thơm ngon',
    giaBan: 30000,
    tonKho: 341,
    donViTinh: 'Ly',
    danhMuc: 'Beverages',
    trangThai: 'ACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1553909489-ec2175ef8f17?w=400',
  },
  {
    id: 5,
    maSanPham: 'NE005',
    tenSanPham: 'Nước ép cam tươi',
    moTa: 'Nước ép cam tươi 100% không đường',
    giaBan: 28000,
    tonKho: 32,
    donViTinh: 'Ly',
    danhMuc: 'Beverages',
    trangThai: 'ACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    id: 6,
    maSanPham: 'XX006',
    tenSanPham: 'Xôi xéo đậu xanh',
    moTa: 'Xôi xéo đậu xanh truyền thống',
    giaBan: 18000,
    tonKho: 5,
    donViTinh: 'Phần',
    danhMuc: 'Appetizer',
    trangThai: 'ACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
  },
  {
    id: 7,
    maSanPham: 'CP007',
    tenSanPham: 'Cappuccino',
    moTa: 'Cappuccino Ý với lớp bọt sữa dày',
    giaBan: 45000,
    tonKho: 156,
    donViTinh: 'Ly',
    danhMuc: 'Beverages',
    trangThai: 'ACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
  },
  {
    id: 8,
    maSanPham: 'PH008',
    tenSanPham: 'Phở bò tái',
    moTa: 'Phở bò tái chín thơm ngon',
    giaBan: 55000,
    tonKho: 45,
    donViTinh: 'Tô',
    danhMuc: 'Main Course',
    trangThai: 'ACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
  },
  {
    id: 9,
    maSanPham: 'BC009',
    tenSanPham: 'Bánh chưng',
    moTa: 'Bánh chưng truyền thống',
    giaBan: 40000,
    tonKho: 0,
    donViTinh: 'Cái',
    danhMuc: 'Main Course',
    trangThai: 'INACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
  },
  {
    id: 10,
    maSanPham: 'KC010',
    tenSanPham: 'Kem chanh dây',
    moTa: 'Kem chanh dây mát lạnh',
    giaBan: 25000,
    tonKho: 78,
    donViTinh: 'Ly',
    danhMuc: 'Dessert',
    trangThai: 'ACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
  },
  {
    id: 11,
    maSanPham: 'CH011',
    tenSanPham: 'Chè đậu xanh',
    moTa: 'Chè đậu xanh nước cốt dừa',
    giaBan: 20000,
    tonKho: 89,
    donViTinh: 'Ly',
    danhMuc: 'Dessert',
    trangThai: 'ACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
  },
  {
    id: 12,
    maSanPham: 'SN012',
    tenSanPham: 'Bánh tráng nướng',
    moTa: 'Bánh tráng nướng đặc biệt',
    giaBan: 15000,
    tonKho: 23,
    donViTinh: 'Cái',
    danhMuc: 'Snacks',
    trangThai: 'ACTIVE',
    hinhAnh: 'https://images.unsplash.com/photo-1619894991209-4f6106c0c8f9?w=400',
  },
];

type ViewMode = 'grid' | 'list';
type FilterStatus = 'active' | 'out_of_stock' | 'low_stock';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('active');
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearchKeyword = useDebounce(searchKeyword, 500); // Debounce 500ms
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20); // Fixed page size for now
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const types = [
    { value: 'all', label: 'Tất cả loại' },
    { value: 'food', label: 'Đồ ăn' },
    { value: 'beverage', label: 'Đồ uống' },
  ];

  // Load products from API with pagination
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        if (debouncedSearchKeyword.trim()) {
          // Use search API if there's a search keyword
          const response = await productsAPI.search({
            keyword: debouncedSearchKeyword,
            page: currentPage,
            size: pageSize,
          });
          setProducts(response.content || []);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || 0);
        } else {
          // Use getAll API with pagination
          const response = await productsAPI.getAll({
            page: currentPage,
            size: pageSize,
          });
          setProducts(response.content || []);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || 0);
        }
      } catch (error: unknown) {
        logger.error('Error loading products:', error);
        // Fallback to mock data on error
        setProducts(mockProducts);
        setTotalPages(1);
        setTotalElements(mockProducts.length);
        toast.error('Không thể tải danh sách sản phẩm. Đang dùng dữ liệu mẫu.');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [currentPage, pageSize, debouncedSearchKeyword]);

  // Handle edit query param
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const productId = Number(editId);
      if (!isNaN(productId)) {
        const productToEdit = products.find(p => p.id === productId);
        if (productToEdit) {
          setEditingProduct(productToEdit);
          setIsAddDialogOpen(true);
          // Remove edit param from URL
          setSearchParams({}, { replace: true });
        }
      }
    }
  }, [searchParams, products, setSearchParams]);

  // Memoize filtered products to avoid recalculating on every render
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by status
    if (statusFilter === 'active') {
      result = result.filter(p => p.trangThai === 'ACTIVE' && p.tonKho > 0);
    } else if (statusFilter === 'out_of_stock') {
      result = result.filter(p => p.tonKho === 0);
    } else if (statusFilter === 'low_stock') {
      result = result.filter(p => p.tonKho > 0 && p.tonKho < 20);
    }

    // Note: Search is now handled by API, so we don't filter by searchKeyword here

    // Filter by type (food/beverage)
    if (typeFilter !== 'all') {
      if (typeFilter === 'beverage') {
        result = result.filter(p => 
          p.danhMuc === 'Beverages' || 
          p.tenSanPham.toLowerCase().includes('cà phê') ||
          p.tenSanPham.toLowerCase().includes('trà') ||
          p.tenSanPham.toLowerCase().includes('nước') ||
          p.tenSanPham.toLowerCase().includes('sinh tố')
        );
      } else if (typeFilter === 'food') {
        result = result.filter(p => 
          p.danhMuc !== 'Beverages' &&
          !p.tenSanPham.toLowerCase().includes('cà phê') &&
          !p.tenSanPham.toLowerCase().includes('trà') &&
          !p.tenSanPham.toLowerCase().includes('nước') &&
          !p.tenSanPham.toLowerCase().includes('sinh tố')
        );
      }
    }

    return result;
  }, [products, statusFilter, typeFilter]);

  // Memoize getStockStatus function to avoid recreating on every render
  const getStockStatus = useCallback((stock: number) => {
    if (stock === 0) return { label: 'Hết hàng', color: 'text-red-600', bgColor: 'bg-red-50', barColor: 'bg-red-500', level: 0 };
    if (stock < 20) return { label: 'Thấp', color: 'text-red-600', bgColor: 'bg-red-50', barColor: 'bg-red-500', level: 33 };
    if (stock < 50) return { label: 'Trung bình', color: 'text-orange-600', bgColor: 'bg-orange-50', barColor: 'bg-orange-500', level: 66 };
    return { label: 'Cao', color: 'text-green-600', bgColor: 'bg-green-50', barColor: 'bg-green-500', level: 100 };
  }, []);

  // Map category to Vietnamese label
  const getCategoryLabel = useCallback((category: string): string => {
    const categoryMap: Record<string, string> = {
      'Beverages': 'Đồ uống',
      'Main Course': 'Món chính',
      'Dessert': 'Tráng miệng',
      'Appetizer': 'Khai vị',
      'Snacks': 'Đồ ăn vặt',
    };
    return categoryMap[category] || category;
  }, []);

  // Memoize status counts to avoid recalculating on every render
  const statusCounts = useMemo(() => ({
    active: products.filter(p => p.trangThai === 'ACTIVE' && p.tonKho > 0).length,
    out_of_stock: products.filter(p => p.tonKho === 0).length,
    low_stock: products.filter(p => p.tonKho > 0 && p.tonKho < 20).length,
  }), [products]);

  // Memoize handlers to prevent unnecessary re-renders of child components
  const handleStatusChange = useCallback(async (productId: number, newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      const updatedProduct = await productsAPI.updateStatus(productId, newStatus);
      setProducts(prevProducts => prevProducts.map(p => 
        p.id === productId ? updatedProduct : p
      ));
      toast.success(newStatus === 'ACTIVE' ? 'Đã kích hoạt sản phẩm' : 'Đã vô hiệu hóa sản phẩm');
    } catch (error: unknown) {
      logger.error('Error updating product status:', error);
      // ✅ Standardized error handling với handleApiError utility
      const errorMessage = handleApiError(error, 'Không thể cập nhật trạng thái sản phẩm');
      toast.error(errorMessage);
    }
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsAddDialogOpen(true);
  }, []);

  const handleDeleteProduct = useCallback(async (productId: number) => {
    const product = products.find(p => p.id === productId);
    const productName = product?.tenSanPham || 'sản phẩm này';
    
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${productName}"?\n\nHành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await productsAPI.delete(productId);
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      toast.success(`Đã xóa "${productName}" thành công`);
    } catch (error: unknown) {
      logger.error('Error deleting product:', error);
      // ✅ Standardized error handling với handleApiError utility
      const errorMessage = handleApiError(error, 'Không thể xóa sản phẩm');
      toast.error(errorMessage);
    }
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Add/Edit Product Dialog */}
      <AddProductDialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        onUpdate={async (productId, productData) => {
          try {
            const updatedProduct = await productsAPI.update(productId, productData);
            setProducts(prevProducts => prevProducts.map(p => p.id === productId ? updatedProduct : p));
            toast.success(`Đã cập nhật sản phẩm "${updatedProduct.tenSanPham}" thành công!`, {
              description: `Mã sản phẩm: ${updatedProduct.maSanPham}`,
              duration: 3000,
            });
            setIsAddDialogOpen(false);
            setEditingProduct(null);
            // Reload products
            const response = await productsAPI.getAll({ page: currentPage, size: pageSize });
            setProducts(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
          } catch (error: unknown) {
            logger.error('Error updating product:', error);
            // ✅ Standardized error handling với handleApiError utility
            const errorMessage = handleApiError(error, 'Không thể cập nhật sản phẩm. Vui lòng thử lại.');
            toast.error('Không thể cập nhật sản phẩm', {
              description: errorMessage,
              duration: 5000,
            });
            // Throw error để AddProductDialog biết có lỗi và không reset form
            throw error;
          }
        }}
        onSave={async (productData) => {
          try {
            // Debug: Log dữ liệu nhận được
            logger.debug('[ProductsPage] Creating product with data:', productData);
            
            const newProduct = await productsAPI.create(productData);
            
            logger.info('[ProductsPage] Product created successfully:', newProduct);
            
            setProducts(prevProducts => [...prevProducts, newProduct]);
            
            // Hiển thị thông báo thành công
            toast.success(`Đã tạo sản phẩm "${newProduct.tenSanPham}" thành công!`, {
              description: `Mã sản phẩm: ${newProduct.maSanPham}`,
              duration: 3000,
            });
            
            setIsAddDialogOpen(false);
            setEditingProduct(null);
            
            // Reload products
            const response = await productsAPI.getAll({ page: currentPage, size: pageSize });
            setProducts(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
          } catch (error: unknown) {
            logger.error('[ProductsPage] Error creating product:', error);
            
            // ✅ Standardized error handling với handleApiError utility
            const errorMessage = handleApiError(error, 'Không thể tạo sản phẩm. Vui lòng thử lại.');
            
            // Hiển thị thông báo lỗi
            try {
              toast.error('Không thể tạo sản phẩm', {
                description: errorMessage,
                duration: 5000,
              });
            } catch (toastError) {
              logger.error('[ProductsPage] Error displaying toast:', toastError);
              // Fallback: alert nếu toast không hoạt động
              alert(`Lỗi: ${errorMessage}`);
            }
            
            // Throw error để AddProductDialog biết có lỗi và không reset form
            throw error;
          }
        }}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { key: 'active', label: 'Đang bán', count: statusCounts.active },
            { key: 'low_stock', label: 'Sắp hết hàng', count: statusCounts.low_stock },
            { key: 'out_of_stock', label: 'Hết hàng', count: statusCounts.out_of_stock },
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
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* View Settings */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === 'grid' ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === 'list' ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <PageLoading message="Đang tải sản phẩm..." />
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            }
            title="Không tìm thấy sản phẩm"
            description="Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác"
            action={searchKeyword || statusFilter !== 'active' ? {
              label: 'Xóa bộ lọc',
              onClick: () => {
                setSearchKeyword('');
                setStatusFilter('active');
              }
            } : {
              label: 'Thêm sản phẩm mới',
              onClick: () => setIsAddDialogOpen(true)
            }}
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductManagementCard
              key={product.id}
              product={product}
              getStockStatus={getStockStatus}
              onStatusChange={handleStatusChange}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sản phẩm</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Danh mục</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Giá bán</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tồn kho</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.tonKho);
                return (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.hinhAnh ? (
                            <img 
                              src={filesAPI.getImageUrl(product.hinhAnh)} 
                              alt={product.tenSanPham} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product.tenSanPham}</p>
                          {product.danhMuc && (
                            <p className="text-xs text-gray-500">{getCategoryLabel(product.danhMuc)}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{product.maSanPham}</td>
                    <td className="py-4 px-4">
                      {product.tenDanhMuc ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.tenDanhMuc}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Chưa phân loại</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        product.trangThai === 'ACTIVE' 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {product.trangThai === 'ACTIVE' ? 'Đang bán' : 'Nháp'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                      {product.giaBan.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", stockStatus.color)}>
                          {product.tonKho} {product.donViTinh}
                        </span>
                        <span className={cn("text-xs px-2 py-0.5 rounded", stockStatus.bgColor, stockStatus.color)}>
                          {stockStatus.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Xem chi tiết
                        </button>
                        <button className="text-gray-400 hover:text-orange-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} trong tổng số {totalElements} sản phẩm
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Trước
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className={cn(
                      "min-w-[40px]",
                      currentPage === pageNum && "bg-orange-500 hover:bg-orange-600"
                    )}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1 || loading}
            >
              Sau
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}