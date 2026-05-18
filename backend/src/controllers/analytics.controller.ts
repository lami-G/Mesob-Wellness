import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppointmentStatus, UserRole } from "../generated/prisma";
import bcrypt from "bcryptjs";
import { generateNextDisplayId } from "../utils/sequentialId";

// ─── System Settings ──────────────────────────────────────────────────────────
export async function getSystemSettings(req: Request, res: Response) {
  try {
    const settings = {
      dailySlotLimit: 36,
      appointmentIntervalMinutes: 15,
      walkInEnabled: true,
      autoConfirmBookings: false,
    };
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching system settings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch system settings" });
  }
}

export async function updateSystemSettings(req: Request, res: Response) {
  try {
    const updatedSettings = {
      dailySlotLimit: req.body.dailySlotLimit || 36,
      appointmentIntervalMinutes: req.body.appointmentIntervalMinutes || 15,
      walkInEnabled: req.body.walkInEnabled !== undefined ? req.body.walkInEnabled : true,
      autoConfirmBookings: req.body.autoConfirmBookings !== undefined ? req.body.autoConfirmBookings : false,
    };
    res.json({ success: true, data: updatedSettings });
  } catch (error) {
    console.error("Error updating system settings:", error);
    res.status(500).json({ success: false, message: "Failed to update system settings" });
  }
}

