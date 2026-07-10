import prisma from "../config/prisma";
import { AppointmentStatus } from "../generated/prisma";
import {
  UserFilters,
  CenterFilters,
  AppointmentFilters,
  VitalFilters,
  FeedbackFilters,
  AuditFilters,
  DashboardMetrics,
  PaginatedResponse,
} from "../types/admin.types";

/**
 * Shared helper: Calculate appointments, walk-ins, and patients served
 * Same logic used by nurse analytics dashboard
 * @param startDate Start date for calculation
 * @param endDate End date for calculation
 * @param userWhere Optional filter for users (center/region based)
 */
async function calculateQueueMetrics(
  startDate: Date,
  endDate: Date,
  userWhere?: any,
) {
  try {
    const appointmentStatuses: AppointmentStatus[] = [
      AppointmentStatus.WAITING,
      AppointmentStatus.IN_PROGRESS,
      AppointmentStatus.IN_SERVICE,
      AppointmentStatus.NO_SHOW,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.PENDING,
      AppointmentStatus.CONFIRMED,
    ];

    // Appointments in range (same status filter as queue endpoint)
    const appointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: startDate, lte: endDate },
        status: { in: appointmentStatuses },
        ...(userWhere ? { user: userWhere } : {}),
      },
      select: { userId: true, status: true, scheduledAt: true },
    });

    const totalAppointments = appointments.length;
    const completedAppointmentsCount = appointments.filter(
      (apt) => apt.status === "COMPLETED",
    ).length;

    // Map of userId -> set of appointment dates (YYYY-MM-DD) in range
    const appointmentDateMap = new Map<string, Set<string>>();
    appointments.forEach((apt) => {
      const dayKey = apt.scheduledAt.toISOString().split("T")[0];
      const existing = appointmentDateMap.get(apt.userId) || new Set<string>();
      existing.add(dayKey);
      appointmentDateMap.set(apt.userId, existing);
    });

    // Walk-ins: wellness plans created in range with no appointment same day
    // For center-filtered requests, we need to check:
    // 1. User has no appointment same day
    // 2. If userWhere filter exists (nurse filtering by center), 
    //    include walk-ins where the patient belongs to that center OR
    //    where the vitals were recorded by someone from that center
    
    let wellnessWhere: any = {
      createdAt: { gte: startDate, lte: endDate },
    };
    
    // For nurse center filtering, we need to include patients from that center
    // OR wellness plans created based on vitals recorded at that center
    if (userWhere) {
      // Get wellness plans where either:
      // - Patient belongs to the filtered center/region
      // - OR vitals were recorded by someone from the filtered center/region
      
      // First, get user IDs who have vitals recorded by someone matching the filter
      const vitalsWithRecorderFilter = await prisma.vitalRecord.findMany({
        where: {
          recordedAt: { gte: startDate, lte: endDate },
          recorder: userWhere, // Filter by recorder's center/region
        },
        select: { userId: true },
        distinct: ['userId'],
      });
      
      const userIdsFromFilteredCenter = vitalsWithRecorderFilter.map(v => v.userId);
      
      // Include wellness plans where:
      // 1. User matches the filter (their center/region)
      // 2. OR user had vitals recorded by someone from the filtered center
      if (userIdsFromFilteredCenter.length > 0) {
        wellnessWhere.OR = [
          { user: userWhere },
          { userId: { in: userIdsFromFilteredCenter } }
        ];
      } else {
        wellnessWhere.user = userWhere;
      }
    }

    const wellnessPlans = await prisma.wellnessPlan.findMany({
      where: wellnessWhere,
      select: { userId: true, createdAt: true },
    });

    let walkInCount = 0;
    wellnessPlans.forEach((plan) => {
      const planDayKey = plan.createdAt.toISOString().split("T")[0];
      const userAppointments = appointmentDateMap.get(plan.userId);
      if (!userAppointments || !userAppointments.has(planDayKey)) {
        walkInCount += 1;
      }
    });

    // Patients served = completed appointments + walk-ins
    const patientsServed = completedAppointmentsCount + walkInCount;

    return {
      totalAppointments,
      walkIns: walkInCount,
      patientsServed,
      completedAppointments: completedAppointmentsCount,
    };
  } catch (error) {
    console.error("Error calculating queue metrics:", error);
    throw error;
  }
}

// Export the shared helper so nurse analytics can use it directly
export { calculateQueueMetrics };

