import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Megaphone,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Award,
  Filter,
  Bell,
  Loader2,
} from "lucide-react";
import { apiService } from "../services/api";
import "../styles/Announcements.css";

function Announcements({ user }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // all, eligible, deadlines
  const [scholarships, setScholarships] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch scholarships and user profile from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch scholarships
        const scholarshipsResponse = await apiService.getScholarships();

        // Fetch user profile if logged in
        let profileData = null;
        if (user?.user_id) {
          try {
            const profileResponse = await apiService.getStudentProfileByUserId(user.user_id);
            if (profileResponse.success) {
              profileData = profileResponse.data;
            }
          } catch (profileErr) {
            console.log("Profile not found, using defaults");
          }
        }

        if (scholarshipsResponse.success) {
          // Transform data to match frontend format
          const transformed = scholarshipsResponse.data.map(s => ({
            id: s.scholarship_id,
            name: s.name,
            description: s.description,
            provider: "VJTI Trust",
            amount: s.amount,
            deadline: s.deadline,
            category: s.category || "General",
            status: s.is_active ? "Active" : "Inactive",
            eligibility: {
              minCgpa: s.min_cgpa || 0,
              maxIncome: s.max_income || 10000000,
              caste: s.category === "ALL" ? ["All"] : s.category ? [s.category] : ["All"],
              departments: ["All"],
              year: [1, 2, 3, 4],
              gender: s.gender || "all",
              hosteller: s.hosteller
            }
          }));
          setScholarships(transformed);
          setUserProfile(profileData);
        } else {
          setError("Failed to fetch scholarships");
        }
      } catch (err) {
        setError(err.message || "Error loading scholarships");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.user_id]);

  // Calculate eligibility for each scholarship
  const getEligibleStatus = (scholarship) => {
    // Use userProfile data if available, otherwise use user data
    const studentData = userProfile || user;
    if (!studentData) {
      return { isEligible: false, reasons: { cgpa: false, income: false, caste: false } };
    }

    const studentCgpa = parseFloat(studentData.cgpa) || 0;
    const studentIncome = parseFloat(studentData.income) || 0;
    const studentCategory = studentData.category || studentData.caste || "";

    const meetsCgpa = studentCgpa >= (scholarship.eligibility.minCgpa || 0);
    const meetsIncome = studentIncome <= (scholarship.eligibility.maxIncome || 10000000);
    const allowedCategories = scholarship.eligibility.caste || ["All"];
    const meetsCaste = allowedCategories.includes("All") ||
      allowedCategories.includes(studentCategory) ||
      allowedCategories.some(cat => cat.toLowerCase() === studentCategory.toLowerCase());

    return {
      isEligible: meetsCgpa && meetsIncome && meetsCaste,
      reasons: {
        cgpa: meetsCgpa,
        income: meetsIncome,
        caste: meetsCaste,
      },
    };
  };

  // Get deadline info - show red for deadlines within 3 months (90 days)
  const getDeadlineInfo = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    return {
      daysLeft,
      isUrgent: daysLeft <= 7 && daysLeft > 0,
      isExpired: daysLeft < 0,
      isCloseToDeadline: daysLeft > 0 && daysLeft <= 90, // 3 months = ~90 days
    };
  };

  // Process scholarships with eligibility and deadline info
  const processedScholarships = scholarships.map((s) => ({
    ...s,
    eligibilityStatus: getEligibleStatus(s),
    deadlineInfo: getDeadlineInfo(s.deadline),
  }));

  // Filter scholarships - show ALL scholarships regardless of eligibility
  const filteredScholarships = processedScholarships.filter((s) => {
    if (filter === "eligible") return s.eligibilityStatus.isEligible;
    if (filter === "deadlines")
      return s.deadlineInfo.daysLeft > 0 && s.deadlineInfo.daysLeft <= 90; // 3 months
    return true;
  });

  // Separate into categories
  const eligibleScholarships = filteredScholarships.filter(
    (s) => s.eligibilityStatus.isEligible
  );
  const otherScholarships = filteredScholarships.filter(
    (s) => !s.eligibilityStatus.isEligible
  );

  // Get urgent deadlines (ALL scholarships with deadlines within 3 months/90 days, not just eligible ones)
  const urgentDeadlines = filteredScholarships
    .filter((s) => s.deadlineInfo.daysLeft > 0 && s.deadlineInfo.daysLeft <= 90)
    .sort((a, b) => a.deadlineInfo.daysLeft - b.deadlineInfo.daysLeft);

  return (
    <div className="announcements-page">
      {/* Page Header */}
      <div className="announcements-header">
        <div className="header-content">
          <Megaphone className="header-icon" />
          <div>
            <h1>Scholarship Announcements</h1>
            <p>Discover scholarships you're eligible for and upcoming deadlines</p>
          </div>
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <Bell className="tab-icon" />
            All
          </button>
          <button
            className={`filter-tab ${filter === "eligible" ? "active" : ""}`}
            onClick={() => setFilter("eligible")}
          >
            <CheckCircle className="tab-icon" />
            You're Eligible
            {eligibleScholarships.length > 0 && (
              <span className="badge success">{eligibleScholarships.length}</span>
            )}
          </button>
          <button
            className={`filter-tab ${filter === "deadlines" ? "active" : ""}`}
            onClick={() => setFilter("deadlines")}
          >
            <Clock className="tab-icon" />
            Deadlines
            {urgentDeadlines.length > 0 && (
              <span className="badge warning">{urgentDeadlines.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="announcements-loading">
          <Loader2 className="loading-spinner" />
          <p>Loading scholarships...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="announcements-error">
          <AlertCircle className="error-icon" />
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {/* Urgent Deadlines Banner - Only show when scholarships have upcoming deadlines within 3 months */}
      {urgentDeadlines.length > 0 && filter !== "deadlines" && (
        <div className="urgent-deadlines-banner">
          <div className="banner-header">
            <AlertCircle className="banner-icon" />
            <h3>Upcoming Deadlines (Within 3 Months)</h3>
          </div>
          <div className="urgent-list">
            {urgentDeadlines.slice(0, 3).map((scholarship) => (
              <div
                key={scholarship.id}
                className={`urgent-item ${scholarship.deadlineInfo.isCloseToDeadline ? "critical" : ""}`}
              >
                <div className="urgent-info">
                  <span className="urgent-name">{scholarship.name}</span>
                  <span className="urgient-provider">{scholarship.provider}</span>
                </div>
                <div className="urgent-meta">
                  <span className="urgent-amount">₹{scholarship.amount.toLocaleString()}</span>
                  <span
                    className={`urgent-badge ${scholarship.deadlineInfo.isCloseToDeadline ? "urgent" : "normal"}`}
                  >
                    {scholarship.deadlineInfo.daysLeft} days left
                  </span>
                </div>
                <button
                  className="apply-now-btn"
                  onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                >
                  Apply Now <ArrowRight className="btn-icon" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
      <div className="announcements-content">
        {/* Eligible Scholarships Section */}
        {(filter === "all" || filter === "eligible") && eligibleScholarships.length > 0 && (
          <section className="scholarships-section eligible-section">
            <div className="section-header">
              <div className="header-title">
                <Award className="section-icon" />
                <h2>Scholarships You're Eligible For</h2>
              </div>
              <span className="count-badge">{eligibleScholarships.length} found</span>
            </div>
            <div className="scholarships-grid">
              {eligibleScholarships.map((scholarship) => (
                <div key={scholarship.id} className="announcement-card eligible">
                  <div className="card-header">
                    <span className="eligible-badge">
                      <CheckCircle className="badge-icon" />
                      You're Eligible
                    </span>
                    {scholarship.deadlineInfo.daysLeft <= 30 &&
                      scholarship.deadlineInfo.daysLeft > 0 && (
                        <span
                          className={`deadline-badge ${scholarship.deadlineInfo.isUrgent ? "urgent" : ""}`}
                        >
                          <Clock className="badge-icon" />
                          {scholarship.deadlineInfo.daysLeft} days left
                        </span>
                      )}
                  </div>
                  <h3 className="scholarship-name">{scholarship.name}</h3>
                  <p className="provider">{scholarship.provider}</p>
                  <div className="scholarship-details">
                    <div className="detail-item">
                      <span className="label">Amount</span>
                      <span className="value amount">
                        ₹{scholarship.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Deadline</span>
                      <span className="value">
                        <Calendar className="calendar-icon" />
                        {new Date(scholarship.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="eligibility-criteria">
                    <span
                      className={`criteria-tag ${scholarship.eligibilityStatus.reasons.cgpa ? "met" : ""}`}
                    >
                      CGPA {scholarship.eligibility.minCgpa}+
                    </span>
                    <span
                      className={`criteria-tag ${scholarship.eligibilityStatus.reasons.income ? "met" : ""}`}
                    >
                      Income ≤ ₹{scholarship.eligibility.maxIncome.toLocaleString()}
                    </span>
                    <span
                      className={`criteria-tag ${scholarship.eligibilityStatus.reasons.caste ? "met" : ""}`}
                    >
                      {scholarship.eligibility.caste.join(", ")}
                    </span>
                  </div>
                  <button
                    className="view-details-btn"
                    onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                  >
                    View Details & Apply
                    <ArrowRight className="btn-icon" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Other Scholarships Section */}
        {(filter === "all" || filter === "eligible") && otherScholarships.length > 0 && (
          <section className="scholarships-section other-section">
            <div className="section-header">
              <div className="header-title">
                <Filter className="section-icon" />
                <h2>Other Scholarships</h2>
              </div>
              <span className="count-badge">{otherScholarships.length}</span>
            </div>
            <div className="scholarships-grid">
              {otherScholarships.map((scholarship) => (
                <div key={scholarship.id} className="announcement-card">
                  <div className="card-header">
                    <span className="category-badge">{scholarship.category}</span>
                    {scholarship.deadlineInfo.daysLeft <= 30 &&
                      scholarship.deadlineInfo.daysLeft > 0 && (
                        <span
                          className={`deadline-badge ${scholarship.deadlineInfo.isUrgent ? "urgent" : ""}`}
                        >
                          <Clock className="badge-icon" />
                          {scholarship.deadlineInfo.daysLeft} days left
                        </span>
                      )}
                  </div>
                  <h3 className="scholarship-name">{scholarship.name}</h3>
                  <p className="provider">{scholarship.provider}</p>
                  <div className="scholarship-details">
                    <div className="detail-item">
                      <span className="label">Amount</span>
                      <span className="value amount">
                        ₹{scholarship.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Deadline</span>
                      <span className="value">
                        <Calendar className="calendar-icon" />
                        {new Date(scholarship.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="ineligible-reason">
                    <AlertCircle className="reason-icon" />
                    <span>
                      {!scholarship.eligibilityStatus.reasons.cgpa && "CGPA requirement not met"}
                      {!scholarship.eligibilityStatus.reasons.income && "Income exceeds limit"}
                      {!scholarship.eligibilityStatus.reasons.caste && "Category not eligible"}
                    </span>
                  </div>
                  <button
                    className="view-details-btn secondary"
                    onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Deadlines Section - Show when 'Deadlines' filter is selected */}
        {filter === "deadlines" && filteredScholarships.length > 0 && (
          <section className="scholarships-section deadlines-section">
            <div className="section-header">
              <div className="header-title">
                <Clock className="section-icon" />
                <h2>Scholarships with Upcoming Deadlines</h2>
              </div>
              <span className="count-badge">{filteredScholarships.length} found</span>
            </div>
            <div className="scholarships-grid">
              {filteredScholarships
                .sort((a, b) => a.deadlineInfo.daysLeft - b.deadlineInfo.daysLeft)
                .map((scholarship) => (
                <div key={scholarship.id} className={`announcement-card ${scholarship.eligibilityStatus.isEligible ? "eligible" : ""}`}>
                  <div className="card-header">
                    {scholarship.eligibilityStatus.isEligible ? (
                      <span className="eligible-badge">
                        <CheckCircle className="badge-icon" />
                        You're Eligible
                      </span>
                    ) : (
                      <span className="category-badge">{scholarship.category}</span>
                    )}
                    <span className={`deadline-badge urgent`}>
                      <Clock className="badge-icon" />
                      {scholarship.deadlineInfo.daysLeft} days left
                    </span>
                  </div>
                  <h3 className="scholarship-name">{scholarship.name}</h3>
                  <p className="provider">{scholarship.provider}</p>
                  <div className="scholarship-details">
                    <div className="detail-item">
                      <span className="label">Amount</span>
                      <span className="value amount">
                        ₹{scholarship.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Deadline</span>
                      <span className="value">
                        <Calendar className="calendar-icon" />
                        {new Date(scholarship.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {scholarship.eligibilityStatus.isEligible ? (
                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                    >
                      View Details & Apply
                      <ArrowRight className="btn-icon" />
                    </button>
                  ) : (
                    <button
                      className="view-details-btn secondary"
                      onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                    >
                      View Details
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filteredScholarships.length === 0 && (
          <div className="empty-state">
            <Bell className="empty-icon" />
            <h3>No announcements found</h3>
            <p>Try changing the filter to see more scholarships</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

export default Announcements;
