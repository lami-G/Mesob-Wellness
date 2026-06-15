import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './LongitudinalRecords.module.css';

function LongitudinalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    if (user?.id) {
      fetchRecords();
    }
  }, [user?.id]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/vitals/history/${user.id}`);
      const data = response.data.data;
      const vitalRecords = Array.isArray(data?.records) ? data.records : [];
      
      // Sort by date descending
      const sorted = vitalRecords.sort((a, b) => 
        new Date(b.recordedAt) - new Date(a.recordedAt)
      );
      
      setRecords(sorted);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current, previous) => {
    if (!current || !previous) return null;
    const change = current - previous;
    const percent = ((change / previous) * 100).toFixed(1);
    return {
      value: change.toFixed(1),
      percent,
      direction: change > 0 ? '↑' : change < 0 ? '↓' : '→',
    };
  };

  const getMetricTrend = (metric) => {
    if (records.length < 2) return null;
    
    const current = records[0][metric];
    const previous = records[1][metric];
    
    if (!current || !previous) return null;
    
    return calculateChange(current, previous);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const metrics = [
    { key: 'bmi', label: 'BMI', unit: '' },
    { key: 'systolicBP', label: 'Systolic BP (mmHg)', unit: 'mmHg' },
    { key: 'diastolicBP', label: 'Diastolic BP (mmHg)', unit: 'mmHg' },
    { key: 'heartRate', label: 'Heart Rate (bpm)', unit: 'bpm' },
    { key: 'glucose', label: 'Glucose (mg/dL)', unit: 'mg/dL' },
    { key: 'temperature', label: 'Temperature (°C)', unit: '°C' },
    { key: 'oxygenSaturation', label: 'O₂ Saturation (%)', unit: '%' },
  ];

  if (loading) return <p className={styles.loadingText}>Loading health records...</p>;

  if (records.length === 0) {
    return (
      <div className={clsx('card', styles.longitudinalRecords)}>
        <h3>Longitudinal Health Records</h3>
        <p className={styles.emptyText}>No health records yet. Visit a nurse to start tracking your health.</p>
      </div>
    );
  }

  return (
    <div className={clsx('card', styles.longitudinalRecords)}>
      <h3>Longitudinal Health Records</h3>
      
      <div className={styles.metricFilter}>
        <label>View Metric:</label>
        <select 
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          <option value="all">All Metrics</option>
          {metrics.map(m => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </div>

      {selectedMetric === 'all' ? (
        <div className={styles.recordsSummary}>
          <h4>Latest Record Summary</h4>
          <div className={styles.summaryGrid}>
            {metrics.map(metric => {
              const value = records[0][metric.key];
              const trend = getMetricTrend(metric.key);
              
              if (!value) return null;
              
              return (
                <div key={metric.key} className={styles.summaryCard}>
                  <span className={styles.metricLabel}>{metric.label}</span>
                  <span className={styles.metricValue}>
                    {typeof value === 'number' ? value.toFixed(1) : value}
                  </span>
                  {trend && (
                    <span className={clsx(styles.metricTrend, {
                      [styles.trendUp]: trend.direction === '↑',
                      [styles.trendDown]: trend.direction === '↓',
                      [styles.trendStable]: trend.direction === '→'
                    })}>
                      {trend.direction} {Math.abs(trend.value)} ({trend.percent}%)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.metricDetail}>
          <h4>{metrics.find(m => m.key === selectedMetric)?.label}</h4>
          <div className={styles.metricTimeline}>
            {records.map((record, idx) => {
              const value = record[selectedMetric];
              if (!value) return null;
              
              const trend = idx > 0 ? calculateChange(value, records[idx - 1][selectedMetric]) : null;
              
              return (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timelineDate}>{formatDate(record.recordedAt)}</div>
                  <div className={styles.timelineValue}>
                    <span className={styles.value}>{typeof value === 'number' ? value.toFixed(1) : value}</span>
                    {trend && (
                      <span className={clsx(styles.trend, {
                        [styles.trendUp]: trend.direction === '↑',
                        [styles.trendDown]: trend.direction === '↓',
                        [styles.trendStable]: trend.direction === '→'
                      })}>
                        {trend.direction} {Math.abs(trend.value)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.recordsTable}>
        <h4>Complete History</h4>
        <div className={styles.tableWrapper}>
          <table className={styles.recordsTableContent}>
            <thead>
              <tr>
                <th>Date</th>
                
                <th>BMI</th>
                <th>BP</th>
                <th>HR</th>
                <th>Glucose</th>
                <th>Temp</th>
                <th>O₂</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, idx) => (
                <tr key={idx}>
                  <td>{formatDate(record.recordedAt)}</td>
                  
                  <td>{record.bmi ? record.bmi.toFixed(1) : '-'}</td>
                  <td>{record.systolicBP && record.diastolicBP ? `${record.systolicBP}/${record.diastolicBP}` : '-'}</td>
                  <td>{record.heartRate || '-'}</td>
                  <td>{record.glucose || '-'}</td>
                  <td>{record.temperature ? record.temperature.toFixed(1) : '-'}</td>
                  <td>{record.oxygenSaturation ? `${record.oxygenSaturation}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LongitudinalRecords;
