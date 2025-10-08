import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";

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
  const [settings, setSettings] = useState({
    siteTitle: "Text Africa Arcade",
    defaultCategory: "General",
    theme: "light",
  });
  const token = localStorage.getItem("token");

  // --- Fetch Articles ---
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

  // --- Fetch Users ---
  async function fetchUsers() {
    try {
      const { data } = await API.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  }

  // --- Fetch Settings (Placeholder) ---
  async function fetchSettings() {
    try {
      // Assuming an API endpoint for settings; replace with actual if available
      const { data } = await API.get("/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(data || { siteTitle: "Text Africa Arcade", defaultCategory: "General", theme: "light" });
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  }

  function calculateStats(data) {
    const total = data.length;
    const featured = data.filter((a) => a.featured).length;
    const categories = data.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {});
    setStats({ total, featured, categories });
  }

  useEffect(() => {
    if (!token) return navigate("/auth");
    fetchArticles();
    if (menuOpen === "users") fetchUsers();
    if (menuOpen === "settings") fetchSettings();
  }, [menuOpen]);

  // --- Handle Article Form ---
  async function handleSubmit(e) {
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

  async function handleDelete(id) {
    if (!window.confirm("Delete this article permanently?")) return;
    await API.delete(`/api/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchArticles();
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await imageCompression(file, { maxSizeMB: 1, useWebWorker: true });
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(compressed);
  }

  // --- Handle Settings Form ---
  async function handleSettingsSubmit(e) {
    e.preventDefault();
    try {
      await API.put("/api/settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings. Please try again.");
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Dynamic header based on menuOpen
  const getHeaderTitle = () => {
    switch (menuOpen) {
      case "dashboard": return "Admin Dashboard";
      case "articles": return "Manage Articles";
      case "users": return "Manage Users";
      case "settings": return "Settings";
      default: return "Admin Dashboard";
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-taa-primary text-white flex flex-col justify-between fixed h-screen">
        <div className="p-6 space-y-8">
          <h1 className="text-2xl font-bold">📰 Admin Panel</h1>
          <nav className="flex flex-col gap-3">
            <button
              onClick={() => setMenuOpen("dashboard")}
              className={`text-left py-2 px-4 rounded-lg transition-colors ${
                menuOpen === "dashboard"
                  ? "bg-taa-accent text-white"
                  : "hover:bg-taa-accent hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setMenuOpen("articles")}
              className={`text-left py-2 px-4 rounded-lg transition-colors ${
                menuOpen === "articles"
                  ? "bg-taa-accent text-white"
                  : "hover:bg-taa-accent hover:text-white"
              }`}
            >
              Articles
            </button>
            <button
              onClick={() => setMenuOpen("users")}
              className={`text-left py-2 px-4 rounded-lg transition-colors ${
                menuOpen === "users"
                  ? "bg-taa-accent text-white"
                  : "hover:bg-taa-accent hover:text-white"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setMenuOpen("settings")}
              className={`text-left py-2 px-4 rounded-lg transition-colors ${
                menuOpen === "settings"
                  ? "bg-taa-accent text-white"
                  : "hover:bg-taa-accent hover:text-white"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
        <button onClick={handleLogout} className="m-6 bg-red-600 hover:bg-red-700 py-2 rounded-lg">
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-taa-primary">{getHeaderTitle()}</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-taa-accent hover:bg-taa-primary text-white px-5 py-2 rounded-lg"
          >
            Go to Website
          </button>
        </header>

        {/* Dashboard Section */}
        {menuOpen === "dashboard" && (
          <>
            {/* Stats Overview */}
            <section className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white shadow rounded-xl p-6 text-center">
                <h3 className="text-2xl font-bold text-taa-primary">{stats.total}</h3>
                <p className="text-gray-600">Total Articles</p>
              </div>
              <div className="bg-white shadow rounded-xl p-6 text-center">
                <h3 className="text-2xl font-bold text-taa-primary">{stats.featured}</h3>
                <p className="text-gray-600">Featured Articles</p>
              </div>
              <div className="bg-white shadow rounded-xl p-6 text-center">
                <h3 className="text-2xl font-bold text-taa-primary">{Object.keys(stats.categories).length}</h3>
                <p className="text-gray-600">Categories</p>
              </div>
            </section>

            {/* Create / Edit Form */}
            <section className="bg-white rounded-2xl shadow-md p-8 mb-10">
              <h3 className="text-xl font-semibold mb-4 text-taa-primary">
                {editingArticle ? "Edit Article" : "Create New Article"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Article Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                  />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Article content..."
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                />
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Upload Image</label>
                  <input type="file" onChange={handleImageUpload} className="block w-full text-gray-500" />
                  {form.image && (
                    <img
                      src={form.image}
                      alt="preview"
                      className="mt-3 w-48 h-32 object-cover rounded-lg shadow"
                    />
                  )}
                </div>
                <label className="flex items-center gap-2">
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
                    className="bg-taa-primary hover:bg-taa-accent text-white px-6 py-2 rounded-lg"
                  >
                    {editingArticle ? "Update" : "Publish"}
                  </button>
                  {editingArticle && (
                    <button
                      onClick={() => setEditingArticle(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                      type="button"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Articles List */}
            <section>
              <h3 className="text-2xl font-semibold mb-6 text-taa-primary">All Articles</h3>
              <div className="grid gap-6">
                {articles.map((a) => (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center"
                  >
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">{a.title}</h4>
                      <p className="text-sm text-gray-500">
                        {a.category} • {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-3 mt-3 md:mt-0">
                      <button
                        onClick={() => {
                          setForm(a);
                          setEditingArticle(a._id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Articles Section */}
        {menuOpen === "articles" && (
          <>
            <section className="bg-white rounded-2xl shadow-md p-8 mb-10">
              <h3 className="text-xl font-semibold mb-4 text-taa-primary">
                {editingArticle ? "Edit Article" : "Create New Article"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Article Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                  />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Article content..."
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                />
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Upload Image</label>
                  <input type="file" onChange={handleImageUpload} className="block w-full text-gray-500" />
                  {form.image && (
                    <img
                      src={form.image}
                      alt="preview"
                      className="mt-3 w-48 h-32 object-cover rounded-lg shadow"
                    />
                  )}
                </div>
                <label className="flex items-center gap-2">
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
                    className="bg-taa-primary hover:bg-taa-accent text-white px-6 py-2 rounded-lg"
                  >
                    {editingArticle ? "Update" : "Publish"}
                  </button>
                  {editingArticle && (
                    <button
                      onClick={() => setEditingArticle(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                      type="button"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section>
              <h3 className="text-2xl font-semibold mb-6 text-taa-primary">All Articles</h3>
              <div className="grid gap-6">
                {articles.map((a) => (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center"
                  >
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">{a.title}</h4>
                      <p className="text-sm text-gray-500">
                        {a.category} • {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-3 mt-3 md:mt-0">
                      <button
                        onClick={() => {
                          setForm(a);
                          setEditingArticle(a._id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Users Section */}
        {menuOpen === "users" && (
          <section className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-2xl font-semibold mb-6 text-taa-primary">Manage Users</h3>
            <div className="grid gap-6">
              {users.length > 0 ? (
                users.map((user) => (
                  <motion.div
                    key={user._id || user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl shadow flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">{user.name || user.username}</h4>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                        Edit
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">No users found. Add users via the API or form.</p>
              )}
            </div>
          </section>
        )}

        {/* Settings Section */}
        {menuOpen === "settings" && (
          <section className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-2xl font-semibold mb-6 text-taa-primary">Settings</h3>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              {/* Site Configuration */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-taa-primary">Site Configuration</h4>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Site Title</label>
                  <input
                    type="text"
                    placeholder="Enter site title"
                    value={settings.siteTitle}
                    onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Default Category</label>
                  <select
                    value={settings.defaultCategory}
                    onChange={(e) => setSettings({ ...settings, defaultCategory: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-taa-primary">Theme Settings</h4>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.theme === "dark"}
                    onChange={(e) =>
                      setSettings({ ...settings, theme: e.target.checked ? "dark" : "light" })
                    }
                  />
                  <span>Enable Dark Mode</span>
                </label>
              </div>

              {/* API Key Management */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-taa-primary">API Key Management</h4>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">API Key</label>
                  <input
                    type="text"
                    placeholder="Generate or enter API key"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                    disabled
                    value="****************************" // Placeholder for security
                  />
                  <button
                    type="button"
                    className="mt-2 bg-taa-primary hover:bg-taa-accent text-white px-4 py-2 rounded-lg"
                  >
                    Generate New API Key
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-taa-primary hover:bg-taa-accent text-white px-6 py-2 rounded-lg"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ siteTitle: "Text Africa Arcade", defaultCategory: "General", theme: "light" })
                  }
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                >
                  Reset to Defaults
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}