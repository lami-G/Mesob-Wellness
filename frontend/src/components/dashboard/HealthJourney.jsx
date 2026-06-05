import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function extractGlucoseFromNotes(notes) {
  if (!notes || typeof notes !== "string") return null;
  const match = notes.match(/blood glucose:\s*(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : null;
}

function normalizeVitalRecord(record) {
  return {
    ...record,
    systolicBP: record.systolic ?? null,
    diastolicBP: record.diastolic ?? null,
    glucose: extractGlucoseFromNotes(record.notes),
  };
}

function formatDateLabel(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getTrendDirection(points) {
  if (!points || points.length < 2) return "stable";
  const first = points[0].value;
  const last = points[points.length - 1].value;
  if (last > first) return "up";
  if (last < first) return "down";
  return "stable";
}

function toChartGeometry(values, width, height, padding) {
  if (!values.length) return { points: [], path: "" };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const workingValues = values.length === 1 ? [values[0], values[0]] : values;
  const xStep =
    workingValues.length > 1
      ? (width - padding * 2) / (workingValues.length - 1)
      : 0;
  const allPoints = workingValues.map((value, index) => {
    const x = padding + index * xStep;
    const y =
      range === 0
        ? height / 2
        : padding + ((max - value) / range) * (height - padding * 2);
    return { x, y, value };
  });
  const path = allPoints
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(" ");
  const visiblePoints = values.length === 1 ? [allPoints[0]] : allPoints;
  return { points: visiblePoints, path };
}

function TrendChart({ title, unit, points, colorClass, thresholds = [] }) {
  if (!points.length) {
    return (
      <div className="hj-trend-chart-card">
        <div className="hj-trend-header">
          <h4>{title}</h4>
        </div>
        <p className="hj-trend-empty">No data in selected range</p>
      </div>
    );
  }
  const width = 280;
  const height = 90;
  const padding = 8;
  const values = points.map((p) => p.value);
  const { points: plottedPoints, path } = toChartGeometry(values, width, height, padding);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const toY = (value) => {
    if (range === 0) return height / 2;
    return padding + ((max - value) / range) * (height - padding * 2);
  };
  const trend = getTrendDirection(points);
  const trendLabel =
    trend === "up" ? "Increasing" : trend === "down" ? "Decreasing" : "Stable";
  const latest = points[points.length - 1];
  return (
    <div className="hj-trend-chart-card">
      <div className="hj-trend-header">
        <h4>{title}</h4>
        <span className={`hj-trend-badge hj-trend-${trend}`}>{trendLabel}</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`hj-trend-svg ${colorClass}`}
        role="img"
        aria-label={`${title} trend`}
      >
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="hj-trend-axis" />
        {thresholds.map((threshold) => {
          const y = toY(threshold.value);
          return (
            <g key={threshold.label}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} className={`hj-threshold-line ${threshold.className || ""}`} />
              <text x={width - padding - 2} y={y - 2} textAnchor="end" className="hj-threshold-label">{threshold.label}</text>
            </g>
          );
        })}
        <path d={path} fill="none" strokeWidth="3" strokeLinecap="round" />
        {plottedPoints.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3.4" className="hj-trend-point">
            <title>{`${formatDateLabel(points[index].date)}: ${point.value}${unit}`}</title>
          </circle>
        ))}
      </svg>
      <div className="hj-trend-footer">
        <span className="hj-trend-value">{latest.value}{unit}</span>
        <span className="hj-trend-date">{formatDateLabel(latest.date)}</span>
      </div>
    </div>
  );
}

