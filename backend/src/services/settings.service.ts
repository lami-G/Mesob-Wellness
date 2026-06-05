import { prisma } from "../config/prisma";

interface SystemSettings {
  maxLoginAttempts: number;
  sessionTimeout: number;
  maintenanceMode: boolean;
  lockoutDuration: number; // in minutes
}

class SettingsService {
  private static readonly SETTINGS_ID = "system_settings";

  static async getSettings(): Promise<SystemSettings> {
    try {
      const defaultSettings = {
        maxLoginAttempts: 2,
        sessionTimeout: 30,
        maintenanceMode: false,
        lockoutDuration: 30,
      };

      // Use upsert to avoid race conditions
      const setting = await prisma.setting.upsert({
        where: { key: this.SETTINGS_ID },
        update: {}, // Don't update if it exists
        create: {
          key: this.SETTINGS_ID,
          value: JSON.stringify(defaultSettings),
        },
      });

      const value = JSON.parse(setting.value);
      return {
        maxLoginAttempts: value.maxLoginAttempts || 2,
        sessionTimeout: value.sessionTimeout || 30,
        maintenanceMode: value.maintenanceMode || false,
        lockoutDuration: value.lockoutDuration || 30,
      };
    } catch (error) {
      console.error("Error getting settings:", error);
      // Return default settings if database operation fails
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
      // Get current settings
      const current = await this.getSettings();

      // Merge with new settings
      const updated = { ...current, ...settings };

      // Update in database
      await prisma.setting.upsert({
        where: { key: this.SETTINGS_ID },
        update: {
          value: JSON.stringify(updated),
        },
        create: {
          key: this.SETTINGS_ID,
          value: JSON.stringify(updated),
        },
      });

      return updated;
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
