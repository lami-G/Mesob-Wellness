import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import WellnessPlanTemplates from './WellnessPlanTemplates';
import { fetchPatientConditions } from '../../../services/conditionsService';
import styles from './WellnessPlanCreation.module.css';

function WellnessPlanCreation({ customerId, onSuccess, appointmentId, onBackToQueue, onStatusChanged }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [latestVitals, setLatestVitals] = useState(null);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [showVitalsCollapsed, setShowVitalsCollapsed] = useState(false);
  const [suggestedPlan, setSuggestedPlan] = useState(null);
  const [createdPlanId, setCreatedPlanId] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [conditionsAutoFilled, setConditionsAutoFilled] = useState(false);
  const [conditionsLoading, setConditionsLoading] = useState(false);
  const [newCondition, setNewCondition] = useState('');
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const successRef = React.useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    nutritionRecommendations: '',
    exerciseRecommendations: '',
    stressManagementAdvice: '',
    goals: '',
    duration: '30',
  });

  useEffect(() => {
    // Load suggested plan and vitals from sessionStorage if available
    const storedPlan = sessionStorage.getItem('suggestedWellnessPlan');
    const storedVitals = sessionStorage.getItem('latestVitals');
    
    if (storedPlan) {
      const plan = JSON.parse(storedPlan);
      setSuggestedPlan(plan);
      setFormData({
        title: plan.title,
        nutritionRecommendations: plan.nutrition,
        exerciseRecommendations: plan.exercise,
        stressManagementAdvice: plan.stressManagement,
        goals: plan.goals,
        duration: '30',
      });
      sessionStorage.removeItem('suggestedWellnessPlan');
    }
    
    if (storedVitals) {
      setLatestVitals(JSON.parse(storedVitals));
      sessionStorage.removeItem('latestVitals');
    }
  }, []);

  useEffect(() => {
    // Fetch latest vitals and conditions when customer is selected
    if (selectedCustomerId && !latestVitals) {
      fetchLatestVitals();
      fetchConditions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchLatestVitals = async () => {
    try {
      setVitalsLoading(true);
      const response = await api.get(`/api/v1/vitals/latest/${selectedCustomerId}`);
      if (response.data.data) {
        setLatestVitals(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch vitals:', err);
    } finally {
      setVitalsLoading(false);
    }
  };

  const fetchConditions = async () => {
    try {
      setConditionsLoading(true);
      const fetchedConditions = await fetchPatientConditions(selectedCustomerId);
      if (fetchedConditions && fetchedConditions.length > 0) {
        setConditions(fetchedConditions);
        setConditionsAutoFilled(true);
      }
    } catch (err) {
      console.error('Failed to fetch conditions:', err);
    } finally {
      setConditionsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setSearching(true);
      setError('');
      const response = await api.get(`/api/v1/users?search=${encodeURIComponent(searchTerm)}`);
      setSearchResults(response.data.data || []);
      
      if (response.data.data.length === 0) {
        setError('No customers found');
      }
    } catch (err) {
      setError('Failed to search customers');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomerId(customer.userId || customer.id);
    setSelectedCustomerName(customer.fullName);
    setSearchResults([]);
    setSearchTerm('');
    setError('');
    setConditions([]);
    setConditionsAutoFilled(false);
  };

  const handleClearCustomer = () => {
    setSelectedCustomerId('');
    setSelectedCustomerName('');
    setConditions([]);
    setConditionsAutoFilled(false);
  };

  const handleTemplateSelect = (template) => {
    setFormData({
      title: template.title,
      nutritionRecommendations: template.nutritionRecommendations,
      exerciseRecommendations: template.exerciseRecommendations,
      stressManagementAdvice: template.stressManagementAdvice,
      goals: template.goals.join('\n'),
      duration: template.duration.toString(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      setError('Please select a customer first');
      return;
    }

    if (!formData.title.trim()) {
      setError('Plan title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const goalsArray = formData.goals
        .split('\n')
        .map(g => g.trim())
        .filter(g => g.length > 0);

      const response = await api.post('/api/v1/plans', {
        userId: selectedCustomerId,
        title: formData.title,
        nutritionRecommendations: formData.nutritionRecommendations,
        exerciseRecommendations: formData.exerciseRecommendations,
        stressManagementAdvice: formData.stressManagementAdvice,
        goals: goalsArray,
        duration: parseInt(formData.duration),
        conditions: conditions, // Include conditions in submission
        isActive: true,
      });

      setSuccess('Wellness plan created successfully!');
      setCreatedPlanId(response.data.data.id);
      setShowDownloadButton(false);
      
      // Scroll to success message
      setTimeout(() => {
        if (successRef.current) {
          successRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
      
      // For walk-in patients: hide success message after 2 seconds, then show download button
      if (!appointmentId) {
        setTimeout(() => {
          setSuccess('');
          setShowDownloadButton(true);
        }, 2000);
      } else {
        // For appointment patients: hide success message and show download button immediately
        setTimeout(() => {
          setSuccess('');
          setShowDownloadButton(true);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create wellness plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setGeneratingPDF(true);
      const response = await api.post(
        `/api/v1/reports/combined/${selectedCustomerId}?includeVitals=true&includeWellnessPlan=true`,
        {},
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `health-report-${selectedCustomerId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // For walk-in patients: redirect to queue after download
      if (!appointmentId) {
        setTimeout(() => {
          setSuccess('');
          if (onBackToQueue) {
            onBackToQueue();
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setError('Failed to generate PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    try {
      setLoading(true);
      setError('');

      if (appointmentId) {
        // For appointment patients: mark the appointment as COMPLETED
        await api.patch(`/api/v1/appointments/${appointmentId}`, {
          status: 'COMPLETED',
        });
        
        setSuccess('Patient marked as completed!');
      } else {
        // For walk-in patients: DO NOT create an appointment
        // The wellness plan alone is sufficient to count as a walk-in
        // Walk-in logic: If user has wellness plan but NO appointment on same day = walk-in
        setSuccess('Walk-in service completed!');
      }
      
      // Trigger queue refresh immediately
      if (onStatusChanged) {
        onStatusChanged();
      }
      
      setTimeout(() => {
        setSuccess('');
        // Navigate back to queue
        if (onBackToQueue) {
          onBackToQueue();
        } else {
          // Reset form for next patient if no callback
          setSelectedCustomerId('');
          setSelectedCustomerName('');
          setCreatedPlanId(null);
          setShowDownloadButton(false);
          setConditions([]);
          setConditionsAutoFilled(false);
          setFormData({
            title: '',
            nutritionRecommendations: '',
            exerciseRecommendations: '',
            stressManagementAdvice: '',
            goals: '',
            duration: '30',
          });
        }
      }, 1500);
    } catch (err) {
      console.error('Failed to mark patient as completed:', err);
      setError('Failed to mark patient as completed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondition = () => {
    if (newCondition && !conditions.includes(newCondition)) {
      setConditions([...conditions, newCondition]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  return (
    <div className={`card ${styles.wellnessPlanCreation}`}>
      {error && <div className="alert alert-error">{error}</div>}
      
      {/* PDF Download and Mark as Completed Buttons */}
      {createdPlanId && (
        <>
          {/* Success Message - shown first, then removed */}
          {success && <div ref={successRef} className={`alert alert-success ${styles.successMessage}`}>{success}</div>}
          
          {/* Download Button - shown after success message is removed */}
          {showDownloadButton && (
            <div className={styles.actionsContainer}>
              {/* For walk-in patients: show download button for nurse to give to patient */}
              {!appointmentId && (
                <button
                  onClick={handleDownloadPDF}
                  disabled={generatingPDF}
                  className="btn btn-primary btn-small"
                >
                  {generatingPDF ? 'Generating...' : 'Download Report'}
                </button>
              )}
              {/* For appointment patients: show download button */}
              {appointmentId && (
                <>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={generatingPDF}
                    className="btn btn-primary btn-small"
                  >
                    {generatingPDF ? 'Generating...' : 'Download Report'}
                  </button>
                  {/* Only show "Mark as Completed" button for staff with appointments */}
                  {onBackToQueue && (
                    <button
                      onClick={handleMarkAsCompleted}
                      disabled={loading}
                      className="btn btn-secondary btn-small"
                    >
                      {loading ? 'Processing...' : 'Completed'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Latest Vitals Display */}
      {latestVitals && (
        <div className={styles.vitalsDisplay}>
          <div className={styles.vitalsHeader}>
            <h4 className={styles.vitalsTitle}>Latest Vitals</h4>
            <button
              type="button"
              onClick={() => setShowVitalsCollapsed(!showVitalsCollapsed)}
              className={styles.collapseButton}
            >
              {showVitalsCollapsed ? '▶' : '▼'}
            </button>
          </div>
          
          {!showVitalsCollapsed && (
            <div className={styles.vitalsGrid}>
              {latestVitals.systolicBP && (
                <div className={styles.vitalCard}>
                  <p className={styles.vitalLabel}>BP</p>
                  <p className={styles.vitalValue}>
                    {latestVitals.systolicBP}/{latestVitals.diastolicBP}
                  </p>
                </div>
              )}
              {latestVitals.heartRate && (
                <div className={styles.vitalCard}>
                  <p className={styles.vitalLabel}>Heart Rate</p>
                  <p className={styles.vitalValue}>{latestVitals.heartRate} bpm</p>
                </div>
              )}
              {latestVitals.bmi && (
                <div className={styles.vitalCard}>
                  <p className={styles.vitalLabel}>BMI</p>
                  <p className={styles.vitalValue}>{latestVitals.bmi.toFixed(1)}</p>
                </div>
              )}
              {latestVitals.glucose && (
                <div className={styles.vitalCard}>
                  <p className={styles.vitalLabel}>Glucose</p>
                  <p className={styles.vitalValue}>{latestVitals.glucose} mg/dL</p>
                </div>
              )}
              {latestVitals.temperature && (
                <div className={styles.vitalCard}>
                  <p className={styles.vitalLabel}>Temp</p>
                  <p className={styles.vitalValue}>{latestVitals.temperature}°C</p>
                </div>
              )}
              {latestVitals.oxygenSaturation && (
                <div className={styles.vitalCard}>
                  <p className={styles.vitalLabel}>O₂</p>
                  <p className={styles.vitalValue}>{latestVitals.oxygenSaturation}%</p>
                </div>
              )}
            </div>
          )}
          
          <p className={styles.vitalsTimestamp}>
            Recorded: {new Date(latestVitals.recordedAt).toLocaleString()}
          </p>
          
          {suggestedPlan && (
            <p className={styles.aiSuggestionNote}>
              AI-suggested plan based on vitals. Please review and edit as needed.
            </p>
          )}
        </div>
      )}

      {vitalsLoading && (
        <div className={styles.vitalsLoading}>
          Loading vitals...
        </div>
      )}

      {/* Health Conditions Section */}
      {selectedCustomerId && (
        <div className={styles.conditionsSection}>
          <h4 className={styles.conditionsTitle}>Health Conditions</h4>
          
          {conditionsAutoFilled && (
            <p className={styles.autoFilledNote}>
              Auto-filled from latest vitals. You can edit these conditions.
            </p>
          )}
          
          {conditionsLoading ? (
            <p className={styles.conditionsLoading}>Loading conditions...</p>
          ) : (
            <>
              <div className={styles.conditionsList}>
                {conditions.length === 0 ? (
                  <p className={styles.noConditions}>
                    No conditions detected. Add conditions below.
                  </p>
                ) : (
                  conditions.map((condition, index) => (
                    <div key={index} className={styles.conditionTag}>
                      <span>{condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <button
                        type="button"
                        onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
                        className={styles.conditionRemoveButton}
                        title="Remove condition"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              <div className={styles.addConditionGroup}>
                <input
                  type="text"
                  placeholder="Select or type custom condition..."
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  list="condition-options"
                  className={styles.conditionInput}
                />
                <datalist id="condition-options">
                  <option value="Hypertension" />
                  <option value="Obesity" />
                  <option value="Overweight" />
                  <option value="Diabetes" />
                  <option value="Heart Issues" />
                  <option value="Respiratory Issues" />
                  <option value="Normal" />
                </datalist>
                <button
                  type="button"
                  onClick={() => {
                    if (newCondition && !conditions.includes(newCondition)) {
                      setConditions([...conditions, newCondition]);
                      setNewCondition('');
                    }
                  }}
                  disabled={!newCondition || conditions.includes(newCondition)}
                  className={styles.addConditionButton}
                >
                  + Add
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Customer Search Section */}
      {!selectedCustomerId ? (
        <div className={styles.inlineSearch}>
          <h4>Search Customer</h4>
          <p className={styles.searchDescription}>
            Search by name, email, or customer ID
          </p>
          
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputGroup}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter name, email, or ID..."
                className="form-input"
                disabled={searching}
              />
              <button
                type="button"
                onClick={handleSearch}
                className="btn btn-primary"
                disabled={searching || !searchTerm.trim()}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className={styles.searchResultsInline}>
              <p className={styles.resultsCount}>{searchResults.length} customer(s) found</p>
              <div className={styles.resultsListInline}>
                {searchResults.map((customer) => (
                  <div key={customer.id} className={styles.resultItemInline}>
                    <div className={styles.customerInfoInline}>
                      <p className={styles.customerNameInline}>{customer.fullName}</p>
                      <p className={styles.customerDetailsInline}>Email: {customer.email}</p>
                      <p className={styles.customerDetailsInline}>ID: {customer.userId || customer.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectCustomer(customer)}
                      className="btn btn-small btn-primary"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.customerIdDisplay}>
          <div className={styles.customerDisplayFlex}>
            <div>
              <strong>Selected Customer:</strong> {selectedCustomerName}
              <br />
              <small>ID: {selectedCustomerId}</small>
            </div>
            <button
              type="button"
              onClick={handleClearCustomer}
              className="btn btn-small btn-secondary"
            >
              Change Customer
            </button>
          </div>
        </div>
      )}

      <div className={styles.templateButtonContainer}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowTemplates(true)}
          disabled={!selectedCustomerId}
        >
          Use Template
        </button>
      </div>

      {showTemplates && (
        <WellnessPlanTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}

      <form onSubmit={handleSubmit} className={styles.wellnessForm}>
        <div className="form-group">
          <label className="form-label">Plan Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Weight Management Plan"
            disabled={loading}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Nutrition Recommendations</label>
          <textarea
            name="nutritionRecommendations"
            value={formData.nutritionRecommendations}
            onChange={handleChange}
            placeholder="Provide nutrition advice and dietary recommendations..."
            disabled={loading}
            rows="4"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Exercise Recommendations</label>
          <textarea
            name="exerciseRecommendations"
            value={formData.exerciseRecommendations}
            onChange={handleChange}
            placeholder="Suggest exercise routines and physical activities..."
            disabled={loading}
            rows="4"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Stress Management Advice</label>
          <textarea
            name="stressManagementAdvice"
            value={formData.stressManagementAdvice}
            onChange={handleChange}
            placeholder="Provide stress management techniques and mental health advice..."
            disabled={loading}
            rows="4"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Goals (one per line)</label>
          <textarea
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            placeholder="Enter goals, one per line&#10;e.g.&#10;Lose 5kg in 3 months&#10;Exercise 3 times per week&#10;Reduce stress levels"
            disabled={loading}
            rows="4"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Duration (days)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="7"
            max="365"
            disabled={loading}
            className="form-input"
          />
        </div>

        <button
          type="submit"
          className={styles.createButton}
          disabled={loading || !selectedCustomerId}
        >
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              Creating...
            </>
          ) : (
            'Create Plan'
          )}
        </button>
      </form>
    </div>
  );
}

export default WellnessPlanCreation;
