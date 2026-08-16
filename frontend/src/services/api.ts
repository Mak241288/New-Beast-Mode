const API_BASE_URL = 'http://localhost:5000/api';

// Helper to handle requests with token and safety timeout
const request = async (endpoint: string, options: RequestInit = {}, timeoutMs = 15000) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    let data: any = {};
    try {
      data = await response.json();
    } catch (parseErr) {
      data = {};
    }

    if (!response.ok) {
      const error = new Error(data.error || `خطأ في السيرفر (${response.status})، يرجى المحاولة لاحقاً`) as any;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      const timeoutError = new Error('استغرق الخادم وقتاً طويلاً للرد، تأكد من تشغيل السيرفر المحلي (Port 5000)') as any;
      timeoutError.status = 408;
      throw timeoutError;
    }
    if (err.message && err.message.includes('Failed to fetch')) {
      const networkError = new Error('تعذر الاتصال بالخادم، يرجى التأكد من تشغيل Backend Server على المنفذ 5000') as any;
      networkError.status = 503;
      throw networkError;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const api = {
  // Auth API
  register: (userData: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  googleAuth: (googleData: { email: string; name?: string; googleId?: string }) => 
    request('/auth/google', { method: 'POST', body: JSON.stringify(googleData) }),
  linkGoogleAccount: (data: { googleEmail: string; googleId?: string }) => 
    request('/auth/link-google', { method: 'POST', body: JSON.stringify(data) }),
  unlinkGoogleAccount: () => request('/auth/unlink-google', { method: 'POST' }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (profileData: any) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  updateAccountSecurity: (securityData: { currentPassword: string; newEmail?: string; newPassword?: string }) => 
    request('/auth/security', { method: 'PUT', body: JSON.stringify(securityData) }),
  requestPasswordResetOtp: (email: string) => request('/auth/forgot-password-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtpAndResetPassword: (data: { email: string; otp: string; newPassword: string }) => 
    request('/auth/verify-otp-reset-password', { method: 'POST', body: JSON.stringify(data) }),
  exportUserData: () => request('/auth/export-data'),
  deleteAccount: () => request('/auth/account', { method: 'DELETE' }),

  // Workout API
  generatePlan: (options: any) => request('/workout/generate', { method: 'POST', body: JSON.stringify(options) }),
  createManualPlan: (options: any) => request('/workout/manual', { method: 'POST', body: JSON.stringify(options) }),
  getActivePlan: () => request('/workout/active'),
  updateExercise: (id: number, data: any) => request(`/workout/exercise/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExercise: (id: number) => request(`/workout/exercise/${id}`, { method: 'DELETE' }),
  getAlternatives: (id: number) => request(`/workout/exercise/${id}/alternatives`),
  swapExerciseAI: (id: number, reason: string, lang: string) => request(`/workout/exercise/${id}/swap-ai`, { method: 'POST', body: JSON.stringify({ reason, lang }) }),
  addCustomExercise: (dayId: number, data: any) => request(`/workout/day/${dayId}/exercise`, { method: 'POST', body: JSON.stringify(data) }),
  logProgress: (exerciseId: number, logData: any) => request(`/workout/exercise/${exerciseId}/log`, { method: 'POST', body: JSON.stringify(logData) }),
  updateDayWorkout: (dayId: number, data: any) => request(`/workout/day/${dayId}`, { method: 'PUT', body: JSON.stringify(data) }),
  upgradePlan: (lang?: string) => request('/workout/upgrade', { method: 'POST', body: JSON.stringify({ lang }) }),
  importBulkPlan: (list: string, lang?: string, preview?: boolean) => request('/workout/import-bulk', { method: 'POST', body: JSON.stringify({ list, lang, preview }) }),
  importFilePlan: (fileBase64: string, fileName: string, lang?: string, preview?: boolean) => request('/workout/import-file', { method: 'POST', body: JSON.stringify({ fileBase64, fileName, lang, preview }) }),
  saveStructuredPlan: (structuredPlan: any, lang?: string) => request('/workout/import-bulk', { method: 'POST', body: JSON.stringify({ structuredPlan, lang }) }),
  getPlanHistory: () => request('/workout/history', { method: 'GET' }),
  activateHistoricalPlan: (id: number) => request(`/workout/${id}/activate`, { method: 'POST' }),
  renamePlan: (id: number, title: string) => request(`/workout/plan/${id}/rename`, { method: 'PUT', body: JSON.stringify({ title }) }),
  duplicatePlan: (id: number) => request(`/workout/plan/${id}/duplicate`, { method: 'POST' }),
  deletePlan: (id: number) => request(`/workout/plan/${id}`, { method: 'DELETE' }),
  getLibraryTree: () => request('/workout/library-tree', { method: 'GET' }),
  analyzePhysique: (data: any) => request('/workout/analyze-physique', { method: 'POST', body: JSON.stringify(data) }),


  // Stats API
  getStats: () => request('/stats'),
  getCheckInStatus: (force?: boolean) => request(`/stats/check-in-status${force ? '?force=true' : ''}`),
  submitCheckIn: (data: any) => request('/stats/check-in', { method: 'POST', body: JSON.stringify(data) }),
  applyCheckInSuggestions: () => request('/stats/check-in/apply', { method: 'POST' }),

  // Sync API
  syncExercises: (rapidApiKey?: string) => request('/sync/exercises', { method: 'POST', body: JSON.stringify({ rapidApiKey }) }),
  testPerformance: () => request('/sync/performance-test', { method: 'GET' }),
};
