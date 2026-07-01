import React, { useState } from 'react';
import clsx from 'clsx';
import api from '../../../services/api';
import styles from './RegisterWalkIn.module.css';

function RegisterWalkIn({ onSuccess }) {
  const [step, setStep] = useState('search'); // search, register, vitals
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });

  const [registerErrors, setRegisterErrors] = useState({});

  // Task 3.1: Search for existing patients
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setAlert({ type: 'error', message: 'Please enter a search term' });
      return;
    }

    try {
      setSearching(true);
      setAlert({ type: '', message: '' });
      const response = await api.get(`/api/v1/users?search=${encodeURIComponent(searchTerm)}`);
      setSearchResults(response.data.data || []);
      
      if (!response.data.data || response.data.data.length === 0) {
        setAlert({ type: 'info', message: 'No patients found. Register a new external patient.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to search patients' });
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Task 3.2: Select patient and navigate to vitals
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setAlert({ type: 'success', message: `Selected: ${patient.fullName}` });
    // Trigger navigation to vitals tab via parent
    if (onSuccess) {
      onSuccess({ patientId: patient.userId || patient.id, action: 'recordVitals' });
    }
  };

  // Task 3.3: Open registration modal
  const handleOpenRegisterModal = () => {
    setShowRegisterModal(true);
    setRegisterForm({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
    });
    setRegisterErrors({});
    // Scroll to top when modal opens
    setTimeout(() => {
      const modalOverlay = document.querySelector(`.${styles.modalOverlay}`);
      if (modalOverlay) {
        modalOverlay.scrollTop = 0;
      }
    }, 0);
  };

  // Validate registration form
  const validateRegisterForm = () => {
    const errors = {};
    
    if (!registerForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!registerForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^(\+251|0)[0-9]{9}$/.test(registerForm.phone.replace(/\s/g, ''))) {
      errors.phone = 'Invalid Ethiopian phone number';
    }
    
    if (registerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!registerForm.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!registerForm.gender) {
      errors.gender = 'Gender is required';
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Task 3.4 & 3.5: Register external patient
  const handleRegisterPatient = async (e) => {
    e.preventDefault();

    if (!validateRegisterForm()) {
      setAlert({ type: 'error', message: 'Please fix the errors below' });
      return;
    }

    try {
      setRegistering(true);
      setAlert({ type: '', message: '' });

      const response = await api.post('/api/v1/patients/external', {
        fullName: registerForm.fullName,
        email: registerForm.email || null,
        phone: registerForm.phone,
        dateOfBirth: registerForm.dateOfBirth,
        gender: registerForm.gender,
      });

      const newPatient = response.data.data;
      setAlert({ type: 'success', message: `Patient registered: ${newPatient.fullName}` });
      setShowRegisterModal(false);
      setSelectedPatient(newPatient);

      // Navigate to vitals entry
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({ patientId: newPatient.userId || newPatient.id, action: 'recordVitals' });
        }
      }, 1500);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to register patient' });
    } finally {
      setRegistering(false);
    }
  };

  const handleRegisterFormChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
    if (registerErrors[name]) {
      setRegisterErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="card">
      {/* Alert */}
      {alert.message && (
        <div className={clsx(
          styles.alert,
          alert.type === 'error' && styles.alertError,
          alert.type === 'success' && styles.alertSuccess,
          alert.type === 'info' && styles.alertInfo
        )}>
          {alert.message}
        </div>
      )}

      {/* Search Section */}
      <div>
        <h3 className={styles.searchHeader}>
          Search Patient
        </h3>

        <form onSubmit={handleSearch} className={styles.searchForm} style={{ maxWidth: '500px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, or ID..."
            className={clsx('form-input', styles.searchInput)}
          />
          <button
            type="submit"
            className={clsx('btn btn-primary', styles.searchButton)}
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
          <button
            type="button"
            onClick={handleOpenRegisterModal}
            className={clsx('btn btn-primary', styles.registerButton)}
          >
            + Register New Patient
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className={styles.searchResults}>
            <h4 className={styles.resultsHeader}>
              Found {searchResults.length} patient(s)
            </h4>
            <div className={styles.resultsList}>
              {searchResults.map(patient => (
                <div key={patient.id} className={styles.resultItem}>
                  <div className={styles.patientInfo}>
                    <p className={styles.patientName}>
                      {patient.fullName}
                    </p>
                    <p className={styles.patientContact}>
                      {patient.email || 'N/A'} | {patient.phone}
                    </p>
                    <p className={styles.patientId}>
                      ID: {patient.userId || patient.id}
                    </p>
                    <span className={clsx(
                      styles.patientBadge,
                      patient.role === 'EXTERNAL_PATIENT' ? styles.badgeExternal : styles.badgeStaff
                    )}>
                      {patient.role === 'EXTERNAL_PATIENT' ? 'External' : 'Staff'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectPatient(patient)}
                    className={clsx('btn btn-primary', styles.selectButton)}
                  >
                    Record Vitals
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results - Register New Patient */}
        {searchResults.length === 0 && searchTerm && !searching && (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>
              No patient found with "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                ➕ Register External Patient
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                disabled={registering}
                className={styles.modalClose}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className={styles.modalForm}>
              {/* Full Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={registerForm.fullName}
                  onChange={handleRegisterFormChange}
                  placeholder="Full name"
                  disabled={registering}
                  className={clsx('form-input', styles.formInput, registerErrors.fullName && styles.formInputError)}
                />
                {registerErrors.fullName && (
                  <span className={styles.formError}>
                    {registerErrors.fullName}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterFormChange}
                  placeholder="email@example.com"
                  disabled={registering}
                  className={clsx('form-input', styles.formInput, registerErrors.email && styles.formInputError)}
                />
                {registerErrors.email && (
                  <span className={styles.formError}>
                    {registerErrors.email}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={registerForm.phone}
                  onChange={handleRegisterFormChange}
                  placeholder="+251 9XX XXX XXXX"
                  disabled={registering}
                  className={clsx('form-input', styles.formInput, registerErrors.phone && styles.formInputError)}
                />
                {registerErrors.phone && (
                  <span className={styles.formError}>
                    {registerErrors.phone}
                  </span>
                )}
              </div>

              {/* Date of Birth */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={registerForm.dateOfBirth}
                  onChange={handleRegisterFormChange}
                  disabled={registering}
                  max={new Date().toISOString().split('T')[0]}
                  className={clsx('form-input', styles.formInput, registerErrors.dateOfBirth && styles.formInputError)}
                />
                {registerErrors.dateOfBirth && (
                  <span className={styles.formError}>
                    {registerErrors.dateOfBirth}
                  </span>
                )}
              </div>

              {/* Gender */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Gender *
                </label>
                <select
                  name="gender"
                  value={registerForm.gender}
                  onChange={handleRegisterFormChange}
                  disabled={registering}
                  className={clsx('form-input', styles.formInput, registerErrors.gender && styles.formInputError)}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {registerErrors.gender && (
                  <span className={styles.formError}>
                    {registerErrors.gender}
                  </span>
                )}
              </div>

              {/* Buttons */}
              <div className={styles.modalButtons}>
                <button
                  type="submit"
                  className={clsx('btn btn-primary', styles.modalButtonPrimary)}
                  disabled={registering}
                >
                  {registering ? 'Registering...' : 'Register'}
                </button>
                <button
                  type="button"
                  className={clsx('btn btn-secondary', styles.modalButtonSecondary)}
                  onClick={() => setShowRegisterModal(false)}
                  disabled={registering}
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterWalkIn;