function DualTrendChart({ title, points }) {
  if (!points.length) {
    return (
      <div className="hj-trend-chart-card">
        <div className="hj-trend-header"><h4>{title}</h4></div>
        <p className="hj-trend-empty">No data in selected range</p>
      </div>
    );
  }
  const width = 280;
  const height = 90;
  const padding = 8;
  const systolicValues = points.map((p) => p.systolic);
  const diastolicValues = points.map((p) => p.diastolic);
  const min = Math.min(...systolicValues, ...diastolicValues);
  const max = Math.max(...systolicValues, ...diastolicValues);
  const range = max - min;
  const sharedY = (value) => {
    if (range === 0) return height / 2;
    return padding + ((max - value) / range) * (height - padding * 2);
  };
  const bpThresholds = [
    { value: 120, label: "Sys 120", className: "hj-threshold-sys" },
    { value: 140, label: "Sys 140", className: "hj-threshold-sys-high" },
    { value: 80, label: "Dia 80", className: "hj-threshold-dia" },
    { value: 90, label: "Dia 90", className: "hj-threshold-dia-high" },
  ];
  const workingPoints = points.length === 1 ? [points[0], points[0]] : points;
  const xStep = workingPoints.length > 1 ? (width - padding * 2) / (workingPoints.length - 1) : 0;
  const buildLine = (key) => {
    const allPoints = workingPoints.map((point, index) => {
      const x = padding + index * xStep;
      const y = sharedY(point[key]);
      return { x, y, value: point[key] };
    });
    const path = allPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
    return { path, points: points.length === 1 ? [allPoints[0]] : allPoints };
  };
  const systolicLine = buildLine("systolic");
  const diastolicLine = buildLine("diastolic");
  const trend = getTrendDirection(points.map((p) => ({ date: p.date, value: p.systolic })));
  const trendLabel = trend === "up" ? "Systolic Rising" : trend === "down" ? "Systolic Falling" : "Stable";
  const latest = points[points.length - 1];
  return (
    <div className="hj-trend-chart-card">
      <div className="hj-trend-header">
        <h4>{title}</h4>
        <span className={`hj-trend-badge hj-trend-${trend}`}>{trendLabel}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="hj-trend-svg hj-trend-bp-dual" role="img" aria-label={`${title} trend`}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="hj-trend-axis" />
        {bpThresholds.map((threshold) => {
          const y = sharedY(threshold.value);
          return (
            <g key={threshold.label}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} className={`hj-threshold-line ${threshold.className}`} />
              <text x={padding + 2} y={y - 2} textAnchor="start" className="hj-threshold-label">{threshold.label}</text>
            </g>
          );
        })}
        <path d={systolicLine.path} fill="none" strokeWidth="3" strokeLinecap="round" className="hj-bp-systolic-line" />
        {systolicLine.points.map((point, index) => (
          <circle key={`sys-${index}`} cx={point.x} cy={point.y} r="3.4" className="hj-bp-systolic-point">
            <title>{`${formatDateLabel(points[index].date)}: Systolic ${point.value}`}</title>
          </circle>
        ))}
        <path d={diastolicLine.path} fill="none" strokeWidth="3" strokeLinecap="round" className="hj-bp-diastolic-line" />
        {diastolicLine.points.map((point, index) => (
          <circle key={`dia-${index}`} cx={point.x} cy={point.y} r="3.4" className="hj-bp-diastolic-point">
            <title>{`${formatDateLabel(points[index].date)}: Diastolic ${point.value}`}</title>
          </circle>
        ))}
      </svg>
      <div className="hj-trend-footer">
        <span className="hj-trend-value">{latest.systolic}/{latest.diastolic} mmHg</span>
        <span className="hj-trend-date">{formatDateLabel(latest.date)}</span>
      </div>
      <p className="hj-bp-line-legend">
        <span className="hj-legend-dot hj-legend-bp-systolic"></span> Systolic
        <span className="hj-legend-dot hj-legend-bp-diastolic"></span> Diastolic
      </p>
    </div>
  );
}

