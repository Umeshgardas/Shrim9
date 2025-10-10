import React, { useState, useMemo } from "react";
import {
  Users,
  Package,
  Clock,
  IndianRupee,
  TrendingUp,
  UserCheck,
  Calendar,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  BarChart3,
} from "lucide-react";

const Dashboard = ({ stats, orders, isAdmin, userEmail, loading }) => {
  const [sortConfig, setSortConfig] = useState({
    field: "deliveryDate",
    direction: "asc",
  });

  // Constants
  const STATUS_ORDER = ["pending", "in_progress", "completed", "cancelled"];
  const TABLE_LIMIT = 5;

  // Memoized data processing
  const { filteredOrders, displayStats } = useMemo(() => {
    const filtered =
      orders?.filter(
        (order) =>
          isAdmin ||
          order.customerEmail?.toLowerCase() === userEmail?.toLowerCase()
      ) || [];

    const statsData = isAdmin
      ? stats || {}
      : {
          totalCustomers: 1,
          totalOrders: filtered.length,
          pendingOrders: filtered.filter((o) => o.status === "pending").length,
          totalRevenue: filtered.reduce((sum, o) => sum + (o.price || 0), 0),
        };

    return { filteredOrders: filtered, displayStats: statsData };
  }, [orders, isAdmin, userEmail, stats]);

  // Sorting
  const sortedOrders = useMemo(() => {
    if (!filteredOrders.length) return [];

    return [...filteredOrders].sort((a, b) => {
      const getValue = (item) => {
        switch (sortConfig.field) {
          case "customer":
            return item.customerName?.toLowerCase() || "";
          case "garment":
            return item.garmentType?.toLowerCase() || "";
          case "status":
            return STATUS_ORDER.indexOf(item.status);
          case "deliveryDate":
            return new Date(item.deliveryDate);
          case "price":
            return item.price || 0;
          default:
            return "";
        }
      };

      const aVal = getValue(a);
      const bVal = getValue(b);
      const modifier = sortConfig.direction === "asc" ? 1 : -1;

      return aVal < bVal ? -1 * modifier : aVal > bVal ? 1 * modifier : 0;
    });
  }, [filteredOrders, sortConfig]);

  // Handlers
  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (field) => {
    if (sortConfig.field !== field)
      return <ChevronsUpDown className="sort-icon" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="sort-icon" />
    ) : (
      <ChevronDown className="sort-icon" />
    );
  };

  // Configurations
  const statCards = [
    {
      icon: isAdmin ? Users : UserCheck,
      label: isAdmin ? "Total Customers" : "My Account",
      value: isAdmin ? displayStats.totalCustomers || 0 : "Active",
      color: "blue",
    },
    {
      icon: Package,
      label: isAdmin ? "Total Orders" : "My Orders",
      value: displayStats.totalOrders || 0,
      color: "green",
    },
    {
      icon: Clock,
      label: "Pending Orders",
      value: displayStats.pendingOrders || 0,
      color: "orange",
    },
    {
      icon: isAdmin ? TrendingUp : IndianRupee,
      label: isAdmin ? "Total Revenue" : "Total Spent",
      value: `₹${(displayStats.totalRevenue || 0).toLocaleString()}`,
      color: "purple",
    },
  ];

  const getStatusClass = (status) =>
    `status-badge status-${status.replace("_", "-")}`;

  if (loading) {
    return (
      <div
        className="loading-container"
        role="status"
        aria-label="Loading dashboard"
      >
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="title-section">
            <BarChart3 className="header-icon" />
            <div>
              <h1 className="dashboard-title">
                {isAdmin ? "Admin Dashboard" : "My Dashboard"}
              </h1>
              <p className="dashboard-subtitle">
                {isAdmin
                  ? "Overview of all orders and statistics"
                  : "Track your orders and spending"}
              </p>
            </div>
          </div>
          <div className="header-badge">
            {isAdmin ? "Administrator" : "Customer"}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <section aria-label="Key statistics" className="stats-section">
        <div className="stats-grid">
          {statCards.map((stat, index) => {
            const { icon: Icon, label, value, color } = stat;
            return (
              <div key={label} className={`stat-card stat-${color} `}>
                <div className="stat-icon-container" key={index}>
                  <Icon className="stat-icon" aria-hidden="true" />
                </div>
                <div className="stat-info">
                  <div className="stat-label">{label}</div>
                  <div className="stat-value">{value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Orders Table */}
      <section aria-label="Recent orders" className="orders-section">
        <div className="section-header">
          <div className="section-title-container">
            <Package className="section-icon" />
            <div>
              <h2 className="section-title">
                {isAdmin ? "Recent Orders" : "My Recent Orders"}
              </h2>
              <p className="section-subtitle">
                {filteredOrders.length} order
                {filteredOrders.length !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state" role="status">
            <AlertCircle className="empty-icon" aria-hidden="true" />
            <div className="empty-content">
              <h3>No orders found</h3>
              <p>
                {isAdmin
                  ? "No orders available in the system"
                  : `No orders found for ${userEmail}. Contact support to place an order.`}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="table-container"
            role="region"
            aria-label="Orders table"
          >
            <table className="data-table" aria-label="Orders list">
              <thead>
                <tr>
                  {isAdmin && (
                    <th
                    className="sortable-header"
                      onClick={() => handleSort("customer")}
                      aria-sort={
                        sortConfig.field === "customer"
                          ? sortConfig.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <span>Customer {getSortIcon("customer")}</span>
                    </th>
                  )}
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("garment")}
                    aria-sort={
                      sortConfig.field === "garment"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <span>Garment {getSortIcon("garment")}</span>
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("status")}
                    aria-sort={
                      sortConfig.field === "status"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <span>Status {getSortIcon("status")}</span>
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("deliveryDate")}
                    aria-sort={
                      sortConfig.field === "deliveryDate"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <span>Delivery Date {getSortIcon("deliveryDate")}</span>
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("price")}
                    aria-sort={
                      sortConfig.field === "price"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <span>Price {getSortIcon("price")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.slice(0, TABLE_LIMIT).map((order) => (
                  <tr key={order._id}>
                    {isAdmin && (
                      <td className="customer-cell">{order.customerName}</td>
                    )}
                    <td>{order.garmentType}</td>
                    <td>
                      <span className={getStatusClass(order.status)}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar className="date-icon" aria-hidden="true" />
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="price-cell">
                      ₹{order.price?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