// ─── Capacity Management (real DB) ───────────────────────────────────────────
export async function getCapacityInfo(req: Request, res: Response) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const slotsUsed = await prisma.appointment.count({
      where: {
        scheduledAt: { gte: startOfDay, lte: endOfDay },
        status: { notIn: [AppointmentStatus.CANCELLED] },
      },
    });

    const dailyLimit = 36; // 9 hours × 4 slots per hour = 36 slots
    const slotsRemaining = Math.max(0, dailyLimit - slotsUsed);
    const utilizationPct = Math.round((slotsUsed / dailyLimit) * 100);

    res.json({
      success: true,
      data: {
        dailyLimit,
        slotsUsed,
        slotsRemaining,
        utilizationPct,
        date: today.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error fetching capacity info:", error);
    res.status(500).json({ success: false, message: "Failed to fetch capacity information" });
  }
}

// ─── Booking Statistics (real DB) ────────────────────────────────────────────
export async function getBookingStats(req: Request, res: Response) {
  try {
    const today = new Date();
    const startOfDay  = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay    = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Today's appointments
    const [
      totalToday,
      completedToday,
      cancelledToday,
      noShowToday,
      inProgressToday,
      pendingToday,
      totalWeek,
      noShowWeek,
      totalAllTime,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      prisma.appointment.count({ where: { scheduledAt: { gte: startOfDay, lte: endOfDay } } }),
      prisma.appointment.count({ where: { scheduledAt: { gte: startOfDay, lte: endOfDay }, status: AppointmentStatus.COMPLETED } }),
      prisma.appointment.count({ where: { scheduledAt: { gte: startOfDay, lte: endOfDay }, status: AppointmentStatus.CANCELLED } }),
      prisma.appointment.count({ where: { scheduledAt: { gte: startOfDay, lte: endOfDay }, status: AppointmentStatus.NO_SHOW } }),
      prisma.appointment.count({ where: { scheduledAt: { gte: startOfDay, lte: endOfDay }, status: AppointmentStatus.IN_PROGRESS } }),
      prisma.appointment.count({ where: { scheduledAt: { gte: startOfDay, lte: endOfDay }, status: AppointmentStatus.PENDING } }),
      prisma.appointment.count({ where: { scheduledAt: { gte: startOfWeek } } }),
      prisma.appointment.count({ where: { scheduledAt: { gte: startOfWeek }, status: AppointmentStatus.NO_SHOW } }),
      prisma.appointment.count(),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
    ]);

    // Average service time from completed appointments that have startedAt + completedAt
    const completedWithTimes = await prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.COMPLETED,
        startedAt: { not: null },
        completedAt: { not: null },
      },
      select: { startedAt: true, completedAt: true },
      take: 100,
      orderBy: { completedAt: "desc" },
    });

    let averageServiceTime = 0;
    if (completedWithTimes.length > 0) {
      const totalMinutes = completedWithTimes.reduce((sum, apt) => {
        if (apt.startedAt && apt.completedAt) {
          return sum + (apt.completedAt.getTime() - apt.startedAt.getTime()) / 60000;
        }
        return sum;
      }, 0);
      averageServiceTime = Math.round(totalMinutes / completedWithTimes.length);
    }

    const noShowRate = totalWeek > 0 ? Math.round((noShowWeek / totalWeek) * 100 * 10) / 10 : 0;

    res.json({
      success: true,
      data: {
        // Today
        totalAppointments: totalToday,
        completedToday,
        cancelledToday,
        noShowToday,
        inProgressToday,
        pendingToday,
        // Week
        totalWeek,
        noShowRate,
        // All time
        totalAllTime,
        // Users
        totalUsers,
        activeUsers,
        // Service
        averageServiceTime,
        date: today.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch booking statistics" });
  }
}

// ─── Queue Analytics (real DB) ───────────────────────────────────────────────
export async function getQueueAnalytics(req: Request, res: Response) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Current queue = PENDING + IN_PROGRESS today
    const [currentQueue, completedToday, totalToday] = await Promise.all([
      prisma.appointment.count({
        where: {
          scheduledAt: { gte: startOfDay, lte: endOfDay },
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.IN_PROGRESS] },
        },
      }),
      prisma.appointment.count({
        where: { scheduledAt: { gte: startOfDay, lte: endOfDay }, status: AppointmentStatus.COMPLETED },
      }),
      prisma.appointment.count({
        where: {
          scheduledAt: { gte: startOfDay, lte: endOfDay },
          status: { notIn: [AppointmentStatus.CANCELLED] },
        },
      }),
    ]);

    // Peak hours — count appointments per hour today
    const todayAppointments = await prisma.appointment.findMany({
      where: { scheduledAt: { gte: startOfDay, lte: endOfDay } },
      select: { scheduledAt: true },
    });

    const hourCounts: Record<number, number> = {};
    todayAppointments.forEach((apt) => {
      const hour = apt.scheduledAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    // Avg wait time from confirmed → in_progress
    const confirmedToStarted = await prisma.appointment.findMany({
      where: {
        confirmedAt: { not: null },
        startedAt: { not: null },
        scheduledAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { confirmedAt: true, startedAt: true },
      take: 50,
    });

    let averageWaitTime = 0;
    if (confirmedToStarted.length > 0) {
      const totalWait = confirmedToStarted.reduce((sum, apt) => {
        if (apt.confirmedAt && apt.startedAt) {
          return sum + (apt.startedAt.getTime() - apt.confirmedAt.getTime()) / 60000;
        }
        return sum;
      }, 0);
      averageWaitTime = Math.round(totalWait / confirmedToStarted.length);
    }

    res.json({
      success: true,
      data: {
        currentQueueSize: currentQueue,
        averageWaitTime,
        completionRate,
        completedToday,
        totalToday,
        peakHours,
        efficiencyMetrics: {
          completionRate,
          onTimeRate: completionRate,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching queue analytics:", error);
    res.status(500).json({ success: false, message: "Failed to fetch queue analytics" });
  }
}

// ─── Daily Queue Metrics (Appointments, Walk-ins, Patients Served) ──────────
export async function getDailyQueueMetrics(req: Request, res: Response) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Get all completed appointments today
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: startOfDay, lte: endOfDay },
        status: AppointmentStatus.COMPLETED,
      },
      select: { userId: true, id: true },
    });

    const completedCount = completedAppointments.length;
    const completedUserIds = new Set(completedAppointments.map(apt => apt.userId));

    // Get all vital records today
    const vitalsToday = await prisma.vitalRecord.findMany({
      where: {
        recordedAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { userId: true },
    });

    // Count walk-ins: vital records for users WITHOUT completed appointments on this day
    const walkInCount = vitalsToday.filter(v => !completedUserIds.has(v.userId)).length;

    // Get total appointments today (all statuses except CANCELLED)
    const totalAppointmentsToday = await prisma.appointment.count({
      where: {
        scheduledAt: { gte: startOfDay, lte: endOfDay },
        status: { not: AppointmentStatus.CANCELLED },
      },
    });

    // Patients served = completed appointments + walk-ins
    const patientsServed = completedCount + walkInCount;

    res.json({
      success: true,
      data: {
        appointments: totalAppointmentsToday,
        walkIns: walkInCount,
        patientsServed: patientsServed,
        completedAppointments: completedCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching daily queue metrics:", error);
    res.status(500).json({ success: false, message: "Failed to fetch daily queue metrics" });
  }
}

// ─── Health Analytics (real DB) ──────────────────────────────────────────────
export async function getHealthAnalytics(req: Request, res: Response) {
  try {
    const { dateRange, center, condition } = req.query;
    
    // Calculate date filter
    let dateFilter: any = {};
    if (dateRange && dateRange !== 'all') {
      const days = parseInt(dateRange as string) || 30;
      const startDate = new Date();
      const endDate = new Date();
      
      if (days === 0) {
        // Today only
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        dateFilter = { gte: startDate, lte: endDate };
      } else {
        // Last N days
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        dateFilter = { gte: startDate, lte: endDate };
      }
    }

    // Build center filter for queries
    let centerFilter: any = {};
    if (center && center !== 'all') {
      centerFilter = { recorder: { centerId: center as string } };
    }

    const totalPatients = await prisma.user.count({
      where: { role: UserRole.STAFF, ...(center && center !== 'all' ? { centerId: center as string } : {}) },
    });

    // Get patient conditions from patient_conditions table (nurse-approved only)
    // Filter by date if provided and center if provided
    // For center filtering, we need to find patients whose vitals were recorded at that center
    let patientConditionWhere: any = {
      isNurseApproved: true,
      ...(Object.keys(dateFilter).length > 0 && { calculatedAt: dateFilter }),
    };

    if (center && center !== 'all') {
      // Get all patients who have vitals recorded at this center
      const patientsAtCenter = await prisma.vitalRecord.findMany({
        where: { recorder: { centerId: center as string } },
        select: { userId: true },
        distinct: ['userId'],
      });
      const patientIds = patientsAtCenter.map(v => v.userId);
      patientConditionWhere.patientId = { in: patientIds };
    }

    const nurseApprovedConditions = await prisma.patientCondition.findMany({
      where: patientConditionWhere,
      select: { conditions: true },
    });

    // Count occurrences of each condition
    const conditionCounts: Record<string, number> = {};
    nurseApprovedConditions.forEach((record) => {
      const conditions = record.conditions as string[];
      conditions.forEach((cond) => {
        conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
      });
    });

    // Filter by selected condition if provided
    let patientConditions = Object.entries(conditionCounts)
      .map(([cond, count]) => ({ condition: cond, count }))
      .sort((a, b) => b.count - a.count);

    if (condition && condition !== 'all') {
      patientConditions = patientConditions.filter(
        (item) => item.condition.toLowerCase() === (condition as string).toLowerCase()
      );
    }

    // BP analytics from vital_records
    let bpWhere: any = {
      systolic: { not: null },
      diastolic: { not: null },
      ...(Object.keys(dateFilter).length > 0 && { recordedAt: dateFilter }),
      ...centerFilter,
    };

    const bpRecords = await prisma.vitalRecord.findMany({
      where: bpWhere,
      select: { systolic: true, diastolic: true, bpCategory: true },
      orderBy: { recordedAt: "desc" },
      take: 200,
    });

    let avgSystolic = 0;
    let avgDiastolic = 0;
    if (bpRecords.length > 0) {
      const totalSys = bpRecords.reduce((s, r) => s + (r.systolic || 0), 0);
      const totalDia = bpRecords.reduce((s, r) => s + (r.diastolic || 0), 0);
      avgSystolic  = Math.round(totalSys / bpRecords.length);
      avgDiastolic = Math.round(totalDia / bpRecords.length);
    }

    // High risk = HYPERTENSION_STAGE_2 or HYPERTENSIVE_CRISIS
    const highRiskBP = bpRecords.filter(
      (r) => r.bpCategory === "HYPERTENSION_STAGE_2" || r.bpCategory === "HYPERTENSIVE_CRISIS"
    ).length;

    // BMI analytics
    const bmiRecords = await prisma.vitalRecord.findMany({
      where: {
        bmi: { not: null },
        ...(Object.keys(dateFilter).length > 0 && { recordedAt: dateFilter }),
        ...centerFilter,
      },
      select: { bmi: true, bmiCategory: true },
      orderBy: { recordedAt: "desc" },
      take: 200,
    });

    let avgBmi = 0;
    if (bmiRecords.length > 0) {
      const totalBmi = bmiRecords.reduce((s, r) => s + (r.bmi || 0), 0);
      avgBmi = Math.round((totalBmi / bmiRecords.length) * 10) / 10;
    }

    const obesityCount = bmiRecords.filter((r) => r.bmiCategory === "OBESITY").length;
    const overweightCount = bmiRecords.filter((r) => r.bmiCategory === "OVERWEIGHT").length;
    const normalBmiCount = bmiRecords.filter((r) => r.bmiCategory === "NORMAL").length;
    const underweightCount = bmiRecords.filter((r) => r.bmiCategory === "UNDERWEIGHT").length;

    // BP risk distribution
    const normalBP = bpRecords.filter((r) => r.bpCategory === "NORMAL").length;
    const elevatedBP = bpRecords.filter((r) => r.bpCategory === "ELEVATED").length;
    const stage1BP = bpRecords.filter((r) => r.bpCategory === "HYPERTENSION_STAGE_1").length;
    const stage2BP = bpRecords.filter((r) => r.bpCategory === "HYPERTENSION_STAGE_2").length;
    const crisisBP = bpRecords.filter((r) => r.bpCategory === "HYPERTENSIVE_CRISIS").length;

    // Feedback stats — use raw query to handle missing columns gracefully
    let feedbackStats = {
      _count: { id: 0 },
      _avg: { npsScore: null as number | null, serviceQuality: null as number | null, staffBehavior: null as number | null, cleanliness: null as number | null, waitTime: null as number | null },
    };
    try {
      feedbackStats = await prisma.feedback.aggregate({
        _avg: {
          npsScore: true,
          serviceQuality: true,
          staffBehavior: true,
          cleanliness: true,
          waitTime: true,
        },
        _count: { id: true },
      }) as typeof feedbackStats;
    } catch {
      // New feedback columns not yet migrated — fall back to basic count
      const count = await prisma.feedback.count();
      feedbackStats._count.id = count;
    }

    // Total vitals recorded
    const totalVitalsRecorded = await prisma.vitalRecord.count({
      where: {
        ...(Object.keys(dateFilter).length > 0 && { recordedAt: dateFilter }),
        ...centerFilter,
      },
    });

    // Calculate critical count (high risk vitals)
    const criticalCount = bpRecords.filter(
      (r) => r.bpCategory === "HYPERTENSIVE_CRISIS"
    ).length;

    res.json({
      success: true,
      data: {
        totalPatients,
        totalVitalsRecorded,
        highRiskCount: highRiskBP,
        criticalCount: criticalCount,
        patientConditions,
        averageBP: { systolic: avgSystolic, diastolic: avgDiastolic },
        averageBmi: avgBmi,
        bpRiskDistribution: {
          normal: normalBP,
          elevated: elevatedBP,
          stage1: stage1BP,
          stage2: stage2BP,
          crisis: crisisBP,
        },
        bmiDistribution: {
          underweight: underweightCount,
          normal: normalBmiCount,
          overweight: overweightCount,
          obesity: obesityCount,
        },
        feedbackStats: {
          total: feedbackStats._count?.id ?? 0,
          avgNps: Math.round(((feedbackStats._avg?.npsScore ?? 0) || 0) * 10) / 10,
          avgServiceQuality: Math.round(((feedbackStats._avg?.serviceQuality ?? 0) || 0) * 10) / 10,
          avgStaffBehavior: Math.round(((feedbackStats._avg?.staffBehavior ?? 0) || 0) * 10) / 10,
          avgCleanliness: Math.round(((feedbackStats._avg?.cleanliness ?? 0) || 0) * 10) / 10,
          avgWaitTime: Math.round(((feedbackStats._avg?.waitTime ?? 0) || 0) * 10) / 10,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching health analytics:", error);
    res.status(500).json({ success: false, message: "Failed to fetch health analytics" });
  }
}

// ─── Staff Users (real DB) ────────────────────────────────────────────────────
export async function getStaffUsers(req: AuthRequest, res: Response) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [
            UserRole.NURSE_OFFICER,
            UserRole.MANAGER,
            UserRole.REGIONAL_OFFICE,
            UserRole.FEDERAL_OFFICE,
            UserRole.SYSTEM_ADMIN,
          ],
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        phone: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching staff users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch staff users" });
  }
}

// ─── Toggle User Active Status (real DB) ─────────────────────────────────────
export async function toggleUserStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.params.userId as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ success: false, message: "Failed to update user status" });
  }
}

// ─── Create Staff User (real DB) ─────────────────────────────────────────────
export async function createStaffUser(req: AuthRequest, res: Response) {
  try {
    const { fullName, email, role, password, phone, centerId } = req.body;

    if (!fullName || !email || !role || !password) {
      res.status(400).json({ success: false, message: "fullName, email, role and password are required" });
      return;
    }

    const allowedRoles: string[] = [
      UserRole.NURSE_OFFICER,
      UserRole.MANAGER,
      UserRole.REGIONAL_OFFICE,
      UserRole.FEDERAL_OFFICE,
      UserRole.SYSTEM_ADMIN,
    ];

    if (!allowedRoles.includes(role)) {
      res.status(400).json({ success: false, message: "Invalid role" });
      return;
    }

    // CRITICAL: Center Managers can ONLY create NURSE_OFFICER accounts
    if (req.user?.role === UserRole.MANAGER && role !== UserRole.NURSE_OFFICER) {
      res.status(403).json({ 
        success: false, 
        message: "Center Managers can only create Nurse Officer accounts" 
      });
      return;
    }

    // Regional and Federal offices can create up to their level
    if (req.user?.role === UserRole.REGIONAL_OFFICE) {
      const regionalAllowed: UserRole[] = [UserRole.NURSE_OFFICER, UserRole.MANAGER];
      if (!regionalAllowed.includes(role)) {
        res.status(403).json({ 
          success: false, 
          message: "Regional Officers can only create Nurse Officer and Manager accounts" 
        });
        return;
      }
    }

    if (req.user?.role === UserRole.FEDERAL_OFFICE) {
      const federalAllowed: UserRole[] = [UserRole.NURSE_OFFICER, UserRole.MANAGER, UserRole.REGIONAL_OFFICE];
      if (!federalAllowed.includes(role)) {
        res.status(403).json({ 
          success: false, 
          message: "Federal Officers can only create Nurse Officer, Manager, and Regional Officer accounts" 
        });
        return;
      }
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ success: false, message: "User with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.$transaction(async (tx) => {
      // Generate sequential userId
      const displayId = await generateNextDisplayId();
      
      const user = await tx.user.create({
        data: {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: role as UserRole,
          isActive: true,
          phone: phone || null,
          centerId: centerId || null,
          userId: displayId,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          phone: true,
          centerId: true,
          createdAt: true,
        },
      });

      await tx.healthProfile.create({ data: { userId: user.id } });

      return user;
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Error creating staff user:", error);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
}

// ─── Update Staff User (real DB) ─────────────────────────────────────────────
export async function updateStaffUser(req: AuthRequest, res: Response) {
  try {
    const userId = req.params.userId as string;
    const { fullName, email, role, phone, centerId } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const allowedRoles: string[] = [
      UserRole.NURSE_OFFICER,
      UserRole.MANAGER,
      UserRole.REGIONAL_OFFICE,
      UserRole.FEDERAL_OFFICE,
      UserRole.SYSTEM_ADMIN,
    ];

    if (role && !allowedRoles.includes(role)) {
      res.status(400).json({ success: false, message: "Invalid role" });
      return;
    }

    // Check if email is being changed and if it's already taken
    if (email && email.toLowerCase() !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing) {
        res.status(409).json({ success: false, message: "Email already in use" });
        return;
      }
    }

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (role) updateData.role = role as UserRole;
    if (phone !== undefined) updateData.phone = phone || null;
    if (centerId !== undefined) updateData.centerId = centerId || null;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
        centerId: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating staff user:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
}

// ─── Audit Logs (real DB) ─────────────────────────────────────────────────────
export async function getAuditLogs(req: AuthRequest, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
}

// ─── Daily / Weekly / Monthly Trends (real DB) ───────────────────────────────
export async function getTrends(req: Request, res: Response) {
  try {
    const now = new Date();

    // ── Daily: last 7 days ──
    const dailyData = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        return Promise.all([
          prisma.appointment.count({ where: { scheduledAt: { gte: start, lte: end } } }),
          prisma.appointment.count({ where: { scheduledAt: { gte: start, lte: end }, status: AppointmentStatus.COMPLETED } }),
          prisma.appointment.count({ where: { scheduledAt: { gte: start, lte: end }, status: AppointmentStatus.NO_SHOW } }),
        ]).then(([total, completed, noShow]) => ({ label, total, completed, noShow }));
      })
    );

    // ── Weekly: last 8 weeks ──
    const weeklyData = await Promise.all(
      Array.from({ length: 8 }, (_, i) => {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() - (7 - i) * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const label = `W${i + 1}`;
        return Promise.all([
          prisma.appointment.count({ where: { scheduledAt: { gte: weekStart, lte: weekEnd } } }),
          prisma.appointment.count({ where: { scheduledAt: { gte: weekStart, lte: weekEnd }, status: AppointmentStatus.COMPLETED } }),
          prisma.user.count({ where: { createdAt: { gte: weekStart, lte: weekEnd } } }),
        ]).then(([total, completed, newUsers]) => ({ label, total, completed, newUsers }));
      })
    );

    // ── Monthly: last 6 months ──
    const monthlyData = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
        const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const label = d.toLocaleDateString('en-US', { month: 'short' });
        return Promise.all([
          prisma.appointment.count({ where: { scheduledAt: { gte: start, lte: end } } }),
          prisma.appointment.count({ where: { scheduledAt: { gte: start, lte: end }, status: AppointmentStatus.COMPLETED } }),
          prisma.appointment.count({ where: { scheduledAt: { gte: start, lte: end }, status: AppointmentStatus.NO_SHOW } }),
          prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
          prisma.vitalRecord.count({ where: { recordedAt: { gte: start, lte: end } } }),
        ]).then(([total, completed, noShow, newUsers, vitals]) => ({
          label, total, completed, noShow, newUsers, vitals,
        }));
      })
    );

    res.json({ success: true, data: { daily: dailyData, weekly: weeklyData, monthly: monthlyData } });
  } catch (error) {
    console.error("Error fetching trends:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trends" });
  }
}


