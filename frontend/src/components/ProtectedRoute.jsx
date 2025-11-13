import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role: requiredRole }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  // Wait until AuthContext finishes initializing
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-[#2E7D32]">
        <p>Loading...</p>
      </div>
    );
  }

  // 🚫 If there's no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Normalize roles to lowercase
  const userRole = user?.role?.toLowerCase();
  const required = requiredRole?.toLowerCase();

  // 🚫 If the user's role doesn't match, treat as unauthorized
  if (required && userRole !== required) {
    // Optional: You can also send them home instead of login, if you prefer
    // return <Navigate to="/" replace />;
    return <Navigate to="/login" replace />;
  }

  // ✅ All checks passed — grant access
  return children;
}
