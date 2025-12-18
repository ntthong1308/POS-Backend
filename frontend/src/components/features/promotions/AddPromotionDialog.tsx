import { useState } from 'react';
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
import { Promotion } from '@/store/cartStore';

interface AddPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (promotion: Omit<Promotion, 'id' | 'soLanDaSuDung' | 'usedCount'>) => void;
}

export default function AddPromotionDialog({
  open,
  onOpenChange,
  onAdd,
}: AddPromotionDialogProps) {
  const [formData, setFormData] = useState({
    maKhuyenMai: '',
    tenKhuyenMai: '',
    moTa: '',
    loaiKhuyenMai: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'BUNDLE' | 'FREE_SHIPPING' | 'BUY_X_GET_Y',
    giaTriKhuyenMai: 0,
    giaTriToiThieu: 0,
    giamToiDa: 0,
    ngayBatDau: new Date().toISOString().split('T')[0],
    ngayKetThuc: '',
    chiNhanhId: 1,
    tenChiNhanh: 'Chi nhánh Trung tâm',
    trangThai: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    soLanSuDungToiDa: undefined as number | undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.maKhuyenMai || !formData.tenKhuyenMai || !formData.giaTriKhuyenMai || !formData.ngayKetThuc) {
      return;
    }
    
    // Format dates to ISO 8601 DateTime format
    const startDateTime = `${formData.ngayBatDau}T00:00:00`;
    const endDateTime = `${formData.ngayKetThuc}T23:59:59`;
    
    const promotionData: Omit<Promotion, 'id' | 'soLanDaSuDung' | 'usedCount'> = {
      maKhuyenMai: formData.maKhuyenMai,
      tenKhuyenMai: formData.tenKhuyenMai,
      moTa: formData.moTa || undefined,
      loaiKhuyenMai: formData.loaiKhuyenMai,
      giaTriKhuyenMai: formData.giaTriKhuyenMai,
      giaTriToiThieu: formData.giaTriToiThieu || undefined,
      giamToiDa: formData.giamToiDa || undefined,
      ngayBatDau: startDateTime,
      ngayKetThuc: endDateTime,
      chiNhanhId: formData.chiNhanhId || undefined,
      tenChiNhanh: formData.tenChiNhanh || undefined,
      trangThai: formData.trangThai,
      soLanSuDungToiDa: formData.soLanSuDungToiDa || undefined,
    };
    
    onAdd(promotionData);
    // Reset form
    setFormData({
      maKhuyenMai: '',
      tenKhuyenMai: '',
      moTa: '',
      loaiKhuyenMai: 'PERCENTAGE',
      giaTriKhuyenMai: 0,
      giaTriToiThieu: 0,
      giamToiDa: 0,
      ngayBatDau: new Date().toISOString().split('T')[0],
      ngayKetThuc: '',
      chiNhanhId: 1,
      tenChiNhanh: 'Chi nhánh Trung tâm',
      trangThai: 'ACTIVE',
      soLanSuDungToiDa: undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Thêm khuyến mãi mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maKhuyenMai" className="mb-2 block">
                Mã khuyến mãi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maKhuyenMai"
                value={formData.maKhuyenMai}
                onChange={(e) => setFormData({ ...formData, maKhuyenMai: e.target.value.toUpperCase() })}
                placeholder="KM001"
                required
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="loaiKhuyenMai" className="mb-2 block">
                Loại giảm giá <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.loaiKhuyenMai}
                onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'BUNDLE' | 'FREE_SHIPPING' | 'BUY_X_GET_Y') =>
                  setFormData({ ...formData, loaiKhuyenMai: value })
                }
              >
                <SelectTrigger id="loaiKhuyenMai">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Số tiền cố định (₫)</SelectItem>
                  <SelectItem value="BOGO">Mua 1 tặng 1</SelectItem>
                  <SelectItem value="BUY_X_GET_Y">Mua X tặng Y</SelectItem>
                  <SelectItem value="BUNDLE">Combo sản phẩm</SelectItem>
                  <SelectItem value="FREE_SHIPPING">Miễn phí vận chuyển</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tenKhuyenMai" className="mb-2 block">
              Tên khuyến mãi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tenKhuyenMai"
              value={formData.tenKhuyenMai}
              onChange={(e) => setFormData({ ...formData, tenKhuyenMai: e.target.value })}
              placeholder="Giảm 20% cho đơn hàng trên 200k"
              required
            />
          </div>

          <div>
            <Label htmlFor="moTa" className="mb-2 block">
              Mô tả
            </Label>
            <Input
              id="moTa"
              value={formData.moTa}
              onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              placeholder="Áp dụng cho tất cả sản phẩm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="giaTriKhuyenMai" className="mb-2 block">
                Giá trị giảm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="giaTriKhuyenMai"
                type="number"
                value={formData.giaTriKhuyenMai || ''}
                onChange={(e) => setFormData({ ...formData, giaTriKhuyenMai: Number(e.target.value) })}
                placeholder={formData.loaiKhuyenMai === 'PERCENTAGE' ? '20' : '50000'}
                required
                min={0}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.loaiKhuyenMai === 'PERCENTAGE' ? 'Nhập phần trăm (0-100)' : 'Nhập số tiền (₫)'}
              </p>
            </div>

            <div>
              <Label htmlFor="giaTriToiThieu" className="mb-2 block">
                Đơn hàng tối thiểu (₫)
              </Label>
              <Input
                id="giaTriToiThieu"
                type="number"
                value={formData.giaTriToiThieu || ''}
                onChange={(e) => setFormData({ ...formData, giaTriToiThieu: Number(e.target.value) })}
                placeholder="200000"
                min={0}
              />
            </div>
          </div>

          {formData.loaiKhuyenMai === 'PERCENTAGE' && (
            <div>
              <Label htmlFor="giamToiDa" className="mb-2 block">
                Giảm tối đa (₫)
              </Label>
              <Input
                id="giamToiDa"
                type="number"
                value={formData.giamToiDa || ''}
                onChange={(e) => setFormData({ ...formData, giamToiDa: Number(e.target.value) })}
                placeholder="50000"
                min={0}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ngayBatDau" className="mb-2 block">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ngayBatDau"
                type="date"
                value={formData.ngayBatDau}
                onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="ngayKetThuc" className="mb-2 block">
                Ngày kết thúc <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ngayKetThuc"
                type="date"
                value={formData.ngayKetThuc}
                onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                required
                min={formData.ngayBatDau}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="soLanSuDungToiDa" className="mb-2 block">
                Giới hạn sử dụng
              </Label>
              <Input
                id="soLanSuDungToiDa"
                type="number"
                value={formData.soLanSuDungToiDa || ''}
                onChange={(e) => setFormData({ ...formData, soLanSuDungToiDa: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Không giới hạn"
                min={1}
              />
              <p className="text-xs text-gray-500 mt-1">Để trống nếu không giới hạn</p>
            </div>

            <div>
              <Label htmlFor="trangThai" className="mb-2 block">
                Trạng thái
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
                  <SelectItem value="ACTIVE">Kích hoạt</SelectItem>
                  <SelectItem value="INACTIVE">Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Thêm khuyến mãi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

