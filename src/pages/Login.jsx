import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import "../styles/Auth.css";

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    rollNumber: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Demo login logic - any email/password works for now
    if (isAdmin) {
      // Any email can be used for admin - just create admin user from email
      const adminUserFromEmail = {
        id: "ADM001",
        name: formData.email.split('@')[0],
        email: formData.email,
        role: "Scholarship Coordinator",
      };
      onLogin(adminUserFromEmail, true);
      navigate("/admin");
    } else {
      // Student login - any email works for demo
      const studentUserFromEmail = {
        id: "STU2024001",
        name: formData.email.split('@')[0],
        email: formData.email,
        phone: "+91 9876543210",
        rollNumber: "201070001",
        department: "Computer Engineering",
        year: 3,
        cgpa: 8.5,
        income: 250000,
        caste: "OBC",
        gender: "Male",
        dob: "2002-05-15",
        address: "123, Mumbai Central, Mumbai - 400008",
        documents: {
          incomeCertificate: true,
          casteCertificate: true,
          marksheet: true,
          bonafide: true,
          bankPassbook: false,
        },
      };
      onLogin(studentUserFromEmail, false);
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Info */}
        <div className="auth-info">
          <div className="auth-info-content">
            <GraduationCap className="auth-logo-icon" />
            <h1>ScholarSphere</h1>
            <p>VJTI Scholarship Portal</p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Find scholarships based on your profile</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Apply for multiple scholarships</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Track application status in real-time</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Get notified about new opportunities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
            <p className="auth-subtitle">
              {isSignup
                ? "Sign up to start your scholarship journey"
                : "Sign in to access your scholarship dashboard"}
            </p>

            {/* Toggle Buttons */}
            <div className="user-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${!isAdmin ? "active" : ""}`}
                onClick={() => setIsAdmin(false)}
              >
                Student
              </button>
              <button
                type="button"
                className={`toggle-btn ${isAdmin ? "active" : ""}`}
                onClick={() => setIsAdmin(true)}
              >
                Admin
              </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {isSignup && (
                <>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {!isAdmin && (
                    <div className="form-group">
                      <label htmlFor="rollNumber">Roll Number</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="rollNumber"
                          name="rollNumber"
                          value={formData.rollNumber}
                          onChange={handleChange}
                          placeholder="e.g., 201070001"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={isAdmin ? "Enter admin email" : "your.email@vjti.ac.in"}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="password-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}
                  </button>
                </div>
              </div>

              {!isSignup && (
                <div className="form-extras">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-password">Forgot password?</a>
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner">Please wait...</span>
                ) : (
                  isSignup ? "Sign Up" : "Sign In"
                )}
              </button>
            </form>

            <div className="auth-switch">
              <p>
                {isSignup ? "Already have an account?" : "Don't have an account?"}
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => setIsSignup(!isSignup)}
                >
                  {isSignup ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <p><strong>Demo Mode:</strong></p>
              <p>Any email and password will work for login</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
