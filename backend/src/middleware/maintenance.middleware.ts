import { NextFunction, Request, Response } from "express";
import { UserRole } from "../generated/prisma";
import { AuthService } from "../services/auth.service";
import SettingsService from "../services/settings.service";

const PUBLIC_PATHS = [
  "/api/health",
  "/health",
  "/api/v1/settings/public",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
];

const isPublicPath = (path: string) =>
  PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));

const maintenanceMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.method === "OPTIONS" || isPublicPath(req.path)) {
      next();
      return;
    }

    const maintenanceMode = await SettingsService.isMaintenanceMode();
    if (!maintenanceMode) {
      next();
      return;
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const decoded = AuthService.verifyToken(token);
        if (decoded.role === UserRole.SYSTEM_ADMIN) {
          next();
          return;
        }
      } catch (error) {
        // Fall through to maintenance response
      }
    }

    res.status(503).json({
      status: "error",
      message: "System is in maintenance mode. Please try again later.",
    });
  } catch (error) {
    console.error("Maintenance mode check failed:", error);
    next();
  }
};

export default maintenanceMiddleware;
