import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env';
import {
  sendWelcomeEmail,
  sendPasswordChangedNotification,
  sendAppointmentReminder,
  sendWellnessPlanEmail,
  sendVitalsEmail,
  sendReferralLetterEmail,
} from './email.service';

/**
 * Determine Redis connectivity settings
 */
const isLocal = ['localhost', '127.0.0.1'].includes((env.REDIS_HOST || '').toLowerCase());
const shouldUseTls = env.REDIS_TLS !== undefined ? env.REDIS_TLS : (!isLocal && Boolean(env.REDIS_HOST && !env.REDIS_HOST.startsWith('192.168.')));
const isRedisConfigured = Boolean(
  env.REDIS_ENABLED &&
  env.REDIS_HOST &&
  env.REDIS_HOST !== 'none' &&
  env.REDIS_HOST !== 'disabled'
);

let connection: Redis | null = null;
export let emailQueue: Queue | null = null;
let isRedisAvailable = false;
let hasReportedUnavailable = false;

if (isRedisConfigured) {
  try {
    const redisOptions: any = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 5000,
      lazyConnect: false,
      retryStrategy(times: number) {
        if (times > 2) {
          if (!hasReportedUnavailable) {
            hasReportedUnavailable = true;
            console.warn(`⚠️ Redis is unavailable at ${env.REDIS_HOST}. Background email queue switched to direct delivery mode.`);
          }
          return null; // Stop retrying to prevent continuous error spam
        }
        return Math.min(times * 300, 1500);
      },
      reconnectOnError() {
        return false;
      },
    };

    if (shouldUseTls) {
      redisOptions.tls = { rejectUnauthorized: false };
    }

    connection = new Redis(redisOptions);

    connection.on('connect', () => {
      isRedisAvailable = true;
      hasReportedUnavailable = false;
      console.log('✅ Redis connected successfully');
    });

    connection.on('error', (err: any) => {
      isRedisAvailable = false;
      if (!hasReportedUnavailable) {
        hasReportedUnavailable = true;
        console.warn(`⚠️ Redis connection notice: ${err.message}. Email queue is operating in direct-dispatch fallback mode.`);
      }
    });

    emailQueue = new Queue('emails', {
      connection: redisOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
        },
      },
    });

    emailQueue.on('error', (error: any) => {
      isRedisAvailable = false;
      if (!hasReportedUnavailable) {
        hasReportedUnavailable = true;
        console.warn(`⚠️ Email queue error: ${error.message}. Direct email dispatch active.`);
      }
    });
  } catch (initErr) {
    console.warn('⚠️ Could not initialize Redis queue. Direct email fallback enabled.');
  }
} else {
  console.log('ℹ️ Redis is disabled. All emails will be sent directly via Resend.');
}

/**
 * Queue Types - defines the structure of email job data
 */
export interface WelcomeEmailData {
  recipientEmail: string;
  fullName: string;
  username: string;
  temporaryPassword: string;
  role: string;
}

export interface PasswordChangedEmailData {
  recipientEmail: string;
  fullName: string;
  changedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AppointmentReminderData {
  appointmentId: string;
  recipientEmail: string;
  customerName: string;
  scheduledAt: string;
  reason: string;
}

export interface WellnessPlanEmailData {
  recipientEmail: string;
  patientName: string;
  planTitle: string;
  planContent: {
    nutritionRecommendations?: string;
    exerciseRecommendations?: string;
    stressManagementAdvice?: string;
    goals?: string;
    duration?: number;
  };
  vitalsData?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    glucose?: number;
    glucoseType?: string;
    recordedAt?: Date;
  };
}

export interface VitalsEmailData {
  recipientEmail: string;
  patientName: string;
  vitalsData: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    glucose?: number;
    glucoseType?: string;
    recordedAt: Date;
  };
}

export interface ReferralLetterEmailData {
  recipientEmail: string;
  referralData: {
    patientName: string;
    patientId: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    destinationFacility: string;
    destinationFacilityType?: string;
    destinationAddress?: string;
    destinationPhone?: string;
    reason: string;
    urgency: string;
    specialistType?: string;
    diagnosis?: string;
    clinicalSummary?: string;
    medications?: string;
    vitalSigns?: string;
    labResults?: string;
    imagingResults?: string;
    appointmentDate?: Date;
    followUpRequired?: boolean;
    followUpNotes?: string;
    notes?: string;
    referralDate: Date;
    referringFacility: string;
    referringDoctorName: string;
  };
}

