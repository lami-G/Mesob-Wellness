import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env';
import {
  sendWelcomeEmail,
  sendAppointmentReminder,
  sendWellnessPlanEmail,
  sendVitalsEmail,
  sendReferralLetterEmail,
} from '../services/email.service';
import {
  WelcomeEmailData,
  AppointmentReminderData,
  WellnessPlanEmailData,
  VitalsEmailData,
  ReferralLetterEmailData,
} from '../services/queue.service';
import { prisma } from '../config/prisma';

// Redis connection for worker (requires TLS for Upstash)
const connection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  tls: {
    rejectUnauthorized: false, // Upstash uses self-signed certificates
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

/**
 * Email Worker - Processes email jobs from the queue
 * Runs as a separate background process
 */
const emailWorker = new Worker(
  'emails',
  async (job: Job) => {
    console.log(`\n📧 Processing email job: ${job.name} (ID: ${job.id})`);
    console.log(`   Attempt ${job.attemptsMade + 1}/${job.opts.attempts || 3}`);

    try {
      switch (job.name) {
        case 'welcome-email': {
          const data = job.data as WelcomeEmailData;
          const success = await sendWelcomeEmail(
            data.recipientEmail,
            data.fullName,
            data.username,
            data.temporaryPassword,
            data.role
          );

          if (!success) {
            throw new Error('Failed to send welcome email');
          }

          return { success: true, type: 'welcome-email', recipient: data.recipientEmail };
        }

        case 'appointment-reminder': {
          const data = job.data as AppointmentReminderData;
          const success = await sendAppointmentReminder(
            data.recipientEmail,
            data.customerName,
            data.appointmentId,
            data.scheduledAt,
            data.reason
          );

          if (!success) {
            throw new Error('Failed to send appointment reminder');
          }

          // Update appointment with reminder tracking
          await prisma.appointment.update({
            where: { id: data.appointmentId },
            data: {
              reminderSentAt: new Date(),
              reminderCount: { increment: 1 },
            },
          });

          console.log(`   ✅ Updated appointment ${data.appointmentId} reminder tracking`);

          return {
            success: true,
            type: 'appointment-reminder',
            appointmentId: data.appointmentId,
            recipient: data.recipientEmail,
          };
        }

        case 'wellness-plan': {
          const data = job.data as WellnessPlanEmailData;
          const success = await sendWellnessPlanEmail(
            data.recipientEmail,
            data.patientName,
            data.planTitle,
            data.planContent,
            data.vitalsData
          );

          if (!success) {
            throw new Error('Failed to send wellness plan email');
          }

          return { success: true, type: 'wellness-plan', recipient: data.recipientEmail };
        }

        case 'vitals-email': {
          const data = job.data as VitalsEmailData;
          const success = await sendVitalsEmail(
            data.recipientEmail,
            data.patientName,
            data.vitalsData
          );

          if (!success) {
            throw new Error('Failed to send vitals email');
          }

          return { success: true, type: 'vitals-email', recipient: data.recipientEmail };
        }

        case 'referral-letter': {
          const data = job.data as ReferralLetterEmailData;
          const success = await sendReferralLetterEmail(
            data.recipientEmail,
            data.referralData
          );

          if (!success) {
            throw new Error('Failed to send referral letter email');
          }

          return { success: true, type: 'referral-letter', recipient: data.recipientEmail };
        }

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      console.error(`   ❌ Job ${job.id} failed:`, error);
      throw error; // Re-throw to trigger retry
    }
  },
  {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      tls: {
        rejectUnauthorized: false,
      },
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    },
    concurrency: 5, // Process up to 5 emails concurrently
    limiter: {
      max: 100, // Max 100 jobs
      duration: 86400000, // per 24 hours (86400000ms = 24h)
      // This respects Resend's free tier limit of 100 emails/day
    },
  }
);

// Worker event handlers
emailWorker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed successfully`);
  console.log(`   Type: ${result.type}`);
  console.log(`   Recipient: ${result.recipient}`);
  if (result.appointmentId) {
    console.log(`   Appointment ID: ${result.appointmentId}`);
  }
});

emailWorker.on('failed', (job, error) => {
  if (job) {
    console.error(`❌ Job ${job.id} failed after ${job.attemptsMade} attempts`);
    console.error(`   Type: ${job.name}`);
    console.error(`   Error: ${error.message}`);
    
    // Check if this was the last attempt
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      console.error(`   ⚠️ Job ${job.id} exhausted all retry attempts - moving to failed queue`);
    } else {
      console.log(`   🔄 Will retry job ${job.id} in a moment...`);
    }
  }
});

emailWorker.on('active', (job) => {
  console.log(`⚙️ Job ${job.id} is now active (${job.name})`);
});

emailWorker.on('stalled', (jobId) => {
  console.warn(`⚠️ Job ${jobId} has stalled and will be retried`);
});

emailWorker.on('error', (error) => {
  console.error('❌ Worker error:', error);
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('\n📧 Received SIGTERM, gracefully shutting down email worker...');
  await emailWorker.close();
  await connection.quit();
  console.log('✅ Email worker stopped');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n📧 Received SIGINT, gracefully shutting down email worker...');
  await emailWorker.close();
  await connection.quit();
  console.log('✅ Email worker stopped');
  process.exit(0);
});

// Log worker start
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📧 MESOB Email Worker Started');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 Redis: ${env.REDIS_HOST}:${env.REDIS_PORT}`);
console.log(`📬 Email Service: Resend`);
console.log(`⚙️ Concurrency: 5 jobs`);
console.log(`📊 Rate Limit: 100 emails/day`);
console.log(`🔄 Retry Policy: 3 attempts with exponential backoff`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Worker is ready and listening for jobs...\n');

export default emailWorker;
