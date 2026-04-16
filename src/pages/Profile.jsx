import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Calendar,
  DollarSign,
  Edit2,
  Save,
  X,
  FileText,
  CheckCircle,
  Upload,
  Camera,
} from "lucide-react";
import "../styles/Profile.css";

function Profile({ user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [activeTab, setActiveTab] = useState("personal");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSave = () => {
    onUpdateUser(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({ ...user });
    setIsEditing(false);
  };

  const documentStatus = [
    { name: "Income Certificate", key: "incomeCertificate", required: true },
    { name: "Caste Certificate", key: "casteCertificate", required: user.caste !== "OPEN" },
    { name: "Marksheet", key: "marksheet", required: true },
    { name: "Bonafide Certificate", key: "bonafide", required: true },
    { name: "Bank Passbook", key: "bankPassbook", required: true },
  ];

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and documents</p>
      </div>

      <div className="profile-container">
        {/* Profile Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <div className="profile-avatar">
                  <User className="avatar-icon" />
                </div>
                <button className="avatar-upload-btn">
                  <Camera className="upload-icon" />
                </button>
              </div>
              <h3 className="profile-name">{user.name}</h3>
              <p className="profile-id">{user.rollNumber}</p>
              <span className="profile-badge">{user.department}</span>
            </div>

            <div className="profile-quick-info">
              <div className="quick-info-item">
                <Mail className="info-icon" />
                <span>{user.email}</span>
              </div>
              <div className="quick-info-item">
                <Phone className="info-icon" />
                <span>{user.phone}</span>
              </div>
              <div className="quick-info-item">
                <MapPin className="info-icon" />
                <span>Mumbai, Maharashtra</span>
              </div>
            </div>

            <div className="profile-completion">
              <div className="completion-header">
                <span>Profile Completion</span>
                <span>85%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "85%" }}></div>
              </div>
              <p className="completion-text">
                Complete your profile to unlock all scholarship opportunities
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === "personal" ? "active" : ""}`}
              onClick={() => setActiveTab("personal")}
            >
              <User className="tab-icon" />
              Personal Info
            </button>
            <button
              className={`tab-btn ${activeTab === "academic" ? "active" : ""}`}
              onClick={() => setActiveTab("academic")}
            >
              <BookOpen className="tab-icon" />
              Academic
            </button>
            <button
              className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
              onClick={() => setActiveTab("documents")}
            >
              <FileText className="tab-icon" />
              Documents
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Action Bar */}
          <div className="content-action-bar">
            <h2>
              {activeTab === "personal" && "Personal Information"}
              {activeTab === "academic" && "Academic Details"}
              {activeTab === "documents" && "Document Status"}
            </h2>
            {activeTab !== "documents" && (
              <div className="action-buttons">
                {isEditing ? (
                  <>
                    <button className="btn-save" onClick={handleSave}>
                      <Save className="btn-icon" />
                      Save Changes
                    </button>
                    <button className="btn-cancel" onClick={handleCancel}>
                      <X className="btn-icon" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="btn-edit" onClick={() => setIsEditing(true)}>
                    <Edit2 className="btn-icon" />
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div className="info-section">
              <div className="info-grid">
                <div className="info-group">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editedUser.name}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{user.name}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{user.email}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editedUser.phone}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{user.phone}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dob"
                      value={editedUser.dob}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{new Date(user.dob).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={editedUser.gender}
                      onChange={handleChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p>{user.gender}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Caste Category</label>
                  {isEditing ? (
                    <select
                      name="caste"
                      value={editedUser.caste}
                      onChange={handleChange}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OBC">OBC</option>
                      <option value="NT">NT</option>
                      <option value="VJNT">VJNT</option>
                      <option value="EWS">EWS</option>
                    </select>
                  ) : (
                    <p>{user.caste}</p>
                  )}
                </div>

                <div className="info-group full-width">
                  <label>Address</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={editedUser.address}
                      onChange={handleChange}
                      rows="3"
                    />
                  ) : (
                    <p>{user.address}</p>
                  )}
                </div>
              </div>

              <div className="info-section-divider"></div>

              <div className="info-section-title">
                <DollarSign className="section-icon" />
                <h3>Financial Information</h3>
              </div>

              <div className="info-grid">
                <div className="info-group">
                  <label>Annual Family Income (₹)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="income"
                      value={editedUser.income}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>₹{user.income.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Academic Tab */}
          {activeTab === "academic" && (
            <div className="info-section">
              <div className="info-grid">
                <div className="info-group">
                  <label>Roll Number</label>
                  <p>{user.rollNumber}</p>
                </div>

                <div className="info-group">
                  <label>Department</label>
                  {isEditing ? (
                    <select
                      name="department"
                      value={editedUser.department}
                      onChange={handleChange}
                    >
                      <option value="Computer Engineering">Computer Engineering</option>
                      <option value="IT Engineering">IT Engineering</option>
                      <option value="Electronics Engineering">Electronics Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Production Engineering">Production Engineering</option>
                      <option value="Textile Engineering">Textile Engineering</option>
                    </select>
                  ) : (
                    <p>{user.department}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Current Year</label>
                  {isEditing ? (
                    <select
                      name="year"
                      value={editedUser.year}
                      onChange={handleChange}
                    >
                      <option value={1}>First Year</option>
                      <option value={2}>Second Year</option>
                      <option value={3}>Third Year</option>
                      <option value={4}>Fourth Year</option>
                    </select>
                  ) : (
                    <p>Year {user.year}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Current CGPA</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      name="cgpa"
                      value={editedUser.cgpa}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="highlight-value">{user.cgpa}</p>
                  )}
                </div>
              </div>

              <div className="cgpa-info-box">
                <BookOpen className="info-box-icon" />
                <div className="info-box-content">
                  <h4>CGPA Requirements</h4>
                  <p>
                    Most scholarships require a minimum CGPA of 6.0 or higher.
                    Merit-based scholarships typically require 8.0+ CGPA.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="documents-section">
              <div className="documents-header">
                <p>
                  Please ensure all required documents are uploaded and verified.
                  Missing documents may lead to scholarship application rejection.
                </p>
              </div>

              <div className="documents-list">
                {documentStatus.map((doc) => (
                  <div
                    key={doc.key}
                    className={`document-item ${user.documents[doc.key] ? "uploaded" : "missing"}`}
                  >
                    <div className="document-info">
                      <div className="document-icon-wrapper">
                        {user.documents[doc.key] ? (
                          <CheckCircle className="document-icon success" />
                        ) : (
                          <Upload className="document-icon" />
                        )}
                      </div>
                      <div className="document-details">
                        <span className="document-name">{doc.name}</span>
                        {doc.required && (
                          <span className="required-badge">Required</span>
                        )}
                      </div>
                    </div>
                    <div className="document-status">
                      {user.documents[doc.key] ? (
                        <span className="status-badge verified">Verified</span>
                      ) : (
                        <button className="upload-btn">
                          <Upload className="btn-icon" />
                          Upload
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="documents-note">
                <FileText className="note-icon" />
                <p>
                  Note: All documents will be verified by the admin team. 
                  Please ensure uploaded documents are clear and valid.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
