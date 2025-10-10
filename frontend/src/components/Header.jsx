import React from 'react';
import { LogOut, User, Crown } from 'lucide-react';

const Header = ({ user, onLogout, isAdmin }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <h1 className="header-title">
            👔 Shrim9 Tailor
            {!isAdmin && <span className="user-badge">User</span>}
          </h1>
        </div>
        <div className="header-user">
          <div className="user-info">
            <User className="user-icon" />
            <span className="user-welcome">
              Welcome, {user?.name}
              {isAdmin && (
                <span className="role-badge">
                  <Crown className="badge-icon" />
                  Admin
                </span>
              )}
            </span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <LogOut className="logout-icon" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;