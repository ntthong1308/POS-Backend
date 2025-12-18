import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductCard from '@/components/features/pos/ProductCard';
import OrderSummary from '@/components/features/pos/OrderSummary';
import { posAPI } from '@/lib/api/pos';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/common/PageLoading';

// Categories based on backend: "Đồ ăn" (DM001) and "Đồ uống" (DM002)
const categories = [
  { name: 'Tất cả', count: 0, key: 'All', tenDanhMuc: null },
  { name: 'Đồ ăn', count: 0, key: 'food', tenDanhMuc: 'Đồ ăn' },
  { name: 'Đồ uống', count: 0, key: 'drink', tenDanhMuc: 'Đồ uống' },
];

export default function POSPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { setSelectedTable } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Set table from URL params
  useEffect(() => {
    if (tableId) {
      setSelectedTable(tableId);
    } else {
      // If no tableId, redirect to table selection
      navigate('/pos');
    }
  }, [tableId, setSelectedTable, navigate]);

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('[POS] Loading products...');
      const data = await posAPI.getProducts();
      console.log('[POS] Products response:', data);
      
      // Ensure data is an array
      const productsArray = Array.isArray(data) ? data : [];
      console.log('[POS] Products array:', productsArray);
      console.log('[POS] Products count:', productsArray.length);
      
      setProducts(productsArray);
      
      // Update category counts based on tenDanhMuc from backend
      categories.forEach(cat => {
        if (cat.key === 'All') {
          cat.count = productsArray.length;
        } else if (cat.tenDanhMuc) {
          cat.count = productsArray.filter(p => p.tenDanhMuc === cat.tenDanhMuc).length;
        }
      });
    } catch (error: any) {
      console.error('[POS] Error loading products:', error);
      console.error('[POS] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || 'Không thể tải danh sách sản phẩm');
      // Ensure arrays are set even on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Search products - memoize to prevent unnecessary re-renders
  const handleSearch = useCallback(async (keyword: string) => {
    setSearchKeyword(keyword);
    if (!keyword.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const results = await posAPI.searchProducts(keyword);
      // Ensure results is an array
      const resultsArray = Array.isArray(results) ? results : [];
      setSearchResults(resultsArray);
    } catch (error: any) {
      console.error('Error searching products:', error);
      toast.error('Không thể tìm kiếm sản phẩm');
      setSearchResults([]);
    }
  }, []);

  // Memoize filtered products to avoid recalculating on every render
  const filteredProducts = useMemo(() => {
    // If searching, use search results
    if (searchKeyword.trim() && searchResults !== null) {
      return searchResults;
    }

    // Otherwise, filter by category
    const productsArray = Array.isArray(products) ? products : [];
    
    // Filter by category based on tenDanhMuc from backend
    if (selectedCategory !== 'All') {
      const selectedCat = categories.find(c => c.key === selectedCategory);
      if (selectedCat?.tenDanhMuc) {
        return productsArray.filter(p => p.tenDanhMuc === selectedCat.tenDanhMuc);
      }
    }

    return productsArray;
  }, [selectedCategory, products, searchKeyword, searchResults]);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/pos')}
              className="hover:bg-gray-100"
              title="Quay lại chọn bàn"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Menu sản phẩm</h1>
              <p className="text-sm text-gray-600">Bàn {tableId || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white border-b border-gray-300 px-6 py-3 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => {
                  setSelectedCategory(category.key);
                  setSearchKeyword(''); // Clear search when selecting category
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === category.key
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {category.name} {category.count}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <PageLoading message="Đang tải sản phẩm..." />
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 text-lg mb-2">Không tìm thấy sản phẩm</p>
                <p className="text-gray-400 text-sm">Thử chọn danh mục khác hoặc tìm kiếm</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Summary Panel */}
      <div className="w-96 border-l border-gray-300 flex-shrink-0 bg-white">
        <OrderSummary />
      </div>
    </div>
  );
}
