import { Bell, Mail, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function Header() {
  const user = useAuthStore((state) => state.user);

  // Mock notifications
  const notifications = [
    { id: 1, message: 'Hóa đơn mới #HD001', time: '5 phút trước', read: false },
    { id: 2, message: 'Sản phẩm sắp hết hàng: Cà phê đen', time: '1 giờ trước', read: false },
    { id: 3, message: 'Khách hàng mới đăng ký', time: '2 giờ trước', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="no-print h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Breadcrumbs */}
      <div className="flex-1">
        <Breadcrumbs />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-orange-50 hover:text-orange-600">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Thông báo</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  Không có thông báo mới
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "flex flex-col items-start gap-1 px-4 py-3 cursor-pointer",
                      !notification.read && "bg-orange-50/50"
                    )}
                  >
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-orange-600 hover:text-orange-700">
                  Xem tất cả
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.tenNhanVien?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.tenNhanVien || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user?.tenNhanVien || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || user?.soDienThoai || ''}</p>
            </div>
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Hồ sơ
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Mail className="w-4 h-4 mr-2" />
              Tin nhắn
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}