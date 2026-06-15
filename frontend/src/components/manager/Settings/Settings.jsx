import React, { useState } from 'react';
import { analyticsService } from '../../../services/analyticsService';
import Input from '../../forms/Input';
import Button from '../../forms/Button';
import styles from './Settings.module.css';

const Settings = ({ systemSettings, setSystemSettings }) => {
  const [local, setLocal]   = useState(systemSettings);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await analyticsService.updateSystemSettings(local);
      setSystemSettings(res.data);
      setMsg({ type: 'success', text: '✅ Settings saved successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: '❌ Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-content">
      {msg && (
        <div
          className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}
          style={{ marginBottom: '1rem' }}
        >
          {msg.text}
        </div>
      )}

      <div className="settings-form">
        <div className="form-group">
          <label>Daily Slot Limit</label>
          <Input
            type="number"
            value={local.dailySlotLimit}
            onChange={(e) => setLocal({ ...local, dailySlotLimit: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label>Appointment Interval (minutes)</label>
          <select
            value={local.appointmentIntervalMinutes}
            onChange={(e) => setLocal({ ...local, appointmentIntervalMinutes: parseInt(e.target.value) })}
            className={styles.intervalSelect}
          >
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes (Recommended)</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
          <small className={styles.helpText}>
            Time between appointments (Current: {local.appointmentIntervalMinutes} minutes)<br />
            <strong>💡 Tip:</strong> 15 minutes is recommended for optimal patient flow and service quality
          </small>
        </div>

        <div className="form-group">
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={local.walkInEnabled}
              onChange={(e) => setLocal({ ...local, walkInEnabled: e.target.checked })}
            />
            Enable Walk-in Registration
          </label>
        </div>

        <div className="form-group">
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={local.autoConfirmBookings}
              onChange={(e) => setLocal({ ...local, autoConfirmBookings: e.target.checked })}
            />
            Auto-Confirm Online Bookings
          </label>
        </div>

        <div className={styles.buttonGroup}>
          <Button 
            onClick={() => {
              setLocal({
                dailySlotLimit: 36,
                appointmentIntervalMinutes: 15,
                walkInEnabled: true,
                autoConfirmBookings: false,
              });
              setMsg({ type: 'info', text: '🔄 Settings reset to defaults (15-minute intervals)' });
            }}
            disabled={saving}
            className={styles.resetButton}
          >
            🔄 Reset to Defaults
          </Button>
          
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
