import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as ReferralService from '../services/referral.service';
import { ReferralUrgency } from '../generated/prisma';
import prisma from '../config/prisma';
import { queueReferralLetterEmail } from '../services/queue.service';
import { env } from '../config/env';

/**
 * Helper function to resolve patient user ID from either 4-digit display ID or UUID
 */
async function resolvePatientUserId(inputId: string): Promise<string | null> {
  const trimmedId = inputId.trim();

  // Check if it looks like a UUID (contains hyphens and is 36 chars)
  const isUUID = trimmedId.length === 36 && trimmedId.includes('-');

  if (isUUID) {
    // Try to find by UUID (id)
    const userById = await prisma.user.findUnique({
      where: { id: trimmedId },
      select: { id: true },
    });

    if (userById) {
      return userById.id;
    }
  } else {
    // Try to find by 4-digit userId
    const userByUserId = await prisma.user.findUnique({
      where: { userId: trimmedId },
      select: { id: true },
    });

    if (userByUserId) {
      return userByUserId.id;
    }
  }

  return null;
}

/**
 * POST /api/v1/referrals
 * Create a new referral
 */
export const createReferral = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const {
      patientId,
      destinationFacility,
      destinationFacilityType,
      destinationAddress,
      destinationPhone,
      reason,
      urgency,
      specialistType,
      diagnosis,
      clinicalSummary,
      medications,
      vitalSigns,
      labResults,
      imagingResults,
      appointmentDate,
      expectedReturnDate,
      followUpRequired,
      followUpNotes,
      documents,
      notes,
    } = req.body;

    // Validate required fields
    if (!patientId || !destinationFacility || !reason) {
      res.status(400).json({
        status: 'error',
        message: 'patientId, destinationFacility, and reason are required',
      });
      return;
    }

    // Resolve patient ID
    const resolvedPatientId = await resolvePatientUserId(patientId);
    if (!resolvedPatientId) {
      res.status(404).json({
        status: 'error',
        message: 'Patient not found',
      });
      return;
    }

    // Authorization: Only NURSE_OFFICER and above can create referrals
    const allowedRoles = [
      'NURSE_OFFICER',
      'MANAGER',
      'REGIONAL_OFFICE',
      'FEDERAL_OFFICE',
      'SYSTEM_ADMIN',
    ];
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to create referrals',
      });
      return;
    }

    const referral = await ReferralService.createReferral({
      patientId: resolvedPatientId,
      destinationFacility,
      destinationFacilityType,
      destinationAddress,
      destinationPhone,
      reason,
      urgency: urgency as ReferralUrgency,
      specialistType,
      diagnosis,
      clinicalSummary,
      medications,
      vitalSigns,
      labResults,
      imagingResults,
      appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : undefined,
      followUpRequired,
      followUpNotes,
      documents,
      notes,
      createdBy: req.user.userId,
    });

    // Send referral letter email to patient
    if (referral.patient.email) {
      try {
        await queueReferralLetterEmail({
          recipientEmail: referral.patient.email,
          referralData: {
            patientName: referral.patient.fullName,
            patientId: referral.patient.userId,
            dateOfBirth: referral.patient.dateOfBirth ? referral.patient.dateOfBirth.toISOString() : undefined,
            gender: referral.patient.gender || undefined,
            phone: referral.patient.phone || undefined,
            destinationFacility: referral.destinationFacility,
            destinationFacilityType: referral.destinationFacilityType || undefined,
            destinationAddress: referral.destinationAddress || undefined,
            destinationPhone: referral.destinationPhone || undefined,
            reason: referral.reason,
            urgency: referral.urgency,
            specialistType: referral.specialistType || undefined,
            diagnosis: referral.diagnosis || undefined,
            clinicalSummary: referral.clinicalSummary || undefined,
            medications: referral.medications || undefined,
            vitalSigns: referral.vitalSigns || undefined,
            labResults: referral.labResults || undefined,
            imagingResults: referral.imagingResults || undefined,
            appointmentDate: referral.appointmentDate || undefined,
            followUpRequired: referral.followUpRequired,
            followUpNotes: referral.followUpNotes || undefined,
            notes: referral.notes || undefined,
            referralDate: referral.referralDate,
            referringFacility: env.FACILITY_NAME || 'MESOB Wellness Center',
            referringDoctorName: referral.creator.fullName,
          },
        });
        console.log(`📧 Referral letter email queued for ${referral.patient.email}`);
      } catch (emailError) {
        // Log error but don't fail the referral creation
        console.error('⚠️ Failed to queue referral letter email:', emailError);
      }
    } else {
      console.warn(`⚠️ Patient ${referral.patient.fullName} has no email address - referral letter not sent`);
    }

    res.status(201).json({
      status: 'success',
      data: referral,
    });
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create referral',
    });
  }
};

/**
 * GET /api/v1/referrals
 * Get all referrals with optional filters
 */
export const getAllReferrals = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    // Authorization: Only staff can view all referrals
    const allowedRoles = [
      'NURSE_OFFICER',
      'MANAGER',
      'REGIONAL_OFFICE',
      'FEDERAL_OFFICE',
      'SYSTEM_ADMIN',
    ];
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to view referrals',
      });
      return;
    }

    const { patientId, status, urgency, createdBy, startDate, endDate } = req.query;

    const filters: any = {};

    if (patientId && typeof patientId === 'string') {
      const resolvedPatientId = await resolvePatientUserId(patientId);
      if (resolvedPatientId) {
        filters.patientId = resolvedPatientId;
      }
    }

    if (urgency && typeof urgency === 'string') {
      filters.urgency = urgency as ReferralUrgency;
    }

    if (createdBy && typeof createdBy === 'string') {
      filters.createdBy = createdBy;
    }

    if (startDate && typeof startDate === 'string') {
      filters.startDate = new Date(startDate);
    }

    if (endDate && typeof endDate === 'string') {
      filters.endDate = new Date(endDate);
    }

    const referrals = await ReferralService.getReferrals(filters);

    res.status(200).json({
      status: 'success',
      data: referrals,
    });
  } catch (error) {
    console.error('Get all referrals error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve referrals',
    });
  }
};

