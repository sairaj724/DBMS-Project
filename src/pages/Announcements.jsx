import { useState } from "react";
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
} from "lucide-react";
import { scholarships } from "../data/dummyData";
import "../styles/Announcements.css";

function Announcements({ user }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // all, eligible, deadlines

  // Calculate eligibility for each scholarship
  const getEligibleStatus = (scholarship) => {
    const meetsCgpa = user.cgpa >= scholarship.eligibility.minCgpa;
    const meetsIncome = user.income <= scholarship.eligibility.maxIncome;
    const meetsCaste =
      scholarship.eligibility.caste.includes(user.caste) ||
      scholarship.eligibility.caste.includes("All");

    return {
      isEligible: meetsCgpa && meetsIncome && meetsCaste,
      reasons: {
        cgpa: meetsCgpa,
        income: meetsIncome,
        caste: meetsCaste,
      },
    };
  };

  // Get deadline info
  const getDeadlineInfo = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    return {
      daysLeft,
      isUrgent: daysLeft <= 7 && daysLeft > 0,
      isExpired: daysLeft < 0,
    };
  };

  // Process scholarships with eligibility and deadline info
  const processedScholarships = scholarships.map((s) => ({
    ...s,
    eligibilityStatus: getEligibleStatus(s),
    deadlineInfo: getDeadlineInfo(s.deadline),
  }));

  // Filter scholarships
  const filteredScholarships = processedScholarships.filter((s) => {
    if (filter === "eligible") return s.eligibilityStatus.isEligible;
    if (filter === "deadlines")
      return s.deadlineInfo.daysLeft > 0 && s.deadlineInfo.daysLeft <= 30;
    return true;
  });

  // Separate into categories
  const eligibleScholarships = filteredScholarships.filter(
    (s) => s.eligibilityStatus.isEligible
  );
  const otherScholarships = filteredScholarships.filter(
    (s) => !s.eligibilityStatus.isEligible
  );

  // Get urgent deadlines (all eligible scholarships with deadlines within 30 days)
  const urgentDeadlines = eligibleScholarships
    .filter((s) => s.deadlineInfo.daysLeft > 0 && s.deadlineInfo.daysLeft <= 30)
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

      {/* Urgent Deadlines Banner - Only show when eligible scholarships have urgent deadlines */}
      {urgentDeadlines.length > 0 && filter !== "deadlines" && (
        <div className="urgent-deadlines-banner">
          <div className="banner-header">
            <AlertCircle className="banner-icon" />
            <h3>Upcoming Deadlines for You</h3>
          </div>
          <div className="urgent-list">
            {urgentDeadlines.slice(0, 3).map((scholarship) => (
              <div
                key={scholarship.id}
                className={`urgent-item ${scholarship.deadlineInfo.isUrgent ? "critical" : ""}`}
              >
                <div className="urgent-info">
                  <span className="urgent-name">{scholarship.name}</span>
                  <span className="urgient-provider">{scholarship.provider}</span>
                </div>
                <div className="urgent-meta">
                  <span className="urgent-amount">₹{scholarship.amount.toLocaleString()}</span>
                  <span
                    className={`urgent-badge ${scholarship.deadlineInfo.isUrgent ? "urgent" : "normal"}`}
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

        {/* Empty State */}
        {filteredScholarships.length === 0 && (
          <div className="empty-state">
            <Bell className="empty-icon" />
            <h3>No announcements found</h3>
            <p>Try changing the filter to see more scholarships</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Announcements;
