import { useState, useEffect } from "react";
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
  Loader,
  AlertCircle,
} from "lucide-react";
import { apiService } from "../services/api";
import "../styles/Profile.css";

function Profile({ user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  // Fetch profile data from database
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.user_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getStudentProfileByUserId(user.user_id);
        
        if (response.success && response.data) {
          setProfile(response.data);
          setEditedProfile(response.data);
        } else {
          // Profile doesn't exist yet, create default profile
          const defaultProfile = {
            user_id: user.user_id,
            name: user.name || '',
            email: user.email || '',
            course: '',
            year: 1,
            cgpa: 0,
            phone_no: '',
            gender: '',
            category: '',
            income: 0,
            hosteller: false,
          };
          setProfile(defaultProfile);
          setEditedProfile(defaultProfile);
        }
      } catch (err) {
        // Profile not found, create default
        const defaultProfile = {
          user_id: user.user_id,
          name: user.name || '',
          email: user.email || '',
          course: '',
          year: 1,
          cgpa: 0,
          phone_no: '',
          gender: '',
            category: '',
            income: 0,
            hosteller: false,
        };
        setProfile(defaultProfile);
        setEditedProfile(defaultProfile);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.user_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedProfile({ 
      ...editedProfile, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSave = async () => {
    if (!user?.user_id) return;

    try {
      setSaving(true);
      setError(null);

      const profileData = {
        cgpa: parseFloat(editedProfile.cgpa) || 0,
        income: parseFloat(editedProfile.income) || 0,
        category: editedProfile.category || '',
        gender: (editedProfile.gender || '').toLowerCase(),
        hosteller: editedProfile.hosteller || false,
        course: editedProfile.course || '',
        phone_no: editedProfile.phone_no || '',
        year_of_study: parseInt(editedProfile.year) || 1,
      };

      let response;
      if (profile?.id) {
        // Update existing profile
        response = await apiService.updateStudentProfile(user.user_id, profileData);
      } else {
        // Create new profile
        response = await apiService.createStudentProfile(user.user_id, profileData);
      }

      if (response.success) {
        setProfile(response.data);
        setEditedProfile(response.data);
        setIsEditing(false);
        
        // Update parent component
        if (onUpdateUser) {
          onUpdateUser({
            ...user,
            ...response.data,
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
    setError(null);
  };

  const documentStatus = [
    { name: "Income Certificate", key: "incomeCertificate", required: true },
    { name: "Caste Certificate", key: "casteCertificate", required: (profile?.category || '') !== "General" },
    { name: "Marksheet", key: "marksheet", required: true },
    { name: "Bonafide Certificate", key: "bonafide", required: true },
    { name: "Bank Passbook", key: "bankPassbook", required: true },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="profile-page">
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and documents</p>
        </div>
        <div className="profile-loading">
          <Loader className="loading-spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="profile-page">
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and documents</p>
        </div>
        <div className="profile-error">
          <AlertCircle className="error-icon" />
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              <h3 className="profile-name">{profile?.name || user?.name || 'Unknown'}</h3>
              <span className="profile-badge">{profile?.course || 'No Course'}</span>
            </div>

            <div className="profile-quick-info">
              <div className="quick-info-item">
                <Mail className="info-icon" />
                <span>{profile?.email || user?.email || 'No Email'}</span>
              </div>
              <div className="quick-info-item">
                <Phone className="info-icon" />
                <span>{profile?.phone_no || 'No Phone'}</span>
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
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader className="btn-icon spinner" /> : <Save className="btn-icon" />}
                      {saving ? 'Saving...' : 'Save Changes'}
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
                      value={editedProfile.name || ''}
                      onChange={handleChange}
                      disabled
                    />
                  ) : (
                    <p>{profile?.name || user?.name || 'N/A'}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedProfile.email || ''}
                      onChange={handleChange}
                      disabled
                    />
                  ) : (
                    <p>{profile?.email || user?.email || 'N/A'}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone_no"
                      value={editedProfile.phone_no || ''}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p>{profile?.phone_no || 'N/A'}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dob"
                      value={editedProfile.dob || ''}
                      onChange={handleChange}
                      disabled
                    />
                  ) : (
                    <p>{profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={editedProfile.gender || ''}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p>{profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'N/A'}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Caste Category</label>
                  {isEditing ? (
                    <select
                      name="category"
                      value={editedProfile.category || ''}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      <option value="General">General</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OBC">OBC</option>
                      <option value="NT">NT</option>
                      <option value="VJ">VJ</option>
                      <option value="SBC">SBC</option>
                      <option value="EWS">EWS</option>
                    </select>
                  ) : (
                    <p>{profile?.category || 'N/A'}</p>
                  )}
                </div>

                <div className="info-group full-width">
                  <label>Address</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={editedProfile.address || ''}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter your address"
                      disabled
                    />
                  ) : (
                    <p>{profile?.address || 'N/A'}</p>
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
                      value={editedProfile.income || 0}
                      onChange={handleChange}
                      min="0"
                      placeholder="Annual family income"
                    />
                  ) : (
                    <p>₹{(profile?.income || 0).toLocaleString()}</p>
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
                  <label>Department</label>
                  {isEditing ? (
                    <select
                      name="course"
                      value={editedProfile.course || ''}
                      onChange={handleChange}
                    >
                      <option value="">Select Course</option>
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
                    <p>{profile?.course || 'N/A'}</p>
                  )}
                </div>

                <div className="info-group">
                  <label>Current Year</label>
                  {isEditing ? (
                    <select
                      name="year"
                      value={editedProfile.year || 1}
                      onChange={handleChange}
                    >
                      <option value={1}>First Year</option>
                      <option value={2}>Second Year</option>
                      <option value={3}>Third Year</option>
                      <option value={4}>Fourth Year</option>
                    </select>
                  ) : (
                    <p>Year {profile?.year || 1}</p>
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
                      value={editedProfile.cgpa || 0}
                      onChange={handleChange}
                      placeholder="Enter CGPA (0-10)"
                    />
                  ) : (
                    <p className="highlight-value">{profile?.cgpa || 'N/A'}</p>
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
                    className={`document-item ${user?.documents?.[doc.key] ? "uploaded" : "missing"}`}
                  >
                    <div className="document-info">
                      <div className="document-icon-wrapper">
                        {user?.documents?.[doc.key] ? (
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
                      {user?.documents?.[doc.key] ? (
                        <span className="status-badge verified">Verified</span>
                      ) : (
                        <button className="upload-btn" disabled>
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