// ─── Health Analytics by Center ───────────────────────────────────────────────
export async function getHealthByCenter(req: Request, res: Response) {
  try {
    // Get all centers
    const centers = await prisma.center.findMany({
      select: { id: true, name: true },
    });

    // For each center, calculate health metrics
    const centerHealthData = await Promise.all(
      centers.map(async (center) => {
        // Get vitals for this center
        const vitals = await prisma.vitalRecord.findMany({
          where: {
            user: {
              centerId: center.id,
            },
          },
          select: {
            systolic: true,
            diastolic: true,
            glucose: true,
            bmi: true,
            bpCategory: true,
          },
          orderBy: { recordedAt: 'desc' },
          take: 100,
        });

        // Calculate averages
        let avgSystolic = 0;
        let avgGlucose = 0;
        let avgBMI = 0;
        let healthyCount = 0;

        if (vitals.length > 0) {
          const totalSys = vitals.reduce((s, v) => s + (v.systolic || 0), 0);
          const totalGlucose = vitals.reduce((s, v) => s + (v.glucose || 0), 0);
          const totalBMI = vitals.reduce((s, v) => s + (v.bmi || 0), 0);

          avgSystolic = Math.round(totalSys / vitals.length);
          avgGlucose = Math.round(totalGlucose / vitals.length);
          avgBMI = Math.round((totalBMI / vitals.length) * 10) / 10;

          // Count healthy (normal BP and normal BMI)
          healthyCount = vitals.filter(
            (v) => v.bpCategory === 'NORMAL' || v.bpCategory === 'ELEVATED'
          ).length;
        }

        const healthyPercent = vitals.length > 0 ? Math.round((healthyCount / vitals.length) * 100) : 0;

        return {
          centerName: center.name,
          centerId: center.id,
          avgSystolic,
          avgGlucose,
          avgBMI,
          healthyPercent,
          totalVitals: vitals.length,
        };
      })
    );

    res.json({ success: true, data: centerHealthData });
  } catch (error) {
    console.error('Error fetching health by center:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch health by center' });
  }
}

