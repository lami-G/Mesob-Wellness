import React, { useState, useEffect, useRef } from "react";
import { settingsService } from "../../../services/settingsService";
import styles from "./SystemSettings.module.css";

function SystemSettings() {
  const [settings, setSettings] = useState({
    maxLoginAttempts: 2,
    sessionTimeout: 30,
    maintenanceMode: false,
    lockoutDuration: 30,
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [systemInfo, setSystemInfo] = useState({
    version: "1.0.0",
    lastUpdated: "May 3, 2026",
    databaseSize: "2.4 GB",
    uptime: "99.9%",
  });
  const successMessageRef = useRef(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (saved && successMessageRef.current) {
      successMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [saved]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      localStorage.setItem("systemSettings", JSON.stringify(data));
      setError("");
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseInt(value) || value,
    }));
    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      const updated = await settingsService.updateSettings(settings);
      setSettings(updated);
      localStorage.setItem("systemSettings", JSON.stringify(updated));

      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings");
      console.error("Error saving settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadSettings();
    setSaved(false);
    setError("");
  };

  return (
    <div className={styles.systemSettingsPage}>
      <div className={styles.pageHeader}>
        <h1>System Settings</h1>
        <p>Configure system-wide settings and preferences</p>
      </div>

      {saved && (
        <div className={styles.successMessage} ref={successMessageRef}>
          ✓ Settings saved successfully
        </div>
      )}
      {error && <div className={styles.errorMessage}>✗ {error}</div>}

      <div className={styles.settingsContainer}>
        {/* Security Settings */}
        <div className={styles.settingsSection}>
          <h2>Security Settings</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <label htmlFor="maxLoginAttempts">Max Login Attempts</label>
              <p className={styles.settingDescription}>
                Maximum failed login attempts before account lockout
              </p>
            </div>
            <input
              type="number"
              id="maxLoginAttempts"
              name="maxLoginAttempts"
              value={settings.maxLoginAttempts}
              onChange={handleChange}
              className={styles.settingInput}
              min="1"
              max="10"
              disabled={loading}
            />
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
              <p className={styles.settingDescription}>
                Automatically logout inactive users after this duration
              </p>
            </div>
            <input
              type="number"
              id="sessionTimeout"
              name="sessionTimeout"
              value={settings.sessionTimeout}
              onChange={handleChange}
              className={styles.settingInput}
              min="5"
              max="480"
              disabled={loading}
            />
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <label htmlFor="lockoutDuration">
                Account Lockout Duration (minutes)
              </label>
              <p className={styles.settingDescription}>
                How long to lock account after max failed attempts
              </p>
            </div>
            <input
              type="number"
              id="lockoutDuration"
              name="lockoutDuration"
              value={settings.lockoutDuration}
              onChange={handleChange}
              className={styles.settingInput}
              min="5"
              max="120"
              disabled={loading}
            />
          </div>
        </div>

        {/* System Status */}
        <div className={styles.settingsSection}>
          <h2>System Status</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <label htmlFor="maintenanceMode">Maintenance Mode</label>
              <p className={styles.settingDescription}>
                Put system in maintenance mode (users cannot access)
              </p>
            </div>
            <input
              type="checkbox"
              id="maintenanceMode"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className={styles.toggleSwitch}
              disabled={loading}
            />
          </div>

          <div className={styles.systemInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>System Version:</span>
              <span className={styles.infoValue}>{systemInfo.version}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Last Updated:</span>
              <span className={styles.infoValue}>{systemInfo.lastUpdated}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Database Size:</span>
              <span className={styles.infoValue}>{systemInfo.databaseSize}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Uptime:</span>
              <span className={styles.infoValue}>{systemInfo.uptime}</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className={styles.settingsSection}>
          <h2>System Health</h2>
          <div className={styles.healthMetricsGrid}>
            <div className={styles.healthMetricCard}>
              <div className={styles.healthContent}>
                <p className={styles.healthLabel}>API Response Time</p>
                <p className={styles.healthValue}>245ms</p>
                <span className={`${styles.healthStatus} ${styles.good}`}>✅ Good</span>
              </div>
            </div>
            <div className={styles.healthMetricCard}>
              <div className={styles.healthContent}>
                <p className={styles.healthLabel}>Database Connections</p>
                <p className={styles.healthValue}>12/50</p>
                <span className={`${styles.healthStatus} ${styles.good}`}>✅ Good</span>
              </div>
            </div>
            <div className={styles.healthMetricCard}>
              <div className={styles.healthContent}>
                <p className={styles.healthLabel}>System Uptime</p>
                <p className={styles.healthValue}>99.9%</p>
                <span className={`${styles.healthStatus} ${styles.good}`}>✅ Good</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.settingsActions}>
          <button onClick={handleSave} className={styles.btnSave} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </button>
          <button
            onClick={handleReset}
            className={styles.btnResetSettings}
            disabled={loading}
          >
            Reload Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;
