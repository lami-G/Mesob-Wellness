import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import modalStyles from "../shared/Modal.module.css";

function EditUserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
  allowedRoles,
  disallowEditRoles,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    isActive: true,
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState("");

  const defaultRoles = [
    "STAFF",
    "NURSE_OFFICER",
    "MANAGER",
    "REGIONAL_OFFICE",
    "FEDERAL_OFFICE",
    "SYSTEM_ADMIN",
  ];
  const roles =
    allowedRoles && allowedRoles.length ? allowedRoles : defaultRoles;
  const isRestrictedRole = disallowEditRoles?.includes(formData.role);
  const displayRoles = roles.includes(formData.role)
    ? roles
    : [formData.role, ...roles].filter(Boolean);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        role: user.role || "",
        isActive: user.isActive !== false,
        newPassword: "",
        confirmPassword: "",
      });
      setError("");
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const generateTempPassword = () => {
    // Ensure password meets all requirements: uppercase, lowercase, number, special char
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*";

    let password = "";
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));

    // Fill remaining 8 characters with random mix
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 0; i < 8; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setTempPassword(password);
    setFormData((prev) => ({
      ...prev,
      newPassword: password,
      confirmPassword: password,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.role) {
      setError("Please fill in all required fields");
      return;
    }

    if (isRestrictedRole) {
      setError("You cannot edit users with this role.");
      return;
    }

    // Validate password if provided
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      setLoading(true);
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Only include password if provided
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      await adminService.updateUser(user.id, updateData);
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update user";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose}>
      <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={modalStyles.modalHeader}>
          <h3>Edit User</h3>
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
              required
            />
          </div>

          {isRestrictedRole && (
            <div className={modalStyles.errorMessage}>
              You cannot modify users with this role.
            </div>
          )}

          <div className={modalStyles.formGroup}>
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={isRestrictedRole}
            >
              <option value="">Select Role</option>
              {displayRoles.map((role) => (
                <option
                  key={role}
                  value={role}
                  disabled={!roles.includes(role)}
                >
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className={modalStyles.formGroup}>
            <label htmlFor="isActive">
              <input
                id="isActive"
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          <div className={modalStyles.formGroup}>
            <label htmlFor="newPassword">Password</label>
            <div className={modalStyles.passwordInputContainer}>
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder={user?.password ? "••••••••" : "No password set"}
                className={modalStyles.passwordInput}
              />
              {user?.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  className={modalStyles.passwordToggleBtn}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              )}
            </div>
            {showPassword && user?.password && (
              <small className={modalStyles.helperText}>
                Current password visible
              </small>
            )}
          </div>

          <div className={modalStyles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={modalStyles.passwordInputContainer}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                disabled={!formData.newPassword}
                className={modalStyles.passwordInput}
              />
              {formData.newPassword && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className={modalStyles.passwordToggleBtn}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              )}
            </div>
          </div>

          <div className={modalStyles.modalActions}>
            <button type="button" className={modalStyles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={modalStyles.btnSecondary}
              onClick={generateTempPassword}
              title="Generate a temporary password for the user"
            >
              Reset Password
            </button>
            <button type="submit" className={modalStyles.btnPrimary} disabled={loading}>
              {loading ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;
