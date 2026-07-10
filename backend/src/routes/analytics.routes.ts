import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";
import { authenticate, authorizeMinRole } from "../middleware/auth.middleware";
import { UserRole } from "../generated/prisma";

const router = Router();

// ─── Public-ish (authenticated) ──────────────────────────────────────────────
router.get("/settings",      authenticate, analyticsController.getSystemSettings);
router.put("/settings",      authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.updateSystemSettings);

// ─── Manager+ only ───────────────────────────────────────────────────────────
router.get("/capacity",             authenticate, authorizeMinRole(UserRole.NURSE_OFFICER), analyticsController.getCapacityInfo);
router.get("/appointments/stats",   authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.getBookingStats);
router.get("/queue/metrics",        authenticate, authorizeMinRole(UserRole.NURSE_OFFICER), analyticsController.getDailyQueueMetrics);
router.get("/queue/analytics",      authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.getQueueAnalytics);
router.get("/health/analytics",     authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.getHealthAnalytics);
router.get("/health",               authenticate, authorizeMinRole(UserRole.NURSE_OFFICER), analyticsController.getHealthAnalytics);

// ─── Nurse Analytics (using shared Admin logic) ─────────────────────────────
router.get("/nurse/analytics",      authenticate, authorizeMinRole(UserRole.NURSE_OFFICER), analyticsController.getNurseAnalytics);

// ─── Staff / User management ─────────────────────────────────────────────────
router.get("/users/staff",          authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.getStaffUsers);
router.post("/users/staff",         authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.createStaffUser);
router.put("/users/:userId",        authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.updateStaffUser);
router.delete("/users/:userId",     authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.deleteStaffUser);
router.post("/users/:userId/reset-password", authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.resetUserPassword);
router.patch("/users/:userId/toggle", authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.toggleUserStatus);

// ─── Audit logs ──────────────────────────────────────────────────────────────
router.get("/audit-logs",           authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.getAuditLogs);

// ─── Trends (daily / weekly / monthly) ───────────────────────────────────────
router.get("/trends",               authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.getTrends);
router.get("/health-by-center",     authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.getHealthByCenter);
router.get("/vitals-trends",        authenticate, authorizeMinRole(UserRole.MANAGER), analyticsController.getVitalsTrends);

export default router;
