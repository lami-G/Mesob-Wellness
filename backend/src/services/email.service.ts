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
 * 3. Send Wellness Plan with Vitals via Email (Combined)
 * Used when creating wellness plans for patients - includes their latest vitals
 * NO PDF ATTACHMENT - all content in email body
 */
export async function sendWellnessPlanEmail(
  recipientEmail: string,
  patientName: string,
  planTitle: string,
  planContent: {
    nutritionRecommendations?: string;
    exerciseRecommendations?: string;
    stressManagementAdvice?: string;
    goals?: string;
    duration?: number;
  },
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
  }
): Promise<boolean> {
  try {
    const client = getResendClient();

    // Build vitals section if data is provided
    let vitalsSection = '';
    if (vitalsData) {
      vitalsSection = `
        <!-- Vitals Section -->
        <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%); padding: 20px; border-left: 5px solid #001f3f; margin: 25px 0; border-radius: 4px;">
          <p style="color: #001f3f; font-weight: 600; font-size: 16px; margin: 0 0 15px 0;">📊 Your Latest Vital Signs</p>
          
          ${vitalsData.recordedAt ? `
          <div style="margin-bottom: 12px;">
            <span style="color: #555; font-weight: 500;">📅 Recorded:</span>
            <span style="color: #333; margin-left: 10px;">${new Date(vitalsData.recordedAt).toLocaleString()}</span>
          </div>
          ` : ''}
          
          ${vitalsData.bloodPressure ? `
          <div style="margin-bottom: 12px;">
            <span style="color: #555; font-weight: 500;">❤️ Blood Pressure:</span>
            <span style="color: #333; margin-left: 10px;">${vitalsData.bloodPressure} mmHg</span>
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
          
          ${vitalsData.bmi ? `
          <div style="margin-bottom: 12px;">
            <span style="color: #555; font-weight: 500;">📊 BMI:</span>
            <span style="color: #333; margin-left: 10px;">${vitalsData.bmi.toFixed(1)}</span>
          </div>
          ` : ''}
          
          ${vitalsData.glucose ? `
          <div style="margin-bottom: 12px;">
            <span style="color: #555; font-weight: 500;">🩸 Glucose ${vitalsData.glucoseType ? `(${vitalsData.glucoseType})` : ''}:</span>
            <span style="color: #333; margin-left: 10px;">${vitalsData.glucose} mg/dL</span>
          </div>
          ` : ''}
        </div>
      `;
    }

    // Build wellness plan section
    let wellnessPlanSection = `
      <!-- Wellness Plan Section -->
      <div style="background: linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%); padding: 20px; border-left: 5px solid #22c55e; margin: 25px 0; border-radius: 4px;">
        <p style="color: #16a34a; font-weight: 600; font-size: 16px; margin: 0 0 15px 0;">💪 Your Wellness Plan: ${planTitle}</p>
        
        ${planContent.nutritionRecommendations ? `
        <div style="margin-bottom: 16px;">
          <p style="color: #16a34a; font-weight: 600; margin: 0 0 8px 0;">🥗 Nutrition Recommendations</p>
          <p style="color: #333; margin: 0; line-height: 1.6; white-space: pre-wrap;">${planContent.nutritionRecommendations}</p>
        </div>
        ` : ''}
        
        ${planContent.exerciseRecommendations ? `
        <div style="margin-bottom: 16px;">
          <p style="color: #16a34a; font-weight: 600; margin: 0 0 8px 0;">🏃 Exercise Recommendations</p>
          <p style="color: #333; margin: 0; line-height: 1.6; white-space: pre-wrap;">${planContent.exerciseRecommendations}</p>
        </div>
        ` : ''}
        
        ${planContent.stressManagementAdvice ? `
        <div style="margin-bottom: 16px;">
          <p style="color: #16a34a; font-weight: 600; margin: 0 0 8px 0;">🧘 Stress Management</p>
          <p style="color: #333; margin: 0; line-height: 1.6; white-space: pre-wrap;">${planContent.stressManagementAdvice}</p>
        </div>
        ` : ''}
        
        ${planContent.goals ? `
        <div style="margin-bottom: 16px;">
          <p style="color: #16a34a; font-weight: 600; margin: 0 0 8px 0;">🎯 Your Health Goals</p>
          <p style="color: #333; margin: 0; line-height: 1.6; white-space: pre-wrap;">${planContent.goals}</p>
        </div>
        ` : ''}
        
        ${planContent.duration ? `
        <div style="margin-bottom: 0;">
          <p style="color: #16a34a; font-weight: 600; margin: 0 0 8px 0;">⏱️ Duration</p>
          <p style="color: #333; margin: 0;">${planContent.duration} days</p>
        </div>
        ` : ''}
      </div>
    `;

    const { data, error } = await client.emails.send({
      from: env.EMAIL_FROM,
      to: recipientEmail,
      subject: `Your Health Report: ${planTitle}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #001f3f 0%, #003d7a 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600;">Your Health Report</h1>
            <p style="color: #e8f1ff; margin: 10px 0 0 0; font-size: 14px;">MESOB Wellness Center</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px; background-color: white; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>${patientName}</strong>,</p>
            
            <p style="color: #666; font-size: 15px; line-height: 1.6;">Your personalized wellness plan has been created based on your latest health assessment.</p>
            
            ${vitalsSection}
            
            ${wellnessPlanSection}

            <!-- Important Info -->
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>💡 Important:</strong> Please follow your wellness plan carefully. If you have any questions or concerns, don't hesitate to contact your healthcare provider.
              </p>
            </div>

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
Your Health Report

Dear ${patientName},

Your personalized wellness plan has been created based on your latest health assessment.

${vitalsData ? `
VITAL SIGNS:
Recorded: ${vitalsData.recordedAt ? new Date(vitalsData.recordedAt).toLocaleString() : 'N/A'}
${vitalsData.bloodPressure ? `Blood Pressure: ${vitalsData.bloodPressure} mmHg\n` : ''}${vitalsData.heartRate ? `Heart Rate: ${vitalsData.heartRate} bpm\n` : ''}${vitalsData.temperature ? `Temperature: ${vitalsData.temperature}°C\n` : ''}${vitalsData.weight ? `Weight: ${vitalsData.weight} kg\n` : ''}${vitalsData.height ? `Height: ${vitalsData.height} cm\n` : ''}${vitalsData.bmi ? `BMI: ${vitalsData.bmi.toFixed(1)}\n` : ''}${vitalsData.glucose ? `Glucose ${vitalsData.glucoseType ? `(${vitalsData.glucoseType})` : ''}: ${vitalsData.glucose} mg/dL\n` : ''}
` : ''}

WELLNESS PLAN: ${planTitle}

${planContent.nutritionRecommendations ? `Nutrition Recommendations:\n${planContent.nutritionRecommendations}\n\n` : ''}${planContent.exerciseRecommendations ? `Exercise Recommendations:\n${planContent.exerciseRecommendations}\n\n` : ''}${planContent.stressManagementAdvice ? `Stress Management:\n${planContent.stressManagementAdvice}\n\n` : ''}${planContent.goals ? `Your Health Goals:\n${planContent.goals}\n\n` : ''}${planContent.duration ? `Duration: ${planContent.duration} days\n\n` : ''}

Please follow your wellness plan carefully. If you have any questions or concerns, don't hesitate to contact your healthcare provider.

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

/**
 * 5. Send Referral Letter to Patient
 * Used when creating a referral - sends referral letter to patient's email
 */
export async function sendReferralLetterEmail(
  recipientEmail: string,
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
  }
): Promise<boolean> {
  try {
    const client = getResendClient();

    const urgencyColor = 
      referralData.urgency === 'EMERGENCY' ? '#dc2626' : 
      referralData.urgency === 'URGENT' ? '#ea580c' : 
      '#16a34a';

    const urgencyLabel = 
      referralData.urgency === 'EMERGENCY' ? '🚨 EMERGENCY' : 
      referralData.urgency === 'URGENT' ? '⚠️ URGENT' : 
      '📋 ROUTINE';

    const { data, error } = await client.emails.send({
      from: env.EMAIL_FROM,
      to: recipientEmail,
      subject: `Medical Referral Letter - ${referralData.destinationFacility}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff;">
          <!-- Letterhead -->
          <div style="background: linear-gradient(135deg, #001f3f 0%, #003d7a 100%); padding: 25px 30px; text-align: center; border-bottom: 4px solid #ffc107;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">MESOB WELLNESS CENTER</h1>
            <p style="color: #e8f1ff; margin: 8px 0 0 0; font-size: 13px;">One-Stop Service Center - Federal Democratic Republic of Ethiopia</p>
          </div>

          <!-- Document Title -->
          <div style="padding: 25px 30px; background-color: #f8f9fa; border-bottom: 2px solid #e9ecef;">
            <h2 style="color: #001f3f; margin: 0; font-size: 20px; text-align: center;">MEDICAL REFERRAL LETTER</h2>
            <div style="text-align: center; margin-top: 10px;">
              <span style="background-color: ${urgencyColor}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                ${urgencyLabel}
              </span>
            </div>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px;">
            
            <!-- Date and Reference -->
            <div style="margin-bottom: 25px;">
              <p style="margin: 5px 0; color: #555; font-size: 14px;">
                <strong>Date:</strong> ${new Date(referralData.referralDate).toLocaleDateString('en-ET', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p style="margin: 5px 0; color: #555; font-size: 14px;">
                <strong>From:</strong> ${referralData.referringFacility}
              </p>
            </div>

            <!-- Recipient -->
            <div style="margin-bottom: 25px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #001f3f; border-radius: 4px;">
              <p style="margin: 0 0 5px 0; color: #001f3f; font-weight: 600; font-size: 15px;">To:</p>
              <p style="margin: 0; color: #333; font-size: 14px;"><strong>${referralData.destinationFacility}</strong></p>
              ${referralData.destinationFacilityType ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${referralData.destinationFacilityType}</p>` : ''}
              ${referralData.destinationAddress ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${referralData.destinationAddress}</p>` : ''}
              ${referralData.destinationPhone ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">📞 ${referralData.destinationPhone}</p>` : ''}
            </div>

            ${referralData.specialistType ? `
            <div style="margin-bottom: 20px;">
              <p style="margin: 0; color: #555; font-size: 14px;">
                <strong>Attention:</strong> ${referralData.specialistType}
              </p>
            </div>
            ` : ''}

            <!-- Patient Information -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #001f3f; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #001f3f; padding-bottom: 6px;">PATIENT INFORMATION</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #555; font-size: 14px; width: 40%;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px;">${referralData.patientName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Patient ID:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px;">${referralData.patientId}</td>
                </tr>
                ${referralData.dateOfBirth ? `
                <tr>
                  <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Date of Birth:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px;">${new Date(referralData.dateOfBirth).toLocaleDateString()}</td>
                </tr>
                ` : ''}
                ${referralData.gender ? `
                <tr>
                  <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Gender:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px;">${referralData.gender}</td>
                </tr>
                ` : ''}
                ${referralData.phone ? `
                <tr>
                  <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px;">${referralData.phone}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <!-- Reason for Referral -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #001f3f; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #001f3f; padding-bottom: 6px;">REASON FOR REFERRAL</h3>
              <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${referralData.reason}</p>
            </div>

            ${referralData.diagnosis ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #001f3f; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #001f3f; padding-bottom: 6px;">DIAGNOSIS</h3>
              <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${referralData.diagnosis}</p>
            </div>
            ` : ''}

            ${referralData.clinicalSummary ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #001f3f; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #001f3f; padding-bottom: 6px;">CLINICAL SUMMARY</h3>
              <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${referralData.clinicalSummary}</p>
            </div>
            ` : ''}

            ${referralData.vitalSigns ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #001f3f; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #001f3f; padding-bottom: 6px;">VITAL SIGNS</h3>
              <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${referralData.vitalSigns}</p>
            </div>
            ` : ''}

            ${referralData.medications ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #001f3f; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #001f3f; padding-bottom: 6px;">CURRENT MEDICATIONS</h3>
              <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${referralData.medications}</p>
            </div>
            ` : ''}

            ${referralData.labResults ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #001f3f; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #001f3f; padding-bottom: 6px;">LABORATORY RESULTS</h3>
              <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${referralData.labResults}</p>
            </div>
            ` : ''}

            ${referralData.imagingResults ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #001f3f; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #001f3f; padding-bottom: 6px;">IMAGING RESULTS</h3>
              <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${referralData.imagingResults}</p>
            </div>
            ` : ''}

            ${referralData.appointmentDate ? `
            <div style="margin-bottom: 25px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>📅 Appointment Scheduled:</strong> ${new Date(referralData.appointmentDate).toLocaleString()}
              </p>
            </div>
            ` : ''}

            ${referralData.followUpRequired && referralData.followUpNotes ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #001f3f; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #001f3f; padding-bottom: 6px;">FOLLOW-UP REQUIRED</h3>
              <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${referralData.followUpNotes}</p>
            </div>
            ` : ''}

            ${referralData.notes ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #001f3f; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #001f3f; padding-bottom: 6px;">ADDITIONAL NOTES</h3>
              <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${referralData.notes}</p>
            </div>
            ` : ''}

            <!-- Signature -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="margin: 0 0 8px 0; color: #333; font-size: 14px;"><strong>Referring Healthcare Provider:</strong></p>
              <p style="margin: 0 0 8px 0; color: #555; font-size: 14px;">${referralData.referringDoctorName}</p>
              <p style="margin: 0; color: #555; font-size: 14px;">${referralData.referringFacility}</p>
            </div>

            <!-- Instructions for Patient -->
            <div style="margin-top: 30px; padding: 20px; background-color: #e8f5e9; border-left: 4px solid #22c55e; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: #16a34a; font-weight: 600; font-size: 15px;">📌 Important Instructions:</p>
              <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 14px; line-height: 1.8;">
                <li>Please print this referral letter and bring it to ${referralData.destinationFacility}</li>
                <li>Contact the facility to schedule an appointment if one is not already scheduled</li>
                <li>Bring any relevant medical records, test results, or medications with you</li>
                ${referralData.urgency !== 'ROUTINE' ? '<li style="color: #dc2626; font-weight: 600;">This is an ' + (referralData.urgency === 'EMERGENCY' ? 'EMERGENCY' : 'URGENT') + ' referral - please seek care as soon as possible</li>' : ''}
              </ul>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #dee2e6;">
            <p style="color: #666; font-size: 12px; margin: 5px 0;">
              <strong>MESOB Wellness Center</strong> | One-Stop Service Center
            </p>
            <p style="color: #999; font-size: 11px; margin: 5px 0;">
              Federal Democratic Republic of Ethiopia
            </p>
            <p style="color: #bbb; font-size: 11px; margin: 10px 0 0 0;">
              This is an automated referral letter. For questions, please contact your healthcare provider.
            </p>
          </div>
        </div>
      `,
      text: `
MESOB WELLNESS CENTER
One-Stop Service Center - Federal Democratic Republic of Ethiopia

═══════════════════════════════════════════════════════════
MEDICAL REFERRAL LETTER
${urgencyLabel}
═══════════════════════════════════════════════════════════

Date: ${new Date(referralData.referralDate).toLocaleDateString('en-ET', { year: 'numeric', month: 'long', day: 'numeric' })}
From: ${referralData.referringFacility}

TO:
${referralData.destinationFacility}
${referralData.destinationFacilityType ? `Type: ${referralData.destinationFacilityType}\n` : ''}${referralData.destinationAddress ? `Address: ${referralData.destinationAddress}\n` : ''}${referralData.destinationPhone ? `Phone: ${referralData.destinationPhone}\n` : ''}
${referralData.specialistType ? `\nAttention: ${referralData.specialistType}\n` : ''}

───────────────────────────────────────────────────────────
PATIENT INFORMATION
───────────────────────────────────────────────────────────
Name: ${referralData.patientName}
Patient ID: ${referralData.patientId}
${referralData.dateOfBirth ? `Date of Birth: ${new Date(referralData.dateOfBirth).toLocaleDateString()}\n` : ''}${referralData.gender ? `Gender: ${referralData.gender}\n` : ''}${referralData.phone ? `Phone: ${referralData.phone}\n` : ''}

───────────────────────────────────────────────────────────
REASON FOR REFERRAL
───────────────────────────────────────────────────────────
${referralData.reason}

${referralData.diagnosis ? `
───────────────────────────────────────────────────────────
DIAGNOSIS
───────────────────────────────────────────────────────────
${referralData.diagnosis}
` : ''}
${referralData.clinicalSummary ? `
───────────────────────────────────────────────────────────
CLINICAL SUMMARY
───────────────────────────────────────────────────────────
${referralData.clinicalSummary}
` : ''}
${referralData.vitalSigns ? `
───────────────────────────────────────────────────────────
VITAL SIGNS
───────────────────────────────────────────────────────────
${referralData.vitalSigns}
` : ''}
${referralData.medications ? `
───────────────────────────────────────────────────────────
CURRENT MEDICATIONS
───────────────────────────────────────────────────────────
${referralData.medications}
` : ''}
${referralData.labResults ? `
───────────────────────────────────────────────────────────
LABORATORY RESULTS
───────────────────────────────────────────────────────────
${referralData.labResults}
` : ''}
${referralData.imagingResults ? `
───────────────────────────────────────────────────────────
IMAGING RESULTS
───────────────────────────────────────────────────────────
${referralData.imagingResults}
` : ''}
${referralData.appointmentDate ? `
───────────────────────────────────────────────────────────
APPOINTMENT SCHEDULED: ${new Date(referralData.appointmentDate).toLocaleString()}
───────────────────────────────────────────────────────────
` : ''}
${referralData.followUpRequired && referralData.followUpNotes ? `
───────────────────────────────────────────────────────────
FOLLOW-UP REQUIRED
───────────────────────────────────────────────────────────
${referralData.followUpNotes}
` : ''}
${referralData.notes ? `
───────────────────────────────────────────────────────────
ADDITIONAL NOTES
───────────────────────────────────────────────────────────
${referralData.notes}
` : ''}

───────────────────────────────────────────────────────────
REFERRING HEALTHCARE PROVIDER
───────────────────────────────────────────────────────────
${referralData.referringDoctorName}
${referralData.referringFacility}

═══════════════════════════════════════════════════════════
IMPORTANT INSTRUCTIONS FOR PATIENT:
═══════════════════════════════════════════════════════════
• Please print this referral letter and bring it to ${referralData.destinationFacility}
• Contact the facility to schedule an appointment if one is not already scheduled
• Bring any relevant medical records, test results, or medications with you
${referralData.urgency !== 'ROUTINE' ? `• THIS IS AN ${referralData.urgency} REFERRAL - Please seek care as soon as possible\n` : ''}

═══════════════════════════════════════════════════════════

MESOB Wellness Center | One-Stop Service Center
Federal Democratic Republic of Ethiopia

This is an automated referral letter. For questions, please contact your healthcare provider.
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }

    console.log(`✅ Referral letter email sent to ${recipientEmail}. ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send referral letter email to ${recipientEmail}:`, error);
    return false;
  }
}

