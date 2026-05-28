import React, { useEffect, useState } from "react";
import FilterBar from "../../components/admin/FilterBar";
import CentersList from "../../components/admin/CentersList";
import CenterFormModal from "../../components/admin/CenterFormModal";
import { adminService } from "../../services/adminService";

function CenterManagement({ baseFilters = {}, allowDelete = true }) {
  const [filters, setFilters] = useState({ ...baseFilters });
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoadingRegions(true);
      const data = await adminService.getRegions();
      setRegions(data || []);
    } catch (err) {
      console.error("Error loading regions:", err);
    } finally {
      setLoadingRegions(false);
    }
  };

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...baseFilters }));
  }, [baseFilters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...baseFilters, ...newFilters });
  };

  const resetForm = () => {
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

  const handleCreate = () => {
    setSelectedCenter(null);
    resetForm();
    loadRegions();
    setShowModal(true);
  };

  const handleEdit = (center) => {
    setSelectedCenter(center);
    setFormData({
      name: center.name || "",
      code: center.code || "",
      region: center.region || "",
      city: center.city || "",
      address: center.address || "",
      capacity: center.capacity || "",
      phone: center.phone || "",
      email: center.email || "",
      managerEmail: center.managerEmail || "",
      managerPassword: "",
      status: center.status || "ACTIVE",
    });
    loadRegions();
    setShowModal(true);
  };

  const handleDelete = async (centerId) => {
    if (window.confirm("Are you sure you want to delete this center?")) {
      try {
        await adminService.deleteCenter(centerId);
        alert("Center deleted successfully");
        setRefreshKey((prev) => prev + 1);
      } catch (err) {
        alert(
          "Failed to delete center: " +
            (err.response?.data?.message || err.message),
        );
      }
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
      const centerPayload = {
        name: formData.name,
        code: formData.code,
        region: formData.region,
        city: formData.city,
        address: formData.address,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        capacity: formData.capacity
          ? parseInt(formData.capacity, 10)
          : undefined,
        status: formData.status,
      };

      // Add manager fields if provided
      if (formData.managerEmail) {
        centerPayload.managerEmail = formData.managerEmail;
      }
      if (formData.managerPassword) {
        centerPayload.managerPassword = formData.managerPassword;
      }

      if (selectedCenter) {
        await adminService.updateCenter(selectedCenter.id, centerPayload);
      } else {
        await adminService.createCenter(centerPayload);
      }

      setShowModal(false);
      resetForm();
      setRefreshKey((prev) => prev + 1);
      loadRegions();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to save center.");
      console.error("Center save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCenter(null);
    resetForm();
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>🏥 Center Management</h2>
        <button className="btn-primary" onClick={handleCreate}>
          + Add Center
        </button>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        showRegionFilter={true}
        showCenterFilter={false}
        initialFilters={baseFilters}
      />

      <CentersList
        key={refreshKey}
        filters={filters}
        onEdit={handleEdit}
        onDelete={handleDelete}
        allowDelete={allowDelete}
      />

      <CenterFormModal
        isOpen={showModal}
        title={selectedCenter ? "✏️ Edit Center" : "➕ Create New Center"}
        submitLabel={selectedCenter ? "💾 Update Center" : "➕ Create Center"}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        saving={saving}
        availableRegions={regions}
        loadingRegions={loadingRegions}
        statusOptions={["ACTIVE", "INACTIVE", "MAINTENANCE"]}
        showManagerFields={true}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default CenterManagement;
