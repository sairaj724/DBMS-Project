import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { apiService } from "../services/api";
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

    // Simple validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      if (isSignup) {
        // Sign up - Register new user
        if (!formData.name) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }

        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: isAdmin ? 'admin' : 'student'
        };

        const response = await apiService.registerUser(userData);
        
        if (response.success) {
          // Auto login after signup
          const loginResponse = await apiService.loginUser({
            email: formData.email,
            password: formData.password
          });
          
          if (loginResponse.success) {
            onLogin(loginResponse.data, isAdmin);
            navigate(isAdmin ? "/admin" : "/dashboard");
          }
        }
      } else {
        // Login - Authenticate user with role check
        const role = isAdmin ? 'admin' : 'student';
        const credentials = {
          email: formData.email,
          password: formData.password,
          role: role
        };

        const response = await apiService.loginUser(credentials);
        
        if (response.success) {
          onLogin(response.data, isAdmin);
          navigate(isAdmin ? "/admin" : "/dashboard");
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

            {/* Info */}
            <div className="demo-credentials">
              <p><strong>Note:</strong></p>
              <p>Sign up to create a new account or login with existing credentials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
