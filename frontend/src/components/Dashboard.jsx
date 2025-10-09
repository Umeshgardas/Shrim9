import React from 'react';
import { User, Package, Calendar, IndianRupee } from 'lucide-react';

const Dashboard = ({ stats, orders, isAdmin, userEmail, loading }) => {
  // Filter orders for regular users
  const displayOrders = isAdmin 
    ? orders 
    : orders.filter(order => order.customerEmail?.toLowerCase() === userEmail?.toLowerCase());

  const displayStats = isAdmin ? stats : {
    totalCustomers: 1, // Regular user is their own customer
    totalOrders: displayOrders.length,
    pendingOrders: displayOrders.filter(order => order.status === 'pending').length,
    totalRevenue: displayOrders.reduce((sum, order) => sum + (order.price || 0), 0)
  };

  const statCards = [
    {
      icon: <User className="stat-icon" />,
      label: isAdmin ? "Total Customers" : "My Account",
      value: isAdmin ? displayStats.totalCustomers || 0 : "Active",
      color: "#2563eb"
    },
    {
      icon: <Package className="stat-icon" />,
      label: isAdmin ? "Total Orders" : "My Orders",
      value: displayStats.totalOrders || 0,
      color: "#059669"
    },
    {
      icon: <Calendar className="stat-icon" />,
      label: isAdmin ? "Pending Orders" : "Pending Orders",
      value: displayStats.pendingOrders || 0,
      color: "#d97706"
    },
    {
      icon: <IndianRupee className="stat-icon" />,
      label: isAdmin ? "Total Revenue" : "Total Spent",
      value: isAdmin ? `₹${displayStats.totalRevenue || 0}` : `₹${displayStats.totalRevenue || 0}`,
      color: "#7c3aed"
    }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-badge status-pending';
      case 'in-progress': return 'status-badge status-in-progress';
      case 'ready': return 'status-badge status-ready';
      case 'delivered': return 'status-badge status-delivered';
      default: return 'status-badge status-pending';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="dashboard-title">
        {isAdmin ? 'Dashboard' : 'My Dashboard'}
        {/* {!isAdmin && <span className="user-view">,Welcome back!</span>} */}
      </h1>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            {stat.icon}
            <div className="stat-info">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-orders">
        <h2 className="section-title">
          {isAdmin ? 'Recent Orders' : 'My Recent Orders'}
        </h2>
        
        {displayOrders.length === 0 ? (
          <div className="empty-state">
            {isAdmin 
              ? 'No orders found.' 
              : `No orders found for ${userEmail}. Contact admin to place an order.`
            }
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {isAdmin && <th>Customer</th>}
                  <th>Garment</th>
                  <th>Status</th>
                  <th>Delivery Date</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    {isAdmin && <td>{order.customerName}</td>}
                    <td>{order.garmentType}</td>
                    <td>
                      <span className={getStatusClass(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
                    <td>₹{order.price}</td>
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

export default Dashboard;