import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import styles from './Referrals.module.css';

function Referrals() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterUrgency, setFilterUrgency] = useState('');
  const [printingReferral, setPrintingReferral] = useState(null);
  const [editingReferral, setEditingReferral] = useState(null);
  const [showReferralsList, setShowReferralsList] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientAge: '',
    patientSex: '',
    destinationFacility: '',
    destinationFacilityType: 'HOSPITAL',
    destinationAddress: '',
    destinationPhone: '',
    reason: '',
    urgency: 'ROUTINE',
    specialistType: '',
    diagnosis: '',
    clinicalSummary: '',
    medications: '',
    vitalSigns: '',
    labResults: '',
    imagingResults: '',
    appointmentDate: '',
    expectedReturnDate: '',
    followUpRequired: false,
    followUpNotes: '',
    notes: '',
  });

  useEffect(() => {
    fetchReferrals();
  }, [filterUrgency]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError('');

      let url = '/api/v1/referrals';
      const params = new URLSearchParams();

      if (filterUrgency) params.append('urgency', filterUrgency);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      setReferrals(response.data.data || []);
    } catch (err) {
      setError('Failed to load referrals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

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
        setError('No patients found');
      }
    } catch (err) {
      setError('Failed to search patients');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);

    // Calculate age if dateOfBirth exists
    let calculatedAge = '';
    if (patient.dateOfBirth) {
      const birthDate = new Date(patient.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      calculatedAge = age.toString();
    }

    // Auto-fill patient fields (editable)
    setFormData(prev => ({
      ...prev,
      patientId: patient.userId || patient.id,
      patientName: patient.fullName || '',
      patientAge: calculatedAge,
      patientSex: patient.gender || '',
    }));

    setSearchResults([]);
    setSearchTerm('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientId) {
      setError('Please select a patient');
      return;
    }

    if (!formData.patientName.trim()) {
      setError('Patient name is required');
      return;
    }

    if (!formData.patientAge) {
      setError('Patient age is required');
      return;
    }

    if (!formData.patientSex) {
      setError('Patient sex is required');
      return;
    }

    if (!formData.clinicalSummary.trim()) {
      setError('History and Physical Examination is required');
      return;
    }

    if (!formData.diagnosis.trim()) {
      setError('Assessment (Diagnosis) is required');
      return;
    }

    if (!formData.medications.trim()) {
      setError('Medications Given is required');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Reason for Referral is required');
      return;
    }

    if (!formData.destinationFacility.trim()) {
      setError('Destination Facility is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (editingReferral) {
        // Update existing referral
        await api.put(`/api/v1/referrals/${editingReferral.id}`, formData);
        setSuccess('Referral updated successfully!');
      } else {
        // Create new referral
        await api.post('/api/v1/referrals', formData);
        setSuccess('Referral created successfully!');
      }

      // Reset form and refresh list
      resetForm();
      fetchReferrals();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save referral');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (referral) => {
    setEditingReferral(referral);
    setSelectedPatient(referral.patient);

    // Calculate age from dateOfBirth if exists
    let calculatedAge = '';
    if (referral.patient.dateOfBirth) {
      const birthDate = new Date(referral.patient.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      calculatedAge = age.toString();
    }

    setFormData({
      patientId: referral.patientId,
      patientName: referral.patient.fullName || '',
      patientAge: calculatedAge,
      patientSex: referral.patient.gender || '',
      destinationFacility: referral.destinationFacility,
      destinationFacilityType: referral.destinationFacilityType || 'HOSPITAL',
      destinationAddress: referral.destinationAddress || '',
      destinationPhone: referral.destinationPhone || '',
      reason: referral.reason,
      urgency: referral.urgency,
      specialistType: referral.specialistType || '',
      diagnosis: referral.diagnosis || '',
      clinicalSummary: referral.clinicalSummary || '',
      medications: referral.medications || '',
      vitalSigns: referral.vitalSigns || '',
      labResults: referral.labResults || '',
      imagingResults: referral.imagingResults || '',
      appointmentDate: referral.appointmentDate ? new Date(referral.appointmentDate).toISOString().slice(0, 16) : '',
      expectedReturnDate: referral.expectedReturnDate ? new Date(referral.expectedReturnDate).toISOString().slice(0, 10) : '',
      followUpRequired: referral.followUpRequired,
      followUpNotes: referral.followUpNotes || '',
      notes: referral.notes || '',
    });
    setShowForm(true);
    setShowReferralsList(false); // Hide list when editing
  };

  const handlePrintReferral = (referral) => {
    setPrintingReferral(referral);

    // Wait for the component to render, then print
    setTimeout(() => {
      window.print();
      setPrintingReferral(null);
    }, 100);
  };

  const handleDelete = async (referralId) => {
    if (!window.confirm('Are you sure you want to delete this referral?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.delete(`/api/v1/referrals/${referralId}`);
      setSuccess('Referral deleted successfully!');
      fetchReferrals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete referral');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      patientName: '',
      patientAge: '',
      patientSex: '',
      destinationFacility: '',
      destinationFacilityType: 'HOSPITAL',
      destinationAddress: '',
      destinationPhone: '',
      reason: '',
      urgency: 'ROUTINE',
      specialistType: '',
      diagnosis: '',
      clinicalSummary: '',
      medications: '',
      vitalSigns: '',
      labResults: '',
      imagingResults: '',
      appointmentDate: '',
      expectedReturnDate: '',
      followUpRequired: false,
      followUpNotes: '',
      notes: '',
    });
    setSelectedPatient(null);
    setEditingReferral(null);
  };

  const getUrgencyBadgeClass = (urgency) => {
    switch (urgency) {
      case 'EMERGENCY':
        return styles.urgencyEmergency;
      case 'URGENT':
        return styles.urgencyUrgent;
      case 'ROUTINE':
      default:
        return styles.urgencyRoutine;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Patient Referrals</h2>
        <button
          className={styles.primaryButton}
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
        >
          {showForm ? 'Cancel' : '+ New Referral'}
        </button>
      </div>

      {error && (
        <div className={styles.alert} style={{ backgroundColor: '#fee', color: '#c00' }}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.alert} style={{ backgroundColor: '#efe', color: '#0a0' }}>
          {success}
        </div>
      )}

      {showForm && (
        <div className={styles.formCard}>
          <h3>{editingReferral ? 'Edit Referral' : 'Create New Referral'}</h3>

          {/* Patient Search */}
          {!selectedPatient && (
            <div className={styles.searchSection}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Search patient by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton} disabled={searching}>
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className={styles.searchResults}>
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      className={styles.searchResultItem}
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <strong>{patient.fullName}</strong>
                      <span className={styles.patientId}>ID: {patient.userId}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form starts after patient is selected */}
          {selectedPatient && (
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Patient Information Section - Editable */}
              <div className={styles.patientInfoSection}>
                <h4>Patient Information</h4>
                <p className={styles.infoNote}>Auto-filled from record. You can edit if needed.</p>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Patient Name *</label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleChange}
                      required
                      placeholder="Patient full name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Age (years) *</label>
                    <input
                      type="number"
                      name="patientAge"
                      value={formData.patientAge}
                      onChange={handleChange}
                      required
                      min="0"
                      max="150"
                      placeholder="Age"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Sex *</label>
                    <select
                      name="patientSex"
                      value={formData.patientSex}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                </div>

                <div className={styles.patientIdDisplay}>
                  <span><strong>Patient ID:</strong> {selectedPatient.userId || 'N/A'}</span>
                  {!editingReferral && (
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => {
                        setSelectedPatient(null);
                        setFormData(prev => ({
                          ...prev,
                          patientId: '',
                          patientName: '',
                          patientAge: '',
                          patientSex: '',
                        }));
                      }}
                    >
                      Change Patient
                    </button>
                  )}
                </div>
              </div>
            {/* Section 1: History and Physical Examination */}
            <div className={styles.sectionTitle}>
              <h4>History and Physical Examination (H&PE)</h4>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>History and Physical Examination *</label>
                <textarea
                  name="clinicalSummary"
                  value={formData.clinicalSummary}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Brief clinical history, presenting complaints, and physical examination findings..."
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Vital Signs</label>
                <textarea
                  name="vitalSigns"
                  value={formData.vitalSigns}
                  onChange={handleChange}
                  rows="2"
                  placeholder="BP, HR, Temp, RR, SpO2, etc."
                />
              </div>
            </div>

            {/* Section 2: Assessment (Diagnosis) */}
            <div className={styles.sectionTitle}>
              <h4>Assessment</h4>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Assessment (Diagnosis) *</label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  required
                  rows="2"
                  placeholder="Primary and differential diagnosis..."
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Lab Results</label>
                <textarea
                  name="labResults"
                  value={formData.labResults}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Relevant laboratory test results..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Imaging Results</label>
                <textarea
                  name="imagingResults"
                  value={formData.imagingResults}
                  onChange={handleChange}
                  rows="2"
                  placeholder="X-ray, CT, MRI, ultrasound findings..."
                />
              </div>
            </div>

            {/* Section 3: Medication Given */}
            <div className={styles.sectionTitle}>
              <h4>Medication Given</h4>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Medications Given/Current Medications *</label>
                <textarea
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="List medications given at this facility (name, dose, route, frequency)..."
                />
              </div>
            </div>

            {/* Section 4: Reason for Referral */}
            <div className={styles.sectionTitle}>
              <h4>Reason for Referral</h4>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Reason for Referral *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Why is this patient being referred? What services/expertise are needed?"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Urgency *</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                >
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Specialist Type Requested</label>
                <input
                  type="text"
                  name="specialistType"
                  value={formData.specialistType}
                  onChange={handleChange}
                  placeholder="e.g., Cardiologist, Neurologist, Surgeon"
                />
              </div>
            </div>

            {/* Section 5: Destination Facility Information */}
            <div className={styles.sectionTitle}>
              <h4>Destination Facility Information</h4>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Destination Facility *</label>
                <input
                  type="text"
                  name="destinationFacility"
                  value={formData.destinationFacility}
                  onChange={handleChange}
                  required
                  placeholder="e.g., St. Paul's Hospital, Black Lion Hospital"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Facility Type</label>
                <select
                  name="destinationFacilityType"
                  value={formData.destinationFacilityType}
                  onChange={handleChange}
                >
                  <option value="HOSPITAL">Hospital</option>
                  <option value="CLINIC">Clinic</option>
                  <option value="SPECIALIST">Specialist</option>
                  <option value="LABORATORY">Laboratory</option>
                  <option value="IMAGING_CENTER">Imaging Center</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Destination Address</label>
                <input
                  type="text"
                  name="destinationAddress"
                  value={formData.destinationAddress}
                  onChange={handleChange}
                  placeholder="Full address of referral destination"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Destination Phone</label>
                <input
                  type="tel"
                  name="destinationPhone"
                  value={formData.destinationPhone}
                  onChange={handleChange}
                  placeholder="+251..."
                />
              </div>
            </div>

            {/* Section 6: Appointment & Follow-up */}
            <div className={styles.sectionTitle}>
              <h4>Appointment & Follow-up</h4>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Appointment Date (if scheduled)</label>
                <input
                  type="datetime-local"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Expected Return Date</label>
                <input
                  type="date"
                  name="expectedReturnDate"
                  value={formData.expectedReturnDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="followUpRequired"
                    checked={formData.followUpRequired}
                    onChange={handleChange}
                  />
                  Follow-up Required at This Facility
                </label>
              </div>
            </div>

            {formData.followUpRequired && (
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Follow-up Instructions</label>
                  <textarea
                    name="followUpNotes"
                    value={formData.followUpNotes}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Follow-up instructions for patient or referring facility..."
                  />
                </div>
              </div>
            )}

            {/* Section 7: Additional Notes */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Any other relevant information..."
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading}
              >
                {loading ? 'Saving...' : editingReferral ? 'Update Referral' : 'Create Referral'}
              </button>
            </div>
          </form>
        )}
      </div>
      )}

      {/* Filters - Only show when not in form mode */}
      {!showForm && (
        <div className={styles.filters}>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Urgencies</option>
            <option value="ROUTINE">Routine</option>
            <option value="URGENT">Urgent</option>
            <option value="EMERGENCY">Emergency</option>
          </select>

          {filterUrgency && (
            <button
              className={styles.linkButton}
              onClick={() => setFilterUrgency('')}
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Referrals List - Only show when showReferralsList is true and not in form mode */}
      {!showForm && showReferralsList && (
        <>
          {loading ? (
            <div className={styles.loading}>Loading referrals...</div>
          ) : referrals.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No referrals found</p>
            </div>
          ) : (
            <div className={styles.referralsList}>
              {referrals.map((referral) => (
                <div key={referral.id} className={styles.referralCard}>
                  <div className={styles.referralHeader}>
                    <div>
                      <h3>{referral.patient.fullName}</h3>
                      <p className={styles.patientId}>Patient ID: {referral.patient.userId}</p>
                    </div>
                    <div className={styles.badges}>
                      <span className={`${styles.badge} ${getUrgencyBadgeClass(referral.urgency)}`}>
                        {referral.urgency}
                      </span>
                    </div>
                  </div>

                  <div className={styles.referralBody}>
                    <div className={styles.infoRow}>
                      <strong>Destination:</strong> {referral.destinationFacility}
                      {referral.destinationFacilityType && (
                        <span className={styles.facilityType}>({referral.destinationFacilityType})</span>
                      )}
                    </div>

                    {referral.specialistType && (
                      <div className={styles.infoRow}>
                        <strong>Specialist:</strong> {referral.specialistType}
                      </div>
                    )}

                    <div className={styles.infoRow}>
                      <strong>Reason:</strong> {referral.reason}
                    </div>

                    {referral.diagnosis && (
                      <div className={styles.infoRow}>
                        <strong>Diagnosis:</strong> {referral.diagnosis}
                      </div>
                    )}

                    <div className={styles.infoRow}>
                      <strong>Referral Date:</strong> {new Date(referral.referralDate).toLocaleDateString()}
                    </div>

                    {referral.appointmentDate && (
                      <div className={styles.infoRow}>
                        <strong>Appointment:</strong> {new Date(referral.appointmentDate).toLocaleString()}
                      </div>
                    )}

                    {referral.followUpRequired && (
                      <div className={styles.infoRow}>
                        <strong>⚠️ Follow-up Required</strong>
                        {referral.followUpNotes && <p>{referral.followUpNotes}</p>}
                      </div>
                    )}

                    <div className={styles.infoRow}>
                      <strong>Created by:</strong> {referral.creator.fullName} ({referral.creator.role})
                    </div>
                  </div>

                  <div className={styles.referralActions}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handlePrintReferral(referral)}
                      title="Print referral letter for patient"
                    >
                      🖨️ Print Letter
                    </button>

                    <button
                      className={styles.actionButton}
                      onClick={() => handleEdit(referral)}
                    >
                      Edit
                    </button>

                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(referral.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Show Referrals Button - Only show when not in form mode and list is hidden */}
      {!showForm && !showReferralsList && (
        <div className={styles.showReferralsButtonContainer}>
          <button
            className={styles.showReferralsButton}
            onClick={() => setShowReferralsList(true)}
          >
            📋 View All Referrals ({referrals.length})
          </button>
        </div>
      )}

      {/* Hide Referrals Button - Only show when list is visible */}
      {!showForm && showReferralsList && (
        <div className={styles.hideReferralsButtonContainer}>
          <button
            className={styles.hideReferralsButton}
            onClick={() => setShowReferralsList(false)}
          >
            ▲ Hide Referrals
          </button>
        </div>
      )}

      {/* Printable Referral Letter - Hidden on screen, visible when printing */}
      {printingReferral && (
        <div className={styles.printOnly}>
          <div className={styles.letterhead}>
            <img 
              src="/Mesob-short-png.png" 
              alt="MESOB Logo" 
              className={styles.letterheadLogo}
            />
            <h1>MESOB WELLNESS CENTER</h1>
            <p>One-Stop Service Center - Federal Democratic Republic of Ethiopia</p>
          </div>

          <div className={styles.documentTitle}>
            <h2>MEDICAL REFERRAL LETTER</h2>
            <span className={`${styles.urgencyBadge} ${styles[`urgency${printingReferral.urgency}`]}`}>
              {printingReferral.urgency === 'EMERGENCY' ? '🚨 EMERGENCY' :
               printingReferral.urgency === 'URGENT' ? '⚠️ URGENT' :
               '📋 ROUTINE'}
            </span>
          </div>

          <div className={styles.letterContent}>
            <div className={styles.dateSection}>
              <p><strong>Date:</strong> {new Date(printingReferral.referralDate).toLocaleDateString('en-ET', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>From:</strong> MESOB Wellness Center</p>
            </div>

            <div className={styles.recipientSection}>
              <p className={styles.toLabel}>To:</p>
              <p><strong>{printingReferral.destinationFacility}</strong></p>
              {printingReferral.destinationFacilityType && <p>{printingReferral.destinationFacilityType}</p>}
              {printingReferral.destinationAddress && <p>{printingReferral.destinationAddress}</p>}
              {printingReferral.destinationPhone && <p>📞 {printingReferral.destinationPhone}</p>}
            </div>

            {printingReferral.specialistType && (
              <p><strong>Attention:</strong> {printingReferral.specialistType}</p>
            )}

            <div className={styles.section}>
              <h3>PATIENT INFORMATION</h3>
              <table className={styles.infoTable}>
                <tbody>
                  <tr>
                    <td><strong>Name:</strong></td>
                    <td>{printingReferral.patient.fullName}</td>
                  </tr>
                  <tr>
                    <td><strong>Patient ID:</strong></td>
                    <td>{printingReferral.patient.userId}</td>
                  </tr>
                  {printingReferral.patient.dateOfBirth && (
                    <tr>
                      <td><strong>Date of Birth:</strong></td>
                      <td>{new Date(printingReferral.patient.dateOfBirth).toLocaleDateString()}</td>
                    </tr>
                  )}
                  {printingReferral.patient.gender && (
                    <tr>
                      <td><strong>Gender:</strong></td>
                      <td>{printingReferral.patient.gender}</td>
                    </tr>
                  )}
                  {printingReferral.patient.phone && (
                    <tr>
                      <td><strong>Phone:</strong></td>
                      <td>{printingReferral.patient.phone}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.section}>
              <h3>HISTORY AND PHYSICAL EXAMINATION</h3>
              <p className={styles.content}>{printingReferral.clinicalSummary}</p>
            </div>

            {printingReferral.vitalSigns && (
              <div className={styles.section}>
                <h3>VITAL SIGNS</h3>
                <p className={styles.content}>{printingReferral.vitalSigns}</p>
              </div>
            )}

            <div className={styles.section}>
              <h3>ASSESSMENT (DIAGNOSIS)</h3>
              <p className={styles.content}>{printingReferral.diagnosis}</p>
            </div>

            {printingReferral.labResults && (
              <div className={styles.section}>
                <h3>LABORATORY RESULTS</h3>
                <p className={styles.content}>{printingReferral.labResults}</p>
              </div>
            )}

            {printingReferral.imagingResults && (
              <div className={styles.section}>
                <h3>IMAGING RESULTS</h3>
                <p className={styles.content}>{printingReferral.imagingResults}</p>
              </div>
            )}

            <div className={styles.section}>
              <h3>MEDICATION GIVEN</h3>
              <p className={styles.content}>{printingReferral.medications}</p>
            </div>

            <div className={styles.section}>
              <h3>REASON FOR REFERRAL</h3>
              <p className={styles.content}>{printingReferral.reason}</p>
            </div>

            {printingReferral.appointmentDate && (
              <div className={styles.appointmentNotice}>
                <p><strong>📅 Appointment Scheduled:</strong> {new Date(printingReferral.appointmentDate).toLocaleString()}</p>
              </div>
            )}

            {printingReferral.followUpRequired && printingReferral.followUpNotes && (
              <div className={styles.section}>
                <h3>FOLLOW-UP REQUIRED</h3>
                <p className={styles.content}>{printingReferral.followUpNotes}</p>
              </div>
            )}

            {printingReferral.notes && (
              <div className={styles.section}>
                <h3>ADDITIONAL NOTES</h3>
                <p className={styles.content}>{printingReferral.notes}</p>
              </div>
            )}

            <div className={styles.signature}>
              <p><strong>Referring Healthcare Provider:</strong></p>
              <p>{printingReferral.creator.fullName}</p>
              <p>MESOB Wellness Center</p>
            </div>

            <div className={styles.instructions}>
              <p className={styles.instructionsTitle}>📌 Important Instructions:</p>
              <ul>
                <li>Please bring this referral letter to {printingReferral.destinationFacility}</li>
                <li>Contact the facility to schedule an appointment if one is not already scheduled</li>
                <li>Bring any relevant medical records, test results, or medications with you</li>
                {printingReferral.urgency !== 'ROUTINE' && (
                  <li className={styles.urgentInstruction}>
                    This is an {printingReferral.urgency} referral - please seek care as soon as possible
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className={styles.footer}>
            <p><strong>MESOB Wellness Center</strong> | One-Stop Service Center</p>
            <p>Federal Democratic Republic of Ethiopia</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Referrals;