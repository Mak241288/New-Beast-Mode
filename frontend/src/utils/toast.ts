export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

const listeners = new Set<ToastListener>();
let toastQueue: ToastItem[] = [];
const timers = new Map<string, ReturnType<typeof setTimeout>>();

const emit = () => {
  const snapshot = [...toastQueue];
  listeners.forEach((fn) => fn(snapshot));
};

export const detectToastType = (message: string): ToastType => {
  const lower = message.toLowerCase();
  if (
    message.includes('❌') ||
    message.includes('فشل') ||
    message.includes('خطأ') ||
    message.includes('غير صالح') ||
    lower.includes('failed') ||
    lower.includes('error') ||
    lower.includes('invalid') ||
    lower.includes('unable to')
  ) {
    return 'error';
  }
  if (
    message.includes('⚠️') ||
    message.includes('يرجى') ||
    message.includes('لا توجد') ||
    message.includes('لا يوجد') ||
    lower.includes('please ') ||
    lower.includes('warning') ||
    lower.includes('no exercises')
  ) {
    return 'warning';
  }
  if (
    message.includes('✅') ||
    message.includes('🎉') ||
    message.includes('🏆') ||
    message.includes('⚖️') ||
    message.includes('بنجاح') ||
    message.includes('تم ') ||
    lower.includes('success') ||
    lower.includes('saved') ||
    lower.includes('added') ||
    lower.includes('synced')
  ) {
    return 'success';
  }
  return 'info';
};

export const dismissToast = (id: string): void => {
  const existingTimer = timers.get(id);
  if (existingTimer) {
    clearTimeout(existingTimer);
    timers.delete(id);
  }
  const prevLen = toastQueue.length;
  toastQueue = toastQueue.filter((t) => t.id !== id);
  if (toastQueue.length !== prevLen) {
    emit();
  }
};

export const clearAllToasts = (): void => {
  timers.forEach((timer) => clearTimeout(timer));
  timers.clear();
  toastQueue = [];
  emit();
};

export const pushToast = (
  message: string,
  type?: ToastType,
  duration = 4200
): string => {
  const cleanMessage = String(message || '').trim();
  if (!cleanMessage) return '';

  const resolvedType = type ?? detectToastType(cleanMessage);
  const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Keep max 4 visible toasts so UI stays uncluttered
  if (toastQueue.length >= 4) {
    const oldest = toastQueue[0];
    if (oldest) dismissToast(oldest.id);
  }

  toastQueue = [...toastQueue, { id, message: cleanMessage, type: resolvedType, duration }];
  emit();

  if (duration > 0) {
    const timer = setTimeout(() => dismissToast(id), duration);
    timers.set(id, timer);
  }
  return id;
};

export const subscribeToasts = (listener: ToastListener): (() => void) => {
  listeners.add(listener);
  listener([...toastQueue]);
  return () => {
    listeners.delete(listener);
  };
};

export const toast = {
  show: (message: string, type?: ToastType, duration?: number) => pushToast(message, type, duration),
  success: (message: string, duration?: number) => pushToast(message, 'success', duration),
  error: (message: string, duration?: number) => pushToast(message, 'error', duration),
  warning: (message: string, duration?: number) => pushToast(message, 'warning', duration),
  info: (message: string, duration?: number) => pushToast(message, 'info', duration),
  dismiss: dismissToast,
  clearAll: clearAllToasts,
};
