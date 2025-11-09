import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";
import { io } from "socket.io-client";

// --- Animation Config ---
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

// --- Article Categories ---
const categories = [
  "Media Review",
  "Expert Insights",
  "Reflections",
  "Technology",
  "Events",
  "Digest",
  "Innovation",
  "Trends",
  "General",
  "Reports",
  "Archives",
];

export default function Admin() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    categories: {},
    views: 0,
    totalViews: 0,
  });
  const [settings, setSettings] = useState({
    siteTitle: "",
    defaultCategory: "General",
    theme: "light",
  });
  const [form, setForm] = useState({
    title: "",
    content: "",
    author: "",
    category: "General",
    featured: false,
    image: "",
    link: "",
  });
  const [editingArticle, setEditingArticle] = useState(null);
  const [menuOpen, setMenuOpen] = useState(
    () => localStorage.getItem("adminMenuOpen") || "dashboard"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState({
    articles: true,
    users: true,
    settings: true,
  });
  const [error, setError] = useState({ articles: "", users: "", settings: "" });
  const token = localStorage.getItem("token");

const generateSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, "");

  // --- Persist sidebar menu selection ---
  useEffect(() => localStorage.setItem("adminMenuOpen", menuOpen), [menuOpen]);

  // --- Fetch data depending on menu ---
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      if (menuOpen === "dashboard" || menuOpen === "articles")
        await fetchArticles();
      if (menuOpen === "users") await fetchUsers();
      if (menuOpen === "settings") await fetchSettings();
    };
    fetchData();
  }, [menuOpen, token]);

  // --- API helper with error handling ---
  const apiCall = async (method, url, payload, errorKey) => {
    try {
      const response = await API[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      const msg = `Failed to ${errorKey}: ${
        err.response?.data?.details || err.message
      }`;
      setError((p) => ({ ...p, [errorKey]: msg }));
      if (err.response?.status === 401) navigate("/login");
      throw err;
    }
  };

  // --- Fetch articles ---
  const fetchArticles = async () => {
    setIsLoading((p) => ({ ...p, articles: true }));
    try {
      const data = await apiCall("get", "/articles", null, "articles");
      const arr = Array.isArray(data.articles) ? data.articles : [];
      setArticles(arr);
      calculateStats(arr);
    } finally {
      setIsLoading((p) => ({ ...p, articles: false }));
    }
  };

  // --- Fetch users ---
  const fetchUsers = async () => {
    setIsLoading((p) => ({ ...p, users: true }));
    try {
      const data = await apiCall("get", "/users", null, "users");
      setUsers(Array.isArray(data.users) ? data.users : []);
    } finally {
      setIsLoading((p) => ({ ...p, users: false }));
    }
  };

  // --- Fetch site settings ---
  const fetchSettings = async () => {
    setIsLoading((p) => ({ ...p, settings: true }));
    try {
      const data = await apiCall("get", "/settings", null, "settings");
      setSettings(
        data || { siteTitle: "", defaultCategory: "General", theme: "light" }
      );
    } finally {
      setIsLoading((p) => ({ ...p, settings: false }));
    }
  };

  // --- Handle article submit ---
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  // Generate link automatically if empty or update when editing
  const articleLink =
    form.link || `${window.location.origin}/articles/${generateSlug(form.title)}`;

  const payload = { 
    ...form, 
    author: form.author || "Text Africa Arcade", 
    link: articleLink 
  };

  try {
    let response;
    if (editingArticle) {
      response = await apiCall(
        "put",
        `/articles/${editingArticle}`,
        payload,
        "articles"
      );
    } else {
      response = await apiCall("post", "/articles", payload, "articles");
    }

    // Refresh articles list
    await fetchArticles();

    // Reset form
    setForm({
      title: "",
      content: "",
      author: "",
      category: "General",
      featured: false,
      image: "",
      link: "",
    });
    setEditingArticle(null);
  } finally {
    setIsSubmitting(false);
  }
};
;

  // --- Delete article ---
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article permanently?")) return;
    await apiCall("delete", `/articles/${id}`, null, "articles");
    await fetchArticles();
  };

  // --- Calculate stats ---
  const calculateStats = (data) => {
    const total = data.length;
    const featured = data.filter((a) => a.featured).length;
    const views = data.reduce((acc, a) => acc + (a.views || 0), 0);
    const categories = data.reduce((acc, a) => {
      const c = a.category || "General";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    setStats({ total, featured, categories, views, totalViews: views });
  };

  // --- Logout ---
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // --- Edit article ---
const handleEdit = (article) => {
  const defaultLink =
    article.link || `${window.location.origin}/articles/${generateSlug(article.title)}`;

  setForm({
    title: article.title,
    content: article.content,
    author: article.author,
    category: article.category,
    featured: article.featured,
    image: article.image,
    link: defaultLink, // automatically fill link
  });
  setEditingArticle(article._id);
  setMenuOpen("articles");
  window.scrollTo({ top: 0, behavior: "smooth" });
};


  // --- Image upload with compression ---
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("Image upload failed", err);
      alert("Failed to upload/compress image.");
    }
  };

  // --- Socket for real-time views ---
  const socket = io(import.meta.env.VITE_API_URL);

  useEffect(() => {
    socket.on("connect", () =>
      console.log("🟢 Connected to socket:", socket.id)
    );
    socket.on("disconnect", () => console.log("🔴 Socket disconnected"));

    socket.on("viewsUpdated", (data) => {
      console.log("📊 Real-time view update:", data);
      setStats((prev) => ({
        ...prev,
        totalViews: prev.totalViews + 1,
      }));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#E8F5E9] text-[#2E7D32]">
      {/* --- Mobile Toggle --- */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#2E7D32]/90 rounded-lg shadow-md text-white"
        onClick={() => setIsSidebarOpen((s) => !s)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={
              isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
            }
          />
        </svg>
      </button>

      {/* --- Sidebar --- */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 md:w-64 bg-white text-[#2E7D32] border-r border-[#2E7D32]/30 z-40 flex flex-col transform transition-transform duration-300 md:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 border-b border-[#81C784]/30 bg-white">
          <h1 className="text-2xl font-bold text-center md:text-left text-[#2E7D32]">
            Admin Panel
          </h1>
        </div>
        <div className="flex-grow px-6 py-4 bg-white">
          <nav className="flex flex-col gap-2">
            {["dashboard", "articles", "users", "settings"].map((key) => (
              <button
                key={key}
                onClick={() => {
                  setMenuOpen(key);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 text-left py-2 px-4 rounded-lg transition-all focus:outline-none ${
                  menuOpen === key
                    ? "bg-[#2E7D32] text-white font-semibold"
                    : "text-[#2E7D32] hover:bg-[#81C784]/20"
                }`}
                aria-current={menuOpen === key}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      key === "dashboard"
                        ? "M3 13h8V3H3v10z M13 21h8V11h-8v10z M13 3v6h8V3h-8z"
                        : key === "articles"
                        ? "M19 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"
                        : key === "users"
                        ? "M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
                        : "M12 8v4l3 3"
                    }
                  />
                </svg>
                <span className="capitalize">{key}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t border-[#81C784]/30 bg-white">
          <button
            onClick={handleLogout}
            className="w-full bg-[#2E7D32] hover:bg-[#81C784] text-white py-2 rounded-lg font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-center md:text-left text-[#2E7D32]"
        >
          {menuOpen.charAt(0).toUpperCase() + menuOpen.slice(1)}
        </motion.h2>

        {/* --- Dashboard Section --- */}
        {menuOpen === "dashboard" && (
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { label: "Total Articles", value: stats.total },
              { label: "Featured", value: stats.featured },
              {
                label: "Categories",
                value: Object.keys(stats.categories).length,
              },
              { label: "Total Views", value: stats.totalViews },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                custom={i}
                className="bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-6 text-center"
              >
                <h3 className="text-3xl font-bold text-[#2E7D32]">
                  {stat.value}
                </h3>
                <p className="text-sm text-[#2E7D32]/70 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </section>
        )}

        {/* --- Articles Section --- */}
        {menuOpen === "articles" && (
          <section>
            {/* --- Add/Edit Article Form --- */}
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-6 mb-8"
            >
              <h3 className="text-xl font-semibold mb-4 text-[#2E7D32]">
                {editingArticle ? "Edit Article" : "Add New Article"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  className="border border-[#2E7D32]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#81C784] outline-none"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <select
                  className="border border-[#2E7D32]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#81C784] outline-none"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                rows="6"
                placeholder="Content"
                className="border border-[#2E7D32]/30 rounded-lg p-2 w-full mt-4 focus:ring-2 focus:ring-[#81C784] outline-none"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              ></textarea>

              {/* --- Article Link Input --- */}
              <input
                type="url"
                placeholder="Article Link"
                className="border border-[#2E7D32]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#81C784] outline-none w-full mt-4"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />

              {/* --- Image Upload and Preview --- */}
              <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2E7D32]/30 bg-[#E8F5E9] text-[#2E7D32]">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7l4 4 4-4"
                      />
                    </svg>
                    <span className="text-sm">Choose Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {form.image ? (
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-[#2E7D32]/30">
                      <img
                        src={form.image}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-dashed border-[#2E7D32]/30 flex items-center justify-center text-sm text-[#2E7D32]/60 bg-[#E8F5E9]">
                      No image
                    </div>
                  )}
                </div>

                {/* --- Featured Checkbox --- */}
                <label className="flex items-center gap-2 text-[#2E7D32]">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                  />
                  Featured
                </label>

                {/* --- Form Buttons --- */}
                <div className="flex gap-2">
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
                          link: "",
                        });
                      }}
                      className="bg-white hover:bg-[#E8F5E9] border border-[#2E7D32]/30 px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#2E7D32] hover:bg-[#81C784] text-white px-6 py-2 rounded-lg font-medium transition-all"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingArticle
                      ? "Update Article"
                      : "Add Article"}
                  </button>
                </div>
              </div>
            </form>

            {/* --- Articles List --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map((article, i) => (
                <motion.div
                  key={article._id || i}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  className="bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-5 flex flex-col justify-between"
                >
                  <div>
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    ) : (
                      <div className="w-full h-40 bg-[#E8F5E9] rounded-lg mb-3 flex items-center justify-center text-[#2E7D32]/60">
                        No image
                      </div>
                    )}
                    <h4 className="text-xl font-semibold text-[#2E7D32]">
                      {article.title}
                    </h4>
                    <p className="text-sm text-[#2E7D32]/70 mt-1">
                      {article.category}
                    </p>
                    <p className="text-sm mt-2 line-clamp-3 text-[#2E7D32]/80">
                      {article.content}
                    </p>

                    {article.link && (
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm text-[#77BFA1] hover:text-[#2E7D32]/80 font-semibold"
                      >
                        View Full Article
                      </a>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => handleEdit(article)}
                      className="text-sm text-[#2E7D32] hover:text-[#81C784]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* --- Users Section --- */}
        {menuOpen === "users" && (
          <section className="bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-[#2E7D32]">
              Registered Users
            </h3>
            {users.length === 0 ? (
              <p className="text-[#2E7D32]/70">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-[#2E7D32]/30">
                  <thead className="bg-[#E8F5E9] text-[#2E7D32]">
                    <tr>
                      <th className="p-2 text-left border-b border-[#2E7D32]/30">
                        Name
                      </th>
                      <th className="p-2 text-left border-b border-[#2E7D32]/30">
                        Email
                      </th>
                      <th className="p-2 text-left border-b border-[#2E7D32]/30">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-[#81C784]/10">
                        <td className="p-2 border-b border-[#2E7D32]/30">
                          {u.name || "N/A"}
                        </td>
                        <td className="p-2 border-b border-[#2E7D32]/30">
                          {u.email}
                        </td>
                        <td className="p-2 border-b border-[#2E7D32]/30 capitalize">
                          {u.role}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* --- Settings Section --- */}
        {menuOpen === "settings" && (
          <section className="bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-[#2E7D32]">
              Site Settings
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                apiCall("put", "/settings", settings, "settings");
              }}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                placeholder="Site Title"
                className="border border-[#2E7D32]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#81C784] outline-none"
                value={settings.siteTitle}
                onChange={(e) =>
                  setSettings({ ...settings, siteTitle: e.target.value })
                }
              />
              <select
                className="border border-[#2E7D32]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#81C784] outline-none"
                value={settings.defaultCategory}
                onChange={(e) =>
                  setSettings({ ...settings, defaultCategory: e.target.value })
                }
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-[#2E7D32] hover:bg-[#81C784] text-white py-2 rounded-lg font-medium"
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
