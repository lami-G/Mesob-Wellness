import { Request, Response } from "express";
import {
  createAppointment,
  listAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getQueueAppointments,
  getAvailableTimeSlots,
  checkStaffActiveAppointment,
  getStaffActiveAppointment,
  cancelAppointment,
} from "../services/appointments.service";
import { AppointmentStatus } from "../generated/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../config/prisma";
import { queueAppointmentReminder } from "../services/queue.service";

interface AppointmentRequestBody {
  patientId: unknown;
  centerId: unknown;
  scheduledAt: unknown;
  reason: unknown;
}

interface UpdateStatusRequestBody {
  status: unknown;
  notes?: unknown;
  diagnosis?: unknown;
  prescription?: unknown;
  cancellationReason?: unknown;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function getAppointments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId; // Get authenticated user's ID
    const status = req.query.status as string | undefined;

    const appointments = await listAppointments(userId, status);

    res.status(200).json({
      status: "success",
      data: {
        count: appointments.length,
        appointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve appointments",
    });
  }
}

export async function postAppointment(req: AuthRequest, res: Response): Promise<void> {
  const { patientId, centerId, scheduledAt, reason } =
    req.body as Partial<AppointmentRequestBody>;

  // Use authenticated user's ID if patientId is not provided or is invalid
  const userId = req.user?.userId;
  const userCenterId = req.user?.centerId;

  if (!userId) {
    res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
    return;
  }

  console.log(`[postAppointment] Received request - centerId: ${centerId}, scheduledAt: ${scheduledAt}, reason: ${reason}`);

  // Use provided centerId or fall back to user's centerId
  const appointmentCenterId = isNonEmptyString(centerId) ? centerId : userCenterId;

  if (!appointmentCenterId) {
    res.status(400).json({
      status: "error",
      message: "centerId is required. Either provide it in the request or ensure user has a center assigned.",
    });
    return;
  }

  if (!isNonEmptyString(scheduledAt) || Number.isNaN(Date.parse(scheduledAt))) {
    res.status(400).json({
      status: "error",
      message: "scheduledAt must be a valid ISO date string.",
    });
    return;
  }

  if (!isNonEmptyString(reason)) {
    res.status(400).json({
      status: "error",
      message: "reason is required.",
    });
    return;
  }

  try {
    const appointment = await createAppointment({
      patientId: userId, // Use authenticated user's ID
      centerId: appointmentCenterId,
      scheduledAt,
      reason: reason.trim(),
    });

    console.log(`[postAppointment] Appointment created successfully at center ${appointmentCenterId}: ${appointment.id}`);

    res.status(201).json({
      status: "success",
      data: appointment,
    });
  } catch (error) {
    console.error("Appointment creation error:", error);
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Failed to create appointment",
    });
  }
}

export async function getAppointment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id;

    if (!id || typeof id !== "string") {
      res.status(400).json({
        status: "error",
        message: "Appointment ID is required",
      });
      return;
    }

    const appointment = await getAppointmentById(id);

    if (!appointment) {
      res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve appointment",
    });
  }
}

export async function updateAppointment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const { status, notes, diagnosis, prescription, cancellationReason } =
      req.body as Partial<UpdateStatusRequestBody>;

    if (!id || typeof id !== "string") {
      res.status(400).json({
        status: "error",
        message: "Appointment ID is required",
      });
      return;
    }

    if (!isNonEmptyString(status)) {
      res.status(400).json({
        status: "error",
        message: "Status is required",
      });
      return;
    }

    // Validate status
    const validStatuses = Object.values(AppointmentStatus);
    const upperStatus = status.toUpperCase();
    
    if (!validStatuses.includes(upperStatus as AppointmentStatus)) {
      res.status(400).json({
        status: "error",
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
      return;
    }

    const appointment = await updateAppointmentStatus(
      id,
      upperStatus as AppointmentStatus,
      typeof notes === "string" ? notes : undefined,
      typeof diagnosis === "string" ? diagnosis : undefined,
      typeof prescription === "string" ? prescription : undefined,
      typeof cancellationReason === "string" ? cancellationReason : undefined
    );

    res.status(200).json({
      status: "success",
      data: appointment,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
      return;
    }

    res.status(500).json({
      status: "error",
      message: "Failed to update appointment",
    });
  }
}

export async function sendReminderHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const appointmentId = req.params.id;
    const userId = req.user?.userId;

    if (!appointmentId || typeof appointmentId !== "string") {
      res.status(400).json({
        status: "error",
        message: "Appointment ID is required",
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    const appointment = await getAppointmentById(appointmentId);

    if (!appointment) {
      res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
      return;
    }

    // Check if user and email exist
    if (!appointment.user) {
      console.error(`❌ User not found for appointment ${appointmentId}`);
      res.status(400).json({
        status: "error",
        message: "Patient information not found for this appointment",
      });
      return;
    }

    if (!appointment.user.email || appointment.user.email.trim() === "") {
      console.error(`❌ Email not found for user ${appointment.user.fullName}`);
      res.status(400).json({
        status: "error",
        message: `No email address found for patient ${appointment.user.fullName}`,
      });
      return;
    }

    // Queue email reminder (instant response to nurse)
    const jobId = await queueAppointmentReminder({
      appointmentId,
      recipientEmail: appointment.user.email,
      customerName: appointment.user.fullName,
      scheduledAt: new Date(appointment.scheduledAt).toLocaleString(),
      reason: appointment.reason,
    });

    // Update appointment with tracking (mark that reminder was requested)
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        lastReminderBy: userId,
      },
    });

    console.log(`✅ Email reminder queued for appointment ${appointmentId} by user ${userId} (Job ID: ${jobId})`);
    res.status(200).json({
      status: "success",
      message: "Email reminder queued successfully and will be sent shortly",
      data: {
        appointmentId,
        queued: true,
        jobId,
        recipient: appointment.user.email,
      },
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Failed to send reminder",
    });
  }
}


