
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";

const categories = ["Politics", "Business", "Technology", "Sports", "Health", "Entertainment", "General"];
const roles = ["user", "admin", "editor"];

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
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isUserSubmitting, setIsUserSubmitting] = useState(false);
  const [userError, setUserError] = useState("");
  const [settings, setSettings] = useState({
    siteTitle: "Text Africa Arcade",
    defaultCategory: "General",
    theme: "light",
  });
  const token = localStorage.getItem("token");

  // --- Helper Functions ---
  const validateUserForm = () => {
    const { username, email, password } = userForm;
    if (!username || username.length < 3) {
      setUserError("Username must be at least 3 characters long");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setUserError("Invalid email format");
      return false;
    }
    if (!editingUser && (!password || password.length < 6)) {
      setUserError("Password must be at least 6 characters long");
      return false;
    }
    setUserError("");
    return true;
  };

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

  // --- Fetch Settings ---
  async function fetchSettings() {
    try {
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

  // --- Handle Article Form ---
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
      alert("Failed to submit article. Please try again.");
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
      alert("Failed to delete article. Please try again.");
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
      alert("Failed to process image. Please try again.");
    }
  }

  // --- Handle User Form ---
  async function handleUserSubmit(e) {
    e.preventDefault();
    if (!validateUserForm()) return;
    setIsUserSubmitting(true);
    try {
      if (editingUser) {
        await API.put(`/api/users/${editingUser}`, userForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("User updated successfully!");
      } else {
        await API.post("/api/users/register", userForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("User registered successfully!");
      }
      setUserForm({ username: "", email: "", password: "", role: "user" });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Error processing user:", err);
      setUserError("Failed to process user. Please try again.");
    } finally {
      setIsUserSubmitting(false);
    }
  }

  // --- Handle User Deletion ---
  async function handleUserDelete(id) {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await API.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setUserError("Failed to delete user. Please try again.");
    }
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
            {["dashboard", "articles", "users", "settings"].map((menu) => (
              <button
                key={menu}
                onClick={() => setMenuOpen(menu)}
                className={`text-left py-2 px-4 rounded-lg transition-colors ${
                  menuOpen === menu
                    ? "bg-taa-accent text-white"
                    : "hover:bg-taa-accent hover:text-white"
                }`}
              >
                {menu.charAt(0).toUpperCase() + menu.slice(1)}
              </button>
            ))}
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
            <section className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { title: "Total Articles", value: stats.total },
                { title: "Featured Articles", value: stats.featured },
                { title: "Categories", value: Object.keys(stats.categories).length },
              ].map((stat) => (
                <div key={stat.title} className="bg-white shadow rounded-xl p-6 text-center">
                  <h3 className="text-2xl font-bold text-taa-primary">{stat.value}</h3>
                  <p className="text-gray-600">{stat.title}</p>
                </div>
              ))}
            </section>

            <section className="bg-white rounded-2xl shadow-md p-8 mb-10">
              <h3 className="text-xl font-semibold mb-4 text-taa-primary">
                {editingArticle ? "Edit Article" : "Create New Article"}
              </h3>
              <form onSubmit={handleArticleSubmit} className="space-y-4">
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                />
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Upload Image</label>
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="block w-full text-gray-500"
                    accept="image/*"
                  />
                  {form.image && (
                    <img
                      src={form.image}
                      alt="Preview"
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
                    className="bg-taa-primary hover:bg-taa-accent text-white px-6 py-2 rounded-lg disabled:opacity-50"
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
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
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
                {articles.length > 0 ? (
                  articles.map((article) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center"
                    >
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800">{article.title}</h4>
                        <p className="text-sm text-gray-500">
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
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArticleDelete(article._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-8">No articles found.</p>
                )}
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
              <form onSubmit={handleArticleSubmit} className="space-y-4">
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                />
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Upload Image</label>
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="block w-full text-gray-500"
                    accept="image/*"
                  />
                  {form.image && (
                    <img
                      src={form.image}
                      alt="Preview"
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
                    className="bg-taa-primary hover:bg-taa-accent text-white px-6 py-2 rounded-lg disabled:opacity-50"
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
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
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
                {articles.length > 0 ? (
                  articles.map((article) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center"
                    >
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800">{article.title}</h4>
                        <p className="text-sm text-gray-500">
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
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArticleDelete(article._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-8">No articles found.</p>
                )}
              </div>
            </section>
          </>
        )}

        {/* Users Section */}
        {menuOpen === "users" && (
          <section className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-2xl font-semibold mb-6 text-taa-primary">Manage Users</h3>

            {/* User Form */}
            <div className="mb-10">
              <h4 className="text-lg font-medium mb-4 text-taa-primary">
                {editingUser ? "Edit User" : "Register New User"}
              </h4>
              {userError && (
                <p className="text-red-500 mb-4">{userError}</p>
              )}
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    {editingUser ? "New Password (optional)" : "Password"}
                  </label>
                  <input
                    type="password"
                    placeholder={editingUser ? "Enter new password (leave blank to keep current)" : "Enter password"}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isUserSubmitting}
                    className="bg-taa-primary hover:bg-taa-accent text-white px-6 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isUserSubmitting ? "Processing..." : editingUser ? "Update User" : "Register User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserForm({ username: "", email: "", password: "", role: "user" });
                      setEditingUser(null);
                      setUserError("");
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                  >
                    {editingUser ? "Cancel" : "Clear"}
                  </button>
                </div>
              </form>
            </div>

            {/* Users List */}
            <h4 className="text-lg font-medium mb-4 text-taa-primary">Registered Users</h4>
            <div className="grid gap-6">
              {users.length > 0 ? (
                users.map((user) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center"
                  >
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">{user.username}</h4>
                      <p className="text-sm text-gray-500">
                        {user.email} • Role: {user.role}
                      </p>
                    </div>
                    <div className="flex gap-3 mt-3 md:mt-0">
                      <button
                        onClick={() => {
                          setUserForm({
                            username: user.username,
                            email: user.email,
                            password: "",
                            role: user.role,
                          });
                          setEditingUser(user._id);
                          setUserError("");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUserDelete(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">No users found. Register new users using the form above.</p>
              )}
            </div>
          </section>
        )}

        {/* Settings Section */}
        {menuOpen === "settings" && (
          <section className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-2xl font-semibold mb-6 text-taa-primary">Settings</h3>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-taa-primary">Site Configuration</h4>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Site Title</label>
                  <input
                    type="text"
                    placeholder="Enter site title"
                    value={settings.siteTitle}
                    onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                    required
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
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-taa-primary">API Key Management</h4>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">API Key</label>
                  <input
                    type="text"
                    placeholder="Generate or enter API key"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-taa-accent"
                    disabled
                    value="****************************"
                  />
                  <button
                    type="button"
                    className="mt-2 bg-taa-primary hover:bg-taa-accent text-white px-4 py-2 rounded-lg"
                    disabled
                  >
                    Generate New API Key
                  </button>
                </div>
              </div>
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
