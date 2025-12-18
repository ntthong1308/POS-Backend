import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import ErrorBoundary from '@/components/common/ErrorBoundary';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  // Initialize auth state from localStorage on app load
  // Token is persisted for 5 days, then expires automatically
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={5000}
        expand={true}
        visibleToasts={5}
      />
    </ErrorBoundary>
  );
}

export default App;

function OldApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4 shadow-orange-200 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Retail POS App
          </h1>
          <p className="text-gray-600">
            Hệ thống quản lý bán hàng thông minh 🎉
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <Input
              type="text"
              placeholder="admin"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Button className="w-full font-bold shadow-md" size="lg">
            Đăng nhập
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            Đăng ký tài khoản
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <Button variant="secondary" size="sm" className="text-xs h-auto py-2 flex-col gap-1">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              Admin
            </Button>
            <Button variant="secondary" size="sm" className="text-xs h-auto py-2 flex-col gap-1">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              Manager
            </Button>
            <Button variant="secondary" size="sm" className="text-xs h-auto py-2 flex-col gap-1">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
              Cashier
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800 mb-1">
                Setup thành công!
              </p>
              <ul className="text-xs text-green-700 space-y-1">
                <li>✓ Vite + React + TypeScript</li>
                <li>✓ Tailwind CSS + ShadCN UI</li>
                <li>✓ Button & Input components</li>
                <li>✓ API Client & Auth Store</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
