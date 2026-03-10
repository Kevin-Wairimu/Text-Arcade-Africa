import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "framer-motion";
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
  Cell
} from 'recharts';
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
  Search,
  CheckCircle2,
  TrendingUp,
  Eye,
  Home,
  UserPlus,
  Shield,
  ShieldAlert,
  Save,
  ChevronRight,
  BarChart3,
  Video,
  Share2
} from "lucide-react";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

const CATEGORIES = [
  "Media Review", "Expert Insights", "Reflections", "Technology", "Events",
  "Digest", "Innovation", "Trends", "General", "Reports", "Archives",
];

const ROLES = ["Admin", "Employee", "Client"];

export default function Admin() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0, featured: 0, categories: {}, views: 0, totalViews: 0,
  });
  const [settings, setSettings] = useState({
    siteTitle: "", defaultCategory: "General", theme: "light",
  });
  
  // --- Article Form State ---
  const [articleForm, setArticleForm] = useState({
    title: "", content: "", author: "", category: "General",
    featured: false, images: [], sourceUrl: "", videoUrl: "",
  });
  const [editingArticle, setEditingArticle] = useState(null);

  // --- User Form State ---
  const [userForm, setUserForm] = useState({
    name: "", email: "", password: "", role: "Client"
  });
  const [editingUser, setEditingArticleUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const [menuOpen, setMenuOpen] = useState(
    () => localStorage.getItem("adminMenuOpen") || "dashboard"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState({
    articles: true, users: true, settings: true,
  });
  const [error, setError] = useState({ articles: "", users: "", settings: "" });
  const token = localStorage.getItem("token");

  useEffect(() => localStorage.setItem("adminMenuOpen", menuOpen), [menuOpen]);

  const apiCall = useCallback(async (method, url, payload, errorKey) => {
    try {
      const response = await API[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      let msg = err.response?.data?.message || err.message;
      setError((p) => ({ ...p, [errorKey]: msg }));
      if (status === 401) navigate("/login");
      throw err;
    }
  }, [token, navigate]);

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
        totalViews: views
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
      setSettings(data || { siteTitle: "", defaultCategory: "General", theme: "light" });
    } finally {
      setIsLoading((p) => ({ ...p, settings: false }));
    }
  }, [apiCall]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (menuOpen === "dashboard" || menuOpen === "articles") fetchArticles();
    if (menuOpen === "users") fetchUsers();
    if (menuOpen === "settings") fetchSettings();
  }, [menuOpen, token, fetchArticles, fetchUsers, fetchSettings]);

  useEffect(() => {
    const handleViewsUpdated = () => {
      setStats((prev) => ({ ...prev, totalViews: prev.totalViews + 1 }));
    };
    socket.on("viewsUpdated", handleViewsUpdated);
    return () => socket.off("viewsUpdated", handleViewsUpdated);
  }, []);

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingArticle) {
        await apiCall("put", `/articles/${editingArticle}`, articleForm, "articles");
      } else {
        await apiCall("post", "/articles", articleForm, "articles");
      }
      await fetchArticles();
      setArticleForm({ title: "", content: "", author: "", category: "General", featured: false, images: [], sourceUrl: "", videoUrl: "" });
      setEditingArticle(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArticleEdit = async (article) => {
    try {
      const data = await apiCall("get", `/articles/${article._id}`, null, "articles");
      const full = data.article || data;
      setArticleForm({
        title: full.title, 
        content: full.content, 
        author: full.author || "",
        category: full.category, 
        featured: full.featured, 
        images: full.images || (full.image ? [full.image] : []),
        sourceUrl: full.sourceUrl || "",
        videoUrl: full.videoUrl || "",
      });
      setEditingArticle(full._id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { alert("Failed to load article"); }
  };

  const handleShareLink = (article) => {
    const link = `${window.location.origin}/article/${article.slug || article._id}`;
    if (navigator.share) {
      navigator.share({ title: article.title, url: link }).catch(() => {});
    } else {
      navigator.clipboard.writeText(link);
      alert("Link copied to clipboard!");
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await API.post("/upload", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });
      setArticleForm(prev => ({ ...prev, videoUrl: response.data.url }));
    } catch (err) {
      console.error("Video upload failed:", err);
      alert("Video upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMultiImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const newImages = await Promise.all(
        files.map(async (file) => {
          const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1200 });
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(compressed);
          });
        })
      );
      setArticleForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    } catch (err) { alert("Upload failed"); }
  };

  const removeImage = (index) => {
    setArticleForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

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
      setEditingArticleUser(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserEdit = (user) => {
    setUserForm({ name: user.name, email: user.email, password: "", role: user.role });
    setEditingArticleUser(user._id);
    setShowUserModal(true);
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    await apiCall("delete", `/users/${id}`, null, "users");
    await fetchUsers();
  };

  const toggleSuspension = async (user) => {
    await apiCall("put", `/users/${user._id}/suspend`, { suspended: !user.suspended }, "users");
    await fetchUsers();
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
    return Object.keys(data).map(name => ({ name, views: data[name] })).sort((a, b) => b.views - a.views);
  }, [articles]);

  const getRecentPerformance = useMemo(() => {
    return articles.slice(0, 10).reverse().map(art => ({
      name: art.title.substring(0, 15) + "...",
      views: art.views || 0
    }));
  }, [articles]);

  return (
    <div className="min-h-screen bg-taa-surface dark:bg-taa-dark flex transition-colors duration-300 overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-taa-dark/80 backdrop-blur-md z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0f172a] border-r border-taa-primary/10 dark:border-white/10 z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        md:translate-x-0 md:static md:w-80 md:flex-shrink-0
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        <div className="h-full flex flex-col p-8 overflow-y-auto">
          <div className="mb-12 flex items-center justify-between">
            <span className="text-3xl font-black text-taa-primary tracking-tighter">ADMIN</span>
            <button className="md:hidden p-2 text-gray-500 hover:text-taa-primary transition-colors" onClick={() => setIsSidebarOpen(false)}>
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
                onClick={() => { setMenuOpen(item.id); setIsSidebarOpen(false); }}
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
              onClick={() => { localStorage.clear(); navigate("/"); }}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-500/5 transition-all"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative bg-taa-surface dark:bg-taa-dark transition-colors duration-300">
        <header className="sticky top-0 z-30 bg-taa-surface/80 dark:bg-taa-dark/80 backdrop-blur-xl border-b border-taa-primary/5 px-6 md:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-taa-dark dark:text-white capitalize tracking-tight">{menuOpen}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-taa-primary/5 px-4 py-2 rounded-xl border border-taa-primary/10">
              <TrendingUp size={16} className="text-taa-primary" />
              <span className="text-xs font-black text-taa-primary uppercase">{stats.totalViews} Views</span>
            </div>
            <button 
              className="md:hidden p-3 rounded-xl bg-taa-primary text-white shadow-lg shadow-taa-primary/20" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        <div className="p-6 md:p-12 pb-32">
          <AnimatePresence mode="wait">
            {menuOpen === "dashboard" && (
              <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Articles", val: stats.total, icon: FileText, color: "text-blue-500" },
                    { label: "Featured", val: stats.featured, icon: CheckCircle2, color: "text-green-500" },
                    { label: "Categories", val: Object.keys(stats.categories).length, icon: TrendingUp, color: "text-purple-500" },
                    { label: "Views", val: stats.totalViews, icon: Eye, color: "text-taa-primary" },
                  ].map((s, i) => (
                    <div key={i} className="glass-card p-6 rounded-3xl border-taa-primary/5">
                      <s.icon className={`${s.color} mb-4`} size={24} />
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">{s.label}</p>
                      <h3 className="text-3xl font-black text-taa-dark dark:text-white tracking-tighter">{s.val}</h3>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border-taa-primary/5 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                      <BarChart3 className="text-taa-primary" size={20} />
                      <h3 className="text-xl font-black text-taa-dark dark:text-white">Distribution</h3>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getCategoryData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: 'rgba(30, 107, 43, 0.05)' }} />
                          <Bar dataKey="views" fill="#1E6B2B" radius={[6, 6, 0, 0]} barSize={30}>
                            {getCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1E6B2B' : '#77BFA1'} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border-taa-primary/5 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                      <TrendingUp className="text-taa-accent" size={20} />
                      <h3 className="text-xl font-black text-taa-dark dark:text-white">Recent Impact</h3>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getRecentPerformance}>
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#77BFA1" stopOpacity={0.3}/><stop offset="95%" stopColor="#77BFA1" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Area type="monotone" dataKey="views" stroke="#1E6B2B" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {menuOpen === "articles" && (
              <motion.div key="art" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border-taa-primary/5 shadow-2xl">
                  <h3 className="text-2xl font-black text-taa-dark dark:text-white mb-8 flex items-center gap-3">
                    <Plus className="text-taa-primary" /> {editingArticle ? "Update Story" : "New Story"}
                  </h3>
                  <form onSubmit={handleArticleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase ml-2">Headline</label>
                        <input type="text" className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white shadow-inner" value={articleForm.title} onChange={(e) => setArticleForm({...articleForm, title: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase ml-2">Topic</label>
                        <select className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white appearance-none shadow-inner" value={articleForm.category} onChange={(e) => setArticleForm({...articleForm, category: e.target.value})}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase ml-2">Body Content</label>
                      <textarea rows="10" className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-6 outline-none font-medium text-taa-dark dark:text-white leading-relaxed shadow-inner" value={articleForm.content} onChange={(e) => setArticleForm({...articleForm, content: e.target.value})} required />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase ml-2">Media Library</label>
                      <div className="flex flex-wrap gap-4">
                        {articleForm.images.map((img, i) => (
                          <div key={i} className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden group border-2 border-taa-primary/10 shadow-lg">
                            <img src={img} className="w-full h-full object-cover" alt="story" />
                            <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                            {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-taa-primary text-white text-[8px] font-black text-center py-1 uppercase">Cover</span>}
                          </div>
                        ))}
                        <label className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-dashed border-taa-primary/20 flex flex-col items-center justify-center cursor-pointer hover:border-taa-primary hover:bg-taa-primary/5 transition-all shadow-inner">
                          <Plus size={20} className="text-taa-primary mb-1" /><span className="text-[8px] font-black text-taa-primary">UPLOAD</span>
                          <input type="file" multiple className="hidden" onChange={handleMultiImageUpload} accept="image/*" />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase ml-2">Video Attachment</label>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                           <input 
                            type="text" 
                            placeholder="Paste Video URL (YouTube/Vimeo)" 
                            className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-xl p-3 outline-none font-bold text-sm text-taa-dark dark:text-white shadow-inner" 
                            value={articleForm.videoUrl} 
                            onChange={(e) => setArticleForm({...articleForm, videoUrl: e.target.value})} 
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-gray-400 uppercase">OR</span>
                          <label className="px-6 py-3 bg-taa-primary/10 text-taa-primary rounded-xl font-black text-xs cursor-pointer hover:bg-taa-primary hover:text-white transition-all flex items-center gap-2">
                            <Video size={16} /> {articleForm.videoUrl && articleForm.videoUrl.startsWith('/uploads/') ? "REPLACE VIDEO" : "UPLOAD VIDEO"}
                            <input type="file" className="hidden" onChange={handleVideoUpload} accept="video/*" />
                          </label>
                        </div>
                      </div>
                      {articleForm.videoUrl && (
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-black text-taa-primary uppercase tracking-widest">
                          <CheckCircle2 size={12} /> Video Attached: {articleForm.videoUrl.substring(0, 30)}...
                          <button type="button" onClick={() => setArticleForm({...articleForm, videoUrl: ""})} className="text-red-500 ml-2 hover:underline">Remove</button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-taa-primary/5">
                      <label className="flex items-center gap-3 cursor-pointer select-none"><input type="checkbox" className="w-5 h-5 rounded-lg accent-taa-primary" checked={articleForm.featured} onChange={(e) => setArticleForm({...articleForm, featured: e.target.checked})} /><span className="font-bold text-sm text-taa-dark dark:text-white">Feature Story</span></label>
                      <div className="flex-1" />
                      <div className="flex gap-3">
                        {editingArticle && <button type="button" onClick={() => { setEditingArticle(null); setArticleForm({title:"", content:"", author:"", category:"General", featured:false, images:[], sourceUrl:""}); }} className="px-6 py-3 font-bold text-gray-400">Discard</button>}
                        <button disabled={isSubmitting} className="px-8 py-4 bg-taa-primary text-white rounded-2xl font-black shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 text-sm">{isSubmitting ? "Saving..." : editingArticle ? "Update" : "Publish"}</button>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((art, i) => (
                    <div key={art._id || i} className="glass-card rounded-3xl overflow-hidden flex flex-col group border-taa-primary/5 shadow-lg">
                      <div className="h-40 relative overflow-hidden">
                        <img src={art.images?.[0] || art.image || "https://via.placeholder.com/400x200"} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={art.title} />
                        <div className="absolute top-3 left-3"><span className="px-2 py-1 bg-taa-primary text-white text-[8px] font-black uppercase rounded-full">{art.category}</span></div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h4 className="font-bold text-sm text-taa-dark dark:text-white line-clamp-2 mb-4 h-10">{art.title}</h4>
                        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-taa-primary/5">
                          <button onClick={() => handleArticleEdit(art)} className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={14}/></button>
                          <button onClick={() => handleDelete(art._id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                          <button onClick={() => handleShareLink(art)} className="p-2.5 bg-taa-accent/10 text-taa-accent rounded-xl hover:bg-taa-accent hover:text-white transition-all"><Share2 size={14}/></button>
                          <a href={`/article/${art._id}`} target="_blank" rel="noreferrer" className="ml-auto p-2.5 bg-taa-primary/10 text-taa-primary rounded-xl hover:bg-taa-primary hover:text-white transition-all"><ExternalLink size={14}/></a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {menuOpen === "users" && (
              <motion.div key="usr" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-taa-primary/5 p-6 rounded-[2.5rem] border border-taa-primary/10">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="w-12 h-12 rounded-2xl bg-taa-primary text-white flex items-center justify-center shadow-lg"><UsersIcon size={24} /></div>
                    <div><h3 className="text-xl font-black text-taa-dark dark:text-white">Management</h3><p className="text-[10px] text-gray-500 font-bold uppercase">{users.length} Records</p></div>
                  </div>
                  <button onClick={() => { setEditingArticleUser(null); setUserForm({name:"", email:"", password:"", role:"Client"}); setShowUserModal(true); }} className="w-full sm:w-auto px-6 py-3 bg-taa-primary text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                    <UserPlus size={18} /> PROVISION
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map((u) => (
                    <div key={u._id} className="glass-card p-6 rounded-[2.5rem] border-taa-primary/5 flex flex-col group shadow-lg">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-taa-primary/10 text-taa-primary flex items-center justify-center font-black">{u.name?.[0] || "?"}</div>
                        <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${u.role === 'Admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>{u.role}</div>
                      </div>
                      <div className="mb-6"><h4 className="font-black text-taa-dark dark:text-white text-base truncate">{u.name || "Anon"}</h4><p className="text-xs text-gray-500 truncate">{u.email}</p></div>
                      <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-taa-primary/5">
                        <div className="flex gap-2"><button onClick={() => handleUserEdit(u)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-taa-primary hover:text-white transition-all"><Edit3 size={12}/></button><button onClick={() => handleUserDelete(u._id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 transition-all"><Trash2 size={12}/></button></div>
                        <button onClick={() => toggleSuspension(u)} className={`text-[8px] font-black uppercase ${u.suspended ? 'text-red-500' : 'text-green-500 opacity-40 hover:opacity-100'}`}>{u.suspended ? 'Suspended' : 'Live'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {menuOpen === "settings" && (
              <motion.div key="set" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto w-full pb-20">
                <div className="glass-card p-8 md:p-12 rounded-[3rem] border-taa-primary/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-taa-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-12 pb-8 border-b border-taa-primary/5">
                      <div className="w-14 h-14 rounded-2xl bg-taa-primary/10 text-taa-primary flex items-center justify-center shadow-inner"><SettingsIcon size={28} /></div>
                      <div><h3 className="text-2xl font-black text-taa-dark dark:text-white">Platform</h3><p className="text-xs text-gray-500 font-bold uppercase">Engine Config</p></div>
                    </div>
                    <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); apiCall("put", "/settings", settings, "settings"); }}>
                      <div className="grid gap-8">
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 text-[10px] font-black text-taa-primary uppercase tracking-widest ml-2">Site Title</label>
                          <input type="text" className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-5 outline-none font-black text-xl text-taa-dark dark:text-white shadow-inner" value={settings.siteTitle} onChange={(e) => setSettings({...settings, siteTitle: e.target.value})} />
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 text-[10px] font-black text-taa-primary uppercase tracking-widest ml-2">Default Feed</label>
                          <div className="relative group">
                            <select className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-5 outline-none font-black text-xl text-taa-dark dark:text-white appearance-none shadow-inner" value={settings.defaultCategory} onChange={(e) => setSettings({...settings, defaultCategory: e.target.value})}>
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-taa-primary"><Plus size={20} /></div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-8 border-t border-taa-primary/5"><button className="w-full py-5 bg-taa-primary text-white rounded-3xl font-black text-lg shadow-2xl shadow-taa-primary/20 hover:brightness-110 active:scale-95 transition-all">COMMIT CHANGES</button></div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* User Modal (Same high quality) */}
      <AnimatePresence>
        {showUserModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUserModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md h-fit z-[201] glass-card p-8 md:p-10 rounded-[2.5rem] shadow-2xl border-taa-primary/10">
              <h3 className="text-xl font-black text-taa-dark dark:text-white mb-8 flex items-center gap-3">{editingUser ? <Shield className="text-taa-primary"/> : <UserPlus className="text-taa-primary"/>}{editingUser ? "Modify Access" : "New Access"}</h3>
              <form onSubmit={handleUserSubmit} className="space-y-5">
                <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Name</label><input type="text" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-xl p-3.5 outline-none font-bold text-taa-dark dark:text-white" required /></div>
                <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label><input type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-xl p-3.5 outline-none font-bold text-taa-dark dark:text-white" required /></div>
                {!editingUser && <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Password</label><input type="password" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-xl p-3.5 outline-none font-bold text-taa-dark dark:text-white" required /></div>}
                <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Role</label><select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-xl p-3.5 outline-none font-bold text-taa-dark dark:text-white appearance-none">{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-4 font-bold text-gray-400 text-sm">Cancel</button><button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-taa-primary text-white rounded-2xl font-black shadow-xl hover:brightness-110 active:scale-95 transition-all text-sm">{isSubmitting ? "Wait..." : "Save"}</button></div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
