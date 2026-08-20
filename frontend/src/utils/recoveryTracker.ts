import { cacheStore } from './cacheStore';
import { api } from '../services/api';

export interface DailyRecoveryLog {
  date: string; // YYYY-MM-DD
  waterMl: number;
  targetWaterMl: number;
  sleepHours: number;
  sleepQuality: number; // 1 to 5
  notes?: string;
}

export interface Badge {
  id: string;
  name_en: string;
  name_ar: string;
  desc_en: string;
  desc_ar: string;
  icon: string;
  category: 'STREAK' | 'HYDRATION' | 'SLEEP' | 'VOLUME';
  isUnlocked: boolean;
  unlockedAt?: string;
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDailyRecovery(dateKey: string = getTodayKey(), defaultTargetLiters: number = 3.0): DailyRecoveryLog {
  const cached = cacheStore.get<DailyRecoveryLog>(`recovery_log_${dateKey}`);
  if (cached) return cached;

  const raw = localStorage.getItem(`recovery_log_${dateKey}`);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      cacheStore.set(`recovery_log_${dateKey}`, parsed);
      return parsed;
    } catch (e) {
      // fallback
    }
  }
  return {
    date: dateKey,
    waterMl: 0,
    targetWaterMl: Math.round(defaultTargetLiters * 1000),
    sleepHours: 7,
    sleepQuality: 4,
  };
}

export function saveDailyRecovery(log: DailyRecoveryLog): void {
  localStorage.setItem(`recovery_log_${log.date}`, JSON.stringify(log));
  cacheStore.set(`recovery_log_${log.date}`, log);
  cacheStore.set('latest_recovery_log', log);
  
  // Also update recovery map in cache
  const allLogs: Record<string, DailyRecoveryLog> = cacheStore.get('all_recovery_logs') || {};
  allLogs[log.date] = log;
  cacheStore.set('all_recovery_logs', allLogs);

  // Push to Cloud
  api.pushUserDataToCloud();
}

export function computeBadges(globalStreak: number, totalWorkouts: number, todayLog: DailyRecoveryLog): Badge[] {
  const badges: Badge[] = [
    {
      id: 'first_step',
      name_en: 'First Step to Greatness 🚀',
      name_ar: 'الخطوة الأولى نحو القوة 🚀',
      desc_en: 'Logged your very first workout session.',
      desc_ar: 'أكملت وسجلت أول حصة تدريبية بنجاح.',
      icon: '🚀',
      category: 'VOLUME',
      isUnlocked: totalWorkouts >= 1,
    },
    {
      id: 'streak_3',
      name_en: '3-Day Momentum 🔥',
      name_ar: 'شعلة الالتزام (3 أيام) 🔥',
      desc_en: 'Maintained an active workout streak of 3 days.',
      desc_ar: 'حافظت على التزامك بالتمرين لمدة 3 أيام متتالية.',
      icon: '🔥',
      category: 'STREAK',
      isUnlocked: globalStreak >= 3,
    },
    {
      id: 'streak_7',
      name_en: '7-Day Iron Beast ⚡',
      name_ar: 'وحش الأسبوع الحديدي (7 أيام) ⚡',
      desc_en: 'Crushed a full 7-day training consistency streak.',
      desc_ar: 'أكملت أسبوعاً كاملاً من الالتزام الرياضي المتواصل.',
      icon: '⚡',
      category: 'STREAK',
      isUnlocked: globalStreak >= 7,
    },
    {
      id: 'streak_14',
      name_en: '14-Day Unstoppable Titan 🏆',
      name_ar: 'المحارب الصامد (14 يوماً) 🏆',
      desc_en: 'Built unbreakable discipline with 14 continuous streak days.',
      desc_ar: 'بنيت انضباطاً فولاذياً بـ 14 يوماً من الالتزام الرياضي.',
      icon: '🏆',
      category: 'STREAK',
      isUnlocked: globalStreak >= 14,
    },
    {
      id: 'streak_30',
      name_en: '30-Day Legend of Consistency 💎',
      name_ar: 'أسطورة الالتزام الذهبي (30 يوماً) 💎',
      desc_en: 'Mastered the lifestyle with 30 consecutive streak points.',
      desc_ar: 'حققت أعلى وسام التزام بـ 30 يوماً من الاستمرارية.',
      icon: '💎',
      category: 'STREAK',
      isUnlocked: globalStreak >= 30,
    },
    {
      id: 'hydration_master',
      name_en: 'Hydration Champion 💧',
      name_ar: 'بطل الترطيب العضلي 💧',
      desc_en: 'Hit 100% of your daily water intake target.',
      desc_ar: 'حققت 100% من هدف شرب الماء اليومي للترطيب العضلي.',
      icon: '💧',
      category: 'HYDRATION',
      isUnlocked: todayLog.waterMl >= todayLog.targetWaterMl && todayLog.targetWaterMl > 0,
    },
    {
      id: 'sleep_recovery',
      name_en: 'Deep Recovery Master 🌙',
      name_ar: 'ملك النوم والاستشفاء العميق 🌙',
      desc_en: 'Logged 7.5+ hours of high-quality sleep for MPS growth.',
      desc_ar: 'سجلت أكثر من 7.5 ساعات من النوم لتعزيز البناء والاستشفاء.',
      icon: '🌙',
      category: 'SLEEP',
      isUnlocked: todayLog.sleepHours >= 7.5 && todayLog.sleepQuality >= 4,
    },
    {
      id: 'century_workouts',
      name_en: 'Century Workout Club (25 Sessions) 👑',
      name_ar: 'نادي الـ 25 حصة تدريبية 👑',
      desc_en: 'Completed 25 recorded workout sessions.',
      desc_ar: 'أكملت وسجلت 25 حصة تدريبية كاملة بنجاح.',
      icon: '👑',
      category: 'VOLUME',
      isUnlocked: totalWorkouts >= 25,
    },
  ];

  return badges;
}