/**
 * GET /api/v1/referrals/:id
 * Get a specific referral by ID
 */
export const getReferral = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;
    const referralId = Array.isArray(id) ? id[0] : id;

    const referral = await ReferralService.getReferralById(referralId);

    if (!referral) {
      res.status(404).json({
        status: 'error',
        message: 'Referral not found',
      });
      return;
    }

    // Authorization: Users can view their own referrals, staff can view any
    const allowedRoles = [
      'NURSE_OFFICER',
      'MANAGER',
      'REGIONAL_OFFICE',
      'FEDERAL_OFFICE',
      'SYSTEM_ADMIN',
    ];
    const isOwnReferral = req.user.userId === referral.patientId;
    if (!isOwnReferral && !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to view this referral',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: referral,
    });
  } catch (error) {
    console.error('Get referral error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve referral',
    });
  }
};

/**
 * GET /api/v1/referrals/patient/:patientId
 * Get all referrals for a specific patient
 */
export const getPatientReferrals = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const { patientId } = req.params;
    const patientIdStr = Array.isArray(patientId) ? patientId[0] : patientId;

    // Resolve patient ID
    const resolvedPatientId = await resolvePatientUserId(patientIdStr);
    if (!resolvedPatientId) {
      res.status(404).json({
        status: 'error',
        message: 'Patient not found',
      });
      return;
    }

    // Authorization: Users can view their own referrals, staff can view any
    const allowedRoles = [
      'NURSE_OFFICER',
      'MANAGER',
      'REGIONAL_OFFICE',
      'FEDERAL_OFFICE',
      'SYSTEM_ADMIN',
    ];
    const isOwnReferrals = req.user.userId === resolvedPatientId;
    if (!isOwnReferrals && !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to view these referrals',
      });
      return;
    }

    const referrals = await ReferralService.getPatientReferrals(resolvedPatientId);

    res.status(200).json({
      status: 'success',
      data: referrals,
    });
  } catch (error) {
    console.error('Get patient referrals error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve patient referrals',
    });
  }
};

/**
 * PUT /api/v1/referrals/:id
 * Update a referral
 */
export const updateReferral = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;
    const referralId = Array.isArray(id) ? id[0] : id;

    const existing = await ReferralService.getReferralById(referralId);
    if (!existing) {
      res.status(404).json({
        status: 'error',
        message: 'Referral not found',
      });
      return;
    }

    // Authorization: Only NURSE_OFFICER and above can update referrals
    const allowedRoles = [
      'NURSE_OFFICER',
      'MANAGER',
      'REGIONAL_OFFICE',
      'FEDERAL_OFFICE',
      'SYSTEM_ADMIN',
    ];
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to update referrals',
      });
      return;
    }

    const updateData: any = { ...req.body };

    // Convert date strings to Date objects
    if (updateData.appointmentDate) {
      updateData.appointmentDate = new Date(updateData.appointmentDate);
    }
    if (updateData.expectedReturnDate) {
      updateData.expectedReturnDate = new Date(updateData.expectedReturnDate);
    }

    const referral = await ReferralService.updateReferral(referralId, updateData);

    res.status(200).json({
      status: 'success',
      data: referral,
    });
  } catch (error) {
    console.error('Update referral error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update referral',
    });
  }
};

/**
 * DELETE /api/v1/referrals/:id
 * Delete a referral
 */
export const deleteReferral = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;
    const referralId = Array.isArray(id) ? id[0] : id;

    const existing = await ReferralService.getReferralById(referralId);
    if (!existing) {
      res.status(404).json({
        status: 'error',
        message: 'Referral not found',
      });
      return;
    }

    // Authorization: Only MANAGER and above can delete referrals
    const allowedRoles = [
      'MANAGER',
      'REGIONAL_OFFICE',
      'FEDERAL_OFFICE',
      'SYSTEM_ADMIN',
    ];
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to delete referrals',
      });
      return;
    }

    await ReferralService.deleteReferral(referralId);

    res.status(200).json({
      status: 'success',
      message: 'Referral deleted successfully',
    });
  } catch (error) {
    console.error('Delete referral error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete referral',
    });
  }
};

/**
 * GET /api/v1/referrals/stats/overview
 * Get referral statistics
 */
export const getReferralStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    // Authorization: Only staff can view stats
    const allowedRoles = [
      'NURSE_OFFICER',
      'MANAGER',
      'REGIONAL_OFFICE',
      'FEDERAL_OFFICE',
      'SYSTEM_ADMIN',
    ];
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to view referral statistics',
      });
      return;
    }

    const { startDate, endDate, createdBy } = req.query;

    const filters: any = {};

    if (startDate && typeof startDate === 'string') {
      filters.startDate = new Date(startDate);
    }

    if (endDate && typeof endDate === 'string') {
      filters.endDate = new Date(endDate);
    }

    if (createdBy && typeof createdBy === 'string') {
      filters.createdBy = createdBy;
    }

    const stats = await ReferralService.getReferralStats(filters);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve referral statistics',
    });
  }
};
