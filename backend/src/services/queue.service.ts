import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env';

// Redis connection configuration for Upstash (requires TLS)
const connection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  tls: {
    rejectUnauthorized: false, // Upstash uses self-signed certificates
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  connectTimeout: 30000, // 30 seconds connection timeout
  lazyConnect: false, // Connect immediately
  retryStrategy(times) {
    if (times > 10) {
      console.error('❌ Redis connection failed after 10 retries');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  reconnectOnError(err) {
    console.error('❌ Redis connection error:', err.message);
    return true; // Always try to reconnect
  },
});

// Log connection status
connection.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

connection.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

// Email queue instance
export const emailQueue = new Queue('emails', { 
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 second delay, then 4s, 8s
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Log queue events
emailQueue.on('error', (error) => {
  console.error('❌ Email queue error:', error);
});

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
 * Used when creating new users
 */
export async function queueWelcomeEmail(data: WelcomeEmailData): Promise<string> {
  try {
    const job = await emailQueue.add('welcome-email', data, {
      priority: 2, // Medium priority
    });
    
    console.log(`📧 Welcome email queued for ${data.recipientEmail} (Job ID: ${job.id})`);
    return job.id || 'unknown';
  } catch (error) {
    console.error('❌ Failed to queue welcome email:', error);
    throw new Error('Failed to queue welcome email');
  }
}

/**
 * 2. Queue Appointment Reminder
 * Used by nurses to send reminders manually or automatically
 */
export async function queueAppointmentReminder(data: AppointmentReminderData): Promise<string> {
  try {
    const job = await emailQueue.add('appointment-reminder', data, {
      priority: 1, // High priority (time-sensitive)
    });
    
    console.log(`📧 Appointment reminder queued for ${data.recipientEmail} (Job ID: ${job.id})`);
    return job.id || 'unknown';
  } catch (error) {
    console.error('❌ Failed to queue appointment reminder:', error);
    
    // Provide more helpful error message
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
        throw new Error('Cannot connect to Redis. Please check your Redis configuration.');
      }
      throw new Error(`Failed to queue reminder: ${error.message}`);
    }
    throw new Error('Failed to queue appointment reminder');
  }
}

/**
 * 3. Queue Wellness Plan Email with PDF
 * Used when creating wellness plans
 */
export async function queueWellnessPlan(data: WellnessPlanEmailData): Promise<string> {
  try {
    const job = await emailQueue.add('wellness-plan', data, {
      priority: 3, // Lower priority (not time-sensitive)
    });
    
    console.log(`📧 Wellness plan email queued for ${data.recipientEmail} (Job ID: ${job.id})`);
    return job.id || 'unknown';
  } catch (error) {
    console.error('❌ Failed to queue wellness plan email:', error);
    throw new Error('Failed to queue wellness plan email');
  }
}

/**
 * 4. Queue Vitals Record Email
 * Used when recording patient vitals
 */
export async function queueVitalsEmail(data: VitalsEmailData): Promise<string> {
  try {
    const job = await emailQueue.add('vitals-email', data, {
      priority: 3, // Lower priority (not time-sensitive)
    });
    
    console.log(`📧 Vitals email queued for ${data.recipientEmail} (Job ID: ${job.id})`);
    return job.id || 'unknown';
  } catch (error) {
    console.error('❌ Failed to queue vitals email:', error);
    throw new Error('Failed to queue vitals email');
  }
}

/**
 * 5. Queue Referral Letter Email
 * Used when creating a referral - sends referral letter to patient
 */
export async function queueReferralLetterEmail(data: ReferralLetterEmailData): Promise<string> {
  try {
    const job = await emailQueue.add('referral-letter', data, {
      priority: 1, // High priority (important medical document)
    });
    
    console.log(`📧 Referral letter email queued for ${data.recipientEmail} (Job ID: ${job.id})`);
    return job.id || 'unknown';
  } catch (error) {
    console.error('❌ Failed to queue referral letter email:', error);
    throw new Error('Failed to queue referral letter email');
  }
}

/**
 * Get queue statistics
 * Useful for monitoring and debugging
 */
export async function getQueueStats() {
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
  try {
    await emailQueue.clean(24 * 3600 * 1000, 1000, 'completed'); // Clean completed jobs older than 24h
    await emailQueue.clean(7 * 24 * 3600 * 1000, 100, 'failed'); // Clean failed jobs older than 7 days
    console.log('✅ Queue cleanup completed');
  } catch (error) {
    console.error('❌ Queue cleanup failed:', error);
  }
}

/**
 * Graceful shutdown
 * Close Redis connection when server stops
 */
export async function closeQueue(): Promise<void> {
  try {
    await emailQueue.close();
    await connection.quit();
    console.log('✅ Email queue closed gracefully');
  } catch (error) {
    console.error('❌ Error closing email queue:', error);
  }
}

console.log('✅ Email queue service initialized');
