// Authentication
export const ACCESS_TOKEN = 'access_token';
export const REFRESH_TOKEN = 'refresh_token';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/learning';
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;

// Language Levels
export const LANGUAGE_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Task Types
export const TASK_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  DIALOGUE: 'dialogue',
  FREE_TEXT: 'free_text',
  MATCHING: 'matching',
  FILL_BLANK: 'fill_blank',
};

// Completion Status
export const COMPLETION_STATUS = {
  COMPLETED: 'completed',
  FAILED: 'failed',
  PARTIAL: 'partial',
  IN_PROGRESS: 'in_progress',
};

// Test Types
export const TEST_TYPES = {
  INITIAL: 'initial',
  PERIODIC: 'periodic',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'user_profile',
  ACTIVE_TEST: 'active_test',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  LESSONS: '/lessons',
  LESSON_DETAIL: '/lessons/:id',
  PRACTICE: '/practice',
  LEVEL_TEST: '/level-test',
  DASHBOARD: '/dashboard',
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  REGISTER: '/registration/',
  LOGIN: '/token/',
  REFRESH_TOKEN: '/token/refresh/',

  // User
  PROFILE: '/profile/',
  PROGRESS: '/user/progress/',
  EXPERIENCE: '/experience/',

  // Tasks
  TASKS: '/tasks/',
  TASK_START: '/tasks/start/',
  TASK_SUBMIT: '/tasks/submit/',
  TASK_FEEDBACK: '/tasks/feedback/',

  // Level Test
  LEVEL_TEST: '/level-test/',

  // Recommendations
  RECOMMENDATIONS: '/recommendations/',
  AI_RECOMMENDATIONS: '/ai/recommendations/',

  // Ratings
  RATINGS: '/ratings/',

  // Lessons
  LESSONS: '/lessons/',

  // Health
  HEALTH: '/health/',
};

// Rate Limits (requests per minute)
export const RATE_LIMITS = {
  AI_GENERATE_TASK: 10,
  AI_SUBMIT_TASK: 20,
  AI_RECOMMENDATIONS: 10,
  LEVEL_TEST: 3,
  RATINGS: 60,
  DEFAULT: 120,
};
