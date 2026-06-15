import React, { useEffect, useState } from "react";
import AppointmentsList from "./AppointmentsList";
import { adminService } from "../../../services/adminService";

function AppointmentManagement({ baseFilters = {} }) {
  const [filters, setFilters] = useState({ ...baseFilters });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...baseFilters }));
  }, [JSON.stringify(baseFilters)]);

  const handleFilterChange = (newFilters) => {
    // Calculate date range based on time period
    let processedFilters = { ...baseFilters, ...newFilters };
    
    if (newFilters.timePeriod) {
      const today = new Date();
      let dateFrom = null;
      let dateTo = null;

      switch (newFilters.timePeriod) {
        case "daily":
          // Today only
          dateFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          dateTo = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
          break;
        case "weekly":
          // Last 7 days
          dateFrom = new Date(today);
          dateFrom.setDate(today.getDate() - 7);
          dateTo = new Date();
          break;
        case "monthly":
          // Current month
          dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
          dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
          break;
        default:
          // All time - no date filters
          dateFrom = null;
          dateTo = null;
      }

      if (dateFrom && dateTo) {
        processedFilters.dateFrom = dateFrom.toISOString().split('T')[0];
        processedFilters.dateTo = dateTo.toISOString().split('T')[0];
      } else {
        // Clear date filters for "All Time"
        delete processedFilters.dateFrom;
        delete processedFilters.dateTo;
      }
    }
    
    setFilters(processedFilters);
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
      <AppointmentsList
        key={refreshKey}
        filters={filters}
        onDelete={handleDelete}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}

export default AppointmentManagement;
