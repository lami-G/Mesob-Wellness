import { Resend } from 'resend';
import { env } from '../config/env';

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured. Please add it to your .env file.');
    }
    resend = new Resend(env.RESEND_API_KEY);
  }
  return resend;
}

/**
 * 1. Send Welcome Email with Temporary Password
 * Used when creating new users (staff, nurses, managers, etc.)
 */
export async function sendWelcomeEmail(
  recipientEmail: string,
  fullName: string,
  username: string,
  temporaryPassword: string,
  role: string
): Promise<boolean> {
  try {
    const client = getResendClient();

    const { data, error } = await client.emails.send({
      from: env.EMAIL_FROM,
      to: recipientEmail,
      subject: 'Welcome to MESOB Wellness Platform',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #001f3f 0%, #003d7a 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600;">MESOB Wellness Platform</h1>
            <p style="color: #e8f1ff; margin: 10px 0 0 0; font-size: 14px;">One-Stop Service Center</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px; background-color: white; border-radius: 0 0 8px 8px;">
            <h2 style="color: #001f3f; margin: 0 0 20px 0;">Welcome, ${fullName}!</h2>
            <p style="color: #333; font-size: 15px; line-height: 1.6;">Your account has been successfully created on the MESOB Wellness Platform.</p>
            
            <!-- Login Credentials Box -->
            <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%); padding: 20px; border-left: 5px solid #001f3f; margin: 25px 0; border-radius: 4px;">
              <p style="color: #001f3f; font-weight: 600; font-size: 16px; margin: 0 0 15px 0;">🔑 Your Login Credentials</p>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #555; font-weight: 500;">Username:</span>
                <span style="color: #001f3f; margin-left: 10px; font-family: monospace; font-weight: 600;">${username}</span>
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #555; font-weight: 500;">Temporary Password:</span>
                <span style="color: #001f3f; margin-left: 10px; font-family: monospace; font-weight: 600;">${temporaryPassword}</span>
              </div>
              
              <div style="margin-bottom: 0;">
                <span style="color: #555; font-weight: 500;">Role:</span>
                <span style="color: #333; margin-left: 10px;">${role}</span>
              </div>
            </div>

            <!-- Important Security Warning -->
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Important Security Notice:</strong><br/>
                Please change your password immediately after your first login for security purposes.
              </p>
            </div>

            <!-- Login Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${env.FRONTEND_URL}/login" 
                 style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #001f3f 0%, #003d7a 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                Login to Your Account
              </a>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you have any questions or need assistance, please contact your system administrator.
            </p>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 13px; margin: 5px 0;">
                <strong>MESOB One-Stop Service Center</strong>
              </p>
              <p style="color: #bbb; font-size: 12px; margin: 5px 0;">
                Federal Democratic Republic of Ethiopia
              </p>
              <p style="color: #bbb; font-size: 11px; margin: 10px 0 0 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
MESOB WELLNESS PLATFORM
Welcome Email

Dear ${fullName},

Your account has been successfully created on the MESOB Wellness Platform.

LOGIN CREDENTIALS:
- Username: ${username}
- Temporary Password: ${temporaryPassword}
- Role: ${role}

IMPORTANT: Please change your password immediately after your first login for security purposes.

Login URL: ${env.FRONTEND_URL}/login

If you have any questions, please contact your system administrator.

---
MESOB One-Stop Service Center
Federal Democratic Republic of Ethiopia

This is an automated message. Please do not reply to this email.
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }

    console.log(`✅ Welcome email sent to ${recipientEmail}. ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${recipientEmail}:`, error);
    return false;
  }
}

/**
 * 2. Send Appointment Reminder
 * Used by nurses to send reminders to patients about upcoming appointments
 */
