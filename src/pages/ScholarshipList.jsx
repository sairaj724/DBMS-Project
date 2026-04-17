import { useState, useMemo, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { apiService } from "../services/api";
import EligibilityBadge from "../components/EligibilityBadge";
import "../styles/ScholarshipList.css";

function ScholarshipList({ user }) {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    income: "all",
    caste: "all",
    eligibility: "all",
  });

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
            // Profile may not exist yet, that's ok
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
              category: s.category === "ALL" ? ["All"] : s.category ? [s.category] : ["All"],
              departments: ["All"],
              year: [1, 2, 3, 4],
              gender: s.gender || "all",
              hosteller: s.hosteller
            }
          }));
          setScholarships(transformed);
          setUserProfile(profileData);
          
          // Set caste filter based on user's category if available
          if (profileData?.category) {
            setFilters(prev => ({ ...prev, caste: profileData.category }));
          }
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

  // Check eligibility for a scholarship
  const checkEligibility = (scholarship) => {
    if (!user) return { status: "partial", reason: "Login to check eligibility" };
    
    // Use userProfile data if available, otherwise use user data
    const studentData = userProfile || user;
    
    // Map database fields to eligibility check fields
    const studentCgpa = parseFloat(studentData.cgpa) || 0;
    const studentIncome = parseFloat(studentData.income) || 0;
    const studentCategory = studentData.category || studentData.caste || "";
    const studentGender = (studentData.gender || "").toLowerCase();
    const studentYear = parseInt(studentData.year) || parseInt(studentData.year_of_study) || 1;
    const studentHosteller = studentData.hosteller || false;

    const reasons = [];
    const minCgpa = parseFloat(scholarship.eligibility.minCgpa) || 0;
    const maxIncome = parseFloat(scholarship.eligibility.maxIncome) || 10000000;

    // Check CGPA
    if (studentCgpa < minCgpa) {
      reasons.push(`CGPA must be at least ${minCgpa} (you have ${studentCgpa})`);
    }

    // Check Income
    if (studentIncome > maxIncome) {
      reasons.push(`Family income must be below ₹${maxIncome.toLocaleString()} (you have ₹${studentIncome.toLocaleString()})`);
    }

    // Check Category (scholarship category vs student category)
    const allowedCategories = scholarship.eligibility.category || scholarship.eligibility.caste || ["All"];
    const categoryMatch = allowedCategories.includes("All") || 
                          allowedCategories.includes(studentCategory) ||
                          allowedCategories.some(cat => cat.toLowerCase() === studentCategory.toLowerCase());
    if (!categoryMatch && studentCategory) {
      reasons.push(`Only for ${allowedCategories.join(", ")} categories (you are ${studentCategory})`);
    }

    // Check Gender
    const scholarshipGender = (scholarship.eligibility.gender || "all").toLowerCase();
    if (scholarshipGender !== "all" && scholarshipGender !== studentGender && studentGender) {
      reasons.push(`Only for ${scholarship.eligibility.gender} students`);
    }

    // Check Year
    const allowedYears = scholarship.eligibility.year || [1, 2, 3, 4];
    if (!allowedYears.includes(studentYear)) {
      reasons.push(`Only for year ${allowedYears.join(", ")} students (you are year ${studentYear})`);
    }
    
    // Check Hosteller requirement (if scholarship requires hosteller)
    if (scholarship.eligibility.hosteller === true && !studentHosteller) {
      reasons.push(`Only for hosteller students`);
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

      // Category/Caste filter
      if (filters.caste !== "all") {
        const allowedCategories = scholarship.eligibility.category || scholarship.eligibility.caste || ["All"];
        if (!allowedCategories.includes("All") && !allowedCategories.includes(filters.caste)) {
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
            {!loading && (
              <span className="results-count">
                Showing {filteredScholarships.length} of {scholarships.length} scholarships
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <Loader2 className="loading-spinner" />
          <p>Loading scholarships...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && !showFilters && (
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
      {!loading && !error && (
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
                {(scholarship.eligibility.category || scholarship.eligibility.caste || ["All"]).includes("All") 
                  ? "All Categories" 
                  : (scholarship.eligibility.category || scholarship.eligibility.caste || []).join(", ")}
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
      )}

      {/* Empty State */}
      {!loading && !error && filteredScholarships.length === 0 && (
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
