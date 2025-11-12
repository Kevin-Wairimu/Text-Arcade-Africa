import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ✅ CHANGED: Initialize state from sessionStorage instead of localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [loading, setLoading] = useState(false); // Can be false, as sessionStorage is synchronous
  const navigate = useNavigate();

  const login = useCallback((userData, userToken) => {
    // ✅ CHANGED: Save to sessionStorage
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("token", userToken);
    setUser(userData);
    setToken(userToken);
    const targetPath = userData.role?.toLowerCase() === 'admin' ? '/admin' : '/client';
    navigate(targetPath, { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    // ✅ CHANGED: Remove from sessionStorage
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    setToken(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // ✅ REMOVED: The 'storage' event listener useEffect is now gone.
  // It only works with localStorage and is no longer needed because each tab
  // now has its own isolated session.

  const value = { user, token, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};