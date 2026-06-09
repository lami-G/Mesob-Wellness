import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import api from "../../../services/api";
import clsx from "clsx";
import styles from "./AppointmentsList.module.css";

function AppointmentsList({ filters, onDelete }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

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
