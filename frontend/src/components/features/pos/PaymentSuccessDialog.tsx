import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  invoiceCode?: string;
  totalAmount?: number;
  paymentMethod?: string;
  onPrint?: () => void;
  onViewInvoice?: () => void;
}

export default function PaymentSuccessDialog({
  open,
  onClose,
  invoiceCode,
  totalAmount,
  paymentMethod,
  onPrint,
  onViewInvoice,
}: PaymentSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
              Đã thanh toán thành công
            </DialogTitle>
            <DialogDescription className="sr-only">
              Thông báo thanh toán thành công
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 pb-4">
          {/* Optional: Show invoice details if provided */}
          {(invoiceCode || totalAmount || paymentMethod) && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {invoiceCode && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mã hóa đơn:</span>
                  <span className="text-sm font-semibold text-gray-900">{invoiceCode}</span>
                </div>
              )}
              {paymentMethod && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Phương thức:</span>
                  <span className="text-sm font-medium text-gray-900">{paymentMethod}</span>
                </div>
              )}
              {totalAmount && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-base font-semibold text-gray-900">Tổng thanh toán:</span>
                  <span className="text-lg font-bold text-orange-600">
                    {totalAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {onPrint && (
              <Button
                variant="outline"
                className="flex-1 border-gray-300"
                onClick={onPrint}
              >
                In hóa đơn
              </Button>
            )}
            {onViewInvoice && (
              <Button
                variant="outline"
                className="flex-1 border-gray-300"
                onClick={onViewInvoice}
              >
                Xem hóa đơn
              </Button>
            )}
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

