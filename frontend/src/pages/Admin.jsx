/**
 * Admin.jsx
 *
 * Fully responsive Admin Dashboard component (single-file).
 * - Keeps your original logic and API calls intact
 * - Improves responsiveness and visibility across mobile/tablet/desktop/large screens
 * - Uses TailwindCSS classes only (no external CSS files)
 *
 * Drop this into your React project (replace your existing Admin.jsx).
 *
 * Notes:
 * - Assumes `API` configured axios instance is available at ../utils/api
 * - Uses `browser-image-compression` and `framer-motion` (you already had those)
 * - Keeps routes & behavior unchanged (login redirect, token in localStorage, etc.)
 *
 * This file is intentionally verbose and explicit so it remains self-contained.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";

/* -----------------------
   Animation config
   ----------------------- */
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.62, ease: "easeOut" },
  }),
};

/* -----------------------
   Category options
   ----------------------- */
const categories = [
  "Politics",
  "Business",
  "Technology",
  "Sports",
  "Health",
  "Entertainment",
  "General",
];

/* -----------------------
   Main component
   ----------------------- */
export default function Admin() {
  const navigate = useNavigate();

  // Data states
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, featured: 0, categories: {}, views: 0 });
  const [settings, setSettings] = useState({
    siteTitle: "Text Africa Arcade",
    defaultCategory: "General",
    theme: "light",
  });

  // Form states
  const [form, setForm] = useState({
    title: "",
    content: "",
    author: "",
    category: "General",
    featured: false,
    image: "",
  });
  const [editingArticle, setEditingArticle] = useState(null);

  // UI states
  const [menuOpen, setMenuOpen] = useState("dashboard"); // dashboard | articles | users | settings
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState({ articles: false, users: false, settings: false });
  const [error, setError] = useState({ articles: "", users: "", settings: "" });

  // Auth token (stored in localStorage by your auth flow)
  const token = localStorage.getItem("token");

  /* -----------------------
     Debug logging on mount
     ----------------------- */
  useEffect(() => {
    try {
      console.log("📡 API base URL:", API?.defaults?.baseURL || "not-set");
      if (token) console.log("📡 Using token (masked):", `${token.slice(0, 10)}...`);
    } catch (e) {
      /* ignore */
    }
  }, [token]);

  /* -----------------------
     Fetch: Articles
     ----------------------- */
  async function fetchArticles() {
    setIsLoading((prev) => ({ ...prev, articles: true }));
    setError((prev) => ({ ...prev, articles: "" }));
    try {
      console.log(`📥 Fetching articles from ${API?.defaults?.baseURL || ""}/articles`);
      const { data } = await API.get("/articles"); // public route - no auth required in your original code
      console.log("✅ Raw articles response:", data);
      const articlesArray = Array.isArray(data.articles)
        ? data.articles.filter((a) => a && typeof a === "object" && a._id)
        : [];
      setArticles(articlesArray);
      calculateStats(articlesArray);
      if (articlesArray.length === 0) {
        setError((prev) => ({ ...prev, articles: "No articles found." }));
      }
    } catch (err) {
      console.error("❌ Error fetching articles:", err);
      setError((prev) => ({
        ...prev,
        articles:
          err.response?.status === 404
            ? `Articles endpoint not found at ${API?.defaults?.baseURL || ""}/articles.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to load articles: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    } finally {
      setIsLoading((prev) => ({ ...prev, articles: false }));
    }
  }

  /* -----------------------
     Fetch: Users
     ----------------------- */
  async function fetchUsers() {
    setIsLoading((prev) => ({ ...prev, users: true }));
    setError((prev) => ({ ...prev, users: "" }));
    try {
      console.log(`📥 Fetching users from ${API?.defaults?.baseURL || ""}/users`);
      const { data } = await API.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Raw users response:", data);
      const usersArray = Array.isArray(data.users)
        ? data.users.filter(
            (user) =>
              user &&
              typeof user === "object" &&
              user._id &&
              typeof user.email === "string"
          )
        : [];
      setUsers(usersArray);
      if (usersArray.length === 0) {
        setError((prev) => ({ ...prev, users: "No users found in the database." }));
      }
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setError((prev) => ({
        ...prev,
        users:
          err.response?.status === 404
            ? `Users endpoint not found at ${API?.defaults?.baseURL || ""}/users.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to load users: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    } finally {
      setIsLoading((prev) => ({ ...prev, users: false }));
    }
  }

  /* -----------------------
     Fetch: Settings
     ----------------------- */
  async function fetchSettings() {
    setIsLoading((prev) => ({ ...prev, settings: true }));
    setError((prev) => ({ ...prev, settings: "" }));
    try {
      console.log(`📥 Fetching settings from ${API?.defaults?.baseURL || ""}/settings`);
      const { data } = await API.get("/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Raw settings response:", data);
      const validSettings = {
        siteTitle: data.siteTitle || "Text Africa Arcade",
        defaultCategory: data.defaultCategory || "General",
        theme: data.theme || "light",
      };
      setSettings(validSettings);
    } catch (err) {
      console.error("❌ Error fetching settings:", err);
      setError((prev) => ({
        ...prev,
        settings:
          err.response?.status === 404
            ? `Settings endpoint not found at ${API?.defaults?.baseURL || ""}/settings.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to load settings: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    } finally {
      setIsLoading((prev) => ({ ...prev, settings: false }));
    }
  }

  /* -----------------------
     Save settings
     ----------------------- */
  async function handleSettingsSubmit(e) {
    e.preventDefault();
    setIsLoading((prev) => ({ ...prev, settings: true }));
    setError((prev) => ({ ...prev, settings: "" }));
    try {
      console.log(`📥 Saving settings to ${API?.defaults?.baseURL || ""}/settings`, settings);
      const { data } = await API.put("/settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Settings updated:", data);
      setSettings(data);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("❌ Error saving settings:", err);
      setError((prev) => ({
        ...prev,
        settings:
          err.response?.status === 404
            ? `Settings endpoint not found at ${API?.defaults?.baseURL || ""}/settings.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to save settings: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    } finally {
      setIsLoading((prev) => ({ ...prev, settings: false }));
    }
  }

  /* -----------------------
     Calculate stats for dashboard
     ----------------------- */
  function calculateStats(data) {
    console.log("📊 Calculating stats for articles:", data?.length ?? 0);
    const total = Array.isArray(data) ? data.length : 0;
    const featured = Array.isArray(data) ? data.filter((a) => a.featured).length : 0;
    const totalViews = Array.isArray(data) ? data.reduce((acc, a) => acc + (a.views || 0), 0) : 0;
    const categoriesObj = Array.isArray(data)
      ? data.reduce((acc, a) => {
          const c = a.category || "General";
          acc[c] = (acc[c] || 0) + 1;
          return acc;
        }, {})
      : {};
    setStats({ total, featured, categories: categoriesObj, views: totalViews });
    console.log("✅ Stats:", { total, featured, categoriesObj, views: totalViews });
  }

  /* -----------------------
     Load on init / when menu changes
     ----------------------- */
  useEffect(() => {
    if (!token) {
      console.log("❌ No token found, redirecting to /auth");
      navigate("/auth");
      return;
    }
    // Load depending on active menu for performance
    if (menuOpen === "dashboard" || menuOpen === "articles") fetchArticles();
    if (menuOpen === "users") fetchUsers();
    if (menuOpen === "settings") fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  /* -----------------------
     Article handlers (create/update)
     ----------------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError((prev) => ({ ...prev, articles: "" }));
    const payload = { ...form, author: form.author || "Text Africa Arcade" };
    try {
      console.log(`📥 ${editingArticle ? "Updating" : "Creating"} article at ${API?.defaults?.baseURL || ""}/articles${editingArticle ? `/${editingArticle}` : ""}`);
      if (editingArticle) {
        await API.put(`/articles/${editingArticle}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await API.post("/articles", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      await fetchArticles();
      setForm({
        title: "",
        content: "",
        author: "",
        category: "General",
        featured: false,
        image: "",
      });
      setEditingArticle(null);
      alert(editingArticle ? "Article updated successfully!" : "Article published successfully!");
    } catch (err) {
      console.error("❌ Error submitting article:", err);
      setError((prev) => ({
        ...prev,
        articles:
          err.response?.status === 404
            ? `Articles endpoint not found at ${API?.defaults?.baseURL || ""}/articles.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to save article: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* -----------------------
     Delete article
     ----------------------- */
  async function handleDelete(id) {
    if (!window.confirm("Delete this article permanently?")) return;
    setError((prev) => ({ ...prev, articles: "" }));
    try {
      console.log(`📥 Deleting article at ${API?.defaults?.baseURL || ""}/articles/${id}`);
      await API.delete(`/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchArticles();
      alert("Article deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting article:", err);
      setError((prev) => ({
        ...prev,
        articles:
          err.response?.status === 404
            ? `Articles endpoint not found at ${API?.defaults?.baseURL || ""}/articles/${id}.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to delete article: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    }
  }

  /* -----------------------
     Toggle user suspension
     ----------------------- */
  async function handleToggleSuspend(userId, currentSuspended) {
    if (!window.confirm(`${currentSuspended ? "Unsuspend" : "Suspend"} this user?`)) return;
    setError((prev) => ({ ...prev, users: "" }));
    try {
      console.log(`📥 Toggling user suspension at ${API?.defaults?.baseURL || ""}/users/${userId}/suspend`);
      await API.put(`/users/${userId}/suspend`, { suspended: !currentSuspended }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers();
      alert(`User ${currentSuspended ? "unsuspended" : "suspended"} successfully!`);
    } catch (err) {
      console.error("❌ Error toggling user suspension:", err);
      setError((prev) => ({
        ...prev,
        users:
          err.response?.status === 404
            ? `Users endpoint not found at ${API?.defaults?.baseURL || ""}/users/${userId}/suspend.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to update user status: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    }
  }

  /* -----------------------
     Image upload and compression (client-side)
     ----------------------- */
  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("❌ Error compressing image:", err);
      alert("Failed to upload image. Please try again.");
    }
  }

  /* -----------------------
     Logout
     ----------------------- */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* -----------------------
     Responsive utilities & minor helpers
     ----------------------- */
  function formattedDate(dateString) {
    try {
      return new Date(dateString || Date.now()).toLocaleDateString();
    } catch {
      return "-";
    }
  }

  /* -----------------------
     UI Render
     ----------------------- */
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-white via-emerald-50 to-white text-gray-800 overflow-hidden">
      {/* Mobile: Sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-100 rounded-lg shadow-md"
        onClick={() => setIsSidebarOpen((s) => !s)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`w-72 md:w-64 bg-white border-r border-emerald-100 h-screen fixed md:static z-40 flex flex-col justify-between transform transition-transform duration-300 ease-in-out shadow-lg
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        aria-hidden={!isSidebarOpen && window.innerWidth < 768}
      >
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-emerald-600 text-center md:text-left">
            🧭 Admin Panel
          </h1>

          <nav className="flex flex-col gap-3">
            <button
              onClick={() => {
                navigate("/");
                setIsSidebarOpen(false);
              }}
              className={`text-left py-2 px-4 rounded-lg transition text-sm sm:text-base ${
                menuOpen === "home" ? "bg-emerald-400 text-white" : "text-gray-700 hover:bg-emerald-100 hover:text-emerald-600"
              }`}
            >
              Home
            </button>

            {["dashboard", "articles", "users", "settings"].map((key) => (
              <button
                key={key}
                onClick={() => {
                  setMenuOpen(key);
                  setIsSidebarOpen(false);
                }}
                className={`text-left py-2 px-4 rounded-lg transition text-sm sm:text-base ${
                  menuOpen === key
                    ? "bg-emerald-400 text-white"
                    : "text-gray-700 hover:bg-emerald-100 hover:text-emerald-600"
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 md:ml-64 lg:ml-72 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 text-center md:text-left text-gray-800"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {menuOpen === "dashboard"
            ? "📊 Admin Dashboard"
            : menuOpen === "articles"
            ? "📰 Manage Articles"
            : menuOpen === "users"
            ? "👥 Manage Users"
            : "⚙️ Settings"}
        </motion.h2>

        {/* Dashboard */}
        {menuOpen === "dashboard" && (
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Total Articles", value: stats.total },
              { label: "Featured Articles", value: stats.featured },
              { label: "Categories", value: Object.keys(stats.categories).length },
              { label: "Total Views", value: stats.views },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                custom={i + 1}
                className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-emerald-600">{stat.value}</h3>
                <p className="text-gray-600 text-sm sm:text-base mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </section>
        )}

        {/* Articles */}
        {menuOpen === "articles" && (
          <section className="mt-6 sm:mt-10">
            {isLoading.articles && <p className="text-gray-600 text-center mb-4">Loading articles...</p>}
            {error.articles && <p className="text-red-600 text-center mb-4">{error.articles}</p>}

            {/* Article Form */}
            <motion.form
              onSubmit={handleSubmit}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {editingArticle ? "✏️ Edit Article" : "📰 Create New Article"}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        title: "",
                        content: "",
                        author: "",
                        category: settings.defaultCategory || "General",
                        featured: false,
                        image: "",
                      });
                      setEditingArticle(null);
                    }}
                    className="hidden sm:inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-sm sm:text-base disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingArticle ? "Update" : "Publish"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Author (optional)"
                  value={form.author}
                  onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                  className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 col-span-1 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
                />

                <textarea
                  placeholder="Article content..."
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  required
                  className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 col-span-1 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
                />
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    id="article-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-gray-600 text-sm"
                  />
                  {form.image && (
                    <div className="hidden sm:block">
                      <img
                        src={form.image}
                        alt="preview"
                        className="w-20 h-12 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 text-gray-600 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Featured
                </label>

                {/* Action buttons are also at top for mobile */}
                <div className="flex gap-2 ml-auto">
                  {editingArticle && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingArticle(null);
                        setForm({
                          title: "",
                          content: "",
                          author: "",
                          category: settings.defaultCategory || "General",
                          featured: false,
                          image: "",
                        });
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.form>

            {/* Article cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {articles.length > 0 ? (
                articles.map((a, i) => (
                  <motion.div
                    key={a._id || i}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    custom={i + 1}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
                  >
                    {a.image ? (
                      <div className="w-full h-40 sm:h-44 lg:h-36 overflow-hidden">
                        <img src={a.image} alt={a.title || "Article"} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-20 sm:h-24 bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <span className="text-sm sm:text-base">No image</span>
                      </div>
                    )}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2">
                        {a.title || "Untitled"}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">
                        {a.category || "General"} • {formattedDate(a.publishedAt)} • {a.views || 0} views
                      </p>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">By {a.author || "Text Africa Arcade"}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setForm({
                                title: a.title || "",
                                content: a.content || "",
                                author: a.author || "",
                                category: a.category || "General",
                                featured: a.featured || false,
                                image: a.image || "",
                              });
                              setEditingArticle(a._id);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                              setMenuOpen("articles");
                            }}
                            className="text-emerald-600 hover:text-emerald-700 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(a._id)}
                            className="text-red-500 hover:text-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>

                        <div className="text-xs text-gray-500">{a.featured ? "★ Featured" : ""}</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 text-sm sm:text-base col-span-full text-center">No articles found.</p>
              )}
            </div>
          </section>
        )}

        {/* Users */}
        {menuOpen === "users" && (
          <section className="mt-6 sm:mt-10">
            {isLoading.users && <p className="text-gray-600 text-center mb-4">Loading users...</p>}
            {error.users && <p className="text-red-600 text-center mb-4">{error.users}</p>}

            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Manage Users</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.length > 0 ? (
                users.map((user, i) => (
                  <motion.div
                    key={user._id || i}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    custom={i + 1}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 flex flex-col"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm sm:text-base font-semibold text-gray-800">{user.name || "Unnamed User"}</h4>
                      <span className="text-xs text-gray-500">{user.role || "user"}</span>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mt-2">{user.email}</p>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">Status: <span className={user.suspended ? "text-red-500" : "text-emerald-600"}>{user.suspended ? "Suspended" : "Active"}</span></p>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleToggleSuspend(user._id, user.suspended)}
                        className={`text-sm ${user.suspended ? "text-emerald-600 hover:text-emerald-700" : "text-red-500 hover:text-red-600"}`}
                      >
                        {user.suspended ? "Unsuspend" : "Suspend"}
                      </button>
                      {/* Add other actions here if needed */}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 text-sm sm:text-base col-span-full text-center">No users found.</p>
              )}
            </div>
          </section>
        )}

        {/* Settings */}
        {menuOpen === "settings" && (
          <section className="mt-6 sm:mt-10">
            {isLoading.settings && <p className="text-gray-600 text-center mb-4">Loading settings...</p>}
            {error.settings && <p className="text-red-600 text-center mb-4">{error.settings}</p>}

            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Settings</h3>

            <motion.form
              onSubmit={handleSettingsSubmit}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-md p-4 sm:p-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Site Title</label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => setSettings((p) => ({ ...p, siteTitle: e.target.value }))}
                    className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-1">Default Category</label>
                  <select
                    value={settings.defaultCategory}
                    onChange={(e) => setSettings((p) => ({ ...p, defaultCategory: e.target.value }))}
                    className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-1">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings((p) => ({ ...p, theme: e.target.value }))}
                    className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading.settings}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base disabled:opacity-50"
                >
                  {isLoading.settings ? "Saving..." : "Save Settings"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Reset to last fetched settings
                    fetchSettings();
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm sm:text-base"
                >
                  Reset
                </button>
              </div>
            </motion.form>
          </section>
        )}
      </main>
    </div>
  );
}
