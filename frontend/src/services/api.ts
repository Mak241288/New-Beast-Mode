const API_BASE_URL = 'http://localhost:5000/api';

// Helper to handle requests with token
const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'شيء ما غير صحيح');
  }

  return data;
};

export const api = {
  // Auth API
  register: (userData: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (profileData: any) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Workout API
  generatePlan: (options: any) => request('/workout/generate', { method: 'POST', body: JSON.stringify(options) }),
  createManualPlan: (options: any) => request('/workout/manual', { method: 'POST', body: JSON.stringify(options) }),
  getActivePlan: () => request('/workout/active'),
  updateExercise: (id: number, data: any) => request(`/workout/exercise/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExercise: (id: number) => request(`/workout/exercise/${id}`, { method: 'DELETE' }),
  addCustomExercise: (dayId: number, data: any) => request(`/workout/day/${dayId}/exercise`, { method: 'POST', body: JSON.stringify(data) }),
  logProgress: (exerciseId: number, logData: any) => request(`/workout/exercise/${exerciseId}/log`, { method: 'POST', body: JSON.stringify(logData) }),
  updateDayWorkout: (dayId: number, data: any) => request(`/workout/day/${dayId}`, { method: 'PUT', body: JSON.stringify(data) }),
  upgradePlan: (lang?: string) => request('/workout/upgrade', { method: 'POST', body: JSON.stringify({ lang }) }),
  importBulkPlan: (list: string, lang?: string) => request('/workout/import-bulk', { method: 'POST', body: JSON.stringify({ list, lang }) }),
  getPlanHistory: () => request('/workout/history', { method: 'GET' }),
  activateHistoricalPlan: (id: number) => request(`/workout/${id}/activate`, { method: 'POST' }),
  getLibraryTree: () => request('/workout/library-tree', { method: 'GET' }),

  // Nutrition API
  getNutritionPlan: (date: string) => request(`/nutrition/day?date=${date}`),
  logMealText: (mealData: any) => request('/nutrition/meal/text', { method: 'POST', body: JSON.stringify(mealData) }),
  logMealManual: (mealData: any) => request('/nutrition/meal/manual', { method: 'POST', body: JSON.stringify(mealData) }),
  deleteMealLog: (id: number) => request(`/nutrition/meal/${id}`, { method: 'DELETE' }),
  logWater: (waterData: any) => request('/nutrition/water', { method: 'POST', body: JSON.stringify(waterData) }),

  // Chat API
  getChatHistory: () => request('/chat/history'),
  sendChatMessage: (messageData: any) => request('/chat/message', { method: 'POST', body: JSON.stringify(messageData) }),

  // Stats API
  getStats: () => request('/stats'),

  // Sync API
  syncExercises: (rapidApiKey?: string) => request('/sync/exercises', { method: 'POST', body: JSON.stringify({ rapidApiKey }) }),
  testPerformance: () => request('/sync/performance-test', { method: 'GET' }),
};
