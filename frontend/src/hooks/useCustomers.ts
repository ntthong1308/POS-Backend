import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersAPI } from '@/lib/api/customers';
import { invoicesAPI } from '@/lib/api/invoices';
import { queryKeys } from '@/lib/react-query';
import { Customer } from '@/lib/types';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/utils/errorHandler';

/**
 * Hook to fetch customers with caching
 */
export function useCustomers(filters?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters || {}),
    queryFn: () => customersAPI.getAll(filters || { page: 0, size: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get customer by ID with caching
 */
export function useCustomer(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id!),
    queryFn: () => customersAPI.getById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get customer stats with caching
 */
export function useCustomerStats(customerId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.customers.stats(customerId!),
    queryFn: async () => {
      if (!customerId) return { totalOrders: 0, totalRevenue: 0 };
      const invoices = await invoicesAPI.getByCustomer(customerId);
      const totalOrders = invoices.length;
      const totalRevenue = invoices.reduce((sum, inv) => {
        return sum + (inv.thanhToan || inv.thanhTien || 0);
      }, 0);
      return { totalOrders, totalRevenue };
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create customer with cache invalidation
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customer: Omit<Customer, 'id' | 'maKhachHang'>) => 
      customersAPI.create(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      toast.success('Đã tạo khách hàng thành công');
    },
    onError: (error: any) => {
      const errorMessage = handleApiError(error, 'Không thể tạo khách hàng');
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to update customer with cache invalidation
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, customer }: { id: number; customer: Partial<Customer> }) =>
      customersAPI.update(id, customer),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.stats(variables.id) });
      toast.success('Đã cập nhật khách hàng thành công');
    },
    onError: (error: any) => {
      const errorMessage = handleApiError(error, 'Không thể cập nhật khách hàng');
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to delete customer with cache invalidation
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => customersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      toast.success('Đã xóa khách hàng thành công');
    },
    onError: (error: any) => {
      const errorMessage = handleApiError(error, 'Không thể xóa khách hàng');
      toast.error(errorMessage);
    },
  });
}


