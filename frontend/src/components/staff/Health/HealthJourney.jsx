import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import styles from "./HealthJourney.module.css";

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
      <div className={styles.hjTrendChartCard}>
        <div className={styles.hjTrendHeader}>
          <h4>{title}</h4>
        </div>
        <p className={styles.hjTrendEmpty}>No data in selected range</p>
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
    <div className={styles.hjTrendChartCard}>
      <div className={styles.hjTrendHeader}>
        <h4>{title}</h4>
        <span className={clsx(styles.hjTrendBadge, styles[`hjTrend${trend.charAt(0).toUpperCase() + trend.slice(1)}`])}>{trendLabel}</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={clsx(styles.hjTrendSvg, colorClass)}
        role="img"
        aria-label={`${title} trend`}
      >
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className={styles.hjTrendAxis} />
        {thresholds.map((threshold) => {
          const y = toY(threshold.value);
          return (
            <g key={threshold.label}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} className={clsx(styles.hjThresholdLine, threshold.className || "")} />
              <text x={width - padding - 2} y={y - 2} textAnchor="end" className={styles.hjThresholdLabel}>{threshold.label}</text>
            </g>
          );
        })}
        <path d={path} fill="none" strokeWidth="3" strokeLinecap="round" />
        {plottedPoints.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3.4" className={styles.hjTrendPoint}>
            <title>{`${formatDateLabel(points[index].date)}: ${point.value}${unit}`}</title>
          </circle>
        ))}
      </svg>
      <div className={styles.hjTrendFooter}>
        <span className={styles.hjTrendValue}>{latest.value}{unit}</span>
        <span className={styles.hjTrendDate}>{formatDateLabel(latest.date)}</span>
      </div>
    </div>
  );
}

