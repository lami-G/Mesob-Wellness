import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import styles from "./AuditLogs.module.css";

function AuditLogs({ baseFilters = {} }) {
  const [allLogs, setAllLogs] = useState([]); // Store all logs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [regions, setRegions] = useState([]);
  const [centers, setCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    region: "",
    center: "",
    action: "",
    resource: "",
    dateFrom: "",
    dateTo: "",
    role: "",
    ...baseFilters,
  });

  // Client-side filtered logs
  const filteredLogs = allLogs.filter(log => {
    // Region filter
    if (filters.region && log.center?.region !== filters.region) return false;
    
    // Center filter
    if (filters.center && log.centerId !== filters.center) return false;
    
    // Action filter
    if (filters.action && !log.action?.includes(filters.action)) return false;
    
    // Resource filter
    if (filters.resource && log.resource !== filters.resource) return false;
    
    // Role filter
    if (filters.role && log.user?.role !== filters.role) return false;
    
    // Date range filter
    if (filters.dateFrom) {
      const logDate = new Date(log.timestamp);
      const fromDate = new Date(filters.dateFrom);
      if (logDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const logDate = new Date(log.timestamp);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (logDate > toDate) return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchUser = log.user?.fullName?.toLowerCase().includes(query);
      const matchResource = log.resource?.toLowerCase().includes(query);
      const matchAction = log.action?.toLowerCase().includes(query);
      if (!matchUser && !matchResource && !matchAction) return false;
    }
    
    return true;
  });

  // Paginated filtered logs
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * 20,
    page * 20
  );

  const totalPages = Math.ceil(filteredLogs.length / 20);

  // Fetch all logs only once on mount
  useEffect(() => {
    fetchAllLogs();
  }, []);

  // Fetch regions on mount
  useEffect(() => {
    fetchRegions();
  }, []);

  // Fetch centers when region changes
  useEffect(() => {
    if (filters.region) {
      fetchCenters(filters.region);
    } else {
      setCenters([]);
    }
  }, [filters.region]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...baseFilters }));
  }, [JSON.stringify(baseFilters)]);

  const fetchAllLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAuditLogs({
        limit: 10000, // Get all logs
      });
      setAllLogs(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load audit logs");
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const data = await adminService.getRegions();
      setRegions(data);
    } catch (err) {
      console.error("Error fetching regions:", err);
    }
  };

  const fetchCenters = async (region) => {
    try {
      const data = await adminService.getCentersByRegion(region);
      setCenters(data);
    } catch (err) {
      console.error("Error fetching centers:", err);
      setCenters([]);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [field]: value };
      // Clear center filter when region changes
      if (field === 'region') {
        newFilters.center = '';
      }
      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      region: "",
      center: "",
      action: "",
      resource: "",
      dateFrom: "",
      dateTo: "",
      role: "",
      ...baseFilters,
    });
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
      <div className={styles.filters}>
        <select
          value={filters.region}
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
        <select
          value={filters.center}
          onChange={(e) => handleFilterChange('center', e.target.value)}
          className={styles.filterSelect}
          disabled={!filters.region}
        >
          <option value="">All Centers</option>
          {centers.map((center) => (
            <option key={center.id} value={center.id}>
              {center.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          placeholder="Date From"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          className={styles.filterInput}
        />
        <input
          type="date"
          placeholder="Date To"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          className={styles.filterInput}
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.filterInput}
        />
        <select
          value={filters.action}
          onChange={(e) => handleFilterChange('action', e.target.value)}
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
          value={filters.resource}
          onChange={(e) => handleFilterChange('resource', e.target.value)}
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
          value={filters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Roles</option>
          <option value="SYSTEM_ADMIN">System Admin</option>
          <option value="FEDERAL_OFFICE">Federal Office</option>
          <option value="REGIONAL_OFFICE">Regional Office</option>
          <option value="MANAGER">Manager</option>
          <option value="NURSE_OFFICER">Nurse Officer</option>
          <option value="STAFF">Staff</option>
          <option value="EXTERNAL_PATIENT">External Patient</option>
        </select>
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
          {paginatedLogs.map((log) => (
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

      {paginatedLogs.length === 0 && (
        <div className={styles.emptyState}>
          {searchQuery || Object.values(filters).some(v => v)
            ? "No audit logs found matching the filters"
            : "No audit logs found"}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className={styles.btnPrev}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages} ({filteredLogs.length} logs)
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className={styles.btnNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
