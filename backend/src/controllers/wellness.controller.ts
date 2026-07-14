import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as WellnessService from "../services/wellness.service";
import prisma from "../config/prisma";
import { queueWellnessPlan } from "../services/queue.service";

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

  // Finally try to find by appointment ID (if it's a UUID)
  if (isUUID) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: trimmedId },
      select: { userId: true },
    });

    if (appointment) {
      return appointment.userId;
    }
  }

  return null;
}

/**
 * POST /api/v1/plans
 * Create a new wellness plan
 */
export const createWellnessPlan = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    const { 
      userId, 
      title,
      nutritionRecommendations,
      exerciseRecommendations,
      stressManagementAdvice,
      goals, 
      duration,
      conditions
    } = req.body;

    // Validate required fields
    if (!userId || !title) {
      res.status(400).json({
        status: "error",
        message: "userId and title are required",
      });
      return;
    }

    // Build planText from structured fields
    let planText = `# ${title}\n\n`;
    
    if (nutritionRecommendations) {
      planText += `## 🥗 Nutrition Recommendations\n${nutritionRecommendations}\n\n`;
    }
    
    if (exerciseRecommendations) {
      planText += `## 🏃 Exercise Recommendations\n${exerciseRecommendations}\n\n`;
    }
    
    if (stressManagementAdvice) {
      planText += `## 🧘 Stress Management\n${stressManagementAdvice}\n\n`;
    }

    // Convert goals array to string
    let goalsString = '';
    if (Array.isArray(goals) && goals.length > 0) {
      goalsString = goals.join('\n');
    } else if (typeof goals === 'string') {
      goalsString = goals;
    }

    // Authorization: Only NURSE_OFFICER and above can create wellness plans
    const allowedRoles = [
      "NURSE_OFFICER",
      "MANAGER",
      "REGIONAL_OFFICE",
      "FEDERAL_OFFICE",
      "SYSTEM_ADMIN",
    ];
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: "error",
        message: "Insufficient permissions to create wellness plans",
      });
      return;
    }

    const plan = await WellnessService.createWellnessPlan({
      userId,
      planText,
      goals: goalsString,
      duration,
      conditions: Array.isArray(conditions) ? conditions : undefined,
    }, req.user.userId);

    // Send wellness plan email with vitals to patient
    try {
      const patient = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true },
      });

      if (patient?.email) {
        // Fetch latest vitals for this patient
        const latestVitals = await prisma.vitalRecord.findFirst({
          where: { userId },
          orderBy: { recordedAt: 'desc' },
        });

        // Prepare vitals data if available
        const vitalsData = latestVitals ? {
          bloodPressure: latestVitals.systolic && latestVitals.diastolic 
            ? `${latestVitals.systolic}/${latestVitals.diastolic}` 
            : undefined,
          heartRate: latestVitals.heartRate ?? undefined,
          temperature: latestVitals.temperature ?? undefined,
          weight: latestVitals.weightKg ?? undefined,
          height: latestVitals.heightCm ?? undefined,
          bmi: latestVitals.bmi ?? undefined,
          glucose: latestVitals.glucose ?? undefined,
          glucoseType: latestVitals.glucoseType ?? undefined,
          recordedAt: latestVitals.recordedAt,
        } : undefined;

        await queueWellnessPlan({
          recipientEmail: patient.email,
          patientName: patient.fullName,
          planTitle: title || 'Your Wellness Plan',
          planContent: {
            nutritionRecommendations,
            exerciseRecommendations,
            stressManagementAdvice,
            goals: goalsString,
            duration,
          },
          vitalsData,
        });
        console.log(`📧 Wellness plan email (with vitals) queued for ${patient.email}`);
      } else {
        console.warn(`⚠️ Cannot send wellness plan email - patient has no email (userId: ${userId})`);
      }
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to queue wellness plan email:', emailError);
    }

    res.status(201).json({
      status: "success",
      data: {
        id: plan.id,
        userId: plan.userId,
        createdAt: plan.createdAt,
      },
    });
  } catch (error) {
    console.error("Create wellness plan error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create wellness plan",
    });
  }
};

/**
 * GET /api/v1/plans/:userId
 * Get wellness plans for a user
 */
export const getWellnessPlans = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    const rawUserId = req.params.userId;
    const { activeOnly } = req.query;

    // Ensure userId is a string
    if (!rawUserId || typeof rawUserId !== "string") {
      res.status(400).json({
        status: "error",
        message: "Invalid userId parameter",
      });
      return;
    }

    // Resolve the userId (could be 4-digit display ID or UUID)
    const resolvedUserId = await resolvePatientUserId(rawUserId);
    
    if (!resolvedUserId) {
      res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
      return;
    }

    // Authorization: Users can view their own plans, staff can view any
    const allowedRoles = [
      "NURSE_OFFICER",
      "MANAGER",
      "REGIONAL_OFFICE",
      "FEDERAL_ADMIN",
    ];
    // Check if user is viewing their own data or has staff privileges
    const isViewingOwnData = req.user.userId === rawUserId || req.user.userId === resolvedUserId;
    if (!isViewingOwnData && !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: "error",
        message: "Insufficient permissions to view wellness plans",
      });
      return;
    }

    const plans = await WellnessService.getWellnessPlans(
      resolvedUserId,
      activeOnly === "true",
    );

    res.status(200).json({
      status: "success",
      data: plans.map((plan) => ({
        id: plan.id,
        userId: plan.userId,
        planText: plan.planText,
        goals: plan.goals,
        duration: plan.duration,
        isActive: plan.isActive,
        updatedAt: plan.updatedAt,
        createdAt: plan.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get wellness plans error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve wellness plans",
    });
  }
};

/**
 * GET /api/v1/plans/all/list
 * Get all wellness plans (for analytics)
 */
export const getAllWellnessPlans = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    // Authorization: Only staff can view all plans
    const allowedRoles = [
      "NURSE_OFFICER",
      "MANAGER",
      "REGIONAL_OFFICE",
      "FEDERAL_OFFICE",
      "SYSTEM_ADMIN",
    ];
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: "error",
        message: "Insufficient permissions to view all wellness plans",
      });
      return;
    }

    const plans = await WellnessService.getAllWellnessPlans();

    res.status(200).json({
      status: "success",
      data: plans,
    });
  } catch (error) {
    console.error("Get all wellness plans error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve wellness plans",
    });
  }
};


