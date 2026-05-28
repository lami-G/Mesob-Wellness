import React, { useState, useEffect } from "react";

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
      setError(err.message || "Failed to update region manager");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !region) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Region Admin - {region}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
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
            <small style={{ color: "#6b7280", marginTop: "0.25rem" }}>
              Only fill if you want to change the password
            </small>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegionManagerModal;
