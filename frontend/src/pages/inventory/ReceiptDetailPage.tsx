import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Package, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rawMaterialsAPI } from '@/lib/api/rawMaterials';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReceiptDetail {
  id: number;
  maPhieu: string;
  nguyenLieuId: number;
  tenNguyenLieu: string;
  maNguyenLieu: string;
  ngayNhapXuat: string;
  loaiPhieu: 'NHAP' | 'XUAT';
  soLuong: number;
  nhanVienId: number;
  tenNhanVien: string;
  ghiChu?: string;
}

// ✅ Helper function để extract base mã phiếu (bỏ phần suffix cuối cùng như -1, -2)
const getBaseMaPhieu = (maPhieu: string): string => {
  const lastDashIndex = maPhieu.lastIndexOf('-');
  if (lastDashIndex === -1) return maPhieu;
  
  const suffix = maPhieu.substring(lastDashIndex + 1);
  
  // Nếu suffix là số (ví dụ: -1, -2, -10), thì bỏ nó đi
  if (/^\d+$/.test(suffix)) {
    return maPhieu.substring(0, lastDashIndex);
  }
  
  return maPhieu;
};

export default function ReceiptDetailPage() {
  const { type, id } = useParams<{ type: 'import' | 'export'; id: string }>();
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<ReceiptDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceiptDetail();
  }, [type, id]);

  const loadReceiptDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      let allReceipts: ReceiptDetail[] = [];
      let firstReceipt: ReceiptDetail | null = null;

      if (type === 'import') {
        allReceipts = await rawMaterialsAPI.getImportHistory({ page: 0, size: 1000 });
        firstReceipt = allReceipts.find((r: any) => r.id === Number(id)) || null;
      } else {
        allReceipts = await rawMaterialsAPI.getExportHistory({ page: 0, size: 1000 });
        firstReceipt = allReceipts.find((r: any) => r.id === Number(id)) || null;
      }

      if (firstReceipt) {
        // ✅ Tìm tất cả receipts có cùng base mã phiếu
        const baseMaPhieu = getBaseMaPhieu(firstReceipt.maPhieu);
        const groupedReceipts = allReceipts.filter((r: ReceiptDetail) => 
          getBaseMaPhieu(r.maPhieu) === baseMaPhieu
        );
        
        setReceipts(groupedReceipts);
      } else {
        toast.error('Không tìm thấy phiếu nhập/xuất kho');
        navigate('/inventory');
      }
    } catch (error: any) {
      console.error('Error loading receipt detail:', error);
      toast.error('Không thể tải chi tiết phiếu nhập/xuất kho');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Tính toán thông tin chung từ receipts đầu tiên
  const receiptInfo = useMemo(() => {
    if (receipts.length === 0) return null;
    
    const firstReceipt = receipts[0];
    const baseMaPhieu = getBaseMaPhieu(firstReceipt.maPhieu);
    const totalQuantity = receipts.reduce((sum, r) => sum + r.soLuong, 0);
    
    return {
      baseMaPhieu,
      ngayNhapXuat: firstReceipt.ngayNhapXuat,
      nhanVienId: firstReceipt.nhanVienId,
      tenNhanVien: firstReceipt.tenNhanVien,
      loaiPhieu: firstReceipt.loaiPhieu,
      ghiChu: firstReceipt.ghiChu,
      totalQuantity,
      items: receipts,
    };
  }, [receipts]);

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!receiptInfo) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/inventory')}
            className="border-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết phiếu {type === 'import' ? 'nhập' : 'xuất'} kho
            </h1>
            <p className="text-sm text-gray-500 mt-1">Mã phiếu: {receiptInfo.baseMaPhieu}</p>
          </div>
        </div>
      </div>

      {/* Receipt Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Thông tin chung */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã phiếu</p>
                <p className="text-lg font-semibold text-gray-900">{receiptInfo.baseMaPhieu}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày giờ {type === 'import' ? 'nhập' : 'xuất'}</p>
                <p className="text-lg font-semibold text-gray-900">{formatDateTime(receiptInfo.ngayNhapXuat)}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng số lượng</p>
                <p className={cn(
                  "text-lg font-semibold",
                  receiptInfo.loaiPhieu === 'NHAP' ? "text-green-600" : "text-red-600"
                )}>
                  {receiptInfo.loaiPhieu === 'NHAP' ? '+' : '-'}{receiptInfo.totalQuantity.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Nhân viên thực hiện</p>
                <p className="text-lg font-semibold text-gray-900">{receiptInfo.tenNhanVien}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Loại phiếu</p>
                <span className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1",
                  receiptInfo.loaiPhieu === 'NHAP'
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}>
                  {receiptInfo.loaiPhieu === 'NHAP' ? 'Nhập kho' : 'Xuất kho'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ghi chú */}
        {receiptInfo.ghiChu && (
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Ghi chú</p>
            <p className="text-gray-900">{receiptInfo.ghiChu}</p>
          </div>
        )}

        {/* Danh sách nguyên liệu */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Danh sách nguyên liệu ({receiptInfo.items.length} {receiptInfo.items.length === 1 ? 'nguyên liệu' : 'nguyên liệu'})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">STT</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nguyên liệu</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mã NL</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Số lượng</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {receiptInfo.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.tenNguyenLieu}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.maNguyenLieu}</td>
                    <td className={cn(
                      "py-3 px-4 text-sm font-semibold text-right",
                      receiptInfo.loaiPhieu === 'NHAP' ? "text-green-600" : "text-red-600"
                    )}>
                      {receiptInfo.loaiPhieu === 'NHAP' ? '+' : '-'}{item.soLuong.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.ghiChu || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

