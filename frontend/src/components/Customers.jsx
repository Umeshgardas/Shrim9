import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Users, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { toast } from 'react-toastify';
import CustomerModal from './CustomerModal';
import { API_URL } from '../constants';

const Customers = ({ customers, shirtFields, pantFields, onDataUpdate, token, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sorting state - matching Dashboard structure
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  // Filter customers based on search
  const baseFilteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  // Sort customers
  const filteredCustomers = React.useMemo(() => {
    if (!sortConfig.key) return baseFilteredCustomers;

    return [...baseFilteredCustomers].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle empty values
      if (!aValue && bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue && !bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      if (!aValue && !bValue) return 0;

      // Handle different data types for sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [baseFilteredCustomers, sortConfig]);

  // Handle sort request - matching Dashboard behavior
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Get sort icon - matching Dashboard icons exactly
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown size={16} className="sort-icon" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ChevronUp size={16} className="sort-icon active" />
      : <ChevronDown size={16} className="sort-icon active" />;
  };

  // Get aria-sort attribute for accessibility
  const getAriaSort = (key) => {
    if (sortConfig.key !== key) return 'none';
    return sortConfig.direction === 'ascending' ? 'ascending' : 'descending';
  };

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You need admin privileges to access the customers section.</p>
      </div>
    );
  }

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

  const performDeleteCustomer = async (id) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/customers/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        onDataUpdate();
        toast.success('Customer deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        const errorData = await res.json();
        toast.error(`Error deleting customer: ${errorData.message || res.statusText}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.log(err);
      toast.error('Error deleting customer. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this customer?</p>
        <div className="confirmation-buttons">
          <button
            onClick={async () => {
              toast.dismiss();
              await performDeleteCustomer(id);
            }}
            className="confirm-btn"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: true
      }
    );
  };

  const openModal = (customer = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="customers-page">
      <div className="action-bar">
        <h1 className="page-title">
          <Users className="page-title-icon" />
          Customers Management
        </h1>
        <div className="action-controls">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search customers..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="primary-btn" onClick={() => openModal()}>
            <Plus size={16} />
            Add Customer
          </button>
        </div>
      </div>

      {isModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          shirtFields={shirtFields}
          pantFields={pantFields}
          onClose={closeModal}
          onSave={onDataUpdate}
          token={token}
        />
      )}

      <div className="customers-list-section">
        <h2 className="section-title">Customer List</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th 
                  className="sortable-header" 
                  onClick={() => handleSort('name')}
                  aria-sort={getAriaSort('name')}
                >
                  <div className="header-content">
                    <span>Name</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="sortable-header" 
                  onClick={() => handleSort('phone')}
                  aria-sort={getAriaSort('phone')}
                >
                  <div className="header-content">
                    <span>Phone</span>
                    {getSortIcon('phone')}
                  </div>
                </th>
                <th 
                  className="sortable-header" 
                  onClick={() => handleSort('email')}
                  aria-sort={getAriaSort('email')}
                >
                  <div className="header-content">
                    <span>Email</span>
                    {getSortIcon('email')}
                  </div>
                </th>
                <th 
                  className="sortable-header" 
                  onClick={() => handleSort('address')}
                  aria-sort={getAriaSort('address')}
                >
                  <div className="header-content">
                    <span>Address</span>
                    {getSortIcon('address')}
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email || "-"}</td>
                  <td>{customer.address || "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => openModal(customer)}
                        title="Edit"
                        disabled={loading}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteCustomer(customer._id)}
                        title="Delete"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
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
  );
};

export default Customers;