import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import styles from "./UsersList.module.css";

function UsersList({ filters, onEdit, onDelete, onCreateClick }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

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
        <h2>Users Management</h2>
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
                    🗑
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
