import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";

const categories = [
  "Politics",
  "Business",
  "Technology",
  "Sports",
  "Health",
  "Entertainment",
  "General",
];

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
      setForm({
        title: "",
        content: "",
        author: "",
        category: "General",
        featured: false,
        image: "",
      });
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
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      useWebWorker: true,
    });
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(compressed);
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 backdrop-blur-xl bg-white/10 border-r border-white/10 h-screen fixed flex flex-col justify-between">
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            🧭 Admin Panel
          </h1>
          <nav className="flex flex-col gap-3">
            {["dashboard", "articles", "users", "settings"].map((key) => (
              <button
                key={key}
                onClick={() => setMenuOpen(key)}
                className={`text-left py-2 px-4 rounded-lg transition ${
                  menuOpen === key
                    ? "bg-gradient-to-r from-purple-600 to-blue-600"
                    : "hover:bg-white/10"
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="m-6 bg-red-600/80 hover:bg-red-700 py-2 rounded-lg"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10 overflow-y-auto">
        <motion.h2
          className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {menuOpen === "dashboard"
            ? "📊 Admin Dashboard"
            : menuOpen === "articles"
            ? "📰 Manage Articles"
            : menuOpen === "users"
            ? "👥 Manage Users"
            : "⚙️ Settings"}
        </motion.h2>

        {/* Dashboard Section */}
        {menuOpen === "dashboard" && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-6 text-center shadow-lg">
              <h3 className="text-2xl font-bold text-blue-400">
                {stats.total}
              </h3>
              <p className="text-gray-300">Total Articles</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-6 text-center shadow-lg">
              <h3 className="text-2xl font-bold text-purple-400">
                {stats.featured}
              </h3>
              <p className="text-gray-300">Featured</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-6 text-center shadow-lg">
              <h3 className="text-2xl font-bold text-green-400">
                {Object.keys(stats.categories).length}
              </h3>
              <p className="text-gray-300">Categories</p>
            </div>
          </div>
        )}

        {/* Articles Section */}
        {menuOpen === "articles" && (
          <section className="mt-10">
            <motion.form
              onSubmit={handleSubmit}
              className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl shadow-2xl p-8 mb-10"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-100">
                {editingArticle ? "✏️ Edit Article" : "📰 Create New Article"}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Article content..."
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                className="w-full mt-4 bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-4 flex items-center justify-between">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="text-gray-400"
                />
                <label className="flex items-center gap-2 text-gray-300">
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
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white"
                >
                  {editingArticle ? "Update" : "Publish"}
                </button>
                {editingArticle && (
                  <button
                    type="button"
                    onClick={() => setEditingArticle(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.form>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <motion.div
                  key={a._id}
                  className="p-5 backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl hover:shadow-xl transition"
                  whileHover={{ scale: 1.02 }}
                >
                  {a.image && (
                    <img
                      src={a.image}
                      alt={a.title}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-white">{a.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {a.category} • {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => {
                        setForm(a);
                        setEditingArticle(a._id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-blue-400 hover:text-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
