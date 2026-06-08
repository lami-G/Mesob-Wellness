import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import styles from "../shared/Modal.module.css";

function RegionEditModal({ isOpen, onClose, region, regionStatus, allCenters, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE",
    managerEmail: "",
    managerPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen && region) {
      // Load existing region admin data
      loadRegionAdmin();
      setFormData({
        name: region,
        status: regionStatus || "ACTIVE",
        managerEmail: "",
        managerPassword: "",
      });
      setError("");
      setShowPassword(false);
    }
  }, [isOpen, region, regionStatus]);

  const loadRegionAdmin = async () => {
    try {
      const regionAdmin = await adminService.getRegionAdmin(region);
      if (regionAdmin && regionAdmin.email) {
        setFormData(prev => ({
          ...prev,
          managerEmail: regionAdmin.email,
        }));
      }
    } catch (err) {
      // Region admin doesn't exist yet, that's okay
      console.log("No existing region admin");
    }
  };

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

    const trimmed = formData.name.trim();

    if (!trimmed) {
      setError("Region name cannot be empty");
      return;
    }

    const regionCenters = allCenters.filter((center) => center.region === region);
    if (regionCenters.length === 0) {
      setError("No centers found for this region");
      return;
    }

    try {
      setLoading(true);
      
      // Update all centers in the region
      await Promise.all(
        regionCenters.map((center) =>
          adminService.updateCenter(center.id, {
            region: trimmed,
            status: formData.status,
          })
        )
      );

      // Update region admin if email provided
      if (formData.managerEmail) {
        const adminData = { email: formData.managerEmail };
        if (formData.managerPassword) {
          adminData.password = formData.managerPassword;
        }
        await adminService.upsertRegionAdmin(trimmed, adminData);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update region";
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
          <h3>Edit Region</h3>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name">Region Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Addis Ababa"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="managerEmail">Region Admin Email</label>
              <input
                id="managerEmail"
                type="email"
                name="managerEmail"
                value={formData.managerEmail}
                onChange={handleChange}
                placeholder="admin@mesob.et"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="managerPassword">Region Admin Password</label>
              <div className={styles.passwordInputContainer}>
                <input
                  id="managerPassword"
                  type={showPassword ? "text" : "password"}
                  name="managerPassword"
                  value={formData.managerPassword}
                  onChange={handleChange}
                  placeholder="Leave empty to keep current password"
                  className={styles.passwordInput}
                />
                {formData.managerPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggleBtn}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                )}
              </div>
              <small>
                Only fill if you want to change the password
              </small>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? "Saving..." : "Save Region"}
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

export default RegionEditModal;
