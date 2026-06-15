import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import modalStyles from "../shared/Modal.module.css";

function CreateUserModal({ isOpen, onClose, onSuccess, allowedRoles }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STAFF",
    region: "",
    centerId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Regions and centers state
  const [regions, setRegions] = useState([]);
  const [centers, setCenters] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [centersLoading, setCentersLoading] = useState(false);

  const roles =
    allowedRoles && allowedRoles.length
      ? allowedRoles
      : [
          "STAFF",
          "NURSE_OFFICER",
          "MANAGER",
          "REGIONAL_OFFICE",
          "FEDERAL_OFFICE",
          "SYSTEM_ADMIN",
        ];

  // Fetch regions when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRegions();
      // Generate initial password when modal opens
      setFormData((prev) => ({ ...prev, password: generateRandomPassword() }));
      if (
        allowedRoles &&
        allowedRoles.length &&
        !allowedRoles.includes(formData.role)
      ) {
        setFormData((prev) => ({ ...prev, role: allowedRoles[0] }));
      }
    }
  }, [isOpen, allowedRoles, formData.role]);

  // Fetch centers when region changes
  useEffect(() => {
    if (formData.region) {
      fetchCenters(formData.region);
    } else {
      setCenters([]);
      setFormData((prev) => ({ ...prev, centerId: "" }));
    }
  }, [formData.region]);

  const fetchRegions = async () => {
    setRegionsLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/v1/regions`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        setRegions(data.data);
      } else {
        console.error("Invalid regions response format:", data);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setRegionsLoading(false);
    }
  };

  const fetchCenters = async (region) => {
    setCentersLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/v1/centers?region=${encodeURIComponent(region)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        setCenters(data.data);
      } else {
        console.error("Invalid centers response format:", data);
        setCenters([]);
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
      setCenters([]);
    } finally {
      setCentersLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleRegeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData((prev) => ({ ...prev, password: newPassword }));
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

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Require center for STAFF, NURSE_OFFICER, and MANAGER roles
    if ((formData.role === "STAFF" || formData.role === "NURSE_OFFICER" || formData.role === "MANAGER") && !formData.centerId) {
      setError(`Please select a center for ${formData.role === "MANAGER" ? "managers" : formData.role === "NURSE_OFFICER" ? "nurse officers" : "staff users"}`);
      return;
    }

    // Require region for REGIONAL_OFFICE role  
    if (formData.role === "REGIONAL_OFFICE" && !formData.region) {
      setError("Please select a region for regional office users");
      return;
    }

    try {
      setLoading(true);
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Only include centerId if it's provided
      if (formData.centerId) {
        userData.centerId = formData.centerId;
      }

      // Include region for REGIONAL_OFFICE
      if (formData.role === "REGIONAL_OFFICE" && formData.region) {
        userData.region = formData.region;
      }

      await adminService.createUser(userData);
      alert("User created successfully! Make sure to share the password securely.");
      onSuccess?.();
      onClose();
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "STAFF",
        region: "",
        centerId: "",
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create user";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose}>
      <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={modalStyles.modalHeader}>
          <h3>Create New User</h3>
          <button className={modalStyles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={modalStyles.modalForm}>
          {error && <div className={modalStyles.errorMessage}>{error}</div>}

          <div className={modalStyles.formGroup}>
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className={modalStyles.formGroup}>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className={modalStyles.formGroup}>
            <label htmlFor="password">Generated Password *</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                id="password"
                type="text"
                name="password"
                value={formData.password}
                readOnly
                style={{ fontFamily: "monospace", backgroundColor: "#f9fafb" }}
                required
              />
              <button
                type="button"
                className={modalStyles.btnSecondary}
                onClick={() => {
                  navigator.clipboard.writeText(formData.password);
                  alert("Password copied to clipboard!");
                }}
                title="Copy password"
                style={{ minWidth: "auto", padding: "0.5rem 0.75rem" }}
              >
                📋
              </button>
              <button
                type="button"
                className={modalStyles.btnSecondary}
                onClick={handleRegeneratePassword}
                title="Generate new password"
                style={{ minWidth: "auto", padding: "0.5rem 0.75rem" }}
              >
                🔄
              </button>
            </div>
            <small style={{ color: "#6b7280", marginTop: "0.25rem", display: "block" }}>
              Copy this password and share it with the user securely
            </small>
          </div>

          <div className={modalStyles.formGroup}>
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={(e) => {
                handleChange(e);
                // Reset centerId when role changes
                setFormData(prev => ({ ...prev, centerId: "" }));
              }}
              required
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className={modalStyles.formGroup}>
            <label htmlFor="region">Region *</label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={(e) => {
                handleChange(e);
                // Reset centerId when region changes
                setFormData(prev => ({ ...prev, centerId: "" }));
              }}
              disabled={regionsLoading}
              required
            >
              <option value="">
                {regionsLoading ? "Loading regions..." : "Select Region"}
              </option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {(formData.role === "STAFF" || formData.role === "NURSE_OFFICER" || formData.role === "MANAGER") && (
            <div className={modalStyles.formGroup}>
              <label htmlFor="centerId">Center *</label>
              <select
                id="centerId"
                name="centerId"
                value={formData.centerId}
                onChange={handleChange}
                disabled={centersLoading || !formData.region}
                required
              >
                <option value="">
                  {!formData.region
                    ? "Select region first"
                    : centersLoading
                      ? "Loading centers..."
                      : centers.length === 0
                        ? "No centers available"
                        : "Select Center"}
                </option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name} - {center.city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.role === "REGIONAL_OFFICE" && (
            <div className={modalStyles.formGroup}>
              <small style={{ color: "#6b7280", marginTop: "0.25rem", display: "block" }}>
                Regional Office will manage all centers in the selected region
              </small>
            </div>
          )}

          <div className={modalStyles.modalActions}>
            <button type="button" className={modalStyles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={modalStyles.btnPrimary} disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserModal;
