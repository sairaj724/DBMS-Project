import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Award,
  Calendar,
  DollarSign,
  ChevronRight,
  SlidersHorizontal,
  X,
  CheckCircle,
} from "lucide-react";
import { scholarships } from "../data/dummyData";
import EligibilityBadge from "../components/EligibilityBadge";
import "../styles/ScholarshipList.css";

function ScholarshipList({ user }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    income: "all",
    caste: user?.caste || "all",
    eligibility: "all",
  });

  // Check eligibility for a scholarship
  const checkEligibility = (scholarship) => {
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

    if (!scholarship.eligibility.year.includes(user.year)) {
      reasons.push(`Only for year ${scholarship.eligibility.year.join(", ")} students`);
    }

    if (reasons.length === 0) {
      return { status: "eligible", reason: "You meet all eligibility criteria" };
    }

    return { status: "not-eligible", reason: reasons.join("; ") };
  };

  // Filter scholarships
  const filteredScholarships = useMemo(() => {
    return scholarships.filter((scholarship) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = scholarship.name.toLowerCase().includes(query);
        const matchProvider = scholarship.provider.toLowerCase().includes(query);
        const matchCategory = scholarship.category.toLowerCase().includes(query);
        if (!matchName && !matchProvider && !matchCategory) return false;
      }

      // Category filter
      if (filters.category !== "all" && scholarship.category !== filters.category) {
        return false;
      }

      // Income filter
      if (filters.income !== "all") {
        if (filters.income === "below2l" && scholarship.eligibility.maxIncome > 200000) return false;
        if (filters.income === "2l-5l" && (scholarship.eligibility.maxIncome <= 200000 || scholarship.eligibility.maxIncome > 500000)) return false;
        if (filters.income === "above5l" && scholarship.eligibility.maxIncome <= 500000) return false;
      }

      // Caste filter
      if (filters.caste !== "all") {
        if (!scholarship.eligibility.caste.includes(filters.caste) && !scholarship.eligibility.caste.includes("All")) {
          return false;
        }
      }

      // Eligibility filter
      if (filters.eligibility !== "all" && user) {
        const eligibility = checkEligibility(scholarship);
        if (filters.eligibility === "eligible" && eligibility.status !== "eligible") return false;
        if (filters.eligibility === "not-eligible" && eligibility.status !== "not-eligible") return false;
      }

      return true;
    });
  }, [searchQuery, filters, user]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      income: "all",
      caste: user?.caste || "all",
      eligibility: "all",
    });
    setSearchQuery("");
  };

  const getDaysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="scholarship-list-page">
      {/* Page Header */}
      <div className="page-header-section">
        <h1>Available Scholarships</h1>
        <p>Browse and apply for scholarships that match your profile</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search scholarships by name, provider, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>
              <X className="clear-icon" />
            </button>
          )}
        </div>

        <button
          className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="btn-icon" />
          Filters
          {Object.values(filters).some((f) => f !== "all") && (
            <span className="filter-badge">!</span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Merit">Merit Based</option>
                <option value="SC/ST">SC/ST</option>
                <option value="OBC">OBC</option>
                <option value="NT/VJNT">NT/VJNT</option>
                <option value="EWS">EWS</option>
                <option value="Special">Special</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Income Range</label>
              <select
                value={filters.income}
                onChange={(e) => handleFilterChange("income", e.target.value)}
              >
                <option value="all">All Income Levels</option>
                <option value="below2l">Below ₹2 Lakhs</option>
                <option value="2l-5l">₹2 Lakhs - ₹5 Lakhs</option>
                <option value="above5l">Above ₹5 Lakhs</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Caste Category</label>
              <select
                value={filters.caste}
                onChange={(e) => handleFilterChange("caste", e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="OPEN">OPEN</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="NT">NT</option>
                <option value="VJNT">VJNT</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            {user && (
              <div className="filter-group">
                <label>Eligibility</label>
                <select
                  value={filters.eligibility}
                  onChange={(e) => handleFilterChange("eligibility", e.target.value)}
                >
                  <option value="all">Show All</option>
                  <option value="eligible">Eligible Only</option>
                  <option value="not-eligible">Not Eligible</option>
                </select>
              </div>
            )}
          </div>

          <div className="filters-actions">
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X className="btn-icon" />
              Clear All Filters
            </button>
            <span className="results-count">
              Showing {filteredScholarships.length} of {scholarships.length} scholarships
            </span>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!showFilters && (
        <div className="results-bar">
          <span className="results-text">
            Showing <strong>{filteredScholarships.length}</strong> scholarships
          </span>
          {user && (
            <span className="eligible-count">
              <CheckCircle className="eligible-icon" />
              {filteredScholarships.filter((s) => checkEligibility(s).status === "eligible").length} eligible for you
            </span>
          )}
        </div>
      )}

      {/* Scholarships Grid */}
      <div className="scholarships-grid">
        {filteredScholarships.map((scholarship) => {
          const eligibility = checkEligibility(scholarship);
          const daysLeft = getDaysLeft(scholarship.deadline);

          return (
            <div
              key={scholarship.id}
              className={`scholarship-card ${eligibility.status}`}
            >
              <div className="scholarship-header">
                <div className="scholarship-icon-wrapper">
                  <Award className="scholarship-icon" />
                </div>
                <div className="scholarship-title-section">
                  <h3>{scholarship.name}</h3>
                  <span className="provider">{scholarship.provider}</span>
                </div>
                {user && (
                  <EligibilityBadge status={eligibility.status} reason={eligibility.reason} />
                )}
              </div>

              <div className="scholarship-details">
                <div className="detail-item">
                  <DollarSign className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Amount</span>
                    <span className="detail-value">₹{scholarship.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <Calendar className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Deadline</span>
                    <span className={`detail-value ${daysLeft <= 7 ? "urgent" : ""}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <Filter className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">{scholarship.category}</span>
                  </div>
                </div>
              </div>

              <p className="scholarship-description">{scholarship.description}</p>

              <div className="eligibility-tags">
                <span className="tag">
                  Min CGPA: {scholarship.eligibility.minCgpa}
                </span>
                <span className="tag">
                  Max Income: ₹{(scholarship.eligibility.maxIncome / 100000).toFixed(1)}L
                </span>
                <span className="tag">
                  {scholarship.eligibility.caste.includes("All") 
                    ? "All Categories" 
                    : scholarship.eligibility.caste.join(", ")}
                </span>
              </div>

              <div className="scholarship-actions">
                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                >
                  View Details
                  <ChevronRight className="btn-icon" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredScholarships.length === 0 && (
        <div className="empty-state">
          <Award className="empty-icon" />
          <h3>No scholarships found</h3>
          <p>Try adjusting your filters or search query</p>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default ScholarshipList;
