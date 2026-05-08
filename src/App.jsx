import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import Profile from "./pages/Profile";
import ScholarshipList from "./pages/ScholarshipList";
import ScholarshipDetails from "./pages/ScholarshipDetails";
import Applications from "./pages/Applications";
import Announcements from "./pages/Announcements";
import AdminDashboard from "./pages/AdminDashboard";
import AdminScholarships from "./pages/AdminScholarships";
import AdminApplications from "./pages/AdminApplications";
import AdminStudents from "./pages/AdminStudents";
import AdminReports from "./pages/AdminReports";

// Dummy data for initial state
import { currentStudent, adminUser } from "./data/dummyData";

import "./App.css";

function App() {
    // Load user from localStorage on initial load
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [isAdmin, setIsAdmin] = useState(() => {
        const savedIsAdmin = localStorage.getItem('isAdmin');
        return savedIsAdmin ? JSON.parse(savedIsAdmin) : false;
    });

    // Handle login
    const handleLogin = (userData, adminStatus = false) => {
        setUser(userData);
        setIsAdmin(adminStatus);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAdmin', JSON.stringify(adminStatus));
    };

    // Handle logout
    const handleLogout = () => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
    };

    // Handle user profile update
    const handleUpdateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <Router>
            <div className="app">
                {/* Show Navbar only when user is logged in */}
                {user && (
                    <Navbar
                        user={user}
                        isAdmin={isAdmin}
                        onLogout={handleLogout}
                    />
                )}

                <main className="main-content">
                    <Routes>
                        {/* Public Routes */}
                        <Route
                            path="/login"
                            element={
                                user ? (
                                    <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />
                                ) : (
                                    <Login onLogin={handleLogin} />
                                )
                            }
                        />

                        {/* Default redirect */}
                        <Route
                            path="/"
                            element={<Navigate to={user ? (isAdmin ? "/admin" : "/dashboard") : "/login"} replace />}
                        />

                        {/* Student Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute user={user} isAdmin={isAdmin} requireAdmin={false}>
                                    <StudentDashboard user={user} />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute user={user} isAdmin={isAdmin} requireAdmin={false}>
                                    <Profile user={user} onUpdateUser={handleUpdateUser} />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/scholarships"
                            element={
                                <ProtectedRoute user={user} isAdmin={isAdmin} requireAdmin={false}>
                                    <ScholarshipList user={user} />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/scholarships/:id"
                            element={
                                <ProtectedRoute user={user} isAdmin={isAdmin} requireAdmin={false}>
                                    <ScholarshipDetails user={user} />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/applications"
                            element={
                                <ProtectedRoute user={user} isAdmin={isAdmin} requireAdmin={false}>
                                    <Applications user={user} />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/announcements"
                            element={
                                <ProtectedRoute user={user} isAdmin={isAdmin} requireAdmin={false}>
                                    <Announcements user={user} />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute user={user} isAdmin={isAdmin} requireAdmin={true}>
                                    <AdminDashboard admin={user} />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/scholarships"
                            element={
                                <ProtectedRoute user={user} isAdmin={isAdmin} requireAdmin={true}>
                                    <AdminScholarships />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/applications"
                            element={
                                <ProtectedRoute user={user} isAdmin={isAdmin} requireAdmin={true}>
                                    <AdminApplications />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/students"
                            element={
                                <ProtectedRoute user={user} isAdmin={isAdmin} requireAdmin={true}>
                                    <AdminStudents />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/reports"
                            element={
                                <ProtectedRoute user={user} isAdmin={isAdmin} requireAdmin={true}>
                                    <AdminReports />
                                </ProtectedRoute>
                            }
                        />

                        {/* 404 Fallback */}
                        <Route
                            path="*"
                            element={
                                <div className="not-found">
                                    <h1>404 - Page Not Found</h1>
                                    <p>The page you're looking for doesn't exist.</p>
                                    <button onClick={() => window.history.back()}>Go Back</button>
                                </div>
                            }
                        />
                    </Routes>
                </main>

                {/* Show Footer only when user is logged in */}
                {user && <Footer />}
            </div>
        </Router>
    );
}

export default App;
