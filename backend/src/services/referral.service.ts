import { prisma } from '../config/prisma';
import { ReferralUrgency } from '../generated/prisma';

/**
 * Referral Service
 * Handles all business logic for patient referrals to other healthcare facilities
 */

export interface CreateReferralData {
  patientId: string;
  destinationFacility: string;
  destinationFacilityType?: string;
  destinationAddress?: string;
  destinationPhone?: string;
  reason: string;
  urgency?: ReferralUrgency;
  specialistType?: string;
  diagnosis?: string;
  clinicalSummary?: string;
  medications?: string;
  vitalSigns?: string;
  labResults?: string;
  imagingResults?: string;
  appointmentDate?: Date;
  expectedReturnDate?: Date;
  followUpRequired?: boolean;
  followUpNotes?: string;
  documents?: any;
  notes?: string;
  createdBy: string;
}

export interface UpdateReferralData {
  destinationFacility?: string;
  destinationFacilityType?: string;
  destinationAddress?: string;
  destinationPhone?: string;
  reason?: string;
  urgency?: ReferralUrgency;
  specialistType?: string;
  diagnosis?: string;
  clinicalSummary?: string;
  medications?: string;
  vitalSigns?: string;
  labResults?: string;
  imagingResults?: string;
  appointmentDate?: Date;
  expectedReturnDate?: Date;
  followUpRequired?: boolean;
  followUpNotes?: string;
  documents?: any;
  notes?: string;
}

/**
 * Create a new referral
 */
export async function createReferral(data: CreateReferralData) {
  return await prisma.referral.create({
    data: {
      patientId: data.patientId,
      destinationFacility: data.destinationFacility,
      destinationFacilityType: data.destinationFacilityType,
      destinationAddress: data.destinationAddress,
      destinationPhone: data.destinationPhone,
      reason: data.reason,
      urgency: data.urgency || ReferralUrgency.ROUTINE,
      specialistType: data.specialistType,
      diagnosis: data.diagnosis,
      clinicalSummary: data.clinicalSummary,
      medications: data.medications,
      vitalSigns: data.vitalSigns,
      labResults: data.labResults,
      imagingResults: data.imagingResults,
      appointmentDate: data.appointmentDate,
      expectedReturnDate: data.expectedReturnDate,
      followUpRequired: data.followUpRequired || false,
      followUpNotes: data.followUpNotes,
      documents: data.documents,
      notes: data.notes,
      createdBy: data.createdBy,
    },
    include: {
      patient: {
        select: {
          id: true,
          userId: true,
          fullName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
        },
      },
      creator: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Get a referral by ID
 */
export async function getReferralById(id: string) {
  return await prisma.referral.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id: true,
          userId: true,
          fullName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
        },
      },
      creator: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Get all referrals with optional filters
 */
export async function getReferrals(filters?: {
  patientId?: string;
  urgency?: ReferralUrgency;
  createdBy?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = {};

  if (filters?.patientId) {
    where.patientId = filters.patientId;
  }

  if (filters?.urgency) {
    where.urgency = filters.urgency;
  }

  if (filters?.createdBy) {
    where.createdBy = filters.createdBy;
  }

  if (filters?.startDate || filters?.endDate) {
    where.referralDate = {};
    if (filters.startDate) {
      where.referralDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.referralDate.lte = filters.endDate;
    }
  }

  return await prisma.referral.findMany({
    where,
    include: {
      patient: {
        select: {
          id: true,
          userId: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      creator: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
    orderBy: {
      referralDate: 'desc',
    },
  });
}

/**
 * Get referrals for a specific patient
 */
export async function getPatientReferrals(patientId: string) {
  return await prisma.referral.findMany({
    where: { patientId },
    include: {
      creator: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
    orderBy: {
      referralDate: 'desc',
    },
  });
}

/**
 * Update a referral
 */
export async function updateReferral(id: string, data: UpdateReferralData) {
  return await prisma.referral.update({
    where: { id },
    data,
    include: {
      patient: {
        select: {
          id: true,
          userId: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      creator: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Delete a referral
 */
export async function deleteReferral(id: string) {
  return await prisma.referral.delete({
    where: { id },
  });
}

/**
 * Get referral statistics
 */
export async function getReferralStats(filters?: {
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
}) {
  const where: any = {};

  if (filters?.startDate || filters?.endDate) {
    where.referralDate = {};
    if (filters.startDate) {
      where.referralDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.referralDate.lte = filters.endDate;
    }
  }

  if (filters?.createdBy) {
    where.createdBy = filters.createdBy;
  }

  const [
    totalReferrals,
    urgentReferrals,
    emergencyReferrals,
  ] = await Promise.all([
    prisma.referral.count({ where }),
    prisma.referral.count({ where: { ...where, urgency: ReferralUrgency.URGENT } }),
    prisma.referral.count({ where: { ...where, urgency: ReferralUrgency.EMERGENCY } }),
  ]);

  return {
    totalReferrals,
    urgentReferrals,
    emergencyReferrals,
    byUrgency: await prisma.referral.groupBy({
      by: ['urgency'],
      where,
      _count: true,
    }),
  };
}
