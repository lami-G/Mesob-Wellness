/* ========================================
   API RESPONSE TYPES
   Ethiopian Federal Healthcare Platform
   ======================================== */

import type {
  User,
  Appointment,
  VitalRecord,
  Center,
  Notification,
  Feedback,
  WellnessPlan,
  PatientCondition,
  HealthProfile,
} from './index';

// ========================================
// GENERIC API RESPONSES
// ========================================

export interface ApiSuccessResponse<T = any> {
  status: 'success';
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  status: 'error';
  error: string;
  message?: string;
  details?: any;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ========================================
// PAGINATION
// ========================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ========================================
// AUTH API
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
}

// ========================================
// APPOINTMENTS API
// ========================================

export interface CreateAppointmentRequest {
  userId: string;
  scheduledAt: string;
  reason: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  status?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  cancellationReason?: string;
}

export interface AppointmentsListResponse {
  appointments: Appointment[];
  total: number;
}

export interface QueueResponse {
  queue: Appointment[];
  capacity: {
    total: number;
    used: number;
    available: number;
  };
}

// ========================================
// VITALS API
// ========================================

export interface CreateVitalRequest {
  userId: string;
  weightKg?: number;
  heightCm?: number;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  glucose?: number;
  glucoseType?: string;
  notes?: string;
}

export interface VitalsListResponse {
  vitals: VitalRecord[];
  total: number;
}

// ========================================
// USERS API
// ========================================

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: string;
  centerId?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  role?: string;
  centerId?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  isActive?: boolean;
  profilePicture?: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
}

// ========================================
// CENTERS API
// ========================================

export interface CreateCenterRequest {
  name: string;
  code: string;
  region: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  capacity?: number;
}

export interface UpdateCenterRequest {
  name?: string;
  region?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
  capacity?: number;
}

export interface CentersListResponse {
  centers: Center[];
  total: number;
}

// ========================================
// NOTIFICATIONS API
// ========================================

export interface NotificationFilters {
  type?: 'all' | 'appointment' | 'vital' | 'wellness' | 'patient' | 'system' | 'alert';
  severity?: 'all' | 'low' | 'medium' | 'high' | 'critical';
  status?: 'all' | 'unread' | 'read';
  dateRange?: 'all' | 'today' | 'week' | 'month';
}

export interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  critical: number;
}

export interface NotificationsListResponse {
  notifications: Notification[];
  stats: NotificationStats;
  unreadCount: number;
  total: number;
}

// ========================================
// FEEDBACK API
// ========================================

export interface CreateFeedbackRequest {
  userId: string;
  npsScore?: number;
  serviceQuality?: number;
  staffBehavior?: number;
  cleanliness?: number;
  waitTime?: number;
  rating?: number;
  comments?: string;
  feedbackType?: string;
}

export interface FeedbackListResponse {
  feedback: Feedback[];
  total: number;
  averageRating: number;
}

// ========================================
// WELLNESS PLANS API
// ========================================

export interface CreateWellnessPlanRequest {
  userId: string;
  planText: string;
  goals?: string;
  duration?: number;
  conditions?: any;
}

export interface WellnessPlansListResponse {
  plans: WellnessPlan[];
  total: number;
}

// ========================================
// ANALYTICS API
// ========================================

export interface AnalyticsSummary {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  noShowAppointments: number;
  totalUsers: number;
  activeUsers: number;
  totalVitals: number;
  averageRating: number | null;
}

export interface CapacityInfo {
  dailyLimit: number;
  slotsUsed: number;
  slotsAvailable: number;
  utilizationPercentage: number;
}

export interface BookingStats {
  totalAppointments: number;
  totalAllTime: number;
  completedToday: number;
  pendingToday: number;
  inProgressToday: number;
  cancelledToday: number;
  noShowToday: number;
  noShowRate: number;
  averageServiceTime: number;
  totalUsers: number;
  activeUsers: number;
}

export interface QueueAnalytics {
  waiting: number;
  inProgress: number;
  inService: number;
  completed: number;
  averageWaitTime: number;
  longestWaitTime: number;
}

export interface HealthAnalytics {
  totalPatients: number;
  totalVitals: number;
  bpRiskDistribution: {
    normal: number;
    elevated: number;
    stage1: number;
    stage2: number;
    crisis: number;
  };
  bmiDistribution: {
    underweight: number;
    normal: number;
    overweight: number;
    obese: number;
  };
  averageBMI: number;
  averageBP: {
    systolic: number;
    diastolic: number;
  };
}

export interface TrendData {
  date: string;
  appointments: number;
  completed: number;
  cancelled: number;
  noShow: number;
  vitals: number;
}

export interface TrendsResponse {
  daily: TrendData[];
  weekly: TrendData[];
  monthly: TrendData[];
}

// ========================================
// REGIONAL/MANAGER ANALYTICS
// ========================================

export interface CenterAnalytics {
  centerId: string;
  centerName: string;
  totalStaff: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  totalVitals: number;
  averageRating: number | null;
  capacity: {
    total: number;
    used: number;
    available: number;
  };
}

export interface RegionalDashboardData {
  analytics: {
    summary: AnalyticsSummary;
    centers: CenterAnalytics[];
  };
  centers: Center[];
}

// ========================================
// PATIENT CONDITIONS API
// ========================================

export interface PatientConditionsResponse {
  conditions: PatientCondition[];
  total: number;
}

// ========================================
// SYSTEM SETTINGS
// ========================================

export interface SystemSettings {
  dailySlotLimit: number;
  appointmentIntervalMinutes: number;
  walkInEnabled: boolean;
  autoConfirmBookings: boolean;
  maintenanceMode?: boolean;
}

export interface UpdateSystemSettingsRequest {
  dailySlotLimit?: number;
  appointmentIntervalMinutes?: number;
  walkInEnabled?: boolean;
  autoConfirmBookings?: boolean;
  maintenanceMode?: boolean;
}

// ========================================
// AUDIT LOGS
// ========================================

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: User;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

// ========================================
// REPORTS
// ========================================

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  centerId?: string;
  reportType?: string;
}

export interface ReportData {
  type: string;
  generatedAt: string;
  data: any;
  summary: any;
}
