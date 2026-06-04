import React, { useState, useEffect, useCallback } from "react";
import { adminService } from "../../services/adminService";
import { regionalService } from "../../services/regionalService";
import RegionEditModal from "../../components/admin/RegionEditModal";
import RegionManagerModal from "../../components/admin/RegionManagerModal";
import "../../styles/admin-regions.css";

function RegionManagement() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCenters, setAllCenters] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [regionStatusFilter, setRegionStatusFilter] = useState("all");
  const [analytics, setAnalytics] = useState(null);
  const [newRegion, setNewRegion] = useState("");
  const [regionError, setRegionError] = useState("");
  const [regionSuccess, setRegionSuccess] = useState("");
  const [creatingRegion, setCreatingRegion] = useState(false);
  const [regionAccountEmail, setRegionAccountEmail] = useState("");
  const [regionAccountPassword, setRegionAccountPassword] = useState("");
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showRegionEditModal, setShowRegionEditModal] = useState(false);
  const [selectedRegionForEdit, setSelectedRegionForEdit] = useState(null);
  const [selectedRegionStatus, setSelectedRegionStatus] = useState("ACTIVE");
  const [regionActionLoading, setRegionActionLoading] = useState(false);
  const [regionActionError, setRegionActionError] = useState("");
  const [regionActionSuccess, setRegionActionSuccess] = useState("");
  const [regionAdmins, setRegionAdmins] = useState({});
  const [showDetailView, setShowDetailView] = useState(false);
  const [regionStats, setRegionStats] = useState({});
  const [showRegionManagerModal, setShowRegionManagerModal] = useState(false);
  const [selectedRegionForManager, setSelectedRegionForManager] = useState(null);

  const loadRegionData = useCallback(async () => {
    setLoading(true);
    try {
      const [regionsRes, allCentersRes, analyticsRes] = await Promise.allSettled([
        adminService.getRegions(),
        adminService.getCenters({ limit: 1000 }),
        regionalService.getAllAnalytics(),
      ]);

      if (regionsRes.status === "fulfilled") {
        const regionsList = regionsRes.value?.data || regionsRes.value || [];
        setRegions(regionsList);

        // Load stats for each region
        const stats = {};
        for (const region of regionsList || []) {
          const centers = await adminService.getCentersByRegion(region);
          stats[region] = centers.length;
        }
        setRegionStats(stats);

        // Load region admins for all regions
        const adminsMap = {};
        await Promise.all(
          regionsList.map(async (region) => {
            try {
              const adminData = await adminService.getRegionAdmin(region);
              if (adminData) {
                adminsMap[region] = adminData;
              }
            } catch (err) {
              // Region admin doesn't exist, that's okay
            }
          }),
        );
        setRegionAdmins(adminsMap);
      }

      if (allCentersRes.status === "fulfilled") {
        setAllCenters(allCentersRes.value?.data || allCentersRes.value || []);
      }

      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value?.data || analyticsRes.value || null);
      }
    } catch (err) {
      console.error("Failed to load region data:", err);
      setRegionError("Failed to load region data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegionData();
  }, [loadRegionData]);

  // Auto-hide success messages after 3 seconds
  useEffect(() => {
    if (regionActionSuccess) {
      const timer = setTimeout(() => {
        setRegionActionSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [regionActionSuccess]);

  useEffect(() => {
    if (regionSuccess) {
      const timer = setTimeout(() => {
        setRegionSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [regionSuccess]);

  const getRegionStatus = (regionCenters) => {
    if (!regionCenters.length) return "INACTIVE";
    if (regionCenters.some((center) => center.status === "MAINTENANCE")) {
      return "MAINTENANCE";
    }
    if (regionCenters.some((center) => center.status === "ACTIVE")) {
      return "ACTIVE";
    }
    return "INACTIVE";
  };

  const regionRows = regions.map((region) => {
    const regionCenters = allCenters.filter(
      (center) => center.region === region,
    );
    const status = getRegionStatus(regionCenters);
    const activeCenters = regionCenters.filter(
      (center) => center.status === "ACTIVE",
    ).length;
    const analyticsSummary =
      analytics?.regions?.find((entry) => entry.region === region)?.summary ||
      {};
    const completion = analyticsSummary.totalAppointments
      ? Math.round(
          (analyticsSummary.completedAppointments /
            analyticsSummary.totalAppointments) *
            100,
        )
      : 0;

    return {
      region,
      status,
      totalCenters: regionCenters.length,
      activeCenters,
      totalStaff: analyticsSummary.totalStaff || 0,
      totalAppointments: analyticsSummary.totalAppointments || 0,
      completion,
    };
  });

  const filteredRegionRows = regionRows.filter((row) =>
    regionStatusFilter === "all" ? true : row.status === regionStatusFilter,
  );

  const regionSummary =
    selectedRegion === "all"
      ? null
      : analytics?.regions?.find(
          (region) => region.region === selectedRegion,
        ) || null;

  const handleSaveRegionManager = async (data) => {
    try {
      setRegionError("");
      setRegionSuccess("");
      
      // Call the backend API to upsert region admin
      await adminService.upsertRegionAdmin(data.region, {
        email: data.managerEmail,
        password: data.managerPassword,
      });
      
      setRegionSuccess(`Region manager for ${data.region} updated successfully!`);
      
      // Reload region data to fetch updated admin emails
      await loadRegionData();
    } catch (err) {
      console.error("Failed to update region manager:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to update region manager";
      setRegionError(errorMsg);
      throw err; // Re-throw so the modal can handle it
    }
  };

  return (
    <div className="management-section">
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🌍 Region Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowDetailView(!showDetailView)}
          style={{ padding: "0.75rem 1.5rem" }}
        >
          {showDetailView ? "← Back to Cards" : "Region Details →"}
        </button>
      </div>

      {!showDetailView ? (
        // CARD VIEW - Original Region Cards
        <div className="region-management-container">
          {/* Add Region Form */}
          <div className="add-region-card">
            <h3>Add New Region</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newRegion.trim()) {
                  setRegionError("Please enter a region name");
                  return;
                }
                if (regions.includes(newRegion.trim())) {
                  setRegionError("This region already exists");
                  return;
                }
                try {
                  setLoading(true);
                  await adminService.createCenter({
                    name: `${newRegion} Regional Center`,
                    region: newRegion.trim(),
                    city: newRegion.trim(),
                    address: "To be updated",
                    status: "ACTIVE",
                  });
                  setRegionSuccess(`Region "${newRegion}" created successfully!`);
                  setNewRegion("");
                  await loadRegionData();
                } catch (err) {
                  const errorMsg = err.response?.data?.message || "Failed to create region";
                  setRegionError(errorMsg);
                } finally {
                  setLoading(false);
                }
              }}
              className="add-region-form"
            >
              {regionError && <div className="error-message">{regionError}</div>}
              {regionSuccess && <div className="success-message">{regionSuccess}</div>}

              <div className="form-group">
                <label htmlFor="regionName">Region Name</label>
                <input
                  id="regionName"
                  type="text"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="e.g., Addis Ababa, Oromia, Amhara"
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Region"}
              </button>
            </form>
          </div>

          {/* Regions List */}
          <div className="regions-list-card">
            <h3>Existing Regions ({regions.length})</h3>

            {loading && regions.length === 0 ? (
              <div className="loading-state">Loading regions...</div>
            ) : regions.length === 0 ? (
              <div className="empty-state">
                <p>No regions found. Create your first region above.</p>
              </div>
            ) : (
              <div className="regions-grid">
                {regions.map((region) => (
                  <div key={region} className="region-card">
                    <div className="region-card-header">
                      <div className="region-title">
                        <h4>{region}</h4>
                        <span className="region-badge">
                          {regionStats[region] || 0} centers
                        </span>
                      </div>
                    </div>
                    <div className="region-card-body">
                      <div className="region-stats">
                        <div className="stat-item">
                          <span className="stat-label">Centers</span>
                          <span className="stat-value">
                            {regionStats[region] || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="region-card-footer">
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setSelectedRegionForManager(region);
                          setShowRegionManagerModal(true);
                        }}
                      >
                        👤 Manager
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // DETAIL VIEW - Federal-Style Table
        <div className="dashboard-section">
          <div className="users-header" style={{ marginBottom: "1rem" }}>
            <div>
              <h3>Region Directory</h3>
              <p style={{ marginTop: "0.25rem", color: "#6b7280" }}>
                Active regions and their center coverage
              </p>
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="form-input"
              style={{ maxWidth: "220px" }}
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <select
              value={regionStatusFilter}
              onChange={(e) => setRegionStatusFilter(e.target.value)}
              className="form-input"
              style={{ maxWidth: "200px" }}
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div
            className="card"
            style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
          >
            <h4 style={{ marginBottom: "0.5rem" }}>Create New Region</h4>
            <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
              This creates a regional placeholder center to register the region.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowRegionModal(true)}
            >
              + Create Region
            </button>
          </div>

          {showRegionModal && (
            <div className="modal-overlay">
              <div className="modal" style={{ maxWidth: "640px" }}>
                <div className="modal-header">
                  <h3>Create New Region</h3>
                  <button
                    onClick={() => {
                      setShowRegionModal(false);
                      setNewRegion("");
                      setRegionAccountEmail("");
                      setRegionAccountPassword("");
                      setRegionError("");
                      setRegionSuccess("");
                    }}
                  >
                    ×
                  </button>
                </div>
                <div>
                  {regionError && (
                    <div
                      className="alert alert-error"
                      style={{ marginBottom: "0.75rem" }}
                    >
                      {regionError}
                    </div>
                  )}
                  {regionSuccess && (
                    <div
                      className="success-message"
                      style={{ marginBottom: "0.75rem" }}
                    >
                      {regionSuccess}
                    </div>
                  )}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Region name (e.g., Oromia)"
                      value={newRegion}
                      onChange={(e) => {
                        setNewRegion(e.target.value);
                        setRegionError("");
                        setRegionSuccess("");
                      }}
                    />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Region admin email"
                      value={regionAccountEmail}
                      onChange={(e) => setRegionAccountEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Region admin password"
                      value={regionAccountPassword}
                      onChange={(e) => setRegionAccountPassword(e.target.value)}
                    />
                  </div>
                  <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                    <button
                      className="btn btn-primary"
                      onClick={async () => {
                        const trimmed = newRegion.trim();
                        if (!trimmed) {
                          setRegionError("Please enter a region name.");
                          return;
                        }
                        if (regions.includes(trimmed)) {
                          setRegionError("This region already exists.");
                          return;
                        }
                        try {
                          setCreatingRegion(true);
                          setRegionError("");
                          setRegionSuccess("");

                          await regionalService.createCenter({
                            name: `${trimmed} Regional Center`,
                            region: trimmed,
                            city: trimmed,
                            address: "To be updated",
                            status: "ACTIVE",
                          });

                          // Create region admin if email and password provided
                          if (regionAccountEmail && regionAccountPassword) {
                            try {
                              await adminService.upsertRegionAdmin(trimmed, {
                                email: regionAccountEmail,
                                password: regionAccountPassword,
                              });
                            } catch (adminErr) {
                              console.error("Failed to create region admin:", adminErr);
                              // Region created but admin failed - show partial success
                              setRegionError(
                                `Region "${trimmed}" created, but failed to create admin: ${adminErr.response?.data?.message || adminErr.message}`,
                              );
                              setNewRegion("");
                              setRegionAccountEmail("");
                              setRegionAccountPassword("");
                              await loadRegionData();
                              setCreatingRegion(false);
                              return;
                            }
                          }

                          setRegionSuccess(
                            `Region "${trimmed}" created successfully.`,
                          );
                          setNewRegion("");
                          setRegionAccountEmail("");
                          setRegionAccountPassword("");
                          setShowRegionModal(false);
                          await loadRegionData();
                        } catch (err) {
                          const message =
                            err.response?.data?.message ||
                            "Failed to create region.";
                          setRegionError(message);
                        } finally {
                          setCreatingRegion(false);
                        }
                      }}
                      disabled={creatingRegion}
                    >
                      {creatingRegion ? "Creating..." : "Create Region"}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowRegionModal(false);
                        setNewRegion("");
                        setRegionAccountEmail("");
                        setRegionAccountPassword("");
                        setRegionError("");
                        setRegionSuccess("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {regionSummary && (
            <div
              className="analytics-cards-grid"
              style={{ marginBottom: "1.5rem" }}
            >
              <div className="analytics-card">
                <div className="card-icon">🏥</div>
                <div className="card-content">
                  <p className="card-label">Centers</p>
                  <p className="card-value">{regionSummary.totalCenters || 0}</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">👥</div>
                <div className="card-content">
                  <p className="card-label">Total Staff</p>
                  <p className="card-value">
                    {regionSummary.summary?.totalStaff || 0}
                  </p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">📋</div>
                <div className="card-content">
                  <p className="card-label">Appointments</p>
                  <p className="card-value">
                    {regionSummary.summary?.totalAppointments || 0}
                  </p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">✅</div>
                <div className="card-content">
                  <p className="card-label">Completed</p>
                  <p className="card-value">
                    {regionSummary.summary?.completedAppointments || 0}
                  </p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">🩺</div>
                <div className="card-content">
                  <p className="card-label">Vitals</p>
                  <p className="card-value">
                    {regionSummary.summary?.totalVitals || 0}
                  </p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">⭐</div>
                <div className="card-content">
                  <p className="card-label">Avg Feedback</p>
                  <p className="card-value">
                    {regionSummary.summary?.averageFeedback
                      ? regionSummary.summary.averageFeedback.toFixed(1)
                      : "0.0"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {regionActionError && (
            <div className="alert alert-error" style={{ marginBottom: "0.75rem" }}>
              {regionActionError}
            </div>
          )}
          {regionActionSuccess && (
            <div className="success-message" style={{ marginBottom: "0.75rem" }}>
              {regionActionSuccess}
            </div>
          )}

          {loading ? (
            <div className="metrics-loading">Loading regions...</div>
          ) : selectedRegion === "all" ? (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Status</th>
                    <th>Admin Email</th>
                    <th>Centers</th>
                    <th>Active</th>
                    <th>Appointments</th>
                    <th>Completion %</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegionRows.map((row) => (
                    <tr key={row.region}>
                      <td>{row.region}</td>
                      <td>
                        <span
                          className={`status ${row.status === "ACTIVE" ? "active" : row.status === "MAINTENANCE" ? "maintenance" : "inactive"}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td>{regionAdmins[row.region]?.email || "-"}</td>
                      <td>{row.totalCenters}</td>
                      <td>{row.activeCenters}</td>
                      <td>{row.totalAppointments}</td>
                      <td>{row.completion}%</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setSelectedRegionForEdit(row.region);
                              setSelectedRegionStatus(row.status);
                              setShowRegionEditModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-reset"
                            disabled={regionActionLoading}
                            onClick={async () => {
                              const regionCenters = allCenters.filter(
                                (center) => center.region === row.region,
                              );
                              if (regionCenters.length === 0) {
                                setRegionActionError(
                                  "No centers found for this region.",
                                );
                                return;
                              }
                              try {
                                setRegionActionLoading(true);
                                setRegionActionError("");
                                setRegionActionSuccess("");
                                await Promise.all(
                                  regionCenters.map((center) =>
                                    adminService.updateCenter(center.id, {
                                      status: "INACTIVE",
                                    }),
                                  ),
                                );
                                setRegionActionSuccess(
                                  `Region "${row.region}" archived.`,
                                );
                                await loadRegionData();
                              } catch (err) {
                                const message =
                                  err.response?.data?.message ||
                                  "Failed to archive region.";
                                setRegionActionError(message);
                              } finally {
                                setRegionActionLoading(false);
                              }
                            }}
                          >
                            Archive
                          </button>
                          <button
                            className="btn btn-danger"
                            disabled={regionActionLoading}
                            onClick={async () => {
                              const regionCenters = allCenters.filter(
                                (center) => center.region === row.region,
                              );
                              if (regionCenters.length === 0) {
                                setRegionActionError(
                                  "No centers found for this region.",
                                );
                                return;
                              }
                              const confirmed = window.confirm(
                                `Delete region "${row.region}" and ${regionCenters.length} centers? This cannot be undone.`,
                              );
                              if (!confirmed) return;
                              try {
                                setRegionActionLoading(true);
                                setRegionActionError("");
                                setRegionActionSuccess("");
                                await Promise.all(
                                  regionCenters.map((center) =>
                                    adminService.deleteCenter(center.id),
                                  ),
                                );
                                setRegionActionSuccess(
                                  `Region "${row.region}" deleted.`,
                                );
                                await loadRegionData();
                              } catch (err) {
                                const message =
                                  err.response?.data?.message ||
                                  "Failed to delete region.";
                                setRegionActionError(message);
                              } finally {
                                setRegionActionLoading(false);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className="card"
              style={{ padding: "2rem", marginTop: "1rem", textAlign: "center" }}
            >
              <h3 style={{ marginBottom: "1rem" }}>{selectedRegion} Summary</h3>
              <div
                className="analytics-cards-grid"
                style={{ marginTop: "1.5rem", gridTemplateColumns: "repeat(3, 1fr)" }}
              >
                <div className="analytics-card" style={{ backgroundColor: "#1e40af" }}>
                  <div className="card-icon">🏥</div>
                  <div className="card-content">
                    <p className="card-label">Centers</p>
                    <p className="card-value">
                      {regionSummary?.summary?.totalCenters || 0}
                    </p>
                  </div>
                </div>
                <div className="analytics-card" style={{ backgroundColor: "#1e40af" }}>
                  <div className="card-icon">👥</div>
                  <div className="card-content">
                    <p className="card-label">Total Staff</p>
                    <p className="card-value">
                      {regionSummary?.summary?.totalStaff || 0}
                    </p>
                  </div>
                </div>
                <div className="analytics-card" style={{ backgroundColor: "#1e40af" }}>
                  <div className="card-icon">📋</div>
                  <div className="card-content">
                    <p className="card-label">Appointments</p>
                    <p className="card-value">
                      {regionSummary?.summary?.totalAppointments || 0}
                    </p>
                  </div>
                </div>
              </div>
              <p style={{ color: "#6b7280", marginTop: "1.5rem", fontSize: "0.9rem" }}>
                Centers shown below are active only.
              </p>
            </div>
          )}
        </div>
      )}

      <RegionManagerModal
        isOpen={showRegionManagerModal}
        onClose={() => {
          setShowRegionManagerModal(false);
          setSelectedRegionForManager(null);
        }}
        region={selectedRegionForManager}
        onSave={handleSaveRegionManager}
      />

      <RegionEditModal
        isOpen={showRegionEditModal}
        onClose={() => {
          setShowRegionEditModal(false);
          setSelectedRegionForEdit(null);
        }}
        region={selectedRegionForEdit}
        regionStatus={selectedRegionStatus}
        allCenters={allCenters}
        onSuccess={async () => {
          setShowRegionEditModal(false);
          await loadRegionData();
        }}
      />
    </div>
  );
}

export default RegionManagement;
