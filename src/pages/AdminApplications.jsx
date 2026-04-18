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
  FileIcon,
  ExternalLink,
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
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

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

  const handleSendRemarksOnly = async () => {
    if (!remarks.trim()) {
      alert('Please enter remarks before sending.');
      return;
    }

    try {
      // Update application with remarks only (no status change)
      await apiService.updateApplication(selectedApp.application_id, {
        admin_notes: remarks
      });

      // Create notification for student about admin remarks
      const userId = selectedApp.student_profile?.user_id;
      if (userId) {
        const notificationMessage = `Admin has added remarks to your application for ${selectedApp.scholarships?.name}: "${remarks}"`;

        try {
          await apiService.createNotification({
            user_id: userId,
            scholarship_id: selectedApp.scholarship_id,
            message: notificationMessage,
            notification_type: 'admin_remark'
          });
          alert('Remarks sent successfully! Student will be notified.');
        } catch (notifErr) {
          console.error('Failed to create notification:', notifErr);
          alert('Remarks saved but notification failed.');
        }
      } else {
        console.error('No user_id found in student_profile:', selectedApp.student_profile);
        alert('Remarks saved but could not notify student (user_id not found).');
      }

      await fetchApplications();
    } catch (err) {
      alert("Failed to send remarks: " + err.message);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await apiService.updateApplication(selectedApp.application_id, {
        status: newStatus.toLowerCase(),
        admin_notes: remarks
      });

      // Create notification for student about status update with remarks
      const userId = selectedApp.student_profile?.user_id;
      if (userId) {
        const notificationMessage = remarks
          ? `Your application for ${selectedApp.scholarships?.name} has been ${newStatus.toLowerCase()}. Remarks: ${remarks}`
          : `Your application for ${selectedApp.scholarships?.name} has been ${newStatus.toLowerCase()}.`;

        try {
          await apiService.createNotification({
            user_id: userId,
            scholarship_id: selectedApp.scholarship_id,
            message: notificationMessage,
            notification_type: 'admin_remark'
          });
        } catch (notifErr) {
          console.error('Failed to create notification:', notifErr);
        }
      } else {
        console.error('No user_id found in student_profile:', selectedApp.student_profile);
      }

      setSelectedApp({ ...selectedApp, status: newStatus.toLowerCase() });
      await fetchApplications();
      setRemarks('');
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const fetchDocuments = async (studentId) => {
    try {
      setDocumentsLoading(true);
      // Fetch from student_docs table (where student uploaded documents)
      const response = await apiService.getStudentDocuments(studentId);
      if (response.success && response.data) {
        // Transform student_docs record into array format
        const docs = response.data;
        const documentList = [];
        // student_docs table has columns for each document type
        const docTypes = [
          'income_certificate', 'caste_certificate', 'report_card',
          'bonafide_certificate', 'bank_passbook', 'caste_validity',
          'aadhar_card', 'pan_card', 'hostel_id_card', 'hostel_certificate', 'domicile'
        ];
        docTypes.forEach(type => {
          if (docs[type]) {
            documentList.push({
              document_id: `${studentId}-${type}`,
              document_type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              file_url: docs[type],
              uploaded_at: docs.updated_at || docs.created_at
            });
          }
        });
        setDocuments(documentList);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleViewApplication = (app) => {
    setSelectedApp(app);
    setRemarks(app.admin_notes || '');
    fetchDocuments(app.student_id);
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
                      onClick={() => handleViewApplication(app)}
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
        <div className="modal-overlay" onClick={() => { setSelectedApp(null); setDocuments([]); }}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Review Application</h3>
                <p className="roll-no-display">Roll No: {selectedApp.student_profile?.roll_number || 'N/A'}</p>
              </div>
              <button className="close-btn" onClick={() => { setSelectedApp(null); setDocuments([]); }}>
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

              {/* Documents Section */}
              <div className="documents-section">
                <h4>
                  <FileText className="section-icon" />
                  Uploaded Documents
                </h4>
                {documentsLoading ? (
                  <div className="documents-loading">
                    <Loader2 className="loading-icon" />
                    <span>Loading documents...</span>
                  </div>
                ) : documents.length > 0 ? (
                  <div className="documents-list">
                    {documents.map((doc) => (
                      <div key={doc.document_id} className="document-item">
                        <div className="document-info">
                          <FileIcon className="document-icon" size={20} />
                          <div className="document-details">
                            <span className="document-type">{doc.document_type}</span>
                            <span className="document-date">
                              Uploaded: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-document-btn"
                        >
                          <ExternalLink className="btn-icon" size={16} />
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="documents-empty">
                    <FileText className="empty-icon" size={32} />
                    <p>No documents uploaded for this application</p>
                  </div>
                )}
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
              <div className="footer-left">
                <button
                  className="btn-send-remarks"
                  onClick={handleSendRemarksOnly}
                  disabled={!remarks.trim()}
                >
                  <MessageSquare className="btn-icon" />
                  Send Remarks Only
                </button>
              </div>
              <div className="footer-right">
                <button className="btn-cancel" onClick={() => { setSelectedApp(null); setDocuments([]); }}>
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
