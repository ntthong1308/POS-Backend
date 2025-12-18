import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employee } from '@/lib/api/employees';
import { toast } from 'sonner';
import { employeesAPI } from '@/lib/api/employees';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void; // Callback để reload danh sách
}

export default function AddEmployeeDialog({
  open,
  onOpenChange,
  onAdd,
}: AddEmployeeDialogProps) {
  const [formData, setFormData] = useState({
    maNhanVien: '',
    tenNhanVien: '',
    username: '',
    password: '',
    email: '',
    soDienThoai: '',
    role: 'CASHIER' as 'ADMIN' | 'MANAGER' | 'CASHIER',
    chiNhanhId: undefined as number | undefined,
    trangThai: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    ngayBatDau: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.maNhanVien || !formData.tenNhanVien || !formData.username || !formData.password) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.username.length < 4 || formData.username.length > 50) {
      toast.error('Username phải có từ 4-50 ký tự');
      return;
    }

    setLoading(true);
    try {
      // Map formData to API request format
      const requestData: Partial<Employee> = {
        maNhanVien: formData.maNhanVien,
        tenNhanVien: formData.tenNhanVien, // ⚠️ KHÔNG phải "name"
        username: formData.username,
        password: formData.password,
        email: formData.email || undefined,
        soDienThoai: formData.soDienThoai || undefined,
        role: formData.role,
        chiNhanhId: formData.chiNhanhId,
        trangThai: formData.trangThai,
        ngayBatDau: formData.ngayBatDau || undefined,
      };

      await employeesAPI.create(requestData);
      toast.success('Đã thêm nhân viên thành công');
      
      // Reset form
      setFormData({
        maNhanVien: '',
        tenNhanVien: '',
        username: '',
        password: '',
        email: '',
        soDienThoai: '',
        role: 'CASHIER',
        chiNhanhId: undefined,
        trangThai: 'ACTIVE',
        ngayBatDau: '',
      });
      
      onOpenChange(false);
      onAdd(); // Reload danh sách
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm nhân viên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Thêm nhân viên mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maNhanVien" className="mb-2 block">
                Mã nhân viên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maNhanVien"
                value={formData.maNhanVien}
                onChange={(e) => setFormData({ ...formData, maNhanVien: e.target.value })}
                placeholder="NV001"
                required
                maxLength={20}
              />
            </div>

            <div>
              <Label htmlFor="tenNhanVien" className="mb-2 block">
                Tên nhân viên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tenNhanVien"
                value={formData.tenNhanVien}
                onChange={(e) => setFormData({ ...formData, tenNhanVien: e.target.value })}
                placeholder="Nguyễn Văn A"
                required
                maxLength={200}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username" className="mb-2 block">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="nva"
                required
                minLength={4}
                maxLength={50}
              />
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block">
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="password123"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nva@example.com"
              />
            </div>

            <div>
              <Label htmlFor="soDienThoai" className="mb-2 block">
                Số điện thoại
              </Label>
              <Input
                id="soDienThoai"
                value={formData.soDienThoai}
                onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                placeholder="0912345678"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role" className="mb-2 block">
                Vai trò <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'ADMIN' | 'MANAGER' | 'CASHIER') =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  <SelectItem value="MANAGER">Quản lý</SelectItem>
                  <SelectItem value="CASHIER">Thu ngân</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trangThai" className="mb-2 block">
                Trạng thái <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.trangThai}
                onValueChange={(value: 'ACTIVE' | 'INACTIVE') =>
                  setFormData({ ...formData, trangThai: value })
                }
              >
                <SelectTrigger id="trangThai">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="ngayBatDau" className="mb-2 block">
              Ngày bắt đầu làm việc
            </Label>
            <Input
              id="ngayBatDau"
              type="date"
              value={formData.ngayBatDau}
              onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={loading}
            >
              {loading ? 'Đang thêm...' : 'Thêm nhân viên'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
