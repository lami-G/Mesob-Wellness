/**
 * Patient Conditions Service
 * 
 * Manages CRUD operations for patient health conditions
 */

import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma';

/**
 * Upsert patient conditions (create or update)
 * 
 * @param patientId - Patient user ID
 * @param conditions - Array of condition strings
 * @param isNurseApproved - Whether conditions are nurse-approved
 * @param approvedBy - Nurse user ID (required if isNurseApproved is true)
 * @param transactionClient - Optional Prisma transaction client
 * @returns Created or updated patient condition record
 */
export async function upsertPatientConditions(
  patientId: string,
  conditions: string[],
  isNurseApproved: boolean,
  approvedBy?: string,
  transactionClient?: Prisma.TransactionClient
) {
  const client = transactionClient || prisma;

  const data: any = {
    conditions: conditions,
    calculatedAt: new Date(),
    isNurseApproved,
    updatedAt: new Date(),
  };

  if (isNurseApproved) {
    data.approvedAt = new Date();
    data.approvedBy = approvedBy || null;
  } else {
    // Reset approval fields when conditions are recalculated
    data.approvedAt = null;
    data.approvedBy = null;
  }

  return await client.patientCondition.upsert({
    where: { patientId },
    update: data,
    create: {
      patientId,
      ...data,
    },
  });
}

/**
 * Get patient conditions by patient ID
 * 
 * @param patientId - Patient user ID
 * @returns Patient condition record or null
 */
export async function getPatientConditions(patientId: string) {
  return await prisma.patientCondition.findUnique({
    where: { patientId },
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      approver: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
}

/**
 * Get all nurse-approved conditions
 * 
 * @returns Array of nurse-approved patient condition records
 */
export async function getAllNurseApprovedConditions() {
  return await prisma.patientCondition.findMany({
    where: { isNurseApproved: true },
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      approver: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      approvedAt: 'desc',
    },
  });
}

/**
 * Get all nurse-approved conditions within a date range
 */
export async function getConditionsByDateRange(
  startDate: Date,
  endDate: Date
) {
  return await prisma.patientCondition.findMany({
    where: {
      isNurseApproved: true,
      approvedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      conditions: true,
    },
  });
}
