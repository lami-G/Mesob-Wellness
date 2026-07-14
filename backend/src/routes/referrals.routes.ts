import { Router } from 'express';
import {
  createReferral,
  getAllReferrals,
  getReferral,
  getPatientReferrals,
  updateReferral,
  deleteReferral,
  getReferralStats,
} from '../controllers/referral.controller';
import { authenticate, authorizeMinRole } from '../middleware/auth.middleware';
import { UserRole } from '../generated/prisma';

const router = Router();

/**
 * Referral Routes
 * All routes require authentication
 * Most routes require NURSE_OFFICER role or above
 */

// Get referral statistics - NURSE_OFFICER and above
router.get(
  '/stats/overview',
  authenticate,
  authorizeMinRole(UserRole.NURSE_OFFICER),
  getReferralStats
);

// Get all referrals with filters - NURSE_OFFICER and above
router.get(
  '/',
  authenticate,
  authorizeMinRole(UserRole.NURSE_OFFICER),
  getAllReferrals
);

// Create a new referral - NURSE_OFFICER and above
router.post(
  '/',
  authenticate,
  authorizeMinRole(UserRole.NURSE_OFFICER),
  createReferral
);

// Get referrals for a specific patient - NURSE_OFFICER and above (or own referrals)
router.get(
  '/patient/:patientId',
  authenticate,
  authorizeMinRole(UserRole.STAFF), // Patients can view their own
  getPatientReferrals
);

// Get a specific referral by ID - NURSE_OFFICER and above (or own referral)
router.get(
  '/:id',
  authenticate,
  authorizeMinRole(UserRole.STAFF), // Patients can view their own
  getReferral
);

// Update a referral - NURSE_OFFICER and above
router.put(
  '/:id',
  authenticate,
  authorizeMinRole(UserRole.NURSE_OFFICER),
  updateReferral
);

// Delete a referral - MANAGER and above
router.delete(
  '/:id',
  authenticate,
  authorizeMinRole(UserRole.MANAGER),
  deleteReferral
);

export default router;
