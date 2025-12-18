import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '@/lib/api/products';
import { queryKeys } from '@/lib/react-query';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/utils/errorHandler';

/**
 * Hook to fetch products with caching
 */
export function useProducts(filters?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: queryKeys.products.list(filters || {}),
    queryFn: () => productsAPI.getAll(filters || { page: 0, size: 20 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search products with caching
 */
export function useSearchProducts(keyword: string, filters?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: queryKeys.products.search(keyword),
    queryFn: () => productsAPI.search({ keyword, ...filters }),
    enabled: !!keyword && keyword.length > 0, // Only run if keyword exists
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
}

/**
 * Hook to get product by ID with caching
 */
export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id!),
    queryFn: () => productsAPI.getById(id!),
    enabled: !!id, // Only run if id exists
    staleTime: 10 * 60 * 1000, // 10 minutes for individual products
  });
}

/**
 * Hook to create product with cache invalidation
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (product: Omit<Product, 'id'>) => productsAPI.create(product),
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast.success('Đã tạo sản phẩm thành công');
    },
    onError: (error: any) => {
      const errorMessage = handleApiError(error, 'Không thể tạo sản phẩm');
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to update product with cache invalidation
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, product }: { id: number; product: Partial<Product> }) =>
      productsAPI.update(id, product),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
      toast.success('Đã cập nhật sản phẩm thành công');
    },
    onError: (error: any) => {
      const errorMessage = handleApiError(error, 'Không thể cập nhật sản phẩm');
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to delete product with cache invalidation
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => productsAPI.delete(id),
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast.success('Đã xóa sản phẩm thành công');
    },
    onError: (error: any) => {
      const errorMessage = handleApiError(error, 'Không thể xóa sản phẩm');
      toast.error(errorMessage);
    },
  });
}


