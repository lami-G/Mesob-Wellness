import React from "react";
import Input from "../../forms/Input";
import Button from "../../forms/Button";
import styles from "../shared/Modal.module.css";

function CenterFormModal({
  isOpen,
  title,
  submitLabel,
  formData,
  setFormData,
  formError,
  saving,
  availableRegions,
  loadingRegions,
  statusOptions,
  showManagerFields,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${styles.modalContentWide}`}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit} className={styles.modalForm}>
          {formError && (
            <div className={styles.errorMessage}>
              {formError}
            </div>
          )}

          <div className={styles.formGrid}>
            <Input
              label="Center Name *"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Addis Ababa Main Center"
            />
            <Input
              label="City *"
              name="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              required
              placeholder="Addis Ababa"
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Region *</label>
              {loadingRegions ? (
                <div className={styles.loadingState}>
                  Loading regions...
                </div>
              ) : (
                <select
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  required
                >
                  <option value="">Select a region...</option>
                  {availableRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              )}
              {availableRegions.length === 0 && !loadingRegions && (
                <small className={styles.errorText}>
                  No regions available. Please contact an admin to create
                  regions first.
                </small>
              )}
            </div>
          </div>

          <Input
            label="Address *"
            name="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
            placeholder="Bole Road, Near Edna Mall"
          />

          <div className={styles.formGrid}>
            <Input
              label="Daily Capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              placeholder="100"
            />
            <div className={styles.formGroup}>
              <label>Status *</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                required
              >
                {(statusOptions || ["ACTIVE", "INACTIVE"]).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGrid}>
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+251911234567"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="center@mesob.et"
            />
          </div>

          {showManagerFields && (
            <div className={styles.formGrid}>
              <Input
                label="Center Admin Email"
                name="managerEmail"
                type="email"
                value={formData.managerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, managerEmail: e.target.value })
                }
                placeholder="admin@mesob.et"
              />
              <Input
                label="Center Admin Password"
                name="managerPassword"
                type="password"
                value={formData.managerPassword}
                onChange={(e) =>
                  setFormData({ ...formData, managerPassword: e.target.value })
                }
                placeholder="Create a password"
              />
            </div>
          )}

          <div className={styles.modalActions}>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : submitLabel}
            </Button>
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CenterFormModal;
