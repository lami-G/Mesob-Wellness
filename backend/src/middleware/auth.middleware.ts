import { Request, Response, NextFunction } from "express";
import { UserRole } from "../generated/prisma";
import { AuthService } from "../services/auth.service";

// Extend Express Request to include user information
// Explicitly declare properties to avoid type conflicts from cached dependencies
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
    centerId?: string | null;
  };
  // Explicitly redeclare Express Request properties for Render build compatibility
  body: any;
  params: any;
  query: any;
  headers: any;
  ip: string;
  path: string;
  method: string;
  get(name: any): any;
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        status: "error",
        message: "Authentication required. Please provide a valid token.",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = AuthService.verifyToken(token);

    // Verify user still exists and is active
    const user = await AuthService.getUserById(decoded.userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        status: "error",
        message: "User account is inactive or does not exist.",
      });
      return;
    }

    // Check if user is allowed to login (external patients cannot login)
    if (!user.canLogin) {
      res.status(403).json({
        status: "error",
        message: "This account cannot login. External patients must visit in person.",
      });
      return;
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      centerId: user.centerId, // Include centerId for data filtering
    };

    // Debug logging for role-based filtering
    console.log('[AUTH] User authenticated:', {
      userId: decoded.userId,
      role: decoded.role,
      centerId: user.centerId,
      path: req.path,
      method: req.method,
    });

    next();
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid or expired token") {
      res.status(401).json({
        status: "error",
        message: "Invalid or expired token. Please login again.",
      });
      return;
    }

    res.status(500).json({
      status: "error",
      message: "Authentication failed",
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if user has required role(s) to access a route
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    const hasPermission = allowedRoles.includes(req.user.role);

    if (!hasPermission) {
      // Log unauthorized access attempt
      AuthService.createAuditLog({
        userId: req.user.userId,
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        resource: req.path,
        details: {
          requiredRoles: allowedRoles,
          userRole: req.user.role,
          method: req.method,
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      }).catch((err) => console.error("Failed to log unauthorized access:", err));

      res.status(403).json({
        status: "error",
        message: "Access denied. You do not have permission to access this resource.",
      });
      return;
    }

    next();
  };
};

/**
 * Role hierarchy helper
 * Higher roles have access to lower role permissions
 * 7-tier hierarchy: SYSTEM_ADMIN > FEDERAL_OFFICE > REGIONAL_OFFICE > MANAGER > NURSE_OFFICER > STAFF > EXTERNAL_PATIENT
 */
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.EXTERNAL_PATIENT]: 0,  // Lowest privilege (no login access)
  [UserRole.STAFF]: 1,
  [UserRole.NURSE_OFFICER]: 2,
  [UserRole.MANAGER]: 3,
  [UserRole.REGIONAL_OFFICE]: 4,
  [UserRole.FEDERAL_OFFICE]: 5,
  [UserRole.SYSTEM_ADMIN]: 6,      // Highest privilege
};

/**
 * Hierarchical authorization
 * Allows access if user's role is equal to or higher than minimum required role
 */
export const authorizeMinRole = (minRole: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    const userRoleLevel = roleHierarchy[req.user.role];
    const minRoleLevel = roleHierarchy[minRole];

    if (userRoleLevel < minRoleLevel) {
      AuthService.createAuditLog({
        userId: req.user.userId,
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        resource: req.path,
        details: {
          minRequiredRole: minRole,
          userRole: req.user.role,
          method: req.method,
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      }).catch((err) => console.error("Failed to log unauthorized access:", err));

      res.status(403).json({
        status: "error",
        message: "Access denied. Insufficient permissions.",
      });
      return;
    }

    next();
  };
};

/**
 * Get user's region based on their center
 * Used for filtering data for MANAGER and REGIONAL_OFFICE roles
 */
export const getUserRegion = async (centerId: string | null | undefined): Promise<string | null> => {
  if (!centerId) return null;
  
  try {
    const { prisma } = await import("../config/prisma.js");
    const center = await prisma.center.findUnique({
      where: { id: centerId },
      select: { region: true },
    });
    return center?.region || null;
  } catch (error) {
    console.error("Error fetching user region:", error);
    return null;
  }
};

/**
 * Apply role-based data filters
 * Automatically restricts data based on user's role and assigned center/region
 */
export const applyRoleBasedFilters = async (req: AuthRequest): Promise<{ center?: string; region?: string }> => {
  const filters: { center?: string; region?: string } = {};
  
  if (!req.user) {
    console.log('[FILTER] No user in request');
    return filters;
  }
  
  const { role, centerId, userId } = req.user;
  
  console.log('[FILTER] Applying filters for:', { userId, role, centerId });
  
  // MANAGER: Can only see data from their assigned center
  if (role === UserRole.MANAGER && centerId) {
    filters.center = centerId;
    console.log('[FILTER] MANAGER filter applied:', filters);
  }
  
  // NURSE_OFFICER: Can only see data from their assigned center
  if (role === UserRole.NURSE_OFFICER && centerId) {
    filters.center = centerId;
    console.log('[FILTER] NURSE_OFFICER filter applied:', filters);
  }
  
  // REGIONAL_OFFICE: Can see data from all centers in their region
  if (role === UserRole.REGIONAL_OFFICE && centerId) {
    const region = await getUserRegion(centerId);
    if (region) {
      filters.region = region;
      console.log('[FILTER] REGIONAL_OFFICE filter applied:', filters);
    }
  }
  
  // FEDERAL_OFFICE and SYSTEM_ADMIN: No filters (can see all data)
  console.log('[FILTER] Final filters:', filters);
  
  return filters;
};

/**
 * Self-access or admin middleware
 * Allows users to access their own data or admins to access any data
 */
export const authorizeSelfOrAdmin = (userIdParam: string = "userId") => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    const targetUserId = req.params[userIdParam];
    const adminRoles: UserRole[] = [UserRole.NURSE_OFFICER, UserRole.MANAGER, UserRole.REGIONAL_OFFICE, UserRole.FEDERAL_OFFICE, UserRole.SYSTEM_ADMIN];
    const isAdmin = adminRoles.includes(req.user.role);
    const isSelf = req.user.userId === targetUserId;

    if (!isSelf && !isAdmin) {
      res.status(403).json({
        status: "error",
        message: "Access denied. You can only access your own data.",
      });
      return;
    }

    next();
  };
};
