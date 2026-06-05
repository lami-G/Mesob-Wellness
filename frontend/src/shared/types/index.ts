/* ========================================
   MESOB WELLNESS SYSTEM - TYPE DEFINITIONS
   Ethiopian Federal Healthcare Platform
   ======================================== */

// ========================================
// USER & AUTH TYPES
// ========================================

export type UserRole =
  | 'EXTERNAL_PATIENT'
  | 'STAFF'
  | 'NURSE_OFFICER'
  | 'MANAGER'
  | 'REGIONAL_OFFICE'
  | 'FEDERAL_OFFICE'
  | 'SYSTEM_ADMIN';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface User {
  id: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  userId: string;
  isExternal: boolean;
  canLogin: boolean;
  centerId: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  phone: string | null;
  profilePicture: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ========================================
// APPOINTMENT TYPES
// ========================================

export type AppointmentStatus =
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'IN_SERVICE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'PENDING'
  | 'CONFIRMED';

export interface Appointment {
  id: string;
  userId: string;
  scheduledAt: string;
  reason: string;
  status: AppointmentStatus;
  notes: string | null;
  diagnosis: string | null;
  prescription: string | null;
  confirmedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  reminderSentAt: string | null;
  reminderCount: number;
  lastReminderBy: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// ========================================
// VITAL RECORDS TYPES
// ========================================

export type BmiCategory = 'UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESITY';

export type BloodPressureCategory =
  | 'NORMAL'
  | 'ELEVATED'
  | 'HYPERTENSION_STAGE_1'
  | 'HYPERTENSION_STAGE_2'
  | 'HYPERTENSIVE_CRISIS';

export interface VitalRecord {
  id: string;
  userId: string;
  recordedBy: string;
  weightKg: number | null;
  heightCm: number | null;
  bmi: number | null;
  bmiCategory: BmiCategory | null;
  systolic: number | null;
  diastolic: number | null;
  bpCategory: BloodPressureCategory | null;
  heartRate: number | null;
  temperature: number | null;
  oxygenSaturation: number | null;
  glucose: number | null;
  glucoseType: string | null;
  notes: string | null;
  recordedAt: string;
  user?: User;
  recorder?: User;
}

// ========================================
// CENTER TYPES
// ========================================

export type CenterStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Center {
  id: string;
  name: string;
  code: string;
  region: string;
  city: string;
  address: string;
  phone: string | null;
  email: string | null;
  status: CenterStatus;
  capacity: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    staff: number;
  };
}

// ========================================
// NOTIFICATION TYPES
// ========================================

export type NotificationType =
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'SYSTEM_ALERT'
  | 'WELLNESS_TIP'
  | 'FEEDBACK_REQUEST'
  | 'USER_REGISTRATION'
  | 'DATA_ISSUE';

export type NotificationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  read: boolean; // Changed from isRead for consistency
  isRead?: boolean; // Keep for backward compatibility
  relatedEntityType?: 'appointment' | 'patient' | 'vital' | 'wellness' | 'user';
  relatedEntityId?: string;
  relatedId?: string | null; // Keep for backward compatibility
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
  updatedAt: string;
}

// ========================================
// FEEDBACK TYPES
// ========================================

export interface Feedback {
  id: string;
  userId: string;
  npsScore: number | null;
  serviceQuality: number | null;
  staffBehavior: number | null;
  cleanliness: number | null;
  waitTime: number | null;
  rating: number | null;
  comments: string | null;
  feedbackType: string | null;
  createdAt: string;
  user?: User;
}

// ========================================
// WELLNESS PLAN TYPES
// ========================================

export interface WellnessPlan {
  id: string;
  userId: string;
  planText: string;
  goals: string | null;
  duration: number | null;
  conditions: any | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// ========================================
// PATIENT CONDITION TYPES
// ========================================

export interface PatientCondition {
  id: string;
  patientId: string;
  conditions: any;
  calculatedAt: string;
  isNurseApproved: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: User;
  approver?: User;
}

// ========================================
// HEALTH PROFILE TYPES
// ========================================

export interface HealthProfile {
  id: string;
  userId: string;
  bloodType: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  medications: string | null;
  vitalsHistory: any | null;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// ANALYTICS TYPES
// ========================================

export interface AnalyticsData {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  activePatients: number;
  vitalRecords: number;
  averageRating: number | null;
}

export interface TrendData {
  date: string;
  appointments: number;
  patients: number;
  vitals: number;
}

export interface CenterAnalytics {
  centerId: string;
  centerName: string;
  totalStaff: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  vitalRecords: number;
  averageRating: number | null;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// ========================================
// FORM TYPES
// ========================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface FormErrors {
  [key: string]: string;
}

// ========================================
// UI COMPONENT TYPES
// ========================================

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// ========================================
// UTILITY TYPES
// ========================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
