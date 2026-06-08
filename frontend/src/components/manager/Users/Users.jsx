import React, { useState } from 'react';
import { analyticsService } from '../../../services/analyticsService';
import Input from '../../forms/Input';
import Button from '../../forms/Button';
import styles from './Users.module.css';

const Users = ({ loading, users, onRefresh }) => {
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [toggling, setToggling]     = useState(null);
  const [formError, setFormError]   = useState('');
  const [newUser, setNewUser]       = useState({
    fullName: '', email: '', role: 'NURSE_OFFICER', password: '',
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newUser.fullName || !newUser.email || !newUser.password) {
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
      await analyticsService.createStaffUser(newUser);
      setShowModal(false);
      setNewUser({ fullName: '', email: '', role: 'NURSE_OFFICER', password: '' });
      onRefresh();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to create user.');
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
        <h3>Staff Management ({users.length} staff)</h3>
        <Button onClick={() => setShowModal(true)}>+ Create Nurse Officer</Button>
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
                    <Button
                      size="small"
                      onClick={() => handleToggle(u.id)}
                      disabled={toggling === u.id}
                    >
                      {toggling === u.id
                        ? '…'
                        : u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Nurse Officer</h3>
              <button onClick={() => { setShowModal(false); setFormError(''); }}>×</button>
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
              <Input
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
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
                <Button type="button" onClick={() => { setShowModal(false); setFormError(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
