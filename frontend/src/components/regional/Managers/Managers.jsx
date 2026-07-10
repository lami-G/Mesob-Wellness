import React, { useState, useCallback, useEffect } from 'react';
import { analyticsService } from '../../../services/analyticsService';
import Button from '../../forms/Button';
import Input from '../../forms/Input';

const Managers = ({ loading, centers, onRefresh }) => {
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [formError, setFormError] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "NURSE_OFFICER",
    password: "",
    phone: "",
    centerId: "",
  });

  // Load managers
  const loadManagers = useCallback(async () => {
    setLoadingManagers(true);
    try {
      const response = await analyticsService.getStaffUsers();
      if (response.success) {
        setManagers(response.data);
      }
    } catch (err) {
      console.error("Error loading managers:", err);
    } finally {
      setLoadingManagers(false);
    }
  }, []);

  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

  // Filter managers
  const filteredManagers = managers.filter((m) => {
    const matchesRole = filterRole === "all" || m.role === filterRole;
    const matchesSearch =
      !searchTerm ||
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesSearch;
  });

  // Handle create/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.fullName || !formData.email || !formData.role) {
      setFormError("Name, email, and role are required.");
      return;
    }

    if (!editingManager && !formData.password) {
      setFormError("Password is required for new managers.");
      return;
    }

    setSaving(true);
    try {
      if (editingManager) {
        // Update existing manager
        await analyticsService.updateStaffUser(editingManager.id, {
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          centerId: formData.centerId || null,
        });
      } else {
        // Create new manager
        await analyticsService.createStaffUser({
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          phone: formData.phone,
          centerId: formData.centerId || null,
        });
      }

      setShowModal(false);
      setEditingManager(null);
      setFormData({
        fullName: "",
        email: "",
        role: "MANAGER",
        password: "",
        phone: "",
        centerId: "",
      });
      loadManagers();
      if (onRefresh) onRefresh();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to save manager.");
    } finally {
      setSaving(false);
    }
  };

  // Handle edit
  const handleEdit = (manager) => {
    setEditingManager(manager);
    setFormData({
      fullName: manager.fullName,
      email: manager.email,
      role: manager.role,
      password: "",
      phone: manager.phone || "",
      centerId: manager.centerId || "",
    });
    setShowModal(true);
  };

  // Handle toggle status
  const handleToggle = async (managerId) => {
    setToggling(managerId);
    try {
      await analyticsService.toggleUserStatus(managerId);
      loadManagers();
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setToggling(null);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingManager(null);
    setFormData({
      fullName: "",
      email: "",
      role: "NURSE_OFFICER",
      password: "",
      phone: "",
      centerId: "",
    });
    setFormError("");
  };

  if (loading || loadingManagers) {
    return (
      <div className="mgr-loading">
        <div className="mgr-spinner" />
        Loading managers…
      </div>
    );
  }

  // Stats
  const totalManagers = managers.length;
  const activeManagers = managers.filter((m) => m.isActive).length;
  const managersByRole = {
    NURSE_OFFICER: managers.filter((m) => m.role === "NURSE_OFFICER").length,
    MANAGER: managers.filter((m) => m.role === "MANAGER").length,
    REGIONAL_OFFICE: managers.filter((m) => m.role === "REGIONAL_OFFICE")
      .length,
    FEDERAL_OFFICE: managers.filter((m) => m.role === "FEDERAL_OFFICE").length,
    SYSTEM_ADMIN: managers.filter((m) => m.role === "SYSTEM_ADMIN").length,
  };

  return (
    <div className="users-content">
      {/* Stats Row */}
      <div
        className="mgr-kpi-grid"
        style={{
          gridTemplateColumns: "repeat(6, 1fr)",
          marginBottom: "1.5rem",
        }}
      >
        {[
          {
            icon: "👔",
            label: "Total Staff",
            value: totalManagers,
            color: "#284394",
          },
          {
            icon: "✅",
            label: "Active",
            value: activeManagers,
            color: "#22c55e",
          },
          {
            icon: "👨‍⚕️",
            label: "Nurse Officers",
            value: managersByRole.NURSE_OFFICER,
            color: "#10b981",
          },
          {
            icon: "🏢",
            label: "Center Managers",
            value: managersByRole.MANAGER,
            color: "#2563eb",
          },
          {
            icon: "🌍",
            label: "Regional Officers",
            value: managersByRole.REGIONAL_OFFICE,
            color: "#7c3aed",
          },
          {
            icon: "🏛️",
            label: "Federal Officers",
            value: managersByRole.FEDERAL_OFFICE,
            color: "#f59e0b",
          },
        ].map((c) => (
          <div key={c.label} className="mgr-kpi-card">
            <div
              className="mgr-kpi-icon"
              style={{ background: c.color + "18", color: c.color }}
            >
              {c.icon}
            </div>
            <div className="mgr-kpi-body">
              <div className="mgr-kpi-value" style={{ color: c.color }}>
                {c.value}
              </div>
              <div className="mgr-kpi-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Header with filters */}
      <div className="users-header" style={{ marginBottom: "1rem" }}>
        <div>
          <h3>Manager Directory ({filteredManagers.length} managers)</h3>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Input
            placeholder="🔍 Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: "250px" }}
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="form-input"
            style={{ minWidth: "180px" }}
          >
            <option value="all">All Roles</option>
            <option value="NURSE_OFFICER">Nurse Officer</option>
            <option value="MANAGER">Center Manager</option>
            <option value="REGIONAL_OFFICE">Regional Officer</option>
            <option value="FEDERAL_OFFICE">Federal Officer</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
          </select>
          <Button onClick={() => setShowModal(true)}>+ Create Manager</Button>
        </div>
      </div>

      {/* Managers Table */}
      {filteredManagers.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#6c757d" }}>
          {searchTerm || filterRole !== "all"
            ? "No managers match your filters."
            : "No managers found. Create one to get started."}
        </div>
      ) : (
        <div className="users-table">
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
            <tbody>
              {filteredManagers.map((manager) => (
                <tr key={manager.id}>
                  <td style={{ fontWeight: 600 }}>{manager.fullName}</td>
                  <td>{manager.email}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        background:
                          manager.role === "NURSE_OFFICER"
                            ? "#d1fae5"
                            : manager.role === "MANAGER"
                              ? "#dbeafe"
                              : manager.role === "REGIONAL_OFFICE"
                                ? "#e9d5ff"
                                : manager.role === "FEDERAL_OFFICE"
                                  ? "#fef3c7"
                                  : manager.role === "SYSTEM_ADMIN"
                                    ? "#fee2e2"
                                    : "#f3f4f6",
                        color:
                          manager.role === "NURSE_OFFICER"
                            ? "#065f46"
                            : manager.role === "MANAGER"
                              ? "#1e40af"
                              : manager.role === "REGIONAL_OFFICE"
                                ? "#6b21a8"
                                : manager.role === "FEDERAL_OFFICE"
                                  ? "#92400e"
                                  : manager.role === "SYSTEM_ADMIN"
                                    ? "#991b1b"
                                    : "#374151",
                      }}
                    >
                      {manager.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>{manager.phone || "—"}</td>
                  <td style={{ fontSize: "0.85rem" }}>
                    {manager.lastLoginAt
                      ? new Date(manager.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td>
                    <span
                      className={`status ${manager.isActive ? "active" : "inactive"}`}
                    >
                      {manager.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button size="small" onClick={() => handleEdit(manager)}>
                        ✏️ Edit
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleToggle(manager.id)}
                        disabled={toggling === manager.id}
                      >
                        {toggling === manager.id
                          ? "…"
                          : manager.isActive
                            ? "🔒 Deactivate"
                            : "🔓 Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>
                {editingManager ? "✏️ Edit Manager" : "➕ Create New Manager"}
              </h3>
              <button onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {formError && (
                <div
                  className="alert alert-error"
                  style={{ marginBottom: "1rem" }}
                >
                  {formError}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <Input
                  label="Full Name *"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  placeholder="John Doe"
                />
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="john@mesob.et"
                  disabled={!!editingManager}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="form-input"
                    required
                  >
                    <option value="NURSE_OFFICER">Nurse Officer</option>
                    <option value="MANAGER">Center Manager</option>
                    <option value="REGIONAL_OFFICE">Regional Officer</option>
                    <option value="FEDERAL_OFFICE">Federal Officer</option>
                    <option value="SYSTEM_ADMIN">System Admin</option>
                  </select>
                  <small
                    style={{
                      color: "#6b7280",
                      fontSize: "0.85rem",
                      marginTop: "0.25rem",
                      display: "block",
                    }}
                  >
                    ℹ️ Select the appropriate role for this staff member
                  </small>
                </div>

                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+251911234567"
                />
              </div>

              {!editingManager && (
                <Input
                  label="Password *"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  placeholder="Minimum 8 characters"
                />
              )}

              <div className="form-group">
                <label>Assign to Center (Optional)</label>
                <select
                  value={formData.centerId}
                  onChange={(e) =>
                    setFormData({ ...formData, centerId: e.target.value })
                  }
                  className="form-input"
                >
                  <option value="">No Center Assignment</option>
                  {centers.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name} ({center.region})
                    </option>
                  ))}
                </select>
                <small
                  style={{
                    color: "#6b7280",
                    fontSize: "0.85rem",
                    marginTop: "0.25rem",
                    display: "block",
                  }}
                >
                  Assign this manager to a specific health center
                </small>
              </div>

              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Saving…"
                    : editingManager
                      ? "💾 Update Manager"
                      : "➕ Create Manager"}
                </Button>
                <Button type="button" onClick={handleCloseModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Managers;
