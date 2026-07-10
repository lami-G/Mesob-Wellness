import React, { useState } from 'react';
import { regionalService } from '../../../services/regionalService';
import Button from '../../forms/Button';
import CenterFormModal from '../../admin/Centers/CenterFormModal';

const Centers = ({ loading, centers, selectedCenter, onRefresh }) => {
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [showModal, setShowModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [availableRegions, setAvailableRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'ACTIVE', 'INACTIVE'

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    region: "",
    city: "",
    address: "",
    capacity: "",
    phone: "",
    email: "",
    status: "ACTIVE",
  });

  if (loading)
    return (
      <div className="mgr-loading">
        <div className="mgr-spinner" />
        Loading centers…
      </div>
    );

  // Filter and search centers
  const filteredCenters = centers.filter((center) => {
    // Status filter
    if (filterStatus !== "all" && center.status !== filterStatus) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        center.name?.toLowerCase().includes(query) ||
        center.code?.toLowerCase().includes(query) ||
        center.city?.toLowerCase().includes(query) ||
        center.region?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const sortedCenters = [...filteredCenters].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case "name":
        aVal = a.name || "";
        bVal = b.name || "";
        break;
      case "staff":
        aVal = a._count?.staff || 0;
        bVal = b._count?.staff || 0;
        break;
      case "capacity":
        aVal = a.capacity || 0;
        bVal = b.capacity || 0;
        break;
      case "status":
        aVal = a.status || "";
        bVal = b.status || "";
        break;
      default:
        return 0;
    }
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleCreateCenter = () => {
    setEditingCenter(null);
    setFormData({
      name: "",
      code: "",
      region: "",
      city: "",
      address: "",
      capacity: "",
      phone: "",
      email: "",
      status: "ACTIVE",
    });
    loadRegions(); // Load regions when opening modal
    setShowModal(true);
  };

  const handleEditCenter = (center) => {
    setEditingCenter(center);
    setFormData({
      name: center.name || "",
      code: center.code || "",
      region: center.region || "",
      city: center.city || "",
      address: center.address || "",
      capacity: center.capacity || "",
      phone: center.phone || "",
      email: center.email || "",
      status: center.status || "ACTIVE",
    });
    loadRegions(); // Load regions when opening modal
    setShowModal(true);
  };

  // Load available regions from admin
  const loadRegions = async () => {
    try {
      setLoadingRegions(true);
      const regionsData = await regionalService.getRegions();
      const regions = regionsData?.data || regionsData || [];
      setAvailableRegions(regions);
    } catch (error) {
      console.error("Error loading regions:", error);
      setFormError("Failed to load regions. Please try again.");
      setAvailableRegions([]);
    } finally {
      setLoadingRegions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !formData.name ||
      !formData.code ||
      !formData.region ||
      !formData.city ||
      !formData.address
    ) {
      setFormError("Name, code, region, city, and address are required.");
      return;
    }

    setSaving(true);
    try {
      const centerData = {
        name: formData.name,
        code: formData.code,
        region: formData.region,
        city: formData.city,
        address: formData.address,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      };

      if (editingCenter) {
        // Update existing center
        await regionalService.updateCenter(editingCenter.id, {
          ...centerData,
          status: formData.status,
        });
      } else {
        // Create new center
        await regionalService.createCenter(centerData);
      }

      setShowModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to save center.");
      console.error("Center save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCenter(null);
    setFormData({
      name: "",
      code: "",
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
    setFormError("");
  };

  return (
    <div className="users-content">
      <div className="users-header">
        <div>
          <h3>Health Centers Directory ({centers.length} centers)</h3>
          <div
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              marginTop: "0.25rem",
            }}
          >
            {selectedCenter !== "all" && `📍 ${centers[0]?.name}`}
            {selectedCenter === "all" && "🏥 All Centers"}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={`tab-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            style={{ padding: "0.5rem 1rem" }}
          >
            📋 Table
          </button>
          <button
            className={`tab-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            style={{ padding: "0.5rem 1rem" }}
          >
            🎛️ Grid
          </button>
          <Button onClick={handleCreateCenter}>+ Create Center</Button>
        </div>
      </div>

      {centers.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#6c757d" }}>
          No centers found. Create one to get started.
        </div>
      ) : viewMode === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
            padding: "1rem 0",
          }}
        >
          {sortedCenters.map((center) => (
            <div
              key={center.id}
              style={{
                background: "linear-gradient(135deg, #4c6fbe 0%, #5b7fd6 100%)",
                padding: "1.5rem",
                borderRadius: "16px",
                color: "white",
                boxShadow: "0 8px 24px rgba(76, 111, 190, 0.3)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 32px rgba(76, 111, 190, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(76, 111, 190, 0.3)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {center.name}
                  </div>
                  <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                    <div>
                      📍 {center.city}, {center.region}
                    </div>
                    <div style={{ marginTop: "0.25rem" }}>
                      <code
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                        }}
                      >
                        {center.code}
                      </code>
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background:
                      center.status === "ACTIVE"
                        ? "rgba(34, 197, 94, 0.3)"
                        : "rgba(239, 68, 68, 0.3)",
                    border:
                      center.status === "ACTIVE"
                        ? "2px solid #22c55e"
                        : "2px solid #ef4444",
                  }}
                >
                  {center.status}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <div>
                  <div style={{ fontSize: "2rem", fontWeight: 800 }}>
                    {center._count?.staff || 0}
                  </div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                    👥 Staff Members
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "2rem", fontWeight: 800 }}>
                    {center.capacity || 0}
                  </div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                    📊 Daily Capacity
                  </div>
                </div>
              </div>

              {(center.phone || center.email) && (
                <div
                  style={{
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                    fontSize: "0.85rem",
                    opacity: 0.9,
                  }}
                >
                  {center.phone && <div>📞 {center.phone}</div>}
                  {center.email && (
                    <div style={{ marginTop: "0.25rem" }}>
                      📧 {center.email}
                    </div>
                  )}
                </div>
              )}

              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCenter(center);
                  }}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  ✏️ Edit Center
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="users-table">
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table>
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Center Name{" "}
                    {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Code</th>
                  <th>Region</th>
                  <th>City</th>
                  <th
                    onClick={() => handleSort("staff")}
                    style={{ cursor: "pointer" }}
                  >
                    Staff{" "}
                    {sortBy === "staff" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("capacity")}
                    style={{ cursor: "pointer" }}
                  >
                    Capacity{" "}
                  {sortBy === "capacity" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("status")}
                  style={{ cursor: "pointer" }}
                >
                  Status{" "}
                  {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCenters.map((center) => (
                <tr key={center.id}>
                  <td style={{ fontWeight: 600 }}>{center.name}</td>
                  <td>
                    <code
                      style={{
                        background: "#f3f4f6",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                      }}
                    >
                      {center.code}
                    </code>
                  </td>
                  <td>{center.region}</td>
                  <td>{center.city}</td>
                  <td style={{ fontWeight: 700, color: "#2563eb" }}>
                    {center._count?.staff || 0}
                  </td>
                  <td style={{ fontWeight: 700, color: "#22c55e" }}>
                    {center.capacity || "—"}
                  </td>
                  <td>
                    <span
                      className={`status ${center.status === "ACTIVE" ? "active" : "inactive"}`}
                    >
                      {center.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>
                    {center.phone && <div>📞 {center.phone}</div>}
                    {center.email && <div>📧 {center.email}</div>}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        size="small"
                        onClick={() => handleEditCenter(center)}
                        style={{
                          background: "#3b82f6",
                          color: "white",
                          border: "none",
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: "0 2px 4px rgba(59,130,246,0.3)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#2563eb";
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow =
                            "0 4px 8px rgba(59,130,246,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#3b82f6";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 2px 4px rgba(59,130,246,0.3)";
                        }}
                      >
                        ✏️ Edit
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

      <CenterFormModal
        isOpen={showModal}
        title={editingCenter ? "✏️ Edit Center" : "➕ Create New Center"}
        submitLabel={editingCenter ? "💾 Update Center" : "➕ Create Center"}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        saving={saving}
        availableRegions={availableRegions}
        loadingRegions={loadingRegions}
        statusOptions={["ACTIVE", "INACTIVE"]}
        showManagerFields={!editingCenter}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Centers;
