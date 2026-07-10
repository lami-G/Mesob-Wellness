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
  const [allCenters, setAllCenters] = useState([]); // Store all centers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [regions, setRegions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Client-side filtered centers
  const filteredCenters = allCenters.filter(center => {
    // Region filter
    if (filters?.region && center.region !== filters.region) return false;
    
    // Status filter
    if (filters?.status && center.status !== filters.status) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = center.name?.toLowerCase().includes(query);
      const matchRegion = center.region?.toLowerCase().includes(query);
      const matchCity = center.city?.toLowerCase().includes(query);
      if (!matchName && !matchRegion && !matchCity) return false;
    }
    
    return true;
  });

  // Paginated filtered centers
  const paginatedCenters = filteredCenters.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const totalPages = Math.ceil(filteredCenters.length / pagination.limit);

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
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchQuery]);

  // Fetch all centers only once on mount
  useEffect(() => {
    fetchAllCenters();
  }, []);

  const fetchAllCenters = async () => {
    try {
      setLoading(true);
      const result = await adminService.getCenters({
        limit: 10000, // Get all centers
      });
      setAllCenters(result.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load centers");
      console.error("Error fetching centers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

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
            
            {/* Status Filter */}
            <select
              value={filters?.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={styles.filterSelect}
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
                    status: '',
                    search: '',
                  });
                }
              }}
              className={styles.btnReset}
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
      
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Region</th>
              <th>City</th>
              <th>Status</th>
              <th>Staff</th>
              <th>Actions</th>
            </tr>
          </thead>
        <tbody>
          {paginatedCenters.length === 0 ? (
            <tr>
              <td colSpan="6" className={styles.tableEmpty}>
                {searchQuery || filters?.region || filters?.status
                  ? "No centers found matching the filters"
                  : "No centers found"}
              </td>
            </tr>
          ) : (
            paginatedCenters.map((center) => (
              <tr key={center.id}>
                <td className={styles.cellName}>{center.name}</td>
                <td className={styles.cellRegion}>{center.region}</td>
                <td className={styles.cellCity}>{center.city}</td>
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
          <div className={styles.paginationInfo}>
            <div>Page {pagination.page} of {totalPages}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {filteredCenters.length} centers
            </div>
          </div>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
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
