import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { translations } from '../utils/translations';

interface WeeklyStreakBarProps {
  lang: 'ar' | 'en';
  workoutLogs?: any[];
  streakCount?: number;
}

const ARABIC_DAYS_SHORT = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const ENGLISH_DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeeklyStreakBar: React.FC<WeeklyStreakBarProps> = ({
  lang,
  workoutLogs = [],
  streakCount = 0,
}) => {
  const isEn = lang === 'en';
  const t = translations[lang] || translations.ar;

  // Compute current week days (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const isToday = d.toDateString() === now.toDateString();
      const isPast = d < now && !isToday;
      
      // Check if user worked out on this date
      const dateStr = d.toISOString().split('T')[0];
      const hasWorkout = workoutLogs.some((log: any) => {
        if (!log) return false;
        const logDate = (log.date || log.createdAt || '').split('T')[0];
        return logDate === dateStr;
      });

      days.push({
        date: d,
        dayNum: d.getDate(),
        dayName: isEn ? ENGLISH_DAYS_SHORT[i] : ARABIC_DAYS_SHORT[i],
        isToday,
        isPast,
        hasWorkout,
      });
    }
    return days;
  }, [workoutLogs, isEn]);

  const activeStreak = streakCount > 0 ? streakCount : weekDays.filter(d => d.hasWorkout).length;

  return (
    <div className="weekly-streak-strip glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px', paddingRight: isEn ? '0' : '8px', paddingLeft: isEn ? '8px' : '0' }}>
        <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={18} color="#f59e0b" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            {t.weeklyStreak}
          </span>
          <span style={{ fontSize: '13px', fontWeight: '900', color: activeStreak > 0 ? '#f59e0b' : 'var(--text-primary)' }}>
            {activeStreak} {t.daysStreak}
          </span>
        </div>
      </div>

      {/* 7 Days Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={`streak-day-chip ${day.isToday ? 'today' : ''} ${day.hasWorkout ? 'completed' : ''}`}
            title={`${day.dayName} - ${day.dayNum}`}
          >
            <span style={{ fontSize: '10px', color: day.isToday ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: day.isToday ? '800' : '600' }}>
              {day.dayName}
            </span>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: day.hasWorkout ? 'rgba(245, 158, 11, 0.25)' : (day.isToday ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)') }}>
              {day.hasWorkout ? (
                <Flame size={12} color="#f59e0b" />
              ) : day.isToday ? (
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#000000' }}>{day.dayNum}</span>
              ) : (
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{day.dayNum}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
