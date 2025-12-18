import { useState, useEffect } from 'react';
import { RawMaterial, CreateUpdateRawMaterialRequest } from '@/lib/api/rawMaterials';
import { X, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

interface AddRawMaterialDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<RawMaterial>) => void;
  editingMaterial?: RawMaterial | null;
}

export default function AddRawMaterialDialog({
  open,
  onClose,
  onSave,
  editingMaterial,
}: AddRawMaterialDialogProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    maNguyenLieu: '',
    tenNguyenLieu: '',
    donViTinh: 'Cái',
    soLuong: '',
    trangThai: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const units = [
    { value: 'Cái', label: 'Cái' },
    { value: 'Chai', label: 'Chai' },
    { value: 'Lon', label: 'Lon' },
    { value: 'Gói', label: 'Gói' },
    { value: 'Hộp', label: 'Hộp' },
    { value: 'Ly', label: 'Ly' },
    { value: 'Kg', label: 'Kg' },
    { value: 'Lít', label: 'Lít' },
    { value: 'Gram', label: 'Gram' },
  ];

  const handleSave = () => {
    // Validation
    if (!formData.tenNguyenLieu.trim()) {
      toast.error('Vui lòng nhập tên nguyên liệu');
      return;
    }

    if (formData.soLuong && Number(formData.soLuong) < 0) {
      toast.error('Số lượng không được âm');
      return;
    }

    // Theo tài liệu API: maNguyenLieu (required, unique), tenNguyenLieu (required), donViTinh (optional), soLuong (optional, default=0), chiNhanhId (optional)
    // ✅ QUAN TRỌNG: Backend yêu cầu maNguyenLieu là required (NotBlank), nên phải luôn gửi
    // Format: 2 chữ cái (NL) + 5 số (tối đa) - ví dụ: NL12345
    let maNguyenLieu = formData.maNguyenLieu.trim();
    if (!maNguyenLieu) {
      // Generate mã tự động: NL + 5 số ngẫu nhiên (00001-99999)
      const randomNum = Math.floor(Math.random() * 99999) + 1; // 1-99999
      const paddedNum = String(randomNum).padStart(5, '0'); // Pad với 0 để đủ 5 số
      maNguyenLieu = `NL${paddedNum}`;
      console.log('[AddRawMaterialDialog] Auto-generated maNguyenLieu:', maNguyenLieu);
    } else {
      // Validate format: 2 chữ cái + tối đa 5 số
      const formatRegex = /^[A-Z]{2}\d{1,5}$/;
      if (!formatRegex.test(maNguyenLieu.toUpperCase())) {
        toast.error('Mã nguyên liệu phải có format: 2 chữ cái + tối đa 5 số (VD: NL12345)');
        return;
      }
      maNguyenLieu = maNguyenLieu.toUpperCase();
    }

    const data: CreateUpdateRawMaterialRequest = {
      maNguyenLieu: maNguyenLieu, // ✅ LUÔN gửi maNguyenLieu (required)
      tenNguyenLieu: formData.tenNguyenLieu.trim(),
      donViTinh: formData.donViTinh,
      soLuong: formData.soLuong ? Number(formData.soLuong) : 0,
    };

    // Include chiNhanhId if user has it
    if (user?.chiNhanhId) {
      data.chiNhanhId = user.chiNhanhId;
    }

    onSave(data);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      maNguyenLieu: '',
      tenNguyenLieu: '',
      donViTinh: 'Cái',
      soLuong: '',
      trangThai: 'ACTIVE',
    });
  };

  // Load editing material data
  useEffect(() => {
    if (open && editingMaterial) {
      setFormData({
        maNguyenLieu: editingMaterial.maNguyenLieu || '',
        tenNguyenLieu: editingMaterial.tenNguyenLieu || '',
        donViTinh: editingMaterial.donViTinh || 'Cái',
        soLuong: (editingMaterial.soLuong ?? editingMaterial.tonKho ?? 0).toString(),
        trangThai: editingMaterial.trangThai || 'ACTIVE',
      });
    } else if (open && !editingMaterial) {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingMaterial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingMaterial ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
            </h2>
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
          <div className="space-y-6">
            {/* Mã nguyên liệu */}
            <div>
              <Label htmlFor="maNguyenLieu">
                Mã nguyên liệu
                <span className="text-gray-400 text-xs ml-2">(Để trống để tự động tạo)</span>
              </Label>
              <Input
                id="maNguyenLieu"
                placeholder="VD: NL001"
                value={formData.maNguyenLieu}
                onChange={(e) => setFormData({ ...formData, maNguyenLieu: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Tên nguyên liệu */}
            <div>
              <Label htmlFor="tenNguyenLieu">
                Tên nguyên liệu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tenNguyenLieu"
                placeholder="VD: Cà phê hạt Arabica"
                value={formData.tenNguyenLieu}
                onChange={(e) => setFormData({ ...formData, tenNguyenLieu: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            {/* Đơn vị tính và Tồn kho */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donViTinh">Đơn vị tính</Label>
                <select
                  id="donViTinh"
                  value={formData.donViTinh}
                  onChange={(e) => setFormData({ ...formData, donViTinh: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="soLuong">Số lượng</Label>
                <Input
                  id="soLuong"
                  type="number"
                  placeholder="0"
                  value={formData.soLuong}
                  onChange={(e) => setFormData({ ...formData, soLuong: e.target.value })}
                  className="mt-1"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số lượng tồn kho ban đầu (mặc định: 0)
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
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
            disabled={!formData.tenNguyenLieu.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            {editingMaterial ? 'Cập nhật' : 'Thêm nguyên liệu'}
          </Button>
        </div>
      </div>
    </div>
  );
}

