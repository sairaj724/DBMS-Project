import { Link, useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, User, LogOut, Menu, X, Bell } from "lucide-react";
import { useState } from "react";
import "../styles/Navbar.css";

function Navbar({ user, isAdmin, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const studentLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/announcements", label: "Announcements" },
    { path: "/scholarships", label: "Scholarships" },
    { path: "/applications", label: "My Applications" },
    { path: "/profile", label: "Profile" },
  ];

  const adminLinks = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/scholarships", label: "Manage Scholarships" },
    { path: "/admin/applications", label: "Applications" },
    { path: "/admin/students", label: "Students" },
  ];

  const navLinks = isAdmin ? adminLinks : studentLinks;

  // Mock notifications
  const notifications = [
    { id: 1, message: "Your scholarship application has been approved!", time: "2 hours ago", read: false },
    { id: 2, message: "New scholarship available: Technical Excellence Award", time: "1 day ago", read: true },
    { id: 3, message: "Please upload missing documents for OBC Scholarship", time: "2 days ago", read: false },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="navbar-logo">
          <GraduationCap className="logo-icon" />
          <div className="logo-text">
            <span className="logo-title">ScholarSphere</span>
            <span className="logo-subtitle">VJTI Scholarship Portal</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links desktop-only">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Notifications */}
          {user && (
            <div className="notification-wrapper">
              <button
                className="notification-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="notification-icon" />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notifications</h4>
                    <button className="mark-all-read">Mark all read</button>
                  </div>
                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${!notification.read ? "unread" : ""}`}
                      >
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Info */}
          {user && (
            <div className="user-info desktop-only">
              <div className="user-avatar">
                <User className="avatar-icon" />
              </div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{isAdmin ? "Admin" : "Student"}</span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          {user && (
            <button onClick={handleLogout} className="logout-btn desktop-only">
              <LogOut className="logout-icon" />
              <span>Logout</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${isActive(link.path) ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <div className="mobile-user-info">
                <span className="mobile-user-name">{user.name}</span>
                <span className="mobile-user-role">{isAdmin ? "Admin" : "Student"}</span>
              </div>
              <button onClick={handleLogout} className="mobile-logout-btn">
                <LogOut className="logout-icon" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
