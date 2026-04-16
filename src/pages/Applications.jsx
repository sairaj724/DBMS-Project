import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Search,
  Eye,
  Calendar,
  DollarSign,
} from "lucide-react";
import { scholarships, applications } from "../data/dummyData";
import StatusTracker from "../components/StatusTracker";
import "../styles/Applications.css";

function Applications({ user }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const scholarship = scholarships.find((s) => s.id === app.scholarshipId);
    
    // Filter by status
    if (filter !== "all" && app.status.toLowerCase().replace(" ", "-") !== filter) {
      return false;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = scholarship?.name.toLowerCase().includes(query);
      const matchId = app.id.toLowerCase().includes(query);
      if (!matchName && !matchId) return false;
    }

    return app.studentId === user?.id;
  });

  // Stats
  const stats = {
    total: applications.filter((a) => a.studentId === user?.id).length,
    approved: applications.filter((a) => a.studentId === user?.id && a.status === "Approved").length,
    underReview: applications.filter((a) => a.studentId === user?.id && a.status === "Under Review").length,
    pendingIssues: applications.filter((a) => a.studentId === user?.id && a.status === "Pending Issues").length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="status-icon approved" />;
      case "Rejected":
        return <XCircle className="status-icon rejected" />;
      case "Pending Issues":
        return <AlertCircle className="status-icon pending-issues" />;
      case "Under Review":
        return <Clock className="status-icon review" />;
      default:
        return <FileText className="status-icon applied" />;
    }
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(" ", "-");
  };

  return (
    <div className="applications-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track and manage your scholarship applications</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card total">
          <FileText className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>
        <div className="stat-card approved">
          <CheckCircle className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
        <div className="stat-card review">
          <Clock className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.underReview}</span>
            <span className="stat-label">Under Review</span>
          </div>
        </div>
        <div className="stat-card issues">
          <AlertCircle className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.pendingIssues}</span>
            <span className="stat-label">Pending Issues</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-bar">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "under-review" ? "active" : ""}
            onClick={() => setFilter("under-review")}
          >
            Under Review
          </button>
          <button
            className={filter === "pending-issues" ? "active" : ""}
            onClick={() => setFilter("pending-issues")}
          >
            Pending Issues
          </button>
          <button
            className={filter === "approved" ? "active" : ""}
            onClick={() => setFilter("approved")}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="applications-list">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app) => {
            const scholarship = scholarships.find((s) => s.id === app.scholarshipId);
            return (
              <div
                key={app.id}
                className={`application-card ${getStatusClass(app.status)}`}
              >
                <div className="app-header">
                  <div className="app-id">{app.id}</div>
                  <div className={`app-status-badge ${getStatusClass(app.status)}`}>
                    {getStatusIcon(app.status)}
                    <span>{app.status}</span>
                  </div>
                </div>

                <div className="app-body">
                  <div className="scholarship-info">
                    <h4>{scholarship?.name}</h4>
                    <p className="provider">{scholarship?.provider}</p>
                  </div>

                  <div className="app-details">
                    <div className="detail">
                      <DollarSign className="detail-icon" />
                      <span>₹{scholarship?.amount.toLocaleString()}</span>
                    </div>
                    <div className="detail">
                      <Calendar className="detail-icon" />
                      <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {app.remarks && (
                  <div className="app-remarks">
                    <p>{app.remarks}</p>
                  </div>
                )}

                <div className="app-footer">
                  <button
                    className="view-details-btn"
                    onClick={() => setSelectedApp(app)}
                  >
                    <Eye className="btn-icon" />
                    View Details
                  </button>
                  {app.status === "Pending Issues" && (
                    <button className="resolve-btn">
                      <AlertCircle className="btn-icon" />
                      Resolve Issues
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <FileText className="empty-icon" />
            <h3>No applications found</h3>
            <p>
              {searchQuery || filter !== "all"
                ? "Try adjusting your filters"
                : "Start applying for scholarships to see them here"}
            </p>
            {!searchQuery && filter === "all" && (
              <button
                className="browse-btn"
                onClick={() => navigate("/scholarships")}
              >
                Browse Scholarships
                <ChevronRight className="btn-icon" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Application Details</h3>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {(() => {
                const scholarship = scholarships.find((s) => s.id === selectedApp.scholarshipId);
                return (
                  <>
                    <div className="app-detail-header">
                      <div>
                        <h4>{scholarship?.name}</h4>
                        <p className="app-id">Application ID: {selectedApp.id}</p>
                      </div>
                      <div className={`status-badge-large ${getStatusClass(selectedApp.status)}`}>
                        {getStatusIcon(selectedApp.status)}
                        <span>{selectedApp.status}</span>
                      </div>
                    </div>

                    <StatusTracker
                      status={selectedApp.status}
                      timeline={selectedApp.timeline}
                      issues={selectedApp.issues || []}
                    />

                    <div className="app-info-grid">
                      <div className="info-box">
                        <span className="label">Applied On</span>
                        <span className="value">{new Date(selectedApp.appliedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="info-box">
                        <span className="label">Last Updated</span>
                        <span className="value">{new Date(selectedApp.lastUpdated).toLocaleDateString()}</span>
                      </div>
                      <div className="info-box">
                        <span className="label">Scholarship Amount</span>
                        <span className="value">₹{scholarship?.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    {selectedApp.remarks && (
                      <div className="remarks-section">
                        <h5>Admin Remarks</h5>
                        <p>{selectedApp.remarks}</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button className="btn-close" onClick={() => setSelectedApp(null)}>
                Close
              </button>
              {selectedApp.status === "Pending Issues" && (
                <button className="btn-primary">Upload Documents</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Applications;
