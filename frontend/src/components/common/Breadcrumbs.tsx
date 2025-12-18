import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Sản phẩm',
  '/customers': 'Khách hàng',
  '/invoices': 'Hóa đơn',
  '/inventory': 'Nguyên liệu',
  '/employees': 'Nhân viên',
  '/promotions': 'Khuyến mãi',
  '/settings': 'Cài đặt',
  '/pos': 'Bán hàng (POS)',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Trang chủ', path: '/dashboard' },
  ];

  let currentPath = '';
  pathnames.forEach((pathname, index) => {
    currentPath += `/${pathname}`;
    const isLast = index === pathnames.length - 1;
    
    // Skip if it's a dynamic route (like /products/:id)
    if (pathname.match(/^\d+$/)) {
      return;
    }

    const label = routeLabels[currentPath] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
    breadcrumbs.push({
      label,
      path: isLast ? undefined : currentPath,
    });
  });

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-2">
          {index === 0 ? (
            <Link
              to={crumb.path || '#'}
              className="flex items-center gap-1 hover:text-orange-600 transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="hover:text-orange-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
}

