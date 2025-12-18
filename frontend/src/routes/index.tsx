import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import PageLoading from '@/components/common/PageLoading';

// Layouts - Keep these non-lazy as they're always needed
import DashboardLayout from '@/components/layout/DashboardLayout';
import POSLayout from '@/components/layout/POSLayout';

// Auth page - Keep non-lazy for faster initial load
import LoginPage from '@/pages/auth/LoginPage';

// Lazy load all other pages for code splitting
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const POSPage = lazy(() => import('@/pages/pos/POSPage'));
const PaymentPage = lazy(() => import('@/pages/pos/PaymentPage'));
const TableSelectionPage = lazy(() => import('@/pages/pos/TableSelectionPage'));
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'));
const CustomersPage = lazy(() => import('@/pages/customers/CustomersPage'));
const InvoicesPage = lazy(() => import('@/pages/invoices/InvoicesPage'));
const InvoiceDetailPage = lazy(() => import('@/pages/invoices/InvoiceDetailPage'));
const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage'));
const ReceiptDetailPage = lazy(() => import('@/pages/inventory/ReceiptDetailPage'));
const EmployeesPage = lazy(() => import('@/pages/employees/EmployeesPage'));
const PromotionsPage = lazy(() => import('@/pages/promotions/PromotionsPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const VNPayCallbackPage = lazy(() => import('@/pages/payments/VNPayCallbackPage'));


// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  
  // Show loading while initializing (initialize is called from App.tsx)
  if (!isInitialized) {
    return <PageLoading message="Đang tải..." />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Placeholder pages
function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">Trang này đang được phát triển...</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    // ✅ PUBLIC ROUTE - Không cần authentication
    // VNPay redirect về từ bên ngoài, không có token
    path: '/payments/vnpay/return',
    element: (
      <Suspense fallback={<PageLoading />}>
        <VNPayCallbackPage />
      </Suspense>
    ),
  },
  {
    path: '/pos',
    element: (
      <ProtectedRoute>
        <POSLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoading />}>
            <TableSelectionPage />
          </Suspense>
        ),
      },
      {
        path: 'table/:tableId',
        element: (
          <Suspense fallback={<PageLoading />}>
            <POSPage />
          </Suspense>
        ),
      },
      {
        path: 'payment',
        element: (
          <Suspense fallback={<PageLoading />}>
            <PaymentPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoading />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ProductsPage />
          </Suspense>
        ),
      },
      {
        path: 'products/:id',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ProductDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={<PageLoading />}>
            <CustomersPage />
          </Suspense>
        ),
      },
      {
        path: 'invoices',
        element: (
          <Suspense fallback={<PageLoading />}>
            <InvoicesPage />
          </Suspense>
        ),
      },
      {
        path: 'invoices/:id',
        element: (
          <Suspense fallback={<PageLoading />}>
            <InvoiceDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'inventory',
        element: (
          <Suspense fallback={<PageLoading />}>
            <InventoryPage />
          </Suspense>
        ),
      },
      {
        path: 'inventory/receipts/:type/:id',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ReceiptDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: <Navigate to="/dashboard?tab=reports" replace />,
      },
      {
        path: 'employees',
        element: (
          <Suspense fallback={<PageLoading />}>
            <EmployeesPage />
          </Suspense>
        ),
      },
      {
        path: 'promotions',
        element: (
          <Suspense fallback={<PageLoading />}>
            <PromotionsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoading />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
]);