import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import styles from "../shared/Modal.module.css";

function RegionEditModal({ isOpen, onClose, region, regionStatus, allCenters, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && region) {
      setFormData({
        name: region,
        status: regionStatus || "ACTIVE",
      });
      setError("");
    }
  }, [isOpen, region, regionStatus]);

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
