import React, { useState, useEffect } from 'react';
import { User, UserPlus, Package, Calendar, DollarSign, Search, Plus, Edit, Trash2, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const TailorShopApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  // Auth states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  
  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '', phone: '', email: '', address: '',
    measurements: { chest: '', waist: '', hip: '', shoulder: '', armLength: '', legLength: '', neck: '' }
  });
  
  // Order form state
  const [orderForm, setOrderForm] = useState({
    customerId: '', customerName: '', garmentType: '', fabric: '', color: '',
    quantity: 1, price: '', advancePayment: '', deliveryDate: '', specialInstructions: ''
  });

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token) {
      // Fix for the JSON.parse error
      const storedUser = localStorage.getItem('user');
      if (storedUser && typeof storedUser === 'string') {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setToken(null);
          return;
        }
      }
      fetchDashboardData();
    }
  }, [token]);

  const fetchWithAuth = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  const fetchDashboardData = async () => {
    try {
      const [customersRes, ordersRes, statsRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/customers`,),
        fetchWithAuth(`${API_URL}/orders`),
        fetchWithAuth(`${API_URL}/dashboard/stats`)
      ]);

      if (customersRes.ok) setCustomers(await customersRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentPage('dashboard');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentPage('dashboard');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Registration failed');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('login');
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_URL}/customers`, {
        method: 'POST',
        body: JSON.stringify(customerForm),
      });

      if (response.ok) {
        fetchDashboardData();
        setCustomerForm({
          name: '', phone: '', email: '', address: '',
          measurements: { chest: '', waist: '', hip: '', shoulder: '', armLength: '', legLength: '', neck: '' }
        });
        alert('Customer added successfully');
      }
    } catch (error) {
      alert('Error adding customer');
    }
    setLoading(false);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_URL}/customers/${editingCustomer}`, {
        method: 'PUT',
        body: JSON.stringify(customerForm),
      });

      if (response.ok) {
        fetchDashboardData();
        setEditingCustomer(null);
        setCustomerForm({
          name: '', phone: '', email: '', address: '',
          measurements: { chest: '', waist: '', hip: '', shoulder: '', armLength: '', legLength: '', neck: '' }
        });
        alert('Customer updated successfully');
      }
    } catch (error) {
      alert('Error updating customer');
    }
    setLoading(false);
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetchWithAuth(`${API_URL}/customers/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchDashboardData();
          alert('Customer deleted successfully');
        }
      } catch (error) {
        alert('Error deleting customer');
      }
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderForm),
      });

      if (response.ok) {
        fetchDashboardData();
        setOrderForm({
          customerId: '', customerName: '', garmentType: '', fabric: '', color: '',
          quantity: 1, price: '', advancePayment: '', deliveryDate: '', specialInstructions: ''
        });
        alert('Order created successfully');
      }
    } catch (error) {
      alert('Error creating order');
    }
    setLoading(false);
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchDashboardData();
        alert('Order status updated');
      }
    } catch (error) {
      alert('Error updating order status');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.garmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tailor Shop</h1>
            <p className="text-gray-600">Management System</p>
          </div>

          {currentPage === 'login' ? (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Login'}
                </button>
              </form>
              <p className="mt-4 text-center">
                Don't have an account?{' '}
                <button
                  onClick={() => setCurrentPage('register')}
                  className="text-blue-600 hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  required
                />
                {/* <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({...registerForm, role: e.target.value})}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select> */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Register'}
                </button>
              </form>
              <p className="mt-4 text-center">
                Already have an account?{' '}
                <button
                  onClick={() => setCurrentPage('login')}
                  className="text-blue-600 hover:underline"
                >
                  Login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Tailor Shop</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded-md ${currentPage === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('customers')}
              className={`px-4 py-2 rounded-md ${currentPage === 'customers' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Customers
            </button>
            <button
              onClick={() => setCurrentPage('orders')}
              className={`px-4 py-2 rounded-md ${currentPage === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Orders
            </button>
          </nav>
        </div>

        {/* Dashboard */}
        {currentPage === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.garmentType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{order.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Customers Page */}
        {currentPage === 'customers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Customers</h2>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Add Customer Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <form onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                />
                
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-700 mb-2">Measurements (in inches)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <input
                      type="number"
                      placeholder="Chest"
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={customerForm.measurements.chest}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        measurements: {...customerForm.measurements, chest: e.target.value}
                      })}
                    />
                    <input
                      type="number"
                      placeholder="Waist"
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={customerForm.measurements.waist}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        measurements: {...customerForm.measurements, waist: e.target.value}
                      })}
                    />
                    <input
                      type="number"
                      placeholder="Hip"
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={customerForm.measurements.hip}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        measurements: {...customerForm.measurements, hip: e.target.value}
                      })}
                    />
                    <input
                      type="number"
                      placeholder="Shoulder"
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={customerForm.measurements.shoulder}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        measurements: {...customerForm.measurements, shoulder: e.target.value}
                      })}
                    />
                    <input
                      type="number"
                      placeholder="Arm Length"
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={customerForm.measurements.armLength}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        measurements: {...customerForm.measurements, armLength: e.target.value}
                      })}
                    />
                    <input
                      type="number"
                      placeholder="Leg Length"
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={customerForm.measurements.legLength}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        measurements: {...customerForm.measurements, legLength: e.target.value}
                      })}
                    />
                    <input
                      type="number"
                      placeholder="Neck"
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={customerForm.measurements.neck}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        measurements: {...customerForm.measurements, neck: e.target.value}
                      })}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {editingCustomer ? 'Update Customer' : 'Add Customer'}
                  </button>
                  {editingCustomer && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCustomer(null);
                        setCustomerForm({
                          name: '', phone: '', email: '', address: '',
                          measurements: { chest: '', waist: '', hip: '', shoulder: '', armLength: '', legLength: '', neck: '' }
                        });
                      }}
                      className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Customers List */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Customer List</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCustomers.map((customer) => (
                        <tr key={customer._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingCustomer(customer._id);
                                  setCustomerForm({
                                    name: customer.name,
                                    phone: customer.phone,
                                    email: customer.email || '',
                                    address: customer.address || '',
                                    measurements: customer.measurements || {}
                                  });
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCustomer(customer._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Page */}
        {currentPage === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Orders</h2>
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Add Order Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Create New Order</h3>
              <form onSubmit={handleAddOrder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <select
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={orderForm.customerId}
                  onChange={(e) => {
                    const selectedCustomer = customers.find(c => c._id === e.target.value);
                    setOrderForm({
                      ...orderForm,
                      customerId: e.target.value,
                      customerName: selectedCustomer ? selectedCustomer.name : ''
                    });
                  }}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Garment Type"
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={orderForm.garmentType}
                  onChange={(e) => setOrderForm({...orderForm, garmentType: e.target.value})}
                  required
                />
                
                <input
                  type="text"
                  placeholder="Fabric"
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={orderForm.fabric}
                  onChange={(e) => setOrderForm({...orderForm, fabric: e.target.value})}
                />
                
                <input
                  type="text"
                  placeholder="Color"
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={orderForm.color}
                  onChange={(e) => setOrderForm({...orderForm, color: e.target.value})}
                />
                
                <input
                  type="number"
                  placeholder="Quantity"
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({...orderForm, quantity: parseInt(e.target.value)})}
                  min="1"
                  required
                />
                
                <input
                  type="number"
                  placeholder="Price"
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({...orderForm, price: parseFloat(e.target.value)})}
                  required
                />
                
                <input
                  type="number"
                  placeholder="Advance Payment"
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={orderForm.advancePayment}
                  onChange={(e) => setOrderForm({...orderForm, advancePayment: parseFloat(e.target.value)})}
                />
                
                <input
                  type="date"
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={orderForm.deliveryDate}
                  onChange={(e) => setOrderForm({...orderForm, deliveryDate: e.target.value})}
                  required
                />
                
                <textarea
                  placeholder="Special Instructions"
                  className="md:col-span-2 lg:col-span-3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  value={orderForm.specialInstructions}
                  onChange={(e) => setOrderForm({...orderForm, specialInstructions: e.target.value})}
                />
                
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </button>
              </form>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Orders List</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.garmentType}
                            {order.fabric && <div className="text-xs text-gray-400">{order.fabric}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{order.price}
                            {order.advancePayment > 0 && (
                              <div className="text-xs text-green-600">Advance: ₹{order.advancePayment}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              className={`text-xs font-semibold rounded-full px-2 py-1 ${
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'ready' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => alert(`Order Details:\n\nCustomer: ${order.customerName}\nGarment: ${order.garmentType}\nFabric: ${order.fabric}\nColor: ${order.color}\nQuantity: ${order.quantity}\nPrice: ₹${order.price}\nAdvance: ₹${order.advancePayment}\nDelivery Date: ${new Date(order.deliveryDate).toLocaleDateString()}\nStatus: ${order.status}\nSpecial Instructions: ${order.specialInstructions}`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorShopApp;