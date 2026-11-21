import { describe, it, expect } from 'vitest';
import {
  confirmAction,
  resolveConfirmDialog,
  subscribeConfirmDialog,
  type ConfirmRequest,
} from '../utils/confirmDialog';

describe('Glassmorphism Confirm Dialog Controller', () => {
  it('resolves true on accept and false on cancel, with auto Arabic/English labels', async () => {
    let active: ConfirmRequest | null = null;
    const unsub = subscribeConfirmDialog((req) => {
      active = req;
    });

    const p1 = confirmAction('هل تريد حذف هذا الجدول؟');
    expect(active).not.toBeNull();
    expect(active!.danger).toBe(true);
    expect(active!.confirmLabel).toBe('تأكيد');
    expect(active!.cancelLabel).toBe('إلغاء');
    resolveConfirmDialog(true);
    expect(await p1).toBe(true);
    expect(active).toBeNull();

    const p2 = confirmAction('Switch active workout plan?');
    expect(active).not.toBeNull();
    expect(active!.danger).toBe(false);
    expect(active!.confirmLabel).toBe('Confirm');
    resolveConfirmDialog(false);
    expect(await p2).toBe(false);
    expect(active).toBeNull();

    unsub();
  });
});
