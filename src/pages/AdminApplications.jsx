import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { apiService } from "../services/api";
import StatusTracker from "../components/StatusTracker";
import "../styles/AdminApplications.css";

function AdminApplications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch applications on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getApplications();
      console.log('Applications response:', response);
      setApplications(response.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load applications: " + err.message);
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format status for display (convert from DB format to display format)
  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'withdrawn': 'Withdrawn'
    };
    return statusMap[status] || status;
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const appId = app.application_id?.toLowerCase() || '';
      const studentName = `${app.student_profile?.first_name || ''} ${app.student_profile?.last_name || ''}`.toLowerCase();
      const scholarshipName = app.scholarships?.name?.toLowerCase() || '';
      if (!appId.includes(query) && !studentName.includes(query) && !scholarshipName.includes(query)) return false;
    }
    if (statusFilter !== "all" && app.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleStatusUpdate = async (newStatus) => {
    try {
      await apiService.updateApplication(selectedApp.application_id, {
        status: newStatus.toLowerCase(),
        admin_notes: remarks
      });
      setSelectedApp({ ...selectedApp, status: newStatus.toLowerCase() });
      await fetchApplications();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const displayStatus = formatStatus(status);
    const config = {
      'Pending': { class: "applied", icon: Clock },
      'Approved': { class: "approved", icon: CheckCircle },
      'Rejected': { class: "rejected", icon: XCircle },
      'Withdrawn': { class: "issues", icon: AlertCircle },
    };
    const { class: className, icon: Icon } = config[displayStatus] || config['Pending'];
    return (
      <span className={`status-badge ${className}`}>
        <Icon className="badge-icon" />
        {displayStatus}
      </span>
    );
  };

  // Pagination (mock)
  const totalPages = Math.ceil(filteredApplications.length / 10);
  const currentPage = 1;

  return (
    <div className="admin-applications-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Review Applications</h1>
          <p>Manage and process student scholarship applications</p>
        </div>
        <button className="export-btn">
          <Download className="btn-icon" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID, student name, or scholarship..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{filteredApplications.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item applied">
          <span className="stat-number">
            {filteredApplications.filter((a) => a.status === "pending").length}
          </span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item approved">
          <span className="stat-number">
            {filteredApplications.filter((a) => a.status === "approved").length}
          </span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-item rejected">
          <span className="stat-number">
            {filteredApplications.filter((a) => a.status === "rejected").length}
          </span>
          <span className="stat-label">Rejected</span>
        </div>
        <div className="stat-item issues">
          <span className="stat-number">
            {filteredApplications.filter((a) => a.status === "withdrawn").length}
          </span>
          <span className="stat-label">Withdrawn</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <Loader2 className="loading-icon" />
          <p>Loading applications...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchApplications}>Retry</button>
        </div>
      )}

      {/* Applications Table */}
      {!loading && !error && (
      <div className="applications-table-container">
        <table className="applications-table">
          <thead>
            <tr>
              <th>App ID</th>
              <th>Student</th>
              <th>Scholarship</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr key={app.application_id}>
                <td className="app-id">{app.application_id?.slice(0, 8)}...</td>
                <td>
                  <div className="student-cell">
                    <div className="student-avatar">
                      <User className="avatar-icon" />
                    </div>
                    <div className="student-info">
                      <span className="student-name">{app.student_profile?.first_name} {app.student_profile?.last_name}</span>
                      <span className="student-dept">{app.student_profile?.department}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="scholarship-cell">
                    <span className="scholarship-name">{app.scholarships?.name}</span>
                    <span className="scholarship-amount">
                      ₹{app.scholarships?.amount?.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar className="cell-icon" />
                    {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                <td>{getStatusBadge(app.status)}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => setSelectedApp(app)}
                  >
                    <Eye className="btn-icon" />
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredApplications.length === 0 && (
          <div className="empty-state">
            <FileText className="empty-icon" />
            <p>No applications found</p>
          </div>
        )}

        {/* Pagination */}
        {filteredApplications.length > 0 && (
          <div className="pagination">
            <button className="page-btn" disabled>
              <ChevronLeft className="btn-icon" />
              Previous
            </button>
            <div className="page-numbers">
              <span className="page-number active">1</span>
            </div>
            <button className="page-btn" disabled>
              Next
              <ChevronRight className="btn-icon" />
            </button>
          </div>
        )}
      </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Review Application</h3>
                <p className="app-id">{selectedApp.application_id}</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>
                <X className="close-icon" />
              </button>
            </div>

            <div className="modal-body">
              <div className="review-grid">
                {/* Student Info */}
                <div className="info-card">
                  <h4>Student Information</h4>
                  <div className="info-rows">
                    <div className="info-row">
                      <span className="label">Name</span>
                      <span className="value">{selectedApp.student_profile?.first_name} {selectedApp.student_profile?.last_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Email</span>
                      <span className="value">{selectedApp.student_profile?.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Department</span>
                      <span className="value">{selectedApp.student_profile?.department}</span>
                    </div>
                  </div>
                </div>

                {/* Scholarship Info */}
                <div className="info-card">
                  <h4>Scholarship Details</h4>
                  <div className="info-rows">
                    <div className="info-row">
                      <span className="label">Scholarship</span>
                      <span className="value">{selectedApp.scholarships?.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Amount</span>
                      <span className="value highlight">
                        ₹{selectedApp.scholarships?.amount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Category</span>
                      <span className="value">{selectedApp.scholarships?.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="tracker-section">
                <h4>Current Status</h4>
                <div className="current-status">
                  {getStatusBadge(selectedApp.status)}
                  <span className="status-date">
                    Last updated: {selectedApp.updated_at ? new Date(selectedApp.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="remarks-section">
                <h4>
                  <MessageSquare className="section-icon" />
                  Admin Notes
                </h4>
                <textarea
                  rows="3"
                  value={remarks || selectedApp.admin_notes || ''}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add notes about this application..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-footer">
              <div className="footer-right">
                <button className="btn-cancel" onClick={() => setSelectedApp(null)}>
                  Close
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleStatusUpdate("Rejected")}
                >
                  <XCircle className="btn-icon" />
                  Reject
                </button>
                <button
                  className="btn-approve"
                  onClick={() => handleStatusUpdate("Approved")}
                >
                  <CheckCircle className="btn-icon" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminApplications;
