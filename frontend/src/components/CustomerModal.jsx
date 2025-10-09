import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { API_URL } from "../constants";
import { toast } from "react-toastify";

const CustomerModal = ({
  customer,
  shirtFields,
  pantFields,
  onClose,
  onSave,
  token,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    measurements: {
      length: "",
      nehru: "",
      chest: "",
      stomach: "",
      seat: "",
      front: "",
      frontWidth: "",
      frontDepth: "",
      shoulder: "",
      biceps: "",
      handLength: "",
      cuff: "",
      cuffLength: "",
      collar: "",
      stand: "",
      shirtDescription: "",
      pantLength: "",
      pantSeat: "",
      kadda: "",
      pantWaist: "",
      thies: "",
      knees: "",
      cafs: "",
      bottom: "",
      pantDescription: "",
    },
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address || "",
        measurements: {
          length: customer.measurements?.length || "",
          nehru: customer.measurements?.nehru || "",
          chest: customer.measurements?.chest || "",
          stomach: customer.measurements?.stomach || "",
          seat: customer.measurements?.seat || "",
          front: customer.measurements?.front || "",
          frontWidth: customer.measurements?.frontWidth || "",
          frontDepth: customer.measurements?.frontDepth || "",
          shoulder: customer.measurements?.shoulder || "",
          biceps: customer.measurements?.biceps || "",
          handLength: customer.measurements?.handLength || "",
          cuff: customer.measurements?.cuff || "",
          cuffLength: customer.measurements?.cuffLength || "",
          collar: customer.measurements?.collar || "",
          stand: customer.measurements?.stand || "",
          shirtDescription: customer.measurements?.shirtDescription || "",
          pantLength: customer.measurements?.pantLength || "",
          pantSeat: customer.measurements?.pantSeat || "",
          kadda: customer.measurements?.kadda || "",
          pantWaist: customer.measurements?.pantWaist || "",
          thies: customer.measurements?.thies || "",
          knees: customer.measurements?.knees || "",
          cafs: customer.measurements?.cafs || "",
          bottom: customer.measurements?.bottom || "",
          pantDescription: customer.measurements?.pantDescription || "",
        },
      });
    }
  }, [customer]);

  const fetchWithAuth = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = customer
        ? `${API_URL}/api/customers/${customer._id}`
        : `${API_URL}/api/customers`;

      const method = customer ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSave();
        onClose();
        toast.success(
          `Customer ${customer ? "updated" : "added"} successfully!`,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message || res.statusText}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.log(err);
      toast.error(`Error ${customer ? "updating" : "adding"} customer`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMeasurementChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value,
      },
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {customer ? "Edit Customer" : "Add New Customer"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
            </div>

            {/* Shirt Measurements */}
            <div className="measurement-section">
              <h3 className="section-title">Shirt Measurements (in inches)</h3>
              <div className="measurement-grid">
                {shirtFields.map((field) => (
                  <div key={field.key} className="measurement-field">
                    <label className="field-label">
                      {field.label}
                      <div className="field-hindi">({field.hindiLabel})</div>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.measurements[field.key]}
                      onChange={(e) =>
                        handleMeasurementChange(field.key, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">
                  Shirt Description (शर्ट वर्णन)
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.measurements.shirtDescription}
                  onChange={(e) =>
                    handleMeasurementChange("shirtDescription", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Pant Measurements */}
            <div className="measurement-section">
              <h3 className="section-title">Pant Measurements (in inches)</h3>
              <div className="measurement-grid">
                {pantFields.map((field) => (
                  <div key={field.key} className="measurement-field">
                    <label className="field-label">
                      {field.label}
                      <div className="field-hindi">({field.hindiLabel})</div>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.measurements[field.key]}
                      onChange={(e) =>
                        handleMeasurementChange(field.key, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">
                  Pant Description (पँट वर्णन)
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.measurements.pantDescription}
                  onChange={(e) =>
                    handleMeasurementChange("pantDescription", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                <Plus size={16} />
                {customer ? "Update Customer" : "Add Customer"}
              </button>
              <button type="button" className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
