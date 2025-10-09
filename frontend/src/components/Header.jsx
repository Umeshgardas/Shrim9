import React from 'react';

const Header = ({ user, onLogout, isAdmin }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Tailor Shop {!isAdmin && <span className="user-badge">User</span>}</h1>
        <div className="header-user">
          <span className="user-welcome">
            Welcome, {user?.name} 
            {isAdmin && <span className="role-badge">Admin</span>}
          </span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;