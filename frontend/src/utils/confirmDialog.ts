export interface ConfirmRequest {
  id: string;
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  resolve: (accepted: boolean) => void;
}

type ConfirmListener = (request: ConfirmRequest | null) => void;

const listeners = new Set<ConfirmListener>();
let activeRequest: ConfirmRequest | null = null;

const emit = () => {
  listeners.forEach((fn) => fn(activeRequest));
};

export const subscribeConfirmDialog = (listener: ConfirmListener): (() => void) => {
  listeners.add(listener);
  listener(activeRequest);
  return () => {
    listeners.delete(listener);
  };
};

export const resolveConfirmDialog = (accepted: boolean): void => {
  if (!activeRequest) return;
  const current = activeRequest;
  activeRequest = null;
  emit();
  current.resolve(accepted);
};

export const confirmAction = (
  message: string,
  options?: {
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
  }
): Promise<boolean> => {
  // If another dialog is open, cancel it cleanly first
  if (activeRequest) {
    resolveConfirmDialog(false);
  }

  return new Promise<boolean>((resolve) => {
    const isArabic = /[\u0600-\u06FF]/.test(message);
    const isDanger =
      options?.danger ??
      /حذف|مسح|إنهاء|تصفير|استبدال|delete|remove|reset|clear|replace|discard/i.test(message);

    activeRequest = {
      id: `confirm_${Date.now()}`,
      message,
      title: options?.title ?? (isArabic ? 'تأكيد الإجراء' : 'Confirm Action'),
      confirmLabel: options?.confirmLabel ?? (isArabic ? 'تأكيد' : 'Confirm'),
      cancelLabel: options?.cancelLabel ?? (isArabic ? 'إلغاء' : 'Cancel'),
      danger: isDanger,
      resolve,
    };
    emit();
  });
};