function HealthJourney() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const handleViewWellnessPlan = async () => {
    try {
      const response = await api.get(`/api/v1/plans/${user.id}`);
      const plans = response.data.data;
      const activePlan = Array.isArray(plans) ? plans.find((p) => p.isActive) : null;
      if (activePlan) {
        navigate("/dashboard?tab=wellness");
      } else {
        setError("No active wellness plan found. Visit a nurse to create one.");
      }
    } catch (err) {
      console.error("Error fetching wellness plan:", err);
      setError("Failed to load wellness plan");
    }
  };

  const exportAsPdf = async () => {
    try {
      setGeneratingPDF(true);
      setError("");
      const response = await api.post(
        `/api/v1/reports/combined/${user.id}?includeVitals=true`,
        {},
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `health-journey-${user.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      const errorMsg =
        err.response?.status === 403
          ? "You do not have permission to download this report"
          : err.response?.data?.message || "Failed to generate PDF";
      setError(errorMsg);
    } finally {
      setGeneratingPDF(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchVitals();
  }, [dateRange, user?.id]);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/vitals/history/${user.id}`);
      const data = response.data.data;
      let records = [];
      if (Array.isArray(data)) {
        records = data;
      } else if (data?.records && Array.isArray(data.records)) {
        records = data.records;
      } else if (data?.vitals && Array.isArray(data.vitals)) {
        records = data.vitals;
      }
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - Number(dateRange));
      const filtered = records.filter((record) => {
        const recordedDate = new Date(record.recordedAt);
        const isValid = !Number.isNaN(recordedDate.getTime());
        return isValid && recordedDate >= cutoff;
      });
      setVitals(filtered.map(normalizeVitalRecord));
      setError("");
    } catch (err) {
      console.error("Error fetching vitals:", err);
      setVitals([]);
      setError("Failed to load vitals");
    } finally {
      setLoading(false);
    }
  };

  const getLatestVital = () => (vitals.length > 0 ? vitals[0] : null);
  const getPreviousVital = () => (vitals.length > 1 ? vitals[1] : null);

  const calculateComparison = (current, previous, field) => {
    if (!current || !previous || current[field] == null || previous[field] == null) return null;
    const diff = current[field] - previous[field];
    const percent = ((diff / previous[field]) * 100).toFixed(1);
    return { diff: diff.toFixed(1), percent, direction: diff > 0 ? "up" : diff < 0 ? "down" : "stable" };
  };

  const getHealthScore = () => {
    const latest = getLatestVital();
    if (!latest) return 0;
    let score = 100;
    if (latest.systolicBP) {
      if (latest.systolicBP >= 140) score -= 20;
      else if (latest.systolicBP >= 130) score -= 10;
    }
    if (latest.glucose) {
      if (latest.glucose >= 200) score -= 20;
      else if (latest.glucose >= 126) score -= 10;
    }
    if (latest.bmi) {
      if (latest.bmi >= 30) score -= 20;
      else if (latest.bmi >= 25) score -= 10;
    }
    return Math.max(0, score);
  };

  const getHealthStatus = () => {
    const score = getHealthScore();
    if (score >= 80) return { label: "Healthy", colorClass: "hj-status-green" };
    if (score >= 60) return { label: "Monitor", colorClass: "hj-status-yellow" };
    return { label: "Attention Needed", colorClass: "hj-status-red" };
  };

  const getDaysSinceLastVital = () => {
    const latest = getLatestVital();
    if (!latest) return null;
    const lastDate = new Date(latest.recordedAt);
    const today = new Date();
    return Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  };

  const getRiskLevel = (value, type) => {
    if (type === "BP_SYSTOLIC") {
      if (value < 120) return { level: "Normal", colorClass: "hj-badge-normal" };
      if (value < 140) return { level: "Elevated", colorClass: "hj-badge-caution" };
      return { level: "High", colorClass: "hj-badge-danger" };
    }
    if (type === "BMI") {
      if (value < 18.5) return { level: "Underweight", colorClass: "hj-badge-info" };
      if (value < 25) return { level: "Normal", colorClass: "hj-badge-normal" };
      if (value < 30) return { level: "Overweight", colorClass: "hj-badge-caution" };
      return { level: "Obese", colorClass: "hj-badge-danger" };
    }
    if (type === "GLUCOSE") {
      if (value < 100) return { level: "Normal", colorClass: "hj-badge-normal" };
      if (value < 126) return { level: "Prediabetic", colorClass: "hj-badge-caution" };
      return { level: "Diabetic", colorClass: "hj-badge-danger" };
    }
    return { level: "Unknown", colorClass: "hj-badge-gray" };
  };

  const getRiskPercent = (value, type) => {
    if (type === "HYPERTENSION") {
      if (!value) return 0;
      if (value < 120) return 5;
      if (value < 130) return 30;
      if (value < 140) return 55;
      return 85;
    }
    if (type === "DIABETES") {
      if (!value) return 0;
      if (value < 100) return 5;
      if (value < 126) return 45;
      return 85;
    }
    if (type === "OBESITY") {
      if (!value) return 0;
      if (value < 25) return 5;
      if (value < 30) return 40;
      return 80;
    }
    return 0;
  };

  const getOverallRiskScore = (latest) => {
    if (!latest) return 0;
    const h = getRiskPercent(latest.systolicBP, "HYPERTENSION");
    const d = getRiskPercent(latest.glucose, "DIABETES");
    const o = getRiskPercent(latest.bmi, "OBESITY");
    return Math.round((h + d + o) / 3);
  };

  const getRiskLabel = (score) => {
    if (score < 20) return "Low risk";
    if (score < 50) return "Moderate risk";
    return "High risk";
  };

  const getRecommendations = (latest) => {
    const recs = [];
    if (!latest) {
      recs.push({ text: "Visit a nurse to record your first vitals and start tracking your health journey.", type: "caution" });
      return recs;
    }
    const score = getHealthScore();
    if (score >= 80) recs.push({ text: "Keep maintaining your healthy lifestyle.", type: "positive" });
    if (!latest.glucose) recs.push({ text: "Consider logging activity data regularly to track progress over time.", type: "caution" });
    recs.push({ text: "Schedule your next vitals check-in within 30 days.", type: "caution" });
    if (latest.systolicBP >= 130) recs.push({ text: "Monitor your blood pressure — consider reducing sodium intake and increasing aerobic activity.", type: "caution" });
    if (latest.bmi >= 25) recs.push({ text: "Work toward a BMI under 25 through balanced diet and regular exercise.", type: "caution" });
    if (latest.glucose >= 100) recs.push({ text: "Track your blood glucose levels — consider reducing refined sugars.", type: "caution" });
    return recs;
  };

  const latest = getLatestVital();
  const healthScore = getHealthScore();
  const healthStatus = getHealthStatus();
  const daysSince = getDaysSinceLastVital();
  const overallRisk = getOverallRiskScore(latest);
  const recommendations = getRecommendations(latest);

  const hypertensionRisk = latest ? getRiskPercent(latest.systolicBP, "HYPERTENSION") : 0;
  const diabetesRisk = latest ? getRiskPercent(latest.glucose, "DIABETES") : 0;
  const obesityRisk = latest ? getRiskPercent(latest.bmi, "OBESITY") : 0;

  return (
    <div className="hj-page">

      {/* Row 1: Health Alerts + Quick Stats */}
      <div className="hj-row1">
        <div className="hj-card">
          <div className="hj-section-label">Health Alerts</div>
          {error ? (
            <div className="hj-alert-row hj-alert-error">
              <span className="hj-alert-dot hj-dot-red"></span>
              <span className="hj-alert-msg hj-alert-msg-red">{error}</span>
            </div>
          ) : (
            <div className="hj-alert-row">
              <span className="hj-alert-dot"></span>
              <span className="hj-alert-msg">No health alerts. Keep up the good work!</span>
            </div>
          )}
        </div>

        <div className="hj-card">
          <div className="hj-section-label">Quick Stats</div>
          <div className="hj-qs-list">
            <div className="hj-qs-row">
              <span>Health score</span>
              <span className="hj-qs-val">{healthScore}</span>
            </div>
            <div className="hj-qs-row">
              <span>Status</span>
              <span className={`hj-pill ${healthStatus.colorClass}`}>{healthStatus.label}</span>
            </div>
            <div className="hj-qs-row">
              <span>Last check-in</span>
              <span className="hj-qs-val">{latest ? new Date(latest.recordedAt).toLocaleDateString() : "—"}</span>
            </div>
            <div className="hj-qs-row">
              <span>Since last vitals</span>
              <span className="hj-qs-val">{daysSince !== null ? `${daysSince} days` : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Health Summary Banner */}
      <div className="hj-banner">
        <div className="hj-score-ring">
          <span className="hj-score-num">{healthScore}</span>
          <span className="hj-score-lbl">score</span>
        </div>
        <div className="hj-banner-center">
          <div className="hj-banner-title">Your health summary</div>
          <div className="hj-banner-sub">
            Last check-in: {latest ? new Date(latest.recordedAt).toLocaleDateString() : "—"}
            &nbsp;&middot;&nbsp;Days since last vitals: {daysSince !== null ? daysSince : "—"}
          </div>
          <div className="hj-banner-pills">
            <span className={`hj-pill ${healthStatus.colorClass}`}>{healthStatus.label}</span>
            <div className="hj-banner-select-wrap">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="hj-period-select"
              >
                <option value="7">View last: 7 days</option>
                <option value="30">View last: 30 days</option>
                <option value="90">View last: 90 days</option>
                <option value="365">View last: 1 year</option>
              </select>
            </div>
          </div>
        </div>
        <div className="hj-banner-btns">
          <button
            type="button"
            className="hj-btn-ghost"
            onClick={exportAsPdf}
            disabled={generatingPDF || !vitals.length}
          >
            {generatingPDF ? "Generating..." : "Download PDF"}
          </button>
          <button type="button" className="hj-btn-gold" onClick={handleViewWellnessPlan}>
            View My Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="hj-card">
          <p className="hj-loading-text">Loading health data...</p>
        </div>
      ) : (
        <>
          {/* Row 3: Latest Vital Signs */}
          {latest && (
            <div className="hj-section-wrap">
              <div className="hj-section-label">Latest Vital Signs</div>
              <div className="hj-vitals-grid">
                {latest.bmi != null && (
                  <div className="hj-vital-card">
                    <div className="hj-vital-lbl">BMI</div>
                    <div className="hj-vital-val">{latest.bmi.toFixed(1)}</div>
                    <div className="hj-vital-unit">kg/m&sup2;</div>
                    <span className={`hj-badge ${getRiskLevel(latest.bmi, "BMI").colorClass}`}>
                      {getRiskLevel(latest.bmi, "BMI").level}
                    </span>
                  </div>
                )}
                {latest.systolicBP != null && latest.diastolicBP != null && (
                  <div className="hj-vital-card">
                    <div className="hj-vital-lbl">Blood Pressure</div>
                    <div className="hj-vital-val">{latest.systolicBP}/{latest.diastolicBP}</div>
                    <div className="hj-vital-unit">mmHg</div>
                    <span className={`hj-badge ${getRiskLevel(latest.systolicBP, "BP_SYSTOLIC").colorClass}`}>
                      {getRiskLevel(latest.systolicBP, "BP_SYSTOLIC").level}
                    </span>
                  </div>
                )}
                {latest.heartRate != null && (
                  <div className="hj-vital-card">
                    <div className="hj-vital-lbl">Heart Rate</div>
                    <div className="hj-vital-val">{latest.heartRate}</div>
                    <div className="hj-vital-unit">bpm</div>
                  </div>
                )}
                {latest.glucose != null && (
                  <div className="hj-vital-card">
                    <div className="hj-vital-lbl">Glucose</div>
                    <div className="hj-vital-val">{latest.glucose}</div>
                    <div className="hj-vital-unit">mg/dL</div>
                    <span className={`hj-badge ${getRiskLevel(latest.glucose, "GLUCOSE").colorClass}`}>
                      {getRiskLevel(latest.glucose, "GLUCOSE").level}
                    </span>
                  </div>
                )}
                {latest.temperature != null && (
                  <div className="hj-vital-card">
                    <div className="hj-vital-lbl">Temperature</div>
                    <div className="hj-vital-val">{latest.temperature}</div>
                    <div className="hj-vital-unit">&deg;C</div>
                  </div>
                )}
                {latest.oxygenSaturation != null && (
                  <div className="hj-vital-card">
                    <div className="hj-vital-lbl">O&sub2; Saturation</div>
                    <div className="hj-vital-val">{latest.oxygenSaturation}%</div>
                    <div className="hj-vital-unit">SpO&sub2;</div>
                    <span className={`hj-badge ${latest.oxygenSaturation >= 95 ? "hj-badge-normal" : "hj-badge-danger"}`}>
                      {latest.oxygenSaturation >= 95 ? "Normal" : "Low"}
                    </span>
                  </div>
                )}
              </div>
              <p className="hj-last-rec">Last recorded: {new Date(latest.recordedAt).toLocaleDateString()}</p>
            </div>
          )}

          {/* Row 4: Progress Metrics */}
          {latest && (
            <div className="hj-section-wrap">
              <div className="hj-section-label">Progress Metrics</div>
              <div className="hj-progress-grid">
                {latest.systolicBP != null && latest.diastolicBP != null && (() => {
                  const comp = calculateComparison(latest, getPreviousVital(), "systolicBP");
                  return (
                    <div className="hj-prog-card">
                      <div className="hj-prog-top">
                        <span className="hj-prog-name">Blood Pressure</span>
                        <span className="hj-prog-val">{latest.systolicBP}/{latest.diastolicBP}</span>
                      </div>
                      <div className="hj-prog-note">
                        {comp ? `Change: ${comp.diff > 0 ? "+" : ""}${comp.diff} mmHg from last record` : "Change: 0 mmHg from last record"}
                      </div>
                      <div className="hj-pbar">
                        <div className={`hj-pbar-fill ${latest.systolicBP < 130 ? "hj-pbar-green" : "hj-pbar-amber"}`}
                          style={{ width: `${Math.min(100, (latest.systolicBP / 180) * 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })()}
                {latest.bmi != null && (
                  <div className="hj-prog-card">
                    <div className="hj-prog-top">
                      <span className="hj-prog-name">BMI</span>
                      <span className="hj-prog-val">{latest.bmi.toFixed(1)}</span>
                    </div>
                    <div className="hj-prog-note">
                      {latest.bmi < 25 ? "Within healthy range" : latest.bmi < 30 ? "Slightly above healthy range" : "Above healthy range"}
                    </div>
                    <div className="hj-pbar">
                      <div className={`hj-pbar-fill ${latest.bmi < 25 ? "hj-pbar-green" : "hj-pbar-amber"}`}
                        style={{ width: `${Math.min(100, (latest.bmi / 40) * 100)}%` }}></div>
                    </div>
                  </div>
                )}
                <div className="hj-prog-card">
                  <div className="hj-prog-top">
                    <span className="hj-prog-name">Weight</span>
                    <span className="hj-prog-val">
                      {getPreviousVital() && latest.weight != null && getPreviousVital().weight != null
                        ? `${((latest.weight - getPreviousVital().weight) / getPreviousVital().weight * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="hj-prog-note">No change recorded</div>
                  <div className="hj-pbar"><div className="hj-pbar-fill hj-pbar-amber" style={{ width: "0%" }}></div></div>
                </div>
                <div className="hj-prog-card">
                  <div className="hj-prog-top">
                    <span className="hj-prog-name">Activity</span>
                    <span className="hj-prog-val">0%</span>
                  </div>
                  <div className="hj-prog-note">No activity logged</div>
                  <div className="hj-pbar"><div className="hj-pbar-fill hj-pbar-amber" style={{ width: "0%" }}></div></div>
                </div>
              </div>
            </div>
          )}

          {/* Row 5: Risk Scoring Analysis */}
          <div className="hj-section-wrap">
            <div className="hj-section-label">Risk Scoring Analysis</div>
            <div className="hj-card hj-risk-card">
              <div className="hj-risk-top">
                <div className="hj-risk-ring">
                  <span className="hj-risk-ring-num">{overallRisk}</span>
                  <span className="hj-risk-ring-lbl">score</span>
                </div>
                <div className="hj-risk-meta">
                  <h3>Overall risk assessment</h3>
                  <span className="hj-pill hj-status-green">{getRiskLabel(overallRisk)}</span>
                  <p className="hj-risk-date">Based on latest vitals &middot; {latest ? new Date(latest.recordedAt).toLocaleDateString() : "—"}</p>
                </div>
              </div>
              <div className="hj-risk-cats">
                <div className="hj-risk-cat">
                  <div className="hj-risk-cat-lbl">Hypertension risk</div>
                  <div className="hj-risk-cat-val">{hypertensionRisk}%</div>
                  <div className="hj-pbar"><div className="hj-pbar-fill hj-pbar-gray" style={{ width: `${hypertensionRisk}%` }}></div></div>
                </div>
                <div className="hj-risk-cat">
                  <div className="hj-risk-cat-lbl">Diabetes risk</div>
                  <div className="hj-risk-cat-val">{diabetesRisk}%</div>
                  <div className="hj-pbar"><div className="hj-pbar-fill hj-pbar-gray" style={{ width: `${diabetesRisk}%` }}></div></div>
                </div>
                <div className="hj-risk-cat">
                  <div className="hj-risk-cat-lbl">Obesity risk</div>
                  <div className="hj-risk-cat-val">{obesityRisk}%</div>
                  <div className="hj-pbar"><div className="hj-pbar-fill hj-pbar-gray" style={{ width: `${obesityRisk}%` }}></div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 6: Recommendations */}
          <div className="hj-section-wrap">
            <div className="hj-section-label">Recommendations</div>
            <div className="hj-card hj-rec-card">
              {recommendations.map((rec, i) => (
                <div key={i} className="hj-rec-item">
                  <span className={`hj-rec-dot ${rec.type === "positive" ? "hj-dot-green" : "hj-dot-amber"}`}></span>
                  <span>{rec.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {vitals.length === 0 && !error && (
            <div className="hj-card hj-empty-card">
              <p className="hj-empty-text">No vital signs recorded in the selected range</p>
              <p className="hj-empty-sub">Visit a nurse to record your health vitals and start tracking your health journey!</p>
              <button className="hj-btn-primary" onClick={() => setDateRange("365")}>
                View All Time Data
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HealthJourney;