import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import styles from "./DataList.module.css";
import clsx from "clsx";

function WellnessPlansList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    region: "",
    center: "",
    status: "active",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  useEffect(() => {
    fetchPlans();
  }, [page, filters]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      // Using wellness endpoint if available, otherwise using vitals
      const response = await adminService.getVitals({
        ...filters,
        page,
        limit: 20,
      });
      setPlans(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load wellness plans");
      console.error("Error fetching plans:", err);
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
      status: "active",
      dateFrom: "",
      dateTo: "",
      search: "",
    });
    setPage(1);
  };

  if (loading) return <div className={styles.loading}>Loading wellness plans...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.dataList}>
      <div className={styles.listHeader}>
        <h2>Wellness Plans</h2>
        <button className={styles.btnExport}>Export</button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          name="search"
          placeholder="Search by patient..."
          value={filters.search}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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
            <th>Patient</th>
            <th>Plan Text</th>
            <th>Goals</th>
            <th>Duration (days)</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id}>
              <td>{plan.user?.fullName || "N/A"}</td>
              <td className={styles.truncate}>{plan.planText?.substring(0, 50) || "-"}...</td>
              <td className={styles.truncate}>{plan.goals?.substring(0, 50) || "-"}...</td>
              <td>{plan.duration || "-"}</td>
              <td>
                <span className={clsx(styles.badge, plan.isActive ? styles.badgeActive : styles.badgeInactive)}>
                  {plan.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td>{new Date(plan.createdAt).toLocaleDateString()}</td>
              <td>
                <button className={styles.btnView}>View</button>
                <button className={styles.btnEdit}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {plans.length === 0 && (
        <div className={styles.emptyState}>No wellness plans found</div>
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
          disabled={plans.length < 20}
          className={styles.btnNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default WellnessPlansList;
