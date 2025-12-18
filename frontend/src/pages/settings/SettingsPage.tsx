import { useState } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Store, 
  Globe,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'store'>('profile');
  
  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderAlerts: true,
    lowStockAlerts: true,
    promotionAlerts: false,
  });

  // Store info state
  const [storeInfo, setStoreInfo] = useState({
    storeName: 'ALL-TIME COFFEE & SPACE',
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
    phone: '0123456789',
    email: 'info@alltimecoffee.com',
    taxCode: '1234567890',
  });

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'store', label: 'Thông tin cửa hàng', icon: Store },
  ];

  const handleSaveProfile = () => {
    // API integration not implemented for demo
    toast.success('Đã cập nhật thông tin cá nhân');
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    // API integration not implemented for demo
    toast.success('Đã đổi mật khẩu thành công');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleSaveNotifications = () => {
    // API integration not implemented for demo
    toast.success('Đã cập nhật cài đặt thông báo');
  };

  const handleSaveStoreInfo = () => {
    // API integration not implemented for demo
    toast.success('Đã cập nhật thông tin cửa hàng');
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý thông tin tài khoản và cài đặt hệ thống</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600 font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Vai trò</Label>
                    <Input
                      value={user?.role || 'N/A'}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="bg-orange-500 hover:bg-orange-600">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Đổi mật khẩu</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} className="bg-orange-500 hover:bg-orange-600">
                  <Lock className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt thông báo</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Thông báo qua Email</Label>
                      <p className="text-sm text-gray-600 mt-1">Nhận thông báo quan trọng qua email</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        notifications.emailNotifications ? "bg-orange-500" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          notifications.emailNotifications ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Thông báo qua SMS</Label>
                      <p className="text-sm text-gray-600 mt-1">Nhận thông báo qua tin nhắn SMS</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, smsNotifications: !notifications.smsNotifications })}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        notifications.smsNotifications ? "bg-orange-500" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          notifications.smsNotifications ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Cảnh báo đơn hàng</Label>
                      <p className="text-sm text-gray-600 mt-1">Thông báo khi có đơn hàng mới</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, orderAlerts: !notifications.orderAlerts })}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        notifications.orderAlerts ? "bg-orange-500" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          notifications.orderAlerts ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Cảnh báo sắp hết hàng</Label>
                      <p className="text-sm text-gray-600 mt-1">Thông báo khi sản phẩm sắp hết hàng</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, lowStockAlerts: !notifications.lowStockAlerts })}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        notifications.lowStockAlerts ? "bg-orange-500" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          notifications.lowStockAlerts ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Thông báo khuyến mãi</Label>
                      <p className="text-sm text-gray-600 mt-1">Thông báo về các chương trình khuyến mãi mới</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, promotionAlerts: !notifications.promotionAlerts })}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        notifications.promotionAlerts ? "bg-orange-500" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          notifications.promotionAlerts ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="bg-orange-500 hover:bg-orange-600">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          )}

          {/* Store Info Tab */}
          {activeTab === 'store' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cửa hàng</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="storeName">Tên cửa hàng</Label>
                    <Input
                      id="storeName"
                      value={storeInfo.storeName}
                      onChange={(e) => setStoreInfo({ ...storeInfo, storeName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={storeInfo.address}
                      onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        value={storeInfo.phone}
                        onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={storeInfo.email}
                        onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="taxCode">Mã số thuế</Label>
                    <Input
                      id="taxCode"
                      value={storeInfo.taxCode}
                      onChange={(e) => setStoreInfo({ ...storeInfo, taxCode: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveStoreInfo} className="bg-orange-500 hover:bg-orange-600">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

