import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  AlertTriangle,
  Download,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { scholarships, applications } from "../data/dummyData";
import EligibilityBadge from "../components/EligibilityBadge";
import "../styles/ScholarshipDetails.css";

function ScholarshipDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const scholarship = scholarships.find((s) => s.id === parseInt(id));

  if (!scholarship) {
    return (
      <div className="not-found">
        <h2>Scholarship Not Found</h2>
        <button onClick={() => navigate("/scholarships")}>Back to Scholarships</button>
      </div>
    );
  }

  // Check if already applied
  const hasApplied = applications.some(
    (app) => app.scholarshipId === scholarship.id && app.studentId === user?.id
  );

  // Check eligibility
  const checkEligibility = () => {
    if (!user) return { status: "partial", reason: "Login to check eligibility" };

    const reasons = [];

    if (user.cgpa < scholarship.eligibility.minCgpa) {
      reasons.push(`CGPA must be at least ${scholarship.eligibility.minCgpa}`);
    }

    if (user.income > scholarship.eligibility.maxIncome) {
      reasons.push(`Family income must be below ₹${scholarship.eligibility.maxIncome.toLocaleString()}`);
    }

    if (!scholarship.eligibility.caste.includes(user.caste) && !scholarship.eligibility.caste.includes("All")) {
      reasons.push(`Only for ${scholarship.eligibility.caste.join(", ")} categories`);
    }

    if (scholarship.eligibility.gender && scholarship.eligibility.gender !== user.gender) {
      reasons.push(`Only for ${scholarship.eligibility.gender} students`);
    }

    if (reasons.length === 0) {
      return { status: "eligible", reason: "You meet all eligibility criteria" };
    }

    return { status: "not-eligible", reason: reasons.join("; ") };
  };

  const eligibility = checkEligibility();
  const daysLeft = Math.ceil((new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  const handleApply = () => {
    setShowApplyModal(true);
  };

  const confirmApply = () => {
    // Simulate API call
    setTimeout(() => {
      setApplySuccess(true);
      setTimeout(() => {
        setShowApplyModal(false);
        navigate("/applications");
      }, 2000);
    }, 1000);
  };

  return (
    <div className="scholarship-details-page">
      {/* Back Navigation */}
      <button className="back-btn" onClick={() => navigate("/scholarships")}>
        <ArrowLeft className="btn-icon" />
        Back to Scholarships
      </button>

      {/* Header Section */}
      <div className="details-header">
        <div className="header-content">
          <div className="scholarship-badge-large">
            <Award className="badge-icon" />
          </div>
          <div className="header-text">
            <div className="header-top">
              <span className="category-badge">{scholarship.category}</span>
              {user && <EligibilityBadge status={eligibility.status} reason={eligibility.reason} />}
            </div>
            <h1>{scholarship.name}</h1>
            <p className="provider-name">by {scholarship.provider}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="header-actions">
          {hasApplied ? (
            <button className="applied-btn" disabled>
              <CheckCircle className="btn-icon" />
              Already Applied
            </button>
          ) : eligibility.status === "eligible" ? (
            <button className="apply-now-btn" onClick={handleApply}>
              Apply Now
              <ChevronRight className="btn-icon" />
            </button>
          ) : (
            <button className="not-eligible-btn" disabled>
              <XCircle className="btn-icon" />
              Not Eligible
            </button>
          )}
          <button className="download-btn">
            <Download className="btn-icon" />
            Guidelines
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="details-grid">
        {/* Left Column - Main Info */}
        <div className="details-main">
          {/* Quick Stats */}
          <div className="quick-stats-bar">
            <div className="stat-box">
              <DollarSign className="stat-icon" />
              <div>
                <span className="stat-label">Scholarship Amount</span>
                <span className="stat-value">₹{scholarship.amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-box">
              <Calendar className="stat-icon" />
              <div>
                <span className="stat-label">Application Deadline</span>
                <span className={`stat-value ${daysLeft <= 7 ? "urgent" : ""}`}>
                  {new Date(scholarship.deadline).toLocaleDateString()}
                  {daysLeft > 0 && ` (${daysLeft} days left)`}
                </span>
              </div>
            </div>
            <div className="stat-box">
              <Users className="stat-icon" />
              <div>
                <span className="stat-label">Applications</span>
                <span className="stat-value">{scholarship.applicationsCount} students</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="info-card">
            <h3>About this Scholarship</h3>
            <p>{scholarship.description}</p>
          </div>

          {/* Eligibility Criteria */}
          <div className="info-card">
            <h3>Eligibility Criteria</h3>
            <div className="criteria-list">
              <div className={`criterion ${user?.cgpa >= scholarship.eligibility.minCgpa ? "met" : ""}`}>
                <div className="criterion-icon">
                  {user?.cgpa >= scholarship.eligibility.minCgpa ? <CheckCircle /> : <div className="empty-circle" />}
                </div>
                <div className="criterion-content">
                  <span className="criterion-label">Minimum CGPA</span>
                  <span className="criterion-value">{scholarship.eligibility.minCgpa} or above</span>
                  {user && (
                    <span className={`user-value ${user.cgpa >= scholarship.eligibility.minCgpa ? "met" : "not-met"}`}>
                      Your CGPA: {user.cgpa}
                    </span>
                  )}
                </div>
              </div>

              <div className={`criterion ${user?.income <= scholarship.eligibility.maxIncome ? "met" : ""}`}>
                <div className="criterion-icon">
                  {user?.income <= scholarship.eligibility.maxIncome ? <CheckCircle /> : <div className="empty-circle" />}
                </div>
                <div className="criterion-content">
                  <span className="criterion-label">Family Income</span>
                  <span className="criterion-value">
                    Below ₹{scholarship.eligibility.maxIncome.toLocaleString()} per annum
                  </span>
                  {user && (
                    <span className={`user-value ${user.income <= scholarship.eligibility.maxIncome ? "met" : "not-met"}`}>
                      Your Income: ₹{user.income.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="criterion">
                <div className="criterion-icon">
                  <CheckCircle />
                </div>
                <div className="criterion-content">
                  <span className="criterion-label">Caste Category</span>
                  <span className="criterion-value">
                    {scholarship.eligibility.caste.includes("All") 
                      ? "Open to all categories" 
                      : scholarship.eligibility.caste.join(", ")}
                  </span>
                  {user && (
                    <span className={`user-value ${scholarship.eligibility.caste.includes(user.caste) || scholarship.eligibility.caste.includes("All") ? "met" : "not-met"}`}>
                      Your Category: {user.caste}
                    </span>
                  )}
                </div>
              </div>

              <div className="criterion">
                <div className="criterion-icon">
                  <CheckCircle />
                </div>
                <div className="criterion-content">
                  <span className="criterion-label">Year of Study</span>
                  <span className="criterion-value">
                    Year {scholarship.eligibility.year.join(", ")} students
                  </span>
                  {user && (
                    <span className={`user-value ${scholarship.eligibility.year.includes(user.year) ? "met" : "not-met"}`}>
                      Your Year: Year {user.year}
                    </span>
                  )}
                </div>
              </div>

              {scholarship.eligibility.gender && (
                <div className="criterion">
                  <div className="criterion-icon">
                    <CheckCircle />
                  </div>
                  <div className="criterion-content">
                    <span className="criterion-label">Gender</span>
                    <span className="criterion-value">{scholarship.eligibility.gender} students only</span>
                    {user && (
                      <span className={`user-value ${user.gender === scholarship.eligibility.gender ? "met" : "not-met"}`}>
                        Your Gender: {user.gender}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Required Documents */}
          <div className="info-card">
            <h3>Required Documents</h3>
            <div className="documents-list">
              {scholarship.documents.map((doc, index) => (
                <div key={index} className="document-item">
                  <FileText className="document-icon" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
            <div className="documents-note">
              <AlertTriangle className="note-icon" />
              <p>
                Ensure all documents are clear, legible, and valid. 
                Applications with incomplete documentation will be rejected.
              </p>
            </div>
          </div>

          {/* Process Timeline */}
          <div className="info-card">
            <h3>Application Process</h3>
            <div className="process-timeline">
              <div className="process-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Submit Application</h4>
                  <p>Fill the online form and upload required documents</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Document Verification</h4>
                  <p>Admin team verifies your documents and eligibility</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Committee Review</h4>
                  <p>Scholarship committee reviews your application</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Decision & Disbursement</h4>
                  <p>Final decision communicated and amount disbursed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="details-sidebar">
          {/* Important Dates */}
          <div className="sidebar-card">
            <h4>Important Dates</h4>
            <div className="dates-list">
              <div className="date-item">
                <Clock className="date-icon" />
                <div>
                  <span className="date-label">Application Opens</span>
                  <span className="date-value">Already Open</span>
                </div>
              </div>
              <div className="date-item">
                <Calendar className="date-icon urgent" />
                <div>
                  <span className="date-label">Application Deadline</span>
                  <span className="date-value urgent">{new Date(scholarship.deadline).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="date-item">
                <Clock className="date-icon" />
                <div>
                  <span className="date-label">Results Declaration</span>
                  <span className="date-value">Within 30 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="sidebar-card">
            <h4>Have Questions?</h4>
            <p className="help-text">
              Contact the scholarship coordinator for assistance
            </p>
            <a href="mailto:scholarships@vjti.ac.in" className="contact-link">
              <ExternalLink className="link-icon" />
              scholarships@vjti.ac.in
            </a>
          </div>

          {/* Similar Scholarships */}
          <div className="sidebar-card">
            <h4>Similar Scholarships</h4>
            <div className="similar-list">
              {scholarships
                .filter((s) => s.category === scholarship.category && s.id !== scholarship.id)
                .slice(0, 3)
                .map((s) => (
                  <div
                    key={s.id}
                    className="similar-item"
                    onClick={() => navigate(`/scholarships/${s.id}`)}
                  >
                    <span className="similar-name">{s.name}</span>
                    <span className="similar-amount">₹{s.amount.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal">
            {applySuccess ? (
              <div className="success-content">
                <div className="success-icon">
                  <CheckCircle />
                </div>
                <h3>Application Submitted!</h3>
                <p>Your application has been successfully submitted. You can track the status in your applications page.</p>
              </div>
            ) : (
              <>
                <h3>Confirm Application</h3>
                <p>
                  You are about to apply for <strong>{scholarship.name}</strong>.
                </p>
                <div className="apply-summary">
                  <div className="summary-item">
                    <span>Scholarship Amount:</span>
                    <strong>₹{scholarship.amount.toLocaleString()}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Required Documents:</span>
                    <strong>{scholarship.documents.length} documents</strong>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowApplyModal(false)}>
                    Cancel
                  </button>
                  <button className="btn-confirm" onClick={confirmApply}>
                    Confirm Application
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScholarshipDetails;
