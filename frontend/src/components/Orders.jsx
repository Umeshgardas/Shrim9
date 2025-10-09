import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  User,
  Package,
  DollarSign,
  FileText,
} from "lucide-react";
import { garmentTypes, fabricTypes, API_URL } from "../constants";
const Orders = ({ orders, customers, onDataUpdate, token }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [orderForm, setOrderForm] = useState({
    customerId: "",
    customerName: "",
    garmentType: "",
    fabric: "",
    color: "",
    quantity: 1,
    price: "",
    advancePayment: "",
    deliveryDate: "",
    specialInstructions: "",
  });

  const filteredOrders = orders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.garmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter customers based on search
  useEffect(() => {
    if (customerSearch.trim()) {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          customer.phone.includes(customerSearch)
      );
      setFilteredCustomers(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredCustomers([]);
    }
  }, [customerSearch, customers]);

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
  // In your Orders component, when creating an order:
  const handleAddOrder = async (e) => {
    e.preventDefault();

    // Validate customer selection
    if (!orderForm.customerId) {
      alert("Please select a customer from the dropdown");
      return;
    }

    // Find the selected customer to get their email
    const selectedCustomer = customers.find(
      (c) => c._id === orderForm.customerId
    );

    const orderData = {
      ...orderForm,
      customerEmail: selectedCustomer?.email, // Add customer email to order
    };

    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/orders`, {
        method: "POST",
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        onDataUpdate();
        resetOrderForm();
        setShowOrderForm(false);
        alert("Order created successfully");
      } else {
        const errorData = await res.json();
        alert(`Error creating order: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.log(err);

      alert("Error creating order");
    }
    setLoading(false);
  };
  // const handleAddOrder = async (e) => {
  //   e.preventDefault();

  //   // Validate customer selection
  //   if (!orderForm.customerId) {
  //     alert("Please select a customer from the dropdown");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const res = await fetchWithAuth(`${API_URL}/api/orders`, {
  //       method: "POST",
  //       body: JSON.stringify(orderForm),
  //     });
  //     if (res.ok) {
  //       onDataUpdate();
  //       resetOrderForm();
  //       setShowOrderForm(false);
  //       alert("Order created successfully");
  //     } else {
  //       const errorData = await res.json();
  //       alert(`Error creating order: ${errorData.message || res.statusText}`);
  //     }
  //   } catch (err) {
  //     console.log(err)
  //     alert("Error creating order");
  //   }
  //   setLoading(false);
  // };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        onDataUpdate();
        alert("Order status updated");
      } else {
        const errorData = await res.json();
        alert(
          `Error updating order status: ${errorData.message || res.statusText}`
        );
      }
    } catch (err) {
      console.log(err);
      alert("Error updating order status");
    }
  };

  const resetOrderForm = () => {
    setOrderForm({
      customerId: "",
      customerName: "",
      garmentType: "",
      fabric: "",
      color: "",
      quantity: 1,
      price: "",
      advancePayment: "",
      deliveryDate: "",
      specialInstructions: "",
    });
    setCustomerSearch("");
    setFilteredCustomers([]);
    setShowCustomerDropdown(false);
  };

  const handleCustomerSelect = (customer) => {
    setOrderForm({
      ...orderForm,
      customerId: customer._id,
      customerName: customer.name,
    });
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const clearCustomerSelection = () => {
    setOrderForm({
      ...orderForm,
      customerId: "",
      customerName: "",
    });
    setCustomerSearch("");
    setFilteredCustomers([]);
  };

  // const getStatusClass = (status) => {
  //   switch (status) {
  //     case "pending":
  //       return "status-badge status-pending";
  //     case "in-progress":
  //       return "status-badge status-in-progress";
  //     case "ready":
  //       return "status-badge status-ready";
  //     case "delivered":
  //       return "status-badge status-delivered";
  //     default:
  //       return "status-badge status-pending";
  //   }
  // };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const toggleOrderForm = () => {
    setShowOrderForm(!showOrderForm);
    if (showOrderForm) {
      resetOrderForm();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "in-progress":
        return "#3b82f6";
      case "ready":
        return "#10b981";
      case "delivered":
        return "#6b7280";
      default:
        return "#f59e0b";
    }
  };

  return (
    <div>
      <div className="action-bar">
        <h1 className="page-title">Orders</h1>
        <div className="action-bar">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="primary-btn" onClick={toggleOrderForm}>
            {showOrderForm ? <ChevronUp size={16} /> : <Plus size={16} />}
            {showOrderForm ? "Hide Form" : "Create Order"}
          </button>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderModal}>
          <div
            className="modal order-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                <Package size={24} style={{ marginRight: "10px" }} />
                Order Details
              </h2>
              <button className="modal-close" onClick={closeOrderModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-content">
              <div className="order-details-content">
                {/* Customer Information */}
                <div className="detail-section">
                  <h3 className="detail-section-title">
                    <User size={18} style={{ marginRight: "8px" }} />
                    Customer Information
                  </h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Customer Name:</span>
                      <span className="detail-value capitalize ">
                        {selectedOrder.customerName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="detail-section">
                  <h3 className="detail-section-title">
                    <Package size={18} style={{ marginRight: "8px" }} />
                    Order Information
                  </h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Garment Type:</span>
                      <span className="detail-value capitalize ">
                        {selectedOrder.garmentType}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fabric:</span>
                      <span className="detail-value capitalize ">
                        {selectedOrder.fabric || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Color:</span>
                      <span className="detail-value capitalize ">
                        {selectedOrder.color || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value">
                        {selectedOrder.quantity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="detail-section">
                  <h3 className="detail-section-title">
                    <DollarSign size={18} style={{ marginRight: "8px" }} />
                    Financial Information
                  </h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Total Price:</span>
                      <span className="detail-value price">
                        ₹{selectedOrder.price}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Advance Paid:</span>
                      <span className="detail-value advance">
                        ₹{selectedOrder.advancePayment || 0}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Balance Due:</span>
                      <span className="detail-value balance">
                        ₹
                        {selectedOrder.price -
                          (selectedOrder.advancePayment || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="detail-section">
                  <h3 className="detail-section-title">
                    <Calendar size={18} style={{ marginRight: "8px" }} />
                    Delivery Information
                  </h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Delivery Date:</span>
                      <span className="detail-value">
                        {new Date(
                          selectedOrder.deliveryDate
                        ).toLocaleDateString("en-IN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(selectedOrder.status),
                          color: "white",
                        }}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                {selectedOrder.specialInstructions && (
                  <div className="detail-section">
                    <h3 className="detail-section-title">
                      <FileText size={18} style={{ marginRight: "8px" }} />
                      Special Instructions
                    </h3>
                    <div className="special-instructions">
                      {selectedOrder.specialInstructions}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-btn" onClick={closeOrderModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Form - Conditionally Rendered */}
      {showOrderForm && (
        <div className="recent-orders" style={{ marginBottom: "2rem" }}>
          <h2 className="section-title">Create New Order</h2>
          <form onSubmit={handleAddOrder} className="form-grid">
            {/* Customer Search Field */}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Customer Search *</label>
              <div className="customer-search-container">
                <div className="search-input-wrapper">
                  <Search className="search-icon" size={16} />
                  <input
                    type="text"
                    placeholder="Search customer by name or phone..."
                    className="form-input search-input-with-icon"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                  {orderForm.customerId && (
                    <button
                      type="button"
                      className="clear-customer-btn"
                      onClick={clearCustomerSelection}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div className="customer-dropdown">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer._id}
                        className="customer-option"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div className="customer-name">{customer.name}</div>
                        <div className="customer-phone">{customer.phone}</div>
                        {customer.email && (
                          <div className="customer-email">{customer.email}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showCustomerDropdown &&
                  customerSearch &&
                  filteredCustomers.length === 0 && (
                    <div className="customer-dropdown">
                      <div className="no-customers">No customers found</div>
                    </div>
                  )}
              </div>

              {orderForm.customerId && (
                <div className="selected-customer">
                  <strong>Selected:</strong> {orderForm.customerName}
                </div>
              )}
            </div>

            {/* Garment Type Dropdown */}
            <div className="form-group">
              <label className="form-label">Garment Type *</label>
              <select
                className="form-input"
                value={orderForm.garmentType}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, garmentType: e.target.value })
                }
                required
              >
                <option value="">Select Garment Type</option>
                {garmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Fabric Type Dropdown */}
            <div className="form-group">
              <label className="form-label">Fabric Type</label>
              <select
                className="form-input"
                value={orderForm.fabric}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, fabric: e.target.value })
                }
              >
                <option value="">Select Fabric Type</option>
                {fabricTypes.map((fabric) => (
                  <option key={fabric} value={fabric}>
                    {fabric}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                type="text"
                placeholder="Color"
                className="form-input"
                value={orderForm.color}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, color: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                placeholder="Quantity"
                className="form-input"
                value={orderForm.quantity}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price *</label>
              <input
                type="number"
                placeholder="Price"
                className="form-input"
                value={orderForm.price}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Advance Payment</label>
              <input
                type="number"
                placeholder="Advance Payment"
                className="form-input"
                value={orderForm.advancePayment}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    advancePayment: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Date *</label>
              <input
                type="date"
                className="form-input"
                value={orderForm.deliveryDate}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, deliveryDate: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Special Instructions</label>
              <textarea
                placeholder="Special instructions for this order..."
                className="form-input"
                rows="3"
                value={orderForm.specialInstructions}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    specialInstructions: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                <Plus size={16} />
                Create Order
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={toggleOrderForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      <div className="recent-orders">
        <h2 className="section-title">Orders List</h2>
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            {searchTerm
              ? "No orders found matching your search."
              : "No orders found."}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Garment</th>
                  <th>Price</th>
                  <th>Delivery Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.customerName}</td>
                    <td>
                      <div>{order.garmentType}</div>
                      {order.fabric && (
                        <div className="order-details">
                          {order.fabric}
                          {order.color && ` • ${order.color}`}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="price-amount">₹{order.price}</div>
                      {order.advancePayment > 0 && (
                        <div className="advance-amount">
                          Advance: ₹{order.advancePayment}
                        </div>
                      )}
                    </td>
                    <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
                    <td>
                      <select
                        className={`status-dropdown ${order.status}`}
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order._id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="action-btn view-btn"
                        onClick={() => showOrderDetails(order)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
