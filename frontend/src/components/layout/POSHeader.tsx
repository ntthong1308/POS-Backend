import { Calendar, RefreshCw, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';

export default function POSHeader() {
  const user = useAuthStore((state) => state.user);
  const [restaurantStatus, setRestaurantStatus] = useState('Mở cửa');
  const currentDate = format(new Date(), "EEEE, dd MMM yyyy 'lúc' HH:mm", { locale: vi });

  return (
    <header className="h-16 bg-gray-100 border-b border-gray-300 px-6 flex items-center justify-between">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">All-Time Coffee & Space</h2>
          <select
            value={restaurantStatus}
            onChange={(e) => setRestaurantStatus(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="Mở cửa">Mở cửa</option>
            <option value="Đóng cửa">Đóng cửa</option>
          </select>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Date & Time */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4" />
          <span className="capitalize">{currentDate}</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User className="w-4 h-4" />
          <span>{user?.tenNhanVien || 'Người dùng'}</span>
        </div>

        {/* Refresh */}
        <Button variant="ghost" size="icon" className="hover:bg-orange-50 hover:text-orange-600" title="Làm mới">
          <RefreshCw className="w-5 h-5" />
        </Button>

        {/* Search Menu */}
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Search className="w-4 h-4 mr-2" />
          Tìm kiếm menu
        </Button>
      </div>
    </header>
  );
}