/**
 * PUT /api/v1/plans/:id
 * Update an existing wellness plan
 */
export const updateWellnessPlan = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    const { id } = req.params;
    if (!id || typeof id !== "string") {
      res.status(400).json({
        status: "error",
        message: "Invalid plan id",
      });
      return;
    }

    const existing = await WellnessService.getWellnessPlanById(id);
    if (!existing) {
      res.status(404).json({
        status: "error",
        message: "Wellness plan not found",
      });
      return;
    }

    const allowedRoles = [
      "NURSE_OFFICER",
      "MANAGER",
      "REGIONAL_OFFICE",
      "FEDERAL_ADMIN",
    ];
    const canEdit =
      req.user.userId === existing.userId ||
      allowedRoles.includes(req.user.role);
    if (!canEdit) {
      res.status(403).json({
        status: "error",
        message: "Insufficient permissions to update this wellness plan",
      });
      return;
    }

    const { planText, goals, duration, isActive } = req.body as {
      planText?: unknown;
      goals?: unknown;
      duration?: unknown;
      isActive?: unknown;
    };

    const normalizeGoals = () => {
      if (Array.isArray(goals)) {
        return goals
          .map((goal: any) => {
            if (typeof goal === "string") return goal.trim();
            if (
              goal &&
              typeof goal === "object" &&
              typeof goal.title === "string"
            ) {
              return `${goal.completed ? "[x]" : "[ ]"} ${goal.title.trim()}`;
            }
            return "";
          })
          .filter(Boolean)
          .join("\n");
      }

      if (typeof goals === "string") {
        return goals;
      }

      return undefined;
    };

    const updated = await WellnessService.updateWellnessPlan(id, {
      planText: typeof planText === "string" ? planText : undefined,
      goals: normalizeGoals(),
      duration: typeof duration === "number" ? duration : undefined,
      isActive: typeof isActive === "boolean" ? isActive : undefined,
    });

    // Send updated wellness plan email with vitals to patient
    try {
      const patient = await prisma.user.findUnique({
        where: { id: updated.userId },
        select: { email: true, fullName: true },
      });

      if (patient?.email) {
        // Fetch latest vitals for this patient
        const latestVitals = await prisma.vitalRecord.findFirst({
          where: { userId: updated.userId },
          orderBy: { recordedAt: 'desc' },
        });

        // Prepare vitals data if available
        const vitalsData = latestVitals ? {
          bloodPressure: latestVitals.systolic && latestVitals.diastolic 
            ? `${latestVitals.systolic}/${latestVitals.diastolic}` 
            : undefined,
          heartRate: latestVitals.heartRate ?? undefined,
          temperature: latestVitals.temperature ?? undefined,
          weight: latestVitals.weightKg ?? undefined,
          height: latestVitals.heightCm ?? undefined,
          bmi: latestVitals.bmi ?? undefined,
          glucose: latestVitals.glucose ?? undefined,
          glucoseType: latestVitals.glucoseType ?? undefined,
          recordedAt: latestVitals.recordedAt,
        } : undefined;

        // Parse planText to extract sections (it's formatted as markdown)
        const planTextStr = updated.planText || '';
        const nutritionMatch = planTextStr.match(/## 🥗 Nutrition Recommendations\n([\s\S]*?)(?=\n##|$)/);
        const exerciseMatch = planTextStr.match(/## 🏃 Exercise Recommendations\n([\s\S]*?)(?=\n##|$)/);
        const stressMatch = planTextStr.match(/## 🧘 Stress Management\n([\s\S]*?)(?=\n##|$)/);

        await queueWellnessPlan({
          recipientEmail: patient.email,
          patientName: patient.fullName,
          planTitle: 'Your Updated Wellness Plan',
          planContent: {
            nutritionRecommendations: nutritionMatch ? nutritionMatch[1].trim() : undefined,
            exerciseRecommendations: exerciseMatch ? exerciseMatch[1].trim() : undefined,
            stressManagementAdvice: stressMatch ? stressMatch[1].trim() : undefined,
            goals: updated.goals || undefined,
            duration: updated.duration ?? undefined,
          },
          vitalsData,
        });
        console.log(`📧 Updated wellness plan email (with vitals) queued for ${patient.email}`);
      }
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to queue updated wellness plan email:', emailError);
    }

    res.status(200).json({
      status: "success",
      data: {
        id: updated.id,
        userId: updated.userId,
        planText: updated.planText,
        goals: updated.goals,
        duration: updated.duration,
        isActive: updated.isActive,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update wellness plan error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update wellness plan",
    });
  }
};
