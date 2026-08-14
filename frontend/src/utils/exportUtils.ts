/**
 * BeastMode AI - Export & Print Utilities
 */

/**
 * Downloads a string content as a downloadable file in the browser.
 */
export const downloadFile = (content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports a structured workout plan to a formatted CSV file.
 */
export const exportWorkoutPlanToCSV = (plan: any, lang: 'ar' | 'en' = 'ar'): void => {
  if (!plan || !plan.dayWorkouts) {
    alert(lang === 'en' ? 'No active workout plan to export.' : 'لا يوجد جدول تدريبي متاح للتصدير.');
    return;
  }

  const isEn = lang === 'en';
  const headers = isEn
    ? ['Day', 'Day Title', 'Focus Area', 'Exercise', 'Target Muscle', 'Category', 'Sets', 'Reps', 'Suggested Weight', 'Form Tips']
    : ['اليوم', 'عنوان اليوم', 'العضلات المستهدفة', 'اسم التمرين', 'العضلة المستهدفة', 'التصنيف', 'الجولات', 'التكرارات', 'الوزن المقترح', 'نصائح الأداء'];

  const rows: string[][] = [headers];

  const sanitize = (text: string | number | undefined | null) => {
    if (text === undefined || text === null) return '""';
    const str = String(text).replace(/"/g, '""');
    return `"${str}"`;
  };

  plan.dayWorkouts.forEach((day: any) => {
    const dayLabel = isEn ? `Day ${day.dayIndex}` : `اليوم ${day.dayIndex}`;
    const dayTitle = day.title || '';
    const focusArea = day.focusArea || '';

    if (day.isRestDay || !day.exercises || day.exercises.length === 0) {
      rows.push([
        sanitize(dayLabel),
        sanitize(dayTitle),
        sanitize(focusArea),
        sanitize(isEn ? 'Rest & Recovery Day' : 'يوم راحة واستشفاء'),
        '""', '""', '""', '""', '""',
        sanitize(day.dayTips || (isEn ? 'Active recovery' : 'استشفاء عضلي'))
      ]);
    } else {
      day.exercises.forEach((ex: any) => {
        rows.push([
          sanitize(dayLabel),
          sanitize(dayTitle),
          sanitize(focusArea),
          sanitize(ex.name),
          sanitize(ex.targetMuscle || '-'),
          sanitize(ex.category || '-'),
          sanitize(ex.sets || 3),
          sanitize(ex.reps || '10-12'),
          sanitize(ex.weight || '-'),
          sanitize(ex.exerciseTips || '-')
        ]);
      });
    }
  });

  // UTF-8 BOM for Arabic excel compatibility
  const BOM = '\uFEFF';
  const csvContent = BOM + rows.map(r => r.join(',')).join('\r\n');
  const filename = `BeastMode_Plan_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(csvContent, filename);
};

/**
 * Exports weight logs history to a clean CSV.
 */
export const exportWeightLogsToCSV = (logs: any[], lang: 'ar' | 'en' = 'ar'): void => {
  if (!logs || logs.length === 0) {
    alert(lang === 'en' ? 'No weight logs available to export.' : 'لا توجد سجلات أوزان للتصدير.');
    return;
  }

  const isEn = lang === 'en';
  const headers = isEn ? ['Date', 'Weight (kg)', 'Notes'] : ['التاريخ', 'الوزن (كجم)', 'ملاحظات'];
  const rows: string[][] = [headers];

  const sanitize = (text: string | number | undefined | null) => {
    if (text === undefined || text === null) return '""';
    return `"${String(text).replace(/"/g, '""')}"`;
  };

  logs.forEach((log) => {
    const dateStr = new Date(log.date).toLocaleDateString(isEn ? 'en-US' : 'ar-EG');
    rows.push([
      sanitize(dateStr),
      sanitize(log.weight),
      sanitize(log.notes || '-')
    ]);
  });

  const BOM = '\uFEFF';
  const csvContent = BOM + rows.map(r => r.join(',')).join('\r\n');
  const filename = `BeastMode_Weight_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(csvContent, filename);
};

/**
 * Downloads raw JSON data for user backup & portability.
 */
export const exportFullDataJSON = (data: any): void => {
  const jsonStr = JSON.stringify(data, null, 2);
  const filename = `beastmode-export-${new Date().toISOString().slice(0, 10)}.json`;
  downloadFile(jsonStr, filename, 'application/json;charset=utf-8;');
};

/**
 * Triggers standard browser print dialog.
 */
export const triggerPrint = (): void => {
  window.print();
};
