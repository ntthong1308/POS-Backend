import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Receipt, 
  Warehouse,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Ticket
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/common/Tooltip';

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    path: '/dashboard',
    roles: ['ADMIN', 'MANAGER', 'CASHIER']
  },
  { 
    icon: ShoppingCart, 
    label: 'Bán hàng (POS)', 
    path: '/pos',
    roles: ['ADMIN', 'MANAGER', 'CASHIER']
  },
  { 
    icon: Package, 
    label: 'Sản phẩm', 
    path: '/products',
    roles: ['ADMIN', 'MANAGER']
  },
  { 
    icon: Users, 
    label: 'Khách hàng', 
    path: '/customers',
    roles: ['ADMIN', 'MANAGER', 'CASHIER']
  },
  { 
    icon: Receipt, 
    label: 'Hóa đơn', 
    path: '/invoices',
    roles: ['ADMIN', 'MANAGER', 'CASHIER']
  },
  { 
    icon: Warehouse, 
    label: 'Nguyên liệu', 
    path: '/inventory',
    roles: ['ADMIN', 'MANAGER']
  },
  { 
    icon: UserCog, 
    label: 'Nhân viên', 
    path: '/employees',
    roles: ['ADMIN', 'MANAGER']
  },
  { 
    icon: Ticket, 
    label: 'Khuyến mãi', 
    path: '/promotions',
    roles: ['ADMIN', 'MANAGER']
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const menuRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + number keys for quick navigation
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (filteredMenuItems[index] && menuRefs.current[index]) {
          e.preventDefault();
          menuRefs.current[index]?.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredMenuItems]);

  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 no-print",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="All-Time Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-bold text-lg text-gray-900">All-Time</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-1">
          {filteredMenuItems.map((item, index) => (
            <Tooltip key={item.path} content={item.label} side="right" className={collapsed ? '' : 'hidden'}>
              <NavLink
                ref={(el) => { menuRefs.current[index] = el; }}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                  isActive 
                    ? "bg-orange-50 text-orange-600 shadow-sm border-l-4 border-orange-500" 
                    : "text-gray-700 hover:bg-orange-50/50 hover:text-orange-600",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", collapsed ? "w-6 h-6" : "")} />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </NavLink>
            </Tooltip>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-1 bg-gray-50/50">
        <Tooltip content="Cài đặt" side="right" className={collapsed ? '' : 'hidden'}>
          <NavLink
            to="/settings"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
              isActive && "bg-gray-100 text-gray-900",
              collapsed && "justify-center"
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">Cài đặt</span>}
          </NavLink>
        </Tooltip>
        
        <Tooltip content="Đăng xuất" side="right" className={collapsed ? '' : 'hidden'}>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">Đăng xuất</span>}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
