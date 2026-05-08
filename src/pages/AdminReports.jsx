import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, ChevronLeft, BarChart3, Users, Award, Clock, Calendar, Loader2 } from "lucide-react";
import { apiService } from "../services/api";
import "../styles/AdminReports.css";

function AdminReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  const [dateRange, setDateRange] = useState("all");
  const [reportType, setReportType] = useState("summary");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, schRes, stuRes] = await Promise.all([
        apiService.getApplications(),
        apiService.getScholarships(),
        apiService.getStudents()
      ]);

      if (appsRes.success) setApplications(appsRes.data || []);
      if (schRes.success) setScholarships(schRes.data || []);
      if (stuRes.success) setStudents(stuRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      
      // Call API to generate PDF
      const pdfBlob = await apiService.generateReport(reportType, dateRange);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scholarsphere-${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate preview stats
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const totalAmount = applications
    .filter(a => a.status === 'approved')
    .reduce((sum, a) => sum + (a.scholarships?.amount || 0), 0);

  return (
    <div className="admin-reports-page">
      <div className="reports-header">
        <button className="back-btn" onClick={() => navigate("/admin")}>
          <ChevronLeft className="btn-icon" />
          Back to Dashboard
        </button>
        <div className="header-title">
          <FileText className="header-icon" />
          <div>
            <h1>Generate Reports</h1>
            <p>Create and download detailed PDF reports</p>
          </div>
        </div>
      </div>

      <div className="reports-container">
        <div className="report-options">
          <div className="option-card">
            <label>Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="summary">Summary Report</option>
              <option value="applications">Applications Report</option>
              <option value="students">Students Report</option>
            </select>
            <small>Choose the type of report you want to generate</small>
          </div>

          <div className="option-card">
            <label>Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="all">All Time</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
            <small>Filter data by time period</small>
          </div>

          <button 
            className="generate-btn" 
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="btn-icon spinner" />
                Generating...
              </>
            ) : (
              <>
                <Download className="btn-icon" />
                Download PDF Report
              </>
            )}
          </button>
        </div>

        <div className="report-preview">
          <h3>Current Statistics</h3>
          <div className="preview-cards">
            <div className="preview-card">
              <BarChart3 className="preview-icon" />
              <div>
                <span className="preview-value">{applications.length}</span>
                <span className="preview-label">Total Applications</span>
              </div>
            </div>
            <div className="preview-card">
              <Award className="preview-icon approved" />
              <div>
                <span className="preview-value">{approvedCount}</span>
                <span className="preview-label">Approved</span>
              </div>
            </div>
            <div className="preview-card">
              <Clock className="preview-icon pending" />
              <div>
                <span className="preview-value">{pendingCount}</span>
                <span className="preview-label">Pending Review</span>
              </div>
            </div>
            <div className="preview-card">
              <Users className="preview-icon" />
              <div>
                <span className="preview-value">{students.length}</span>
                <span className="preview-label">Registered Students</span>
              </div>
            </div>
            <div className="preview-card full-width">
              <Award className="preview-icon money" />
              <div>
                <span className="preview-value">₹{totalAmount.toLocaleString()}</span>
                <span className="preview-label">Total Amount Disbursed</span>
              </div>
            </div>
          </div>

          <div className="report-info">
            <h4>What&apos;s included in this report:</h4>
            {reportType === "summary" && (
              <ul>
                <li>Overall statistics (applications, approvals, rejections)</li>
                <li>Scholarship distribution and amounts</li>
                <li>Total disbursed amount summary</li>
                <li>Student registration summary</li>
                <li>Visual data presentation with tables</li>
              </ul>
            )}
            {reportType === "applications" && (
              <ul>
                <li>Complete list of all applications</li>
                <li>Student names and contact details</li>
                <li>Scholarship applied for</li>
                <li>Application status and dates</li>
                <li>Approved amounts</li>
              </ul>
            )}
            {reportType === "students" && (
              <ul>
                <li>Registered student directory</li>
                <li>Contact information (email)</li>
                <li>Academic details (department, year, CGPA)</li>
                <li>Number of applications per student</li>
                <li>Enrollment statistics</li>
              </ul>
            )}
          </div>

          <div className="note-box">
            <strong>Note:</strong> Reports are generated as PDF files and will be downloaded automatically to your device.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