function DualTrendChart({ title, points }) {
  if (!points.length) {
    return (
      <div className={styles.hjTrendChartCard}>
        <div className={styles.hjTrendHeader}><h4>{title}</h4></div>
        <p className={styles.hjTrendEmpty}>No data in selected range</p>
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
    { value: 120, label: "Sys 120", className: styles.hjThresholdSys },
    { value: 140, label: "Sys 140", className: styles.hjThresholdSysHigh },
    { value: 80, label: "Dia 80", className: styles.hjThresholdDia },
    { value: 90, label: "Dia 90", className: styles.hjThresholdDiaHigh },
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
    <div className={styles.hjTrendChartCard}>
      <div className={styles.hjTrendHeader}>
        <h4>{title}</h4>
        <span className={clsx(styles.hjTrendBadge, styles[`hjTrend${trend.charAt(0).toUpperCase() + trend.slice(1)}`])}>{trendLabel}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className={clsx(styles.hjTrendSvg, styles.hjTrendBpDual)} role="img" aria-label={`${title} trend`}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className={styles.hjTrendAxis} />
        {bpThresholds.map((threshold) => {
          const y = sharedY(threshold.value);
          return (
            <g key={threshold.label}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} className={clsx(styles.hjThresholdLine, threshold.className)} />
              <text x={padding + 2} y={y - 2} textAnchor="start" className={styles.hjThresholdLabel}>{threshold.label}</text>
            </g>
          );
        })}
        <path d={systolicLine.path} fill="none" strokeWidth="3" strokeLinecap="round" className={styles.hjBpSystolicLine} />
        {systolicLine.points.map((point, index) => (
          <circle key={`sys-${index}`} cx={point.x} cy={point.y} r="3.4" className={styles.hjBpSystolicPoint}>
            <title>{`${formatDateLabel(points[index].date)}: Systolic ${point.value}`}</title>
          </circle>
        ))}
        <path d={diastolicLine.path} fill="none" strokeWidth="3" strokeLinecap="round" className={styles.hjBpDiastolicLine} />
        {diastolicLine.points.map((point, index) => (
          <circle key={`dia-${index}`} cx={point.x} cy={point.y} r="3.4" className={styles.hjBpDiastolicPoint}>
            <title>{`${formatDateLabel(points[index].date)}: Diastolic ${point.value}`}</title>
          </circle>
        ))}
      </svg>
      <div className={styles.hjTrendFooter}>
        <span className={styles.hjTrendValue}>{latest.systolic}/{latest.diastolic} mmHg</span>
        <span className={styles.hjTrendDate}>{formatDateLabel(latest.date)}</span>
      </div>
      <p className={styles.hjBpLineLegend}>
        <span className={clsx(styles.hjLegendDot, styles.hjLegendBpSystolic)}></span> Systolic
        <span className={clsx(styles.hjLegendDot, styles.hjLegendBpDiastolic)}></span> Diastolic
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
    if (score >= 80) return { label: "Healthy", colorClass: styles.hjStatusGreen };
    if (score >= 60) return { label: "Monitor", colorClass: styles.hjStatusYellow };
    return { label: "Attention Needed", colorClass: styles.hjStatusRed };
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
      if (value < 120) return { level: "Normal", colorClass: styles.hjBadgeNormal };
      if (value < 140) return { level: "Elevated", colorClass: styles.hjBadgeCaution };
      return { level: "High", colorClass: styles.hjBadgeDanger };
    }
    if (type === "BMI") {
      if (value < 18.5) return { level: "Underweight", colorClass: styles.hjBadgeInfo };
      if (value < 25) return { level: "Normal", colorClass: styles.hjBadgeNormal };
      if (value < 30) return { level: "Overweight", colorClass: styles.hjBadgeCaution };
      return { level: "Obese", colorClass: styles.hjBadgeDanger };
    }
    if (type === "GLUCOSE") {
      if (value < 100) return { level: "Normal", colorClass: styles.hjBadgeNormal };
      if (value < 126) return { level: "Prediabetic", colorClass: styles.hjBadgeCaution };
      return { level: "Diabetic", colorClass: styles.hjBadgeDanger };
    }
    return { level: "Unknown", colorClass: styles.hjBadgeGray };
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
    <div className={styles.hjPage}>

      {/* Row 1: Health Alerts + Quick Stats */}
      <div className={styles.hjRow1}>
        <div className={styles.hjCard}>
          <div className={styles.hjSectionLabel}>Health Alerts</div>
          {error ? (
            <div className={clsx(styles.hjAlertRow, styles.hjAlertError)}>
              <span className={clsx(styles.hjAlertDot, styles.hjDotRed)}></span>
              <span className={clsx(styles.hjAlertMsg, styles.hjAlertMsgRed)}>{error}</span>
            </div>
          ) : (
            <div className={styles.hjAlertRow}>
              <span className={styles.hjAlertDot}></span>
              <span className={styles.hjAlertMsg}>No health alerts. Keep up the good work!</span>
            </div>
          )}
        </div>

        <div className={styles.hjCard}>
          <div className={styles.hjSectionLabel}>Quick Stats</div>
          <div className={styles.hjQsList}>
            <div className={styles.hjQsRow}>
              <span>Health score</span>
              <span className={styles.hjQsVal}>{healthScore}</span>
            </div>
            <div className={styles.hjQsRow}>
              <span>Status</span>
              <span className={clsx(styles.hjPill, healthStatus.colorClass)}>{healthStatus.label}</span>
            </div>
            <div className={styles.hjQsRow}>
              <span>Last check-in</span>
              <span className={styles.hjQsVal}>{latest ? new Date(latest.recordedAt).toLocaleDateString() : "—"}</span>
            </div>
            <div className={styles.hjQsRow}>
              <span>Since last vitals</span>
              <span className={styles.hjQsVal}>{daysSince !== null ? `${daysSince} days` : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Health Summary Banner */}
      <div className={styles.hjBanner}>
        <div className={styles.hjScoreRing}>
          <span className={styles.hjScoreNum}>{healthScore}</span>
          <span className={styles.hjScoreLbl}>score</span>
        </div>
        <div className={styles.hjBannerCenter}>
          <div className={styles.hjBannerTitle}>Your health summary</div>
          <div className={styles.hjBannerSub}>
            Last check-in: {latest ? new Date(latest.recordedAt).toLocaleDateString() : "—"}
            &nbsp;&middot;&nbsp;Days since last vitals: {daysSince !== null ? daysSince : "—"}
          </div>
          <div className={styles.hjBannerPills}>
            <span className={clsx(styles.hjPill, healthStatus.colorClass)}>{healthStatus.label}</span>
            <div className={styles.hjBannerSelectWrap}>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={styles.hjPeriodSelect}
              >
                <option value="7">View last: 7 days</option>
                <option value="30">View last: 30 days</option>
                <option value="90">View last: 90 days</option>
                <option value="365">View last: 1 year</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.hjBannerBtns}>
          <button
            type="button"
            className={styles.hjBtnGhost}
            onClick={exportAsPdf}
            disabled={generatingPDF || !vitals.length}
          >
            {generatingPDF ? "Generating..." : "Download PDF"}
          </button>
          <button type="button" className={styles.hjBtnGold} onClick={handleViewWellnessPlan}>
            View My Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.hjCard}>
          <p className={styles.hjLoadingText}>Loading health data...</p>
        </div>
      ) : (
        <>
          {/* Row 3: Latest Vital Signs */}
          {latest && (
            <div className={styles.hjSectionWrap}>
              <div className={styles.hjSectionLabel}>Latest Vital Signs</div>
              <div className={styles.hjVitalsGrid}>
                {latest.bmi != null && (
                  <div className={styles.hjVitalCard}>
                    <div className={styles.hjVitalLbl}>BMI</div>
                    <div className={styles.hjVitalVal}>{latest.bmi.toFixed(1)}</div>
                    <div className={styles.hjVitalUnit}>kg/m&sup2;</div>
                    <span className={getRiskLevel(latest.bmi, "BMI").colorClass}>
                      {getRiskLevel(latest.bmi, "BMI").level}
                    </span>
                  </div>
                )}
                {latest.systolicBP != null && latest.diastolicBP != null && (
                  <div className={styles.hjVitalCard}>
                    <div className={styles.hjVitalLbl}>Blood Pressure</div>
                    <div className={styles.hjVitalVal}>{latest.systolicBP}/{latest.diastolicBP}</div>
                    <div className={styles.hjVitalUnit}>mmHg</div>
                    <span className={getRiskLevel(latest.systolicBP, "BP_SYSTOLIC").colorClass}>
                      {getRiskLevel(latest.systolicBP, "BP_SYSTOLIC").level}
                    </span>
                  </div>
                )}
                {latest.heartRate != null && (
                  <div className={styles.hjVitalCard}>
                    <div className={styles.hjVitalLbl}>Heart Rate</div>
                    <div className={styles.hjVitalVal}>{latest.heartRate}</div>
                    <div className={styles.hjVitalUnit}>bpm</div>
                  </div>
                )}
                {latest.glucose != null && (
                  <div className={styles.hjVitalCard}>
                    <div className={styles.hjVitalLbl}>Glucose</div>
                    <div className={styles.hjVitalVal}>{latest.glucose}</div>
                    <div className={styles.hjVitalUnit}>mg/dL</div>
                    <span className={getRiskLevel(latest.glucose, "GLUCOSE").colorClass}>
                      {getRiskLevel(latest.glucose, "GLUCOSE").level}
                    </span>
                  </div>
                )}
                {latest.temperature != null && (
                  <div className={styles.hjVitalCard}>
                    <div className={styles.hjVitalLbl}>Temperature</div>
                    <div className={styles.hjVitalVal}>{latest.temperature}</div>
                    <div className={styles.hjVitalUnit}>&deg;C</div>
                  </div>
                )}
                {latest.oxygenSaturation != null && (
                  <div className={styles.hjVitalCard}>
                    <div className={styles.hjVitalLbl}>O&sub2; Saturation</div>
                    <div className={styles.hjVitalVal}>{latest.oxygenSaturation}%</div>
                    <div className={styles.hjVitalUnit}>SpO&sub2;</div>
                    <span className={latest.oxygenSaturation >= 95 ? styles.hjBadgeNormal : styles.hjBadgeDanger}>
                      {latest.oxygenSaturation >= 95 ? "Normal" : "Low"}
                    </span>
                  </div>
                )}
              </div>
              <p className={styles.hjLastRec}>Last recorded: {new Date(latest.recordedAt).toLocaleDateString()}</p>
            </div>
          )}

          {/* Row 4: Progress Metrics */}
          {latest && (
            <div className={styles.hjSectionWrap}>
              <div className={styles.hjSectionLabel}>Progress Metrics</div>
              <div className={styles.hjProgressGrid}>
                {latest.systolicBP != null && latest.diastolicBP != null && (() => {
                  const comp = calculateComparison(latest, getPreviousVital(), "systolicBP");
                  return (
                    <div className={styles.hjProgCard}>
                      <div className={styles.hjProgTop}>
                        <span className={styles.hjProgName}>Blood Pressure</span>
                        <span className={styles.hjProgVal}>{latest.systolicBP}/{latest.diastolicBP}</span>
                      </div>
                      <div className={styles.hjProgNote}>
                        {comp ? `Change: ${comp.diff > 0 ? "+" : ""}${comp.diff} mmHg from last record` : "Change: 0 mmHg from last record"}
                      </div>
                      <div className={styles.hjPbar}>
                        <div className={clsx(styles.hjPbarFill, latest.systolicBP < 130 ? styles.hjPbarGreen : styles.hjPbarAmber)}
                          style={{ width: `${Math.min(100, (latest.systolicBP / 180) * 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })()}
                {latest.bmi != null && (
                  <div className={styles.hjProgCard}>
                    <div className={styles.hjProgTop}>
                      <span className={styles.hjProgName}>BMI</span>
                      <span className={styles.hjProgVal}>{latest.bmi.toFixed(1)}</span>
                    </div>
                    <div className={styles.hjProgNote}>
                      {latest.bmi < 25 ? "Within healthy range" : latest.bmi < 30 ? "Slightly above healthy range" : "Above healthy range"}
                    </div>
                    <div className={styles.hjPbar}>
                      <div className={clsx(styles.hjPbarFill, latest.bmi < 25 ? styles.hjPbarGreen : styles.hjPbarAmber)}
                        style={{ width: `${Math.min(100, (latest.bmi / 40) * 100)}%` }}></div>
                    </div>
                  </div>
                )}
                <div className={styles.hjProgCard}>
                  <div className={styles.hjProgTop}>
                    <span className={styles.hjProgName}>Weight</span>
                    <span className={styles.hjProgVal}>
                      {getPreviousVital() && latest.weight != null && getPreviousVital().weight != null
                        ? `${((latest.weight - getPreviousVital().weight) / getPreviousVital().weight * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className={styles.hjProgNote}>No change recorded</div>
                  <div className={styles.hjPbar}><div className={clsx(styles.hjPbarFill, styles.hjPbarAmber)} style={{ width: "0%" }}></div></div>
                </div>
                <div className={styles.hjProgCard}>
                  <div className={styles.hjProgTop}>
                    <span className={styles.hjProgName}>Activity</span>
                    <span className={styles.hjProgVal}>0%</span>
                  </div>
                  <div className={styles.hjProgNote}>No activity logged</div>
                  <div className={styles.hjPbar}><div className={clsx(styles.hjPbarFill, styles.hjPbarAmber)} style={{ width: "0%" }}></div></div>
                </div>
              </div>
            </div>
          )}

          {/* Row 5: Risk Scoring Analysis */}
          <div className={styles.hjSectionWrap}>
            <div className={styles.hjSectionLabel}>Risk Scoring Analysis</div>
            <div className={clsx(styles.hjCard, styles.hjRiskCard)}>
              <div className={styles.hjRiskTop}>
                <div className={styles.hjRiskRing}>
                  <span className={styles.hjRiskRingNum}>{overallRisk}</span>
                  <span className={styles.hjRiskRingLbl}>score</span>
                </div>
                <div className={styles.hjRiskMeta}>
                  <h3>Overall risk assessment</h3>
                  <span className={clsx(styles.hjPill, styles.hjStatusGreen)}>{getRiskLabel(overallRisk)}</span>
                  <p className={styles.hjRiskDate}>Based on latest vitals &middot; {latest ? new Date(latest.recordedAt).toLocaleDateString() : "—"}</p>
                </div>
              </div>
              <div className={styles.hjRiskCats}>
                <div className={styles.hjRiskCat}>
                  <div className={styles.hjRiskCatLbl}>Hypertension risk</div>
                  <div className={styles.hjRiskCatVal}>{hypertensionRisk}%</div>
                  <div className={styles.hjPbar}><div className={clsx(styles.hjPbarFill, styles.hjPbarGray)} style={{ width: `${hypertensionRisk}%` }}></div></div>
                </div>
                <div className={styles.hjRiskCat}>
                  <div className={styles.hjRiskCatLbl}>Diabetes risk</div>
                  <div className={styles.hjRiskCatVal}>{diabetesRisk}%</div>
                  <div className={styles.hjPbar}><div className={clsx(styles.hjPbarFill, styles.hjPbarGray)} style={{ width: `${diabetesRisk}%` }}></div></div>
                </div>
                <div className={styles.hjRiskCat}>
                  <div className={styles.hjRiskCatLbl}>Obesity risk</div>
                  <div className={styles.hjRiskCatVal}>{obesityRisk}%</div>
                  <div className={styles.hjPbar}><div className={clsx(styles.hjPbarFill, styles.hjPbarGray)} style={{ width: `${obesityRisk}%` }}></div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 6: Recommendations */}
          <div className={styles.hjSectionWrap}>
            <div className={styles.hjSectionLabel}>Recommendations</div>
            <div className={clsx(styles.hjCard, styles.hjRecCard)}>
              {recommendations.map((rec, i) => (
                <div key={i} className={styles.hjRecItem}>
                  <span className={clsx(styles.hjRecDot, rec.type === "positive" ? styles.hjDotGreen : styles.hjDotAmber)}></span>
                  <span>{rec.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {vitals.length === 0 && !error && (
            <div className={clsx(styles.hjCard, styles.hjEmptyCard)}>
              <p className={styles.hjEmptyText}>No vital signs recorded in the selected range</p>
              <p className={styles.hjEmptySub}>Visit a nurse to record your health vitals and start tracking your health journey!</p>
              <button className={styles.hjBtnPrimary} onClick={() => setDateRange("365")}>
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