// ─── Vital Signs Trends ───────────────────────────────────────────────────────
export async function getVitalsTrends(req: Request, res: Response) {
  try {
    const { dateRange = '30' } = req.query;
    const days = parseInt(dateRange as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily averages for the last N days
    const trendsData = await Promise.all(
      Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

        return prisma.vitalRecord.aggregate({
          where: {
            recordedAt: { gte: dayStart, lte: dayEnd },
          },
          _avg: {
            systolic: true,
            diastolic: true,
            heartRate: true,
            bmi: true,
            temperature: true,
            oxygenSaturation: true,
          },
        }).then((agg) => ({
          date: dayStart.toISOString(),
          avgSystolic: Math.round(agg._avg.systolic || 0),
          avgDiastolic: Math.round(agg._avg.diastolic || 0),
          avgHeartRate: Math.round(agg._avg.heartRate || 0),
          avgBMI: Math.round((agg._avg.bmi || 0) * 10) / 10,
          avgTemperature: Math.round((agg._avg.temperature || 0) * 10) / 10,
          avgOxygenSaturation: Math.round(agg._avg.oxygenSaturation || 0),
        }));
      })
    );

    res.json({ success: true, data: trendsData });
  } catch (error) {
    console.error('Error fetching vitals trends:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vitals trends' });
  }
}
