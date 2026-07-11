import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Download, FileText, TrendingUp, Award, BookOpen } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { translations } from '../utils/translations';

interface StatsProps {
  lang: 'ar' | 'en';
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Stats: React.FC<StatsProps> = ({ lang, onNavigate, onLogout }) => {
  const t = translations[lang] || translations.ar;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err: any) {
      console.error(err.message || 'فشل جلب الإحصاءات والتقارير.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Export to Markdown (.md)
  const exportToMD = () => {
    if (!stats) return;

    let content = `# تقرير إنجازات BeastMode الرياضية والغذائية\n\n`;
    content += `التاريخ: ${new Date().toLocaleDateString('ar-EG')}\n`;
    content += `--------------------------------------------------\n\n`;

    content += `## 1. الإحصاءات الرياضية:\n`;
    content += `- إجمالي التمارين المقترحة: ${stats.workoutStats.totalExercises}\n`;
    content += `- التمارين المكتملة المسجلة: ${stats.workoutStats.completedExercises}\n`;
    content += `- نسبة الالتزام الإجمالية: ${stats.workoutStats.completionRate.toFixed(1)}%\n\n`;

    content += `## 2. سجل تطور وزن الجسم:\n`;
    if (stats.weightHistory.length === 0) {
      content += `لا توجد أوزان مسجلة بعد.\n`;
    } else {
      stats.weightHistory.forEach((log: any) => {
        content += `- تاريخ: ${new Date(log.date).toLocaleDateString('ar-EG')} | الوزن: ${log.weight} كجم | الملاحظة: ${log.notes || 'بدون ملاحظات'}\n`;
      });
    }
    content += `\n`;

    content += `## 3. سجل السعرات الحرارية والتغذية (آخر 7 أيام):\n`;
    if (stats.nutritionStats.length === 0) {
      content += `لا يوجد سجل تغذية بعد.\n`;
    } else {
      stats.nutritionStats.forEach((n: any) => {
        content += `- تاريخ: ${new Date(n.date).toLocaleDateString('ar-EG')} | السعرات المستهلكة: ${n.caloriesLogged} / ${n.caloriesGoal} سعرة | المياه: ${n.waterLoggedMl} مل\n`;
      });
    }
    content += `\n`;

    content += `## 4. مفكرة الملاحظات والتقدم:\n`;
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

  // Export to Microsoft Word (.doc) via HTML blob
  const exportToDoc = () => {
    if (!stats) return;

    let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>`;
    html += `<head><title>تقرير BeastMode</title><meta charset="utf-8"></head>`;
    html += `<body style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">`;
    html += `<h1 style="color: #059669; text-align: center;">تقرير إنجازات BeastMode الرياضية والغذائية</h1>`;
    html += `<p style="text-align: center; color: #666;">تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}</p>`;
    html += `<hr/>`;

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
      html += `<div style="background-color: #f9f9f9; padding: 10px; margin-bottom: 10px; border-left: 3px solid #059669;">`;
      html += `<strong>${new Date(note.date).toLocaleDateString('ar-EG')} - ${note.type}</strong>`;
      html += `<p>${note.text}</p>`;
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

  // Export to PDF (Print style trigger)
  const exportToPDF = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Navigation Header */}
      <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderRadius: '0 0 20px 20px', borderTop: 'none' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          BEASTMODE
        </h2>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => onNavigate('dashboard')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.workout}</button>
          <button onClick={() => onNavigate('nutrition')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.nutrition}</button>
          <button onClick={() => onNavigate('stats')} className="glow-btn" style={{ padding: '8px 16px' }}>{t.stats}</button>
          <button onClick={() => onNavigate('chat')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.consultation}</button>
          <button onClick={() => onNavigate('profile')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.profile}</button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle />
          <button onClick={onLogout} className="secondary-btn" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>{t.logout}</button>
        </div>
      </header>

      <main className="container print-area">
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '22px' }}>الإحصاءات الشاملة وتقارير التقدم 📊</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>حلل التزامك، وتغير وزنك، وقم بتصدير تقاريرك الطبية والرياضية</p>
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
              طباعة التقرير (PDF)
            </button>
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>جاري تجميع وتحليل البيانات...</div>}

        {!loading && stats && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top row: completion wheel & weight change */}
            <div className="grid-responsive" style={{ gridTemplateColumns: '1fr 2fr' }}>
              
              {/* Workout Completion Widget */}
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '50%', marginBottom: '16px' }}>
                  <Award size={32} color="var(--primary)" />
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>معدل إتمام تمارين الجدول النشط</span>
                <h1 style={{ fontSize: '48px', color: 'var(--primary)', margin: '10px 0' }}>
                  {stats.workoutStats.completionRate.toFixed(0)}%
                </h1>
                <p style={{ fontSize: '13px' }}>
                  أكملت <strong>{stats.workoutStats.completedExercises}</strong> من أصل <strong>{stats.workoutStats.totalExercises}</strong> تمريناً مجدولاً.
                </p>
              </div>

              {/* Weight History Tracker (visual list/bar chart) */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <TrendingUp size={20} color="var(--secondary)" />
                  <h3 style={{ fontSize: '18px' }}>منحنى ومراقبة وزن الجسم</h3>
                </div>

                {stats.weightHistory.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>لا يوجد سجل أوزان حتى الآن. أضف وزنك في صفحة الملف الشخصي.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Visual Bar Graph (Pure CSS) */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
                      {stats.weightHistory.slice(-10).map((log: any, idx: number) => {
                        // Calculate percentage height compared to max weight in the history
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
                                boxShadow: idx === stats.weightHistory.slice(-10).length - 1 ? '0 0 10px var(--secondary-glow)' : 'none',
                              }}
                            />
                            <span style={{ fontSize: '8px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {new Date(log.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Weight Logs List */}
                    <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {stats.weightHistory.slice().reverse().map((log: any) => (
                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                          <span>📅 {new Date(log.date).toLocaleDateString('ar-EG')}</span>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{log.weight} كجم</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{log.notes || ''}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* Bottom row: Calories Intake & Notes Timeline */}
            <div className="grid-responsive" style={{ gridTemplateColumns: '1fr 1fr' }}>
              
              {/* Calories History */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>موازنة السعرات للوجبات (آخر 7 أيام)</h3>
                
                {stats.nutritionStats.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>لا يوجد سجل تغذية بعد.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {stats.nutritionStats.map((day: any) => {
                      const calPct = Math.min((day.caloriesLogged / day.caloriesGoal) * 100, 100);
                      return (
                        <div key={day.date} style={{ fontSize: '13px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>📅 {new Date(day.date).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'numeric' })}</span>
                            <span style={{ fontWeight: 'bold' }}>{day.caloriesLogged} / {day.caloriesGoal} سعرة</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${calPct}%`, height: '100%', background: calPct > 90 ? 'var(--primary)' : 'var(--secondary)', borderRadius: '3px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes History Timeline */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <BookOpen size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '16px' }}>مفكرة الإنجاز والملاحظات اليومية</h3>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '5px' }}>
                  {stats.notesHistory.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>لا توجد ملاحظات مسجلة بعد.</p>
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
                          <span>{new Date(note.date).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <p style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>{note.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
};
