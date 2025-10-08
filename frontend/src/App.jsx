import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import ArticleDetails from "./pages/ArticlesDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ClientDashboard from "./pages/ClientDashboard";

// --- STEP 1: IMPORT THE ALERT COMPONENT ---
import Alert from "./components/Alert";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  const location = useLocation();
  const hideNavFooter = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/admin",
  ].includes(location.pathname);

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
          <Route path="/client" element={<ClientDashboard />} />

          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin */}
          <Route path="/admin" element={<Admin />} />

          <Route path="*" element={
              <div className="text-center py-20 text-taa-primary font-semibold text-xl">
                404 - Page Not Found
              </div>
            }
          />

          {/* Fallback 404 */}
          <Route
            path="*"
            element={
              <div className="text-center py-20 text-taa-primary font-semibold text-xl">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </div>
      {!hideNavFooter && <Footer />}

      {/* --- STEP 2: PLACE THE ALERT COMPONENT HERE --- */}
      {/* It sits outside the routes so it can display on any page. */}
      <Alert />
    </div>
  );
}