/**
 * 1. Queue Welcome Email (User Registration)
 * Falls back to direct email sending if queue is offline
 */
export async function queueWelcomeEmail(data: WelcomeEmailData): Promise<string> {
  if (isRedisAvailable && emailQueue) {
    try {
      const job = await emailQueue.add('welcome-email', data, { priority: 2 });
      console.log(`📧 Welcome email queued for ${data.recipientEmail} (Job ID: ${job.id})`);
      return job.id || 'queued';
    } catch (error) {
      console.warn('⚠️ Failed to enqueue welcome email, sending directly:', error);
    }
  }

  try {
    const success = await sendWelcomeEmail(
      data.recipientEmail,
      data.fullName,
      data.username,
      data.temporaryPassword,
      data.role
    );
    console.log(`📧 Welcome email dispatched directly to ${data.recipientEmail} (Success: ${success})`);
    return 'direct-dispatch';
  } catch (error) {
    console.error('❌ Direct welcome email failed:', error);
    return 'fallback-failed';
  }
}

/**
 * 2. Queue Password Changed Notification
 * Falls back to direct email sending if queue is offline
 */
export async function queuePasswordChangedEmail(data: PasswordChangedEmailData): Promise<string> {
  if (isRedisAvailable && emailQueue) {
    try {
      const job = await emailQueue.add('password-changed', data, { priority: 1 });
      console.log(`📧 Password changed notification queued for ${data.recipientEmail} (Job ID: ${job.id})`);
      return job.id || 'queued';
    } catch (error) {
      console.warn('⚠️ Failed to enqueue password changed email, sending directly:', error);
    }
  }

  try {
    const success = await sendPasswordChangedNotification(
      data.recipientEmail,
      data.fullName,
      data.changedAt,
      data.ipAddress,
      data.userAgent
    );
    console.log(`📧 Password changed email dispatched directly to ${data.recipientEmail} (Success: ${success})`);
    return 'direct-dispatch';
  } catch (error) {
    console.error('❌ Direct password changed email failed:', error);
    return 'fallback-failed';
  }
}

/**
 * 3. Queue Appointment Reminder
 * Falls back to direct email sending if queue is offline
 */
export async function queueAppointmentReminder(data: AppointmentReminderData): Promise<string> {
  if (isRedisAvailable && emailQueue) {
    try {
      const job = await emailQueue.add('appointment-reminder', data, { priority: 1 });
      console.log(`📧 Appointment reminder queued for ${data.recipientEmail} (Job ID: ${job.id})`);
      return job.id || 'queued';
    } catch (error) {
      console.warn('⚠️ Failed to enqueue appointment reminder, sending directly:', error);
    }
  }

  try {
    const success = await sendAppointmentReminder(
      data.recipientEmail,
      data.customerName,
      data.appointmentId,
      data.scheduledAt,
      data.reason
    );
    console.log(`📧 Appointment reminder dispatched directly to ${data.recipientEmail} (Success: ${success})`);
    return 'direct-dispatch';
  } catch (error) {
    console.error('❌ Direct appointment reminder failed:', error);
    return 'fallback-failed';
  }
}

/**
 * 4. Queue Wellness Plan Email with PDF
 * Falls back to direct email sending if queue is offline
 */
export async function queueWellnessPlan(data: WellnessPlanEmailData): Promise<string> {
  if (isRedisAvailable && emailQueue) {
    try {
      const job = await emailQueue.add('wellness-plan', data, { priority: 3 });
      console.log(`📧 Wellness plan email queued for ${data.recipientEmail} (Job ID: ${job.id})`);
      return job.id || 'queued';
    } catch (error) {
      console.warn('⚠️ Failed to enqueue wellness plan email, sending directly:', error);
    }
  }

  try {
    const success = await sendWellnessPlanEmail(
      data.recipientEmail,
      data.patientName,
      data.planTitle,
      data.planContent,
      data.vitalsData
    );
    console.log(`📧 Wellness plan email dispatched directly to ${data.recipientEmail} (Success: ${success})`);
    return 'direct-dispatch';
  } catch (error) {
    console.error('❌ Direct wellness plan email failed:', error);
    return 'fallback-failed';
  }
}

