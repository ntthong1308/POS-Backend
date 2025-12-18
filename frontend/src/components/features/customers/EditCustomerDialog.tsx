import { useState, useEffect } from 'react';
import { Customer } from '@/lib/types';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatPoints } from '@/lib/utils';

interface EditCustomerDialogProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

export default function EditCustomerDialog({ open, customer, onClose, onSave }: EditCustomerDialogProps) {
  const [formData, setFormData] = useState({
    tenKhachHang: '',
    soDienThoai: '',
    email: '',
    diaChi: '',
    diemTichLuy: 0,
    trangThai: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        tenKhachHang: customer.tenKhachHang,
        soDienThoai: customer.soDienThoai,
        email: customer.email || '',
        diaChi: customer.diaChi || '',
        diemTichLuy: customer.diemTichLuy || 0, // Backend đã tính sẵn: thanhTien / 1000
        trangThai: customer.trangThai,
      });
    }
  }, [customer]);

  if (!open || !customer) return null;

  const handleSave = () => {
    if (!formData.tenKhachHang || !formData.soDienThoai) {
      return;
    }

    // User nhập điểm (ví dụ: 10 điểm)
    // Backend đã tính và lưu: 1000 VND = 1 điểm
    // Gửi trực tiếp giá trị user nhập, không cần nhân 1000
    const updatedCustomer: Customer = {
      ...customer,
      ...formData,
      diemTichLuy: formData.diemTichLuy, // Gửi trực tiếp, backend đã tính sẵn
    };

    onSave(updatedCustomer);
    onClose();
  };

  const getCustomerRank = (points: number): { label: string; color: string; bgColor: string } => {
    // points từ backend đã được tính: thanhTien / 1000
    if (points >= 500) {
      return { label: 'Gold', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    } else if (points >= 200) {
      return { label: 'Silver', color: 'text-gray-700', bgColor: 'bg-gray-100' };
    } else {
      return { label: 'Bronze', color: 'text-orange-700', bgColor: 'bg-orange-100' };
    }
  };

  const rank = getCustomerRank(formData.diemTichLuy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa khách hàng</h2>
            <p className="text-sm text-gray-600 mt-1">Mã khách hàng: {customer.maKhachHang}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khách hàng <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Nhập tên khách hàng"
                  value={formData.tenKhachHang}
                  onChange={(e) => setFormData({ ...formData, tenKhachHang: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="0901234567"
                  value={formData.soDienThoai}
                  onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  placeholder="Nhập địa chỉ"
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm tích lũy <span className="text-xs text-gray-500 font-normal">(1000 VND = 1 điểm)</span>
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.diemTichLuy}
                  onChange={(e) => setFormData({ ...formData, diemTichLuy: Number(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nhập điểm đã format (ví dụ: 69 điểm thay vì 69000 điểm)
                </p>
                <div className="mt-2">
                  <span className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                    rank.bgColor,
                    rank.color
                  )}>
                    Hạng: {rank.label}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.trangThai}
                  onChange={(e) => setFormData({ ...formData, trangThai: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                </select>
              </div>

              {/* Preview Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Xem trước</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 w-20">Tên:</span>
                    <span className="font-medium text-gray-900">{formData.tenKhachHang || 'Chưa có'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 w-20">SĐT:</span>
                    <span className="text-gray-900">{formData.soDienThoai || 'Chưa có'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 w-20">Email:</span>
                    <span className="text-gray-900">{formData.email || 'Chưa có'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 w-20">Hạng:</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      rank.bgColor,
                      rank.color
                    )}>
                      {rank.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={!formData.tenKhachHang || !formData.soDienThoai}
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}

