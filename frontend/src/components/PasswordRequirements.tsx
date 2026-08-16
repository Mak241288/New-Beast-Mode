import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
  password: string;
  lang?: 'ar' | 'en';
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password, lang = 'ar' }) => {
  const isEn = lang === 'en';

  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const criteriaCount = [hasMinLength, hasLetter, hasNumberOrSymbol].filter(Boolean).length;

  let strengthLabel = isEn ? 'Weak' : 'ضعيفة';
  let strengthColor = '#ef4444';
  let strengthWidth = '33%';

  if (criteriaCount === 2) {
    strengthLabel = isEn ? 'Medium' : 'متوسطة';
    strengthColor = '#f59e0b';
    strengthWidth = '66%';
  } else if (criteriaCount === 3) {
    strengthLabel = isEn ? 'Strong' : 'قوية وممتازة';
    strengthColor = '#10b981';
    strengthWidth = '100%';
  }

  if (!password) return null;

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '10px 12px',
      marginTop: '4px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontSize: '11.5px',
      textAlign: isEn ? 'left' : 'right'
    }}>
      {/* Strength Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>
          {isEn ? 'Password Strength:' : 'قوة كلمة المرور:'}
        </span>
        <span style={{ color: strengthColor, fontWeight: '800' }}>
          {strengthLabel}
        </span>
      </div>

      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: strengthWidth, height: '100%', background: strengthColor, transition: 'all 0.3s ease' }} />
      </div>

      {/* Requirement List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasMinLength ? '#10b981' : 'var(--text-muted)' }}>
          {hasMinLength ? <Check size={13} /> : <X size={13} />}
          <span>{isEn ? 'At least 8 characters' : '8 خانات على الأقل'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasLetter ? '#10b981' : 'var(--text-muted)' }}>
          {hasLetter ? <Check size={13} /> : <X size={13} />}
          <span>{isEn ? 'Contains letters (a-z, A-Z)' : 'تحتوي على حروف إنجليزية'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasNumberOrSymbol ? '#10b981' : 'var(--text-muted)' }}>
          {hasNumberOrSymbol ? <Check size={13} /> : <X size={13} />}
          <span>{isEn ? 'Contains numbers or special symbols (0-9, @, #...)' : 'تحتوي على أرقام أو رموز خاصة'}</span>
        </div>
      </div>
    </div>
  );
};
