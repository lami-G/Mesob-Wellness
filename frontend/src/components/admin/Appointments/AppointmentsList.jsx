import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import api from "../../../services/api";
import clsx from "clsx";
import styles from "./AppointmentsList.module.css";

function AppointmentsList({ filters, onDelete, onFilterChange }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [regions, setRegions] = useState([]);
  const [centers, setCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load regions for filter
  useEffect(() => {
    adminService.getRegions().then(data => setRegions(data || [])).catch(err => console.error(err));
  }, []);

  // Load centers when region changes
  useEffect(() => {
    if (filters?.region) {
      adminService.getCentersByRegion(filters.region).then(data => setCenters(data || [])).catch(err => console.error(err));
    } else {
      setCenters([]);
    }
  }, [filters?.region]);

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAppointments({ ...filters, page: pagination.page, limit: pagination.limit });
      setAppointments(result.data || []);
      setPagination(result.pagination || {});
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load appointments");
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    if (onFilterChange) {
      onFilterChange({
        region: '',
        center: '',
        status: '',
        timePeriod: 'all',
        dateFrom: '',
        dateTo: '',
      });
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString();
  };

  const openCancelModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setCancellationReason("");
    setShowCancelModal(true);
    // Auto-scroll to modal after a brief delay to ensure it's rendered
    setTimeout(() => {
      const modal = document.querySelector(".modal-overlay");
      if (modal) {
        modal.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedAppointmentId(null);
    setCancellationReason("");
  };

  const confirmCancelAppointment = async () => {
    if (!cancellationReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    try {
      setCancelling(true);
      await api.delete(`/api/v1/appointments/${selectedAppointmentId}/cancel`, {
        data: {
          cancellationReason,
        },
      });
      closeCancelModal();
      fetchAppointments();
      alert("✅ Appointment cancelled successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel appointment");
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className={styles.tableLoading}>Loading appointments...</div>;
  }

  if (error) {
    return <div className={styles.tableError}>Error: {error}</div>;
  }

  return (
    <div className={styles.tableContainer}>
      {/* Header with inline filters */}
      <div className={styles.tableHeader}>
        {onFilterChange && (
          <div className={styles.filterContainer}>
            {/* Time Period Filter */}
            <select
              value={filters?.timePeriod || 'all'}
              onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            {/* Region Filter */}
            <select
              value={filters?.region || ''}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            {/* Center Filter */}
            <select
              value={filters?.center || ''}
              onChange={(e) => handleFilterChange('center', e.target.value)}
              disabled={!filters?.region}
              className={styles.filterSelect}
            >
              <option value="">All Centers</option>
              {centers.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters?.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="WAITING">Waiting</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_SERVICE">In Service</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.filterInput}
            />

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className={styles.btnReset}
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Patient</th>
              <th>Reason</th>
              <th>Scheduled</th>
              <th>Status</th>
              <th>Center</th>
              <th>Region</th>
              <th>Actions</th>
            </tr>
          </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan="8" className={styles.tableEmpty}>No appointments found</td>
            </tr>
          ) : (
            appointments.map((apt) => (
              <tr key={apt.id}>
                <td className={styles.cellId}>{apt.user?.userId || "N/A"}</td>
                <td className={styles.cellName}>{apt.user?.fullName || "N/A"}</td>
                <td className={styles.cellReason}>{apt.reason}</td>
                <td className={styles.cellDate}>{formatDate(apt.scheduledAt)}</td>
                <td className={styles.cellStatus}>
                  <span className={clsx(styles.status, styles[`status${apt.status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join('')}`])}>
                    {apt.status}
                  </span>
                </td>
                <td className={styles.cellCenter}>{apt.user?.center?.name || "N/A"}</td>
                <td className={styles.cellRegion}>{apt.user?.center?.region || "N/A"}</td>
                <td className={styles.cellActions}>
                  {(apt.status === "WAITING" || apt.status === "CONFIRMED" || apt.status === "IN_PROGRESS" || apt.status === "IN_SERVICE") && (
                    <button 
                      className={clsx(styles.btnIcon, styles.btnIconCancel)}
                      onClick={() => openCancelModal(apt.id)}
                      title="Cancel Appointment"
                    >
                      ❌
                    </button>
                  )}
                  <button 
                    className={clsx(styles.btnIcon, styles.btnIconDelete)}
                    onClick={() => onDelete(apt.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={styles.btnPagination}
          >
            ← Previous
          </button>
          <span className={styles.paginationInfo}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className={styles.btnPagination}
          >
            Next →
          </button>
        </div>
      )}

      {showCancelModal && (
        <div className={styles.modalOverlay} onClick={closeCancelModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Cancel Appointment</h3>
              <button className={styles.modalClose} onClick={closeCancelModal}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Please provide a reason for cancelling this appointment:</p>
              <textarea
                className={styles.cancelReasonInput}
                placeholder="e.g., Staff unavailable, Schedule conflict, etc."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows="4"
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                className={clsx(styles.btn, styles.btnSecondary)}
                onClick={closeCancelModal}
                disabled={cancelling}
              >
                Keep Appointment
              </button>
              <button
                className={clsx(styles.btn, styles.btnDanger)}
                onClick={confirmCancelAppointment}
                disabled={cancelling || !cancellationReason.trim()}
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsList;
