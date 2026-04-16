import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, user, isAdmin, requireAdmin }) {
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin route is required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If student tries to access admin routes
  if (!requireAdmin && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // User is authorized
  return children;
}

export default ProtectedRoute;
