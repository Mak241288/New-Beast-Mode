import React, { useState, useEffect, useMemo } from 'react';
import { Flame } from 'lucide-react';

interface WeeklyStreakBarProps {
  lang: 'ar' | 'en';
  workoutLogs?: any[];
  streakCount?: number;
}

const ARABIC_DAYS_LETTERS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const ENGLISH_DAYS_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const WeeklyStreakBar: React.FC<WeeklyStreakBarProps> = ({
  lang,
  workoutLogs = [],
  streakCount = 0,
}) => {
  const isEn = lang === 'en';
  const [completedDates, setCompletedDates] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('beast_completed_workout_dates');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleCompleted = (e: any) => {
      try {
        const raw = localStorage.getItem('beast_completed_workout_dates');
        const updated = raw ? JSON.parse(raw) : [];
        const todayStr = (e?.detail?.date) || new Date().toISOString().split('T')[0];
        if (!updated.includes(todayStr)) {
          updated.push(todayStr);
        }
        setCompletedDates([...updated]);
      } catch {
        // Ignore
      }
    };

    window.addEventListener('beast_workout_completed', handleCompleted);
    window.addEventListener('storage', handleCompleted);
    return () => {
      window.removeEventListener('beast_workout_completed', handleCompleted);
      window.removeEventListener('storage', handleCompleted);
    };
  }, []);

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
      
      const dateStr = d.toISOString().split('T')[0];
      const hasWorkoutFromLogs = workoutLogs.some((log: any) => {
        if (!log) return false;
        const logDate = (log.date || log.createdAt || '').split('T')[0];
        return logDate === dateStr;
      });

      const hasWorkout = hasWorkoutFromLogs || completedDates.includes(dateStr);

      days.push({
        date: d,
        dayNum: d.getDate(),
        dayLetter: isEn ? ENGLISH_DAYS_LETTERS[i] : ARABIC_DAYS_LETTERS[i],
        isToday,
        isPast,
        hasWorkout,
      });
    }
    return days;
  }, [workoutLogs, completedDates, isEn]);

  const totalCompletedThisWeek = weekDays.filter(d => d.hasWorkout).length;
  const activeStreak = streakCount > 0 ? streakCount : (totalCompletedThisWeek > 0 ? totalCompletedThisWeek : 1);

  return (
    <div
      className="glass-panel animated-fade"
      style={{
        padding: '16px 20px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(13, 19, 36, 0.85), rgba(6, 10, 22, 0.95))',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      {/* 7-Days Row matching Mockup 1 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px', justifyContent: 'space-between' }}>
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '800', color: day.isToday ? '#00d2ff' : 'var(--text-secondary)' }}>
              {day.dayLetter}
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: day.hasWorkout
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.15))'
                  : (day.isToday ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)'),
                border: day.hasWorkout
                  ? '1.5px solid #f59e0b'
                  : (day.isToday ? '1.5px solid #00d2ff' : '1px solid rgba(255, 255, 255, 0.06)'),
                boxShadow: day.hasWorkout
                  ? '0 0 14px rgba(245, 158, 11, 0.4)'
                  : (day.isToday ? '0 0 12px rgba(0, 210, 255, 0.3)' : 'none'),
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {day.hasWorkout ? (
                <Flame size={20} color="#f59e0b" style={{ filter: 'drop-shadow(0 0 4px #f59e0b)' }} />
              ) : (
                <span style={{ fontSize: '12px', fontWeight: '900', color: day.isToday ? '#00d2ff' : 'var(--text-muted)' }}>
                  {day.dayNum}
                </span>
              )}
            </div>
            <span style={{ fontSize: '9.5px', color: day.hasWorkout ? '#f59e0b' : 'var(--text-muted)', fontWeight: 'bold' }}>
              {day.hasWorkout ? 'Done' : (day.isToday ? 'Today' : '')}
            </span>
          </div>
        ))}
      </div>

      {/* Streak Summary Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          borderRadius: '16px',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
        }}
      >
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={20} color="#f59e0b" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '18px', fontWeight: '900', color: '#f59e0b', lineHeight: 1.1 }}>
            {activeStreak}
          </span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEn ? 'DAYS STREAK' : 'أيام متتالية'}
          </span>
        </div>
      </div>
    </div>
  );
};
