import React, { useState, useEffect, useRef } from "react";
import { adminService } from "../../services/adminService";
import styles from "./FilterBar.module.css";

const normalizeFilters = (filters = {}) => ({
  region: filters.region || "",
  center: filters.center || "",
  search: filters.search || "",
  dateFrom: filters.dateFrom || "",
  dateTo: filters.dateTo || "",
  role: filters.role || "",
});

const areFiltersEqual = (left = {}, right = {}) => {
  const leftNormalized = normalizeFilters(left);
  const rightNormalized = normalizeFilters(right);
  return Object.keys(leftNormalized).every(
    (key) => leftNormalized[key] === rightNormalized[key],
  );
};

function FilterBar({
  onFilterChange,
  showRegionFilter = true,
  showCenterFilter = true,
  showDateFilter = false,
  showRoleFilter = false,
  initialFilters = {},
}) {
  const [filters, setFilters] = useState({
    ...normalizeFilters(initialFilters),
  });

  const lastInitialFilters = useRef(normalizeFilters(initialFilters));

  const [regions, setRegions] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(false);

  // Load regions on mount
  useEffect(() => {
    loadRegions();
  }, []);

  // Load centers when region changes
  useEffect(() => {
    if (filters.region) {
      loadCenters(filters.region);
    } else {
      setCenters([]);
    }
  }, [filters.region]);

  useEffect(() => {
    const nextFilters = normalizeFilters(initialFilters);
    if (areFiltersEqual(lastInitialFilters.current, nextFilters)) return;
    lastInitialFilters.current = nextFilters;
    setFilters((prev) => ({
      ...prev,
      ...nextFilters,
    }));
  }, [initialFilters]);

  const loadRegions = async () => {
    try {
      setLoadingRegions(true);
      const data = await adminService.getRegions();
      setRegions(data || []);
    } catch (err) {
      console.error("Error loading regions:", err);
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadCenters = async (region) => {
    try {
      setLoadingCenters(true);
      const data = await adminService.getCentersByRegion(region);
      setCenters(data || []);
    } catch (err) {
      console.error("Error loading centers:", err);
    } finally {
      setLoadingCenters(false);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      region: "",
      center: "",
      search: "",
      dateFrom: "",
      dateTo: "",
      role: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterContainer}>
        {/* Search */}
        <div className={styles.filterGroup}>
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className={styles.filterInput}
          />
        </div>

        {/* Region Filter */}
        {showRegionFilter && (
          <div className={styles.filterGroup}>
            <label htmlFor="region">Region</label>
            <select
              id="region"
              value={filters.region}
              onChange={(e) => handleFilterChange("region", e.target.value)}
              className={styles.filterSelect}
              disabled={loadingRegions}
            >
              <option value="">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Center Filter */}
        {showCenterFilter && (
          <div className={styles.filterGroup}>
            <label htmlFor="center">Center</label>
            <select
              id="center"
              value={filters.center}
              onChange={(e) => handleFilterChange("center", e.target.value)}
              className={styles.filterSelect}
              disabled={!filters.region || loadingCenters}
            >
              <option value="">All Centers</option>
              {centers.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Role Filter */}
        {showRoleFilter && (
          <div className={styles.filterGroup}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
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
          </div>
        )}

        {/* Date Range Filter */}
        {showDateFilter && (
          <>
            <div className={styles.filterGroup}>
              <label htmlFor="dateFrom">From</label>
              <input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="dateTo">To</label>
              <input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className={styles.filterInput}
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className={styles.filterActions}>
          <button className={styles.btnReset} onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
