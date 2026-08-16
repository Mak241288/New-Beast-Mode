import React, { useState } from 'react';
import { X, Star, Plus, Copy, Trash2, Edit3, Check, Calendar, Sparkles, Layers } from 'lucide-react';
import { api } from '../services/api';

interface MultiPlanManagerModalProps {
  isOpen: boolean;
  lang: 'ar' | 'en';
  plans: any[];
  activePlanId: number | null;
  onClose: () => void;
  onPlanActivated: (plan: any) => void;
  onOpenManualBuilderForNew: () => void;
  onOpenManualBuilderForEdit: (plan: any) => void;
  onOpenPresetsModal: () => void;
  onRefreshPlans: () => void;
}

export const MultiPlanManagerModal: React.FC<MultiPlanManagerModalProps> = ({
  isOpen,
  lang,
  plans,
  activePlanId,
  onClose,
  onPlanActivated,
  onOpenManualBuilderForNew,
  onOpenManualBuilderForEdit,
  onOpenPresetsModal,
  onRefreshPlans,
}) => {
  const isEn = lang === 'en';
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleActivate = async (planId: number) => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      const updated = await api.activateHistoricalPlan(planId);
      onPlanActivated(updated);
      onRefreshPlans();
    } catch (err: any) {
      setErrorMsg(err.message || (isEn ? 'Failed to activate plan' : 'فشل تفعيل الجدول'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartRename = (plan: any) => {
    setEditingPlanId(plan.id);
    setEditingTitle(plan.title);
  };

  const handleSaveRename = async (planId: number) => {
    if (!editingTitle.trim()) return;
    setActionLoading(true);
    setErrorMsg('');
    try {
      await api.renamePlan(planId, editingTitle.trim());
      setEditingPlanId(null);
      onRefreshPlans();
    } catch (err: any) {
      setErrorMsg(err.message || (isEn ? 'Failed to rename plan' : 'فشل إعادة تسمية الجدول'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (planId: number) => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      await api.duplicatePlan(planId);
      onRefreshPlans();
    } catch (err: any) {
      setErrorMsg(err.message || (isEn ? 'Failed to duplicate plan' : 'فشل نسخ الجدول'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (plan: any) => {
    if (plans.length <= 1) {
      alert(
        isEn
          ? 'You must keep at least one workout plan in your account.'
          : 'لا يمكن حذف الجدول الوحيد. يجب أن تحتفظ بجدول تدريبي واحد على الأقل.'
      );
      return;
    }

    const confirmMsg = isEn
      ? `Are you sure you want to delete "${plan.title}"?`
      : `هل أنت متأكد من حذف جدول "${plan.title}"؟`;

    if (!confirm(confirmMsg)) return;

    setActionLoading(true);
    setErrorMsg('');
    try {
      await api.deletePlan(plan.id);
      onRefreshPlans();
    } catch (err: any) {
      setErrorMsg(err.message || (isEn ? 'Failed to delete plan' : 'فشل حذف الجدول'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel animated-fade"
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card, #111827)',
          color: 'var(--text-primary)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '22px 28px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
                color: 'var(--secondary)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              <Layers size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>
                {isEn ? 'Multi-Plan Management Hub' : 'إدارة الجداول التدريبية المتعددة'}
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {isEn
                  ? 'Design and maintain multiple custom routines (Gym, Home, Travel) with 1 primary active plan'
                  : 'صمم واحتفظ بعدة برامج تدريبية (جداول النادي، المنزل، السفر، التنشيف) مع تعيين جدول أساسي نشط'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="secondary-btn"
            style={{ padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* QUICK CREATION ACTION BAR */}
        <div
          style={{
            padding: '16px 28px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              {isEn ? `You have ${plans.length} workout routines` : `لديك ${plans.length} برامج تدريبية مسجلة`}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenManualBuilderForNew();
              }}
              className="glow-btn"
              style={{ padding: '8px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>{isEn ? 'Design New Plan ✍️' : 'تصميم جدول يدوي جديد ✍️'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPresetsModal();
              }}
              className="secondary-btn"
              style={{
                padding: '8px 14px',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: '#f59e0b',
                color: '#f59e0b',
              }}
            >
              <Sparkles size={15} />
              <span>{isEn ? 'Browse Pro Presets 👑' : 'إضافة خطة من الأساطير 👑'}</span>
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div style={{ margin: '14px 28px 0 28px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '13px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* PLANS LIST */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {plans.map((plan) => {
            const isActive = plan.id === activePlanId || plan.active === true;
            const isEditingThis = editingPlanId === plan.id;
            const daysCount = plan.dayWorkouts ? plan.dayWorkouts.length : 7;
            const exercisesCount = plan.dayWorkouts
              ? plan.dayWorkouts.reduce((acc: number, d: any) => acc + (d.exercises ? d.exercises.length : 0), 0)
              : 0;

            return (
              <div
                key={plan.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: isActive ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* CARD TOP INFO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {isActive ? (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '900',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Star size={12} fill="var(--primary)" />
                          {isEn ? '⭐ Primary Active Plan' : '⭐ الجدول الأساسي النشط'}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {isEn ? 'Secondary Routine' : 'جدول ثانوي / أرشيف'}
                        </span>
                      )}

                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        <Calendar size={12} style={{ display: 'inline', marginInlineEnd: '4px' }} />
                        {new Date(plan.createdAt).toLocaleDateString(isEn ? 'en-US' : 'ar-EG')}
                      </span>

                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        🏋️ {daysCount} {isEn ? 'Days' : 'أيام'} • {exercisesCount} {isEn ? 'Exercises' : 'تمرين'}
                      </span>
                    </div>

                    {/* Title and In-place Rename */}
                    {isEditingThis ? (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="input-field"
                          style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '8px', maxWidth: '350px' }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(plan.id)}
                          className="glow-btn"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          disabled={actionLoading}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPlanId(null)}
                          className="secondary-btn"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>{plan.title}</h3>
                        <button
                          type="button"
                          onClick={() => handleStartRename(plan)}
                          className="secondary-btn"
                          style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px' }}
                          title={isEn ? 'Rename Plan' : 'إعادة تسمية'}
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => handleActivate(plan.id)}
                        disabled={actionLoading}
                        className="glow-btn"
                        style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Star size={13} fill="currentColor" />
                        <span>{isEn ? 'Set as Primary ⭐' : 'تعيين كأساسي نشط ⭐'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenManualBuilderForEdit(plan);
                      }}
                      className="secondary-btn"
                      style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Edit3 size={13} />
                      <span>{isEn ? 'Edit Plan ✏️' : 'تعديل الجدول ✏️'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(plan.id)}
                      disabled={actionLoading}
                      className="secondary-btn"
                      style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title={isEn ? 'Duplicate Plan' : 'نسخ ومضاعفة'}
                    >
                      <Copy size={13} />
                      <span>{isEn ? 'Duplicate' : 'نسخ'}</span>
                    </button>

                    {plans.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDelete(plan)}
                        disabled={actionLoading}
                        className="secondary-btn"
                        style={{ padding: '8px 12px', fontSize: '12px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                        title={isEn ? 'Delete Plan' : 'حذف الجدول'}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* DAY CHIPS PREVIEW */}
                {plan.dayWorkouts && plan.dayWorkouts.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    {plan.dayWorkouts.map((day: any) => (
                      <div
                        key={day.id || day.dayIndex}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: day.isRestDay ? 'rgba(255,255,255,0.02)' : 'rgba(6, 182, 212, 0.08)',
                          border: day.isRestDay ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(6, 182, 212, 0.2)',
                          fontSize: '11px',
                          color: day.isRestDay ? 'var(--text-secondary)' : 'var(--text-primary)',
                        }}
                      >
                        <span style={{ fontWeight: '700' }}>
                          {isEn ? `Day ${day.dayIndex}` : `اليوم ${day.dayIndex}`}:
                        </span>{' '}
                        {day.isRestDay ? (isEn ? '💤 Rest' : '💤 راحة') : day.focusArea || day.title}
                        {!day.isRestDay && day.exercises && (
                          <span style={{ opacity: 0.75, marginInlineStart: '4px' }}>
                            ({day.exercises.length})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
