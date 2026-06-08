import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import styles from "./AuditLogs.module.css";

function AuditLogs({ baseFilters = {} }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    region: "",
    center: "",
    action: "",
    resource: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    role: "",
    ...baseFilters,
  });

  useEffect(() => {
    fetchLogs();
  }, [page, JSON.stringify(filters)]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...baseFilters }));
  }, [JSON.stringify(baseFilters)]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAuditLogs({
        ...filters,
        page,
        limit: 20,
      });
      setLogs(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load audit logs");
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      region: "",
      center: "",
      action: "",
      resource: "",
      dateFrom: "",
      dateTo: "",
      search: "",
      role: "",
      ...baseFilters,
    });
    setPage(1);
  };

  const getActionColor = (action) => {
    if (action?.includes("CREATE")) return styles.badgeCreate;
    if (action?.includes("UPDATE")) return styles.badgeUpdate;
    if (action?.includes("DELETE")) return styles.badgeDelete;
    if (action?.includes("LOGIN")) return styles.badgeLogin;
    return styles.badgeDefault;
  };

  if (loading) return <div className={styles.loading}>Loading audit logs...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.auditLogsPage}>
      <div className={styles.pageHeader}>
        <h1>Audit Logs</h1>
        <p>Track all system activities and changes</p>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          name="search"
          placeholder="Search by user or resource..."
          value={filters.search}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <select
          name="action"
          value={filters.action}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
        </select>
        <select
          name="resource"
          value={filters.resource}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">All Resources</option>
          <option value="USER">User</option>
          <option value="CENTER">Center</option>
          <option value="APPOINTMENT">Appointment</option>
          <option value="VITAL">Vital</option>
          <option value="FEEDBACK">Feedback</option>
        </select>
        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">All Roles</option>
          <option value="SYSTEM_ADMIN">System Admin</option>
          <option value="REGIONAL_MANAGER">Regional Manager</option>
          <option value="CENTER_MANAGER">Center Manager</option>
          <option value="NURSE">Nurse</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="STAFF">Staff</option>
          <option value="EXTERNAL_PATIENT">External Patient</option>
        </select>
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <button onClick={handleResetFilters} className={styles.btnReset}>
          Reset
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Role</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Details</th>
            <th>IP Address</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.user?.fullName || "System"}</td>
              <td>{log.user?.role || "-"}</td>
              <td>
                <span
                  className={`${styles.badge} ${styles.badgeAction} ${getActionColor(log.action)}`}
                >
                  {log.action || "-"}
                </span>
              </td>
              <td>{log.resource || "-"}</td>
              <td className={styles.truncate}>
                {log.details
                  ? JSON.stringify(log.details).substring(0, 50)
                  : "-"}
                ...
              </td>
              <td className={styles.monospace}>{log.ipAddress || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {logs.length === 0 && (
        <div className={styles.emptyState}>No audit logs found</div>
      )}

      <div className={styles.pagination}>
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className={styles.btnPrev}
        >
          Previous
        </button>
        <span className={styles.pageInfo}>Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={logs.length < 20}
          className={styles.btnNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AuditLogs;
