import React, { useState } from "react";
import { api } from "../../services/adminService";
import styles from "./shared/PasswordModal.module.css";

function ChangePasswordModal({ isOpen, onClose, userName }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError("Current password is required");
      return false;
    }
    if (!formData.newPassword) {
      setError("New password is required");
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
      console.error("Error changing password:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Change Password</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {success && (
          <div className={styles.successMessage}>
            ✓ Password changed successfully!
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            ✗ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              disabled={loading}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password (min 8 characters)"
              disabled={loading}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              disabled={loading}
              className={styles.formInput}
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnSave}
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
