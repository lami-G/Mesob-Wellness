import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function DashboardCharts() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardMetrics();
      setMetrics(response);
    } catch (err) {
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-charts"><p>Loading charts...</p></div>;
  if (!metrics) return <div className="dashboard-charts"><p>No data available</p></div>;

  // Prepare appointment trend data (simulated time series based on current data)
  const generateTrendData = (baseValue, label) => {
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    for (let i = 0; i < 6; i++) {
      const variance = Math.floor(Math.random() * (baseValue * 0.3)) - (baseValue * 0.15);
      data.push({
        name: months[i],
        value: Math.max(0, Math.floor(baseValue + variance)),
      });
    }
    return data;
  };

  // Centers by region data for bar chart
  const centersByRegion = Object.entries(metrics.centers?.byRegion || {}).map(([region, count]) => ({
    name: region || "Unknown",
    value: count,
  }));

  return (
    <div className="dashboard-charts">
      <div className="charts-grid">
        {/* Centers by Region - Bar Chart */}
        <div className="chart-card">
          <h3>Centers by Region</h3>
          <div className="chart-container">
            {centersByRegion.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={centersByRegion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No center data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;
