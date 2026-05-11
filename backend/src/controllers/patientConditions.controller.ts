/**
 * Patient Conditions Controller
 * 
 * Handles API endpoints for patient health conditions
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as PatientConditionsService from '../services/patientConditions.service';

/**
 * GET /api/v1/conditions/:patientId
 * Get conditions for a specific patient
 */
export async function getPatientConditions(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const { patientId } = req.params;

    if (!patientId || typeof patientId !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Invalid patientId parameter',
      });
      return;
    }

    const conditions = await PatientConditionsService.getPatientConditions(patientId);

    if (!conditions) {
      res.status(200).json({
        status: 'success',
        data: {
          patientId,
          conditions: [],
          isNurseApproved: false,
          calculatedAt: null,
        },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: conditions.id,
        patientId: conditions.patientId,
        conditions: conditions.conditions,
        isNurseApproved: conditions.isNurseApproved,
        calculatedAt: conditions.calculatedAt,
        approvedAt: conditions.approvedAt,
        approvedBy: conditions.approvedBy,
        approver: conditions.approver,
      },
    });
  } catch (error) {
    console.error('Get patient conditions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve patient conditions',
    });
  }
}

/**
 * PUT /api/v1/conditions/:patientId
 * Update conditions for a patient (nurse approval)
 */
export async function updatePatientConditions(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    // Authorization: Only nurses and above can update conditions
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
        message: 'Insufficient permissions to update patient conditions',
      });
      return;
    }

    const { patientId } = req.params;
    const { conditions, isNurseApproved } = req.body;

    if (!patientId || typeof patientId !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Invalid patientId parameter',
      });
      return;
    }

    if (!Array.isArray(conditions)) {
      res.status(400).json({
        status: 'error',
        message: 'conditions must be an array',
      });
      return;
    }

    const approvedBy = isNurseApproved ? req.user.userId : undefined;

    const updated = await PatientConditionsService.upsertPatientConditions(
      patientId,
      conditions,
      isNurseApproved || false,
      approvedBy
    );

    res.status(200).json({
      status: 'success',
      data: {
        id: updated.id,
        patientId: updated.patientId,
        conditions: updated.conditions,
        isNurseApproved: updated.isNurseApproved,
        calculatedAt: updated.calculatedAt,
        approvedAt: updated.approvedAt,
        approvedBy: updated.approvedBy,
      },
    });
  } catch (error) {
    console.error('Update patient conditions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update patient conditions',
    });
  }
}

/**
 * GET /api/v1/conditions/period
 * Get aggregated condition counts for a date range
 */
export async function getConditionsByPeriod(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        status: 'error',
        message: 'startDate and endDate are required',
      });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid date format',
      });
      return;
    }

    // Get all nurse-approved conditions within the date range
    const conditions = await PatientConditionsService.getConditionsByDateRange(start, end);

    // Aggregate condition counts
    const conditionCounts: Record<string, number> = {};
    conditions.forEach((record) => {
      const conditionList = record.conditions as string[];
      conditionList.forEach((condition) => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      });
    });

    // Convert to array format
    const result = Object.entries(conditionCounts).map(([condition, count]) => ({
      condition,
      count,
    }));

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Get conditions by period error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve conditions for period',
    });
  }
}
