import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import API, { BACKEND_URL } from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { io } from "socket.io-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  FileText,
  Users as UsersIcon,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Plus,
  Image as ImageIcon,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Eye,
  Home,
  UserPlus,
  Shield,
  Save,
  ChevronRight,
  BarChart3,
  GripVertical,
  Type,
  Sparkles,
  Columns,
} from "lucide-react";

const socket = io(import.meta.env.VITE_SOCKET_URL || BACKEND_URL);

const CATEGORIES = [
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

const ROLES = ["Admin", "Employee", "Client"];

// ─── Helpers: token ↔ HTML conversion ────────────────────────────────────────

/**
 * Convert saved <figure> HTML back to clean [IMG:url|label] tokens for editing.
 * Handles both /uploads/ paths (with or without BACKEND_URL prefix) and full URLs.
 */
function htmlToTokens(content) {
  return content.replace(
    /<figure[\s\S]*?<img\s+src="([^"]*?)"[\s\S]*?<\/figure>/g,
    (match, url) => {
      const captionMatch = match.match(
        /<figcaption[^>]*>\s*([\s\S]*?)\s*<\/figcaption>/,
      );
      const label = captionMatch
        ? captionMatch[1].replace(/\s+/g, " ").trim()
        : "";
      // Strip BACKEND_URL prefix so we store the canonical /uploads/... path
      const cleanUrl = url.startsWith(BACKEND_URL)
        ? url.slice(BACKEND_URL.length)
        : url;
      return `\n[IMG:${cleanUrl}|${label}]\n`;
    },
  );
}

/**
 * Convert [IMG:url|label] tokens → <figure> HTML for saving.
 * Priority: Uses imageLabels[url] if available, fallback to label in token.
 */
function tokensToHtml(content, imageLabels = {}) {
  return content.replace(/\[IMG:([^\]|]*)\|([^\]]*)\]/g, (_, url, tokenLabel) => {
    const fullUrl = url.startsWith("/uploads/") ? `${BACKEND_URL}${url}` : url;
    // Sidebar caption (assigned caption) is the master source of truth
    const finalLabel = imageLabels[url] || tokenLabel || "Image caption";
    
    return `\n<figure class="my-12 group">
  <div class="rounded-[2rem] overflow-hidden border-4 border-white dark:border-white/5 shadow-2xl relative">
    <img src="${fullUrl}" class="w-full h-auto object-cover" />
  </div>
  <figcaption class="mt-4 text-center text-xs font-bold uppercase tracking-[0.3em] text-taa-primary/60 dark:text-white/40">
    ${finalLabel}
  </figcaption>
</figure>\n`;
  });
}

/**
 * Render token-based content as React elements for the live preview panel.
 * Splits on [IMG:url|label] tokens and renders actual <img> tags inline.
 */
function PreviewRenderer({ content, backendUrl }) {
  if (!content) {
    return (
      <p className="text-gray-400 italic text-sm">
        Start writing to see a preview...
      </p>
    );
  }
  const parts = content.split(/(\[IMG:[^\]]*\])/g);
  return (
    <div className="prose prose-sm max-w-none text-taa-dark dark:text-white leading-relaxed">
      {parts.map((part, i) => {
        const match = part.match(/^\[IMG:([^\]|]*)\|([^\]]*)\]$/);
        if (match) {
          const [, url, label] = match;
          const src = url.startsWith("/uploads/") ? `${backendUrl}${url}` : url;
          return (
            <figure key={i} className="my-6">
              <div className="rounded-2xl overflow-hidden border-2 border-taa-primary/10 shadow-lg">
                <img
                  src={src}
                  className="w-full h-auto object-cover"
                  alt={label}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              {label && (
                <figcaption className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-taa-primary/60 dark:text-white/40">
                  {label}
                </figcaption>
              )}
            </figure>
          );
        }
        // Render plain text, preserving line breaks
        return part ? (
          <span key={i} style={{ whiteSpace: "pre-wrap" }}>
            {part}
          </span>
        ) : null;
      })}
    </div>
  );
}

/**
 * Safely convert Mongoose Map / plain object imageLabels to a plain JS object.
 * Handles: Map instances, objects with .toObject(), plain objects, null/undefined.
 */
function normalizeImageLabels(raw) {
  if (!raw) return {};
  if (raw instanceof Map) {
    return Object.fromEntries(raw.entries());
  }
  if (typeof raw.toObject === "function") {
    return raw.toObject();
  }
  if (typeof raw === "object") {
    // Filter out Mongoose internal keys like $__mutableListeners
    return Object.fromEntries(
      Object.entries(raw).filter(([k]) => !k.startsWith("$")),
    );
  }
  return {};
}

