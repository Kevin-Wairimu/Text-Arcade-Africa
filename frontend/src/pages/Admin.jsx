import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";

// Animation config
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" },
  }),
};

const categories = [
  "Politics",
  "Business",
  "Technology",
  "Sports",
  "Health",
  "Entertainment",
  "General",
];

export default function Admin() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    author: "",
    category: "General",
    featured: false,
    image: "",
  });
  const [stats, setStats] = useState({ total: 0, featured: 0, categories: {}, views: 0 });
  const [editingArticle, setEditingArticle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    siteTitle: "Text Africa Arcade",
    defaultCategory: "General",
    theme: "light",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState({ articles: false, users: false, settings: false });
  const [error, setError] = useState({ articles: "", users: "", settings: "" });
  const token = localStorage.getItem("token");

  // Log API base URL
  useEffect(() => {
    console.log("📡 API base URL:", API.defaults.baseURL);
    console.log("📡 Token:", token ? `${token.slice(0, 10)}...` : "none");
  }, []);

  // Fetch articles
  async function fetchArticles() {
    setIsLoading((prev) => ({ ...prev, articles: true }));
    setError((prev) => ({ ...prev, articles: "" }));
    try {
      console.log(`📥 Fetching articles from ${API.defaults.baseURL}/articles`);
      const { data } = await API.get("/articles"); // No Authorization header for public route
      console.log("✅ Raw articles response:", JSON.stringify(data, null, 2));
      const articlesArray = Array.isArray(data.articles)
        ? data.articles.filter((article) => article && typeof article === "object" && article._id)
        : [];
      console.log("✅ Filtered articles:", articlesArray);
      setArticles(articlesArray);
      calculateStats(articlesArray);
      if (articlesArray.length === 0) {
        console.log("⚠️ No valid articles after filtering");
        setError((prev) => ({ ...prev, articles: "No valid articles found in the response." }));
      }
    } catch (err) {
      console.error("❌ Error fetching articles:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: `${API.defaults.baseURL}/articles`,
      });
      setError((prev) => ({
        ...prev,
        articles:
          err.response?.status === 404
            ? `Articles endpoint not found at ${API.defaults.baseURL}/articles. Verify API URL and server routes.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to load articles: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    } finally {
      setIsLoading((prev) => ({ ...prev, articles: false }));
    }
  }

  // Fetch users
  async function fetchUsers() {
    setIsLoading((prev) => ({ ...prev, users: true }));
    setError((prev) => ({ ...prev, users: "" }));
    try {
      console.log(`📥 Fetching users from ${API.defaults.baseURL}/users`);
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
      console.log("✅ Filtered users:", usersArray);
      setUsers(usersArray);
      if (usersArray.length === 0) {
        setError((prev) => ({ ...prev, users: "No users found in the database." }));
      }
    } catch (err) {
      console.error("❌ Error fetching users:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: `${API.defaults.baseURL}/users`,
      });
      setError((prev) => ({
        ...prev,
        users:
          err.response?.status === 404
            ? `Users endpoint not found at ${API.defaults.baseURL}/users. Verify API URL and server routes.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to load users: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    } finally {
      setIsLoading((prev) => ({ ...prev, users: false }));
    }
  }

  // Fetch settings
  async function fetchSettings() {
    setIsLoading((prev) => ({ ...prev, settings: true }));
    setError((prev) => ({ ...prev, settings: "" }));
    try {
      console.log(`📥 Fetching settings from ${API.defaults.baseURL}/settings`);
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
      console.error("❌ Error fetching settings:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: `${API.defaults.baseURL}/settings`,
      });
      setError((prev) => ({
        ...prev,
        settings:
          err.response?.status === 404
            ? `Settings endpoint not found at ${API.defaults.baseURL}/settings. Verify API URL and server routes.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to load settings: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    } finally {
      setIsLoading((prev) => ({ ...prev, settings: false }));
    }
  }

  // Save settings
  async function handleSettingsSubmit(e) {
    e.preventDefault();
    setIsLoading((prev) => ({ ...prev, settings: true }));
    setError((prev) => ({ ...prev, settings: "" }));
    try {
      console.log(`📥 Saving settings to ${API.defaults.baseURL}/settings`, settings);
      const { data } = await API.put("/settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Settings updated:", data);
      setSettings(data);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("❌ Error saving settings:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: `${API.defaults.baseURL}/settings`,
      });
      setError((prev) => ({
        ...prev,
        settings:
          err.response?.status === 404
            ? `Settings endpoint not found at ${API.defaults.baseURL}/settings. Verify API URL and server routes.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to save settings: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    } finally {
      setIsLoading((prev) => ({ ...prev, settings: false }));
    }
  }

  // Calculate stats
  function calculateStats(data) {
    console.log("📊 Calculating stats for articles:", data);
    const total = data.length;
    const featured = data.filter((a) => a.featured).length;
    const totalViews = data.reduce((acc, a) => acc + (a.views || 0), 0);
    const categories = data.reduce((acc, a) => {
      acc[a.category || "General"] = (acc[a.category || "General"] || 0) + 1;
      return acc;
    }, {});
    setStats({ total, featured, categories, views: totalViews });
    console.log("✅ Stats calculated:", { total, featured, categories, views: totalViews });
  }

  // Load on init / menu change
  useEffect(() => {
    if (!token) {
      console.log("❌ No token found, redirecting to /auth");
      navigate("/auth");
      return;
    }
    if (menuOpen === "dashboard" || menuOpen === "articles") fetchArticles();
    if (menuOpen === "users") fetchUsers();
    if (menuOpen === "settings") fetchSettings();
  }, [menuOpen, navigate, token]);

  // Submit article
  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError((prev) => ({ ...prev, articles: "" }));
    const payload = { ...form, author: form.author || "Text Africa Arcade" };
    try {
      console.log(`📥 ${editingArticle ? "Updating" : "Creating"} article at ${API.defaults.baseURL}/articles${editingArticle ? `/${editingArticle}` : ""}`);
      if (editingArticle) {
        await API.put(`/articles/${editingArticle}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await API.post("/articles", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchArticles();
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
      console.error("❌ Error submitting article:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: `${API.defaults.baseURL}/articles${editingArticle ? `/${editingArticle}` : ""}`,
      });
      setError((prev) => ({
        ...prev,
        articles:
          err.response?.status === 404
            ? `Articles endpoint not found at ${API.defaults.baseURL}/articles. Verify API URL and server routes.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to save article: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete article
  async function handleDelete(id) {
    if (!window.confirm("Delete this article permanently?")) return;
    setError((prev) => ({ ...prev, articles: "" }));
    try {
      console.log(`📥 Deleting article at ${API.defaults.baseURL}/articles/${id}`);
      await API.delete(`/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchArticles();
      alert("Article deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting article:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: `${API.defaults.baseURL}/articles/${id}`,
      });
      setError((prev) => ({
        ...prev,
        articles:
          err.response?.status === 404
            ? `Articles endpoint not found at ${API.defaults.baseURL}/articles/${id}. Verify API URL and server routes.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to delete article: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    }
  }

  // Toggle user suspension
  async function handleToggleSuspend(userId, currentSuspended) {
    if (!window.confirm(`${currentSuspended ? "Unsuspend" : "Suspend"} this user?`)) return;
    setError((prev) => ({ ...prev, users: "" }));
    try {
      console.log(`📥 Toggling user suspension at ${API.defaults.baseURL}/users/${userId}/suspend`);
      await API.put(`/users/${userId}/suspend`, { suspended: !currentSuspended }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      alert(`User ${currentSuspended ? "unsuspended" : "suspended"} successfully!`);
    } catch (err) {
      console.error("❌ Error toggling user suspension:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: `${API.defaults.baseURL}/users/${userId}/suspend`,
      });
      setError((prev) => ({
        ...prev,
        users:
          err.response?.status === 404
            ? `Users endpoint not found at ${API.defaults.baseURL}/users/${userId}/suspend. Verify API URL and server routes.`
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to update user status: ${err.response?.data?.details || err.message}`,
      }));
      if (err.response?.status === 401) navigate("/auth");
    }
  }

  // Image upload
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, image: reader.result });
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("❌ Error compressing image:", err.message);
      alert("Failed to upload image. Please try again.");
    }
  }

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white text-gray-800 flex flex-col md:flex-row">
      {/* Sidebar Toggle Button (Mobile) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-100 rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
        className={`w-full md:w-64 bg-white border-r border-emerald-100 h-screen fixed md:static flex flex-col justify-between transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-40 shadow-md`}
      >
        <div className="p-4 sm:p-6 space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold text-emerald-600">
            🧭 Admin Panel
          </h1>
          <nav className="flex flex-col gap-3">
            <button
              onClick={() => {
                navigate("/");
                setIsSidebarOpen(false);
              }}
              className={`text-left py-2 px-4 rounded-lg transition text-sm sm:text-base ${
                menuOpen === "home"
                  ? "bg-emerald-400 text-white"
                  : "text-gray-700 hover:bg-emerald-100 hover:text-emerald-600"
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
        <button
          onClick={handleLogout}
          className="m-4 sm:m-6 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm sm:text-base"
        >
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-10 max-w-6xl mx-auto">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 text-center text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
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
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                <p className="text-gray-600 text-sm sm:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </section>
        )}

        {/* Articles */}
        {menuOpen === "articles" && (
          <section className="mt-6 sm:mt-10">
            {isLoading.articles && (
              <p className="text-gray-600 text-center mb-4">Loading articles...</p>
            )}
            {error.articles && (
              <p className="text-red-600 text-center mb-4">{error.articles}</p>
            )}
            <motion.form
              onSubmit={handleSubmit}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-md p-4 sm:p-8 mb-6 sm:mb-10"
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
                {editingArticle ? "✏️ Edit Article" : "📰 Create New Article"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full text-sm sm:text-base"
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full text-sm sm:text-base"
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
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full text-sm sm:text-base"
                />
              </div>

              <textarea
                placeholder="Article content..."
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                className="w-full mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
              />

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-gray-600 text-sm sm:text-base"
                />
                <label className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                  />
                  Featured
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingArticle ? "Update" : "Publish"}
                </button>
                {editingArticle && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingArticle(null);
                      setForm({
                        title: "",
                        content: "",
                        author: "",
                        category: "General",
                        featured: false,
                        image: "",
                      });
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.form>

            {/* Article cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {articles.length > 0 ? (
                articles.map((a, i) => (
                  <motion.div
                    key={a._id}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-200 overflow-hidden"
                  >
                    {a.image && (
                      <img
                        src={a.image}
                        alt={a.title || "Article"}
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                    )}
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2">
                        {a.title || "Untitled"}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">
                        {a.category || "General"} • {new Date(a.publishedAt || Date.now()).toLocaleDateString()} • {a.views || 0} views
                      </p>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">
                        By {a.author || "Text Africa Arcade"}
                      </p>
                      <div className="flex justify-between mt-3">
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
                          }}
                          className="text-emerald-600 hover:text-emerald-700 text-sm sm:text-base"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(a._id)}
                          className="text-red-500 hover:text-red-600 text-sm sm:text-base"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 text-sm sm:text-base col-span-full text-center">
                  No articles found.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Users */}
        {menuOpen === "users" && (
          <section className="mt-6 sm:mt-10">
            {isLoading.users && (
              <p className="text-gray-600 text-center mb-4">Loading users...</p>
            )}
            {error.users && (
              <p className="text-red-600 text-center mb-4">{error.users}</p>
            )}
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
              Manage Users
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {users.length > 0 ? (
                users.map((user, i) => (
                  <motion.div
                    key={user._id}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-200 p-4 sm:p-5"
                  >
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                      {user.name || "Unnamed User"}
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm">{user.email}</p>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Role: {user.role || "user"}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Status: {user.suspended ? "Suspended" : "Active"}
                    </p>
                    <button
                      onClick={() => handleToggleSuspend(user._id, user.suspended)}
                      className={`mt-3 text-sm sm:text-base ${
                        user.suspended
                          ? "text-emerald-600 hover:text-emerald-700"
                          : "text-red-500 hover:text-red-600"
                      }`}
                    >
                      {user.suspended ? "Unsuspend" : "Suspend"}
                    </button>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 text-sm sm:text-base col-span-full text-center">
                  No users found.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Settings */}
        {menuOpen === "settings" && (
          <section className="mt-6 sm:mt-10">
            {isLoading.settings && (
              <p className="text-gray-600 text-center mb-4">Loading settings...</p>
            )}
            {error.settings && (
              <p className="text-red-600 text-center mb-4">{error.settings}</p>
            )}
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
              Settings
            </h3>
            <motion.form
              onSubmit={handleSettingsSubmit}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-md p-4 sm:p-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm sm:text-base">
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) =>
                      setSettings({ ...settings, siteTitle: e.target.value })
                    }
                    className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm sm:text-base">
                    Default Category
                  </label>
                  <select
                    value={settings.defaultCategory}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultCategory: e.target.value })
                    }
                    className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-600 text-sm sm:text-base">
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings({ ...settings, theme: e.target.value })
                    }
                    className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading.settings}
                className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base disabled:opacity-50"
              >
                {isLoading.settings ? "Saving..." : "Save Settings"}
              </button>
            </motion.form>
          </section>
        )}
      </main>
    </div>
  );
}