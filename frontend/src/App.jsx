import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Customers from "./components/Customers";
import Orders from "./components/Orders";
import AuthForm from "./components/AuthForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { API_URL, shirtFields, pantFields } from "./constants";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === "admin";

  // Debug API configuration
  // useEffect(() => {
  //   console.log("=== APP CONFIGURATION ===");
  //   console.log("API_URL:", API_URL);
  //   console.log("Current Host:", window.location.hostname);
  //   console.log("User Role:", user?.role);
  //   console.log("=== END CONFIG ===");
  // }, [user]);

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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // Admin can see all data
        const [customersRes, ordersRes, statsRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/customers`),
          fetchWithAuth(`${API_URL}/api/orders`),
          fetchWithAuth(`${API_URL}/api/dashboard/stats`),
        ]);

        if (customersRes.ok) setCustomers(await customersRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      } else {
        // Regular user - filter orders by their email on frontend
        const [ordersRes, statsRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/orders`),
          fetchWithAuth(`${API_URL}/api/dashboard/stats`),
        ]);

        if (ordersRes.ok) {
          const allOrders = await ordersRes.json();
          // Filter orders to only show orders for this user's email
          const userOrders = allOrders.filter(
            (order) =>
              order.customerEmail?.toLowerCase() === user?.email?.toLowerCase()
          );
          setOrders(userOrders);
        }

        if (statsRes.ok) {
          const allStats = await statsRes.json();
          console.log(allStats);

          // Calculate user-specific stats
          const userOrders = orders.filter(
            (order) =>
              order.customerEmail?.toLowerCase() === user?.email?.toLowerCase()
          );

          const userStats = {
            totalOrders: userOrders.length,
            pendingOrders: userOrders.filter(
              (order) => order.status === "pending"
            ).length,
            totalRevenue: userOrders.reduce(
              (sum, order) => sum + (order.price || 0),
              0
            ),
            totalCustomers: 1, // Regular user is their own "customer"
          };
          setStats(userStats);
        }

        // Regular users don't see customers
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      // Fallback: If endpoints fail, filter data on frontend
      if (!isAdmin) {
        const userOrders = orders.filter(
          (order) =>
            order.customerEmail?.toLowerCase() === user?.email?.toLowerCase()
        );

        const userStats = {
          totalOrders: userOrders.length,
          pendingOrders: userOrders.filter(
            (order) => order.status === "pending"
          ).length,
          totalRevenue: userOrders.reduce(
            (sum, order) => sum + (order.price || 0),
            0
          ),
          totalCustomers: 1,
        };

        setOrders(userOrders);
        setStats(userStats);
        setCustomers([]);
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
  };

  useEffect(() => {
    if (token && user) {
      fetchDashboardData();
    }
  }, [token, user]);

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          // If user is not admin, restrict navigation to dashboard only
          if (userData.role !== "admin" && currentPage !== "dashboard") {
            setCurrentPage("dashboard");
          }
        } catch (err) {
          console.error("Invalid user data:", err);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setToken(null);
          return;
        }
      }
    }
  }, [token, currentPage]);

  if (!token) {
    return (
      <AuthForm
        onAuthSuccess={(token, user) => {
          setToken(token);
          setUser(user);
          setCurrentPage("dashboard");
        }}
      />
    );
  }

  const renderPage = () => {
    // For regular users, only show dashboard
    if (!isAdmin && currentPage !== "dashboard") {
      return (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button
            className="primary-btn"
            onClick={() => setCurrentPage("dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            stats={stats}
            orders={orders}
            isAdmin={isAdmin}
            userEmail={user?.email}
            loading={loading}
          />
        );
      case "customers":
        return (
          <Customers
            customers={customers}
            shirtFields={shirtFields}
            pantFields={pantFields}
            onDataUpdate={fetchDashboardData}
            token={token}
            isAdmin={isAdmin}
          />
        );
      case "orders":
        return (
          <Orders
            orders={orders}
            customers={customers}
            onDataUpdate={fetchDashboardData}
            token={token}
            isAdmin={isAdmin}
            userEmail={user?.email}
          />
        );
      default:
        return (
          <Dashboard
            stats={stats}
            orders={orders}
            isAdmin={isAdmin}
            userEmail={user?.email}
            loading={loading}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Header user={user} onLogout={handleLogout} isAdmin={isAdmin} />
      <div className="main-content">
        <Navigation
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isAdmin={isAdmin}
        />
        {renderPage()}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Debug component - shows current API URL */}
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          background: "#f0f0f0",
          padding: "5px 10px",
          borderRadius: "5px",
          fontSize: "12px",
          zIndex: 1000,
          border: "1px solid #ccc",
        }}
      >
        API: {API_URL}
      </div>
    </div>
  );
}

export default App;
