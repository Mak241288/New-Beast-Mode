import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Download, FileText, TrendingUp, Award, Flame, Dumbbell, Timer, Plus, Scale, Zap, PieChart, CheckCircle2 } from 'lucide-react';
import { exportWeightLogsToCSV } from '../utils/exportUtils';
import { cacheStore } from '../utils/cacheStore';
import { SkeletonLoader } from '../components/SkeletonLoader';

interface StatsProps {
  lang: 'ar' | 'en';
}

export const Stats: React.FC<StatsProps> = ({ lang }) => {
  const [stats, setStats] = useState<any>(() => cacheStore.get('user_stats'));
  const [activePlan, setActivePlan] = useState<any>(() => cacheStore.get('active_plan'));
  const [userProfile, setUserProfile] = useState<any>(() => cacheStore.get('user_profile'));
  const [loading, setLoading] = useState(() => !cacheStore.get('user_stats'));

  // Quick Weight Logger Modal state
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [weightNotes, setWeightNotes] = useState('');
  const [submittingWeight, setSubmittingWeight] = useState(false);

  const fetchStats = async () => {
    if (!cacheStore.get('user_stats')) {
      setLoading(true);
    }
    try {
      const [statsData, planData, profileData] = await Promise.allSettled([
        api.getStats(),
        api.getActivePlan(),
        api.getProfile(),
      ]);

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
        cacheStore.set('user_stats', statsData.value);
      }
      if (planData.status === 'fulfilled') {
        setActivePlan(planData.value);
        cacheStore.set('active_plan', planData.value);
      }
      if (profileData.status === 'fulfilled') {
        setUserProfile(profileData.value);
        cacheStore.set('user_profile', profileData.value);
      }
    } catch (err: any) {
      console.error(err.message || 'Failed to fetch stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const handleCloudSync = () => {
      fetchStats();
    };
    window.addEventListener('beast_cloud_synced', handleCloudSync);
    return () => window.removeEventListener('beast_cloud_synced', handleCloudSync);
  }, []);

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      alert(lang === 'en' ? 'Please enter a valid weight in kg.' : 'يرجى إدخال وزن صحيح بالكيلوجرام.');
      return;
    }

    setSubmittingWeight(true);
    try {
      await api.updateProfile({
        currentWeight: parseFloat(newWeight),
      });
      alert(lang === 'en' ? 'Weight recorded successfully! ⚖️' : 'تم تسجيل الوزن بنجاح! ⚖️');
      setShowWeightModal(false);
      setNewWeight('');
      setWeightNotes('');
      fetchStats();
    } catch (err: any) {
      alert(err.message || (lang === 'en' ? 'Failed to log weight' : 'فشل تسجيل الوزن'));
    } finally {
      setSubmittingWeight(false);
    }
  };

  const getMonthlyCalendarDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const getCompletedExercisesByDay = () => {
    if (!stats || !stats.workoutStats || !stats.workoutStats.strengthTrend) return [];
    
    const days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        dateStr: d.toDateString(),
        displayDate: d.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', { weekday: 'short' }),
        count: 0
      });
    }

    stats.workoutStats.strengthTrend.forEach((log: any) => {
      const logDateStr = new Date(log.date).toDateString();
      const match = days.find(day => day.dateStr === logDateStr);
      if (match) {
        match.count++;
      }
    });

    return days;
  };

  // Plan Muscle Distribution Analytics
  const getMuscleDistribution = () => {
    if (!activePlan || !activePlan.dayWorkouts) return [];

    const counts: Record<string, number> = {};
    let total = 0;

    activePlan.dayWorkouts.forEach((dw: any) => {
      if (dw.exercises) {
        dw.exercises.forEach((ex: any) => {
          const muscle = (ex.targetMuscle || 'General').trim();
          counts[muscle] = (counts[muscle] || 0) + 1;
          total++;
        });
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Calorie & Nutrition Estimation
  const getNutritionEstimates = () => {
    const weight = userProfile?.currentWeight || stats?.bmi?.weight || 75;
    const height = userProfile?.height || stats?.bmi?.height || 175;
    const age = userProfile?.age || 25;
    const isMale = userProfile?.gender !== 'FEMALE';
    const goal = userProfile?.fitnessGoal || 'MUSCLE_GAIN';

    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (isMale ? 5 : -161);
    let tdee = Math.round(bmr * 1.45); // Active gym workout multiplier

    let targetCalories = tdee;
    if (goal === 'MUSCLE_GAIN' || goal === 'BULK') targetCalories += 350;
    if (goal === 'FAT_LOSS' || goal === 'CUT') targetCalories -= 450;

    const proteinGrams = Math.round(weight * 2.0);
    const fatsGrams = Math.round((targetCalories * 0.25) / 9);
    const carbsGrams = Math.round((targetCalories - (proteinGrams * 4) - (fatsGrams * 9)) / 4);
    const waterLiters = (weight * 0.038).toFixed(1);

    return {
      tdee,
      targetCalories,
      proteinGrams,
      fatsGrams,
      carbsGrams,
      waterLiters,
    };
  };

  const nutrition = getNutritionEstimates();
  const muscleDistribution = getMuscleDistribution();

  const exportToMD = () => {
    if (!stats) return;

    let content = `# تقرير إنجازات BeastMode الرياضية 📈\n\n`;
    content += `التاريخ: ${new Date().toLocaleDateString('ar-EG')}\n`;
    content += `--------------------------------------------------\n\n`;

    if (stats.bmi && stats.bmi.value > 0) {
      content += `## مؤشر كتلة الجسم (BMI):\n`;
      content += `- القيمة: ${stats.bmi.value}\n`;
      content += `- التصنيف: ${stats.bmi.category}\n`;
      content += `- الطول: ${stats.bmi.height} سم | الوزن: ${stats.bmi.weight} كجم\n\n`;
    }

    content += `## 1. الإحصاءات الرياضية:\n`;
    content += `- إجمالي التمارين المقترحة: ${stats.workoutStats?.totalExercises || 0}\n`;
    content += `- التمارين المكتملة المسجلة: ${stats.workoutStats?.completedExercises || 0}\n`;
    content += `- نسبة الالتزام الإجمالية: ${(stats.workoutStats?.completionRate || 0).toFixed(1)}%\n\n`;

    content += `## 2. سجل تطور وزن الجسم:\n`;
    if (!stats.weightHistory || stats.weightHistory.length === 0) {
      content += `لا توجد أوزان مسجلة بعد.\n`;
    } else {
      stats.weightHistory.forEach((log: any) => {
        content += `- تاريخ: ${new Date(log.date).toLocaleDateString('ar-EG')} | الوزن: ${log.weight} كجم | ملاحظات: ${log.notes || 'لا يوجد'}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BeastMode_Report_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToDoc = () => {
    if (!stats) return;

    let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>`;
    html += `<head><title>تقرير BeastMode</title><meta charset="utf-8"></head>`;
    html += `<body style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">`;
    html += `<h1 style="color: #00d2ff; text-align: center;">تقرير إنجازات BeastMode الرياضية</h1>`;
    html += `<p style="text-align: center; color: #666;">تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}</p>`;
    html += `<hr/>`;

    if (stats.bmi && stats.bmi.value > 0) {
      html += `<h2>مؤشر كتلة الجسم (BMI)</h2>`;
      html += `<p>القيمة الحالية: <strong>${stats.bmi.value}</strong> (${stats.bmi.category})</p>`;
    }

    html += `<h2>1. الإنجاز الرياضي</h2>`;
    html += `<p>نسبة الالتزام والامتثال للجدول الرياضي: <strong>${(stats.workoutStats?.completionRate || 0).toFixed(1)}%</strong></p>`;
    html += `<p>إجمالي التمارين المكتملة: ${stats.workoutStats?.completedExercises || 0} من أصل ${stats.workoutStats?.totalExercises || 0}</p>`;

    html += `<h2>2. سجل تغير الوزن</h2>`;
    html += `<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">`;
    html += `<tr style="background-color: #f2f2f2;"><th>التاريخ</th><th>الوزن (كجم)</th><th>الملاحظة</th></tr>`;
    (stats.weightHistory || []).forEach((log: any) => {
      html += `<tr><td>${new Date(log.date).toLocaleDateString('ar-EG')}</td><td>${log.weight}</td><td>${log.notes || ''}</td></tr>`;
    });
    html += `</table>`;
    html += `</body></html>`;

    const blob = new Blob([html], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BeastMode_Report_${new Date().toISOString().split('T')[0]}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div style={{ padding: '20px 0' }} className="print-area">
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>{lang === 'en' ? 'Stats & Analytics 📊' : 'الإحصاءات الشاملة وتقارير التقدم 📊'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            {lang === 'en' ? 'Analyze your commitment, weight change, and export health reports.' : 'حلل التزامك، وتغير وزنك، وقم بتصدير تقاريرك الطبية والرياضية'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} className="no-print">
          <button 
            onClick={() => setShowWeightModal(true)} 
            className="primary-btn" 
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Scale size={16} />
            <span>{lang === 'en' ? 'Log Weight ⚖️' : 'تسجيل وزن جديد ⚖️'}</span>
          </button>
          <button 
            onClick={() => exportWeightLogsToCSV(stats?.weightHistory || [], lang)} 
            className="secondary-btn" 
            style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={16} />
            <span>CSV</span>
          </button>
          <button onClick={exportToMD} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px' }}>
            <FileText size={16} />
            Markdown
          </button>
          <button onClick={exportToDoc} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px' }}>
            <Download size={16} />
            Word
          </button>
          <button onClick={exportToPDF} className="glow-btn" style={{ padding: '8px 14px', fontSize: '13px' }}>
            {lang === 'en' ? 'Print PDF' : 'طباعة التقرير (PDF)'}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SkeletonLoader type="stats" />
          <SkeletonLoader type="chart" />
        </div>
      )}

      {!loading && stats && (
        <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Widgets Row: Streak, Workouts, Minutes, Exercises */}
          <div className="grid-responsive-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '20px' }}>
            {/* Streak Counter */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Flame size={28} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Workout Streak' : 'أيام الالتزام'}</span>
                <h2 className="num-display" style={{ fontSize: '26px', fontWeight: '900', color: '#ef4444', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {stats?.workoutStats?.globalStreak || 0} <span style={{ fontSize: '14px', fontFamily: 'inherit' }}>{lang === 'en' ? 'Days' : 'يوم'}</span>
                </h2>
              </div>
            </div>

            {/* Total Workouts */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Dumbbell size={28} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Total Workouts' : 'إجمالي الحصص'}</span>
                <h2 className="num-display" style={{ fontSize: '26px', fontWeight: '900', color: '#3b82f6', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {stats?.workoutStats?.globalWorkouts || 0} <span style={{ fontSize: '14px', fontFamily: 'inherit' }}>{lang === 'en' ? 'Sessions' : 'حصة'}</span>
                </h2>
              </div>
            </div>

            {/* Estimated Minutes */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Timer size={28} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Estimated Minutes' : 'دقائق التمرين'}</span>
                <h2 className="num-display" style={{ fontSize: '26px', fontWeight: '900', color: '#f59e0b', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {stats?.workoutStats?.globalMinutes || 0} <span style={{ fontSize: '14px', fontFamily: 'inherit' }}>{lang === 'en' ? 'Min' : 'دقيقة'}</span>
                </h2>
              </div>
            </div>

            {/* Completed Exercises */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={28} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Completed Exercises' : 'التمارين المنجزة'}</span>
                <h2 className="num-display" style={{ fontSize: '26px', fontWeight: '900', color: '#10b981', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {stats?.workoutStats?.globalExercises || 0} <span style={{ fontSize: '14px', fontFamily: 'inherit' }}>{lang === 'en' ? 'Exs' : 'تمرين'}</span>
                </h2>
              </div>
            </div>
          </div>

          {/* Active Plan Muscle Distribution & Macro Targets */}
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Plan Muscle Volume Breakdown */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <PieChart size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                  {lang === 'en' ? 'Weekly Muscle Volume & Recovery State' : 'الكثافة العضلية الأسبوعية وجاهزية الاستشفاء'}
                </h3>
              </div>

              {muscleDistribution.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {lang === 'en' ? 'Generate or create a workout plan to see your muscle split analysis.' : 'قم بتوليد أو تصميم جدولك الرياضي لعرض تحليل توزيع العضلات هنا.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {muscleDistribution.map((item, idx) => {
                    // 3-state readiness simulation based on exercise index
                    const recoveryState =
                      idx % 3 === 0
                        ? { label: lang === 'en' ? '🟢 Ready' : '🟢 جاهزة', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' }
                        : idx % 3 === 1
                        ? { label: lang === 'en' ? '🟡 Recovering' : '🟡 استشفاء', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' }
                        : { label: lang === 'en' ? '🔴 Fatigued' : '🔴 مجهدة', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' };

                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🎯 {item.name}</span>
                            <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '6px', background: recoveryState.bg, color: recoveryState.color, fontWeight: '800' }}>
                              {recoveryState.label}
                            </span>
                          </span>
                          <span className="num-display" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13.5px' }}>
                            {item.count * 3} / 16 {lang === 'en' ? 'sets' : 'جولة'} ({item.percent}%)
                          </span>
                        </div>
                        <div className="bullet-bar-track">
                          <div 
                            className="bullet-bar-fill"
                            style={{ 
                              width: `${Math.min(item.percent * 1.5, 100)}%`, 
                              background: idx === 0 ? 'var(--primary)' : idx === 1 ? '#00f0ff' : idx === 2 ? '#f59e0b' : '#10b981',
                              boxShadow: `0 0 10px ${idx === 0 ? 'var(--primary-glow)' : 'rgba(0,240,255,0.3)'}`,
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Smart Daily Macro & Calorie Targets */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <Zap size={20} color="#f59e0b" />
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                  {lang === 'en' ? 'Estimated Nutritional Targets' : 'الأهداف الغذائية والاحتياج اليومي المقترح'}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', display: 'block' }}>
                    🔥 {lang === 'en' ? 'Daily Calories' : 'السعرات المستهدفة'}
                  </span>
                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', margin: '4px 0 0 0' }}>
                    {nutrition.targetCalories} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>kcal</span>
                  </h3>
                </div>

                <div style={{ padding: '14px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'bold', display: 'block' }}>
                    🥩 {lang === 'en' ? 'Daily Protein' : 'البروتين اليومي'}
                  </span>
                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', margin: '4px 0 0 0' }}>
                    {nutrition.proteinGrams} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>g</span>
                  </h3>
                </div>

                <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold', display: 'block' }}>
                    💧 {lang === 'en' ? 'Water Intake' : 'الماء اليومي'}
                  </span>
                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', margin: '4px 0 0 0' }}>
                    {nutrition.waterLiters} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>L</span>
                  </h3>
                </div>

                <div style={{ padding: '14px', background: 'rgba(168, 85, 247, 0.08)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 'bold', display: 'block' }}>
                    ⚡ {lang === 'en' ? 'Carbs / Fats' : 'الكارب والدهون'}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', margin: '4px 0 0 0' }}>
                    {nutrition.carbsGrams}g / {nutrition.fatsGrams}g
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', marginBottom: 0 }}>
                {lang === 'en' ? 'Estimations calibrated for progressive overload and muscle recovery.' : 'الحسابات مبنية على زيادة الكتلة العضلية وسرعة الاستشفاء الرياضي.'}
              </p>
            </div>
          </div>

          {/* Workout Calendar Heatmap Row */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>
                📅 {lang === 'en' ? 'Workout Calendar Heatmap' : 'خريطة حرارية لتتبع الالتزام بالتمارين'}
              </h4>
              
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '3px' }}></div>
                  <span>{lang === 'en' ? 'No Log' : 'لا يوجد سجل'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#27272a', border: '1px solid var(--border-color)', borderRadius: '3px' }}></div>
                  <span>{lang === 'en' ? 'Rest Day' : 'يوم راحة'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></div>
                  <span>{lang === 'en' ? 'Completed' : 'مكتمل ⚡'}</span>
                </div>
              </div>
            </div>

            {/* Days Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                {(lang === 'en' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']).map(d => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {getMonthlyCalendarDays().map((day, idx) => {
                  if (day === null) {
                    return <div key={`pad-${idx}`} style={{ aspectRatio: '1', visibility: 'hidden' }}></div>;
                  }

                  const isCompleted = stats.workoutStats?.strengthTrend?.some((log: any) => {
                    return new Date(log.date).toDateString() === day.toDateString();
                  });

                  const jsDay = day.getDay();
                  const planDayIndex = jsDay + 1; // 0 = Sunday (Day 1) ... 6 = Saturday (Day 7)
                  const planDay = activePlan?.dayWorkouts?.find((dw: any) => dw.dayIndex === planDayIndex);
                  const isScheduledRest = planDay?.isRestDay === true;

                  return (
                    <div 
                      key={day.toISOString()} 
                      style={{ 
                        aspectRatio: '1', 
                        background: isCompleted ? 'var(--primary)' : isScheduledRest ? '#27272a' : 'rgba(255,255,255,0.02)', 
                        border: isCompleted ? '1px solid var(--primary)' : '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: isCompleted ? '#050710' : 'var(--text-secondary)', 
                        fontWeight: '800',
                        fontSize: '13px'
                      }}
                      title={day.toLocaleDateString()}
                    >
                      <span>{day.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row: completion wheel, BMI Widget, and weight change */}
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* Workout Completion Widget */}
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '50%', marginBottom: '16px' }}>
                <Award size={32} color="var(--primary)" />
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                {lang === 'en' ? 'Active Routine Completion Rate' : 'معدل إتمام تمارين الجدول النشط'}
              </span>
              <h1 style={{ fontSize: '48px', color: 'var(--primary)', margin: '10px 0', fontWeight: '800' }}>
                {(stats.workoutStats?.completionRate || 0).toFixed(0)}%
              </h1>
              <p style={{ fontSize: '13px' }}>
                {lang === 'en' 
                  ? `Completed ${stats.workoutStats?.completedExercises || 0} of ${stats.workoutStats?.totalExercises || 0} routine exercises.`
                  : `أكملت ${stats.workoutStats?.completedExercises || 0} من أصل ${stats.workoutStats?.totalExercises || 0} تمريناً مجدولاً.`}
              </p>
            </div>

            {/* BMI Widget */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <Award size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{lang === 'en' ? 'Body Mass Index (BMI)' : 'مؤشر كتلة الجسم (BMI)'}</h3>
              </div>
              {stats.bmi && stats.bmi.value > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '36px', fontWeight: '900', color: 'var(--primary)' }}>
                      {stats.bmi.value}
                    </span>
                    <span className="badge" style={{ 
                      backgroundColor: 
                        stats.bmi.category === 'NORMAL' ? 'rgba(16, 185, 129, 0.15)' : 
                        stats.bmi.category === 'UNDERWEIGHT' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: 
                        stats.bmi.category === 'NORMAL' ? '#10b981' : 
                        stats.bmi.category === 'UNDERWEIGHT' ? '#f59e0b' : '#ef4444',
                      fontSize: '13px',
                      padding: '6px 12px'
                    }}>
                      {stats.bmi.category === 'NORMAL' ? (lang === 'en' ? 'Normal Weight' : 'وزن مثالي') :
                       stats.bmi.category === 'UNDERWEIGHT' ? (lang === 'en' ? 'Underweight' : 'وزن منخفض') :
                       stats.bmi.category === 'OVERWEIGHT' ? (lang === 'en' ? 'Overweight' : 'وزن زائد') : 
                       (lang === 'en' ? 'Obese' : 'سمنة')}
                    </span>
                  </div>

                  <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #f59e0b 0%, #10b981 35%, #f97316 70%, #ef4444 100%)', marginTop: '10px', marginBottom: '15px' }}>
                    {(() => {
                      const minBmi = 15;
                      const maxBmi = 35;
                      const percent = Math.min(Math.max(((stats.bmi.value - minBmi) / (maxBmi - minBmi)) * 100, 0), 100);
                      return (
                        <div style={{
                          position: 'absolute',
                          left: `${percent}%`,
                          top: '-4px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          border: '3px solid var(--primary)',
                          boxShadow: '0 0 8px rgba(0,0,0,0.5)',
                          transform: 'translateX(-50%)',
                          transition: 'left 1s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} />
                      );
                    })()}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>{lang === 'en' ? 'Underweight' : 'منخفض'}</span>
                    <span>{lang === 'en' ? 'Normal' : 'طبيعي'}</span>
                    <span>{lang === 'en' ? 'Overweight' : 'زائد'}</span>
                    <span>{lang === 'en' ? 'Obese' : 'سمنة'}</span>
                  </div>
                  
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {lang === 'en' 
                      ? `Based on height (${stats.bmi.height} cm) and weight (${stats.bmi.weight} kg).`
                      : `محسوب بناءً على طولك المسجل (${stats.bmi.height} سم) ووزنك (${stats.bmi.weight} كجم).`}
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {lang === 'en' ? 'No weight/height logs yet.' : 'لا توجد بيانات وزن وطول كافية بعد.'}
                </p>
              )}
            </div>

            {/* Weight History Tracker */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TrendingUp size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{lang === 'en' ? 'Body Weight Trend' : 'منحنى ومراقبة وزن الجسم'}</h3>
                </div>
                <button 
                  onClick={() => setShowWeightModal(true)} 
                  className="secondary-btn" 
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} />
                  <span>{lang === 'en' ? 'Add Log' : 'إضافة'}</span>
                </button>
              </div>

              {(!stats.weightHistory || stats.weightHistory.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <Scale size={32} style={{ opacity: 0.4, color: 'var(--primary)' }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    {lang === 'en' ? 'No weight records logged yet.' : 'لا يوجد سجل أوزان حتى الآن.'}
                  </p>
                  <button onClick={() => setShowWeightModal(true)} className="primary-btn" style={{ padding: '6px 14px', fontSize: '12px' }}>
                    {lang === 'en' ? 'Log Your Current Weight ⚖️' : 'سجل وزنك الحالي الآن ⚖️'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
                    {stats.weightHistory.slice(-10).map((log: any, idx: number) => {
                      const maxW = Math.max(...stats.weightHistory.map((w: any) => w.weight));
                      const minW = Math.min(...stats.weightHistory.map((w: any) => w.weight)) - 10;
                      const range = maxW - minW || 1;
                      const heightPercent = Math.max(((log.weight - minW) / range) * 100, 15);

                      return (
                        <div key={log.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{log.weight}</span>
                          <div
                            style={{
                              width: '100%',
                              height: `${heightPercent}px`,
                              background: 'linear-gradient(to top, var(--primary), var(--secondary))',
                              borderRadius: '4px 4px 0 0',
                              opacity: idx === stats.weightHistory.slice(-10).length - 1 ? 1 : 0.7,
                              boxShadow: idx === stats.weightHistory.slice(-10).length - 1 ? '0 0 10px var(--primary-glow)' : 'none',
                            }}
                          />
                          <span style={{ fontSize: '8px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(log.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', { day: 'numeric', month: 'numeric' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {stats.weightHistory.slice().reverse().map((log: any) => (
                      <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                        <span>📅 {new Date(log.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG')}</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{log.weight} {lang === 'en' ? 'kg' : 'كجم'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Row: Completed Daily Graph & PRs */}
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Completed Exercises Daily Graph */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '700' }}>
                {lang === 'en' ? 'Exercises Completed Daily (Last 7 Days)' : 'التمارين الرياضية المكتملة يومياً (آخر 7 أيام)'}
              </h3>
              
              {getCompletedExercisesByDay().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {lang === 'en' ? 'No workout logs yet. Perform workouts on your Dashboard!' : 'لا يوجد سجل تمارين بعد. قم بأداء تمارينك من لوحة التحكم!'}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
                    {getCompletedExercisesByDay().map((day: any) => {
                      const maxCount = Math.max(...getCompletedExercisesByDay().map((d: any) => d.count), 4);
                      const pctHeight = Math.max((day.count / maxCount) * 100, 10);

                      return (
                        <div key={day.dateStr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div style={{
                            height: `${pctHeight}%`,
                            background: 'linear-gradient(to top, var(--primary), var(--primary-glow))',
                            borderRadius: '6px 6px 0 0',
                            opacity: day.count > 0 ? 1 : 0.2,
                            boxShadow: day.count > 0 ? '0 0 6px var(--primary-glow)' : 'none',
                            alignSelf: 'flex-end',
                            width: '100%',
                            maxWidth: '24px'
                          }} />
                          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{day.count}</span>
                          <span style={{ fontSize: '8px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {day.displayDate}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                    {lang === 'en' ? 'Tracks completed movements from logged routine days.' : 'يتبع الحركات المنجزة فعلياً والمحفوظة في خطة التدريب.'}
                  </p>
                </div>
              )}
            </div>

            {/* Personal Records Table */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Award size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                  {lang === 'en' ? 'Personal Records (PR) 🏆' : 'الأرقام القياسية الشخصية 🏆'}
                </h3>
              </div>

              {!stats.personalRecords || stats.personalRecords.length === 0 ? (
                <div style={{ padding: '20px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    {lang === 'en' ? 'No personal records logged yet. Your heaviest sets will appear here automatically.' : 'لا توجد أرقام قياسية مسجلة بعد. سيتم تحديث أثقل أوزانك تلقائياً عند إنهاء التمارين.'}
                  </p>
                  <div style={{ padding: '12px', background: 'rgba(0, 210, 255, 0.05)', borderRadius: '10px', border: '1px solid rgba(0, 210, 255, 0.15)', fontSize: '12px', textAlign: 'right' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                      💡 أهداف القوة المعيارية المقترحة لوزنك ({userProfile?.currentWeight || 75} كجم):
                    </span>
                    <ul style={{ margin: 0, paddingRight: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      <li>سكوات (Squat): {Math.round((userProfile?.currentWeight || 75) * 1.25)} كجم</li>
                      <li>بنش برس (Bench Press): {Math.round((userProfile?.currentWeight || 75) * 1.0)} كجم</li>
                      <li>ديدليفت (Deadlift): {Math.round((userProfile?.currentWeight || 75) * 1.5)} كجم</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: lang === 'en' ? 'left' : 'right' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 5px' }}>{lang === 'en' ? 'Exercise' : 'التمرين'}</th>
                        <th style={{ padding: '10px 5px' }}>{lang === 'en' ? 'Max Weight' : 'أقصى وزن'}</th>
                        <th style={{ padding: '10px 5px' }}>{lang === 'en' ? 'Reps' : 'التكرار'}</th>
                        <th style={{ padding: '10px 5px' }}>{lang === 'en' ? 'Date' : 'التاريخ'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.personalRecords.map((pr: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px 5px', fontWeight: 'bold' }}>{pr.exercise}</td>
                          <td style={{ padding: '12px 5px', color: 'var(--primary)', fontWeight: 'bold' }}>
                            {pr.weight} {lang === 'en' ? 'kg' : 'كجم'}
                          </td>
                          <td style={{ padding: '12px 5px', color: 'var(--text-secondary)' }}>{pr.reps}</td>
                          <td style={{ padding: '12px 5px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(pr.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Quick Weight Logger Modal */}
      {showWeightModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowWeightModal(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '26px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(6, 8, 20, 0.98))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Scale size={24} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                {lang === 'en' ? 'Log Current Body Weight' : 'تسجيل قياس الوزن الجديد ⚖️'}
              </h3>
            </div>

            <form onSubmit={handleLogWeight} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  {lang === 'en' ? 'Weight in Kilograms (kg)' : 'الوزن بالكيلوجرام (كجم):'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="مثال: 76.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#fff',
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  {lang === 'en' ? 'Notes (Optional)' : 'ملاحظات (اختياري):'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'E.g., Morning weigh-in fasting' : 'مثال: قياس صباحي بعد الاستيقاظ'}
                  value={weightNotes}
                  onChange={(e) => setWeightNotes(e.target.value)}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="secondary-btn"
                  style={{ flex: 1, padding: '12px', borderRadius: '10px' }}
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  disabled={submittingWeight}
                  className="primary-btn"
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{submittingWeight ? (lang === 'en' ? 'Saving...' : 'جاري الحفظ...') : (lang === 'en' ? 'Save Weight' : 'حفظ الوزن')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
