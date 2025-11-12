import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// 1. Import the AuthProvider that you created
import { AuthProvider } from "./context/AuthContext";

import Nav from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import ClientDashboard from "./pages/ClientDashboard";
import ArticleDetails from "./pages/ArticlesDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import Alert from "./components/Alert";
import ScrollToTop from "./components/ScrollToTop";

// 2. Create an AppContent component
// Its job is to handle all the logic that depends on routing (like useLocation)
const AppContent = () => {
  const location = useLocation();

  const hideNavFooter = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/admin",
  ].some((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!hideNavFooter && <Nav />}
      <div className="flex-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/article/:id" element={<ArticleDetails />} />
          <Route path="/articles/:slug" element={<ArticleDetails />} />

          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client"
            element={
              <ProtectedRoute role="client">
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="text-center py-20 font-semibold text-xl">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </div>
      {!hideNavFooter && <Footer />}
      <Alert />
    </div>
  );
};


// 3. The main App component's ONLY job is to provide the context
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}