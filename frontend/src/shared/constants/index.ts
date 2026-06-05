/* ========================================
   MESOB WELLNESS SYSTEM - CONSTANTS
   Ethiopian Federal Healthcare Platform
   ======================================== */

import type { UserRole, AppointmentStatus, NotificationType } from '@/types';

// ========================================
// USER ROLES
// ========================================

export const USER_ROLES: Record<UserRole, string> = {
  EXTERNAL_PATIENT: 'External Patient',
  STAFF: 'Staff',
  NURSE_OFFICER: 'Nurse Officer',
  MANAGER: 'Manager',
  REGIONAL_OFFICE: 'Regional Office',
  FEDERAL_OFFICE: 'Federal Office',
  SYSTEM_ADMIN: 'System Administrator',
};

export const ROLE_HIERARCHY: UserRole[] = [
  'EXTERNAL_PATIENT',
  'STAFF',
  'NURSE_OFFICER',
  'MANAGER',
  'REGIONAL_OFFICE',
  'FEDERAL_OFFICE',
  'SYSTEM_ADMIN',
];

// ========================================
// APPOINTMENT STATUSES
// ========================================

export const APPOINTMENT_STATUSES: Record<AppointmentStatus, string> = {
  WAITING: 'Waiting',
  IN_PROGRESS: 'In Progress',
  IN_SERVICE: 'In Service',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  WAITING: 'warning',
  IN_PROGRESS: 'info',
  IN_SERVICE: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'danger',
  PENDING: 'neutral',
  CONFIRMED: 'success',
};

// ========================================
// NOTIFICATION TYPES
// ========================================

export const NOTIFICATION_TYPES: Record<NotificationType, string> = {
  APPOINTMENT_REMINDER: 'Appointment Reminder',
  APPOINTMENT_CONFIRMED: 'Appointment Confirmed',
  APPOINTMENT_CANCELLED: 'Appointment Cancelled',
  SYSTEM_ALERT: 'System Alert',
  WELLNESS_TIP: 'Wellness Tip',
  FEEDBACK_REQUEST: 'Feedback Request',
  USER_REGISTRATION: 'User Registration',
  DATA_ISSUE: 'Data Issue',
};

// ========================================
// VITAL SIGNS RANGES
// ========================================

export const VITAL_RANGES = {
  bloodPressure: {
    systolic: { min: 90, max: 180, normal: { min: 90, max: 120 } },
    diastolic: { min: 60, max: 120, normal: { min: 60, max: 80 } },
  },
  heartRate: {
    min: 40,
    max: 200,
    normal: { min: 60, max: 100 },
  },
  temperature: {
    min: 35,
    max: 42,
    normal: { min: 36.1, max: 37.2 },
  },
  oxygenSaturation: {
    min: 70,
    max: 100,
    normal: { min: 95, max: 100 },
  },
  glucose: {
    min: 50,
    max: 400,
    fasting: { min: 70, max: 100 },
    random: { min: 70, max: 140 },
  },
  bmi: {
    underweight: { max: 18.5 },
    normal: { min: 18.5, max: 24.9 },
    overweight: { min: 25, max: 29.9 },
    obese: { min: 30 },
  },
};

// ========================================
// DATE FORMATS
// ========================================

export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  displayWithTime: 'MMM dd, yyyy HH:mm',
  input: 'yyyy-MM-dd',
  inputWithTime: "yyyy-MM-dd'T'HH:mm",
  api: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  time: 'HH:mm',
  timeWithSeconds: 'HH:mm:ss',
};

// ========================================
// PAGINATION
// ========================================

export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
};

// ========================================
// API ENDPOINTS
// ========================================

export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
    refresh: '/api/v1/auth/refresh',
  },
  users: {
    list: '/api/v1/users',
    detail: (id: string) => `/api/v1/users/${id}`,
    create: '/api/v1/users',
    update: (id: string) => `/api/v1/users/${id}`,
    delete: (id: string) => `/api/v1/users/${id}`,
  },
  appointments: {
    list: '/api/v1/appointments',
    detail: (id: string) => `/api/v1/appointments/${id}`,
    create: '/api/v1/appointments',
    update: (id: string) => `/api/v1/appointments/${id}`,
    queue: '/api/v1/appointments/queue',
  },
  vitals: {
    list: '/api/v1/vitals',
    detail: (id: string) => `/api/v1/vitals/${id}`,
    create: '/api/v1/vitals',
    all: '/api/v1/vitals/all',
  },
  centers: {
    list: '/api/v1/centers',
    detail: (id: string) => `/api/v1/centers/${id}`,
    analytics: '/api/v1/centers/analytics/all',
  },
  notifications: {
    list: '/api/v1/notifications',
    unreadCount: '/api/v1/notifications/unread-count',
    markRead: (id: string) => `/api/v1/notifications/${id}/read`,
  },
  analytics: {
    trends: '/api/v1/analytics/trends',
    capacity: '/api/v1/analytics/capacity',
  },
};

// ========================================
// LOCAL STORAGE KEYS
// ========================================

export const STORAGE_KEYS = {
  authToken: 'mesob_auth_token',
  user: 'mesob_user',
  theme: 'mesob_theme',
  language: 'mesob_language',
  sidebarCollapsed: 'mesob_sidebar_collapsed',
};

// ========================================
// VALIDATION RULES
// ========================================

export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    message: 'Please enter a valid phone number',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  },
};

// ========================================
// ETHIOPIAN REGIONS
// ========================================

export const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'Somali',
  'Southern Nations, Nationalities, and Peoples',
  'South West Ethiopia Peoples',
  'Tigray',
] as const;

export type EthiopianRegion = (typeof ETHIOPIAN_REGIONS)[number];

// ========================================
// BLOOD TYPES
// ========================================

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export type BloodType = (typeof BLOOD_TYPES)[number];

// ========================================
// GENDER OPTIONS
// ========================================

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
] as const;

// ========================================
// GLUCOSE TYPES
// ========================================

export const GLUCOSE_TYPES = [
  { value: 'fasting', label: 'Fasting' },
  { value: 'random', label: 'Random' },
  { value: 'post_meal', label: 'Post Meal' },
] as const;

// ========================================
// TIME PERIODS
// ========================================

export const TIME_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
] as const;

// ========================================
// CHART COLORS
// ========================================

export const CHART_COLORS = {
  primary: '#2347A6',
  secondary: '#1B3784',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  teal: '#14B8A6',
  gold: '#F59E0B',
  purple: '#8B5CF6',
  gray: '#64748B',
};

// ========================================
// FEATURE FLAGS
// ========================================

export const FEATURES = {
  enableNotifications: true,
  enableAnalytics: true,
  enableFeedback: true,
  enableWellnessPlans: true,
  enablePatientConditions: true,
  enableSMSReminders: false, // Not yet implemented
  enableEmailNotifications: false, // Not yet implemented
  enableDarkMode: false, // Not yet implemented
};

// ========================================
// SYSTEM SETTINGS
// ========================================

export const SYSTEM = {
  appName: 'MESOB Wellness System',
  appVersion: '1.0.0',
  appDescription: 'Ethiopian Federal Healthcare Management Platform',
  organization: 'Federal Democratic Republic of Ethiopia',
  supportEmail: 'support@mesob.gov.et',
  supportPhone: '+251-11-XXX-XXXX',
};
