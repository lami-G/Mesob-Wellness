import React, { useState, useEffect } from "react";
import clsx from "clsx";
import api from "../../../services/api";
import styles from "./MyAppointments.module.css";

const normalizeAppointments = (items) => {
  if (!Array.isArray(items)) return [];

  return items.map((appointment) => ({
    ...appointment,
    status:
      typeof appointment.status === "string"
        ? appointment.status.toUpperCase()
        : appointment.status,
  }));
};

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointments();

    const onAppointmentsUpdated = (event) => {
      const incoming = normalizeAppointments([event?.detail?.appointment])[0];

      if (incoming && incoming.id) {
        setAppointments((prev) => {
          const exists = prev.some((item) => item.id === incoming.id);
          if (exists) {
            return prev.map((item) =>
              item.id === incoming.id ? incoming : item,
            );
          }
          return [...prev, incoming];
        });
      }

      // Keep a refetch as fallback to stay in sync with server truth.
      fetchAppointments();
    };

    window.addEventListener("appointments-updated", onAppointmentsUpdated);
    return () => {
      window.removeEventListener("appointments-updated", onAppointmentsUpdated);
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/v1/appointments");
      const data = response.data.data;

      // Handle both array and object responses
      let appointmentsList = [];
      if (Array.isArray(data)) {
        appointmentsList = data;
      } else if (
        data &&
        data.appointments &&
        Array.isArray(data.appointments)
      ) {
        appointmentsList = data.appointments;
      }

      setAppointments(normalizeAppointments(appointmentsList));
      setError("");
    } catch (err) {
      setAppointments([]);
      setError("Failed to load appointments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: styles.statusPending,
      CONFIRMED: styles.statusConfirmed,
      IN_PROGRESS: styles.statusInProgress,
      COMPLETED: styles.statusCompleted,
      CANCELLED: styles.statusCancelled,
    };
    return colors[status] || styles.statusPending;
  };

  const generateQRCode = (appointmentId) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${appointmentId}`;
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    try {
      await api.patch(`/api/v1/appointments/${appointmentId}`, {
        status: "CANCELLED",
      });
      fetchAppointments();
    } catch (err) {
      setError("Failed to cancel appointment");
    }
  };

  const handleSendReminder = async (appointmentId) => {
    try {
      await api.post(`/api/v1/appointments/${appointmentId}/send-reminder`);
      alert("✅ SMS reminder sent successfully!");
    } catch (err) {
      alert("❌ Failed to send SMS reminder");
      console.error(err);
    }
  };

  const openCancelModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setCancellationReason("");
    setShowCancelModal(true);
    // Auto-scroll to modal after a brief delay to ensure it's rendered
    setTimeout(() => {
      const modal = document.querySelector(`.${styles.modalOverlay}`);
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
      setError("");
      closeCancelModal();
      fetchAppointments();
      alert("✅ Appointment cancelled successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel appointment");
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true;
    if (filter === "CONFIRMED") {
      // Upcoming = all appointments that are not completed or cancelled
      return apt.status !== "COMPLETED" && apt.status !== "CANCELLED";
    }
    return apt.status === filter;
  });

  return (
    <div className={clsx('card', styles.myAppointments)}>
      <h2>📋 My Appointments</h2>

      {error && <div className={clsx(styles.alert, styles.alertError)}>{error}</div>}

      <div className={styles.filterTabs}>
        <button
          className={clsx(styles.filterBtn, { [styles.active]: filter === "all" })}
          onClick={() => setFilter("all")}
        >
          All ({appointments.length})
        </button>
        <button
          className={clsx(styles.filterBtn, { [styles.active]: filter === "CONFIRMED" })}
          onClick={() => setFilter("CONFIRMED")}
        >
          Upcoming
        </button>
        <button
          className={clsx(styles.filterBtn, { [styles.active]: filter === "COMPLETED" })}
          onClick={() => setFilter("COMPLETED")}
        >
          Completed
        </button>
        <button
          className={clsx(styles.filterBtn, { [styles.active]: filter === "CANCELLED" })}
          onClick={() => setFilter("CANCELLED")}
        >
          Cancelled
        </button>
      </div>

      {loading ? (
        <p className={styles.loadingText}>Loading appointments...</p>
      ) : filteredAppointments.length === 0 ? (
        <p className={styles.emptyText}>No appointments found</p>
      ) : (
        <div className={styles.appointmentsList}>
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className={styles.appointmentCard}>
              <div className={styles.appointmentHeader}>
                <div className={styles.appointmentDate}>
                  <span className={styles.dateLabel}>
                    {new Date(apt.scheduledAt).toLocaleDateString()}
                  </span>
                  <span className={styles.timeLabel}>
                    {new Date(apt.scheduledAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className={styles.appointmentStatusSection}>
                  <span className={clsx(styles.statusBadge, getStatusColor(apt.status))}>
                    {apt.status}
                  </span>
                  {(apt.status === "CONFIRMED" || apt.status === "WAITING" || apt.status === "IN_PROGRESS") && (
                    <button
                      className={clsx('btn', styles.btnCancelSmall)}
                      onClick={() => openCancelModal(apt.id)}
                      title="Cancel this appointment"
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.appointmentBody}>
                <div className={styles.appointmentInfo}>
                  <p>
                    <strong>Reason:</strong> {apt.reason}
                  </p>
                  <p>
                    <strong>Appointment ID:</strong> {apt.id}
                  </p>
                  {apt.diagnosis && (
                    <p>
                      <strong>Diagnosis:</strong> {apt.diagnosis}
                    </p>
                  )}
                  {apt.prescription && (
                    <p>
                      <strong>Prescription:</strong> {apt.prescription}
                    </p>
                  )}
                </div>

                {apt.status === "CONFIRMED" && (
                  <div className={styles.qrCodeSection}>
                    <p className={styles.qrLabel}>
                      Digital Ticket (Show at check-in)
                    </p>
                    <img
                      src={generateQRCode(apt.id)}
                      alt="QR Code"
                      className={styles.qrCode}
                    />
                  </div>
                )}
              </div>

              <div className={styles.appointmentFooter}>
                {apt.status === "CONFIRMED" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSendReminder(apt.id)}
                  >
                    📱 Send SMS Reminder
                  </button>
                )}
              </div>
            </div>
          ))}
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
                className="btn btn-secondary"
                onClick={closeCancelModal}
                disabled={cancelling}
              >
                Keep Appointment
              </button>
              <button
                className="btn btn-danger"
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

export default MyAppointments;
