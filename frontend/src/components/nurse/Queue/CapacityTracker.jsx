import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './CapacityTracker.module.css';

function CapacityTracker() {
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const DAILY_SLOTS = 36; // 9 hours * 4 slots per hour (matching BookingCalendar)

  useEffect(() => {
    fetchCapacity();
    const interval = setInterval(fetchCapacity, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCapacity = async () => {
    try {
      setLoading(true);
      
      // Get today's date
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Fetch available slots for today
      const response = await api.get(`/api/v1/appointments/available-slots?date=${dateString}`);
      const availableSlots = response.data.data.availableSlots || [];
      const booked = DAILY_SLOTS - availableSlots.length;
      
      setCapacity({
        booked: booked,
        available: availableSlots.length,
        total: DAILY_SLOTS,
        utilizationPct: Math.round((booked / DAILY_SLOTS) * 100),
      });
      setError('');
    } catch (err) {
      console.error('Failed to fetch capacity:', err);
      // Fallback to appointments count
      fetchAppointmentsCount();
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentsCount = async () => {
    try {
      const response = await api.get('/api/v1/appointments');
      const data = response.data.data;
      
      let appointmentsList = [];
      if (Array.isArray(data)) {
        appointmentsList = data;
      } else if (data && data.appointments && Array.isArray(data.appointments)) {
        appointmentsList = data.appointments;
      }

      // Count today's appointments
      const today = new Date().toDateString();
      const todayCount = appointmentsList.filter(apt => 
        new Date(apt.scheduledAt).toDateString() === today
      ).length;

      setCapacity({
        booked: todayCount,
        available: DAILY_SLOTS - todayCount,
        total: DAILY_SLOTS,
        utilizationPct: Math.round((todayCount / DAILY_SLOTS) * 100),
      });
    } catch (err) {
      setError('Failed to load capacity');
      console.error(err);
    }
  };

  if (!capacity) {
    return (
      <div className={`card ${styles.capacityTracker}`}>
        <h3>📊 Daily Capacity</h3>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  const percentageUsed = (capacity.booked / capacity.total) * 100;
  const getCapacityStatus = () => {
    if (percentageUsed >= 100) return 'full';
    if (percentageUsed >= 80) return 'high';
    if (percentageUsed >= 50) return 'medium';
    return 'low';
  };

  const getStatusColor = () => {
    const status = getCapacityStatus();
    const colors = {
      full: '#ef4444',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#10b981',
    };
    return colors[status];
  };

  const getStatusClass = () => {
    const status = getCapacityStatus();
    const classes = {
      full: styles.statusFull,
      high: styles.statusHigh,
      medium: styles.statusMedium,
      low: styles.statusLow,
    };
    return classes[status];
  };

  return (
    <div className={`card ${styles.capacityTracker}`}>
      <h3>📊 Daily Capacity</h3>

      {error && <div className="alert alert-error">{error}</div>}

      <div className={styles.capacityInfo}>
        <div className={styles.capacityStat}>
          <span className={styles.statLabel}>Slots Remaining</span>
          <span className={styles.statValue}>{capacity.available}/{capacity.total}</span>
        </div>
        <div className={styles.capacityStat}>
          <span className={styles.statLabel}>Booked</span>
          <span className={styles.statValue}>{capacity.booked}</span>
        </div>
      </div>

      <div className={styles.capacityBarContainer}>
        <div className={styles.capacityBar}>
          <div 
            className={styles.capacityFill}
            style={{ 
              width: `${percentageUsed}%`,
              backgroundColor: getStatusColor(),
            }}
          ></div>
        </div>
        <p className={styles.capacityPercentage}>{Math.round(percentageUsed)}% Full</p>
      </div>

      <div className={styles.capacityStatus}>
        <span className={`${styles.statusBadge} ${getStatusClass()}`}>
          {getCapacityStatus() === 'full' && '🔴 FULL'}
          {getCapacityStatus() === 'high' && '🟠 HIGH'}
          {getCapacityStatus() === 'medium' && '🔵 MEDIUM'}
          {getCapacityStatus() === 'low' && '🟢 AVAILABLE'}
        </span>
      </div>

      <button 
        className="btn btn-small btn-secondary"
        onClick={fetchCapacity}
        disabled={loading}
      >
        🔄 Refresh
      </button>
    </div>
  );
}

export default CapacityTracker;
