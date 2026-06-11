import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { adminService } from "../../../services/adminService";
import styles from "./CenterHealthComparison.module.css";

function CenterHealthComparison() {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [viewType, setViewType] = useState("score");
  const [displayMode, setDisplayMode] = useState("graph");
  const [availableRegions, setAvailableRegions] = useState([]);
  const [tablePage, setTablePage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchHealthData();
  }, [timePeriod, regionFilter]);

  useEffect(() => {
    // Extract unique regions from health data
    const regions = [...new Set(healthData.map(d => d.region))].sort();
    setAvailableRegions(regions);
  }, [healthData]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setTablePage(1);
  }, [timePeriod, regionFilter, sortBy]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getCenterHealthComparison(timePeriod, regionFilter);
      setHealthData(data || []);
    } catch (err) {
      console.error("Error fetching center health comparison:", err);
      setError("Failed to load center health comparison data");
    } finally {
      setLoading(false);
    }
  };

  // Sort data
  const sortedData = [...healthData].sort((a, b) => {
    if (sortBy === "score") return b.healthScore - a.healthScore;
    if (sortBy === "worst") return a.healthScore - b.healthScore;
    if (sortBy === "alphabetical") return a.centerName.localeCompare(b.centerName);
    return 0;
  });

  // Pagination for table
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (tablePage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (tablePage > 1) setTablePage(tablePage - 1);
  };

  const handleNextPage = () => {
    if (tablePage < totalPages) setTablePage(tablePage + 1);
  };

  // Get top 3 conditions across all centers
  const allConditions = {};
  healthData.forEach((center) => {
    Object.entries(center.conditions).forEach(([condition, count]) => {
      allConditions[condition] = (allConditions[condition] || 0) + count;
    });
  });

  const topConditions = Object.entries(allConditions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([condition]) => condition);

  // Prepare chart data
  const chartData = sortedData.map((center) => ({
    center: center.centerName,
    region: center.region,
    healthScore: center.healthScore,
    healthy: center.healthyPercent,
    atRisk: center.atRiskPercent,
    critical: center.criticalPercent,
    ...topConditions.reduce((acc, condition) => {
      acc[condition] = center.conditions[condition] || 0;
      return acc;
    }, {}),
  }));

  const getConditionLabel = (condition) => {
    return condition
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const conditionColors = {
    hypertension: "#dc2626",
    diabetes: "#2563eb",
    overweight: "#f59e0b",
    obesity: "#7c3aed",
    heart_respiratory: "#ec4899",
    normal: "#10b981",
  };

  if (loading) {
    return (
      <div className={styles.healthComparisonSection}>
        <div className={styles.loading}>Loading center health comparison...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.healthComparisonSection}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (healthData.length === 0) {
    return (
      <div className={styles.healthComparisonSection}>
        <div className={styles.empty}>No health data available for centers</div>
      </div>
    );
  }

  return (
    <div className={styles.healthComparisonSection}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2>Center Staff Health Comparison</h2>
          <p>Compare workplace health metrics across centers (Staff only)</p>
        </div>
        <div className={styles.headerControls}>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Regions</option>
            {availableRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className={styles.select}
          >
            <option value="score">Health Score</option>
            <option value="risk">Risk Distribution</option>
            <option value="conditions">Top Conditions</option>
          </select>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className={styles.select}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all">All Time</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.select}
          >
            <option value="score">Best to Worst</option>
            <option value="worst">Worst to Best</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Toggle between Graph and Table */}
      <div className={styles.displayToggle}>
        <button
          className={`${styles.toggleBtn} ${displayMode === "graph" ? styles.active : ""}`}
          onClick={() => setDisplayMode("graph")}
        >
          📊 Graph View
        </button>
        <button
          className={`${styles.toggleBtn} ${displayMode === "table" ? styles.active : ""}`}
          onClick={() => setDisplayMode("table")}
        >
          📋 Table View
        </button>
      </div>

      {/* Charts Section - Only show when displayMode is 'graph' */}
      {displayMode === "graph" && (
        <div className={styles.chartsSection}>
          {viewType === "score" && (
            <div className={styles.chartCard}>
              <h3>Health Score Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="center" stroke="#6B7280" angle={-45} textAnchor="end" height={120} />
                  <YAxis stroke="#6B7280" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d0d7ea",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      padding: "12px",
                    }}
                    labelStyle={{
                      color: "#213d8d",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                    itemStyle={{
                      color: "#1f2937",
                      padding: "4px 0",
                    }}
                  />
                  <Bar dataKey="healthScore" fill="#213D8D" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.healthScore >= 80
                            ? "#10b981"
                            : entry.healthScore >= 60
                            ? "#f5a623"
                            : "#dc2626"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {viewType === "risk" && (
            <div className={styles.chartCard}>
              <h3>Risk Distribution by Center</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" domain={[0, 100]} stroke="#6B7280" />
                  <YAxis dataKey="center" type="category" stroke="#6B7280" width={150} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d0d7ea",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      padding: "12px",
                    }}
                    labelStyle={{
                      color: "#213d8d",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                    itemStyle={{
                      color: "#1f2937",
                      padding: "4px 0",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="healthy" stackId="a" fill="#10b981" name="Healthy %" />
                  <Bar dataKey="atRisk" stackId="a" fill="#f5a623" name="At-Risk %" />
                  <Bar dataKey="critical" stackId="a" fill="#dc2626" name="Critical %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {viewType === "conditions" && topConditions.length > 0 && (
            <div className={styles.chartCard}>
              <h3>Top Health Conditions by Center</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="center" stroke="#6B7280" angle={-45} textAnchor="end" height={120} />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d0d7ea",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      padding: "12px",
                    }}
                    labelStyle={{
                      color: "#213d8d",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                    itemStyle={{
                      color: "#1f2937",
                      padding: "4px 0",
                    }}
                  />
                  <Legend />
                  {topConditions.map((condition, index) => (
                    <Bar
                      key={condition}
                      dataKey={condition}
                      fill={
                        conditionColors[condition] ||
                        `hsl(${(index * 60) % 360}, 70%, 50%)`
                      }
                      name={getConditionLabel(condition)}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Detailed Table - Only show when displayMode is 'table' */}
      {displayMode === "table" && (
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3>Detailed Comparison Table</h3>
            {totalPages > 1 && (
              <div className={styles.tablePagination}>
                <button
                  onClick={handlePrevPage}
                  disabled={tablePage === 1}
                  className={styles.paginationBtn}
                >
                  ← Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {tablePage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={tablePage === totalPages}
                  className={styles.paginationBtn}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Center Name</th>
                  <th>Region</th>
                  <th>Score</th>
                  <th>Staff</th>
                  <th>Healthy %</th>
                  <th>At-Risk %</th>
                  <th>Critical %</th>
                  <th>Vitals Recorded</th>
                  <th>Top Condition</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((center, index) => {
                  const actualRank = startIndex + index + 1;
                  const topCondition = Object.entries(center.conditions).sort(
                    ([, a], [, b]) => b - a
                  )[0];
                  return (
                    <tr key={center.centerId}>
                      <td className={styles.rankCell}>#{actualRank}</td>
                      <td className={styles.centerCell}>{center.centerName}</td>
                      <td className={styles.regionCell}>{center.region}</td>
                      <td className={styles.scoreCell}>
                        <span
                          className={`${styles.scoreBadge} ${
                            center.healthScore >= 80
                              ? styles.scoreHigh
                              : center.healthScore >= 60
                              ? styles.scoreMedium
                              : styles.scoreLow
                          }`}
                        >
                          {center.healthScore}
                        </span>
                      </td>
                      <td>{center.totalStaff}</td>
                      <td className={styles.healthy}>{center.healthyPercent}%</td>
                      <td className={styles.atRisk}>{center.atRiskPercent}%</td>
                      <td className={styles.critical}>{center.criticalPercent}%</td>
                      <td>{center.vitalsRecorded}</td>
                      <td>
                        {topCondition
                          ? `${getConditionLabel(topCondition[0])} (${topCondition[1]})`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className={styles.tableFooter}>
              <div className={styles.tableInfo}>
                Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} centers
              </div>
              <div className={styles.tablePagination}>
                <button
                  onClick={handlePrevPage}
                  disabled={tablePage === 1}
                  className={styles.paginationBtn}
                >
                  ← Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {tablePage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={tablePage === totalPages}
                  className={styles.paginationBtn}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CenterHealthComparison;
