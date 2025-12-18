import { useState } from 'react';
import { Customer } from '@/lib/types';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AddCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'maKhachHang'>) => void;
}

export default function AddCustomerDialog({ open, onClose, onSave }: AddCustomerDialogProps) {
  const [formData, setFormData] = useState({
    tenKhachHang: '',
    soDienThoai: '',
    email: '',
    diaChi: '',
    diemTichLuy: 0,
    trangThai: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  if (!open) return null;

  const handleSave = () => {
    if (!formData.tenKhachHang || !formData.soDienThoai) {
      return;
    }
    
    // Validate phone number format: must be 10 digits starting with 0
    if (formData.soDienThoai.length !== 10 || !formData.soDienThoai.startsWith('0')) {
      return;
    }

    onSave(formData);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormData({
      tenKhachHang: '',
      soDienThoai: '',
      email: '',
      diaChi: '',
      diemTichLuy: 0,
      trangThai: 'ACTIVE',
    });
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Thêm khách hàng mới</h2>
            <p className="text-sm text-gray-600 mt-1">Tạo khách hàng mới vào hệ thống</p>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
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
                  type="tel"
                  placeholder="0901234567"
                  value={formData.soDienThoai}
                  onChange={(e) => {
                    // Only allow digits, max 10 digits
                    let value = e.target.value.replace(/\D/g, '');
                    // Limit to 10 digits
                    if (value.length > 10) {
                      value = value.substring(0, 10);
                    }
                    // Ensure it starts with 0
                    if (value && !value.startsWith('0')) {
                      value = '0' + value;
                    }
                    setFormData({ ...formData, soDienThoai: value });
                  }}
                  maxLength={10}
                  className="w-full"
                />
                {formData.soDienThoai && formData.soDienThoai.length !== 10 && (
                  <p className="text-xs text-red-500 mt-1">Số điện thoại phải có 10 chữ số (ví dụ: 0901234567)</p>
                )}
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="border-gray-300"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={!formData.tenKhachHang || !formData.soDienThoai || formData.soDienThoai.length !== 10}
          >
            <Save className="w-4 h-4 mr-2" />
            Tạo khách hàng
          </Button>
        </div>
      </div>
    </div>
  );
}

