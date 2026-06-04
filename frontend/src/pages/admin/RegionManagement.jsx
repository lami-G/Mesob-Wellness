import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import CenterFormModal from "../../components/admin/CenterFormModal";
import RegionManagerModal from "../../components/admin/RegionManagerModal";
import RegionEditModal from "../../components/admin/RegionEditModal";
import "../../styles/admin-regions.css";

function RegionManagement() {
  const [regions, setRegions] = useState([]);
  const [newRegion, setNewRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [regionStats, setRegionStats] = useState({});
  const [showAddCenterModal, setShowAddCenterModal] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showRegionManagerModal, setShowRegionManagerModal] = useState(false);
  const [selectedRegionForManager, setSelectedRegionForManager] =
    useState(null);
  const [regionManagers, setRegionManagers] = useState({});
  const [showRegionDetailModal, setShowRegionDetailModal] = useState(false);
  const [detailRegion, setDetailRegion] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailData, setDetailData] = useState(null);
  const [detailCenters, setDetailCenters] = useState([]);
  const [showRegionEditModal, setShowRegionEditModal] = useState(false);
  const [selectedRegionForEdit, setSelectedRegionForEdit] = useState(null);
  const [selectedRegionStatus, setSelectedRegionStatus] = useState("ACTIVE");
  const [regionActionLoading, setRegionActionLoading] = useState(false);
  const [regionActionError, setRegionActionError] = useState("");
  const [regionActionSuccess, setRegionActionSuccess] = useState("");
  const [centerFormData, setCenterFormData] = useState({
    name: "",
    region: "",
    city: "",
    address: "",
    capacity: "",
    phone: "",
    email: "",
    managerEmail: "",
    managerPassword: "",
    status: "ACTIVE",
  });
  const [centerFormError, setCenterFormError] = useState("");
  const [centerSaving, setCenterSaving] = useState(false);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRegions();
      setRegions(data || []);

      // Load stats for each region
      const stats = {};
      for (const region of data || []) {
        const centers = await adminService.getCentersByRegion(region);
        stats[region] = centers.length;
      }
      setRegionStats(stats);
    } catch (err) {
      console.error("Error loading regions:", err);
      setError("Failed to load regions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRegion = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newRegion.trim()) {
      setError("Please enter a region name");
      return;
    }

    if (regions.includes(newRegion.trim())) {
      setError("This region already exists");
      return;
    }

    try {
      setLoading(true);
      // Create a center with the new region to establish it in the system
      await adminService.createCenter({
        name: `${newRegion} Regional Center`,
        code: `${newRegion.toUpperCase().substring(0, 3)}-001`,
        region: newRegion.trim(),
        city: newRegion.trim(),
        address: "To be updated",
        status: "ACTIVE",
      });

      setSuccess(`Region "${newRegion}" created successfully!`);
      setNewRegion("");
      await loadRegions();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create region";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCenterClick = (region) => {
    setSelectedRegion(region);
    setCenterFormData((prev) => ({
      ...prev,
      region,
    }));
    setCenterFormError("");
    setShowAddCenterModal(true);
  };

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

  const handleRegionDetailClick = async (region) => {
    setDetailRegion(region);
    setShowRegionDetailModal(true);
    setDetailLoading(true);
    setDetailError("");
    setDetailData(null);

    try {
      const [centers, regionAdmin, allAppointments, completedAppointments] =
        await Promise.all([
          adminService.getCentersByRegion(region),
          adminService.getRegionAdmin(region).catch(() => null),
          adminService.getAppointments({ region, limit: 1 }),
          adminService.getAppointments({
            region,
            status: "COMPLETED",
            limit: 1,
          }),
        ]);

      const totalCenters = centers.length;
      const activeCenters = centers.filter(
        (center) => center.status === "ACTIVE",
      ).length;
      const totalAppointments = allAppointments?.pagination?.total || 0;
      const completedCount =
        completedAppointments?.pagination?.total || 0;
      const completion = totalAppointments
        ? Math.round((completedCount / totalAppointments) * 100)
        : 0;

      setDetailData({
        region,
        status: getRegionStatus(centers),
        adminEmail: regionAdmin?.email || "-",
        totalCenters,
        activeCenters,
        totalAppointments,
        completion,
      });
    } catch (err) {
      console.error("Failed to load region details:", err);
      setDetailError("Failed to load region details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const resetCenterForm = () => {
    setCenterFormData({
      name: "",
      region: selectedRegion || "",
      city: "",
      address: "",
      capacity: "",
      phone: "",
      email: "",
      managerEmail: "",
      managerPassword: "",
      status: "ACTIVE",
    });
    setCenterFormError("");
  };

  const handleCenterSubmit = async (e) => {
    e.preventDefault();
    setCenterFormError("");

    if (
      !centerFormData.name ||
      !centerFormData.region ||
      !centerFormData.city ||
      !centerFormData.address
    ) {
      setCenterFormError("Name, region, city, and address are required.");
      return;
    }

    setCenterSaving(true);
    try {
      const centerPayload = {
        name: centerFormData.name,
        region: centerFormData.region,
        city: centerFormData.city,
        address: centerFormData.address,
        phone: centerFormData.phone || undefined,
        email: centerFormData.email || undefined,
        capacity: centerFormData.capacity
          ? parseInt(centerFormData.capacity, 10)
          : undefined,
        status: centerFormData.status,
      };

      if (centerFormData.managerEmail) {
        centerPayload.managerEmail = centerFormData.managerEmail;
      }
      if (centerFormData.managerPassword) {
        centerPayload.managerPassword = centerFormData.managerPassword;
      }

      await adminService.createCenter(centerPayload);
      setShowAddCenterModal(false);
      setSelectedRegion(null);
      resetCenterForm();
      await loadRegions();
    } catch (err) {
      setCenterFormError(
        err?.response?.data?.message || "Failed to create center.",
      );
    } finally {
      setCenterSaving(false);
    }
  };

  const handleEditRegionManager = (region) => {
    setSelectedRegionForManager(region);
    setShowRegionManagerModal(true);
  };

  const handleSaveRegionManager = async (data) => {
    // Store region manager data in local state (frontend only)
    setRegionManagers((prev) => ({
      ...prev,
      [data.region]: {
        managerEmail: data.managerEmail,
        managerPassword: data.managerPassword,
      },
    }));
    setSuccess(`Region manager for ${data.region} updated successfully!`);
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>🌍 Region Management</h2>
      </div>

      <div className="region-management-container">
        {/* Add Region Form */}
        <div className="add-region-card">
          <h3>Add New Region</h3>
          <form onSubmit={handleAddRegion} className="add-region-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

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
                      onClick={() => handleAddCenterClick(region)}
                    >
                      + Add Center
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleRegionDetailClick(region)}
                    >
                      Details
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEditRegionManager(region)}
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

      {selectedRegion && (
        <CenterFormModal
          isOpen={showAddCenterModal}
          title="➕ Create New Center"
          submitLabel="➕ Create Center"
          formData={centerFormData}
          setFormData={setCenterFormData}
          formError={centerFormError}
          saving={centerSaving}
          availableRegions={regions}
          loadingRegions={loading}
          statusOptions={["ACTIVE", "INACTIVE", "MAINTENANCE"]}
          showManagerFields={true}
          onClose={() => {
            setShowAddCenterModal(false);
            setSelectedRegion(null);
            resetCenterForm();
          }}
          onSubmit={handleCenterSubmit}
        />
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

      {showRegionDetailModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "900px" }}>
            <div className="modal-header">
              <h3>Region Details</h3>
              <button
                onClick={() => {
                  setShowRegionDetailModal(false);
                  setDetailRegion(null);
                  setDetailData(null);
                  setDetailError("");
                }}
              >
                ×
              </button>
            </div>

            {detailLoading ? (
              <div className="metrics-loading">Loading region details...</div>
            ) : detailError ? (
              <div className="alert alert-error">{detailError}</div>
            ) : detailData ? (
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
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{detailData.region}</td>
                      <td>
                        <span
                          className={`status ${detailData.status === "ACTIVE" ? "active" : detailData.status === "MAINTENANCE" ? "maintenance" : "inactive"}`}
                        >
                          {detailData.status}
                        </span>
                      </td>
                      <td>{detailData.adminEmail}</td>
                      <td>{detailData.totalCenters}</td>
                      <td>{detailData.activeCenters}</td>
                      <td>{detailData.totalAppointments}</td>
                      <td>{detailData.completion}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="metrics-empty">No detail data available.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RegionManagement;
