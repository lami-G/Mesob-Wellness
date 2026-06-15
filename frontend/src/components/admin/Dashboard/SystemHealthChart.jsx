import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { adminService } from "../../../services/adminService";
import styles from "./SystemHealthChart.module.css";
import clsx from "clsx";

function SystemHealthChart() {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardMetrics();
      
      // Prepare system health data
      const health = [
        {
          name: "API Response",
          value: 245,
          max: 500,
          unit: "ms",
          status: "good",
        },
        {
          name: "DB Connections",
          value: 12,
          max: 50,
          unit: "/50",
          status: "good",
        },
        {
          name: "Uptime",
          value: 99.9,
          max: 100,
          unit: "%",
          status: "good",
        },
        {
          name: "Active Users",
          value: response.users?.active || 0,
          max: response.users?.total || 1,
          unit: "users",
          status: "good",
        },
      ];
      
      setHealthData(health);
    } catch (err) {
      console.error("Error fetching health data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.chartCard}><p>Loading system health...</p></div>;

  return (
    <div className={styles.chartCard}>
      <h3>System Health Status</h3>
      <div className={styles.chartPlaceholder}>
        {healthData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "value") return [value, "Current"];
                  if (name === "max") return [value, "Max"];
                  return value;
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#22c55e" name="Current" />
              <Bar dataKey="max" fill="#e0e0e0" name="Max" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No health data available</p>
        )}
      </div>
      <div className={styles.healthSummary}>
        {healthData.map((item, idx) => (
          <div key={idx} className={styles.healthItem}>
            <span className={styles.healthLabel}>{item.name}</span>
            <span className={styles.healthValue}>{item.value}{item.unit}</span>
            <span className={clsx(styles.healthStatus, styles[item.status])}>✓ {item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemHealthChart;
