import React from 'react';

const Navigation = ({ currentPage, onPageChange, isAdmin }) => {
  const adminPages = [
    { key: "dashboard", label: "Dashboard" },
    { key: "customers", label: "Customers" },
    { key: "orders", label: "Orders" }
  ];

  const userPages = [
    { key: "dashboard", label: "Dashboard" }
  ];

  const pages = isAdmin ? adminPages : userPages;

  return (
    <nav className="navigation">
      <div className="nav-buttons">
        {pages.map(page => (
          <button
            key={page.key}
            className={`nav-btn ${currentPage === page.key ? 'active' : ''}`}
            onClick={() => onPageChange(page.key)}
          >
            {page.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;