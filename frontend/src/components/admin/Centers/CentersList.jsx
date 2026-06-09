import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import clsx from "clsx";
import styles from "./CentersList.module.css";

function CentersList({ filters, onEdit, onDelete, allowDelete = true }) {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchCenters();
  }, [filters]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const result = await adminService.getCenters({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setCenters(result.data || []);
      setPagination(result.pagination || {});
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

  if (loading) {
    return <div className={styles.tableLoading}>Loading centers...</div>;
  }

  if (error) {
    return <div className={styles.tableError}>Error: {error}</div>;
  }

  return (
    <div className={styles.tableContainer}>
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

export default CentersList;
