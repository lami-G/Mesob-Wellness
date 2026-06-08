import React, { useState, useEffect } from "react";
import styles from "../shared/Modal.module.css";

function RegionManagerModal({ isOpen, onClose, region, onSave }) {
  const [formData, setFormData] = useState({
    managerEmail: "",
    managerPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen && region) {
      setFormData({
        managerEmail: region.managerEmail || "",
        managerPassword: "",
      });
      setError("");
      setSuccess("");
    }
  }, [isOpen, region]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.managerEmail) {
      setError("Manager email is required");
      return;
    }

    try {
      setLoading(true);
      await onSave({
        region,
        managerEmail: formData.managerEmail,
        managerPassword: formData.managerPassword,
      });
      setSuccess("Region manager updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update region manager";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !region) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Edit Region Admin - {region}</h3>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="managerEmail">Region Admin Email *</label>
            <input
              id="managerEmail"
              type="email"
              name="managerEmail"
              value={formData.managerEmail}
              onChange={handleChange}
              placeholder="admin@mesob.et"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="managerPassword">Region Admin Password</label>
            <input
              id="managerPassword"
              type="password"
              name="managerPassword"
              value={formData.managerPassword}
              onChange={handleChange}
              placeholder="Leave empty to keep current password"
            />
            <small>
              Only fill if you want to change the password
            </small>
          </div>

          <div className={styles.modalActions}>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? "Saving..." : "Save Admin"}
            </button>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegionManagerModal;