export async function getQueueHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const date = req.query.date as string | undefined;
    const user = req.user;

    if (!user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    // Get the nurse's center ID
    const centerId = user.centerId;

    // If nurse has a center, filter appointments by that center
    // Otherwise (for system admins), show all appointments
    const queue = await getQueueAppointments(date, centerId || undefined);

    console.log(`Queue fetched for user ${user.userId} (center: ${centerId || 'all'}): ${queue.length} appointments`);

    res.status(200).json({
      status: "success",
      data: queue,
    });
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve queue",
    });
  }
}


/**
 * GET /api/v1/appointments/available-slots?date=YYYY-MM-DD&centerId=uuid
 * Get available time slots for a specific date at a specific center
 */
export async function getAvailableSlotsHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const date = req.query.date as string;
    const centerId = req.query.centerId as string;
    const userCenterId = req.user?.centerId;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({
        status: 'error',
        message: 'Valid date parameter is required (YYYY-MM-DD format)',
      });
      return;
    }

    // Use provided centerId or fall back to user's centerId
    const queryCenter = centerId || userCenterId;

    if (!queryCenter) {
      res.status(400).json({
        status: 'error',
        message: 'centerId is required. Either provide it as a query parameter or ensure user has a center assigned.',
      });
      return;
    }

    const availableSlots = await getAvailableTimeSlots(date, queryCenter);

    res.status(200).json({
      status: 'success',
      data: {
        date,
        centerId: queryCenter,
        availableSlots,
        totalSlots: availableSlots.length,
      },
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get available time slots',
    });
  }
}

/**
 * GET /api/v1/appointments/staff/:staffId/active
 * Check if staff has an active appointment
 */
export async function checkStaffActiveHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const staffId = req.params.staffId;

    if (!staffId || typeof staffId !== "string") {
      res.status(400).json({
        status: "error",
        message: "Staff ID is required",
      });
      return;
    }

    const hasActive = await checkStaffActiveAppointment(staffId);
    const activeAppointment = hasActive ? await getStaffActiveAppointment(staffId) : null;

    res.status(200).json({
      status: "success",
      data: {
        staffId,
        hasActiveAppointment: hasActive,
        activeAppointment,
      },
    });
  } catch (error) {
    console.error('Check staff active error:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to check staff active appointment",
    });
  }
}

/**
 * DELETE /api/v1/appointments/:id/cancel
 * Cancel an appointment
 */
export async function cancelAppointmentHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const { cancellationReason } = req.body as { cancellationReason?: unknown };

    if (!id || typeof id !== "string") {
      res.status(400).json({
        status: "error",
        message: "Appointment ID is required",
      });
      return;
    }

    if (!isNonEmptyString(cancellationReason)) {
      res.status(400).json({
        status: "error",
        message: "Cancellation reason is required",
      });
      return;
    }

    const appointment = await cancelAppointment(id, cancellationReason);

    res.status(200).json({
      status: "success",
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
      return;
    }
    if (error instanceof Error && error.message.includes("Cannot cancel")) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      status: "error",
      message: "Failed to cancel appointment",
    });
  }
}

/**
 * DELETE /api/v1/appointments/:id
 * Delete an appointment (admin only)
 */
export async function deleteAppointmentHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id;

    if (!id || typeof id !== "string") {
      res.status(400).json({
        status: "error",
        message: "Appointment ID is required",
      });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
      return;
    }

    await prisma.appointment.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete appointment",
    });
  }
}