// ─── Main Component ───────────────────────────────────────────────────────────

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

  const emptyForm = {
    title: "",
    content: "",
    author: "",
    category: "General",
    featured: false,
    images: [],
    sourceUrl: "",
    videoUrl: "",
    imageLabels: {},
  };

  const [articleForm, setArticleForm] = useState(emptyForm);
  const [editingArticle, setEditingArticle] = useState(null);
  const [showReorder, setShowReorder] = useState(false);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Client",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const contentRef = React.useRef(null);

  const [menuOpen, setMenuOpen] = useState(
    () => localStorage.getItem("adminMenuOpen") || "dashboard",
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

  useEffect(() => localStorage.setItem("adminMenuOpen", menuOpen), [menuOpen]);

  const apiCall = useCallback(
    async (method, url, payload, errorKey) => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        let response;
        const lowerMethod = method.toLowerCase();
        if (lowerMethod === "get" || lowerMethod === "delete") {
          response = await API[lowerMethod](url, config);
        } else {
          response = await API[lowerMethod](url, payload, config);
        }
        return response.data;
      } catch (err) {
        setError((p) => ({
          ...p,
          [errorKey]: err.response?.data?.message || err.message,
        }));
        if (err.response?.status === 401) navigate("/login");
        throw err;
      }
    },
    [token, navigate],
  );

  const fetchArticles = useCallback(async () => {
    setIsLoading((p) => ({ ...p, articles: true }));
    try {
      const data = await apiCall("get", "/articles", null, "articles");
      const arr = Array.isArray(data.articles) ? data.articles : [];
      setArticles(arr);
      const views = arr.reduce((acc, a) => acc + (a.views || 0), 0);
      setStats({
        total: arr.length,
        featured: arr.filter((a) => a.featured).length,
        categories: arr.reduce((acc, a) => {
          const c = a.category || "General";
          acc[c] = (acc[c] || 0) + 1;
          return acc;
        }, {}),
        views,
        totalViews: views,
      });
    } finally {
      setIsLoading((p) => ({ ...p, articles: false }));
    }
  }, [apiCall]);

  const fetchUsers = useCallback(async () => {
    setIsLoading((p) => ({ ...p, users: true }));
    try {
      const data = await apiCall("get", "/users", null, "users");
      setUsers(Array.isArray(data.users) ? data.users : []);
    } finally {
      setIsLoading((p) => ({ ...p, users: false }));
    }
  }, [apiCall]);

  const fetchSettings = useCallback(async () => {
    setIsLoading((p) => ({ ...p, settings: true }));
    try {
      const data = await apiCall("get", "/settings", null, "settings");
      setSettings(
        data || { siteTitle: "", defaultCategory: "General", theme: "light" },
      );
    } finally {
      setIsLoading((p) => ({ ...p, settings: false }));
    }
  }, [apiCall]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (menuOpen === "dashboard" || menuOpen === "articles") fetchArticles();
    if (menuOpen === "users") fetchUsers();
    if (menuOpen === "settings") fetchSettings();
  }, [menuOpen, token, fetchArticles, fetchUsers, fetchSettings]);

  useEffect(() => {
    socket.on("viewsUpdated", () =>
      setStats((prev) => ({ ...prev, totalViews: prev.totalViews + 1 })),
    );
    return () => socket.off("viewsUpdated");
  }, []);

  // ─── Article submit: convert tokens → HTML before saving ──────────────────
  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...articleForm,
        // Pass imageLabels to ensure final HTML uses assigned captions
        content: tokensToHtml(articleForm.content, articleForm.imageLabels),
      };
      if (editingArticle) {
        await apiCall(
          "put",
          `/articles/${editingArticle}`,
          payload,
          "articles",
        );
        alert("Story updated successfully!");
      } else {
        await apiCall("post", "/articles", payload, "articles");
        alert("Story published successfully!");
      }
      await fetchArticles();
      setArticleForm(emptyForm);
      setEditingArticle(null);
    } catch (err) {
      alert("Failed to save story. Check console for details.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Article edit: convert HTML → tokens on load, recover labels ──────────
  const handleArticleEdit = async (article) => {
    try {
      const data = await apiCall(
        "get",
        `/articles/${article.id}`,
        null,
        "articles",
      );
      const full = data.article || data;
      const rawContent = full.content || "";

      // Convert any existing <figure> HTML back to clean tokens
      const tokenContent = htmlToTokens(rawContent);

      // Re-extract labels from the tokens so the delegates panel is in sync
      const extractedLabels = {};
      const tokenRe = /\[IMG:([^\]|]*)\|([^\]]*)\]/g;
      let m;
      while ((m = tokenRe.exec(tokenContent)) !== null) {
        extractedLabels[m[1]] = m[2];
      }

      // Merge: extracted from content wins, then persisted imageLabels as fallback
      const persistedLabels = normalizeImageLabels(full.imageLabels);
      const mergedLabels = { ...persistedLabels, ...extractedLabels };

      setArticleForm({
        title: full.title || "",
        content: tokenContent,
        author: full.author || "",
        category: full.category || "General",
        featured: !!full.featured,
        images: full.images || (full.image ? [full.image] : []),
        sourceUrl: full.sourceUrl || "",
        videoUrl: full.videoUrl || "",
        imageLabels: mergedLabels,
      });
      setEditingArticle(full.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      alert("Failed to load article");
    }
  };

  const handleReorderSave = async () => {
    setIsSubmitting(true);
    try {
      const orders = articles.map((a, i) => ({ id: a.id, order: i }));
      await apiCall("post", "/articles/reorder", { orders }, "articles");
      setIsOrderChanged(false);
      alert("Article sequence updated!");
    } catch {
      alert("Reorder failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMultiImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsSubmitting(true);
    try {
      const newImages = await Promise.all(
        files.map(async (file) => {
          const compressed = await imageCompression(file, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1200,
          });
          const formData = new FormData();
          formData.append("file", compressed, file.name);
          const response = await API.post("/upload", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
          return response.data.url;
        }),
      );
      setArticleForm((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    } catch {
      alert("Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Insert token (not raw HTML) at cursor position ───────────────────────
  const insertImageAtCursor = (imgUrl) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    // Use the label the admin has typed in the sidebar
    setArticleForm((prev) => {
      const label = prev.imageLabels[imgUrl] || "Image caption";
      const start = textarea.selectionStart;
      const text = prev.content;
      const token = `\n[IMG:${imgUrl}|${label}]\n`;

      const newContent =
        text.substring(0, start) + token + text.substring(start);

      setTimeout(() => {
        textarea.focus();
        const newPos = start + token.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);

      return { ...prev, content: newContent };
    });
  };

  // ─── User handlers ─────────────────────────────────────────────────────────
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await apiCall("put", `/users/${editingUser}`, userForm, "users");
      } else {
        await apiCall("post", "/users", userForm, "users");
      }
      await fetchUsers();
      setShowUserModal(false);
      setUserForm({ name: "", email: "", password: "", role: "Client" });
      setEditingUser(null);
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserEdit = (user) => {
    setEditingUser(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
    setShowUserModal(true);
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await apiCall("delete", `/users/${id}`, null, "users");
      await fetchUsers();
    } catch {
      alert("Delete failed");
    }
  };

  const toggleSuspension = async (user) => {
    try {
      await apiCall(
        "put",
        `/users/${user.id}/suspend`,
        { suspended: !user.suspended },
        "users",
      );
      await fetchUsers();
    } catch {
      alert("Status update failed");
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "articles", label: "Articles", icon: FileText },
    { id: "users", label: "Users", icon: UsersIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const getCategoryData = useMemo(() => {
    const data = articles.reduce((acc, art) => {
      const cat = art.category || "General";
      acc[cat] = (acc[cat] || 0) + (art.views || 0);
      return acc;
    }, {});
    return Object.keys(data)
      .map((name) => ({ name, views: data[name] }))
      .sort((a, b) => b.views - a.views);
  }, [articles]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-taa-surface dark:bg-taa-dark flex transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0f172a] border-r border-taa-primary/10 dark:border-white/10 z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] md:translate-x-0 md:static md:w-80 md:flex-shrink-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-8 overflow-y-auto">
          <div className="mb-12 flex items-center justify-between">
            <span className="text-3xl font-black text-taa-primary tracking-tighter">
              ADMIN
            </span>
            <button
              className="md:hidden p-2 text-gray-500 hover:text-taa-primary transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 space-y-3">
            <Link
              to="/"
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-taa-primary/5 dark:hover:bg-white/5 transition-all mb-6 border-b border-taa-primary/10 pb-6"
            >
              <Home size={20} className="text-taa-primary" />
              <span>Back to Site</span>
            </Link>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setMenuOpen(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  menuOpen === item.id
                    ? "bg-taa-primary text-white shadow-lg shadow-taa-primary/30 scale-[1.02]"
                    : "text-gray-500 dark:text-gray-400 hover:bg-taa-primary/5 dark:hover:bg-white/5 hover:text-taa-primary dark:hover:text-taa-accent"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-8 border-t border-taa-primary/10">
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-500/5 transition-all"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 h-screen overflow-y-auto relative bg-taa-surface dark:bg-taa-dark transition-colors duration-300">
        <header className="sticky top-0 z-30 bg-taa-surface/80 dark:bg-taa-dark/80 backdrop-blur-xl border-b border-taa-primary/5 px-6 md:px-12 py-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-4xl font-black text-taa-dark dark:text-white capitalize tracking-tight">
            {menuOpen}
          </h1>
          <div className="flex items-center gap-4">
            {menuOpen === "articles" && (
              <button
                onClick={() => setShowReorder(!showReorder)}
                className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 ${
                  showReorder
                    ? "bg-taa-accent text-white"
                    : "bg-taa-primary/10 text-taa-primary"
                }`}
              >
                {showReorder ? <X size={14} /> : <GripVertical size={14} />}
                {showReorder ? "Done Reordering" : "Arrange Order"}
              </button>
            )}
            <div className="hidden sm:flex items-center gap-3 bg-taa-primary/5 px-4 py-2 rounded-xl border border-taa-primary/10">
              <TrendingUp size={16} className="text-taa-primary" />
              <span className="text-xs font-black text-taa-primary uppercase">
                {stats.totalViews} Views
              </span>
            </div>
            <button
              className="md:hidden p-3 rounded-xl bg-taa-primary text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        <div className="p-6 md:p-12 pb-32">
          {menuOpen === "articles" && (
            <div className="space-y-12">
              {/* Reorder Interface */}
              <AnimatePresence>
                {showReorder && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="glass-card p-6 md:p-10 rounded-[2.5rem] border-2 border-taa-accent/20 bg-taa-accent/5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-taa-dark dark:text-white">
                          Arrange Article Order
                        </h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                          Drag handles to change placement on home feed
                        </p>
                      </div>
                      {isOrderChanged && (
                        <button
                          onClick={handleReorderSave}
                          disabled={isSubmitting}
                          className="px-8 py-3 bg-taa-accent text-white rounded-xl font-black text-xs shadow-xl shadow-taa-accent/20 flex items-center gap-2 active:scale-95 transition-all"
                        >
                          <Save size={16} />
                          {isSubmitting ? "Saving..." : "Save Sequence"}
                        </button>
                      )}
                    </div>
                    <Reorder.Group
                      axis="y"
                      values={articles}
                      onReorder={(val) => {
                        setArticles(val);
                        setIsOrderChanged(true);
                      }}
                      className="space-y-3"
                    >
                      {articles.map((art) => (
                        <Reorder.Item
                          key={art.id}
                          value={art}
                          className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-md flex items-center gap-6 border border-taa-primary/5 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="text-gray-300" size={20} />
                          <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-black/20">
                            <img
                              src={
                                (art.images?.[0] || art.image)?.startsWith(
                                  "/uploads/",
                                )
                                  ? `${BACKEND_URL}${art.images?.[0] || art.image}`
                                  : art.images?.[0] || art.image
                              }
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <span className="font-black text-taa-dark dark:text-white truncate">
                            {art.title}
                          </span>
                          <span className="ml-auto text-[10px] font-black text-taa-primary uppercase bg-taa-primary/5 px-3 py-1 rounded-full">
                            {art.category}
                          </span>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Article Form */}
              <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border-taa-primary/5 shadow-2xl">
                <h3 className="text-2xl font-black text-taa-dark dark:text-white mb-8 flex items-center gap-3">
                  <Plus className="text-taa-primary" />
                  {editingArticle ? "Update Story" : "New Story"}
                </h3>

                <form onSubmit={handleArticleSubmit} className="space-y-6">
                  {/* Title + Category */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase ml-2">
                        Headline
                      </label>
                      <input
                        type="text"
                        className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white shadow-inner"
                        value={articleForm.title}
                        onChange={(e) =>
                          setArticleForm({
                            ...articleForm,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase ml-2">
                        Topic
                      </label>
                      <select
                        className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white appearance-none shadow-inner"
                        value={articleForm.category}
                        onChange={(e) =>
                          setArticleForm({
                            ...articleForm,
                            category: e.target.value,
                          })
                        }
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ── Split Write / Preview Editor ── */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-2">
                      <label className="text-xs font-black text-gray-400 uppercase">
                        Body Content
                        <span className="lowercase font-normal opacity-60 ml-1">
                          (click "Place in story" then write around it)
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                          showPreview
                            ? "bg-taa-primary text-white"
                            : "bg-taa-primary/10 text-taa-primary"
                        }`}
                      >
                        <Columns size={12} />
                        {showPreview ? "Hide Preview" : "Show Preview"}
                      </button>
                    </div>

                    <div
                      className={`grid gap-4 ${showPreview ? "md:grid-cols-2" : "grid-cols-1"}`}
                    >
                      {/* Write pane */}
                      <div className="relative">
                        <textarea
                          ref={contentRef}
                          rows={showPreview ? 18 : 12}
                          className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-6 outline-none font-medium text-taa-dark dark:text-white leading-relaxed shadow-inner resize-none font-mono text-sm"
                          value={articleForm.content}
                          onChange={(e) =>
                            setArticleForm({
                              ...articleForm,
                              content: e.target.value,
                            })
                          }
                          // placeholder="Write your article here. Use 'Place in story' to insert images — they appear as [IMG:url|caption] tokens here and as real images in the preview."
                          // required
                        />
                        {/* Token hint badge */}
                        {articleForm.content.includes("[IMG:") && (
                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-taa-primary/10 px-3 py-1 rounded-lg pointer-events-none">
                            <ImageIcon size={10} className="text-taa-primary" />
                            <span className="text-[9px] font-black text-taa-primary uppercase tracking-widest">
                              {
                                (articleForm.content.match(/\[IMG:/g) || [])
                                  .length
                              }{" "}
                              image
                              {(articleForm.content.match(/\[IMG:/g) || [])
                                .length !== 1
                                ? "s"
                                : ""}{" "}
                              placed
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Preview pane */}
                      {showPreview && (
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border-2 border-taa-primary/10 p-6 overflow-y-auto max-h-[500px]">
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-taa-primary/10">
                            <Eye size={12} className="text-taa-primary" />
                            <span className="text-[9px] font-black text-taa-primary uppercase tracking-widest">
                              Live Preview
                            </span>
                          </div>
                          <PreviewRenderer
                            content={articleForm.content}
                            backendUrl={BACKEND_URL}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Story Delegates Hub (media library) ── */}
                  <div className="space-y-6 bg-taa-primary/5 p-8 rounded-[3rem] border border-taa-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-xl font-black text-taa-dark dark:text-white flex items-center gap-3">
                          <Sparkles className="text-taa-primary" size={20} />
                          Story Delegates Hub
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          Name images first, then click "Place in story" to
                          insert at cursor
                        </p>
                      </div>
                      <label className="px-6 py-3 bg-taa-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-taa-primary/20 flex items-center gap-2">
                        <Plus size={14} /> Add New Delegate
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleMultiImageUpload}
                          accept="image/*"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {articleForm.images.map((img, i) => {
                        const imgSrc =
                          img.startsWith("data:") || img.startsWith("http")
                            ? img
                            : `${BACKEND_URL}${img}`;
                        // Check if this image has been placed in content
                        const isPlaced = articleForm.content.includes(
                          `[IMG:${img}|`,
                        );

                        return (
                          <motion.div
                            key={img}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`relative group bg-white dark:bg-black/20 p-4 rounded-[2.5rem] border shadow-xl hover:border-taa-primary/30 transition-all ${
                              isPlaced
                                ? "border-taa-accent/40 bg-taa-accent/5"
                                : "border-taa-primary/10"
                            }`}
                          >
                            <div className="relative aspect-[16/10] rounded-[1.5rem] overflow-hidden mb-4 shadow-inner bg-taa-dark/5">
                              <img
                                src={imgSrc}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                alt={`Delegate ${i}`}
                              />
                              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setArticleForm((p) => ({
                                      ...p,
                                      images: p.images.filter(
                                        (_, idx) => idx !== i,
                                      ),
                                    }))
                                  }
                                  className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => insertImageAtCursor(img)}
                                  className="px-3 py-2 bg-taa-primary text-white rounded-lg text-[10px] font-black shadow-lg hover:scale-110 active:scale-95 transition-all"
                                >
                                  PLACE IN STORY
                                </button>
                              </div>
                              {i === 0 && (
                                <span className="absolute bottom-3 left-3 bg-taa-accent text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                  Primary Cover
                                </span>
                              )}
                              {isPlaced && (
                                <span className="absolute bottom-3 right-3 bg-taa-accent/80 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                                  <CheckCircle2 size={8} /> Placed
                                </span>
                              )}
                            </div>

                            <div className="px-2 space-y-3">
                              <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">
                                  Caption / Identity
                                  <span className="ml-1 text-taa-primary opacity-60 normal-case font-normal">
                                    — set before placing
                                  </span>
                                </label>
                                <div className="relative group/input">
                                  <Type
                                    size={12}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-taa-primary group-focus-within/input:scale-110 transition-transform"
                                  />
                                  <input
                                    type="text"
                                    placeholder="e.g. Minister Jane Doe at the summit"
                                    value={articleForm.imageLabels[img] || ""}
                                    onChange={(e) =>
                                      setArticleForm((p) => ({
                                        ...p,
                                        imageLabels: {
                                          ...p.imageLabels,
                                          [img]: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full pl-9 pr-4 py-2 bg-taa-surface dark:bg-white/5 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-taa-primary transition-all"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex gap-1.5 overflow-hidden">
                                  <span className="w-1.5 h-1.5 rounded-full bg-taa-primary animate-pulse"></span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-taa-accent"></span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-taa-primary/30"></span>
                                </div>
                                <p className="text-[9px] font-black text-taa-primary uppercase tracking-widest opacity-60">
                                  Verified Media Delegate
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}

                      {articleForm.images.length === 0 && (
                        <div className="col-span-full py-20 border-2 border-dashed border-taa-primary/10 rounded-[3rem] flex flex-col items-center justify-center text-center">
                          <ImageIcon
                            size={48}
                            className="text-taa-primary/20 mb-4"
                          />
                          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
                            No Story Delegates Provisioned
                          </p>
                          <p className="text-[10px] text-gray-500 mt-2">
                            Upload images to begin building your visual story.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video, Source, Featured, Submit */}
                  <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-taa-primary/5">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase ml-2">
                        Video & External Reference
                      </label>
                      <input
                        type="text"
                        placeholder="Video URL (YouTube/Vimeo)"
                        className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-xl p-3 outline-none font-bold text-sm text-taa-dark dark:text-white shadow-inner"
                        value={articleForm.videoUrl}
                        onChange={(e) =>
                          setArticleForm((p) => ({
                            ...p,
                            videoUrl: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="text"
                        placeholder="External Source Link"
                        className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-xl p-3 outline-none font-bold text-sm text-taa-dark dark:text-white shadow-inner"
                        value={articleForm.sourceUrl}
                        onChange={(e) =>
                          setArticleForm((p) => ({
                            ...p,
                            sourceUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <label className="flex items-center gap-3 cursor-pointer select-none bg-taa-primary/5 px-6 py-4 rounded-2xl border border-taa-primary/10 w-full md:w-auto">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-lg accent-taa-primary"
                          checked={articleForm.featured}
                          onChange={(e) =>
                            setArticleForm((p) => ({
                              ...p,
                              featured: e.target.checked,
                            }))
                          }
                        />
                        <span className="font-black text-sm text-taa-dark dark:text-white uppercase tracking-widest">
                          Mark as Featured
                        </span>
                      </label>
                      <div className="flex gap-4 mt-6">
                        {editingArticle && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingArticle(null);
                              setArticleForm(emptyForm);
                            }}
                            className="px-8 py-4 font-black text-gray-400 uppercase text-xs tracking-widest"
                          >
                            Discard Changes
                          </button>
                        )}
                        <button
                          disabled={isSubmitting}
                          className="px-10 py-4 bg-taa-primary text-white rounded-2xl font-black shadow-2xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 text-sm uppercase tracking-widest"
                        >
                          {isSubmitting
                            ? "Processing..."
                            : editingArticle
                              ? "Update Story"
                              : "Publish Story"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Article List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="glass-card rounded-3xl overflow-hidden flex flex-col group border-taa-primary/5 shadow-xl hover:shadow-2xl transition-all"
                  >
                    <div className="h-48 relative overflow-hidden bg-taa-dark">
                      <img
                        src={
                          (art.images?.[0] || art.image)?.startsWith(
                            "/uploads/",
                          )
                            ? `${BACKEND_URL}${art.images?.[0] || art.image}`
                            : art.images?.[0] ||
                              art.image ||
                              "https://via.placeholder.com/400x200"
                        }
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 opacity-80"
                        alt={art.title}
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-taa-primary text-white text-[8px] font-black uppercase rounded-lg shadow-lg">
                          {art.category}
                        </span>
                        {art.featured && (
                          <span className="px-3 py-1 bg-taa-accent text-white text-[8px] font-black uppercase rounded-lg shadow-lg">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <button
                          onClick={() => handleArticleEdit(art)}
                          className="p-3 bg-white text-taa-dark rounded-xl shadow-2xl hover:bg-taa-primary hover:text-white transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            API.delete(`/articles/${art.id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            }).then(fetchArticles)
                          }
                          className="p-3 bg-white text-red-500 rounded-xl shadow-2xl hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h4 className="font-black text-taa-dark dark:text-white leading-tight mb-4 group-hover:text-taa-primary transition-colors">
                        {art.title}
                      </h4>
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-taa-primary/5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Order: #{art.order || 0}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-taa-primary bg-taa-primary/5 px-2 py-1 rounded-md">
                            {art.views || 0} VIEWS
                          </span>
                          <a
                            href={`/article/${art.slug || art.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-400 hover:text-taa-primary transition-colors"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dashboard */}
          {menuOpen === "dashboard" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Articles",
                    val: stats.total,
                    icon: FileText,
                    color: "text-blue-500",
                  },
                  {
                    label: "Featured",
                    val: stats.featured,
                    icon: CheckCircle2,
                    color: "text-green-500",
                  },
                  {
                    label: "Categories",
                    val: Object.keys(stats.categories).length,
                    icon: TrendingUp,
                    color: "text-purple-500",
                  },
                  {
                    label: "Views",
                    val: stats.totalViews,
                    icon: Eye,
                    color: "text-taa-primary",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="glass-card p-6 rounded-[2.5rem] border-taa-primary/5 shadow-xl"
                  >
                    <s.icon className={`${s.color} mb-4`} size={24} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">
                      {s.label}
                    </p>
                    <h3 className="text-3xl font-black text-taa-dark dark:text-white tracking-tighter">
                      {s.val}
                    </h3>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 rounded-[3rem] border-taa-primary/5 shadow-2xl h-[400px]">
                  <h3 className="text-xl font-black text-taa-dark dark:text-white mb-8 flex items-center gap-3">
                    <BarChart3 className="text-taa-primary" size={20} />{" "}
                    Audience Reach
                  </h3>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={getCategoryData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fontWeight: "bold" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="views" radius={[6, 6, 0, 0]} barSize={40}>
                        {getCategoryData.map((e, i) => (
                          <Cell
                            key={i}
                            fill={i % 2 === 0 ? "#1E6B2B" : "#77BFA1"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="glass-card p-8 rounded-[3rem] border-taa-primary/5 shadow-2xl h-[400px]">
                  <h3 className="text-xl font-black text-taa-dark dark:text-white mb-8 flex items-center gap-3">
                    <TrendingUp className="text-taa-accent" size={20} /> Growth
                    Trend
                  </h3>
                  <ResponsiveContainer width="100%" height="80%">
                    <AreaChart
                      data={articles
                        .slice(0, 10)
                        .reverse()
                        .map((a) => ({
                          name: a.title.slice(0, 10),
                          views: a.views,
                        }))}
                    >
                      <defs>
                        <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="#77BFA1"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#77BFA1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fontWeight: "bold" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9 }}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="#1E6B2B"
                        strokeWidth={4}
                        fill="url(#colorV)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* Users */}
          {menuOpen === "users" && (
            <motion.div
              key="usr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-taa-primary/5 p-8 rounded-[3rem] border border-taa-primary/10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-taa-primary text-white flex items-center justify-center shadow-xl shadow-taa-primary/20">
                    <UsersIcon size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-taa-dark dark:text-white">
                      Access Portal
                    </h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                      {users.length} Registered Accounts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setUserForm({
                      name: "",
                      email: "",
                      password: "",
                      role: "Client",
                    });
                    setShowUserModal(true);
                  }}
                  className="px-10 py-5 bg-taa-primary text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-2xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest"
                >
                  <UserPlus size={20} /> Add Member
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="glass-card p-8 rounded-[3rem] border-taa-primary/5 flex flex-col group shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-taa-primary/10 text-taa-primary flex items-center justify-center font-black text-xl shadow-inner">
                        {u.name?.[0] || "?"}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${u.role === "Admin" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"}`}
                      >
                        {u.role}
                      </div>
                    </div>
                    <div className="mb-8">
                      <h4 className="font-black text-taa-dark dark:text-white text-xl truncate mb-1">
                        {u.name || "Anonymous User"}
                      </h4>
                      <p className="text-sm text-gray-500 font-bold truncate opacity-60">
                        {u.email}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-4 pt-6 border-t border-taa-primary/5">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUserEdit(u)}
                          className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-taa-primary hover:text-white transition-all shadow-sm"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleUserDelete(u.id)}
                          className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => toggleSuspension(u)}
                        className={`text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-lg transition-all ${u.suspended ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-green-500 hover:bg-green-500/10"}`}
                      >
                        {u.suspended ? "Suspended" : "Active"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Settings */}
          {menuOpen === "settings" && (
            <motion.div
              key="set"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto w-full pb-20 pt-12"
            >
              <div className="glass-card p-10 md:p-16 rounded-[4rem] border-taa-primary/5 shadow-2xl relative overflow-hidden bg-white/50 dark:bg-taa-dark/50 backdrop-blur-3xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-taa-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-16 pb-12 border-b border-taa-primary/10">
                    <div className="w-16 h-16 rounded-3xl bg-taa-primary/10 text-taa-primary flex items-center justify-center shadow-inner">
                      <SettingsIcon size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-taa-dark dark:text-white">
                        Core Engine
                      </h3>
                      <p className="text-xs text-gray-500 font-black uppercase tracking-[0.2em] opacity-60">
                        System Configuration
                      </p>
                    </div>
                  </div>
                  <form
                    className="space-y-12"
                    onSubmit={(e) => {
                      e.preventDefault();
                      apiCall("put", "/settings", settings, "settings").then(
                        () => alert("Settings verified and saved!"),
                      );
                    }}
                  >
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-taa-primary uppercase tracking-[0.3em] ml-2">
                          Platform Identity
                        </label>
                        <input
                          type="text"
                          className="w-full bg-white dark:bg-black/20 border-2 border-transparent focus:border-taa-primary rounded-[2rem] p-6 outline-none font-black text-2xl text-taa-dark dark:text-white shadow-2xl transition-all"
                          value={settings.siteTitle}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              siteTitle: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-taa-primary uppercase tracking-[0.3em] ml-2">
                          Default Focus Feed
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white dark:bg-black/20 border-2 border-transparent focus:border-taa-primary rounded-[2rem] p-6 outline-none font-black text-2xl text-taa-dark dark:text-white appearance-none shadow-2xl transition-all"
                            value={settings.defaultCategory}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                defaultCategory: e.target.value,
                              })
                            }
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-taa-primary">
                            <ChevronRight size={24} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-12 border-t border-taa-primary/10">
                      <button className="w-full py-6 bg-taa-primary text-white rounded-[2.5rem] font-black text-xl shadow-[0_25px_50px_-12px_rgba(30,107,43,0.5)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">
                        Update Environment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* User Modal */}
      <AnimatePresence>
        {showUserModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUserModal(false)}
              className="fixed inset-0 bg-taa-dark/80 backdrop-blur-xl z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md h-fit z-[201] glass-card p-10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-taa-primary/10"
            >
              <h3 className="text-2xl font-black text-taa-dark dark:text-white mb-10 flex items-center gap-4">
                {editingUser ? (
                  <Shield className="text-taa-primary" size={28} />
                ) : (
                  <UserPlus className="text-taa-primary" size={28} />
                )}
                {editingUser ? "Privilege Control" : "Provision Account"}
              </h3>
              <form onSubmit={handleUserSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                    className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                    Email Identity
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white shadow-inner"
                    required
                  />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                      Access Password
                    </label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                      className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white shadow-inner"
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                    System Role
                  </label>
                  <div className="relative">
                    <select
                      value={userForm.role}
                      onChange={(e) =>
                        setUserForm({ ...userForm, role: e.target.value })
                      }
                      className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white appearance-none shadow-inner"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-taa-primary">
                      <ChevronRight size={18} className="rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 pt-8">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 py-5 font-black text-gray-400 uppercase text-xs tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-5 bg-taa-primary text-white rounded-[2rem] font-black shadow-2xl hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
                  >
                    {isSubmitting ? "Provisioning..." : "Commit Access"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
