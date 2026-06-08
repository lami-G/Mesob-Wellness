import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import api from "../../../services/api";
import styles from "./HealthData.module.css";

function HealthData() {
  const [stats, setStats] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState("daily");

  useEffect(() => {
    fetchHealthStats();
  }, [timePeriod]);

  const fetchHealthStats = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on timePeriod
      const now = new Date();
      let startDate, endDate;
      
      if (timePeriod === 'daily') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      } else if (timePeriod === 'weekly') {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else if (timePeriod === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      }
      
      // Fetch dashboard metrics
      const data = await adminService.getDashboardMetrics(timePeriod);
      setStats(data);
      
      // Fetch condition data with date range
      const conditionResponse = await api.get(
        `/api/v1/conditions/period?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (conditionResponse.data.data) {
        // Filter out "other" condition
        const filteredConditions = conditionResponse.data.data.filter(
          c => c.condition.toLowerCase() !== 'other'
        );
        setConditions(filteredConditions);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching health stats:", err);
      setError(err.message || "Failed to load health statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading health statistics...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!stats) return <div className={styles.error}>No data available</div>;

  return (
    <div className={styles.healthDataPage}>
      <div className={styles.pageHeader}>
        <h1>Health Data Analytics</h1>
        <p>Aggregated health statistics and trends (anonymized)</p>
      </div>

      <div className={styles.timePeriodSelector}>
        <button
          className={`${styles.periodBtn} ${timePeriod === "daily" ? styles.active : ""}`}
          onClick={() => setTimePeriod("daily")}
        >
          Daily
        </button>
        <button
          className={`${styles.periodBtn} ${timePeriod === "weekly" ? styles.active : ""}`}
          onClick={() => setTimePeriod("weekly")}
        >
          Weekly
        </button>
        <button
          className={`${styles.periodBtn} ${timePeriod === "monthly" ? styles.active : ""}`}
          onClick={() => setTimePeriod("monthly")}
        >
          Monthly
        </button>
      </div>

      <div className={styles.statsGrid}>
        {/* Vital Statistics */}
        <div className={styles.statCard}>
          <h3>📊 Vital Records</h3>
          <div className={styles.statValue}>{stats.vitals?.total || 0}</div>
          <p className={styles.statLabel}>Total Records</p>
        </div>

        <div className={styles.statCard}>
          <h3>❤️ Average Heart Rate</h3>
          <div className={styles.statValue}>{stats.vitals?.averageHeartRate?.toFixed(0) || "-"}</div>
          <p className={styles.statLabel}>bpm</p>
        </div>

        <div className={styles.statCard}>
          <h3>🌡️ Average Temperature</h3>
          <div className={styles.statValue}>{stats.vitals?.averageTemperature?.toFixed(1) || "-"}</div>
          <p className={styles.statLabel}>°C</p>
        </div>

        <div className={styles.statCard}>
          <h3>💨 Average O2 Saturation</h3>
          <div className={styles.statValue}>{stats.vitals?.averageOxygenSaturation?.toFixed(0) || "-"}</div>
          <p className={styles.statLabel}>%</p>
        </div>

        <div className={styles.statCard}>
          <h3>⚖️ Average BMI</h3>
          <div className={styles.statValue}>{stats.vitals?.averageBMI?.toFixed(1) || "-"}</div>
          <p className={styles.statLabel}>kg/m²</p>
        </div>

        <div className={styles.statCard}>
          <h3>🩸 Average Systolic BP</h3>
          <div className={styles.statValue}>{stats.vitals?.averageSystolic?.toFixed(0) || "-"}</div>
          <p className={styles.statLabel}>mmHg</p>
        </div>

        <div className={styles.statCard}>
          <h3>🩸 Average Diastolic BP</h3>
          <div className={styles.statValue}>{stats.vitals?.averageDiastolic?.toFixed(0) || "-"}</div>
          <p className={styles.statLabel}>mmHg</p>
        </div>

        {/* Wellness Statistics */}
        <div className={styles.statCard}>
          <h3>💪 Wellness Plans</h3>
          <div className={styles.statValue}>{stats.wellness?.total || 0}</div>
          <p className={styles.statLabel}>Total Plans</p>
        </div>

        <div className={styles.statCard}>
          <h3>✅ Active Plans</h3>
          <div className={styles.statValue}>{stats.wellness?.active || 0}</div>
          <p className={styles.statLabel}>Currently Active</p>
        </div>
      </div>

      <div className={styles.distributionGrid}>
        {/* Health Conditions */}
        {conditions.length > 0 && (
          <div className={`${styles.distributionCard} ${styles.distributionCardFull}`}>
            <h3>Health Conditions</h3>
            <div className={styles.distributionBars}>
              {conditions.map((item, idx) => {
                const total = conditions.reduce((sum, c) => sum + c.count, 0) || 1;
                const percentage = (item.count / total) * 100;
                return (
                  <div key={idx} className={styles.barItem}>
                    <span className={styles.barLabel}>{item.condition}</span>
                    <div className={styles.barContainer}>
                      <div className={styles.bar} style={{width: `${percentage}%`}}></div>
                    </div>
                    <span className={styles.barValue}>{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className={styles.confidentialityNotice}>
        <p>⚠️ <strong>Confidentiality Notice:</strong> This page displays only aggregated and anonymized health statistics. Individual patient health records are only accessible to authorized clinical staff.</p>
      </div>
    </div>
  );
}

export default HealthData;