/**
 * 5. Queue Vitals Record Email
 * Falls back to direct email sending if queue is offline
 */
export async function queueVitalsEmail(data: VitalsEmailData): Promise<string> {
  if (isRedisAvailable && emailQueue) {
    try {
      const job = await emailQueue.add('vitals-email', data, { priority: 3 });
      console.log(`📧 Vitals email queued for ${data.recipientEmail} (Job ID: ${job.id})`);
      return job.id || 'queued';
    } catch (error) {
      console.warn('⚠️ Failed to enqueue vitals email, sending directly:', error);
    }
  }

  try {
    const success = await sendVitalsEmail(
      data.recipientEmail,
      data.patientName,
      data.vitalsData
    );
    console.log(`📧 Vitals email dispatched directly to ${data.recipientEmail} (Success: ${success})`);
    return 'direct-dispatch';
  } catch (error) {
    console.error('❌ Direct vitals email failed:', error);
    return 'fallback-failed';
  }
}

/**
 * 6. Queue Referral Letter Email
 * Falls back to direct email sending if queue is offline
 */
export async function queueReferralLetterEmail(data: ReferralLetterEmailData): Promise<string> {
  if (isRedisAvailable && emailQueue) {
    try {
      const job = await emailQueue.add('referral-letter', data, { priority: 1 });
      console.log(`📧 Referral letter email queued for ${data.recipientEmail} (Job ID: ${job.id})`);
      return job.id || 'queued';
    } catch (error) {
      console.warn('⚠️ Failed to enqueue referral letter email, sending directly:', error);
    }
  }

  try {
    const success = await sendReferralLetterEmail(
      data.recipientEmail,
      data.referralData
    );
    console.log(`📧 Referral letter dispatched directly to ${data.recipientEmail} (Success: ${success})`);
    return 'direct-dispatch';
  } catch (error) {
    console.error('❌ Direct referral letter email failed:', error);
    return 'fallback-failed';
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  if (!emailQueue || !isRedisAvailable) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      total: 0,
      status: 'offline-direct-mode',
    };
  }

  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
      status: 'online',
    };
  } catch (error) {
    console.error('❌ Failed to get queue stats:', error);
    return null;
  }
}

/**
 * Get failed jobs for debugging
 */
export async function getFailedJobs(limit: number = 10) {
  if (!emailQueue || !isRedisAvailable) {
    return [];
  }

  try {
    const jobs = await emailQueue.getFailed(0, limit - 1);
    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
    }));
  } catch (error) {
    console.error('❌ Failed to get failed jobs:', error);
    return [];
  }
}

/**
 * Retry a failed job
 */
export async function retryFailedJob(jobId: string): Promise<boolean> {
  if (!emailQueue || !isRedisAvailable) {
    return false;
  }

  try {
    const job = await emailQueue.getJob(jobId);
    if (!job) {
      console.error(`❌ Job ${jobId} not found`);
      return false;
    }
    
    await job.retry();
    console.log(`🔄 Retrying job ${jobId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to retry job ${jobId}:`, error);
    return false;
  }
}

/**
 * Clean up old jobs (maintenance)
 */
export async function cleanupQueue() {
  if (!emailQueue || !isRedisAvailable) {
    return;
  }

  try {
    await emailQueue.clean(24 * 3600 * 1000, 1000, 'completed');
    await emailQueue.clean(7 * 24 * 3600 * 1000, 100, 'failed');
    console.log('✅ Queue cleanup completed');
  } catch (error) {
    console.error('❌ Queue cleanup failed:', error);
  }
}

/**
 * Graceful shutdown
 */
export async function closeQueue(): Promise<void> {
  try {
    if (emailQueue) {
      await emailQueue.close();
    }
    if (connection) {
      await connection.quit();
    }
    console.log('✅ Email queue closed gracefully');
  } catch (error) {
    console.error('❌ Error closing email queue:', error);
  }
}

console.log('✅ Email queue service initialized (resilient mode)');
