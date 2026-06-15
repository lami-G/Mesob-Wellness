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
      <div style={{
        background: '#ffffff',
        border: '3px solid #1f2937',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        color: '#111827',
        minWidth: '280px',
        maxWidth: '320px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}>
        {/* Header with day */}
        <div style={{
          fontSize: '16px',
          fontWeight: 800,
          marginBottom: '14px',
          paddingBottom: '12px',
          borderBottom: '3px solid #e5e7eb',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          letterSpacing: '-0.02em',
        }}>
          <span style={{ fontSize: '18px' }}>📅</span>
          <span>{label}</span>
        </div>

        {/* Metrics List */}
        <div style={{ display: 'grid', gap: '10px' }}>
          {/* Total Appointments */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid #f3f4f6',
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>📊</span>
              <span>Total</span>
            </span>
            <span style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#3b82f6',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}>
              {total}
            </span>
          </div>

          {/* Completed */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid #f3f4f6',
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>✅</span>
              <span>Completed</span>
            </span>
            <span style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#10b981',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}>
              {completed}
            </span>
          </div>

          {/* No-Show */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: pending > 0 ? '1px solid #f3f4f6' : 'none',
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>❌</span>
              <span>No-Show</span>
            </span>
            <span style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#f59e0b',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}>
              {noShow}
            </span>
          </div>

          {/* Pending (if any) */}
          {pending > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ fontSize: '16px' }}>⏳</span>
                <span>Pending</span>
              </span>
              <span style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#8b5cf6',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}>
                {pending}
              </span>
            </div>
          )}
        </div>

        {/* Completion Rate */}
        <div style={{
          marginTop: '14px',
          paddingTop: '14px',
          borderTop: '3px solid #e5e7eb',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#374151',
              letterSpacing: '-0.01em',
            }}>
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
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              width: `${completionRate}%`,
              height: '100%',
              background: completionRate >= 80 ? '#10b981' : completionRate >= 60 ? '#f59e0b' : '#ef4444',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)',
            }} />
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
