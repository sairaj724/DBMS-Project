import { useNavigate } from "react-router-dom";
import {
  Award,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowRight,
  BookOpen,
  DollarSign,
} from "lucide-react";
import { scholarships, applications } from "../data/dummyData";
import StatusTracker from "../components/StatusTracker";
import "../styles/StudentDashboard.css";

function StudentDashboard({ user }) {
  const navigate = useNavigate();

  // Calculate stats
  const totalApplied = applications.length;
  const approved = applications.filter((a) => a.status === "Approved").length;
  const underReview = applications.filter((a) => a.status === "Under Review").length;
  const pendingIssues = applications.filter((a) => a.status === "Pending Issues").length;
  const totalAmount = applications
    .filter((a) => a.status === "Approved")
    .reduce((sum, app) => {
      const scholarship = scholarships.find((s) => s.id === app.scholarshipId);
      return sum + (scholarship?.amount || 0);
    }, 0);

  // Get eligible scholarships count
  const eligibleScholarships = scholarships.filter((s) => {
    return (
      user.cgpa >= s.eligibility.minCgpa &&
      user.income <= s.eligibility.maxIncome &&
      (s.eligibility.caste.includes(user.caste) || s.eligibility.caste.includes("All"))
    );
  }).length;

  // Get upcoming deadlines (next 30 days)
  const upcomingDeadlines = scholarships
    .filter((s) => {
      const deadline = new Date(s.deadline);
      const today = new Date();
      const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 30;
    })
    .slice(0, 3);

  return (
    <div className="dashboard-page">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome, {user.name}!</h1>
          <p>
            {user.department} • Year {user.year} • Roll No: {user.rollNumber}
          </p>
        </div>
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => navigate("/scholarships")}>
            <Award className="btn-icon" />
            Find Scholarships
          </button>
          <button className="action-btn secondary" onClick={() => navigate("/applications")}>
            <FileText className="btn-icon" />
            My Applications
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <FileText className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalApplied}</span>
            <span className="stat-label">Applications Submitted</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{approved}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper yellow">
            <Clock className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{underReview}</span>
            <span className="stat-label">Under Review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <AlertCircle className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{pendingIssues}</span>
            <span className="stat-label">Pending Issues</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <DollarSign className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-value">₹{totalAmount.toLocaleString()}</span>
            <span className="stat-label">Scholarships Received</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper teal">
            <Award className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{eligibleScholarships}</span>
            <span className="stat-label">Eligible Scholarships</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Application Status Section */}
        <div className="dashboard-section applications-section">
          <div className="section-header">
            <h2>Recent Applications</h2>
            <button className="view-all-btn" onClick={() => navigate("/applications")}>
              View All <ArrowRight className="btn-icon" />
            </button>
          </div>

          {applications.length > 0 ? (
            <div className="applications-list">
              {applications.slice(0, 2).map((app) => {
                const scholarship = scholarships.find((s) => s.id === app.scholarshipId);
                return (
                  <div key={app.id} className="application-card">
                    <div className="application-info">
                      <h4>{scholarship?.name}</h4>
                      <p className="provider">{scholarship?.provider}</p>
                      <p className="amount">₹{scholarship?.amount.toLocaleString()}</p>
                    </div>
                    <div className="application-status">
                      <StatusTracker
                        status={app.status}
                        timeline={app.timeline}
                        issues={app.issues || []}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <FileText className="empty-icon" />
              <p>No applications yet</p>
              <button onClick={() => navigate("/scholarships")}>Browse Scholarships</button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="dashboard-sidebar">
          {/* Academic Progress */}
          <div className="sidebar-card">
            <h3>Academic Profile</h3>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="stat-label">CGPA</span>
                <span className="stat-value highlight">{user.cgpa}</span>
              </div>
              <div className="profile-stat">
                <span className="stat-label">Year</span>
                <span className="stat-value">{user.year}rd Year</span>
              </div>
              <div className="profile-stat">
                <span className="stat-label">Department</span>
                <span className="stat-value">{user.department}</span>
              </div>
            </div>
            <button className="card-action-btn" onClick={() => navigate("/profile")}>
              View Full Profile
            </button>
          </div>

          {/* Upcoming Deadlines */}
          <div className="sidebar-card">
            <h3>Upcoming Deadlines</h3>
            {upcomingDeadlines.length > 0 ? (
              <div className="deadlines-list">
                {upcomingDeadlines.map((scholarship) => {
                  const daysLeft = Math.ceil(
                    (new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={scholarship.id} className="deadline-item">
                      <div className="deadline-info">
                        <span className="scholarship-name">{scholarship.name}</span>
                        <span className="deadline-date">
                          <Calendar className="calendar-icon" />
                          {new Date(scholarship.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`days-badge ${daysLeft <= 7 ? "urgent" : ""}`}>
                        {daysLeft} days left
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-deadlines">No upcoming deadlines</p>
            )}
            <button className="card-action-btn" onClick={() => navigate("/scholarships")}>
              View All Scholarships
            </button>
          </div>

          {/* Quick Tips */}
          <div className="sidebar-card tips-card">
            <h3>Quick Tips</h3>
            <ul className="tips-list">
              <li>
                <TrendingUp className="tip-icon" />
                <span>Keep your CGPA above 6.0 for most scholarships</span>
              </li>
              <li>
                <BookOpen className="tip-icon" />
                <span>Update your documents every semester</span>
              </li>
              <li>
                <CheckCircle className="tip-icon" />
                <span>Apply before deadlines to avoid last-minute issues</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
