import React, { useState, useEffect, useCallback } from "react";
import { adminService } from "../../../services/adminService";
import { regionalService } from "../../../services/regionalService";
import RegionEditModal from "./RegionEditModal";
import RegionHealthComparison from "./RegionHealthComparison";
import EthiopiaHealthMap from "./EthiopiaHealthMap";
import styles from "./RegionManagement.module.css";
import "../../../styles/admin-regions.css";

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
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showRegionEditModal, setShowRegionEditModal] = useState(false);
  const [selectedRegionForEdit, setSelectedRegionForEdit] = useState(null);
  const [selectedRegionStatus, setSelectedRegionStatus] = useState("ACTIVE");
  const [regionActionLoading, setRegionActionLoading] = useState(false);
  const [regionActionError, setRegionActionError] = useState("");
  const [regionActionSuccess, setRegionActionSuccess] = useState("");
  const [showDetailView, setShowDetailView] = useState(false);
  const [regionStats, setRegionStats] = useState({});
  const [regionCardsPage, setRegionCardsPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [timePeriod, setTimePeriod] = useState("monthly");
  const cardsPerPage = 8;

  // Filter regions based on search query
  const filteredRegions = regions.filter(region =>
    region.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="management-section">
      {!showDetailView ? (
        // CARD VIEW - Original Region Cards
        <div className={styles.regionManagementContainer}>
          {/* Top row with Add Region Form and Region Details button */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            {/* Add Region Form */}
            <div className="add-region-card" style={{ flex: '1' }}>
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
          
          {/* Region Details Button */}
          <button
            className={styles.toggleViewBtn}
            onClick={() => setShowDetailView(!showDetailView)}
            style={{ minWidth: '150px', height: 'fit-content' }}
          >
            Region Details →
          </button>
        </div>

          {/* Search and Regions List */}
          <div className="regions-list-card">
            <div className="regions-list-header">
              <h3>Existing Regions ({filteredRegions.length})</h3>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {/* Time Period Filter */}
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  style={{
                    padding: '0.375rem 0.625rem',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="all">All Time</option>
                </select>
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search regions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setRegionCardsPage(1); // Reset to first page on search
                  }}
                  style={{
                    padding: '0.375rem 0.625rem',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    color: '#374151',
                    minWidth: '200px',
                  }}
                />
                {Math.ceil(filteredRegions.length / cardsPerPage) > 1 && (
                  <div className="pagination-controls">
                    <button
                      onClick={() => setRegionCardsPage(Math.max(1, regionCardsPage - 1))}
                      disabled={regionCardsPage === 1}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    <span className="page-info">
                      Page {regionCardsPage} of {Math.ceil(filteredRegions.length / cardsPerPage)}
                    </span>
                    <button
                      onClick={() => setRegionCardsPage(Math.min(Math.ceil(filteredRegions.length / cardsPerPage), regionCardsPage + 1))}
                      disabled={regionCardsPage === Math.ceil(filteredRegions.length / cardsPerPage)}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {loading && filteredRegions.length === 0 ? (
              <div className="loading-state">Loading regions...</div>
            ) : filteredRegions.length === 0 ? (
              <div className="empty-state">
                <p>{searchQuery ? `No regions found matching "${searchQuery}"` : "No regions found. Create your first region above."}</p>
              </div>
            ) : (
              <div className="regions-grid">
                {filteredRegions
                  .slice((regionCardsPage - 1) * cardsPerPage, regionCardsPage * cardsPerPage)
                  .map((region) => (
                  <div 
                    key={region} 
                    className="region-card"
                    onClick={() => {
                      setSelectedRegion(region);
                      setShowDetailView(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // DETAIL VIEW - Federal-Style Table
        <div className={styles.dashboardSection}>
          {/* Header with inline filters and buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '0.875rem 1rem', 
            backgroundColor: '#ffffff', 
            borderRadius: '12px', 
            marginBottom: '1rem',
            border: '1px solid #e2e8f0',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            {/* Left side - Filters */}
            <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                style={{
                  padding: '0.375rem 0.625rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#374151',
                  cursor: 'pointer',
                }}
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
                style={{
                  padding: '0.375rem 0.625rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Right side - Buttons */}
            <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setShowRegionModal(true)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                  color: '#ffffff',
                  boxShadow: '0 2px 6px rgba(30, 64, 175, 0.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                + Create Region
              </button>
              <button
                onClick={() => setShowDetailView(!showDetailView)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                ← Back to Cards
              </button>
            </div>
          </div>

          {showRegionModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h3>Create New Region</h3>
                  <button
                    onClick={() => {
                      setShowRegionModal(false);
                      setNewRegion("");
                      setRegionError("");
                      setRegionSuccess("");
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.modalBody}>
                  {regionError && (
                    <div className={styles.alert + ' ' + styles.alertError}>
                      {regionError}
                    </div>
                  )}
                  {regionSuccess && (
                    <div className={styles.successMessage}>
                      {regionSuccess}
                    </div>
                  )}
                  <div className={styles.formGrid}>
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
                  </div>
                  <div className={styles.modalActions}>
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

                          setRegionSuccess(
                            `Region "${trimmed}" created successfully.`,
                          );
                          setNewRegion("");
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
            <div className={styles.analyticsCardsGrid}>
              <div className="analytics-card">
                <div className="card-content">
                  <p className="card-label">Centers</p>
                  <p className="card-value">{regionSummary.totalCenters || 0}</p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-content">
                  <p className="card-label">Total Staff</p>
                  <p className="card-value">
                    {regionSummary.summary?.totalStaff || 0}
                  </p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-content">
                  <p className="card-label">Appointments</p>
                  <p className="card-value">
                    {regionSummary.summary?.totalAppointments || 0}
                  </p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-content">
                  <p className="card-label">Completed</p>
                  <p className="card-value">
                    {regionSummary.summary?.completedAppointments || 0}
                  </p>
                </div>
              </div>
              <div className="analytics-card">
                <div className="card-content">
                  <p className="card-label">Vitals</p>
                  <p className="card-value">
                    {regionSummary.summary?.totalVitals || 0}
                  </p>
                </div>
              </div>
              <div className="analytics-card">
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
            <div className={styles.alert + ' ' + styles.alertError}>
              {regionActionError}
            </div>
          )}
          {regionActionSuccess && (
            <div className={styles.successMessage}>
              {regionActionSuccess}
            </div>
          )}

          {loading ? (
            <div className="metrics-loading">Loading regions...</div>
          ) : selectedRegion === "all" ? (
            <div className={styles.usersTable}>
              <table>
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Status</th>
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
                      <td>{row.totalCenters}</td>
                      <td>{row.activeCenters}</td>
                      <td>{row.totalAppointments}</td>
                      <td>{row.completion}%</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className="btn btn-reset"
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
            <div className={styles.cardCentered}>
              <p className={styles.helperText}>
                Centers shown below are active only.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ethiopia Health Map - Only show in card view */}
      {!showDetailView && (
        <EthiopiaHealthMap 
          timePeriod={timePeriod}
          selectedRegion={selectedRegion}
        />
      )}

      {/* Regional Staff Health Comparison - Only show in card view */}
      {!showDetailView && <RegionHealthComparison />}

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
