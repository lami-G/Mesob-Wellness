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
import styles from "./RegionHealthComparison.module.css";

function RegionHealthComparison() {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [sortBy, setSortBy] = useState("score");
  const [viewType, setViewType] = useState("score");
  const [displayMode, setDisplayMode] = useState("graph"); // 'graph' or 'table'
  const [cardPage, setCardPage] = useState(1);
  const cardsPerPage = 8;

  useEffect(() => {
    fetchHealthData();
  }, [timePeriod]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getRegionalHealthComparison(timePeriod);
      setHealthData(data || []);
    } catch (err) {
      console.error("Error fetching health comparison:", err);
      setError("Failed to load health comparison data");
    } finally {
      setLoading(false);
    }
  };

  // Sort data
  const sortedData = [...healthData].sort((a, b) => {
    if (sortBy === "score") return b.healthScore - a.healthScore;
    if (sortBy === "worst") return a.healthScore - b.healthScore;
    if (sortBy === "alphabetical") return a.region.localeCompare(b.region);
    return 0;
  });

  // Calculate summary metrics
  const avgScore =
    healthData.length > 0
      ? Math.round(
          healthData.reduce((sum, r) => sum + r.healthScore, 0) /
            healthData.length
        )
      : 0;

  const bestRegion = [...healthData].sort(
    (a, b) => b.healthScore - a.healthScore
  )[0];

  const mostAtRisk = [...healthData].sort(
    (a, b) => b.atRiskPercent - a.atRiskPercent
  )[0];

  // Get top 3 conditions across all regions
  const allConditions = {};
  healthData.forEach((region) => {
    Object.entries(region.conditions).forEach(([condition, count]) => {
      allConditions[condition] = (allConditions[condition] || 0) + count;
    });
  });

  const topConditions = Object.entries(allConditions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([condition]) => condition);

  // Prepare chart data
  const chartData = sortedData.map((region) => ({
    region: region.region,
    healthScore: region.healthScore,
    healthy: region.healthyPercent,
    atRisk: region.atRiskPercent,
    critical: region.criticalPercent,
    ...topConditions.reduce((acc, condition) => {
      acc[condition] = region.conditions[condition] || 0;
      return acc;
    }, {}),
  }));

  // Pagination for region cards
  const totalCardPages = Math.ceil(sortedData.length / cardsPerPage);
  const startIndex = (cardPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const paginatedRegions = sortedData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (cardPage > 1) setCardPage(cardPage - 1);
  };

  const handleNextPage = () => {
    if (cardPage < totalCardPages) setCardPage(cardPage + 1);
  };

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
        <div className={styles.loading}>Loading health comparison...</div>
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
        <div className={styles.empty}>No health data available</div>
      </div>
    );
  }

  return (
    <div className={styles.healthComparisonSection}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2>Regional Staff Health Comparison</h2>
          <p>Compare workplace health metrics across regions (Staff only)</p>
        </div>
        <div className={styles.headerControls}>
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
                  <XAxis dataKey="region" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "transparent",
                      border: "none",
                      boxShadow: "none",
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
              <h3>Risk Distribution by Region</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" domain={[0, 100]} stroke="#6B7280" />
                  <YAxis dataKey="region" type="category" stroke="#6B7280" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "transparent",
                      border: "none",
                      boxShadow: "none",
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
              <h3>Top Health Conditions by Region</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="region" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "transparent",
                      border: "none",
                      boxShadow: "none",
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
          <h3>Detailed Comparison Table</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
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
                {sortedData.map((region, index) => {
                  const topCondition = Object.entries(region.conditions).sort(
                    ([, a], [, b]) => b - a
                  )[0];
                  return (
                    <tr key={region.region}>
                      <td className={styles.rankCell}>#{index + 1}</td>
                      <td className={styles.regionCell}>{region.region}</td>
                      <td className={styles.scoreCell}>
                        <span
                          className={`${styles.scoreBadge} ${
                            region.healthScore >= 80
                              ? styles.scoreHigh
                              : region.healthScore >= 60
                              ? styles.scoreMedium
                              : styles.scoreLow
                          }`}
                        >
                          {region.healthScore}
                        </span>
                      </td>
                      <td>{region.totalStaff}</td>
                      <td className={styles.healthy}>{region.healthyPercent}%</td>
                      <td className={styles.atRisk}>{region.atRiskPercent}%</td>
                      <td className={styles.critical}>{region.criticalPercent}%</td>
                      <td>{region.vitalsRecorded}</td>
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
        </div>
      )}
    </div>
  );
}

export default RegionHealthComparison;
