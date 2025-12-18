import { useState, useCallback } from 'react';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: { message: '' },
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState({
      open: false,
      options: { message: '' },
      resolve: null,
    });
  }, [dialogState]);

  const handleCancel = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState({
      open: false,
      options: { message: '' },
      resolve: null,
    });
  }, [dialogState]);

  const Dialog = (
    <ConfirmationDialog
      open={dialogState.open}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={dialogState.options.title || 'Xác nhận'}
      message={dialogState.options.message}
      confirmText={dialogState.options.confirmText}
      cancelText={dialogState.options.cancelText}
      variant={dialogState.options.variant}
    />
  );

  return { confirm, Dialog };
}

