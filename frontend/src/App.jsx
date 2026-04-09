import React, { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Nav from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Team = lazy(() => import("./pages/Team"));
const Contact = lazy(() => import("./pages/Contact"));
const Admin = lazy(() => import("./pages/Admin"));
const ArticleDetails = lazy(() => import("./pages/ArticlesDetails"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));

import Alert from "./components/Alert";
import ScrollToTop from "./components/ScrollToTop";

// Simple Loading Spinner
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-taa-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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
    <HelmetProvider>
      <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-taa-dark dark:text-taa-light transition-colors duration-300">
        <ScrollToTop />

        {!hideNavFooter && <Nav />}
        <main className={`flex-1 ${!hideNavFooter ? 'pt-20' : ''}`}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/article/:id" element={<ArticleDetails />} />
              <Route path="/articles/:slug" element={<ArticleDetails />} />

              {/* Protected Client Page */}
              <Route 
                path="/client" 
                element={
                  <ProtectedRoute allowedRoles={["Client", "Admin", "Employee"]}>
                    <ClientDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Auth Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Protected Admin Page */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Employee"]}>
                    <Admin />
                  </ProtectedRoute>
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
          </Suspense>
        </main>
        {!hideNavFooter && <Footer />}
        <Alert />
      </div>
    </HelmetProvider>
  );
}

