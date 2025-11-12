import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role: requiredRole }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // While the context is loading, render nothing to prevent flashes or premature redirects.
    return null; 
  }

  // If there's no token, the user is not logged in. Redirect to login.
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ CRITICAL FIX: This is the new, stricter logic.
  const userRole = user?.role?.toLowerCase();

  // If the user's role does NOT match the role required for this page...
  if (userRole !== requiredRole.toLowerCase()) {
    // ...do NOT try to send them to another dashboard.
    // Treat this as an authorization failure and send them to the login page.
    // This is the secure action and prevents the session-switching bug.
    return <Navigate to="/login" replace />;
  }

  // If the token exists and the role is correct, allow access.
  return children;
}