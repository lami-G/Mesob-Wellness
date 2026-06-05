import React, { useEffect, useState } from "react";
import FilterBar from "../../components/admin/FilterBar";
import AppointmentsList from "../../components/admin/AppointmentsList";
import { adminService } from "../../services/adminService";
import { Calendar } from "lucide-react";

function AppointmentManagement({ baseFilters = {} }) {
  const [filters, setFilters] = useState({ ...baseFilters });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...baseFilters }));
  }, [JSON.stringify(baseFilters)]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...baseFilters, ...newFilters });
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await adminService.deleteAppointment(appointmentId);
        alert("Appointment deleted successfully");
        setRefreshKey((prev) => prev + 1);
      } catch (err) {
        alert(
          "Failed to delete appointment: " +
            (err.response?.data?.message || err.message),
        );
      }
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2><Calendar size={24} /> Appointment Management</h2>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        showRegionFilter={true}
        showCenterFilter={true}
        showDateFilter={true}
        initialFilters={baseFilters}
      />

      <AppointmentsList
        key={refreshKey}
        filters={filters}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default AppointmentManagement;
