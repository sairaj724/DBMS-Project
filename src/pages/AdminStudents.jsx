import { useState } from "react";
import {
  Search,
  Filter,
  User,
  Mail,
  BookOpen,
  Award,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  GraduationCap,
  Phone,
  MapPin,
  DollarSign,
  Star,
} from "lucide-react";
import { allStudents, scholarships, applications } from "../data/dummyData";
import "../styles/AdminStudents.css";

function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Get departments list
  const departments = ["all", ...new Set(allStudents.map((s) => s.department))];

  // Filter students
  const filteredStudents = allStudents.filter((student) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = student.name.toLowerCase().includes(query);
      const matchId = student.id.toLowerCase().includes(query);
      const matchEmail = student.email.toLowerCase().includes(query);
      if (!matchName && !matchId && !matchEmail) return false;
    }
    if (deptFilter !== "all" && student.department !== deptFilter) {
      return false;
    }
    return true;
  });

  // Get student applications
  const getStudentApplications = (studentId) => {
    return applications
      .filter((app) => app.studentId === studentId)
      .map((app) => ({
        ...app,
        scholarship: scholarships.find((s) => s.id === app.scholarshipId),
      }));
  };

  // Get eligible scholarships for student
  const getEligibleScholarships = (student) => {
    return scholarships.filter((s) => {
      return (
        student.cgpa >= s.eligibility.minCgpa &&
        s.eligibility.year.includes(student.year)
      );
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      Applied: "applied",
      "Under Review": "review",
      Approved: "approved",
      Rejected: "rejected",
      "Pending Issues": "issues",
    };
    return <span className={`status-badge ${styles[status] || "applied"}`}>{status}</span>;
  };

  return (
    <div className="admin-students-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Student Database</h1>
          <p>View and manage student records and their scholarship applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter className="filter-icon" />
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.filter(d => d !== "all").map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{filteredStudents.length}</span>
          <span className="stat-label">Students</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {new Set(filteredStudents.map((s) => s.department)).size}
          </span>
          <span className="stat-label">Departments</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {(
              filteredStudents.reduce((sum, s) => sum + s.cgpa, 0) /
              filteredStudents.length
            ).toFixed(2)}
          </span>
          <span className="stat-label">Avg CGPA</span>
        </div>
      </div>

      {/* Students Table */}
      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>CGPA</th>
              <th>Applications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => {
              const studentApps = getStudentApplications(student.id);
              return (
                <tr key={student.id}>
                  <td className="roll-number">{student.id}</td>
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar">
                        <User className="avatar-icon" />
                      </div>
                      <span className="student-name">{student.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="dept-badge">{student.department}</span>
                  </td>
                  <td>Year {student.year}</td>
                  <td>
                    <span className={`cgpa-badge ${student.cgpa >= 8 ? "high" : student.cgpa >= 7 ? "medium" : "low"}`}>
                      {student.cgpa}
                    </span>
                  </td>
                  <td>
                    <div className="applications-count">
                      <FileText className="count-icon" />
                      <span>{studentApps.length} applications</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <Eye className="btn-icon" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="empty-state">
            <User className="empty-icon" />
            <p>No students found</p>
          </div>
        )}

        {/* Pagination */}
        {filteredStudents.length > 0 && (
          <div className="pagination">
            <button className="page-btn" disabled>
              <ChevronLeft className="btn-icon" />
              Previous
            </button>
            <div className="page-numbers">
              <span className="page-number active">1</span>
              <span className="page-number">2</span>
              <span className="page-number">3</span>
            </div>
            <button className="page-btn">
              Next
              <ChevronRight className="btn-icon" />
            </button>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-content">
                <div className="student-avatar-large">
                  <GraduationCap className="avatar-icon" />
                </div>
                <div>
                  <h3>{selectedStudent.name}</h3>
                  <p className="student-roll">{selectedStudent.id}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedStudent(null)}>
                <X className="close-icon" />
              </button>
            </div>

            <div className="modal-body">
              {/* Student Info Grid */}
              <div className="student-info-grid">
                <div className="info-box">
                  <Mail className="info-icon" />
                  <div>
                    <span className="label">Email</span>
                    <span className="value">{selectedStudent.email}</span>
                  </div>
                </div>
                <div className="info-box">
                  <BookOpen className="info-icon" />
                  <div>
                    <span className="label">Department</span>
                    <span className="value">{selectedStudent.department}</span>
                  </div>
                </div>
                <div className="info-box">
                  <Star className="info-icon" />
                  <div>
                    <span className="label">CGPA</span>
                    <span className={`value ${selectedStudent.cgpa >= 8 ? "high" : ""}`}>
                      {selectedStudent.cgpa}
                    </span>
                  </div>
                </div>
                <div className="info-box">
                  <Phone className="info-icon" />
                  <div>
                    <span className="label">Phone</span>
                    <span className="value">+91 9876543210</span>
                  </div>
                </div>
              </div>

              {/* Applications Section */}
              <div className="section">
                <h4>
                  <FileText className="section-icon" />
                  Scholarship Applications ({getStudentApplications(selectedStudent.id).length})
                </h4>
                {getStudentApplications(selectedStudent.id).length > 0 ? (
                  <div className="applications-mini-list">
                    {getStudentApplications(selectedStudent.id).map((app) => (
                      <div key={app.id} className="mini-app-item">
                        <div className="app-info">
                          <span className="app-name">{app.scholarship?.name}</span>
                          <span className="app-date">
                            Applied: {new Date(app.appliedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="app-meta">
                          <span className="app-amount">
                            ₹{app.scholarship?.amount.toLocaleString()}
                          </span>
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No applications submitted yet</p>
                )}
              </div>

              {/* Eligible Scholarships */}
              <div className="section">
                <h4>
                  <Award className="section-icon" />
                  Eligible Scholarships ({getEligibleScholarships(selectedStudent).length})
                </h4>
                {getEligibleScholarships(selectedStudent).length > 0 ? (
                  <div className="scholarships-mini-list">
                    {getEligibleScholarships(selectedStudent).slice(0, 5).map((scholarship) => (
                      <div key={scholarship.id} className="mini-scholarship-item">
                        <div className="scholarship-info">
                          <span className="scholarship-name">{scholarship.name}</span>
                          <span className="scholarship-provider">{scholarship.provider}</span>
                        </div>
                        <span className="scholarship-amount">
                          ₹{scholarship.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No eligible scholarships found</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-close" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStudents;