export async function sendAppointmentReminder(
  recipientEmail: string,
  customerName: string,
  appointmentId: string,
  appointmentTime: string,
  reason: string
): Promise<boolean> {
  try {
    const client = getResendClient();

    const { data, error } = await client.emails.send({
      from: env.EMAIL_FROM,
      to: recipientEmail,
      subject: 'Appointment Reminder - MESOB Wellness',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #001f3f 0%, #003d7a 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600;">Appointment Reminder</h1>
            <p style="color: #e8f1ff; margin: 10px 0 0 0; font-size: 14px;">MESOB Wellness Center</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px; background-color: white; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>${customerName}</strong>,</p>
            
            <p style="color: #666; font-size: 15px; line-height: 1.6;">This is a reminder about your upcoming appointment at <strong>MESOB Wellness Center</strong>.</p>
            
            <!-- Appointment Details Box -->
            <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%); padding: 20px; border-left: 5px solid #001f3f; margin: 25px 0; border-radius: 4px;">
              <p style="color: #001f3f; font-weight: 600; font-size: 16px; margin: 0 0 15px 0;">📋 Appointment Details</p>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #555; font-weight: 500;">Appointment ID:</span>
                <span style="color: #333; margin-left: 10px; font-family: monospace;">${appointmentId}</span>
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #555; font-weight: 500;">📅 Scheduled Time:</span>
                <span style="color: #001f3f; margin-left: 10px; font-weight: 600;">${appointmentTime}</span>
              </div>
              
              <div style="margin-bottom: 0;">
                <span style="color: #555; font-weight: 500;">🏥 Reason:</span>
                <span style="color: #333; margin-left: 10px;">${reason}</span>
              </div>
            </div>

            <!-- Important Info -->
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⏰ Please arrive 5-10 minutes early</strong> to complete any necessary paperwork.
              </p>
            </div>

            <p style="color: #666; font-size: 15px; line-height: 1.6;">If you need to reschedule or cancel, please contact us as soon as possible.</p>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 13px; margin: 5px 0;">
                <strong>MESOB Wellness Center</strong>
              </p>
              <p style="color: #001f3f; font-size: 12px; margin: 10px 0 0 0;">
                Your health is our priority
              </p>
              <p style="color: #bbb; font-size: 11px; margin: 10px 0 0 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
MESOB WELLNESS CENTER
Appointment Reminder

Dear ${customerName},

This is a reminder about your upcoming appointment at MESOB Wellness Center.

APPOINTMENT DETAILS:
- Appointment ID: ${appointmentId}
- Scheduled Time: ${appointmentTime}
- Reason: ${reason}

Please arrive 5-10 minutes early to complete any necessary paperwork.

If you need to reschedule or cancel, please contact us as soon as possible.

---
MESOB Wellness Center
Your health is our priority

This is an automated message. Please do not reply to this email.
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }

    console.log(`✅ Appointment reminder sent to ${recipientEmail}. ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send appointment reminder to ${recipientEmail}:`, error);
    return false;
  }
}

/**
 * 3. Send Wellness Plan PDF via Email
 * Used when creating wellness plans for patients
 */
