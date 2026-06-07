import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../forms/Button';
import Input from '../../forms/Input';
import api from '../../../services/api';
import styles from './ProfileSection.module.css';

function ProfileSection({ onLogout }) {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [editFormData, setEditFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
  });

  useEffect(() => {
    if (user) {
      setEditFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
      });
      if (user.profilePicture) {
        setProfilePicture(user.profilePicture);
      }
    }
  }, [user]);

  const handlePictureClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width, height = img.height;
          const maxWidth = 300, maxHeight = 300;
          if (width > height && width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          setProfilePicture(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target?.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Validate password requirements
    if (!/[A-Z]/.test(passwordFormData.newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(passwordFormData.newPassword)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return;
    }
    if (!/\d/.test(passwordFormData.newPassword)) {
      setPasswordError('Password must contain at least one number');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordFormData.newPassword)) {
      setPasswordError('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
      return;
    }

    try {
      setPasswordLoading(true);
      await api.post('/api/v1/users/change-password', {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowChangePassword(false);
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const updatePayload = {
        fullName: editFormData.fullName,
        phone: editFormData.phone,
        dateOfBirth: editFormData.dateOfBirth,
        gender: editFormData.gender,
        emergencyContactName: editFormData.emergencyContactName,
        emergencyContactPhone: editFormData.emergencyContactPhone,
      };
      if (profilePicture) updatePayload.profilePicture = profilePicture;

      console.log('Sending update payload:', {
        ...updatePayload,
        profilePicture: profilePicture ? `[base64 image, ${profilePicture.length} chars]` : undefined
      });

      await api.put('/api/v1/users/me', updatePayload);

      const updatedUser = { ...user, ...editFormData, profilePicture };
      localStorage.setItem('mesob_user', JSON.stringify(updatedUser));
      if (updateUser) updateUser(updatedUser);

      setEditSuccess('Profile updated successfully!');
      setShowEditProfile(false);
      setTimeout(() => setEditSuccess(''), 3000);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    const roleMap = {
      STAFF: styles.badgeBlue,
      NURSE_OFFICER: styles.badgeGreen,
      MANAGER: styles.badgePurple,
      REGIONAL_OFFICE: styles.badgeOrange,
      SYSTEM_ADMIN: styles.badgeRed,
    };
    return roleMap[role] || styles.badgeGray;
  };

  const formatRole = (role) => {
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className={styles.profileSection}>
      {editSuccess && (
        <div className={clsx(styles.alert, styles.alertSuccess)} role="alert">
          {editSuccess}
        </div>
      )}

      <div className={clsx('card', styles.userProfileCard)}>
        <div className={styles.userProfileHeader}>
          <div className={styles.userAvatar}>
            {profilePicture ? (
              <img src={profilePicture} alt={user?.fullName} />
            ) : (
              getInitials(user?.fullName || 'U')
            )}
          </div>
          <div className={styles.userInfo}>
            <h2>{user?.fullName || 'User'}</h2>
            <p className={styles.userEmail}>{user?.email}</p>
            {user?.phone && <p className={styles.userPhone}>{user.phone}</p>}
            <span className={clsx(styles.badge, getRoleBadgeClass(user?.role))}>
              {formatRole(user?.role || 'USER')}
            </span>
          </div>
          <div className={styles.userActions}>
            <Button variant="primary" onClick={() => setShowEditProfile(true)}>
              Edit Profile
            </Button>
            <Button variant="secondary" onClick={() => setShowChangePassword(true)}>
              Change Password
            </Button>
            <Button variant="danger" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {showEditProfile && (
        <div className={clsx('card', styles.editProfileCard)}>
          <div className={styles.editProfileHeader}>
            <h3>Edit Profile</h3>
            <button 
              className={styles.closeBtn} 
              onClick={() => setShowEditProfile(false)}
              aria-label="Close edit profile"
            >
              ✕
            </button>
          </div>

          <div className={styles.profilePictureEditSection}>
            <div className={styles.profilePictureContainer}>
              <div className={styles.profileAvatarEdit}>
                {profilePicture ? (
                  <img src={profilePicture} alt={editFormData.fullName} />
                ) : (
                  <div className={styles.avatarInitials}>{getInitials(editFormData.fullName || 'U')}</div>
                )}
              </div>
              <button 
                className={styles.btnCameraOverlay} 
                onClick={handlePictureClick} 
                type="button"
                title="Change profile picture"
              >
                📷
              </button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
            </div>
          </div>

          {editError && (
            <div className={clsx(styles.alert, styles.alertError)} role="alert">
              {editError}
            </div>
          )}

          <form onSubmit={handleEditSubmit} className={styles.editProfileForm}>
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={editFormData.fullName}
              onChange={handleEditChange}
              disabled={editLoading}
              required
            />

            <Input
              label="Phone"
              type="tel"
              name="phone"
              value={editFormData.phone}
              onChange={handleEditChange}
              disabled={editLoading}
            />

            <Input
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={editFormData.dateOfBirth}
              onChange={handleEditChange}
              disabled={editLoading}
            />

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                name="gender"
                value={editFormData.gender}
                onChange={handleEditChange}
                disabled={editLoading}
                className="form-input"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <Input
              label="Emergency Contact Name"
              type="text"
              name="emergencyContactName"
              value={editFormData.emergencyContactName}
              onChange={handleEditChange}
              disabled={editLoading}
            />

            <Input
              label="Emergency Contact Phone"
              type="tel"
              name="emergencyContactPhone"
              value={editFormData.emergencyContactPhone}
              onChange={handleEditChange}
              disabled={editLoading}
            />

            <div className={styles.editProfileActions}>
              <Button
                type="submit"
                variant="primary"
                loading={editLoading}
                disabled={editLoading}
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEditProfile(false)}
                disabled={editLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {showChangePassword && (
        <div className={styles.modalOverlayPassword} onClick={() => setShowChangePassword(false)}>
          <div className={styles.modalPasswordContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalPasswordHeader}>
              <h3>Change Password</h3>
              <button 
                className={styles.modalPasswordClose} 
                onClick={() => setShowChangePassword(false)}
                aria-label="Close change password"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className={clsx(styles.alert, styles.alertError)} role="alert">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className={clsx(styles.alert, styles.alertSuccess)} role="alert">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className={styles.modalPasswordForm}>
              <div className={styles.formGroupCompact}>
                <label className={styles.formLabelCompact}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordFormData.currentPassword}
                    onChange={handlePasswordChange}
                    disabled={passwordLoading}
                    className={styles.formInputCompact}
                    placeholder="Enter current password"
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={styles.passwordToggleBtn}
                  >
                    {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className={styles.formGroupCompact}>
                <label className={styles.formLabelCompact}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordChange}
                    disabled={passwordLoading}
                    className={styles.formInputCompact}
                    placeholder="Enter new password"
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={styles.passwordToggleBtn}
                  >
                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <small className={styles.passwordHint}>
                  Must contain: uppercase, lowercase, number, and special character (!@#$%^&*)
                </small>
              </div>

              <div className={styles.formGroupCompact}>
                <label className={styles.formLabelCompact}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordFormData.confirmPassword}
                    onChange={handlePasswordChange}
                    disabled={passwordLoading}
                    className={styles.formInputCompact}
                    placeholder="Confirm new password"
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.passwordToggleBtn}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className={styles.modalPasswordActions}>
                <button
                  type="submit"
                  className={styles.btnPasswordPrimary}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  className={styles.btnPasswordSecondary}
                  onClick={() => setShowChangePassword(false)}
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSection;
