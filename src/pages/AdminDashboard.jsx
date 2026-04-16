import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Award,
  FileText,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  BarChart3,
  MoreVertical,
} from "lucide-react";
import { adminStats, scholarships, applications, allStudents } from "../data/dummyData";
import "../styles/AdminDashboard.css";

function AdminDashboard({ admin }) {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("month");

  // Calculate dynamic stats
  const stats = [
    {
      title: "Total Scholarships",
      value: adminStats.totalScholarships,
      icon: Award,
      color: "blue",
      change: "+2 this month",
    },
    {
      title: "Active Applications",
      value: adminStats.activeApplications,
      icon: FileText,
      color: "green",
      change: "+45 this week",
    },
    {
      title: "Approved (This Month)",
      value: adminStats.approvedThisMonth,
      icon: CheckCircle,
      color: "purple",
      change: "+12 from last month",
    },
    {
      title: "Pending Review",
      value: adminStats.pendingReview,
      icon: Clock,
      color: "yellow",
      change: "Requires attention",
    },
    {
      title: "Issues Reported",
      value: adminStats.issuesReported,
      icon: AlertCircle,
      color: "red",
      change: "5 new today",
    },
    {
      title: "Amount Disbursed",
      value: `₹${(adminStats.totalDisbursed / 100000).toFixed(2)}L`,
      icon: DollarSign,
      color: "teal",
      change: "+₹3.2L this month",
    },
  ];

  // Get status badge for recent applications
  const getStatusBadge = (status) => {
    const styles = {
      Applied: "applied",
      "Under Review": "review",
      Approved: "approved",
      Rejected: "rejected",
      "Pending Issues": "issues",
    };
    return styles[status] || "applied";
  };

  // Quick action cards
  const quickActions = [
    {
      title: "Manage Scholarships",
      description: "Add, edit, or remove scholarship programs",
      icon: Award,
      action: () => navigate("/admin/scholarships"),
      color: "blue",
    },
    {
      title: "Review Applications",
      description: `${adminStats.pendingReview} applications pending review`,
      icon: FileText,
      action: () => navigate("/admin/applications"),
      color: "green",
    },
    {
      title: "Student Database",
      description: "View and manage student records",
      icon: Users,
      action: () => navigate("/admin/students"),
      color: "purple",
    },
  ];

  return (
    <div className="admin-dashboard-page">
      {/* Header */}
      <div className="admin-header">
        <div className="welcome-section">
          <h1>Welcome, {admin?.name}</h1>
          <p>{admin?.role} • VJTI Scholarship Portal</p>
        </div>
        <div className="time-filter">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-icon-wrapper">
                <Icon className="stat-icon" />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-title">{stat.title}</span>
                <span className="stat-change">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className={`quick-action-card ${action.color}`}
                onClick={action.action}
              >
                <div className="action-icon-wrapper">
                  <Icon className="action-icon" />
                </div>
                <div className="action-content">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>
                <ChevronRight className="action-arrow" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="admin-content-grid">
        {/* Recent Applications */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Applications</h3>
            <button className="view-all-btn" onClick={() => navigate("/admin/applications")}>
              View All
              <ChevronRight className="btn-icon" />
            </button>
          </div>
          <div className="applications-table">
              <table>
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Student</th>
                    <th>Scholarship</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminStats.recentApplications.map((app) => (
                    <tr key={app.id}>
                      <td className="app-id">{app.id}</td>
                      <td className="student-name">{app.student}</td>
                      <td className="scholarship-name">{app.scholarship}</td>
                      <td className="app-date">{app.date}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>

        {/* Scholarship Overview */}
        <div className="content-card">
          <div className="card-header">
            <h3>Scholarship Overview</h3>
            <button className="view-all-btn" onClick={() => navigate("/admin/scholarships")}>
              Manage
              <ChevronRight className="btn-icon" />
            </button>
          </div>
          <div className="scholarship-list">
            {scholarships.slice(0, 5).map((scholarship) => (
              <div key={scholarship.id} className="scholarship-row">
                <div className="scholarship-info">
                  <span className="scholarship-name">{scholarship.name}</span>
                  <span className="scholarship-category">{scholarship.category}</span>
                </div>
                <div className="scholarship-stats">
                  <span className="stat">
                    <Users className="stat-mini-icon" />
                    {scholarship.applicationsCount}
                  </span>
                  <span className="amount">₹{(scholarship.amount / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        <div className="content-card">
          <div className="card-header">
            <h3>Application Trends</h3>
            <BarChart3 className="header-icon" />
          </div>
          <div className="chart-placeholder">
            <div className="mock-chart">
              <div className="chart-bar" style={{ height: "40%" }}>
                <span>Jan</span>
              </div>
              <div className="chart-bar" style={{ height: "60%" }}>
                <span>Feb</span>
              </div>
              <div className="chart-bar" style={{ height: "45%" }}>
                <span>Mar</span>
              </div>
              <div className="chart-bar" style={{ height: "70%" }}>
                <span>Apr</span>
              </div>
              <div className="chart-bar" style={{ height: "55%" }}>
                <span>May</span>
              </div>
              <div className="chart-bar" style={{ height: "80%" }}>
                <span>Jun</span>
              </div>
              <div className="chart-bar active" style={{ height: "90%" }}>
                <span>Jul</span>
              </div>
              <div className="chart-bar" style={{ height: "65%" }}>
                <span>Aug</span>
              </div>
              <div className="chart-bar" style={{ height: "75%" }}>
                <span>Sep</span>
              </div>
              <div className="chart-bar" style={{ height: "85%" }}>
                <span>Oct</span>
              </div>
              <div className="chart-bar" style={{ height: "70%" }}>
                <span>Nov</span>
              </div>
              <div className="chart-bar" style={{ height: "50%" }}>
                <span>Dec</span>
              </div>
            </div>
            <p className="chart-note">Application submissions by month (Mock Data)</p>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3>Category Distribution</h3>
          </div>
          <div className="category-distribution">
            <div className="category-item">
              <div className="category-info">
                <span className="category-dot merit"></span>
                <span>Merit Based</span>
              </div>
              <span className="category-value">35%</span>
            </div>
            <div className="category-item">
              <div className="category-info">
                <span className="category-dot scst"></span>
                <span>SC/ST</span>
              </div>
              <span className="category-value">25%</span>
            </div>
            <div className="category-item">
              <div className="category-info">
                <span className="category-dot obc"></span>
                <span>OBC</span>
              </div>
              <span className="category-value">20%</span>
            </div>
            <div className="category-item">
              <div className="category-info">
                <span className="category-dot ews"></span>
                <span>EWS</span>
              </div>
              <span className="category-value">12%</span>
            </div>
            <div className="category-item">
              <div className="category-info">
                <span className="category-dot special"></span>
                <span>Special</span>
              </div>
              <span className="category-value">8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
