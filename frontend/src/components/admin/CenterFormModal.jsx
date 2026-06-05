import React from "react";
import Input from "../forms/Input";
import Button from "../forms/Button";
import "../../styles/admin-modals.css";

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
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: "700px" }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          {formError && (
            <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
              {formError}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div className="form-group">
              <label>Region *</label>
              {loadingRegions ? (
                <div
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    color: "#6b7280",
                  }}
                >
                  Loading regions...
                </div>
              ) : (
                <select
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  className="form-input"
                  required
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    backgroundColor: "#ffffff",
                    color: "#374151",
                    cursor: "pointer",
                  }}
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
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#ef4444",
                    marginTop: "0.25rem",
                  }}
                >
                  No regions available. Please contact an admin to create
                  regions first.
                </div>
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
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
            <div className="form-group">
              <label>Status *</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="form-input"
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
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

          <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
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
