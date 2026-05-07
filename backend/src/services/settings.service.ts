import prisma from "../config/prisma";

interface SystemSettings {
  maxLoginAttempts: number;
  sessionTimeout: number;
  maintenanceMode: boolean;
  lockoutDuration: number; // in minutes
}

class SettingsService {
  private static readonly SETTINGS_KEY = "system_settings";

  static async getSettings(): Promise<SystemSettings> {
    try {
      // Try to get settings from a hypothetical settings table
      // For now, we'll use environment variables and defaults
      const maxLoginAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "2", 10);
      const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT || "30", 10);
      const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
      const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION || "30", 10);

      return {
        maxLoginAttempts,
        sessionTimeout,
        maintenanceMode,
        lockoutDuration,
      };
    } catch (error) {
      console.error("Error getting settings:", error);
      return {
        maxLoginAttempts: 2,
        sessionTimeout: 30,
        maintenanceMode: false,
        lockoutDuration: 30,
      };
    }
  }

  static async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      // Update environment variables (in production, this would update a database)
      if (settings.maxLoginAttempts !== undefined) {
        process.env.MAX_LOGIN_ATTEMPTS = settings.maxLoginAttempts.toString();
      }
      if (settings.sessionTimeout !== undefined) {
        process.env.SESSION_TIMEOUT = settings.sessionTimeout.toString();
      }
      if (settings.maintenanceMode !== undefined) {
        process.env.MAINTENANCE_MODE = settings.maintenanceMode.toString();
      }
      if (settings.lockoutDuration !== undefined) {
        process.env.LOCKOUT_DURATION = settings.lockoutDuration.toString();
      }

      return this.getSettings();
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  static async getMaxLoginAttempts(): Promise<number> {
    const settings = await this.getSettings();
    return settings.maxLoginAttempts;
  }

  static async isMaintenanceMode(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.maintenanceMode;
  }

  static async getLockoutDuration(): Promise<number> {
    const settings = await this.getSettings();
    return settings.lockoutDuration;
  }
}

export default SettingsService;
