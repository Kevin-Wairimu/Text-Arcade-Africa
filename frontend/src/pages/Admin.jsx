/* Admin.jsx
   Full admin panel — updated from your code.
   - Responsive sidebar with independent toggle
   - Navbar offset detection so headings are never hidden
   - Dashboard, Articles, Users, Analytics, Settings sections
   - Image previews, publish/feature toggles, edit/delete
   - Socket handling preserved
   - Uses your API helper, useAuth, and imageCompression
*/

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ----------------------
   Animations & constants
   ---------------------- */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.42, ease: "easeOut" },
  }),
};

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

const initialFormState = {
  title: "",
  content: "",
  author: "",
  category: "General",
  featured: false,
  image: "",
  link: "",
  published: false,
};

/* ----------------------
   Helper subcomponents
   ---------------------- */
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[#2E7D32]" />
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div
    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg"
    role="alert"
  >
    <p className="font-bold">Error</p>
    <p>{message}</p>
  </div>
);

/* ----------------------
   Admin component
   ---------------------- */
export default function Admin() {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const navbarRef = useRef(null);
  const { user, token, logout } = useAuth();

  // UI state
  const [menuOpen, setMenuOpen] = useState(
    localStorage.getItem("adminMenuOpen") || "dashboard"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState({ articles: true, users: true });
  const [error, setError] = useState({ articles: "", users: "", settings: "" });

  // data state
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingArticle, setEditingArticle] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    categories: {},
    totalViews: 0,
    dailyViews: 0,
    viewsByDate: [],
  });

  // settings (example)
  const [settings, setSettings] = useState({
    siteTitle: "Text Africa Arcade",
    defaultCategory: "General",
    theme: "light",
  });

  // dynamic navbar spacer (so headings don't hide behind fixed Nav)
  const [navHeight, setNavHeight] = useState(0);
  useLayoutEffect(() => {
    // find the top header element (your Nav is a fixed header)
    const header = document.querySelector("header");
    if (header) setNavHeight(header.offsetHeight || 80);
    // update on resize
    const onResize = () => {
      const hdr = document.querySelector("header");
      if (hdr) setNavHeight(hdr.offsetHeight || 80);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ----------------------
     Auth guard
     ---------------------- */
  useEffect(() => {
    if (!token || !user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role?.toLowerCase() !== "admin") {
      alert("Access denied: Admins only.");
      navigate("/", { replace: true });
    }
  }, [user, token, navigate]);

  /* ----------------------
     API helper
     ---------------------- */
  const apiCall = async (method, url, payload, key) => {
    try {
      setError((p) => ({ ...p, [key]: "" }));
      const res = await API[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.response?.data?.details || err?.message || "Network error";
      setError((p) => ({ ...p, [key]: msg }));
      // handle unauthorized globally
      if (err.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      }
      throw err;
    }
  };

  /* ----------------------
     Fetchers
     ---------------------- */
  const fetchArticles = async () => {
    setIsLoading((p) => ({ ...p, articles: true }));
    try {
      const data = await apiCall("get", "/articles", null, "articles");
      const arr = Array.isArray(data?.articles) ? data.articles : [];
      setArticles(arr);
      // compute some stats
      const s = computeStatsFromArticles(arr);
      setStats((prev) => ({ ...prev, ...s }));
    } catch (err) {
      console.error("fetchArticles error", err);
    } finally {
      setIsLoading((p) => ({ ...p, articles: false }));
    }
  };

  const fetchUsers = async () => {
    setIsLoading((p) => ({ ...p, users: true }));
    try {
      const data = await apiCall("get", "/users", null, "users");
      const arr = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
      setUsers(arr);
    } catch (err) {
      console.error("fetchUsers error", err);
    } finally {
      setIsLoading((p) => ({ ...p, users: false }));
    }
  };

  const fetchSettings = async () => {
    setIsLoading((p) => ({ ...p, settings: true }));
    try {
      const data = await apiCall("get", "/settings", null, "settings");
      setSettings(data || settings);
    } catch (err) {
      console.error("fetchSettings", err);
    } finally {
      setIsLoading((p) => ({ ...p, settings: false }));
    }
  };

  /* ----------------------
     Stats helper
     ---------------------- */
  const computeStatsFromArticles = (articlesArr) => {
    const total = articlesArr.reduce((acc, a) => acc + (a.views || 0), 0);
    const featured = articlesArr.filter((a) => a.featured).length;
    const categoriesObj = articlesArr.reduce((acc, a) => {
      const c = a.category || "General";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    const daily = articlesArr.reduce((acc, a) => acc + (a.dailyViews || 0), 0);
    // accumulate viewsByDate if present
    const viewsByDate = articlesArr
      .filter((a) => Array.isArray(a.viewsByDate))
      .flatMap((a) => a.viewsByDate || [])
      .reduce((acc, entry) => {
        if (!entry?.date) return acc;
        const day = new Date(entry.date).toISOString().split("T")[0];
        const ex = acc.find((d) => d.date === day);
        if (ex) ex.views += entry.views || 0;
        else acc.push({ date: day, views: entry.views || 0 });
        return acc;
      }, [])
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return {
      totalViews: total,
      featured,
      categories: categoriesObj,
      dailyViews: daily,
      viewsByDate,
    };
  };

  /* ----------------------
     Socket (real-time)
     ---------------------- */
  useEffect(() => {
    if (!token) return;
    const socket = io(import.meta.env.VITE_API_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("viewsUpdated", ({ articleId, views, dailyViews, viewsByDateEntry }) => {
      setArticles((prev) =>
        prev.map((a) => {
          if (!a) return a;
          if (a._id === articleId || a.id === articleId) {
            const updated = { ...a };
            if (typeof views === "number") updated.views = views;
            if (typeof dailyViews === "number") {
              updated.dailyViews = dailyViews;
              updated.dailyViewsDate = new Date();
            }
            if (viewsByDateEntry && viewsByDateEntry.date) {
              updated.viewsByDate = Array.isArray(updated.viewsByDate) ? [...updated.viewsByDate] : [];
              const day = new Date(viewsByDateEntry.date).toISOString().split("T")[0];
              const ex = updated.viewsByDate.find((v) => new Date(v.date).toISOString().split("T")[0] === day);
              if (ex) ex.views = (ex.views || 0) + (viewsByDateEntry.views || 0);
              else updated.viewsByDate.push({ date: day, views: viewsByDateEntry.views || 0 });
            }
            return updated;
          }
          return a;
        })
      );
    });

    socket.on("dailyViewsReset", () => {
      fetchArticles();
    });

    return () => {
      socket.off("viewsUpdated");
      socket.off("dailyViewsReset");
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ----------------------
     Initial fetch on load / tab change
     ---------------------- */
  useEffect(() => {
    if (!token) return;
    if (menuOpen === "dashboard" || menuOpen === "articles") fetchArticles();
    if (menuOpen === "dashboard" || menuOpen === "users") fetchUsers();
    if (menuOpen === "settings") fetchSettings();
    // persist menu
    localStorage.setItem("adminMenuOpen", menuOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, menuOpen]);

  /* ----------------------
     CRUD and UI handlers
     ---------------------- */
  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = form.title.toLowerCase().replace(/\s+/g, "-");
      const payload = {
        ...form,
        author: user?.name || form.author || "Admin",
        link: form.link || `${window.location.origin}/articles/${slug}`,
      };
      await apiCall(editingArticle ? "put" : "post", editingArticle ? `/articles/${editingArticle}` : "/articles", payload, "articles");
      await fetchArticles();
      setForm(initialFormState);
      setEditingArticle(null);
    } catch (err) {
      console.error("handleArticleSubmit", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await apiCall("delete", `/articles/${id}`, null, "articles");
      await fetchArticles();
    } catch (err) {
      console.error("handleDelete", err);
    }
  };

  const handleSuspendToggle = async (id, suspended) => {
    try {
      await apiCall("patch", `/users/${id}/suspend`, { suspended: !suspended }, "users");
      await fetchUsers();
    } catch (err) {
      console.error("handleSuspendToggle", err);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article._id);
    setForm({
      title: article.title || "",
      content: article.content || "",
      author: article.author || article.authorName || user?.name || "",
      category: article.category || "General",
      featured: !!article.featured,
      image: article.image || "",
      link: article.link || "",
      published: !!article.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200 });
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("Image compression failed:", err);
      alert("Failed to upload image.");
    }
  };

  const cancelEdit = () => {
    setEditingArticle(null);
    setForm(initialFormState);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // toggle publish
  const togglePublish = async (articleId, published) => {
    try {
      await apiCall("patch", `/articles/${articleId}/publish`, { published: !published }, "articles");
      await fetchArticles();
    } catch (err) {
      console.error("togglePublish", err);
    }
  };

  // toggle featured
  const toggleFeatured = async (articleId, featured) => {
    try {
      await apiCall("patch", `/articles/${articleId}/feature`, { featured: !featured }, "articles");
      await fetchArticles();
    } catch (err) {
      console.error("toggleFeatured", err);
    }
  };

  // update settings
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiCall("put", "/settings", settings, "settings");
      alert("Settings saved");
    } catch (err) {
      console.error("handleSettingsSubmit", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV helper for articles or users
  const exportCSV = (rows, filename = "export.csv") => {
    if (!rows || rows.length === 0) {
      alert("No data to export");
      return;
    }
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(",") +
      "\n" +
      rows.map((r) => keys.map((k) => `"${String(r[k] || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ----------------------
     Sidebar items
     ---------------------- */
  const sidebarItems = ["dashboard", "articles", "users", "analytics", "settings"];

  /* ----------------------
     Render
     ---------------------- */
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#E8F5E9] text-[#2E7D32]">
      {/* spacer to avoid header overlap on small screens */}
      <div style={{ height: `${navHeight}px` }} className="w-full lg:hidden" />

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed inset-y-0 left-0 w-72 lg:w-64 bg-white border-r border-[#2E7D32]/30 z-50 flex flex-col`}
          >
            <div className="p-6 border-b border-[#81C784]/30">
              <h1 className="text-2xl font-bold text-center lg:text-left text-[#2E7D32]">Admin Panel</h1>
            </div>

            <nav className="flex-grow px-6 py-4">
              <div className="flex flex-col gap-2">
                {sidebarItems.map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setMenuOpen(key);
                      setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 text-left py-2 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#81C784] ${
                      menuOpen === key ? "bg-[#2E7D32] text-white font-semibold" : "text-[#2E7D32] hover:bg-[#81C784]/20"
                    }`}
                  >
                    <span className="capitalize">{key}</span>
                  </button>
                ))}
              </div>
            </nav>

            <div className="p-6 border-t border-[#81C784]/30">
              <button onClick={handleLogout} className="w-full bg-[#2E7D32] hover:bg-[#81C784] text-white py-2 rounded-lg font-medium">
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content (pushed by sidebar width on lg) */}
      <div className="flex-1 flex flex-col lg:ml-72">
        {/* Mobile header (small screens) */}
        <header className="lg:hidden sticky top-0 bg-white/90 backdrop-blur-sm p-4 border-b border-[#2E7D32]/30 flex justify-between items-center z-40">
          <h2 className="text-xl font-bold text-[#2E7D32]">{menuOpen.charAt(0).toUpperCase() + menuOpen.slice(1)}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2E7D32]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {isSidebarOpen && window.innerWidth < 1024 && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-30"></div>}

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="mb-4 flex justify-end lg:hidden">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="bg-[#2E7D32] text-white px-4 py-2 rounded-lg hover:bg-[#81C784] transition">
              {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            </button>
          </div>

          {/* Page heading (visible on lg) */}
          <motion.h2 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-8 text-[#2E7D32] hidden lg:block">
            {menuOpen.charAt(0).toUpperCase() + menuOpen.slice(1)}
          </motion.h2>

          {/* === DASHBOARD === */}
          {menuOpen === "dashboard" && (
            <section>
              {isLoading.articles || isLoading.users ? <LoadingSpinner /> : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md">
                      <h4 className="text-sm text-[#2E7D32]/70">Total Articles</h4>
                      <p className="text-3xl font-bold mt-2 text-[#2E7D32]">{articles.length}</p>
                    </motion.div>

                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md">
                      <h4 className="text-sm text-[#2E7D32]/70">Total Users</h4>
                      <p className="text-3xl font-bold mt-2 text-[#2E7D32]">{users.length}</p>
                    </motion.div>

                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md">
                      <h4 className="text-sm text-[#2E7D32]/70">Active Users</h4>
                      <p className="text-3xl font-bold mt-2 text-green-700">{users.filter(u => !u.suspended).length}</p>
                    </motion.div>

                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md">
                      <h4 className="text-sm text-[#2E7D32]/70">Total Views</h4>
                      <p className="text-3xl font-bold mt-2 text-[#2E7D32]">{stats.totalViews}</p>
                    </motion.div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold mb-1 text-[#2E7D32]">Daily Views</h4>
                        <p className="text-3xl font-bold text-green-700">{stats.dailyViews}</p>
                        <p className="text-sm text-[#2E7D32]/70 mt-1">Today's total across all articles</p>
                      </div>
                      <div className="text-right">
                        <button onClick={() => fetchArticles()} className="px-3 py-1 rounded-lg bg-[#2E7D32] text-white">Refresh</button>
                      </div>
                    </div>

                    <div className="mt-6">
                      {(!stats.viewsByDate || stats.viewsByDate.length === 0) ? (
                        <p className="text-[#2E7D32]/60 italic">No historical daily view data available yet.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={stats.viewsByDate} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fill: "#2E7D32" }} />
                            <YAxis tick={{ fill: "#2E7D32" }} />
                            <Tooltip contentStyle={{ backgroundColor: "#E8F5E9", borderColor: "#2E7D32" }} />
                            <Line type="monotone" dataKey="views" stroke="#2E7D32" strokeWidth={2} dot={{ fill: "#1B5E20" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {/* === ARTICLES === */}
          {menuOpen === "articles" && (
            <section className="space-y-6">
              {/* Add / Edit Form */}
              <form onSubmit={handleArticleSubmit} className="bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <h3 className="text-xl font-semibold mb-2 text-[#2E7D32]">{editingArticle ? "Edit Article" : "Add New Article"}</h3>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => exportCSV(articles.map(a => ({ title: a.title, category: a.category, views: a.views })), "articles.csv")} className="px-3 py-2 bg-[#2E7D32] text-white rounded-lg">Export CSV</button>
                    <button type="button" onClick={() => { setForm(initialFormState); setEditingArticle(null); }} className="px-3 py-2 bg-gray-100 rounded-lg">Reset</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border border-[#2E7D32]/30 rounded-lg p-2 w-full" required />
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-[#2E7D32]/30 rounded-lg p-2 w-full">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <textarea rows="6" placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="border border-[#2E7D32]/30 rounded-lg p-2 w-full mt-4" required />

                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1" />
                    {form.image && <div className="mt-2"><img src={form.image} alt="preview" className="w-40 h-28 object-cover rounded-lg border" /></div>}
                  </div>

                  <div className="flex gap-2 items-center">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))} />
                      <span className="text-sm">Featured</span>
                    </label>

                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={!!form.published} onChange={(e) => setForm(prev => ({ ...prev, published: e.target.checked }))} />
                      <span className="text-sm">Published</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  {editingArticle && <button type="button" onClick={cancelEdit} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>}
                  <button type="submit" disabled={isSubmitting} className="bg-[#2E7D32] hover:bg-[#81C784] text-white px-4 py-2 rounded-lg">{editingArticle ? "Update" : "Add"} Article</button>
                </div>
              </form>

              {/* Articles table */}
              {isLoading.articles ? <LoadingSpinner /> : (
                <div className="overflow-x-auto">
                  <div className="min-w-full bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-4">
                    {error.articles && <ErrorDisplay message={error.articles} />}

                    <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                      <div className="flex gap-2">
                        <button onClick={() => exportCSV(articles, "articles_full.csv")} className="px-3 py-2 bg-[#2E7D32] text-white rounded-lg">Export All</button>
                        <button onClick={() => fetchArticles()} className="px-3 py-2 bg-gray-100 rounded-lg">Refresh</button>
                      </div>
                      <div className="text-sm text-[#2E7D32]/70">Total: {articles.length}</div>
                    </div>

                    <table className="min-w-full table-auto text-left">
                      <thead className="bg-[#E8F5E9] sticky top-0">
                        <tr className="border-b border-[#2E7D32]/30">
                          <th className="px-3 py-2">Title</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2">Image</th>
                          <th className="px-3 py-2">Views</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {articles.map((a) => (
                          <tr key={a._id} className="border-b border-[#2E7D32]/10 hover:bg-[#E8F5E9]/50">
                            <td className="px-3 py-2 max-w-[280px]">
                              <div className="font-medium">{a.title}</div>
                              <div className="text-xs text-[#2E7D32]/60 line-clamp-2 mt-1">{a.content?.slice(0, 120) || "—"}</div>
                            </td>
                            <td className="px-3 py-2">{a.category}</td>
                            <td className="px-3 py-2">
                              {a.image ? <img src={a.image} alt="preview" className="w-28 h-16 object-cover rounded" /> : <div className="text-[#2E7D32]/60 italic">No Image</div>}
                            </td>
                            <td className="px-3 py-2">{a.views || 0}</td>
                            <td className="px-3 py-2">
                              <div className="flex gap-2 items-center">
                                <button onClick={() => togglePublish(a._id, !!a.published)} className={`px-2 py-1 rounded text-white text-xs ${a.published ? "bg-green-600" : "bg-gray-500"}`}>
                                  {a.published ? "Published" : "Draft"}
                                </button>
                                <button onClick={() => toggleFeatured(a._id, !!a.featured)} className={`px-2 py-1 rounded text-white text-xs ${a.featured ? "bg-yellow-600" : "bg-gray-500"}`}>
                                  {a.featured ? "Featured" : "Feature"}
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2 flex gap-2 flex-wrap">
                              <button onClick={() => handleEdit(a)} className="bg-yellow-400 px-2 py-1 rounded text-white">Edit</button>
                              <button onClick={() => handleDelete(a._id)} className="bg-red-500 px-2 py-1 rounded text-white">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* === USERS === */}
          {menuOpen === "users" && (
            <section>
              <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <h3 className="text-xl font-semibold text-[#2E7D32]">Registered Users</h3>
                <div className="flex gap-2">
                  <button onClick={() => exportCSV(users, "users.csv")} className="px-3 py-2 bg-[#2E7D32] text-white rounded-lg">Export CSV</button>
                  <button onClick={() => fetchUsers()} className="px-3 py-2 bg-gray-100 rounded-lg">Refresh</button>
                </div>
              </div>

              {isLoading.users ? <LoadingSpinner /> : (
                <div className="overflow-x-auto bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-4">
                  {error.users && <ErrorDisplay message={error.users} />}
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[#E8F5E9]">
                      <tr className="border-b border-[#2E7D32]/30">
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Role</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-[#2E7D32]/10 hover:bg-[#E8F5E9]/50">
                          <td className="px-3 py-2">{u.name || "N/A"}</td>
                          <td className="px-3 py-2">{u.email}</td>
                          <td className="px-3 py-2 capitalize">{u.role}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.suspended ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                              {u.suspended ? "Suspended" : "Active"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => handleSuspendToggle(u._id, u.suspended)} className={`px-3 py-1.5 rounded-md text-white text-sm font-medium ${u.suspended ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                              {u.suspended ? "Unsuspend" : "Suspend"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* === ANALYTICS === */}
          {menuOpen === "analytics" && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#2E7D32]">Analytics</h3>
                <div className="text-sm text-[#2E7D32]/70">Last 30 days</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md">
                  <h4 className="text-sm text-[#2E7D32]/70">Total Views</h4>
                  <p className="text-3xl font-bold mt-2 text-[#2E7D32]">{stats.totalViews}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md">
                  <h4 className="text-sm text-[#2E7D32]/70">Daily Views</h4>
                  <p className="text-3xl font-bold mt-2 text-green-700">{stats.dailyViews}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md">
                  <h4 className="text-sm text-[#2E7D32]/70">Featured Articles</h4>
                  <p className="text-3xl font-bold mt-2 text-[#2E7D32]">{stats.featured}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md">
                <h4 className="text-lg font-semibold mb-4 text-[#2E7D32]">Views Over Time</h4>
                {(!stats.viewsByDate || stats.viewsByDate.length === 0) ? (
                  <p className="text-[#2E7D32]/60 italic">No view history available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.viewsByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fill: "#2E7D32" }} />
                      <YAxis tick={{ fill: "#2E7D32" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#E8F5E9", borderColor: "#2E7D32" }} />
                      <Line type="monotone" dataKey="views" stroke="#2E7D32" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
          )}

          {/* === SETTINGS === */}
          {menuOpen === "settings" && (
            <section>
              <h3 className="text-xl font-semibold mb-4 text-[#2E7D32]">Settings</h3>
              <form onSubmit={handleSettingsSubmit} className="bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-6 max-w-3xl">
                <div className="mb-4">
                  <label className="block text-sm mb-1 text-[#2E7D32]">Site Title</label>
                  <input value={settings.siteTitle} onChange={(e) => setSettings(prev => ({ ...prev, siteTitle: e.target.value }))} className="w-full border border-[#2E7D32]/30 rounded-lg p-2" />
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-1 text-[#2E7D32]">Default Category</label>
                  <select value={settings.defaultCategory} onChange={(e) => setSettings(prev => ({ ...prev, defaultCategory: e.target.value }))} className="w-full border border-[#2E7D32]/30 rounded-lg p-2">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-1 text-[#2E7D32]">Theme</label>
                  <select value={settings.theme} onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))} className="w-full border border-[#2E7D32]/30 rounded-lg p-2">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button type="submit" disabled={isSubmitting} className="bg-[#2E7D32] hover:bg-[#81C784] text-white px-4 py-2 rounded-lg">{isSubmitting ? "Saving..." : "Save Settings"}</button>
                  <button type="button" onClick={() => fetchSettings()} className="bg-gray-100 px-4 py-2 rounded-lg">Reload</button>
                </div>
              </form>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
