import { useState, useEffect } from 'react';
import { Gift, X, Check, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Promotion } from '@/store/cartStore';
import { promotionsAPI } from '@/lib/api/promotions';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface PromotionSelectorProps {
  subtotal: number;
  selectedPromotion: Promotion | null;
  onSelectPromotion: (promotion: Promotion | null) => void;
}

export default function PromotionSelector({
  subtotal,
  selectedPromotion,
  onSelectPromotion,
}: PromotionSelectorProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (showDialog) {
      loadPromotions();
    }
  }, [showDialog]);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const branchId = user?.chiNhanhId || 1; // Default to 1 if no branchId
      const data = await promotionsAPI.getActiveForPOS(branchId);
      // Ensure data is an array
      const promotionsArray = Array.isArray(data) ? data : [];
      setPromotions(promotionsArray);
    } catch (error: any) {
      console.error('Error loading promotions:', error);
      toast.error('Không thể tải danh sách khuyến mãi');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (promotion: Promotion, amount: number): number => {
    // Check minimum purchase amount (dùng field chính)
    const minPurchase = promotion.giaTriToiThieu || promotion.minPurchaseAmount;
    if (minPurchase && amount < minPurchase) {
      return 0;
    }

    let discount = 0;
    // Dùng field chính loaiKhuyenMai và giaTriKhuyenMai
    const loaiKM = promotion.loaiKhuyenMai || promotion.type;
    const giaTriKM = promotion.giaTriKhuyenMai || promotion.value;
    
    if (loaiKM === 'PERCENTAGE') {
      discount = (amount * giaTriKM) / 100;
      // Apply max discount if exists
      const maxDiscount = promotion.giamToiDa || promotion.maxDiscountAmount;
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else if (loaiKM === 'FIXED_AMOUNT') {
      discount = giaTriKM;
    }

    return Math.floor(discount);
  };

  const getAvailablePromotions = () => {
    let available = promotions.filter(p => {
      // Check if meets minimum purchase amount (dùng field chính)
      const minPurchase = p.giaTriToiThieu || p.minPurchaseAmount;
      if (minPurchase && subtotal < minPurchase) {
        return false;
      }
      // Check if not expired (dùng field chính)
      const endDate = p.ngayKetThuc || p.endDate || '';
      if (endDate && new Date(endDate) < new Date()) {
        return false;
      }
      // Check usage limit (dùng field chính)
      // Kiểm tra tongSoLanSuDungToiDa (global) hoặc soLanSuDungToiDa (per user)
      const globalLimit = p.tongSoLanSuDungToiDa;
      const perUserLimit = p.soLanSuDungToiDa || p.usageLimit;
      const usedCount = p.soLanDaSuDung || p.usedCount || 0;
      
      if (globalLimit && usedCount >= globalLimit) {
        return false;
      }
      if (perUserLimit && usedCount >= perUserLimit) {
        return false;
      }
      // Check status
      const isActive = p.trangThai === 'ACTIVE' || p.isActive;
      if (!isActive) {
        return false;
      }
      return true;
    });

    // Filter by search code (dùng field chính)
    if (searchCode) {
      const code = searchCode.toUpperCase();
      available = available.filter(p => {
        const maKM = p.maKhuyenMai || p.code || '';
        return maKM.toUpperCase().includes(code);
      });
    }

    return available;
  };

  const handleSelectPromotion = (promotion: Promotion) => {
    const discount = calculateDiscount(promotion, subtotal);
    if (discount > 0) {
      // Promotion đã đúng format từ API, chỉ cần pass trực tiếp
      onSelectPromotion(promotion);
      setShowDialog(false);
      setSearchCode('');
    } else {
      toast.error('Không thể áp dụng khuyến mãi này. Vui lòng kiểm tra điều kiện áp dụng.');
    }
  };

  const handleRemovePromotion = () => {
    onSelectPromotion(null);
  };

  const formatDiscount = (promotion: Promotion) => {
    const loaiKM = promotion.loaiKhuyenMai || promotion.type;
    const giaTriKM = promotion.giaTriKhuyenMai || promotion.value;
    if (loaiKM === 'PERCENTAGE') {
      return `${giaTriKM}%`;
    } else {
      return `${giaTriKM.toLocaleString('vi-VN')}₫`;
    }
  };

  const getRemainingCount = (promotion: Promotion): number | null => {
    // Ưu tiên tongSoLanSuDungToiDa (global limit), sau đó soLanSuDungToiDa (per user limit)
    const globalLimit = promotion.tongSoLanSuDungToiDa;
    const perUserLimit = promotion.soLanSuDungToiDa || promotion.usageLimit;
    const usedCount = promotion.soLanDaSuDung || promotion.usedCount || 0;
    
    if (globalLimit) {
      return Math.max(0, globalLimit - usedCount);
    }
    if (perUserLimit) {
      return Math.max(0, perUserLimit - usedCount);
    }
    return null; // Không giới hạn
  };

  const availablePromotions = getAvailablePromotions();
  const currentDiscount = selectedPromotion 
    ? calculateDiscount(selectedPromotion, subtotal)
    : 0;

  return (
    <>
      {!selectedPromotion ? (
        <button
          onClick={() => setShowDialog(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-white transition-colors flex items-center justify-between bg-white"
        >
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Chọn mã khuyến mãi</span>
          </div>
        </button>
      ) : (
        <div className="p-3 border-2 border-orange-400 rounded-lg bg-orange-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-600" />
              <div>
                <span className="text-sm font-semibold text-orange-700">
                  {selectedPromotion.maKhuyenMai || selectedPromotion.code}
                </span>
                <p className="text-xs text-orange-600">{selectedPromotion.tenKhuyenMai || selectedPromotion.name}</p>
              </div>
            </div>
            <button
              onClick={handleRemovePromotion}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Giảm giá:</span>
            <span className="text-sm font-bold text-orange-600">
              -{currentDiscount.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      )}

      {/* Promotion Selection Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Chọn mã khuyến mãi</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Search */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Tìm kiếm theo mã khuyến mãi..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Available Promotions */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="text-gray-500 mt-4">Đang tải khuyến mãi...</p>
              </div>
            ) : availablePromotions.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-1">Không có khuyến mãi khả dụng</p>
                <p className="text-sm text-gray-400">
                  {promotions.length === 0
                    ? 'Không có khuyến mãi nào'
                    : subtotal < Math.min(...promotions.map(p => (p.giaTriToiThieu || p.minPurchaseAmount || 0)))
                    ? `Đơn hàng tối thiểu: ${Math.min(...promotions.map(p => (p.giaTriToiThieu || p.minPurchaseAmount || 0))).toLocaleString('vi-VN')}₫`
                    : 'Không tìm thấy mã khuyến mãi phù hợp'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availablePromotions.map((promotion) => {
                  const discount = calculateDiscount(promotion, subtotal);
                  const isSelected = selectedPromotion?.id === promotion.id;
                  const remainingCount = getRemainingCount(promotion);
                  const minPurchase = promotion.giaTriToiThieu || promotion.minPurchaseAmount;

                  return (
                    <button
                      key={promotion.id}
                      onClick={() => handleSelectPromotion(promotion)}
                      className={cn(
                        'w-full p-4 border-2 rounded-lg text-left transition-all',
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded text-sm">
                              {promotion.maKhuyenMai || promotion.code}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-orange-600" />
                            )}
                          </div>
                          <p className="font-medium text-gray-900 text-sm mb-1">
                            {promotion.tenKhuyenMai || promotion.name}
                          </p>
                          {(promotion.moTa || promotion.description) && (
                            <p className="text-xs text-gray-500 mb-2">
                              {promotion.moTa || promotion.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            {minPurchase && (
                              <span>
                                Đơn tối thiểu: {minPurchase.toLocaleString('vi-VN')}₫
                              </span>
                            )}
                            {remainingCount !== null && (
                              <span className="text-orange-600 font-medium">
                                Còn lại: {remainingCount} lần
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-orange-600 mb-1">
                            {formatDiscount(promotion)}
                          </div>
                          {discount > 0 && (
                            <div className="text-xs text-gray-500">
                              Giảm: {discount.toLocaleString('vi-VN')}₫
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setSearchCode('');
              }}
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

