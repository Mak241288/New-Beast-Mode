import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Download, FileText, TrendingUp, Award, BookOpen } from 'lucide-react';

interface StatsProps {
  lang: 'ar' | 'en';
}

export const Stats: React.FC<StatsProps> = ({ lang }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err: any) {
      console.error(err.message || 'Failed to fetch stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
    content += `- إجمالي التمارين المقترحة: ${stats.workoutStats.totalExercises}\n`;
    content += `- التمارين المكتملة المسجلة: ${stats.workoutStats.completedExercises}\n`;
    content += `- نسبة الالتزام الإجمالية: ${stats.workoutStats.completionRate.toFixed(1)}%\n\n`;

    content += `## 2. سجل تطور وزن الجسم:\n`;
    if (stats.weightHistory.length === 0) {
      content += `لا توجد أوزان مسجلة بعد.\n`;
    } else {
      stats.weightHistory.forEach((log: any) => {
        content += `- تاريخ: ${new Date(log.date).toLocaleDateString('ar-EG')} | الوزن: ${log.weight} كجم | ملاحظات: ${log.notes || 'لا يوجد'}\n`;
      });
    }
    content += `\n`;

    content += `## 3. مفكرة الملاحظات والتقدم:\n`;
    if (stats.notesHistory.length === 0) {
      content += `لا توجد ملاحظات مسجلة بعد.\n`;
    } else {
      stats.notesHistory.forEach((note: any) => {
        content += `- تاريخ: ${new Date(note.date).toLocaleDateString('ar-EG')} | النوع: ${note.type}\n  الملاحظة: ${note.text}\n\n`;
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
    html += `<p>نسبة الالتزام والامتثال للجدول الرياضي: <strong>${stats.workoutStats.completionRate.toFixed(1)}%</strong></p>`;
    html += `<p>إجمالي التمارين المكتملة: ${stats.workoutStats.completedExercises} من أصل ${stats.workoutStats.totalExercises}</p>`;

    html += `<h2>2. سجل تغير الوزن</h2>`;
    html += `<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">`;
    html += `<tr style="background-color: #f2f2f2;"><th>التاريخ</th><th>الوزن (كجم)</th><th>الملاحظة</th></tr>`;
    stats.weightHistory.forEach((log: any) => {
      html += `<tr><td>${new Date(log.date).toLocaleDateString('ar-EG')}</td><td>${log.weight}</td><td>${log.notes || ''}</td></tr>`;
    });
    html += `</table>`;

    html += `<h2>3. الملاحظات ومفكرة التقدم اليومي</h2>`;
    stats.notesHistory.forEach((note: any) => {
      html += `<div style="background-color: #f9f9f9; padding: 10px; margin-bottom: 10px; border-left: 3px solid #00d2ff;">`;
      html += `<p style="font-size: 11px; color: #666; margin: 0;">📅 ${new Date(note.date).toLocaleDateString('ar-EG')} - ${note.type}</p>`;
      html += `<p style="margin: 5px 0 0 0;">${note.text}</p>`;
      html += `</div>`;
    });

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
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>{lang === 'en' ? 'Stats & Analytics 📊' : 'الإحصاءات الشاملة وتقارير التقدم 📊'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            {lang === 'en' ? 'Analyze your commitment, weight change, and export health reports.' : 'حلل التزامك، وتغير وزنك، وقم بتصدير تقاريرك الطبية والرياضية'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }} className="no-print">
          <button onClick={exportToMD} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px' }}>
            <FileText size={16} />
            Markdown (MD)
          </button>
          <button onClick={exportToDoc} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px' }}>
            <Download size={16} />
            Word (Doc)
          </button>
          <button onClick={exportToPDF} className="glow-btn" style={{ padding: '8px 14px', fontSize: '13px' }}>
            {lang === 'en' ? 'Print Report (PDF)' : 'طباعة التقرير (PDF)'}
          </button>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>{lang === 'en' ? 'Compiling data...' : 'جاري تجميع وتحليل البيانات...'}</div>}

      {!loading && stats && (
        <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Weekly Commitment Calendar Tracker Row */}
          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, fontWeight: 'bold' }}>
              📅 {lang === 'en' ? 'Weekly Commitment Overview' : 'نظرة عامة على الالتزام الأسبوعي'}
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => {
                const arDays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
                const dayName = lang === 'en' ? day : arDays[idx];
                
                const hasLog = stats.workoutStats.strengthTrend?.some((log: any) => {
                  const d = new Date(log.date);
                  const jsDay = d.getDay();
                  const mapIdxToJsDay = [6, 0, 1, 2, 3, 4, 5];
                  return jsDay === mapIdxToJsDay[idx];
                });

                return (
                  <div 
                    key={day} 
                    style={{ 
                      flex: 1, 
                      minWidth: '60px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '6px', 
                      padding: '10px 4px', 
                      background: hasLog ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)', 
                      borderRadius: '10px', 
                      border: hasLog ? '1px solid var(--primary)' : '1px solid var(--border-color)', 
                      transition: 'all var(--transition-fast)' 
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dayName}</span>
                    <span style={{ fontSize: '16px' }}>{hasLog ? '✅' : '⚪'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top row: completion wheel, BMI Widget, and weight change */}
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
                {stats.workoutStats.completionRate.toFixed(0)}%
              </h1>
              <p style={{ fontSize: '13px' }}>
                {lang === 'en' 
                  ? `Completed ${stats.workoutStats.completedExercises} of ${stats.workoutStats.totalExercises} routine exercises.`
                  : `أكملت ${stats.workoutStats.completedExercises} من أصل ${stats.workoutStats.totalExercises} تمريناً مجدولاً.`}
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

            {/* Weight History Tracker (visual list/bar chart) */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <TrendingUp size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{lang === 'en' ? 'Body Weight Trend' : 'منحنى ومراقبة وزن الجسم'}</h3>
              </div>

              {stats.weightHistory.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                  {lang === 'en' ? 'No weight logs yet. Add your weight in Profile.' : 'لا يوجد سجل أوزان حتى الآن. أضف وزنك في صفحة الملف الشخصي.'}
                </p>
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

          <div className="grid-responsive" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
            
            {/* Completed Exercises Daily Graph */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '700' }}>
                {lang === 'en' ? 'Exercises Completed Daily (Last 7 Days)' : 'التمارين الرياضية المكتملة يومياً (آخر 7 أيام)'}
              </h3>
              
              {getCompletedExercisesByDay().length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                  {lang === 'en' ? 'No workout logs yet.' : 'لا يوجد سجل تمارين بعد.'}
                </p>
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

          </div>

          {/* Notes History Timeline */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <BookOpen size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{lang === 'en' ? 'Daily Notes & Achievements Log' : 'مفكرة الإنجاز والملاحظات اليومية'}</h3>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '5px' }}>
              {stats.notesHistory.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                  {lang === 'en' ? 'No notes logged yet.' : 'لا توجد ملاحظات مسجلة بعد.'}
                </p>
              ) : (
                stats.notesHistory.map((note: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      borderRight: '4px solid var(--primary)',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                      <span>📌 {note.type}</span>
                      <span>{new Date(note.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG')}</span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
