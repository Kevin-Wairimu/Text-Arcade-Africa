import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";

// --- Animation Config ---
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

// --- Category Options ---
const categories = [
  "Media Review",
  "Expert Insights",
  "Reflections",
  "Technology",
  "Events",
  "Digest",
  "Innovation",
  // "Expert View",
  "Trends",
  "General",
];

// --- Main Admin Component ---
export default function Admin() {
  const navigate = useNavigate();

  // --- Data States ---
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    categories: {},
    views: 0,
  });
  const [settings, setSettings] = useState({
    siteTitle: "",
    defaultCategory: "General",
    theme: "dark",
  });
  const [form, setForm] = useState({
    title: "",
    content: "",
    author: "",
    category: "General",
    featured: false,
    image: "",
  });
  const [editingArticle, setEditingArticle] = useState(null);

  // --- UI States ---
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

  // --- Side Effects for Data Fetching & State Persistence ---
  useEffect(() => localStorage.setItem("adminMenuOpen", menuOpen), [menuOpen]);

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

  // --- API Functions ---
  const apiCall = async (method, url, payload, errorKey) => {
    try {
      const response = await API[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      const errorMessage = `Failed to ${errorKey}: ${
        err.response?.data?.details || err.message
      }`;
      setError((prev) => ({ ...prev, [errorKey]: errorMessage }));
      if (err.response?.status === 401) navigate("/login");
      throw err; // Re-throw to be caught by caller
    }
  };

  const fetchArticles = async () => {
    setIsLoading((p) => ({ ...p, articles: true }));
    try {
      const data = await apiCall("get", "/articles", null, "articles");
      const articlesArray = Array.isArray(data.articles) ? data.articles : [];
      setArticles(articlesArray);
      calculateStats(articlesArray);
    } catch (err) {
      /* Error handled in apiCall */
    } finally {
      setIsLoading((p) => ({ ...p, articles: false }));
    }
  };

  const fetchUsers = async () => {
    setIsLoading((p) => ({ ...p, users: true }));
    try {
      const data = await apiCall("get", "/users", null, "users");
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      /* Error handled in apiCall */
    } finally {
      setIsLoading((p) => ({ ...p, users: false }));
    }
  };

  const fetchSettings = async () => {
    setIsLoading((p) => ({ ...p, settings: true }));
    try {
      const data = await apiCall("get", "/settings", null, "settings");
      setSettings(
        data || { siteTitle: "", defaultCategory: "General", theme: "dark" }
      );
    } catch (err) {
      /* Error handled in apiCall */
    } finally {
      setIsLoading((p) => ({ ...p, settings: false }));
    }
  };

  // --- Form & Action Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { ...form, author: form.author || "Text Africa Arcade" };
    try {
      if (editingArticle) {
        await apiCall(
          "put",
          `/articles/${editingArticle}`,
          payload,
          "articles"
        );
      } else {
        await apiCall("post", "/articles", payload, "articles");
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
    } catch (err) {
      /* Error handled in apiCall */
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article permanently?")) return;
    try {
      await apiCall("delete", `/articles/${id}`, null, "articles");
      await fetchArticles();
    } catch (err) {
      /* Error handled in apiCall */
    }
  };

  const handleToggleSuspend = async (userId, currentSuspended) => {
    if (
      !window.confirm(
        `${currentSuspended ? "Unsuspend" : "Suspend"} this user?`
      )
    )
      return;
    try {
      await apiCall(
        "put",
        `/users/${userId}/suspend`,
        { suspended: !currentSuspended },
        "users"
      );
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, suspended: !currentSuspended } : u
        )
      );
    } catch (err) {
      /* Error handled in apiCall */
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading((p) => ({ ...p, settings: true }));
    try {
      await apiCall("put", "/settings", settings, "settings");
      alert("Settings saved!");
    } catch (err) {
      /* Error handled in apiCall */
    } finally {
      setIsLoading((p) => ({ ...p, settings: false }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onloadend = () =>
        setForm((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(compressed);
    } catch (err) {
      alert("Failed to upload image.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const calculateStats = (data) => {
    const total = data.length;
    const featured = data.filter((a) => a.featured).length;
    const views = data.reduce((acc, a) => acc + (a.views || 0), 0);
    const categoriesObj = data.reduce((acc, a) => {
      const c = a.category || "General";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    setStats({ total, featured, categories: categoriesObj, views });
  };

  const formattedDate = (dateString) =>
    new Date(dateString || Date.now()).toLocaleDateString();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-[#111827] via-[#0b2818] to-[#111827] text-gray-200">
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1E6B2B]/50 backdrop-blur-sm rounded-lg shadow-lg"
        onClick={() => setIsSidebarOpen((s) => !s)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-white"
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

      {/* --- SIDEBAR: Updated for full height responsiveness --- */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 md:w-64 bg-[#111827]/80 backdrop-blur-lg border-r border-white/10 z-40 flex flex-col transform transition-transform duration-300 md:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 flex-shrink-0">
          <h1 className="text-2xl font-bold text-[#77BFA1] text-center md:text-left">
            Admin Panel
          </h1>
        </div>

        <div className="flex-grow overflow-y-auto px-6">
          <nav className="flex flex-col gap-3">
            <button
              onClick={() => {
                navigate("/");
                setIsSidebarOpen(false);
              }}
              className="text-left py-2 px-4 rounded-lg transition hover:bg-white/5 text-gray-300"
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
                className={`text-left py-2 px-4 rounded-lg transition ${
                  menuOpen === key
                    ? "bg-[#1E6B2B] text-white font-semibold"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600/80 hover:bg-red-600 text-white py-2.5 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-10 w-full overflow-y-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-10 text-center md:text-left text-[#77BFA1]"
        >
          {menuOpen.charAt(0).toUpperCase() + menuOpen.slice(1)}
        </motion.h2>

        {/* The rest of your main content remains unchanged... */}
        {menuOpen === "dashboard" && (
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { label: "Total Articles", value: stats.total },
              { label: "Featured", value: stats.featured },
              {
                label: "Categories",
                value: Object.keys(stats.categories).length,
              },
              { label: "Total Views", value: stats.views },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                custom={i}
                className="bg-[#0b2818]/70 backdrop-blur-lg p-6 text-center rounded-2xl border border-[#77BFA1]/30"
              >
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                <p className="text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </section>
        )}

        {menuOpen === "articles" && (
          <section>
            {error.articles && (
              <p className="text-red-400 text-center mb-4">{error.articles}</p>
            )}
            <motion.form
              onSubmit={handleSubmit}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="bg-[#0b2818]/70 backdrop-blur-lg border border-[#77BFA1]/30 rounded-2xl p-6 mb-8"
            >
              <h3 className="text-xl font-semibold mb-4 text-white">
                {editingArticle ? "Edit Article" : "Create New Article"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  required
                  className="bg-black/20 border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#77BFA1] w-full"
                />
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                  className="bg-black/20 border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#77BFA1] w-full"
                >
                  <option value="" disabled>
                    Select Category
                  </option>
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
                  onChange={(e) =>
                    setForm((p) => ({ ...p, author: e.target.value }))
                  }
                  className="sm:col-span-2 bg-black/20 border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#77BFA1] w-full"
                />
                <textarea
                  placeholder="Article content..."
                  rows={8}
                  value={form.content}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, content: e.target.value }))
                  }
                  required
                  className="sm:col-span-2 bg-black/20 border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#77BFA1] w-full"
                />
              </div>
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <input
                  id="article-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1E6B2B] file:text-white hover:file:bg-[#77BFA1]"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, featured: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#77BFA1]"
                  />{" "}
                  Featured
                </label>
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
                        });
                      }}
                      className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1E6B2B] hover:bg-[#77BFA1] text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingArticle
                      ? "Update"
                      : "Publish"}
                  </button>
                </div>
              </div>
            </motion.form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading.articles ? (
                <p>Loading...</p>
              ) : (
                articles.map((a, i) => (
                  <motion.div
                    key={a._id}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="bg-[#0b2818]/70 backdrop-blur-lg border border-[#77BFA1]/30 rounded-2xl overflow-hidden flex flex-col"
                  >
                    {a.image ? (
                      <img
                        src={a.image}
                        alt={a.title}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-20 bg-black/20 flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-white line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {a.category} • {a.views || 0} views
                      </p>
                      <div className="mt-auto pt-4 flex justify-between items-center">
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              setEditingArticle(a._id);
                              setForm(a);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="text-[#77BFA1] hover:text-white text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(a._id)}
                            className="text-red-500 hover:text-red-400 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        {a.featured && (
                          <span className="text-xs font-bold text-[#77BFA1]">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        )}

        {menuOpen === "users" && (
          <section>
            {error.users && (
              <p className="text-red-400 text-center mb-4">{error.users}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading.users ? (
                <p>Loading...</p>
              ) : (
                users.map((user, i) => (
                  <motion.div
                    key={user._id}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="bg-[#0b2818]/70 backdrop-blur-lg border border-[#77BFA1]/30 rounded-2xl p-4 flex flex-col"
                  >
                    <h4 className="font-semibold text-white">
                      {user.name || "Unnamed"}
                    </h4>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <p
                      className={`text-sm mt-2 font-bold ${
                        user.suspended ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {user.suspended ? "SUSPENDED" : "Active"}
                    </p>
                    <button
                      onClick={() =>
                        handleToggleSuspend(user._id, user.suspended)
                      }
                      className={`mt-4 w-full py-2 rounded-lg font-semibold text-sm transition-all ${
                        user.suspended
                          ? "bg-green-600 hover:bg-green-500 text-white"
                          : "bg-red-600 hover:bg-red-500 text-white"
                      }`}
                    >
                      {user.suspended ? "Unsuspend" : "Suspend"}
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        )}

        {menuOpen === "settings" && (
          <section>
            {error.settings && (
              <p className="text-red-400 text-center mb-4">{error.settings}</p>
            )}
            <motion.form
              onSubmit={handleSettingsSubmit}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="bg-[#0b2818]/70 backdrop-blur-lg border border-[#77BFA1]/30 rounded-2xl p-6 max-w-2xl mx-auto"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, siteTitle: e.target.value }))
                    }
                    className="bg-black/20 border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#77BFA1] w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Default Category
                  </label>
                  <select
                    value={settings.defaultCategory}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        defaultCategory: e.target.value,
                      }))
                    }
                    className="bg-black/20 border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#77BFA1] w-full"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, theme: e.target.value }))
                    }
                    className="bg-black/20 border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#77BFA1] w-full"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading.settings}
                  className="bg-[#1E6B2B] hover:bg-[#77BFA1] text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-50"
                >
                  {isLoading.settings ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </motion.form>
          </section>
        )}
      </main>
    </div>
  );
}
