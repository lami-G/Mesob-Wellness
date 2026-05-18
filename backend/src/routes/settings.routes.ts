import { Router } from "express";
import * as SettingsController from "../controllers/settings.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET /api/v1/settings/public
 * Public maintenance-mode status
 */
router.get("/public", SettingsController.getPublicSettings);

// All settings routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/settings
 * Get all system settings
 */
router.get("/", SettingsController.getSettings);

/**
 * PUT /api/v1/settings
 * Update system settings
 */
router.put("/", SettingsController.updateSettings);

export default router;
