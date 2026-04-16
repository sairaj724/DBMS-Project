import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { apiService } from "../services/api";
import "../styles/AdminDashboard.css";

function AdminDashboard({ admin }) {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("month");
  const [stats, setStats] = useState({
    totalScholarships: 0,
    activeApplications: 0,
    approvedCount: 0,
    pendingCount: 0,
    totalDisbursed: 0,
  });
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [scholarshipsRes, applicationsRes] = await Promise.all([
          apiService.getScholarships(),
          apiService.getApplications()
        ]);

        if (scholarshipsRes.success) {
          setScholarships(scholarshipsRes.data || []);
        }

        if (applicationsRes.success) {
          const apps = applicationsRes.data || [];
          setApplications(apps);
          
          // Calculate stats
          const approvedApps = apps.filter(a => a.status === 'approved');
          const pendingApps = apps.filter(a => a.status === 'pending');
          const totalAmount = approvedApps.reduce((sum, a) => sum + (a.scholarships?.amount || 0), 0);
          
          setStats({
            totalScholarships: scholarshipsRes.data?.length || 0,
            activeApplications: apps.length,
            approvedCount: approvedApps.length,
            pendingCount: pendingApps.length,
            totalDisbursed: totalAmount,
          });

          // Get recent applications (last 5)
          const recent = apps.slice(0, 5).map(app => ({
            id: app.application_id?.slice(0, 8) || 'N/A',
            student: app.student_profile?.users?.name || 'Unknown',
            scholarship: app.scholarships?.name || 'Unknown',
            date: new Date(app.applied_date).toLocaleDateString(),
            status: app.status === 'pending' ? 'Under Review' :
                    app.status === 'approved' ? 'Approved' :
                    app.status === 'rejected' ? 'Rejected' : 'Pending Issues'
          }));
          setRecentApps(recent);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate dynamic stats
  const dashboardStats = [
    {
      title: "Total Scholarships",
      value: stats.totalScholarships,
      icon: Award,
      color: "blue",
      change: "Available programs",
    },
    {
      title: "Active Applications",
      value: stats.activeApplications,
      icon: FileText,
      color: "green",
      change: "All time",
    },
    {
      title: "Approved",
      value: stats.approvedCount,
      icon: CheckCircle,
      color: "purple",
      change: "Total approved",
    },
    {
      title: "Pending Review",
      value: stats.pendingCount,
      icon: Clock,
      color: "yellow",
      change: "Requires attention",
    },
    {
      title: "Total Students",
      value: "-",
      icon: Users,
      color: "red",
      change: "Registered",
    },
    {
      title: "Amount Disbursed",
      value: `₹${(stats.totalDisbursed / 100000).toFixed(2)}L`,
      icon: DollarSign,
      color: "teal",
      change: "Total approved amount",
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
      description: `${stats.pendingCount} applications pending review`,
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

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <Loader2 className="loading-icon" />
          <p>Loading dashboard...</p>
        </div>
      )}

      {/* Content when not loading */}
      {!loading && (
        <>
          {/* Stats Grid */}
          <div className="admin-stats-grid">
            {dashboardStats.map((stat, index) => {
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
                  {recentApps.map((app) => (
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
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
