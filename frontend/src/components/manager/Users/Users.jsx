import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../../services/analyticsService';
import Input from '../../forms/Input';
import Button from '../../forms/Button';
import styles from './Users.module.css';

const Users = ({ loading, users, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [formError, setFormError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '', email: '', role: 'NURSE_OFFICER',
  });
  const [editUser, setEditUser] = useState({
    fullName: '', email: '', role: 'NURSE_OFFICER',
  });

  // Generate password when create modal opens
  useEffect(() => {
    if (showCreateModal) {
      const newPassword = generateRandomPassword();
      setGeneratedPassword(newPassword);
    }
  }, [showCreateModal]);

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleRegeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setGeneratedPassword(newPassword);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    alert('Password copied to clipboard!');
  };

  const handleCopyResetPassword = () => {
    navigator.clipboard.writeText(resetPassword);
    alert('Reset password copied to clipboard!');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newUser.fullName || !newUser.email || !generatedPassword) {
      setFormError('All fields are required.');
      return;
    }
    
    // Manager can only create NURSE_OFFICER role
    if (newUser.role !== 'NURSE_OFFICER') {
      setFormError('Managers can only create Nurse Officer accounts.');
      return;
    }
    
    setSaving(true);
    try {
      await analyticsService.createStaffUser({ 
        ...newUser, 
        password: generatedPassword 
      });
      setShowCreateModal(false);
      setNewUser({ fullName: '', email: '', role: 'NURSE_OFFICER' });
      setGeneratedPassword('');
      onRefresh();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditUser({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
    setFormError('');
    setShowResetPassword(false);
    setResetPassword('');
    setShowEditModal(true);
  };

  const handleToggleResetPassword = () => {
    if (!showResetPassword) {
      const newPassword = generateRandomPassword();
      setResetPassword(newPassword);
    }
    setShowResetPassword(!showResetPassword);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!editUser.fullName || !editUser.email) {
      setFormError('Name and email are required.');
      return;
    }
    
    setSaving(true);
    try {
      // Update user details
      await analyticsService.updateStaffUser(selectedUser.id, editUser);
      
      // If password reset is enabled, reset the password
      if (showResetPassword && resetPassword) {
        await analyticsService.resetUserPassword(selectedUser.id, resetPassword);
      }
      
      setShowEditModal(false);
      setSelectedUser(null);
      setEditUser({ fullName: '', email: '', role: 'NURSE_OFFICER' });
      setShowResetPassword(false);
      setResetPassword('');
      onRefresh();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await analyticsService.deleteStaffUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete user.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (userId) => {
    setToggling(userId);
    try {
      await analyticsService.toggleUserStatus(userId);
      onRefresh();
    } catch (err) {
      console.error('Toggle error:', err);
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <div className="mgr-loading"><div className="mgr-spinner" />Loading users…</div>;

  return (
    <div className="users-content">
      <div className="users-header">
        <Button onClick={() => setShowCreateModal(true)}>+ Create Nurse Officer</Button>
      </div>

      {users.length === 0 ? (
        <div className={styles.emptyState}>
          No staff users found. Create one to get started.
        </div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role.replace(/_/g, ' ')}</td>
                  <td>
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td>
                    <span className={`status ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        onClick={() => handleEditClick(u)}
                        style={{ background: '#37519A', minWidth: '60px' }}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleToggle(u.id)}
                        disabled={toggling === u.id}
                        style={{ background: u.isActive ? '#dc2626' : '#16a34a', minWidth: '80px' }}
                      >
                        {toggling === u.id
                          ? '…'
                          : u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleDeleteClick(u)}
                        style={{ background: '#ef4444', minWidth: '70px' }}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Nurse Officer</h3>
              <button onClick={() => { setShowCreateModal(false); setFormError(''); }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              {formError && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  {formError}
                </div>
              )}
              <Input
                label="Full Name"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              
              {/* Auto-generated Password */}
              <div className="form-group">
                <label>Auto-Generated Password</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <input
                    type="text"
                    value={generatedPassword}
                    readOnly
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontSize: '0.9rem', flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCopyPassword}
                    style={{ padding: '0.5rem 1rem' }}
                    title="Copy password"
                  >
                    📋 Copy
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleRegeneratePassword}
                    style={{ padding: '0.5rem 1rem' }}
                    title="Generate new password"
                  >
                    🔄 Regenerate
                  </button>
                </div>
                <small style={{ display: 'block', marginTop: '0.5rem', color: '#6b7280' }}>
                  ℹ️ Copy this password and share it with the user securely
                </small>
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="form-input"
                  disabled
                >
                  <option value="NURSE_OFFICER">Nurse Officer</option>
                </select>
                <small className={styles.roleHelp}>
                  ℹ️ Center Managers can only create Nurse Officer accounts
                </small>
              </div>
              <div className="modal-actions">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating…' : 'Create Nurse Officer'}
                </Button>
                <Button type="button" onClick={() => { setShowCreateModal(false); setFormError(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button onClick={() => { 
                setShowEditModal(false); 
                setFormError(''); 
                setSelectedUser(null); 
                setShowResetPassword(false);
                setResetPassword('');
              }}>×</button>
            </div>
            <form onSubmit={handleEdit}>
              {formError && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  {formError}
                </div>
              )}
              <Input
                label="Full Name"
                value={editUser.fullName}
                onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                required
              />
              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value={editUser.role.replace(/_/g, ' ')}
                  className="form-input"
                  disabled
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
                <small style={{ display: 'block', marginTop: '0.5rem', color: '#6b7280' }}>
                  ℹ️ Role cannot be changed
                </small>
              </div>

              {/* Reset Password Section */}
              <div className="form-group" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <label style={{ marginBottom: 0 }}>Reset Password</label>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleToggleResetPassword}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {showResetPassword ? '❌ Cancel Reset' : '🔑 Reset Password'}
                  </button>
                </div>
                
                {showResetPassword && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      New Auto-Generated Password
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <input
                        type="text"
                        value={resetPassword}
                        readOnly
                        className="form-input"
                        style={{ fontFamily: 'monospace', fontSize: '0.9rem', flex: 1, background: '#fef3c7' }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCopyResetPassword}
                        style={{ padding: '0.5rem 1rem' }}
                        title="Copy password"
                      >
                        📋 Copy
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setResetPassword(generateRandomPassword())}
                        style={{ padding: '0.5rem 1rem' }}
                        title="Generate new password"
                      >
                        🔄 Regenerate
                      </button>
                    </div>
                    <small style={{ display: 'block', marginTop: '0.5rem', color: '#92400e', background: '#fef3c7', padding: '0.5rem', borderRadius: '4px' }}>
                      ⚠️ The user's password will be changed to this new password. Make sure to copy and share it securely.
                    </small>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Updating…' : showResetPassword ? 'Update & Reset Password' : 'Update User'}
                </Button>
                <Button type="button" onClick={() => { 
                  setShowEditModal(false); 
                  setFormError(''); 
                  setSelectedUser(null);
                  setShowResetPassword(false);
                  setResetPassword('');
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Delete User</h3>
              <button onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ marginBottom: '1rem', fontSize: '1rem', color: '#374151' }}>
                Are you sure you want to delete <strong>{selectedUser?.fullName}</strong>?
              </p>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                This action cannot be undone. All data associated with this user will be permanently removed.
              </p>
              <div className="modal-actions">
                <Button 
                  onClick={handleDelete} 
                  disabled={saving}
                  style={{ background: '#ef4444' }}
                >
                  {saving ? 'Deleting…' : 'Yes, Delete User'}
                </Button>
                <Button type="button" onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
