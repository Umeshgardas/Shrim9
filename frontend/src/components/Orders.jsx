import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  X,
  Calendar,
  User,
  Package,
  DollarSign,
  FileText,
  Shirt,
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

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

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

  // Create a customer map for faster lookup
  const customerMap = React.useMemo(() => {
    const map = {};
    customers.forEach((customer) => {
      map[customer._id] = customer;
    });
    return map;
  }, [customers]);

  // Enhanced search functionality
  const baseFilteredOrders = orders.filter((order) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase().trim();
    const searchOriginal = searchTerm.trim();

    // Get customer details from the map
    const customer = customerMap[order.customerId];

    // Search in customer information
    if (customer) {
      // Search in customer name
      if (customer.name?.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in customer phone (exact match for numbers)
      if (customer.phone?.includes(searchOriginal)) {
        return true;
      }

      // Search in customer email
      if (customer.email?.toLowerCase().includes(searchLower)) {
        return true;
      }
    }

    // Search in order customer name (fallback)
    if (order.customerName?.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search in garment type
    if (order.garmentType?.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search in fabric
    if (order.fabric?.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search in color
    if (order.color?.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search in price (convert to string for searching)
    if (order.price?.toString().includes(searchOriginal)) {
      return true;
    }

    // Search in status
    if (order.status?.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search in special instructions
    if (order.specialInstructions?.toLowerCase().includes(searchLower)) {
      return true;
    }

    return false;
  });

  // Sort orders
  const filteredOrders = React.useMemo(() => {
    if (!sortConfig.key) return baseFilteredOrders;

    return [...baseFilteredOrders].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types for sorting
      if (sortConfig.key === "deliveryDate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (
        sortConfig.key === "price" ||
        sortConfig.key === "advancePayment"
      ) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [baseFilteredOrders, sortConfig]);

  // Handle sort request - matching Dashboard behavior
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon - matching Dashboard icons
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown size={16} className="sort-icon inactive" />;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={16} className="sort-icon active" />
    ) : (
      <ChevronDown size={16} className="sort-icon active" />
    );
  };

  // Enhanced customer search with phone and email
  useEffect(() => {
    if (customerSearch.trim()) {
      const searchLower = customerSearch.toLowerCase().trim();
      const searchOriginal = customerSearch.trim();

      const filtered = customers.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(searchLower) ||
          customer.phone?.includes(searchOriginal) ||
          customer.email?.toLowerCase().includes(searchLower)
      );
      setFilteredCustomers(filtered.slice(0, 10));
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

  const handleAddOrder = async (e) => {
    e.preventDefault();

    if (!orderForm.customerId) {
      alert("Please select a customer from the dropdown");
      return;
    }

    const selectedCustomer = customers.find(
      (c) => c._id === orderForm.customerId
    );

    const orderData = {
      ...orderForm,
      customerEmail: selectedCustomer?.email,
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
    <div className="orders-page">
      <div className="action-bar">
        <h1 className="page-title">
          <Shirt className="page-title-icon" />
          Orders Management
        </h1>
        <div className="action-controls">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by customer name, mobile, email, garment, fabric, color, price, or status..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
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
                <Package className="modal-title-icon" />
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
                    <User className="detail-section-icon" />
                    Customer Information
                  </h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Customer Name:</span>
                      <span className="detail-value capitalize">
                        {selectedOrder.customerName}
                      </span>
                    </div>
                    {(() => {
                      const customer = customerMap[selectedOrder.customerId];
                      return customer ? (
                        <>
                          {customer.phone && (
                            <div className="detail-item">
                              <span className="detail-label">Phone:</span>
                              <span className="detail-value">
                                {customer.phone}
                              </span>
                            </div>
                          )}
                          {customer.email && (
                            <div className="detail-item">
                              <span className="detail-label">Email:</span>
                              <span className="detail-value">
                                {customer.email}
                              </span>
                            </div>
                          )}
                        </>
                      ) : null;
                    })()}
                  </div>
                </div>

                {/* Order Information */}
                <div className="detail-section">
                  <h3 className="detail-section-title">
                    <Package className="detail-section-icon" />
                    Order Information
                  </h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Garment Type:</span>
                      <span className="detail-value capitalize">
                        {selectedOrder.garmentType}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fabric:</span>
                      <span className="detail-value capitalize">
                        {selectedOrder.fabric || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Color:</span>
                      <span className="detail-value capitalize">
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
                    <DollarSign className="detail-section-icon" />
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
                    <Calendar className="detail-section-icon" />
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
                      <FileText className="detail-section-icon" />
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

      {/* Add Order Form */}
      {showOrderForm && (
        <div className="form-section">
          <h2 className="section-title">Create New Order</h2>
          <form onSubmit={handleAddOrder} className="form-grid">
            {/* Customer Search Field */}
            <div className="form-group full-width">
              <label className="form-label">Customer Search *</label>
              <div className="customer-search-container">
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search customer by name, phone, or email..."
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

            {/* Garment Type Dropdown - Professional Style */}
            <div className="form-group">
              <label className="form-label">Garment Type *</label>
              <div className="select-wrapper">
                <select
                  className="form-input professional-select"
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
                <ChevronDown className="select-chevron" size={16} />
              </div>
            </div>

            {/* Fabric Type Dropdown - Professional Style */}
            <div className="form-group">
              <label className="form-label">Fabric Type</label>
              <div className="select-wrapper">
                <select
                  className="form-input professional-select"
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
                <ChevronDown className="select-chevron" size={16} />
              </div>
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

            <div className="form-group full-width">
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
      <div className="orders-list-section">
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
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("customerName")}
                  >
                    <div className="header-content">
                      Customer
                      {getSortIcon("customerName")}
                    </div>
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("garmentType")}
                  >
                    <div className="header-content">
                      Garment
                      {getSortIcon("garmentType")}
                    </div>
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("price")}
                  >
                    <div className="header-content">
                      Price
                      {getSortIcon("price")}
                    </div>
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("deliveryDate")}
                  >
                    <div className="header-content">
                      Delivery Date
                      {getSortIcon("deliveryDate")}
                    </div>
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div>{order.customerName}</div>
                      {(() => {
                        const customer = customerMap[order.customerId];
                        return customer ? (
                          <div className="order-details">
                            {customer.phone}
                            {customer.email && ` • ${customer.email}`}
                          </div>
                        ) : null;
                      })()}
                    </td>
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
                      <div className="status-select-wrapper">
                        <select
                          className={`status-dropdown compact ${order.status}`}
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
                      </div>
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
