import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { queueAppointmentReminder } from './queue.service';

/**
 * Automatic Appointment Reminder Scheduler
 * 
 * This scheduler ONLY handles appointment reminders (24 hours before).
 * 
 * Wellness plan emails are sent immediately when:
 * - A wellness plan is created (see wellness.controller.ts)
 * - A wellness plan is updated (see wellness.controller.ts)
 * - Vitals are recorded (see vitals.controller.ts)
 * 
 * NO daily batch emails are sent for wellness plans.
 */

let schedulerTask: cron.ScheduledTask | null = null;

/**
 * Find appointments that need reminders
 * Criteria:
 * - Scheduled for tomorrow (24-48 hours from now)
 * - Status: PENDING or CONFIRMED
 * - No reminder sent yet (reminderCount = 0 or reminderSentAt is null)
 * - Patient has valid email
 */
async function findAppointmentsNeedingReminders() {
  const now = new Date();
  
  // Calculate time window: 24-25 hours from now
  // We check every hour, so we want appointments in the next hour window
  const reminderWindowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  const reminderWindowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours

  console.log(`\n🔍 Checking for appointments between ${reminderWindowStart.toLocaleString()} and ${reminderWindowEnd.toLocaleString()}`);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: reminderWindowStart,
          lt: reminderWindowEnd,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        OR: [
          { reminderCount: 0 },
          { reminderCount: null },
          { reminderSentAt: null },
        ],
        user: {
          email: {
            not: null,
          },
        },
      },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
          },
        },
        center: {
          select: {
            name: true,
          },
        },
      },
    });

    return appointments;
  } catch (error) {
    console.error('❌ Error finding appointments:', error);
    return [];
  }
}

/**
 * Process appointments and queue reminder emails
 */
async function processAutomaticReminders() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⏰ Running automatic appointment reminder check');
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const appointments = await findAppointmentsNeedingReminders();

  if (appointments.length === 0) {
    console.log('✅ No appointments need reminders at this time');
    return;
  }

  console.log(`📧 Found ${appointments.length} appointment(s) needing reminders`);

  let successCount = 0;
  let failCount = 0;

  for (const appointment of appointments) {
    try {
      if (!appointment.user.email) {
        console.warn(`⚠️ Skipping appointment ${appointment.id} - no email`);
        failCount++;
        continue;
      }

      // Queue the reminder email
      await queueAppointmentReminder({
        appointmentId: appointment.id,
        recipientEmail: appointment.user.email,
        customerName: appointment.user.fullName,
        scheduledAt: new Date(appointment.scheduledAt).toLocaleString(),
        reason: appointment.reason,
      });

      console.log(`  ✅ Queued reminder for appointment ${appointment.id}`);
      console.log(`     Patient: ${appointment.user.fullName}`);
      console.log(`     Email: ${appointment.user.email}`);
      console.log(`     Time: ${new Date(appointment.scheduledAt).toLocaleString()}`);
      console.log(`     Center: ${appointment.center?.name || 'Unknown'}`);

      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to queue reminder for appointment ${appointment.id}:`, error);
      failCount++;
    }
  }

  console.log('\n📊 Reminder Summary:');
  console.log(`   ✅ Queued: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📝 Total: ${appointments.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Start the automatic reminder scheduler
 * Runs every hour at minute 0
 */
export function startReminderScheduler() {
  if (schedulerTask) {
    console.log('⚠️ Appointment scheduler is already running');
    return;
  }

  // Cron expression: Run every hour at minute 0
  // Format: minute hour day month weekday
  // '0 * * * *' means: at minute 0 of every hour
  schedulerTask = cron.schedule('0 * * * *', async () => {
    await processAutomaticReminders();
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⏰ MESOB Appointment Reminder Scheduler Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📅 Schedule: Every hour at minute 0');
  console.log('⏱️ Reminder Window: 24-25 hours before appointment');
  console.log('📧 Target: PENDING and CONFIRMED appointments');
  console.log('✅ Scheduler is active');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Optional: Run immediately on startup for testing
  // Uncomment the next line to send reminders immediately when server starts
  // processAutomaticReminders();
}

/**
 * Stop the automatic reminder scheduler
 */
export function stopReminderScheduler() {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    console.log('✅ Appointment reminder scheduler stopped');
  }
}

/**
 * Manually trigger reminder check (for testing/admin purposes)
 */
export async function triggerManualReminderCheck() {
  console.log('🔧 Manual reminder check triggered');
  await processAutomaticReminders();
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    appointmentReminders: {
      running: schedulerTask !== null,
      schedule: '0 * * * * (Every hour)',
      reminderWindow: '24-25 hours before appointment',
    },
  };
}
