import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

function RegionEditModal({ isOpen, onClose, region, regionStatus, allCenters, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE",
    managerEmail: "",
    managerPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && region) {
      setFormData({
        name: region,
        status: regionStatus || "ACTIVE",
        managerEmail: "",
        managerPassword: "",
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Region</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-row">
            <div className="form-group">
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

            <div className="form-group">
              <label htmlFor="managerPassword">Region Admin Password</label>
              <input
                id="managerPassword"
                type="password"
                name="managerPassword"
                value={formData.managerPassword}
                onChange={handleChange}
                placeholder="Leave empty to keep current password"
              />
              <small style={{ color: "#6b7280", marginTop: "0.25rem", fontSize: "12px" }}>
                Only fill if you want to change the password
              </small>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Region"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegionEditModal;
