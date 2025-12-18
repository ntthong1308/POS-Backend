import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration
 * Provides caching and data synchronization
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache data for 10 minutes after it becomes stale
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry failed requests 1 time
      retry: 1,
      
      // Refetch on window focus (useful for keeping data fresh)
      refetchOnWindowFocus: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      
      // Don't refetch on reconnect if data is fresh
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry failed mutations 1 time
      retry: 1,
    },
  },
});

/**
 * Query keys factory for consistent cache keys
 */
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.products.details(), id] as const,
    search: (keyword: string) => [...queryKeys.products.all, 'search', keyword] as const,
  },
  
  // Customers
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.customers.details(), id] as const,
    stats: (id: number) => [...queryKeys.customers.detail(id), 'stats'] as const,
  },
  
  // Invoices
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.invoices.lists(), filters] as const,
    details: () => [...queryKeys.invoices.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.invoices.details(), id] as const,
    byCustomer: (customerId: number) => [...queryKeys.invoices.all, 'customer', customerId] as const,
    byDate: (fromDate: string, toDate: string, status?: string) => 
      [...queryKeys.invoices.all, 'date', fromDate, toDate, status] as const,
  },
  
  // Employees
  employees: {
    all: ['employees'] as const,
    lists: () => [...queryKeys.employees.all, 'list'] as const,
    list: () => [...queryKeys.employees.lists()] as const,
    details: () => [...queryKeys.employees.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.employees.details(), id] as const,
  },
  
  // Promotions
  promotions: {
    all: ['promotions'] as const,
    lists: () => [...queryKeys.promotions.all, 'list'] as const,
    list: () => [...queryKeys.promotions.lists()] as const,
    details: () => [...queryKeys.promotions.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.promotions.details(), id] as const,
    active: (chiNhanhId?: number) => [...queryKeys.promotions.all, 'active', chiNhanhId] as const,
  },
  
  // Inventory
  inventory: {
    all: ['inventory'] as const,
    stock: () => [...queryKeys.inventory.all, 'stock'] as const,
    importReceipts: () => [...queryKeys.inventory.all, 'import'] as const,
    exportReceipts: () => [...queryKeys.inventory.all, 'export'] as const,
    transactions: () => [...queryKeys.inventory.all, 'transactions'] as const,
    rawMaterials: () => [...queryKeys.inventory.all, 'rawMaterials'] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: (date?: string) => [...queryKeys.dashboard.all, 'stats', date] as const,
    reports: (period: string) => [...queryKeys.dashboard.all, 'reports', period] as const,
  },
  
  // Categories
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },
};


