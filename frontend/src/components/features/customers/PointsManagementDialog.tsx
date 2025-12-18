import { useState, useEffect } from 'react';
import { Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, TrendingUp, TrendingDown, History } from 'lucide-react';
import { cn, formatPoints } from '@/lib/utils';

interface PointsTransaction {
  id: number;
  date: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  orderId?: number;
}

interface PointsManagementDialogProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onUpdatePoints: (customerId: number, newPoints: number, reason: string) => void;
}

// Mock transaction history
const mockTransactions: PointsTransaction[] = [
  {
    id: 1,
    date: '2024-01-15',
    type: 'earn',
    amount: 50,
    description: 'Tích lũy từ đơn hàng #HD001',
    orderId: 1,
  },
  {
    id: 2,
    date: '2024-01-10',
    type: 'spend',
    amount: 100,
    description: 'Sử dụng điểm giảm giá',
    orderId: 2,
  },
  {
    id: 3,
    date: '2024-01-05',
    type: 'earn',
    amount: 30,
    description: 'Tích lũy từ đơn hàng #HD002',
    orderId: 2,
  },
];

export default function PointsManagementDialog({
  open,
  customer,
  onClose,
  onUpdatePoints,
}: PointsManagementDialogProps) {
  const [pointsInput, setPointsInput] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'add' | 'subtract'>('add');
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);

  useEffect(() => {
    if (customer) {
      setPointsInput('');
      setReason('');
      setAction('add');
      // Load transaction history (mock)
      setTransactions(mockTransactions.filter(t => t.id <= customer.id * 3));
    }
  }, [customer]);

  const handleSubmit = () => {
    if (!customer || !pointsInput || !reason) return;

    const points = parseInt(pointsInput);
    if (isNaN(points) || points <= 0) return;

    // User nhập điểm (ví dụ: 10 điểm)
    // Backend đã tính và lưu: 1000 VND = 1 điểm
    // Không cần nhân 1000, gửi trực tiếp giá trị user nhập
    const currentPoints = customer.diemTichLuy || 0;
    const newPoints = action === 'add' 
      ? currentPoints + points 
      : Math.max(0, currentPoints - points);

    onUpdatePoints(customer.id, newPoints, reason);
    onClose();
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Quản lý điểm tích lũy
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Khách hàng</p>
                <p className="font-semibold text-gray-900">{customer.tenKhachHang}</p>
                <p className="text-xs text-gray-500 mt-1">{customer.maKhachHang}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Điểm hiện tại</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPoints(customer.diemTichLuy)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Points Adjustment Form */}
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Thao tác</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAction('add')}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-lg border-2 transition-colors',
                    action === 'add'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  )}
                >
                  <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Thêm điểm</span>
                </button>
                <button
                  onClick={() => setAction('subtract')}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-lg border-2 transition-colors',
                    action === 'subtract'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  )}
                >
                  <TrendingDown className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Trừ điểm</span>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="points" className="mb-2 block">
                Số điểm {action === 'add' ? 'thêm' : 'trừ'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
                placeholder="Nhập số điểm"
                required
              />
            </div>

            <div>
              <Label htmlFor="reason" className="mb-2 block">
                Lý do <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Bù điểm cho khách hàng, Khuyến mãi đặc biệt..."
                required
              />
            </div>

            {pointsInput && !isNaN(parseInt(pointsInput)) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Điểm sau khi {action === 'add' ? 'thêm' : 'trừ'}:{' '}
                  <span className="font-bold">
                    {formatPoints(
                      action === 'add'
                        ? (customer.diemTichLuy || 0) + parseInt(pointsInput)
                        : Math.max(0, (customer.diemTichLuy || 0) - parseInt(pointsInput))
                    )}
                  </span>
                  <span className="text-xs text-gray-600 ml-2">(1000 VND = 1 điểm)</span>
                </p>
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Lịch sử giao dịch</h3>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Chưa có giao dịch nào</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {transaction.type === 'earn' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                    <div
                      className={cn(
                        'text-sm font-semibold',
                        transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {transaction.type === 'earn' ? '+' : '-'}
                      {transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!pointsInput || !reason || isNaN(parseInt(pointsInput)) || parseInt(pointsInput) <= 0}
            >
              {action === 'add' ? 'Thêm điểm' : 'Trừ điểm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

