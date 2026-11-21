import { describe, it, expect, beforeEach } from 'vitest';
import { toast, detectToastType, subscribeToasts, type ToastItem } from '../utils/toast';

describe('Toast Notification System', () => {
  beforeEach(() => {
    toast.clearAll();
  });

  it('auto-detects Arabic and English error, warning, success, and info messages', () => {
    expect(detectToastType('فشل حفظ البيانات.')).toBe('error');
    expect(detectToastType('Failed to save profile.')).toBe('error');
    expect(detectToastType('يرجى إدخال وزن صحيح')).toBe('warning');
    expect(detectToastType('Please enter a valid weight')).toBe('warning');
    expect(detectToastType('تم تسجيل الوزن بنجاح! ⚖️')).toBe('success');
    expect(detectToastType('Plan synced successfully!')).toBe('success');
    expect(detectToastType('BeastMode AI ready')).toBe('info');
  });

  it('notifies subscribers on push, dismiss, and clearAll', () => {
    let latest: ToastItem[] = [];
    const unsub = subscribeToasts((items) => {
      latest = items;
    });

    const id = toast.success('تم الحفظ بنجاح', 0);
    expect(latest.length).toBe(1);
    expect(latest[0].type).toBe('success');

    toast.dismiss(id);
    expect(latest.length).toBe(0);

    toast.error('خطأ مؤقت', 0);
    toast.info('معلومة', 0);
    expect(latest.length).toBe(2);

    toast.clearAll();
    expect(latest.length).toBe(0);
    unsub();
  });

  it('enforces a max queue size of 4 visible toasts', () => {
    let latest: ToastItem[] = [];
    const unsub = subscribeToasts((items) => {
      latest = items;
    });

    for (let i = 1; i <= 6; i++) {
      toast.info(`Notification ${i}`, 0);
    }

    expect(latest.length).toBe(4);
    expect(latest[0].message).toBe('Notification 3');
    expect(latest[3].message).toBe('Notification 6');
    unsub();
  });

  it('ignores empty or whitespace-only messages', () => {
    const id = toast.show('   ');
    expect(id).toBe('');
  });
});
