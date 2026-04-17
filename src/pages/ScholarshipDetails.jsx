import { useState, useEffect } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiService } from "../services/api";
import EligibilityBadge from "../components/EligibilityBadge";
import "../styles/ScholarshipDetails.css";

function ScholarshipDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [scholarship, setScholarship] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applying, setApplying] = useState(false);

  // Fetch scholarship data, user profile, and check existing applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch scholarship details
        const scholarshipRes = await apiService.getScholarship(id);
        
        // Fetch user profile
        let profileData = null;
        if (user?.user_id) {
          try {
            const profileRes = await apiService.getStudentProfileByUserId(user.user_id);
            if (profileRes.success) {
              profileData = profileRes.data;
            }
          } catch (err) {
            console.log("Profile not found");
          }
        }
        
        // Check if user already applied for this scholarship
        let existingApp = null;
        if (user?.user_id && profileData?.id) {
          try {
            const appsRes = await apiService.getStudentApplications(profileData.id);
            if (appsRes.success && appsRes.data) {
              existingApp = appsRes.data.find(app => app.scholarship_id === id);
            }
          } catch (err) {
            console.log("Could not fetch applications");
          }
        }
        
        if (scholarshipRes.success) {
          // Transform scholarship data
          const s = scholarshipRes.data;
          setScholarship({
            id: s.scholarship_id,
            name: s.name,
            description: s.description,
            provider: "VJTI Trust",
            amount: s.amount,
            deadline: s.deadline,
            category: s.category || "General",
            status: s.is_active ? "Active" : "Inactive",
            applicationsCount: 0, // Could fetch this separately
            documents: s.documents || ["Income Certificate", "Caste Certificate", "Marksheet"],
            eligibility: {
              minCgpa: s.min_cgpa || 0,
              maxIncome: s.max_income || 10000000,
              category: s.category === "ALL" ? ["All"] : s.category ? [s.category] : ["All"],
              caste: s.category === "ALL" ? ["All"] : s.category ? [s.category] : ["All"],
              departments: ["All"],
              year: [1, 2, 3, 4],
              gender: s.gender || "all",
              hosteller: s.hosteller
            }
          });
          setUserProfile(profileData);
          setExistingApplication(existingApp);
        } else {
          setError("Failed to fetch scholarship details");
        }
      } catch (err) {
        setError(err.message || "Error loading scholarship");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.user_id]);

  if (loading) {
    return (
      <div className="scholarship-details-page">
        <div className="loading-container">
          <Loader2 className="loading-spinner" />
          <p>Loading scholarship details...</p>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="not-found">
        <h2>{error || "Scholarship Not Found"}</h2>
        <button onClick={() => navigate("/scholarships")}>Back to Scholarships</button>
      </div>
    );
  }

  // Check if already applied
  const hasApplied = !!existingApplication;

  // Check eligibility using profile data
  const checkEligibility = () => {
    if (!user) return { status: "partial", reason: "Login to check eligibility" };
    
    const studentData = userProfile || user;
    const studentCgpa = parseFloat(studentData?.cgpa) || 0;
    const studentIncome = parseFloat(studentData?.income) || 0;
    const studentCategory = studentData?.category || studentData?.caste || "";
    const studentGender = (studentData?.gender || "").toLowerCase();
    const studentYear = parseInt(studentData?.year) || parseInt(studentData?.year_of_study) || 1;
    const studentHosteller = studentData?.hosteller || false;

    const reasons = [];
    const minCgpa = parseFloat(scholarship.eligibility.minCgpa) || 0;
    const maxIncome = parseFloat(scholarship.eligibility.maxIncome) || 10000000;

    if (studentCgpa < minCgpa) {
      reasons.push(`CGPA must be at least ${minCgpa} (you have ${studentCgpa})`);
    }

    if (studentIncome > maxIncome) {
      reasons.push(`Family income must be below ₹${maxIncome.toLocaleString()} (you have ₹${studentIncome.toLocaleString()})`);
    }

    const allowedCategories = scholarship.eligibility.category || scholarship.eligibility.caste || ["All"];
    const categoryMatch = allowedCategories.includes("All") || 
                          allowedCategories.includes(studentCategory) ||
                          allowedCategories.some(cat => cat.toLowerCase() === studentCategory.toLowerCase());
    if (!categoryMatch && studentCategory) {
      reasons.push(`Only for ${allowedCategories.join(", ")} categories`);
    }

    const scholarshipGender = (scholarship.eligibility.gender || "all").toLowerCase();
    if (scholarshipGender !== "all" && scholarshipGender !== studentGender && studentGender) {
      reasons.push(`Only for ${scholarship.eligibility.gender} students`);
    }

    if (!scholarship.eligibility.year.includes(studentYear)) {
      reasons.push(`Only for year ${scholarship.eligibility.year.join(", ")} students`);
    }
    
    if (scholarship.eligibility.hosteller === true && !studentHosteller) {
      reasons.push(`Only for hosteller students`);
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

  const confirmApply = async () => {
    setApplying(true);
    try {
      // Create application
      const applicationData = {
        student_id: userProfile?.id || user?.user_id,
        scholarship_id: id,
        status: 'pending',
        admin_notes: ''
      };
      
      const response = await apiService.createApplication(applicationData);
      
      if (response.success) {
        setApplySuccess(true);
        setExistingApplication(response.data);
        setTimeout(() => {
          setShowApplyModal(false);
          navigate("/applications");
        }, 2000);
      } else {
        alert("Failed to submit application: " + (response.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error submitting application: " + err.message);
    } finally {
      setApplying(false);
    }
  };

  // Format application status for display
  const getApplicationStatusDisplay = () => {
    if (!existingApplication) return null;
    const status = existingApplication.status?.toLowerCase();
    const statusConfig = {
      pending: { text: "Applied - Under Verification", class: "applied", icon: Clock },
      approved: { text: "Verified and Approved", class: "approved", icon: CheckCircle },
      rejected: { text: "Application Rejected", class: "rejected", icon: XCircle },
      under_review: { text: "Under Review", class: "applied", icon: Clock }
    };
    return statusConfig[status] || { text: "Applied", class: "applied", icon: CheckCircle };
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
            (() => {
              const statusDisplay = getApplicationStatusDisplay();
              const StatusIcon = statusDisplay?.icon || CheckCircle;
              return (
                <button className={`applied-btn ${statusDisplay?.class || ''}`} disabled>
                  <StatusIcon className="btn-icon" />
                  {statusDisplay?.text || "Already Applied"}
                </button>
              );
            })()
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
              {(() => {
                const studentData = userProfile || user;
                const studentCgpa = parseFloat(studentData?.cgpa) || 0;
                const minCgpa = parseFloat(scholarship.eligibility.minCgpa) || 0;
                const studentIncome = parseFloat(studentData?.income) || 0;
                const maxIncome = parseFloat(scholarship.eligibility.maxIncome) || 10000000;
                const studentCategory = studentData?.category || studentData?.caste || "";
                const allowedCategories = scholarship.eligibility.category || scholarship.eligibility.caste || ["All"];
                const categoryMatch = allowedCategories.includes("All") || 
                                      allowedCategories.includes(studentCategory) ||
                                      allowedCategories.some(cat => cat.toLowerCase() === studentCategory.toLowerCase());
                const studentYear = parseInt(studentData?.year) || parseInt(studentData?.year_of_study) || 1;
                const studentGender = (studentData?.gender || "").toLowerCase();
                const scholarshipGender = (scholarship.eligibility.gender || "all").toLowerCase();
                
                return (
                  <>
                    <div className={`criterion ${studentCgpa >= minCgpa ? "met" : ""}`}>
                      <div className="criterion-icon">
                        {studentCgpa >= minCgpa ? <CheckCircle /> : <div className="empty-circle" />}
                      </div>
                      <div className="criterion-content">
                        <span className="criterion-label">Minimum CGPA</span>
                        <span className="criterion-value">{minCgpa} or above</span>
                        {user && (
                          <span className={`user-value ${studentCgpa >= minCgpa ? "met" : "not-met"}`}>
                            Your CGPA: {studentCgpa || 'Not set'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`criterion ${studentIncome <= maxIncome ? "met" : ""}`}>
                      <div className="criterion-icon">
                        {studentIncome <= maxIncome ? <CheckCircle /> : <div className="empty-circle" />}
                      </div>
                      <div className="criterion-content">
                        <span className="criterion-label">Family Income</span>
                        <span className="criterion-value">
                          Below ₹{maxIncome.toLocaleString()} per annum
                        </span>
                        {user && (
                          <span className={`user-value ${studentIncome <= maxIncome ? "met" : "not-met"}`}>
                            Your Income: ₹{(studentIncome || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`criterion ${!studentCategory || categoryMatch ? "met" : ""}`}>
                      <div className="criterion-icon">
                        {!studentCategory || categoryMatch ? <CheckCircle /> : <div className="empty-circle" />}
                      </div>
                      <div className="criterion-content">
                        <span className="criterion-label">Caste Category</span>
                        <span className="criterion-value">
                          {(scholarship.eligibility.category || scholarship.eligibility.caste || ["All"]).includes("All") 
                            ? "Open to all categories" 
                            : (scholarship.eligibility.category || scholarship.eligibility.caste || []).join(", ")}
                        </span>
                        {user && (
                          <span className={`user-value ${categoryMatch ? "met" : "not-met"}`}>
                            Your Category: {studentCategory || 'Not set'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`criterion ${scholarship.eligibility.year.includes(studentYear) ? "met" : ""}`}>
                      <div className="criterion-icon">
                        {scholarship.eligibility.year.includes(studentYear) ? <CheckCircle /> : <div className="empty-circle" />}
                      </div>
                      <div className="criterion-content">
                        <span className="criterion-label">Year of Study</span>
                        <span className="criterion-value">
                          Year {scholarship.eligibility.year.join(", ")} students
                        </span>
                        {user && (
                          <span className={`user-value ${scholarship.eligibility.year.includes(studentYear) ? "met" : "not-met"}`}>
                            Your Year: Year {studentYear}
                          </span>
                        )}
                      </div>
                    </div>

                    {scholarship.eligibility.gender && scholarshipGender !== "all" && (
                      <div className={`criterion ${studentGender === scholarshipGender ? "met" : ""}`}>
                        <div className="criterion-icon">
                          {studentGender === scholarshipGender ? <CheckCircle /> : <div className="empty-circle" />}
                        </div>
                        <div className="criterion-content">
                          <span className="criterion-label">Gender</span>
                          <span className="criterion-value">{scholarship.eligibility.gender} students only</span>
                          {user && (
                            <span className={`user-value ${studentGender === scholarshipGender ? "met" : "not-met"}`}>
                              Your Gender: {studentData?.gender || 'Not set'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
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

          {/* Application Status for Applied Scholarships */}
          {hasApplied && (
            <div className="sidebar-card status-card">
              <h4>Application Status</h4>
              <div className="status-display">
                {(() => {
                  const statusDisplay = getApplicationStatusDisplay();
                  const StatusIcon = statusDisplay?.icon || CheckCircle;
                  return (
                    <>
                      <StatusIcon className={`status-icon ${statusDisplay?.class}`} />
                      <span className={`status-text ${statusDisplay?.class}`}>
                        {statusDisplay?.text}
                      </span>
                    </>
                  );
                })()}
              </div>
              <p className="status-note">
                You can track your application status in the Applications page.
              </p>
              <button className="view-application-btn" onClick={() => navigate("/applications")}>
                View Application
              </button>
            </div>
          )}
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
                  <button className="btn-confirm" onClick={confirmApply} disabled={applying}>
                    {applying ? 'Submitting...' : 'Confirm Application'}
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
