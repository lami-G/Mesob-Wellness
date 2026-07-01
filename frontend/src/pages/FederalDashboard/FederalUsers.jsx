import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import "../../styles/admin-tables.css";

function FederalUsers() {
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState("NURSE_OFFICER");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "NURSE_OFFICER",
    region: "",
    centerId: "",
  });
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Edit User Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    isActive: true,
  });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [userType, pagination.page]);

  useEffect(() => {
    fetchCentersAndRegions();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getUsers({
        role: userType,
        page: pagination.page,
        limit: pagination.limit,
      });
      setUsers(result.data || []);
      setPagination(result.pagination || {});
    } catch (err) {
      setError(err.message || "Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCentersAndRegions = async () => {
    try {
      const [centersRes, regionsRes] = await Promise.all([
        adminService.getCenters({ limit: 1000 }),
        adminService.getRegions(),
      ]);
      setCenters(centersRes.data || centersRes || []);
      setRegions(regionsRes.data || regionsRes || []);
    } catch (err) {
      console.error("Error fetching centers/regions:", err);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setPagination({ ...pagination, page: 1 });
  };

  const handleCreateUser = () => {
    setCreateFormData({
      fullName: "",
      email: "",
      password: generateRandomPassword(),
      role: userType,
      region: "",
      centerId: "",
    });
    setCreateError("");
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!createFormData.fullName || !createFormData.email || !createFormData.password) {
      setCreateError("Full name, email, and password are required");
      return;
    }

    // Require center for NURSE_OFFICER, MANAGER, and STAFF roles
    if ((createFormData.role === "NURSE_OFFICER" || createFormData.role === "MANAGER" || createFormData.role === "STAFF") && !createFormData.centerId) {
      setCreateError(`Center is required for ${createFormData.role === "MANAGER" ? "Managers" : createFormData.role === "STAFF" ? "Staff" : "Nurse Officers"}`);
      return;
    }

    // Require region for REGIONAL_OFFICE role
    if (createFormData.role === "REGIONAL_OFFICE" && !createFormData.region) {
      setCreateError("Region is required for Regional Office users");
      return;
    }

    try {
      setCreateLoading(true);
      const userData = {
        fullName: createFormData.fullName,
        email: createFormData.email,
        password: createFormData.password,
        role: createFormData.role,
      };

      // Include centerId for NURSE_OFFICER and MANAGER
      if (createFormData.centerId) {
        userData.centerId = createFormData.centerId;
      }

      // Include region for REGIONAL_OFFICE (stored in a custom field or handled differently)
      // Note: You may need to add a region field to User model for REGIONAL_OFFICE
      if (createFormData.role === "REGIONAL_OFFICE" && createFormData.region) {
        userData.region = createFormData.region;
      }

      await adminService.createUser(userData);

      setShowCreateModal(false);
      setCreateFormData({
        fullName: "",
        email: "",
        password: "",
        role: "NURSE_OFFICER",
        region: "",
        centerId: "",
      });
      alert("User created successfully! Make sure to share the password securely.");
      await fetchUsers();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create user");
      console.error("Error creating user:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      isActive: user.isActive,
    });
    setEditError("");
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editFormData.fullName || !editFormData.email) {
      setEditError("Full name and email are required");
      return;
    }

    try {
      setEditLoading(true);
      await adminService.updateUser(selectedUser.id, {
        fullName: editFormData.fullName,
        email: editFormData.email,
        isActive: editFormData.isActive,
      });

      setShowEditModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update user");
      console.error("Error updating user:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Delete ${user.fullName}? This cannot be undone.`)) {
      try {
        await adminService.deleteUser(user.id);
        await fetchUsers();
      } catch (err) {
        alert("Failed to delete user: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    const generatedPassword = generateRandomPassword();
    setResetPassword(generatedPassword);
    setResetConfirmPassword(generatedPassword);
    setResetError("");
    setShowResetModal(true);
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
    if (showCreateModal) {
      setCreateFormData({ ...createFormData, password: newPassword });
    } else {
      setResetPassword(newPassword);
      setResetConfirmPassword(newPassword);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError("");

    if (!resetPassword) {
      setResetError("Password is required");
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      setResetError("Passwords do not match");
      return;
    }

    try {
      setResetLoading(true);
      await adminService.updateUser(selectedUser.id, {
        password: resetPassword,
      });
      setShowResetModal(false);
      setSelectedUser(null);
      setResetPassword("");
      setResetConfirmPassword("");
      alert("Password reset successfully");
    } catch (err) {
      setResetError(err.response?.data?.message || "Failed to reset password");
      console.error("Error resetting password:", err);
    } finally {
      setResetLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      NURSE_OFFICER: "Nurse Officer",
      MANAGER: "Manager",
      REGIONAL_OFFICE: "Regional Office",
      STAFF: "Staff",
    };
    return labels[role] || role;
  };

  if (loading && users.length === 0) {
    return <div className="table-loading">Loading users...</div>;
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>👥 User Management</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            className={`btn ${userType === "NURSE_OFFICER" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => handleUserTypeChange("NURSE_OFFICER")}
          >
            Nurses
          </button>
          <button
            className={`btn ${userType === "MANAGER" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => handleUserTypeChange("MANAGER")}
          >
            Managers
          </button>
          <button
            className={`btn ${userType === "REGIONAL_OFFICE" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => handleUserTypeChange("REGIONAL_OFFICE")}
          >
            Regional
          </button>
          <button
            className={`btn ${userType === "STAFF" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => handleUserTypeChange("STAFF")}
          >
            Staff
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreateUser}
            style={{ marginLeft: "1rem" }}
          >
            + Create User
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">
                  No {getRoleLabel(userType).toLowerCase()} users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="cell-name">{user.fullName}</td>
                  <td className="cell-email">{user.email}</td>
                  <td className="cell-role">
                    <span className="badge">{getRoleLabel(user.role)}</span>
                  </td>
                  <td className="cell-status">
                    <span className={`status ${user.isActive ? "active" : "inactive"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="cell-verified">
                    <span className={`status ${user.isVerified ? "active" : "inactive"}`}>
                      {user.isVerified ? "✓ Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="cell-date">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="cell-actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => handleEdit(user)}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(user)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn-pagination"
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="btn-pagination"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              {createError && (
                <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                  {createError}
                </div>
              )}

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={createFormData.fullName}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, fullName: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={createFormData.email}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, email: e.target.value })
                  }
                  placeholder="user@mesob.et"
                  required
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  className="form-input"
                  value={createFormData.role}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, role: e.target.value, centerId: "" })
                  }
                  required
                >
                  <option value="NURSE_OFFICER">Nurse Officer</option>
                  <option value="MANAGER">Manager</option>
                  <option value="REGIONAL_OFFICE">Regional Office</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>

              {(createFormData.role === "NURSE_OFFICER" || createFormData.role === "MANAGER" || createFormData.role === "STAFF") && (
                <>
                  <div className="form-group">
                    <label>Region *</label>
                    <select
                      className="form-input"
                      value={createFormData.region || ""}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, region: e.target.value, centerId: "" })
                      }
                      required
                    >
                      <option value="">Select a region...</option>
                      {regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Center *</label>
                    <select
                      className="form-input"
                      value={createFormData.centerId}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, centerId: e.target.value })
                      }
                      disabled={!createFormData.region}
                      required
                    >
                      <option value="">
                        {!createFormData.region ? "Select region first" : "Select a center..."}
                      </option>
                      {centers
                        .filter(c => c.region === createFormData.region)
                        .map((center) => (
                          <option key={center.id} value={center.id}>
                            {center.name} ({center.city})
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}

              {createFormData.role === "REGIONAL_OFFICE" && (
                <div className="form-group">
                  <label>Region *</label>
                  <select
                    className="form-input"
                    value={createFormData.region || ""}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, region: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a region...</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: "#6b7280", marginTop: "0.25rem", display: "block" }}>
                    Regional Office will manage all centers in this region
                  </small>
                </div>
              )}

              <div className="form-group">
                <label>Generated Password *</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="form-input"
                    value={createFormData.password}
                    readOnly
                    style={{ fontFamily: "monospace", backgroundColor: "#f9fafb" }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(createFormData.password);
                      alert("Password copied to clipboard!");
                    }}
                    title="Copy password"
                  >
                    📋
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleRegeneratePassword}
                    title="Generate new password"
                  >
                    🔄
                  </button>
                </div>
                <small style={{ color: "#6b7280", marginTop: "0.25rem", display: "block" }}>
                  Copy this password and share it with the user securely
                </small>
              </div>

              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createLoading}
                >
                  {createLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              {editError && (
                <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                  {editError}
                </div>
              )}

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.fullName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, isActive: e.target.checked })
                    }
                  />
                  Active
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-reset"
                  onClick={() => {
                    setShowEditModal(false);
                    handleResetPassword(selectedUser);
                  }}
                >
                  Reset Password
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? "Updating..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button onClick={() => setShowResetModal(false)}>×</button>
            </div>

            <form onSubmit={handleResetSubmit}>
              {resetError && (
                <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                  {resetError}
                </div>
              )}

              <p style={{ marginBottom: "1rem", color: "#6b7280" }}>
                Resetting password for: <strong>{selectedUser.fullName}</strong>
              </p>

              <div className="form-group">
                <label>Generated Password</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="form-input"
                    value={resetPassword}
                    readOnly
                    style={{ fontFamily: "monospace", backgroundColor: "#f9fafb" }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(resetPassword);
                      alert("Password copied to clipboard!");
                    }}
                    title="Copy password"
                  >
                    📋
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleRegeneratePassword}
                    title="Generate new password"
                  >
                    🔄
                  </button>
                </div>
                <small style={{ color: "#6b7280", marginTop: "0.25rem", display: "block" }}>
                  Copy this password and share it with the user securely
                </small>
              </div>

              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Update Password" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FederalUsers;