const AdminService = {
  /**
   * Create a new center
   */
  async createCenter(centerData: any): Promise<any> {
    try {
      return await prisma.center.create({
        data: centerData,
      });
    } catch (error) {
      console.error("Error creating center:", error);
      throw error;
    }
  },

  /**
   * Get all unique regions from centers
   */
  async getAllRegions(): Promise<string[]> {
    try {
      const centers = await prisma.center.findMany({
        select: { region: true },
        distinct: ["region"],
      });
      return centers.map((c) => c.region).sort();
    } catch (error) {
      console.error("Error getting regions:", error);
      throw error;
    }
  },

  /**
   * Get centers by region
   */
  async getCentersByRegion(region: string): Promise<any[]> {
    try {
      return await prisma.center.findMany({
        where: { region },
        select: {
          id: true,
          name: true,
          region: true,
          city: true,
          status: true,
        },
      });
    } catch (error) {
      console.error("Error getting centers by region:", error);
      throw error;
    }
  },

  /**
   * Get system-wide dashboard metrics
   */
  async getDashboardMetrics(
    timePeriod?: string,
    filters?: { region?: string; center?: string },
  ): Promise<DashboardMetrics> {
    try {
      const regionFilter = filters?.region;
      const centerFilter = filters?.center;
      const centerWhere: any = {};
      if (regionFilter) centerWhere.region = regionFilter;
      if (centerFilter) centerWhere.id = centerFilter;

      const userWhere: any = {};
      if (centerFilter) userWhere.centerId = centerFilter;
      if (regionFilter) userWhere.center = { region: regionFilter };
      const hasUserFilter = Object.keys(userWhere).length > 0;

      const baseUserWhere = hasUserFilter ? userWhere : {};
      const baseCenterWhere =
        Object.keys(centerWhere).length > 0 ? centerWhere : undefined;
      const baseCenterWhereSpread = baseCenterWhere || {};

      // Calculate date range based on time period
      const now = new Date();
      let dateFrom: Date | undefined;

      if (timePeriod === "daily") {
        dateFrom = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
        );
      } else if (timePeriod === "weekly") {
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timePeriod === "monthly") {
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      }

      // Get user stats (not filtered by date)
      const users = await prisma.user.groupBy({
        by: ["role"],
        where: baseUserWhere,
        _count: true,
      });

      const userStats = {
        total: await prisma.user.count({ where: baseUserWhere }),
        active: await prisma.user.count({
          where: { ...baseUserWhere, isActive: true },
        }),
        inactive: await prisma.user.count({
          where: { ...baseUserWhere, isActive: false },
        }),
        verified: await prisma.user.count({
          where: { ...baseUserWhere, isVerified: true },
        }),
        unverified: await prisma.user.count({
          where: { ...baseUserWhere, isVerified: false },
        }),
        externalPatients: await prisma.user.count({
          where: { ...baseUserWhere, role: "EXTERNAL_PATIENT" },
        }),
        staff: await prisma.user.count({
          where: { ...baseUserWhere, role: "STAFF" },
        }),
        byRole: users.reduce((acc: any, u: any) => {
          acc[u.role] = u._count;
          return acc;
        }, {}),
        byRegion: {},
      };

      // Get center stats (not filtered by date)
      const centers = await prisma.center.groupBy({
        by: ["region"],
        where: baseCenterWhere,
        _count: true,
      });

      const centerStats = {
        total: await prisma.center.count({ where: baseCenterWhere }),
        active: await prisma.center.count({
          where: { ...baseCenterWhereSpread, status: "ACTIVE" },
        }),
        inactive: await prisma.center.count({
          where: { ...baseCenterWhereSpread, status: "INACTIVE" },
        }),
        maintenance: await prisma.center.count({
          where: { ...baseCenterWhereSpread, status: "MAINTENANCE" },
        }),
        byRegion: centers.reduce((acc: any, c: any) => {
          acc[c.region] = c._count;
          return acc;
        }, {}),
      };

      // Get appointment stats with date filter
      const appointmentWhere: any = dateFrom
        ? {
            scheduledAt: { gte: dateFrom },
          }
        : {};
      if (hasUserFilter) appointmentWhere.user = userWhere;

      const appointments = await prisma.appointment.groupBy({
        by: ["status"],
        where: appointmentWhere,
        _count: true,
      });

      const appointmentStats = {
        total: await prisma.appointment.count({ where: appointmentWhere }),
        waiting: await prisma.appointment.count({
          where: { ...appointmentWhere, status: "WAITING" },
        }),
        inProgress: await prisma.appointment.count({
          where: { ...appointmentWhere, status: "IN_PROGRESS" },
        }),
        inService: await prisma.appointment.count({
          where: { ...appointmentWhere, status: "IN_SERVICE" },
        }),
        completed: await prisma.appointment.count({
          where: { ...appointmentWhere, status: "COMPLETED" },
        }),
        cancelled: await prisma.appointment.count({
          where: { ...appointmentWhere, status: "CANCELLED" },
        }),
        noShow: await prisma.appointment.count({
          where: { ...appointmentWhere, status: "NO_SHOW" },
        }),
        byRegion: {},
        byStatus: appointments.reduce((acc: any, a: any) => {
          acc[a.status] = a._count;
          return acc;
        }, {}),
      };

      // Get vital stats with date filter
      const vitalWhere: any = dateFrom
        ? {
            recordedAt: { gte: dateFrom },
          }
        : {};
      if (hasUserFilter) vitalWhere.user = userWhere;

      const vitals = await prisma.vitalRecord.findMany({
        where: vitalWhere,
        select: {
          bmi: true,
          systolic: true,
          diastolic: true,
          heartRate: true,
          temperature: true,
          oxygenSaturation: true,
          bmiCategory: true,
          bpCategory: true,
        },
      });

      const vitalStats = {
        total: vitals.length,
        averageBMI:
          vitals.length > 0
            ? vitals.reduce((sum, v) => sum + (v.bmi || 0), 0) / vitals.length
            : 0,
        averageSystolic:
          vitals.length > 0
            ? vitals.reduce((sum, v) => sum + (v.systolic || 0), 0) /
              vitals.length
            : 0,
        averageDiastolic:
          vitals.length > 0
            ? vitals.reduce((sum, v) => sum + (v.diastolic || 0), 0) /
              vitals.length
            : 0,
        averageHeartRate:
          vitals.length > 0
            ? vitals.reduce((sum, v) => sum + (v.heartRate || 0), 0) /
              vitals.length
            : 0,
        averageTemperature:
          vitals.length > 0
            ? vitals.reduce((sum, v) => sum + (v.temperature || 0), 0) /
              vitals.length
            : 0,
        averageOxygenSaturation:
          vitals.length > 0
            ? vitals.reduce((sum, v) => sum + (v.oxygenSaturation || 0), 0) /
              vitals.length
            : 0,
        byBmiCategory: {
          UNDERWEIGHT: vitals.filter((v) => v.bmiCategory === "UNDERWEIGHT")
            .length,
          NORMAL: vitals.filter((v) => v.bmiCategory === "NORMAL").length,
          OVERWEIGHT: vitals.filter((v) => v.bmiCategory === "OVERWEIGHT")
            .length,
          OBESITY: vitals.filter((v) => v.bmiCategory === "OBESITY").length,
        },
        byBpCategory: {
          NORMAL: vitals.filter((v) => v.bpCategory === "NORMAL").length,
          ELEVATED: vitals.filter((v) => v.bpCategory === "ELEVATED").length,
          HYPERTENSION_STAGE_1: vitals.filter(
            (v) => v.bpCategory === "HYPERTENSION_STAGE_1",
          ).length,
          HYPERTENSION_STAGE_2: vitals.filter(
            (v) => v.bpCategory === "HYPERTENSION_STAGE_2",
          ).length,
          HYPERTENSIVE_CRISIS: vitals.filter(
            (v) => v.bpCategory === "HYPERTENSIVE_CRISIS",
          ).length,
        },
      };

      // Get feedback stats with date filter
      const feedbackWhere: any = dateFrom
        ? {
            createdAt: { gte: dateFrom },
          }
        : {};
      if (hasUserFilter) feedbackWhere.user = userWhere;

      const feedback = await prisma.feedback.findMany({
        where: feedbackWhere,
        select: {
          npsScore: true,
          serviceQuality: true,
          staffBehavior: true,
          cleanliness: true,
          waitTime: true,
        },
      });

      const feedbackStats = {
        total: feedback.length,
        averageNPS:
          feedback.length > 0
            ? feedback.reduce((sum, f) => sum + (f.npsScore || 0), 0) /
              feedback.length
            : 0,
        averageServiceQuality:
          feedback.length > 0
            ? feedback.reduce((sum, f) => sum + (f.serviceQuality || 0), 0) /
              feedback.length
            : 0,
        averageStaffBehavior:
          feedback.length > 0
            ? feedback.reduce((sum, f) => sum + (f.staffBehavior || 0), 0) /
              feedback.length
            : 0,
        averageCleanliness:
          feedback.length > 0
            ? feedback.reduce((sum, f) => sum + (f.cleanliness || 0), 0) /
              feedback.length
            : 0,
        averageWaitTime:
          feedback.length > 0
            ? feedback.reduce((sum, f) => sum + (f.waitTime || 0), 0) /
              feedback.length
            : 0,
        npsDistribution: {},
        byRegion: {},
      };

      // Get regions (unique regions from centers)
      const regions = await prisma.center.findMany({
        select: { region: true },
        distinct: ["region"],
        where: baseCenterWhere,
      });

      const regionStats = {
        total: regions.length,
        regions: regions.map((r) => r.region),
      };

      // Get patients (users with STAFF or EXTERNAL_PATIENT role) - not filtered by date
      const patientStats = {
        total: await prisma.user.count({
          where: {
            ...baseUserWhere,
            role: { in: ["STAFF", "EXTERNAL_PATIENT"] },
          },
        }),
      };

      // Use shared helper to calculate appointments, walk-ins, and patients served
      // Same logic as nurse analytics dashboard
      let queueStartDate: Date;
      let queueEndDate = new Date();

      if (timePeriod === "daily") {
        queueStartDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
        );
        queueEndDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );
      } else if (timePeriod === "weekly") {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        queueStartDate = new Date(now);
        queueStartDate.setDate(diff);
        queueStartDate.setHours(0, 0, 0, 0);
        queueEndDate = new Date(queueStartDate);
        queueEndDate.setDate(queueStartDate.getDate() + 6);
        queueEndDate.setHours(23, 59, 59, 999);
      } else if (timePeriod === "monthly") {
        queueStartDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
          0,
          0,
          0,
          0,
        );
        queueEndDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
      } else {
        // all time
        queueStartDate = new Date("2020-01-01");
        queueEndDate = new Date(now);
      }

      const queueMetrics = await calculateQueueMetrics(
        queueStartDate,
        queueEndDate,
        hasUserFilter ? userWhere : undefined,
      );

      const walkInStats = { total: queueMetrics.walkIns };
      const patientsServedStats = { total: queueMetrics.patientsServed };

      // Override appointments count with total appointments from helper
      appointmentStats.total = queueMetrics.totalAppointments;
      appointmentStats.completed = queueMetrics.completedAppointments;

      // Get wellness plans stats with date filter - use recorder-based filtering
      let wellnessStats: any;
      if (hasUserFilter) {
        // Get user IDs who have vitals recorded by someone matching the filter
        const vitalsWithRecorderFilter = await prisma.vitalRecord.findMany({
          where: {
            ...(dateFrom ? { recordedAt: { gte: dateFrom } } : {}),
            recorder: userWhere, // Filter by recorder's center/region
          },
          select: { userId: true },
          distinct: ['userId'],
        });
        
        const userIdsFromFilteredCenter = vitalsWithRecorderFilter.map(v => v.userId);
        
        if (userIdsFromFilteredCenter.length > 0) {
          const wellnessWhere: any = {
            ...(dateFrom ? { createdAt: { gte: dateFrom } } : {}),
            userId: { in: userIdsFromFilteredCenter },
          };
          
          wellnessStats = {
            total: await prisma.wellnessPlan.count({ where: wellnessWhere }),
            active: await prisma.wellnessPlan.count({
              where: { ...wellnessWhere, isActive: true },
            }),
            inactive: await prisma.wellnessPlan.count({
              where: { ...wellnessWhere, isActive: false },
            }),
          };
        } else {
          wellnessStats = {
            total: 0,
            active: 0,
            inactive: 0,
          };
        }
      } else {
        // No filtering - count all wellness plans
        const wellnessWhere: any = dateFrom
          ? { createdAt: { gte: dateFrom } }
          : {};
        
        wellnessStats = {
          total: await prisma.wellnessPlan.count({ where: wellnessWhere }),
          active: await prisma.wellnessPlan.count({
            where: { ...wellnessWhere, isActive: true },
          }),
          inactive: await prisma.wellnessPlan.count({
            where: { ...wellnessWhere, isActive: false },
          }),
        };
      }

      return {
        users: userStats,
        centers: centerStats,
        appointments: appointmentStats,
        vitals: vitalStats,
        feedback: feedbackStats,
        regions: regionStats,
        patients: patientStats,
        walkIns: walkInStats,
        patientsServed: patientsServedStats,
        wellness: wellnessStats,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Error getting dashboard metrics:", error);
      throw error;
    }
  },

  /**
   * Get all users with filters
   */
  async getAllUsers(filters: UserFilters): Promise<PaginatedResponse<any>> {
    try {
      const skip = ((filters.page || 1) - 1) * (filters.limit || 20);
      const take = filters.limit || 20;

      const where: any = {};

      if (filters.role) where.role = filters.role;
      if (filters.status) where.isActive = filters.status === "active";
      if (filters.verification)
        where.isVerified = filters.verification === "verified";
      
      // Handle center filter (takes priority if specified)
      if (filters.center) {
        where.centerId = filters.center;
      } else if (filters.region) {
        // Only region filter if center not specified
        where.center = {
          region: filters.region,
        };
      }
      
      if (filters.search) {
        where.OR = [
          { email: { contains: filters.search, mode: "insensitive" } },
          { fullName: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const [data, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          include: {
            center: {
              select: {
                id: true,
                name: true,
                region: true,
                city: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        data,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total,
          pages: Math.ceil(total / (filters.limit || 20)),
        },
      };
    } catch (error) {
      console.error("Error getting users:", error);
      throw error;
    }
  },

  /**
   * Get all centers with filters
   */
  async getAllCenters(filters: CenterFilters): Promise<PaginatedResponse<any>> {
    try {
      const skip = ((filters.page || 1) - 1) * (filters.limit || 20);
      const take = filters.limit || 20;

      const where: any = {};

      if (filters.region) where.region = filters.region;
      if (filters.status) where.status = filters.status;
      if (filters.city) where.city = filters.city;
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { city: { contains: filters.search, mode: "insensitive" } },
          { region: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const [data, total] = await Promise.all([
        prisma.center.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            name: true,
            region: true,
            city: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                staff: true,
              },
            },
          },
        }),
        prisma.center.count({ where }),
      ]);

      return {
        data,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total,
          pages: Math.ceil(total / (filters.limit || 20)),
        },
      };
    } catch (error) {
      console.error("Error getting centers:", error);
      throw error;
    }
  },

  /**
   * Get all appointments with filters
   */
  async getAllAppointments(
    filters: AppointmentFilters,
  ): Promise<PaginatedResponse<any>> {
    try {
      const skip = ((filters.page || 1) - 1) * (filters.limit || 20);
      const take = filters.limit || 20;

      const where: any = {};

      // Handle center filter (takes priority if specified)
      if (filters.center) {
        where.user = { 
          centerId: filters.center 
        };
      } else if (filters.region) {
        // Only region filter if center not specified
        where.user = { 
          center: { 
            region: filters.region 
          } 
        };
      }
      
      if (filters.status) where.status = filters.status;
      if (filters.dateFrom || filters.dateTo) {
        where.scheduledAt = {};
        if (filters.dateFrom) where.scheduledAt.gte = filters.dateFrom;
        if (filters.dateTo) where.scheduledAt.lte = filters.dateTo;
      }
      if (filters.search) {
        where.OR = [
          {
            user: {
              fullName: { contains: filters.search, mode: "insensitive" },
            },
          },
          {
            user: { email: { contains: filters.search, mode: "insensitive" } },
          },
          { reason: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const [data, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          skip,
          take,
          include: {
            user: { select: { fullName: true, email: true, userId: true } },
          },
        }),
        prisma.appointment.count({ where }),
      ]);

      return {
        data,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total,
          pages: Math.ceil(total / (filters.limit || 20)),
        },
      };
    } catch (error) {
      console.error("Error getting appointments:", error);
      throw error;
    }
  },

  /**
   * Get all vitals with filters - use recorder-based filtering
   */
  async getAllVitals(filters: VitalFilters): Promise<PaginatedResponse<any>> {
    try {
      const skip = ((filters.page || 1) - 1) * (filters.limit || 20);
      const take = filters.limit || 20;

      const where: any = {};

      // Handle center filter (takes priority if specified) - filter by recorder, not patient
      if (filters.center) {
        where.recorder = { centerId: filters.center };
      } else if (filters.region) {
        where.recorder = { center: { region: filters.region } };
      }
      
      if (filters.bmiCategory) where.bmiCategory = filters.bmiCategory;
      if (filters.bpCategory) where.bpCategory = filters.bpCategory;
      if (filters.dateFrom || filters.dateTo) {
        where.recordedAt = {};
        if (filters.dateFrom) where.recordedAt.gte = filters.dateFrom;
        if (filters.dateTo) where.recordedAt.lte = filters.dateTo;
      }
      if (filters.search) {
        where.OR = [
          { userId: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const [data, total] = await Promise.all([
        prisma.vitalRecord.findMany({
          where,
          skip,
          take,
          include: {
            user: { select: { fullName: true, email: true, userId: true } },
            recorder: { select: { fullName: true, email: true } },
          },
        }),
        prisma.vitalRecord.count({ where }),
      ]);

      return {
        data,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total,
          pages: Math.ceil(total / (filters.limit || 20)),
        },
      };
    } catch (error) {
      console.error("Error getting vitals:", error);
      throw error;
    }
  },

  /**
   * Get all feedback with filters
   */
  async getAllFeedback(
    filters: FeedbackFilters,
  ): Promise<PaginatedResponse<any>> {
    try {
      const skip = ((filters.page || 1) - 1) * (filters.limit || 20);
      const take = filters.limit || 20;

      const where: any = {};

      // Handle center filter (takes priority if specified)
      if (filters.center) {
        where.user = { centerId: filters.center };
      } else if (filters.region) {
        where.user = { center: { region: filters.region } };
      }

      if (filters.npsScore !== undefined) where.npsScore = filters.npsScore;
      if (filters.feedbackType) where.feedbackType = filters.feedbackType;
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }

      const [data, total] = await Promise.all([
        prisma.feedback.findMany({
          where,
          skip,
          take,
          include: {
            user: { select: { fullName: true, email: true, userId: true } },
          },
        }),
        prisma.feedback.count({ where }),
      ]);

      return {
        data,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total,
          pages: Math.ceil(total / (filters.limit || 20)),
        },
      };
    } catch (error) {
      console.error("Error getting feedback:", error);
      throw error;
    }
  },

  /**
   * Get all audit logs with filters
   */
  async getAllAuditLogs(
    filters: AuditFilters,
  ): Promise<PaginatedResponse<any>> {
    try {
      const skip = ((filters.page || 1) - 1) * (filters.limit || 20);
      const take = filters.limit || 20;

      const where: any = {};

      const userWhere: any = {};
      
      // Handle center filter (takes priority if specified)
      if (filters.center) {
        userWhere.centerId = filters.center;
      } else if (filters.region) {
        userWhere.center = { region: filters.region };
      }
      
      if (filters.role) userWhere.role = filters.role;
      if (Object.keys(userWhere).length > 0) where.user = userWhere;

      if (filters.user) where.userId = filters.user;
      if (filters.action) where.action = filters.action;
      if (filters.resource) where.resource = filters.resource;
      if (filters.dateFrom || filters.dateTo) {
        where.timestamp = {};
        if (filters.dateFrom) where.timestamp.gte = filters.dateFrom;
        if (filters.dateTo) where.timestamp.lte = filters.dateTo;
      }

      const [data, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take,
          orderBy: { timestamp: "desc" },
          include: {
            user: {
              select: { fullName: true, email: true, userId: true, role: true },
            },
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      return {
        data,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total,
          pages: Math.ceil(total / (filters.limit || 20)),
        },
      };
    } catch (error) {
      console.error("Error getting audit logs:", error);
      throw error;
    }
  },

  /**
   * Get regional staff health comparison
   * Only includes STAFF role users, excludes EXTERNAL_PATIENT
   */
  async getRegionalHealthComparison(
    timePeriod?: string,
  ): Promise<any> {
    try {
      console.log("[getRegionalHealthComparison] Starting with timePeriod:", timePeriod);
      
      // Calculate date range
      const now = new Date();
      let dateFrom: Date | undefined;

      if (timePeriod === "daily") {
        dateFrom = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
        );
      } else if (timePeriod === "weekly") {
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timePeriod === "monthly") {
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      }

      console.log("[getRegionalHealthComparison] Date range:", { dateFrom });

      // Get all regions
      console.log("[getRegionalHealthComparison] Fetching regions...");
      const regions = await prisma.center.findMany({
        select: { region: true },
        distinct: ["region"],
      });

      const regionList = regions.map((r) => r.region);
      console.log("[getRegionalHealthComparison] Found regions:", regionList);

      // Process each region
      const regionHealthData = await Promise.all(
        regionList.map(async (region) => {
          console.log(`[getRegionalHealthComparison] Processing region: ${region}`);
          // Get staff users in this region (STAFF role only)
          const staffUsers = await prisma.user.findMany({
            where: {
              center: { region },
              role: "STAFF",
            },
            select: { id: true },
          });

          const staffUserIds = staffUsers.map((u) => u.id);
          const totalStaff = staffUserIds.length;
          console.log(`[getRegionalHealthComparison] Region ${region}: ${totalStaff} staff`);

          if (totalStaff === 0) {
            return {
              region,
              totalStaff: 0,
              healthScore: 0,
              healthyPercent: 0,
              atRiskPercent: 0,
              criticalPercent: 0,
              conditions: {},
              vitalsRecorded: 0,
            };
          }

          // Get wellness plans with conditions (staff only)
          const wellnessWhere: any = {
            userId: { in: staffUserIds },
          };
          if (dateFrom) wellnessWhere.createdAt = { gte: dateFrom };

          const wellnessPlans = await prisma.wellnessPlan.findMany({
            where: wellnessWhere,
            select: {
              conditions: true,
            },
          });

          // Count conditions
          const conditionCounts: Record<string, number> = {};
          wellnessPlans.forEach((plan) => {
            if (plan.conditions && Array.isArray(plan.conditions)) {
              plan.conditions.forEach((condition: any) => {
                const key = String(condition).toLowerCase().replace(/ /g, "_");
                conditionCounts[key] = (conditionCounts[key] || 0) + 1;
              });
            }
          });

          // Get vital records (staff only)
          const vitalsWhere: any = {
            userId: { in: staffUserIds },
          };
          if (dateFrom) vitalsWhere.recordedAt = { gte: dateFrom };

          const vitals = await prisma.vitalRecord.findMany({
            where: vitalsWhere,
            select: {
              bmiCategory: true,
              bpCategory: true,
              heartRate: true,
              temperature: true,
              oxygenSaturation: true,
            },
          });

          // Calculate risk levels based on vitals
          let healthyCount = 0;
          let atRiskCount = 0;
          let criticalCount = 0;

          vitals.forEach((vital) => {
            // Check BMI risk
            const bmiRisk =
              vital.bmiCategory === "OBESITY" ||
              vital.bmiCategory === "OVERWEIGHT";

            // Check BP risk
            const bpRisk =
              vital.bpCategory === "HYPERTENSION_STAGE_2" ||
              vital.bpCategory === "HYPERTENSIVE_CRISIS";

            // Check critical BP
            const bpCritical = vital.bpCategory === "HYPERTENSIVE_CRISIS";

            // Check other vitals
            const heartRateAbnormal =
              (vital.heartRate && (vital.heartRate < 60 || vital.heartRate > 100));
            const tempAbnormal =
              (vital.temperature &&
                (vital.temperature < 36.1 || vital.temperature > 37.2));
            const o2Abnormal =
              (vital.oxygenSaturation && vital.oxygenSaturation < 95);

            if (bpCritical || o2Abnormal) {
              criticalCount++;
            } else if (bmiRisk || bpRisk || heartRateAbnormal || tempAbnormal) {
              atRiskCount++;
            } else {
              healthyCount++;
            }
          });

          const vitalsRecorded = vitals.length;
          const healthyPercent =
            vitalsRecorded > 0
              ? Math.round((healthyCount / vitalsRecorded) * 100)
              : 100;
          const atRiskPercent =
            vitalsRecorded > 0
              ? Math.round((atRiskCount / vitalsRecorded) * 100)
              : 0;
          const criticalPercent =
            vitalsRecorded > 0
              ? Math.round((criticalCount / vitalsRecorded) * 100)
              : 0;

          // Calculate health score (0-100)
          // Based on: healthy %, low at-risk %, low critical %
          const healthScore = Math.round(
            healthyPercent * 0.7 +
              (100 - atRiskPercent) * 0.2 +
              (100 - criticalPercent) * 0.1,
          );

          return {
            region,
            totalStaff,
            healthScore,
            healthyPercent,
            atRiskPercent,
            criticalPercent,
            conditions: conditionCounts,
            vitalsRecorded,
          };
        }),
      );

      console.log("[getRegionalHealthComparison] Completed. Returning data for", regionHealthData.length, "regions");
      return regionHealthData;
    } catch (error) {
      console.error("[getRegionalHealthComparison] Error getting regional health comparison:", error);
      throw error;
    }
  },

  /**
   * Get center staff health comparison
   * Only includes STAFF role users, excludes EXTERNAL_PATIENT
   */
  async getCenterHealthComparison(
    timePeriod?: string,
    regionFilter?: string,
  ): Promise<any> {
    try {
      // Calculate date range
      const now = new Date();
      let dateFrom: Date | undefined;

      if (timePeriod === "daily") {
        dateFrom = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
        );
      } else if (timePeriod === "weekly") {
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timePeriod === "monthly") {
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      }

      // Get all centers (optionally filtered by region)
      const centerWhere: any = {};
      if (regionFilter && regionFilter !== "all") {
        centerWhere.region = regionFilter;
      }

      const centers = await prisma.center.findMany({
        where: centerWhere,
        select: { 
          id: true,
          name: true,
          region: true,
        },
      });

      // Process each center
      const centerHealthData = await Promise.all(
        centers.map(async (center) => {
          // Get staff users in this center (STAFF role only)
          const staffUsers = await prisma.user.findMany({
            where: {
              centerId: center.id,
              role: "STAFF",
            },
            select: { id: true },
          });

          const staffUserIds = staffUsers.map((u) => u.id);
          const totalStaff = staffUserIds.length;

          if (totalStaff === 0) {
            return {
              centerId: center.id,
              centerName: center.name,
              region: center.region,
              totalStaff: 0,
              healthScore: 0,
              healthyPercent: 0,
              atRiskPercent: 0,
              criticalPercent: 0,
              conditions: {},
              vitalsRecorded: 0,
            };
          }

          // Get wellness plans with conditions (staff only)
          const wellnessWhere: any = {
            userId: { in: staffUserIds },
          };
          if (dateFrom) wellnessWhere.createdAt = { gte: dateFrom };

          const wellnessPlans = await prisma.wellnessPlan.findMany({
            where: wellnessWhere,
            select: {
              conditions: true,
            },
          });

          // Count conditions
          const conditionCounts: Record<string, number> = {};
          wellnessPlans.forEach((plan) => {
            if (plan.conditions && Array.isArray(plan.conditions)) {
              plan.conditions.forEach((condition: any) => {
                const key = String(condition).toLowerCase().replace(/ /g, "_");
                conditionCounts[key] = (conditionCounts[key] || 0) + 1;
              });
            }
          });

          // Get vital records (staff only)
          const vitalsWhere: any = {
            userId: { in: staffUserIds },
          };
          if (dateFrom) vitalsWhere.recordedAt = { gte: dateFrom };

          const vitals = await prisma.vitalRecord.findMany({
            where: vitalsWhere,
            select: {
              bmiCategory: true,
              bpCategory: true,
              heartRate: true,
              temperature: true,
              oxygenSaturation: true,
            },
          });

          // Calculate risk levels based on vitals
          let healthyCount = 0;
          let atRiskCount = 0;
          let criticalCount = 0;

          vitals.forEach((vital) => {
            // Check BMI risk
            const bmiRisk =
              vital.bmiCategory === "OBESITY" ||
              vital.bmiCategory === "OVERWEIGHT";

            // Check BP risk
            const bpRisk =
              vital.bpCategory === "HYPERTENSION_STAGE_2" ||
              vital.bpCategory === "HYPERTENSIVE_CRISIS";

            // Check critical BP
            const bpCritical = vital.bpCategory === "HYPERTENSIVE_CRISIS";

            // Check other vitals
            const heartRateAbnormal =
              (vital.heartRate && (vital.heartRate < 60 || vital.heartRate > 100));
            const tempAbnormal =
              (vital.temperature &&
                (vital.temperature < 36.1 || vital.temperature > 37.2));
            const o2Abnormal =
              (vital.oxygenSaturation && vital.oxygenSaturation < 95);

            if (bpCritical || o2Abnormal) {
              criticalCount++;
            } else if (bmiRisk || bpRisk || heartRateAbnormal || tempAbnormal) {
              atRiskCount++;
            } else {
              healthyCount++;
            }
          });

          const vitalsRecorded = vitals.length;
          const healthyPercent =
            vitalsRecorded > 0
              ? Math.round((healthyCount / vitalsRecorded) * 100)
              : 100;
          const atRiskPercent =
            vitalsRecorded > 0
              ? Math.round((atRiskCount / vitalsRecorded) * 100)
              : 0;
          const criticalPercent =
            vitalsRecorded > 0
              ? Math.round((criticalCount / vitalsRecorded) * 100)
              : 0;

          // Calculate health score (0-100)
          const healthScore = Math.round(
            healthyPercent * 0.7 +
              (100 - atRiskPercent) * 0.2 +
              (100 - criticalPercent) * 0.1,
          );

          return {
            centerId: center.id,
            centerName: center.name,
            region: center.region,
            totalStaff,
            healthScore,
            healthyPercent,
            atRiskPercent,
            criticalPercent,
            conditions: conditionCounts,
            vitalsRecorded,
          };
        }),
      );

      return centerHealthData;
    } catch (error) {
      console.error("Error getting center health comparison:", error);
      throw error;
    }
  },
};

export default AdminService;
