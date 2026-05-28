import React, { useEffect, useState } from "react";
import FilterBar from "../../components/admin/FilterBar";
import UsersList from "../../components/admin/UsersList";
import EditUserModal from "../../components/admin/EditUserModal";
import CreateUserModal from "../../components/admin/CreateUserModal";
import { adminService } from "../../services/adminService";

function UserManagement({ baseFilters = {}, allowedRoles, disallowEditRoles }) {
  const [filters, setFilters] = useState({ ...baseFilters });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const normalizeFilters = (values = {}) => ({
    region: values.region || "",
    center: values.center || "",
    search: values.search || "",
    dateFrom: values.dateFrom || "",
    dateTo: values.dateTo || "",
    role: values.role || "",
    status: values.status || "",
  });

  const areFiltersEqual = (left = {}, right = {}) => {
    const leftNormalized = normalizeFilters(left);
    const rightNormalized = normalizeFilters(right);
    return Object.keys(leftNormalized).every(
      (key) => leftNormalized[key] === rightNormalized[key],
    );
  };

  useEffect(() => {
    const nextFilters = normalizeFilters(baseFilters);
    setFilters((prev) => (areFiltersEqual(prev, nextFilters) ? prev : nextFilters));
  }, [baseFilters]);

  const handleFilterChange = (newFilters) => {
    const nextFilters = { ...normalizeFilters(baseFilters), ...newFilters };
    setFilters((prev) => (areFiltersEqual(prev, nextFilters) ? prev : nextFilters));
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminService.deleteUser(userId);
        alert("User deleted successfully");
        setRefreshKey((prev) => prev + 1);
      } catch (err) {
        alert(
          "Failed to delete user: " +
            (err.response?.data?.message || err.message),
        );
      }
    }
  };

  const handleEditSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCreateSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>👥 User Management</h2>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        showRegionFilter={true}
        showCenterFilter={true}
        showRoleFilter={true}
        initialFilters={baseFilters}
      />

      <UsersList
        key={refreshKey}
        filters={filters}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateClick={() => setShowCreateModal(true)}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        onSuccess={handleEditSuccess}
        allowedRoles={allowedRoles}
        disallowEditRoles={disallowEditRoles}
      />

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        allowedRoles={allowedRoles}
      />
    </div>
  );
}

export default UserManagement;
