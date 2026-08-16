import React, { useState, useEffect } from 'react';
import { X, Camera, Plus, Trash2, ArrowLeftRight } from 'lucide-react';

export interface TransformationPhoto {
  id: string;
  date: string;
  weightKg?: number;
  label_en: string;
  label_ar: string;
  angle: 'FRONT' | 'SIDE' | 'BACK';
  imageDataBase64: string;
}

interface TransformationGalleryModalProps {
  isOpen: boolean;
  lang: 'ar' | 'en';
  currentWeight?: number;
  onClose: () => void;
}

export const TransformationGalleryModal: React.FC<TransformationGalleryModalProps> = ({
  isOpen,
  lang,
  currentWeight = 75,
  onClose,
}) => {
  const isEn = lang === 'en';
  const [photos, setPhotos] = useState<TransformationPhoto[]>(() => {
    const raw = localStorage.getItem('transformation_photos');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newWeight, setNewWeight] = useState<number>(currentWeight);
  const [newAngle, setNewAngle] = useState<'FRONT' | 'SIDE' | 'BACK'>('FRONT');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [compareBeforeId, setCompareBeforeId] = useState<string | null>(null);
  const [compareAfterId, setCompareAfterId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('transformation_photos', JSON.stringify(photos));
  }, [photos]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setSelectedImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImageBase64) {
      alert(isEn ? 'Please select a photo first.' : 'يرجى اختيار صورة أولاً.');
      return;
    }

    const newPhoto: TransformationPhoto = {
      id: `photo_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: newWeight || currentWeight,
      label_en: newLabel || (newAngle === 'FRONT' ? 'Front Physique' : newAngle === 'SIDE' ? 'Side Profile' : 'Back Physique'),
      label_ar: newLabel || (newAngle === 'FRONT' ? 'صورة أمامية' : newAngle === 'SIDE' ? 'صورة جانبية' : 'صورة خلفية'),
      angle: newAngle,
      imageDataBase64: selectedImageBase64,
    };

    setPhotos([newPhoto, ...photos]);
    setShowAddForm(false);
    setSelectedImageBase64(null);
    setNewLabel('');
  };

  const handleDeletePhoto = (id: string) => {
    if (!confirm(isEn ? 'Delete this transformation photo?' : 'هل تود حذف هذه الصورة؟')) return;
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const beforePhoto = photos.find((p) => p.id === compareBeforeId) || photos[photos.length - 1];
  const afterPhoto = photos.find((p) => p.id === compareAfterId) || photos[0];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
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
          maxWidth: '940px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card, #111827)',
          color: 'var(--text-primary)',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '20px 26px',
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
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))',
                color: '#ec4899',
                border: '1px solid rgba(236, 72, 153, 0.3)',
              }}
            >
              <Camera size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>
                {isEn ? 'Physique Transformation Gallery 📷' : 'معرض صور التحول البدني 📷'}
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {isEn
                  ? 'Private, secure timeline of your physique progression and before/after comparisons'
                  : 'معرضك الخاص والمشفر لتوثيق التطور العضلي ومقارنة صور البداية والنتائج'}
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

        {/* TOP ACTION BAR */}
        <div
          style={{
            padding: '12px 26px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setCompareMode(false);
              }}
              className="glow-btn"
              style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>{isEn ? 'Add Progress Photo 📷' : 'إضافة صورة جديدة 📷'}</span>
            </button>

            {photos.length >= 2 && (
              <button
                type="button"
                onClick={() => {
                  setCompareMode(!compareMode);
                  setShowAddForm(false);
                }}
                className={compareMode ? 'glow-btn' : 'secondary-btn'}
                style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#ec4899', color: compareMode ? '#fff' : '#ec4899' }}
              >
                <ArrowLeftRight size={15} />
                <span>{isEn ? 'Before & After Comparison ⚡' : 'مقارنة قبل وبعد (Before & After) ⚡'}</span>
              </button>
            )}
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            🖼️ {photos.length} {isEn ? 'Saved Photos' : 'صور محفوظة'}
          </span>
        </div>

        {/* BODY */}
        <div style={{ padding: '24px 26px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* ADD PHOTO FORM */}
          {showAddForm && (
            <form
              onSubmit={handleSavePhoto}
              className="glass-panel animated-fade"
              style={{
                padding: '24px',
                borderRadius: '18px',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(0,0,0,0.3))',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                {isEn ? 'Upload New Progress Photo' : 'رفع صورة تطور بدني جديدة'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    {isEn ? 'Select Image File:' : 'اختر ملف الصورة:'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="input-field"
                    style={{ fontSize: '12.5px', padding: '8px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    {isEn ? 'Weight at Photo (kg):' : 'الوزن عند التقاط الصورة (كغ):'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(parseFloat(e.target.value) || currentWeight)}
                    className="input-field"
                    style={{ fontSize: '14px', padding: '8px 12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    {isEn ? 'Pose Angle:' : 'زاوية التصوير:'}
                  </label>
                  <select
                    value={newAngle}
                    onChange={(e) => setNewAngle(e.target.value as any)}
                    className="input-field"
                    style={{ fontSize: '13px', padding: '8px 12px' }}
                  >
                    <option value="FRONT">{isEn ? 'Front Pose (أمامية)' : 'صورة أمامية'}</option>
                    <option value="SIDE">{isEn ? 'Side Pose (جانبية)' : 'صورة جانبية'}</option>
                    <option value="BACK">{isEn ? 'Back Pose (خلفية)' : 'صورة خلفية'}</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              {selectedImageBase64 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                  <img
                    src={selectedImageBase64}
                    alt="Preview"
                    style={{ maxHeight: '200px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="glow-btn" style={{ padding: '10px 20px', fontSize: '13px' }}>
                  💾 {isEn ? 'Save Progress Photo' : 'حفظ الصورة في المعرض'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="secondary-btn"
                  style={{ padding: '10px 16px', fontSize: '13px' }}
                >
                  {isEn ? 'Cancel' : 'إلغاء'}
                </button>
              </div>
            </form>
          )}

          {/* BEFORE & AFTER COMPARISON VIEW */}
          {compareMode && photos.length >= 2 && beforePhoto && afterPhoto && (
            <div
              className="glass-panel animated-fade"
              style={{
                padding: '24px',
                borderRadius: '18px',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.06), rgba(0,0,0,0.4))',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#ec4899', margin: 0 }}>
                  ⚡ {isEn ? 'Side-by-Side Transformation Result' : 'مقارنة التحول البدني المباشرة'}
                </h3>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    value={compareBeforeId || beforePhoto.id}
                    onChange={(e) => setCompareBeforeId(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    {photos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {isEn ? 'Before:' : 'قبل:'} {p.date} ({p.weightKg}kg)
                      </option>
                    ))}
                  </select>

                  <select
                    value={compareAfterId || afterPhoto.id}
                    onChange={(e) => setCompareAfterId(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    {photos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {isEn ? 'After:' : 'بعد:'} {p.date} ({p.weightKg}kg)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Before Photo Card */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                    ⏳ {isEn ? 'BEFORE (البداية)' : 'قبل (البداية)'} • {beforePhoto.date} ({beforePhoto.weightKg} kg)
                  </span>
                  <div style={{ width: '100%', height: '320px', borderRadius: '14px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={beforePhoto.imageDataBase64} alt="Before" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                </div>

                {/* After Photo Card */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>
                    🔥 {isEn ? 'AFTER (النتيجة الحالية)' : 'بعد (النتيجة الحالية)'} • {afterPhoto.date} ({afterPhoto.weightKg} kg)
                  </span>
                  <div style={{ width: '100%', height: '320px', borderRadius: '14px', overflow: 'hidden', border: '2px solid var(--primary)', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={afterPhoto.imageDataBase64} alt="After" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PHOTOS GALLERY GRID */}
          {photos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <Camera size={48} style={{ opacity: 0.3, margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                {isEn ? 'No Progress Photos Yet' : 'لا توجد صور تحول بدني مسجلة بعد'}
              </h3>
              <p style={{ fontSize: '12.5px', maxWidth: '400px', margin: '4px auto 16px auto' }}>
                {isEn
                  ? 'Take your first baseline photo today to track your muscle growth and body recomposition!'
                  : 'التقط صورتك الأولى اليوم لتوثيق بداية مشوارك ومقارنة البناء العضلي شهرياً!'}
              </p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="glow-btn"
                style={{ padding: '9px 18px', fontSize: '13px' }}
              >
                📷 {isEn ? 'Take First Photo' : 'التقاط الصورة الأولى'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="glass-panel"
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  <div style={{ width: '100%', height: '260px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img
                      src={photo.imageDataBase64}
                      alt={photo.label_en}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '13px' }}>
                        {isEn ? photo.label_en : photo.label_ar}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        📅 {photo.date} • ⚖️ {photo.weightKg} kg
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="secondary-btn"
                      style={{ padding: '6px 8px', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                      title={isEn ? 'Delete Photo' : 'حذف الصورة'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
