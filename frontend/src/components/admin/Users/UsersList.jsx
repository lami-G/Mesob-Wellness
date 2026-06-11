import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import styles from "./UsersList.module.css";

function UsersList({ filters, onEdit, onDelete, onCreateClick, onFilterChange, showRegionFilter, showCenterFilter, showRoleFilter, initialFilters = {} }) {
  const [users, setUsers] = useState([]);
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
  };

  useEffect(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page, pagination.limit]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await adminService.getUsers({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setUsers(result.data || []);
      const nextPagination = result.pagination || {};
      setPagination((prev) => {
        if (
          prev.page === nextPagination.page &&
          prev.limit === nextPagination.limit &&
          prev.total === nextPagination.total &&
          prev.pages === nextPagination.pages
        ) {
          return prev;
        }
        return { ...prev, ...nextPagination };
      });
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

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminService.deleteUser(userId);
        setUsers(users.filter((u) => u.id !== userId));
      } catch (err) {
        alert(
          "Failed to delete user: " +
            (err.response?.data?.message || err.message),
        );
      }
    }
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
          <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {showRegionFilter && (
              <select
                value={filters?.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                style={{
                  padding: '0.375rem 0.625rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#374151',
                  cursor: 'pointer',
                }}
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
                style={{
                  padding: '0.375rem 0.625rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: filters?.region ? '#FFFFFF' : '#F3F4F6',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#374151',
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
                style={{
                  padding: '0.375rem 0.625rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#374151',
                  cursor: 'pointer',
                }}
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
              style={{
                padding: '0.375rem 0.625rem',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search users..."
              value={filters?.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{
                padding: '0.375rem 0.625rem',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                fontWeight: 500,
                fontSize: '0.8rem',
                color: '#374151',
                minWidth: '150px',
              }}
            />
            
            {/* Reset Button */}
            <button
              onClick={() => {
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
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#F3F4F6';
                e.target.style.borderColor = '#9CA3AF';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#FFFFFF';
                e.target.style.borderColor = '#D1D5DB';
              }}
            >
              Reset
            </button>
          </div>
        )}
        
        <button className={styles.btnPrimary} onClick={onCreateClick}>
          + Create User
        </button>
      </div>
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
          {users.length === 0 ? (
            <tr>
              <td colSpan="7" className={styles.tableEmpty}>
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
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
                    onClick={() => handleDelete(user.id)}
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
    </div>
  );
}

export default UsersList;
