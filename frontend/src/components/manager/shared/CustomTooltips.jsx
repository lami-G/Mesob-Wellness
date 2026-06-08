import React from 'react';
import styles from './CustomTooltips.module.css';

// ─── Custom Tooltip Components ────────────────────────────────────────────────
// Outstanding custom tooltips with perfect visibility

export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipDark}>
        <p className={styles.tooltipDarkHeader}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className={styles.tooltipDarkItem}>
            <span style={{ color: entry.color }}>●</span> {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Outstanding Appointment Trends Tooltip with detailed breakdown
export const CustomAppointmentTrendsTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload || {};
    const total = data.total || 0;
    const completed = data.completed || 0;
    const noShow = data.noShow || 0;
    const pending = total - completed - noShow;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return (
      <div className={styles.tooltipLight}>
        {/* Header with day */}
        <div className={styles.tooltipLightHeader}>
          <span className={styles.tooltipLightHeaderIcon}>📅</span>
          {label}
        </div>

        {/* Metrics List */}
        <div className={styles.tooltipMetricsGrid}>
          {/* Total Appointments */}
          <div className={styles.tooltipMetricRow}>
            <span className={styles.tooltipMetricLabel}>
              <span className={styles.tooltipMetricIcon}>📊</span> Total
            </span>
            <span className={styles.tooltipMetricValue} style={{ color: '#3b82f6' }}>
              {total}
            </span>
          </div>

          {/* Completed */}
          <div className={styles.tooltipMetricRow}>
            <span className={styles.tooltipMetricLabel}>
              <span className={styles.tooltipMetricIcon}>✅</span> Completed
            </span>
            <span className={styles.tooltipMetricValue} style={{ color: '#10b981' }}>
              {completed}
            </span>
          </div>

          {/* No-Show */}
          <div className={styles.tooltipMetricRow}>
            <span className={styles.tooltipMetricLabel}>
              <span className={styles.tooltipMetricIcon}>❌</span> No-Show
            </span>
            <span className={styles.tooltipMetricValue} style={{ color: '#f59e0b' }}>
              {noShow}
            </span>
          </div>

          {/* Pending (if any) */}
          {pending > 0 && (
            <div className={styles.tooltipMetricRow}>
              <span className={styles.tooltipMetricLabel}>
                <span className={styles.tooltipMetricIcon}>⏳</span> Pending
              </span>
              <span className={styles.tooltipMetricValue} style={{ color: '#8b5cf6' }}>
                {pending}
              </span>
            </div>
          )}
        </div>

        {/* Completion Rate */}
        <div className={styles.tooltipCompletionSection}>
          <div className={styles.tooltipCompletionHeader}>
            <span className={styles.tooltipCompletionLabel}>
              Completion Rate
            </span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 700, 
              color: completionRate >= 80 ? '#10b981' : completionRate >= 60 ? '#f59e0b' : '#ef4444' 
            }}>
              {completionRate}%
            </span>
          </div>
          <div className={styles.tooltipCompletionBar}>
            <div 
              className={styles.tooltipCompletionFill}
              style={{
                width: `${completionRate}%`,
                background: completionRate >= 80 ? '#10b981' : completionRate >= 60 ? '#f59e0b' : '#ef4444',
              }} 
            />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipDark}>
        <p className={styles.tooltipDarkHeader}>
          {payload[0].name}
        </p>
        <p className={styles.tooltipDarkItem}>
          <span style={{ color: payload[0].payload.color || payload[0].payload.fill }}>●</span> Count: <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

export const CustomCapacityTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipDark}>
        <p className={styles.tooltipDarkHeader}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className={styles.tooltipDarkItem}>
            {entry.dataKey === 'used' ? '🔵' : '🟢'} {entry.dataKey === 'used' ? 'Slots Used' : 'Slots Available'}: <strong>{entry.value} slots</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};
