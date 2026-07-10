import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import styles from "./UsersList.module.css";

function UsersList({ filters, onEdit, onDelete, onCreateClick, onFilterChange, showRegionFilter, showCenterFilter, showRoleFilter, initialFilters = {} }) {
  const [allUsers, setAllUsers] = useState([]); // Store all users
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [regions, setRegions] = useState([]);
  const [centers, setCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Client-side filtered users
  const filteredUsers = allUsers.filter(user => {
    // Region filter
    if (filters?.region && user.center?.region !== filters.region) return false;
    
    // Center filter
    if (filters?.center && user.centerId !== filters.center) return false;
    
    // Role filter
    if (filters?.role && user.roleId !== filters.role) return false;
    
    // Status filter
    if (filters?.status && user.status !== filters.status) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = user.fullName?.toLowerCase().includes(query);
      const matchEmail = user.email?.toLowerCase().includes(query);
      const matchId = user.userId?.toLowerCase().includes(query);
      if (!matchName && !matchEmail && !matchId) return false;
    }
    
    return true;
  });

  // Paginated filtered users
  const paginatedUsers = filteredUsers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const totalPages = Math.ceil(filteredUsers.length / pagination.limit);

  // Load regions and centers for filters
  useEffect(() => {
    if (showRegionFilter) {
      adminService.getRegions().then(data => setRegions(data || [])).catch(err => console.error(err));
    }
  }, [showRegionFilter]);

  useEffect(() => {
    if (filters?.region && showCenterFilter) {
      adminService.getCentersByRegion(filters.region).then(data => setCenters(data || [])).catch(err => console.error(err));
    } else {
      setCenters([]);
    }
  }, [filters?.region, showCenterFilter]);

  const handleFilterChange = (field, value) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [field]: value });
    }
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchQuery]);

  // Fetch all users only once on mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const result = await adminService.getUsers({
        limit: 10000, // Get all users
      });
      setAllUsers(result.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return <div className={styles.tableLoading}>Loading users...</div>;
  }

  if (error) {
    return <div className={styles.tableError}>Error: {error}</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        {/* Inline Filters */}
        {onFilterChange && (
          <div className={styles.filterContainer}>
            {showRegionFilter && (
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
            )}
            
            {showCenterFilter && (
              <select
                value={filters?.center || ''}
                onChange={(e) => handleFilterChange('center', e.target.value)}
                disabled={!filters?.region}
                className={styles.filterSelect}
                style={{
                  backgroundColor: filters?.region ? '#FFFFFF' : '#F3F4F6',
                  cursor: filters?.region ? 'pointer' : 'not-allowed',
                }}
              >
                <option value="">All Centers</option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            )}
            
            {showRoleFilter && (
              <select
                value={filters?.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All Roles</option>
                <option value="SYSTEM_ADMIN">System Admin</option>
                <option value="REGIONAL_OFFICE">Regional Office</option>
                <option value="FEDERAL_OFFICE">Federal Office</option>
                <option value="MANAGER">Manager</option>
                <option value="NURSE_OFFICER">Nurse Officer</option>
                <option value="STAFF">Staff</option>
                <option value="EXTERNAL_PATIENT">External Patient</option>
              </select>
            )}
            
            {/* Status Filter */}
            <select
              value={filters?.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.filterInput}
            />
            
            {/* Reset Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                if (onFilterChange) {
                  onFilterChange({
                    region: '',
                    center: '',
                    role: '',
                    status: '',
                    search: '',
                    dateFrom: '',
                    dateTo: '',
                  });
                }
              }}
              className={styles.btnReset}
            >
              Reset
            </button>
          </div>
        )}
        
        <button className={styles.btnPrimary} onClick={onCreateClick}>
          + Create User
        </button>
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
        <tbody>
          {paginatedUsers.length === 0 ? (
            <tr>
              <td colSpan="7" className={styles.tableEmpty}>
                {searchQuery || filters?.region || filters?.center || filters?.role || filters?.status
                  ? "No users found matching the filters"
                  : "No users found"}
              </td>
            </tr>
          ) : (
            paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td className={styles.cellId}>{user.userId || "N/A"}</td>
                <td className={styles.cellName}>{user.fullName}</td>
                <td className={styles.cellEmail}>{user.email || "N/A"}</td>
                <td className={styles.cellRole}>
                  <span className={`${styles.badge} ${styles[`badge${user.role.replace(/_/g, '')}`]}`}>
                    {user.role}
                  </span>
                </td>
                <td className={styles.cellStatus}>
                  <span
                    className={`${styles.status} ${user.isActive ? styles.statusActive : styles.statusInactive}`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className={styles.cellVerified}>
                  <span
                    className={`${styles.badge} ${user.isVerified ? styles.badgeVerified : styles.badgeUnverified}`}
                  >
                    {user.isVerified ? "✓" : "✗"}
                  </span>
                </td>
                <td className={styles.cellActions}>
                  <button
                    className={`${styles.btnIcon} ${styles.btnIconEdit}`}
                    onClick={() => onEdit(user)}
                    title="Edit user"
                  >
                    ✎
                  </button>
                  <button
                    className={`${styles.btnIcon} ${styles.btnIconDelete}`}
                    onClick={() => onDelete(user.id)}
                    title="Delete user"
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

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={styles.btnPagination}
          >
            ← Previous
          </button>
          <span className={styles.paginationInfo}>
            Page {pagination.page} of {totalPages} ({filteredUsers.length} users)
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === totalPages}
            className={styles.btnPagination}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default UsersList;
