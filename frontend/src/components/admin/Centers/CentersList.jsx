import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import clsx from "clsx";
import styles from "./CentersList.module.css";

function CentersList({ 
  filters, 
  onEdit, 
  onDelete, 
  allowDelete = true,
  onFilterChange,
  showRegionFilter,
  initialFilters = {},
  onCreateClick
}) {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [regions, setRegions] = useState([]);

  // Load regions for filter
  useEffect(() => {
    if (showRegionFilter) {
      adminService.getRegions().then(data => setRegions(data || [])).catch(err => console.error(err));
    }
  }, [showRegionFilter]);

  const handleFilterChange = (field, value) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  useEffect(() => {
    fetchCenters();
  }, [filters, pagination.page]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const result = await adminService.getCenters({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      console.log('Centers API Response:', result); // Debug log
      setCenters(result.data || []);
      // Preserve limit when updating pagination
      setPagination(prev => ({
        ...prev,
        ...(result.pagination || {}),
        limit: prev.limit, // Keep the limit from state
      }));
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load centers");
      console.error("Error fetching centers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  useEffect(() => {
    // Reset to page 1 when filters change
    if (pagination.page !== 1) {
      setPagination({ ...pagination, page: 1 });
    }
  }, [JSON.stringify(filters)]);

  if (loading) {
    return <div className={styles.tableLoading}>Loading centers...</div>;
  }

  if (error) {
    return <div className={styles.tableError}>Error: {error}</div>;
  }

  return (
    <div className={styles.tableContainer}>
      {/* Header with inline filters and Add Center button */}
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
              <option value="MAINTENANCE">Maintenance</option>
            </select>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search centers..."
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
                    status: '',
                    search: '',
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
        
        {onCreateClick && (
          <button className={styles.btnPrimary} onClick={onCreateClick}>
            + Add Center
          </button>
        )}
      </div>
      
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Region</th>
            <th>City</th>
            <th>Admin Email</th>
            <th>Status</th>
            <th>Staff</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {centers.length === 0 ? (
            <tr>
              <td colSpan="7" className={styles.tableEmpty}>
                No centers found
              </td>
            </tr>
          ) : (
            centers.map((center) => (
              <tr key={center.id}>
                <td className={styles.cellName}>{center.name}</td>
                <td className={styles.cellRegion}>{center.region}</td>
                <td className={styles.cellCity}>{center.city}</td>
                <td className={styles.cellEmail}>{center.managerEmail || "-"}</td>
                <td className={styles.cellStatus}>
                  <span className={clsx(styles.status, styles[`status${center.status.charAt(0).toUpperCase() + center.status.slice(1).toLowerCase()}`])}>
                    {center.status}
                  </span>
                </td>
                <td className={styles.cellCount}>{center._count?.staff || 0}</td>
                <td className={styles.cellActions}>
                  <button
                    className={clsx(styles.btnIcon, styles.btnIconEdit)}
                    onClick={() => onEdit(center)}
                    title="Edit"
                  >
                    ✎
                  </button>
                  {allowDelete && (
                    <button
                      className={clsx(styles.btnIcon, styles.btnIconDelete)}
                      onClick={() => onDelete(center.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination.total > 0 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || pagination.pages <= 1}
            className={styles.btnPagination}
          >
            ← Previous
          </button>
          <div className={styles.paginationInfo}>
            <div>Page {pagination.page} of {pagination.pages || 1}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {pagination.total} total centers
            </div>
          </div>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= (pagination.pages || 1)}
            className={styles.btnPagination}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default CentersList;
