import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["Politics", "Business", "Technology", "Sports", "Health", "Entertainment", "General"];

export default function AdminDashboard() {
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
  const [stats, setStats] = useState({ total: 0, featured: 0, categories: {} });
  const [editingArticle, setEditingArticle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [userError, setUserError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    siteTitle: "Text Africa Arcade",
    defaultCategory: "General",
    theme: "light",
  });
  const token = localStorage.getItem("token");

  // Fetch Articles
  async function fetchArticles() {
    try {
      const { data } = await API.get("/api/articles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(data.articles || []);
      calculateStats(data.articles || []);
    } catch (err) {
      console.error("Error fetching articles:", err);
    }
  }

  // Fetch Users
  async function fetchUsers() {
    try {
      const { data } = await API.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
      setUsers([]);
    }
  }

  // Fetch Settings
  async function fetchSettings() {
    try {
      const { data } = await API.get("/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(data || settings);
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  }

  // Calculate Stats
  function calculateStats(data) {
    const total = data.length;
    const featured = data.filter((a) => a.featured).length;
    const categoriesCount = data.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {});
    setStats({ total, featured, categories: categoriesCount });
  }

  useEffect(() => {
    if (!token) return navigate("/auth");
    fetchArticles();
    if (menuOpen === "users") fetchUsers();
    if (menuOpen === "settings") fetchSettings();
  }, [menuOpen, navigate, token]);

  // Handle Article Submit
  async function handleArticleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { ...form, author: form.author || "Text Africa Arcade" };
    try {
      if (editingArticle) {
        await API.put(`/api/articles/${editingArticle}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await API.post("/api/articles", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchArticles();
      setForm({ title: "", content: "", author: "", category: "General", featured: false, image: "" });
      setEditingArticle(null);
    } catch (err) {
      console.error("Error submitting article:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArticleDelete(id) {
    if (!window.confirm("Delete this article permanently?")) return;
    try {
      await API.delete(`/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchArticles();
    } catch (err) {
      console.error("Error deleting article:", err);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, useWebWorker: true });
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, image: reader.result });
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("Error compressing image:", err);
    }
  }

  async function handleUserDelete(id) {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await API.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setUserError("Failed to delete user.");
    }
  }

  async function handleSettingsSubmit(e) {
    e.preventDefault();
    try {
      await API.put("/api/settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getHeaderTitle = () => {
    switch (menuOpen) {
      case "dashboard":
        return "Admin Dashboard";
      case "articles":
        return "Manage Articles";
      case "users":
        return "User Management";
      case "settings":
        return "Settings";
      default:
        return "Admin Dashboard";
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-gray-100">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-64 backdrop-blur-xl bg-white/10 border-r border-white/20 text-white flex flex-col justify-between fixed md:static h-screen z-50"
          >
            <div className="p-6 space-y-6">
              <h1 className="text-2xl font-bold tracking-wide">📰 Admin Panel</h1>
              <nav className="flex flex-col gap-2">
                {["dashboard", "articles", "users", "settings"].map((menu) => (
                  <button
                    key={menu}
                    onClick={() => {
                      setMenuOpen(menu);
                      setSidebarOpen(false);
                    }}
                    className={`text-left py-2 px-4 rounded-lg transition-all ${
                      menuOpen === menu
                        ? "bg-white/20 backdrop-blur-md"
                        : "hover:bg-white/10"
                    }`}
                  >
                    {menu.charAt(0).toUpperCase() + menu.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="m-6 bg-red-500/80 hover:bg-red-600 py-2 rounded-lg shadow-lg backdrop-blur-md"
            >
              Logout
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Toggle */}
      <button
        className="absolute top-4 left-4 md:hidden z-50 bg-white/20 p-2 rounded-lg backdrop-blur-md hover:bg-white/30"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Main Content */}
      <main className="flex-1 mt-16 md:mt-0 p-6 md:p-10 overflow-y-auto w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500">
            {getHeaderTitle()}
          </h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 md:mt-0 bg-cyan-500/70 hover:bg-cyan-600 text-white px-5 py-2 rounded-lg backdrop-blur-lg shadow-lg transition-all"
          >
            Go to Website
          </button>
        </header>

        {/* Dashboard Section */}
        {menuOpen === "dashboard" && (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Total Articles", value: stats.total },
              { title: "Featured", value: stats.featured },
              { title: "Categories", value: Object.keys(stats.categories).length },
            ].map((stat) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center shadow-lg hover:scale-105 transition-transform"
              >
                <h3 className="text-3xl font-bold text-cyan-300">{stat.value}</h3>
                <p className="text-gray-300 mt-2">{stat.title}</p>
              </motion.div>
            ))}
          </section>
        )}

        {/* Articles Section */}
        {menuOpen === "articles" && (
          <section className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg space-y-6">
            <h3 className="text-2xl font-semibold text-cyan-300">Create / Edit Article</h3>
            <form onSubmit={handleArticleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Article Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="p-3 rounded-lg bg-white/5 border border-white/20 focus:ring-2 focus:ring-cyan-400 outline-none text-gray-100 placeholder-gray-400"
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="p-3 rounded-lg bg-white/5 border border-white/20 focus:ring-2 focus:ring-cyan-400 text-gray-100"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Article content..."
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                className="w-full p-3 rounded-lg bg-white/5 border border-white/20 focus:ring-2 focus:ring-cyan-400 text-gray-100 placeholder-gray-400"
              />
              <div>
                <label className="block mb-2 text-gray-300 font-medium">Upload Image</label>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="block w-full text-gray-400"
                  accept="image/*"
                />
                {form.image && (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="mt-3 w-48 h-32 object-cover rounded-lg shadow-md border border-white/20"
                  />
                )}
              </div>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                <span>Mark as Featured</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-cyan-500/80 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg shadow-lg"
                >
                  {isSubmitting ? "Processing..." : editingArticle ? "Update" : "Publish"}
                </button>
                {editingArticle && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ title: "", content: "", author: "", category: "General", featured: false, image: "" });
                      setEditingArticle(null);
                    }}
                    className="bg-gray-500/70 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="pt-6">
              <h3 className="text-2xl font-semibold text-cyan-300 mb-4">All Articles</h3>
              <div className="space-y-4">
                {articles.length > 0 ? (
                  articles.map((article) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 border border-white/20 rounded-xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center"
                    >
                      <div>
                        <h4 className="text-xl font-semibold text-gray-100">{article.title}</h4>
                        <p className="text-sm text-gray-400">
                          {article.category} • {new Date(article.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-3 mt-3 md:mt-0">
                        <button
                          onClick={() => {
                            setForm({
                              title: article.title,
                              content: article.content,
                              author: article.author,
                              category: article.category,
                              featured: article.featured,
                              image: article.image,
                            });
                            setEditingArticle(article._id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="bg-blue-500/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArticleDelete(article._id)}
                          className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No articles found.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Users Section */}
        {menuOpen === "users" && (
          <section className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg space-y-4">
            <h3 className="text-2xl font-semibold text-cyan-300">Registered Users</h3>
            {userError && <p className="text-red-400">{userError}</p>}
            {users.length > 0 ? (
              users.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 border border-white/20 rounded-xl p-6 shadow flex flex-col md:flex-row justify-between items-start md:items-center"
                >
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100">{user.username}</h4>
                    <p className="text-sm text-gray-400">{user.email} • Role: {user.role}</p>
                  </div>
                  <button
                    onClick={() => handleUserDelete(user._id)}
                    className="mt-3 md:mt-0 bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-400 text-center">No users found.</p>
            )}
          </section>
        )}

        {/* Settings Section */}
        {menuOpen === "settings" && (
          <section className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg space-y-6">
            <h3 className="text-2xl font-semibold text-cyan-300">Settings</h3>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Site Title</label>
                <input
                  type="text"
                  value={settings.siteTitle}
                  onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Default Category</label>
                <select
                  value={settings.defaultCategory}
                  onChange={(e) => setSettings({ ...settings, defaultCategory: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-gray-100"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-2">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-gray-100"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-cyan-500/80 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg shadow-lg"
              >
                Save Settings
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
