import React, { useEffect, useState } from "react";
import clsx from "clsx";
import api from "../../../services/api";
import { suggestWellnessPlan } from "../../../utils/wellnessAI";
import styles from "./VitalsEntry.module.css";

// Post-Vitals Actions Component
function PostVitalsActions({ vitals, appointmentId, onSuccess, onStartNewRecord, onNavigateToWellness }) {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const actionsRef = React.useRef(null);

  useEffect(() => {
    // Fetch customer info using userId from vitals
    const fetchCustomer = async () => {
      try {
        const response = await api.get(`/api/v1/users/${vitals.userId}`);
        setCustomerInfo(response.data.data);
      } catch (err) {
        console.error('Failed to fetch customer:', err);
      } finally {
        setLoading(false);
      }
    };

    if (vitals?.userId) {
      fetchCustomer();
    }
  }, [vitals]);

  useEffect(() => {
    // Scroll to actions when they appear
    if (!loading && customerInfo && actionsRef.current) {
      actionsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [loading, customerInfo]);

  if (loading || !customerInfo) {
    return null;
  }

  return (
    <div ref={actionsRef} className={styles.postVitalsActions}>
      <p className={styles.successMessage}>
        Vitals recorded successfully for {customerInfo.fullName}!
        {appointmentId && ' (Appointment)'}
        {!appointmentId && ' (Walk-in)'}
      </p>
      <div className={styles.actionButtons}>
        <button
          onClick={() => {
            if (onNavigateToWellness) {
              onNavigateToWellness({
                customerId: customerInfo.id,
                customerName: customerInfo.fullName,
                appointmentId: appointmentId || null,
                vitals: vitals,
              });
            }
          }}
          className={clsx('btn btn-primary', styles.actionButton)}
        >
          Create Wellness Plan
        </button>
        <button
          onClick={() => {
            const suggested = suggestWellnessPlan(vitals);
            if (onNavigateToWellness) {
              onNavigateToWellness({
                customerId: customerInfo.id,
                customerName: customerInfo.fullName,
                appointmentId: appointmentId || null,
                vitals: vitals,
                suggestedPlan: suggested,
              });
            }
          }}
          className={clsx('btn btn-primary', styles.actionButton, styles.actionButtonAi)}
        >
          🤖 Generate AI-Suggested Plan
        </button>
        <button
          onClick={onStartNewRecord}
          className={clsx('btn btn-secondary', styles.actionButton)}
        >
          ➕ Record New Vitals
        </button>
      </div>
    </div>
  );
}

function VitalsEntry({ customerId, appointmentId, onSuccess, onNavigateToWellness }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customerIdInput, setCustomerIdInput] = useState(customerId || "");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showPostVitalsActions, setShowPostVitalsActions] = useState(false);
  const [lastRecordedVitals, setLastRecordedVitals] = useState(null);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(appointmentId || null);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  const [vitals, setVitals] = useState({
    systolicBP: "",
    diastolicBP: "",
    heartRate: "",
    bmi: "",
    glucose: "",
    glucoseType: "FBS",
    temperature: "",
    oxygenSaturation: "",
    notes: "",
  });

  const [alerts, setAlerts] = useState({});

  useEffect(() => {
    setCustomerIdInput(customerId || "");
    setCurrentAppointmentId(appointmentId || null);
  }, [customerId, appointmentId]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerIdInput(customer.userId || customer.id);
    setShowSearch(false);
    setSearchResults([]);
    setSearchTerm('');
    setError('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to parent form
    
    if (!searchTerm.trim()) {
      setSearchError('Please enter a customer ID, name, or email');
      return;
    }

    try {
      setSearching(true);
      setSearchError('');
      
      // Search by ID first (exact match)
      try {
        const userResponse = await api.get(`/api/v1/users/${searchTerm.trim()}`);
        if (userResponse.data.data) {
          setSearchResults([userResponse.data.data]);
          setSearching(false);
          return;
        }
      } catch (err) {
        // Not found by ID, continue to search by name/email
      }

      // Search by name or email (partial match)
      const response = await api.get('/api/v1/users', {
        params: { search: searchTerm.trim() }
      });
      
      const users = response.data.data || [];
      setSearchResults(users);
      
      if (users.length === 0) {
        setSearchError('No customers found');
      }
    } catch (err) {
      setSearchError('Failed to search customers');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const getRiskLevel = (value, type, glucoseType = null) => {
    let level = "Normal";
    let color = "green";
    let category = "";
    let description = "";

    if (type === "systolicBP") {
      if (value < 90) {
        level = "Low";
        color = "blue";
        category = "Hypotension";
        description = "Low blood pressure";
      } else if (value >= 90 && value < 120) {
        level = "Normal";
        color = "green";
        category = "Optimal";
        description = "Normal blood pressure";
      } else if (value >= 120 && value < 130) {
        level = "Normal";
        color = "green";
        category = "Elevated";
        description = "Slightly elevated";
      } else if (value >= 130 && value < 140) {
        level = "High";
        color = "orange";
        category = "Stage 1 Hypertension";
        description = "High blood pressure";
      } else if (value >= 140 && value < 180) {
        level = "High";
        color = "red";
        category = "Stage 2 Hypertension";
        description = "Very high blood pressure";
      } else if (value >= 180) {
        level = "High";
        color = "red";
        category = "Hypertensive Crisis";
        description = "Emergency - seek immediate care";
      }
    } else if (type === "diastolicBP") {
      if (value < 60) {
        level = "Low";
        color = "blue";
        category = "Hypotension";
        description = "Low blood pressure";
      } else if (value >= 60 && value < 80) {
        level = "Normal";
        color = "green";
        category = "Optimal";
        description = "Normal blood pressure";
      } else if (value >= 80 && value < 85) {
        level = "Normal";
        color = "green";
        category = "Elevated";
        description = "Slightly elevated";
      } else if (value >= 85 && value < 90) {
        level = "High";
        color = "orange";
        category = "Stage 1 Hypertension";
        description = "High blood pressure";
      } else if (value >= 90 && value < 120) {
        level = "High";
        color = "red";
        category = "Stage 2 Hypertension";
        description = "Very high blood pressure";
      } else if (value >= 120) {
        level = "High";
        color = "red";
        category = "Hypertensive Crisis";
        description = "Emergency - seek immediate care";
      }
    } else if (type === "heartRate") {
      if (value < 40) {
        level = "Low";
        color = "red";
        category = "Severe Bradycardia";
        description = "Dangerously low heart rate";
      } else if (value >= 40 && value < 60) {
        level = "Low";
        color = "orange";
        category = "Bradycardia";
        description = "Low heart rate";
      } else if (value >= 60 && value <= 100) {
        level = "Normal";
        color = "green";
        category = "Normal Range";
        description = "Normal resting heart rate";
      } else if (value > 100 && value <= 120) {
        level = "High";
        color = "orange";
        category = "Mild Tachycardia";
        description = "Elevated heart rate";
      } else if (value > 120 && value <= 150) {
        level = "High";
        color = "red";
        category = "Moderate Tachycardia";
        description = "High heart rate";
      } else if (value > 150) {
        level = "High";
        color = "red";
        category = "Severe Tachycardia";
        description = "Dangerously high heart rate";
      }
    } else if (type === "bmi") {
      if (value < 16) {
        level = "Low";
        color = "red";
        category = "Severe Underweight";
        description = "Severely underweight";
      } else if (value >= 16 && value < 18.5) {
        level = "Low";
        color = "orange";
        category = "Underweight";
        description = "Below normal weight";
      } else if (value >= 18.5 && value < 25) {
        level = "Normal";
        color = "green";
        category = "Normal Weight";
        description = "Healthy weight range";
      } else if (value >= 25 && value < 30) {
        level = "High";
        color = "orange";
        category = "Overweight";
        description = "Above normal weight";
      } else if (value >= 30 && value < 35) {
        level = "High";
        color = "red";
        category = "Obesity Class I";
        description = "Moderately obese";
      } else if (value >= 35 && value < 40) {
        level = "High";
        color = "red";
        category = "Obesity Class II";
        description = "Severely obese";
      } else if (value >= 40) {
        level = "High";
        color = "red";
        category = "Obesity Class III";
        description = "Morbidly obese";
      }
    } else if (type === "glucose") {
      const gType = glucoseType || "FBS";
      
      if (gType === "FBS") {
        // Fasting Blood Sugar thresholds
        if (value < 70) {
          level = "Low";
          color = "red";
          category = "Hypoglycemia";
          description = "Dangerously low blood sugar";
        } else if (value >= 70 && value < 100) {
          level = "Normal";
          color = "green";
          category = "Normal Fasting";
          description = "Normal blood glucose (FBS)";
        } else if (value >= 100 && value < 126) {
          level = "High";
          color = "orange";
          category = "Prediabetes";
          description = "Elevated blood glucose (FBS)";
        } else if (value >= 126 && value < 200) {
          level = "High";
          color = "red";
          category = "Diabetes";
          description = "Diabetic range (FBS)";
        } else if (value >= 200) {
          level = "High";
          color = "red";
          category = "Severe Hyperglycemia";
          description = "Dangerously high blood sugar";
        }
      } else if (gType === "RBS") {
        // Random Blood Sugar (after meal) thresholds
        if (value < 70) {
          level = "Low";
          color = "red";
          category = "Hypoglycemia";
          description = "Dangerously low blood sugar";
        } else if (value >= 70 && value <= 200) {
          level = "Normal";
          color = "green";
          category = "Normal Range";
          description = "Normal blood glucose (after meal)";
        } else if (value > 200) {
          level = "High";
          color = "red";
          category = "Hyperglycemia";
          description = "High blood sugar (after meal)";
        }
      }
    } else if (type === "temperature") {
      if (value < 35) {
        level = "Low";
        color = "red";
        category = "Severe Hypothermia";
        description = "Dangerously low temperature";
      } else if (value >= 35 && value < 36.1) {
        level = "Low";
        color = "orange";
        category = "Mild Hypothermia";
        description = "Below normal temperature";
      } else if (value >= 36.1 && value <= 37.2) {
        level = "Normal";
        color = "green";
        category = "Normal Range";
        description = "Normal body temperature";
      } else if (value > 37.2 && value <= 38.0) {
        level = "High";
        color = "orange";
        category = "Low-grade Fever";
        description = "Slightly elevated temperature";
      } else if (value > 38.0 && value <= 39.0) {
        level = "High";
        color = "red";
        category = "Moderate Fever";
        description = "Fever present";
      } else if (value > 39.0 && value <= 41.0) {
        level = "High";
        color = "red";
        category = "High Fever";
        description = "High fever - monitor closely";
      } else if (value > 41.0) {
        level = "High";
        color = "red";
        category = "Hyperthermia";
        description = "Dangerously high temperature";
      }
    } else if (type === "oxygenSaturation") {
      if (value < 85) {
        level = "Low";
        color = "red";
        category = "Severe Hypoxemia";
        description = "Critically low oxygen";
      } else if (value >= 85 && value < 90) {
        level = "Low";
        color = "red";
        category = "Moderate Hypoxemia";
        description = "Low oxygen saturation";
      } else if (value >= 90 && value <= 100) {
        level = "Normal";
        color = "green";
        category = "Normal Range";
        description = "Normal oxygen saturation";
      } else if (value > 100) {
        level = "High";
        color = "orange";
        category = "Hyperoxemia";
        description = "Above normal range";
      }
    }

    return { level, color, category, description };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVitals((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error message when field changes
    if (error) {
      setError("");
    }

    // Show risk indicators only (no validation, no blocking)
    if (name !== 'notes' && name !== 'glucoseType' && value && value.trim() !== '') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const glucoseTypeForCalc = name === 'glucose' ? vitals.glucoseType : null;
        const risk = getRiskLevel(numValue, name, glucoseTypeForCalc);
        setAlerts((prev) => ({
          ...prev,
          [name]: risk,
        }));
      }
    } else {
      // Clear alert if field is empty
      setAlerts((prev) => {
        const newAlerts = { ...prev };
        delete newAlerts[name];
        return newAlerts;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetCustomerId = customerIdInput.trim() || customerId;

    if (!targetCustomerId) {
      setError("Customer ID is required");
      return;
    }

    // No validation - nurses know what they're doing
    // Just submit the vitals directly

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/api/v1/vitals", {
        userId: targetCustomerId,
        systolicBP: vitals.systolicBP ? parseInt(vitals.systolicBP) : null,
        diastolicBP: vitals.diastolicBP ? parseInt(vitals.diastolicBP) : null,
        heartRate: vitals.heartRate ? parseInt(vitals.heartRate) : null,
        bmi: vitals.bmi ? parseFloat(vitals.bmi) : null,
        glucose: vitals.glucose ? parseInt(vitals.glucose) : null,
        glucoseType: vitals.glucose ? vitals.glucoseType : null,
        temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
        oxygenSaturation: vitals.oxygenSaturation
          ? parseInt(vitals.oxygenSaturation)
          : null,
        notes: vitals.notes,
      });

      setSuccess("Vitals recorded successfully!");
      
      // Store vitals and customer BEFORE resetting form
      const recordedVitals = response.data.data;
      
      setLastRecordedVitals(recordedVitals);
      setShowPostVitalsActions(true);
      
      // Now reset form
      setVitals({
        systolicBP: "",
        diastolicBP: "",
        heartRate: "",
        bmi: "",
        glucose: "",
        glucoseType: "FBS",
        temperature: "",
        oxygenSaturation: "",
        notes: "",
      });
      setAlerts({});

      // Keep success message and actions visible until user takes action
      // No auto-hide timeout
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record vitals");
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewRecord = () => {
    setSuccess("");
    setShowPostVitalsActions(false);
    setLastRecordedVitals(null);
    setSelectedCustomer(null);
    setCustomerIdInput('');
  };

  return (
    <div className={clsx('card', styles.vitalsEntry)}>
      <h3>Record Vitals</h3>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className={styles.vitalsForm}>
        <div className="form-group">
          <label className="form-label">Customer</label>
          {selectedCustomer ? (
            <div className={styles.selectedCustomer}>
              <div className={styles.customerInfo}>
                <p><strong>{selectedCustomer.fullName}</strong></p>
                <p>ID: {selectedCustomer.userId || selectedCustomer.id}</p>
                <p>Email: {selectedCustomer.email}</p>
              </div>
              <button
                type="button"
                className="btn btn-small btn-secondary"
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerIdInput('');
                  setShowSearch(true);
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className={styles.customerInputGroup}>
                <input
                  type="text"
                  name="customerId"
                  value={customerIdInput}
                  onChange={(e) => {
                    setCustomerIdInput(e.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Enter customer ID or search below"
                  disabled={loading}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className={styles.searchButton}
                  onClick={() => setShowSearch(!showSearch)}
                  disabled={loading}
                >
                  {showSearch ? 'Close' : 'Search'}
                </button>
              </div>
              
              {showSearch && (
                <div className={styles.inlineSearch}>
                  <div className={styles.searchFormWrapper}>
                    <div className={styles.searchInputGroup}>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setSearchError('');
                        }}
                        placeholder="Search by name or email..."
                        className="form-input"
                        disabled={searching}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch(e);
                          }
                        }}
                      />
                      <button 
                        type="button"
                        className="btn btn-primary btn-small"
                        disabled={searching}
                        onClick={handleSearch}
                      >
                        {searching ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  </div>

                  {searchError && <div className="alert alert-error">{searchError}</div>}

                  {searchResults.length > 0 && (
                    <div className={styles.searchResultsInline}>
                      <p className={styles.resultsCount}>Found {searchResults.length} customer(s)</p>
                      <div className={styles.resultsListInline}>
                        {searchResults.map((customer) => (
                          <div key={customer.id} className={styles.resultItemInline}>
                            <div className={styles.customerInfoInline}>
                              <p className={styles.customerNameInline}>{customer.fullName}</p>
                              <p className={styles.customerDetailsInline}>
                                ID: {customer.userId || customer.id}
                              </p>
                              <p className={styles.customerDetailsInline}>
                                Email: {customer.email}
                              </p>
                              {customer.phone && (
                                <p className={styles.customerDetailsInline}>Phone: {customer.phone}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              className="btn btn-small btn-primary"
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              Select
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.vitalsGrid}>
          <div className="form-group">
            <label className="form-label">Systolic BP</label>
            <div className={styles.inputWithAlert}>
              <input
                type="number"
                name="systolicBP"
                value={vitals.systolicBP}
                onChange={handleChange}
                placeholder="mmHg"
                disabled={loading}
                className="form-input"
              />
              {alerts.systolicBP && (
                <div className={clsx(styles.riskAlert, styles[`risk${alerts.systolicBP.color.charAt(0).toUpperCase() + alerts.systolicBP.color.slice(1)}`])} title={alerts.systolicBP.description}>
                  <span className={styles.riskLevel}>{alerts.systolicBP.level}</span>
                  <span className={styles.riskCategory}>{alerts.systolicBP.category}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Diastolic BP</label>
            <div className={styles.inputWithAlert}>
              <input
                type="number"
                name="diastolicBP"
                value={vitals.diastolicBP}
                onChange={handleChange}
                placeholder="mmHg"
                disabled={loading}
                className="form-input"
              />
              {alerts.diastolicBP && (
                <div className={clsx(styles.riskAlert, styles[`risk${alerts.diastolicBP.color.charAt(0).toUpperCase() + alerts.diastolicBP.color.slice(1)}`])} title={alerts.diastolicBP.description}>
                  <span className={styles.riskLevel}>{alerts.diastolicBP.level}</span>
                  <span className={styles.riskCategory}>{alerts.diastolicBP.category}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Heart Rate</label>
            <div className={styles.inputWithAlert}>
              <input
                type="number"
                name="heartRate"
                value={vitals.heartRate}
                onChange={handleChange}
                placeholder="bpm"
                disabled={loading}
                className="form-input"
              />
              {alerts.heartRate && (
                <div className={clsx(styles.riskAlert, styles[`risk${alerts.heartRate.color.charAt(0).toUpperCase() + alerts.heartRate.color.slice(1)}`])} title={alerts.heartRate.description}>
                  <span className={styles.riskLevel}>{alerts.heartRate.level}</span>
                  <span className={styles.riskCategory}>{alerts.heartRate.category}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">BMI</label>
            <div className={styles.inputWithAlert}>
              <input
                type="number"
                step="0.1"
                name="bmi"
                value={vitals.bmi}
                onChange={handleChange}
                placeholder="kg/m²"
                disabled={loading}
                className="form-input"
              />
              {alerts.bmi && (
                <div className={clsx(styles.riskAlert, styles[`risk${alerts.bmi.color.charAt(0).toUpperCase() + alerts.bmi.color.slice(1)}`])} title={alerts.bmi.description}>
                  <span className={styles.riskLevel}>{alerts.bmi.level}</span>
                  <span className={styles.riskCategory}>{alerts.bmi.category}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">O₂ Saturation</label>
            <div className={styles.inputWithAlert}>
              <input
                type="number"
                name="oxygenSaturation"
                value={vitals.oxygenSaturation}
                onChange={handleChange}
                placeholder="%"
                disabled={loading}
                className="form-input"
              />
              {alerts.oxygenSaturation && (
                <div className={clsx(styles.riskAlert, styles[`risk${alerts.oxygenSaturation.color.charAt(0).toUpperCase() + alerts.oxygenSaturation.color.slice(1)}`])} title={alerts.oxygenSaturation.description}>
                  <span className={styles.riskLevel}>{alerts.oxygenSaturation.level}</span>
                  <span className={styles.riskCategory}>{alerts.oxygenSaturation.category}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Glucose</label>
            <div className={styles.inputWithAlert}>
              <input
                type="number"
                name="glucose"
                value={vitals.glucose}
                onChange={handleChange}
                placeholder="mg/dL"
                disabled={loading}
                className="form-input"
              />
              {alerts.glucose && (
                <div className={clsx(styles.riskAlert, styles[`risk${alerts.glucose.color.charAt(0).toUpperCase() + alerts.glucose.color.slice(1)}`])} title={alerts.glucose.description}>
                  <span className={styles.riskLevel}>{alerts.glucose.level}</span>
                  <span className={styles.riskCategory}>{alerts.glucose.category}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <select
                name="glucoseType"
                value={vitals.glucoseType}
                onChange={handleChange}
                disabled={loading}
                className="form-input"
                style={{ width: '150px', boxSizing: 'border-box' }}
              >
                <option value="FBS">FBS (Fasting)</option>
                <option value="RBS">RBS (After Meal)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            name="notes"
            value={vitals.notes}
            onChange={handleChange}
            placeholder="Additional notes (optional)"
            disabled={loading}
            rows="3"
            className="form-input"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={loading}
        >
          {loading ? "Recording..." : "Submit Vitals"}
        </button>
      </form>

      {/* Post-Vitals Action Buttons */}
      {showPostVitalsActions && lastRecordedVitals && (
        <PostVitalsActions
          vitals={lastRecordedVitals}
          appointmentId={currentAppointmentId}
          onSuccess={onSuccess}
          onStartNewRecord={handleStartNewRecord}
          onNavigateToWellness={onNavigateToWellness}
        />
      )}
    </div>
  );
}

export default VitalsEntry;