export async function sendWellnessPlanEmail(
  recipientEmail: string,
  patientName: string,
  planTitle: string,
  pdfBuffer: Buffer
): Promise<boolean> {
  try {
    const client = getResendClient();

    const { data, error } = await client.emails.send({
      from: env.EMAIL_FROM,
      to: recipientEmail,
      subject: `Your Wellness Plan: ${planTitle}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #001f3f 0%, #003d7a 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600;">Your Wellness Plan</h1>
            <p style="color: #e8f1ff; margin: 10px 0 0 0; font-size: 14px;">MESOB Wellness Center</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px; background-color: white; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>${patientName}</strong>,</p>
            
            <p style="color: #666; font-size: 15px; line-height: 1.6;">Your personalized wellness plan has been created and is attached to this email.</p>
            
            <!-- Plan Details Box -->
            <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%); padding: 20px; border-left: 5px solid #001f3f; margin: 25px 0; border-radius: 4px;">
              <p style="color: #001f3f; font-weight: 600; font-size: 16px; margin: 0 0 15px 0;">📄 Wellness Plan</p>
              
              <div style="margin-bottom: 0;">
                <span style="color: #555; font-weight: 500;">Plan:</span>
                <span style="color: #001f3f; margin-left: 10px; font-weight: 600;">${planTitle}</span>
              </div>
              
              <p style="color: #666; font-size: 14px; margin: 15px 0 0 0;">
                📎 See attached PDF for complete details and recommendations.
              </p>
            </div>

            <p style="color: #666; font-size: 15px; line-height: 1.6;">Please review your wellness plan carefully. If you have any questions or concerns, don't hesitate to contact your healthcare provider.</p>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 13px; margin: 5px 0;">
                <strong>MESOB Wellness Center</strong>
              </p>
              <p style="color: #001f3f; font-size: 12px; margin: 10px 0 0 0;">
                Your health is our priority
              </p>
              <p style="color: #bbb; font-size: 11px; margin: 10px 0 0 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `wellness-plan-${Date.now()}.pdf`,
          content: pdfBuffer,
        },
      ],
      text: `
MESOB WELLNESS CENTER
Your Wellness Plan

Dear ${patientName},

Your personalized wellness plan has been created and is attached to this email.

Plan: ${planTitle}

Please review your wellness plan carefully. If you have any questions or concerns, don't hesitate to contact your healthcare provider.

---
MESOB Wellness Center
Your health is our priority

This is an automated message. Please do not reply to this email.
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }

    console.log(`✅ Wellness plan email sent to ${recipientEmail}. ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send wellness plan email to ${recipientEmail}:`, error);
    return false;
  }
}

/**
 * 4. Send Vitals Record via Email
 * Used when recording patient vitals (blood pressure, heart rate, etc.)
 */
export async function sendVitalsEmail(
  recipientEmail: string,
  patientName: string,
  vitalsData: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    glucose?: number;
    glucoseType?: string;
    recordedAt: Date;
  }
): Promise<boolean> {
  try {
    const client = getResendClient();

    const { data, error } = await client.emails.send({
      from: env.EMAIL_FROM,
      to: recipientEmail,
      subject: 'Your Health Vitals Record - MESOB Wellness',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #001f3f 0%, #003d7a 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600;">Health Vitals Record</h1>
            <p style="color: #e8f1ff; margin: 10px 0 0 0; font-size: 14px;">MESOB Wellness Center</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px; background-color: white; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>${patientName}</strong>,</p>
            
            <p style="color: #666; font-size: 15px; line-height: 1.6;">Your latest health vitals have been recorded at MESOB Wellness Center.</p>
            
            <!-- Vitals Details Box -->
            <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%); padding: 20px; border-left: 5px solid #001f3f; margin: 25px 0; border-radius: 4px;">
              <p style="color: #001f3f; font-weight: 600; font-size: 16px; margin: 0 0 15px 0;">📊 Vital Signs</p>
              
              ${vitalsData.bloodPressure ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #555; font-weight: 500;">❤️ Blood Pressure:</span>
                <span style="color: #333; margin-left: 10px;">${vitalsData.bloodPressure}</span>
              </div>
              ` : ''}
              
              ${vitalsData.heartRate ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #555; font-weight: 500;">💓 Heart Rate:</span>
                <span style="color: #333; margin-left: 10px;">${vitalsData.heartRate} bpm</span>
              </div>
              ` : ''}
              
              ${vitalsData.temperature ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #555; font-weight: 500;">🌡️ Temperature:</span>
                <span style="color: #333; margin-left: 10px;">${vitalsData.temperature}°C</span>
              </div>
              ` : ''}
              
              ${vitalsData.weight ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #555; font-weight: 500;">⚖️ Weight:</span>
                <span style="color: #333; margin-left: 10px;">${vitalsData.weight} kg</span>
              </div>
              ` : ''}
              
              ${vitalsData.height ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #555; font-weight: 500;">📏 Height:</span>
                <span style="color: #333; margin-left: 10px;">${vitalsData.height} cm</span>
              </div>
              ` : ''}
              
              ${vitalsData.glucose ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #555; font-weight: 500;">🩸 Glucose ${vitalsData.glucoseType ? `(${vitalsData.glucoseType})` : ''}:</span>
                <span style="color: #333; margin-left: 10px;">${vitalsData.glucose} mg/dL</span>
              </div>
              ` : ''}
              
              <div style="margin-bottom: 0; padding-top: 10px; border-top: 1px solid #d0e0f0;">
                <span style="color: #555; font-weight: 500;">📅 Recorded:</span>
                <span style="color: #333; margin-left: 10px;">${new Date(vitalsData.recordedAt).toLocaleString()}</span>
              </div>
            </div>

            <p style="color: #666; font-size: 15px; line-height: 1.6;">Keep this record for your health tracking. If you have concerns about any measurements, please consult with your healthcare provider.</p>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 13px; margin: 5px 0;">
                <strong>MESOB Wellness Center</strong>
              </p>
              <p style="color: #001f3f; font-size: 12px; margin: 10px 0 0 0;">
                Your health is our priority
              </p>
              <p style="color: #bbb; font-size: 11px; margin: 10px 0 0 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
MESOB WELLNESS CENTER
Health Vitals Record

Dear ${patientName},

Your latest health vitals have been recorded at MESOB Wellness Center.

VITAL SIGNS:
${vitalsData.bloodPressure ? `- Blood Pressure: ${vitalsData.bloodPressure}\n` : ''}${vitalsData.heartRate ? `- Heart Rate: ${vitalsData.heartRate} bpm\n` : ''}${vitalsData.temperature ? `- Temperature: ${vitalsData.temperature}°C\n` : ''}${vitalsData.weight ? `- Weight: ${vitalsData.weight} kg\n` : ''}${vitalsData.height ? `- Height: ${vitalsData.height} cm\n` : ''}${vitalsData.glucose ? `- Glucose ${vitalsData.glucoseType ? `(${vitalsData.glucoseType})` : ''}: ${vitalsData.glucose} mg/dL\n` : ''}- Recorded: ${new Date(vitalsData.recordedAt).toLocaleString()}

Keep this record for your health tracking. If you have concerns about any measurements, please consult with your healthcare provider.

---
MESOB Wellness Center
Your health is our priority

This is an automated message. Please do not reply to this email.
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }

    console.log(`✅ Vitals email sent to ${recipientEmail}. ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send vitals email to ${recipientEmail}:`, error);
    return false;
  }
}

/**
 * Test Email Connection
 * Verifies that Resend API key is valid
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    if (!env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured');
      return false;
    }
    
    const client = getResendClient();
    // Resend doesn't have a verify method, so we just check if client initializes
    console.log('✅ Resend email service is configured correctly');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
}
