import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";
import { io } from "socket.io-client";

// --- Reusable Constants ---
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const categories = [
  "Media Review", "Expert Insights", "Reflections", "Technology",
  "Events", "Digest", "Innovation", "Trends",
  "General", "Reports", "Archives",
];

const initialFormState = {
  title: "", content: "", author: "", category: "General",
  featured: false, image: "", link: "",
};

// --- Helper Components ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[#2E7D32]"></div>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg" role="alert">
    <p className="font-bold">Access Denied</p>
    <p>{message}</p>
  </div>
);


// --- Main Admin Component ---
export default function Admin() {
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // ✅ Get state from the central AuthContext
  const { user, token, logout } = useAuth();

  // --- State Management ---
  const [menuOpen, setMenuOpen] = useState(localStorage.getItem("adminMenuOpen") || "dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({ siteTitle: "", defaultCategory: "General", theme: "light" });
  const [stats, setStats] = useState({ total: 0, featured: 0, categories: {}, totalViews: 0, dailyViews: 0 });
  const [form, setForm] = useState(initialFormState);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isLoading, setIsLoading] = useState({ articles: true, users: true, settings: true });
  const [error, setError] = useState({ articles: "", users: "", settings: "" });

  // --- Effects ---

  // ✅ Reactive guard clause using the context
  useEffect(() => {
    if (!token || user?.role?.toLowerCase() !== 'admin') {
      logout();
    }
  }, [user, token, logout]);

  useEffect(() => {
    localStorage.setItem("adminMenuOpen", menuOpen);
  }, [menuOpen]);

  useEffect(() => {
    if (!token) return;
    const fetchData = () => {
      if (menuOpen === "dashboard" || menuOpen === "articles") fetchArticles();
      if (menuOpen === "users") fetchUsers();
      if (menuOpen === "settings") fetchSettings();
    };
    fetchData();
  }, [menuOpen, token]);

  useEffect(() => {
    if (!token) return;
    socketRef.current = io(import.meta.env.VITE_API_URL, { auth: { token } });
    socketRef.current.on("viewsUpdated", ({ articleId, views, dailyViews }) => {
        setArticles((prev) => prev.map((a) => (a._id === articleId ? { ...a, views, dailyViews } : a)));
        setStats((prev) => ({ ...prev, totalViews: prev.totalViews + 1, dailyViews: prev.dailyViews + 1, }));
    });
    socketRef.current.on("dailyViewsReset", fetchArticles);
    return () => socketRef.current.disconnect();
  }, [token]);

  
  // --- Functions ---
  const generateSlug = (title) => title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "");

  const apiCall = async (method, url, payload, stateKey) => {
    try {
      setError((prev) => ({ ...prev, [stateKey]: "" }));
      const response = await API[method](url, payload, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (err) {
      const msg = err.response?.status === 403 ? "You do not have permission for this action." : `Request failed: ${err.response?.data?.details || err.message}`;
      setError((prev) => ({ ...prev, [stateKey]: msg }));
      if (err.response?.status === 401) logout();
      throw err;
    }
  };

  const fetchArticles = async () => {
    setIsLoading((p) => ({ ...p, articles: true }));
    try {
      const data = await apiCall("get", "/articles", null, "articles");
      const articlesArray = Array.isArray(data.articles) ? data.articles : [];
      setArticles(articlesArray);
      setStats({
        total: articlesArray.length,
        featured: articlesArray.filter((a) => a.featured).length,
        totalViews: articlesArray.reduce((acc, a) => acc + (a.views || 0), 0),
        dailyViews: articlesArray.reduce((acc, a) => acc + (a.dailyViews || 0), 0),
        categories: articlesArray.reduce((acc, a) => {
          acc[a.category || "General"] = (acc[a.category || "General"] || 0) + 1;
          return acc;
        }, {}),
      });
    } finally {
      setIsLoading((p) => ({ ...p, articles: false }));
    }
  };

 const fetchUsers = async () => {
  setIsLoading((p) => ({ ...p, users: true }));
  try {
    const data = await apiCall("get", "/users", null, "users");
    // Handle both { users: [...] } and [...] responses
    const usersArray = Array.isArray(data) ? data : Array.isArray(data.users) ? data.users : [];
    setUsers(usersArray);
    console.log("✅ Users fetched:", usersArray);
  } catch (err) {
    console.error("Error fetching users:", err);
  } finally {
    setIsLoading((p) => ({ ...p, users: false }));
  }
};


  const fetchSettings = async () => {
    setIsLoading((p) => ({ ...p, settings: true }));
    try {
      const data = await apiCall("get", "/settings", null, "settings");
      setSettings(data || { siteTitle: "", defaultCategory: "General", theme: "light" });
    } finally {
      setIsLoading((p) => ({ ...p, settings: false }));
    }
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const slug = generateSlug(form.title);
    const articleLink = form.link || `${window.location.origin}/articles/${slug}`;
    const payload = { ...form, author: user?.name || "Text Africa Arcade", link: articleLink };
    try {
      await apiCall(editingArticle ? "put" : "post", editingArticle ? `/articles/${editingArticle}` : "/articles", payload, "articles");
      await fetchArticles();
      setForm(initialFormState);
      setEditingArticle(null);
    } catch (err) {
      console.error("Failed to submit article:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiCall("put", "/settings", settings, "settings");
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await apiCall("delete", `/articles/${id}`, null, "articles");
      setArticles((prev) => prev.filter((article) => article._id !== id));
    } catch (err) {
      console.error("Failed to delete article:", err);
      fetchArticles();
    }
  };

  const handleSuspendToggle = async (userId, currentlySuspended) => {
  try {
    const res = await API.patch(
      `/users/${userId}/suspend`,
      { suspended: !currentlySuspended },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updatedUser = res.data?.user;
    if (!updatedUser) throw new Error("Invalid response from server");

    // ✅ Option 2: instantly update the local state (no full refetch)
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, suspended: updatedUser.suspended } : u))
    );
  } catch (err) {
    console.error("Suspend toggle failed:", err);
    setError((prev) => ({ ...prev, users: err.message }));
  }
};


  const handleEdit = (article) => {
    setEditingArticle(article._id);
    setForm({ ...initialFormState, ...article });
    setMenuOpen("articles");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingArticle(null);
    setForm(initialFormState);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1600 });
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("Image compression failed:", err);
      alert("Failed to upload image.");
    }
  };

  const handleLogout = () => logout();

  const sidebarItems = [
    { name: "Home", key: "home", isLink: true, path: "/" },
    { name: "Dashboard", key: "dashboard" },
    { name: "Articles", key: "articles" },
    { name: "Users", key: "users" },
    // { name: "Settings", key: "settings" },
  ]

  // --- Render Logic ---
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#E8F5E9] text-[#2E7D32]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 md:w-64 bg-white border-r border-[#2E7D32]/30 z-50 flex flex-col transform transition-transform duration-300 md:relative ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-6 border-b border-[#81C784]/30">
          <h1 className="text-2xl font-bold text-center md:text-left text-[#2E7D32]">Admin Panel</h1>
        </div>
        <nav className="flex-grow px-6 py-4">
          <div className="flex flex-col gap-2">
            {["dashboard", "articles", "users",].map((key) => (
              <button key={key} onClick={() => { setMenuOpen(key); setIsSidebarOpen(false); }} className={`flex items-center gap-3 text-left py-2 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#81C784] ${menuOpen === key ? "bg-[#2E7D32] text-white font-semibold" : "text-[#2E7D32] hover:bg-[#81C784]/20"}`}>
                <span className="capitalize">{key}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className="p-6 border-t border-[#81C784]/30">
          <button onClick={handleLogout} className="w-full bg-[#2E7D32] hover:bg-[#81C784] text-white py-2 rounded-lg font-medium">Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header for mobile */}
        <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm p-4 border-b border-[#2E7D32]/30 flex justify-between items-center z-40">
           <h2 className="text-xl font-bold text-[#2E7D32]">
              {menuOpen.charAt(0).toUpperCase() + menuOpen.slice(1)}
           </h2>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2E7D32]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* Overlay for mobile */}
        {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-40 md:hidden"></div>}

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-8 text-[#2E7D32] hidden md:block">
            {menuOpen.charAt(0).toUpperCase() + menuOpen.slice(1)}
          </motion.h2>

          {/* Dashboard Section */}
          {menuOpen === "dashboard" && (
            isLoading.articles ? <LoadingSpinner /> : error.articles ? <ErrorDisplay message={error.articles} /> :
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[ { label: "Total Articles", value: stats.total }, { label: "Featured", value: stats.featured }, { label: "Categories", value: Object.keys(stats.categories || {}).length }, { label: "Total Views", value: stats.totalViews }, { label: "Daily Views", value: stats.dailyViews }, ].map((stat, i) => (
                <motion.div key={stat.label} variants={fadeIn} initial="hidden" animate="visible" custom={i} className="bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-6 text-center">
                  <h3 className="text-3xl font-bold text-[#2E7D32]">{stat.value}</h3>
                  <p className="text-sm text-[#2E7D32]/70 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </section>
          )}

          {/* Articles Section */}
          {menuOpen === "articles" && (
            <section>
              <form onSubmit={handleArticleSubmit} className="bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-[#2E7D32]">{editingArticle ? "Edit Article" : "Add New Article"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Title" className="border border-[#2E7D32]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#81C784] outline-none" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  <select className="border border-[#2E7D32]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#81C784] outline-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <textarea rows="6" placeholder="Content" className="border border-[#2E7D32]/30 rounded-lg p-2 w-full mt-4 focus:ring-2 focus:ring-[#81C784] outline-none" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
                <input type="url" placeholder="Article Link (optional)" className="border border-[#2E7D32]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#81C784] outline-none w-full mt-4" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />

                <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2E7D32]/30 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#d9ead3]"> Choose Image <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /> </label>
                    {form.image ? <div className="w-24 h-16 rounded-lg overflow-hidden border border-[#2E7D32]/30"><img src={form.image} alt="preview" className="w-full h-full object-cover" /></div> : <div className="w-24 h-16 rounded-lg border-dashed border-[#2E7D32]/30 flex items-center justify-center text-sm text-[#2E7D32]/60 bg-[#E8F5E9]">No image</div>}
                  </div>
                  <label className="flex items-center gap-2 text-[#2E7D32] cursor-pointer select-none"> <input type="checkbox" checked={form.featured || false} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-green-700 w-5 h-5" /> Featured </label>
                  <div className="flex gap-2">
                    {editingArticle && <button type="button" onClick={cancelEdit} className="bg-white hover:bg-[#E8F5E9] border border-[#2E7D32]/30 px-4 py-2 rounded-lg">Cancel</button>}
                    <button type="submit" disabled={isSubmitting} className="bg-[#2E7D32] hover:bg-[#81C784] text-white px-6 py-2 rounded-lg font-medium transition-all disabled:bg-gray-400">{isSubmitting ? "Saving..." : editingArticle ? "Update Article" : "Add Article"}</button>
                  </div>
                </div>
              </form>
              
              {error.articles && <ErrorDisplay message={error.articles} />}
              {isLoading.articles ? <LoadingSpinner /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles.map((article, i) => (
                    <motion.div key={article._id || i} variants={fadeIn} initial="hidden" animate="visible" custom={i} className={`bg-white border rounded-2xl shadow-md p-5 flex flex-col justify-between border-[#2E7D32]/30 ${article.featured ? "border-2 border-green-700" : ""}`}>
                      <div>
                        {article.image ? <img src={article.image} alt={article.title} className="w-full h-40 object-cover rounded-lg mb-3" /> : <div className="w-full h-40 bg-[#E8F5E9] rounded-lg mb-3 flex items-center justify-center text-[#2E7D32]/60">No image</div>}
                        <h4 className="text-xl font-semibold text-[#2E7D32]">{article.title || "Untitled"}</h4>
                        <p className="text-sm text-[#2E7D32]/70 mt-1">{article.category || "General"}</p>
                        <p className="text-sm mt-2 line-clamp-3 text-[#2E7D32]/80">{article.content || "No content available."}</p>
                        {article.link && <a href={article.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-[#77BFA1] hover:text-[#2E7D32]/80 font-semibold">View Full Article</a>}
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <button onClick={() => handleEdit(article)} className="text-sm text-[#2E7D32] hover:text-[#81C784] font-medium">Edit</button>
                        <button onClick={() => handleDelete(article._id)} className="text-sm text-red-600 hover:text-red-700 font-medium">Delete</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          )}


          {/* Users Section */}
{menuOpen === "users" && (
  <section className="bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-6">
    <h3 className="text-xl font-semibold mb-4 text-[#2E7D32]">Registered Users</h3>
    {error.users && <ErrorDisplay message={error.users} />}
    {isLoading.users ? (
      <LoadingSpinner />
    ) : users.length === 0 ? (
      <p className="text-[#2E7D32]/70">No users found.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-collapse border-[#2E7D32]/30">
          <thead className="bg-[#E8F5E9] text-[#2E7D32]">
            <tr className="text-left">
              <th className="p-2 border-b border-[#2E7D32]/30">Name</th>
              <th className="p-2 border-b border-[#2E7D32]/30">Email</th>
              <th className="p-2 border-b border-[#2E7D32]/30">Role</th>
              <th className="p-2 border-b border-[#2E7D32]/30">Status</th>
              <th className="p-2 border-b border-[#2E7D32]/30">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-[#81C784]/10">
                <td className="p-2 border-b border-[#2E7D32]/30">{u.name || "N/A"}</td>
                <td className="p-2 border-b border-[#2E7D32]/30">{u.email}</td>
                <td className="p-2 border-b border-[#2E7D32]/30 capitalize">{u.role}</td>
                <td className="p-2 border-b border-[#2E7D32]/30">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      u.suspended
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {u.suspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="p-2 border-b border-[#2E7D32]/30">
                  <button
                    onClick={() => handleSuspendToggle(u._id, u.suspended)}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      u.suspended
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
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

{/* 
          Settings Section
          {menuOpen === "settings" && (
            <section className="bg-white border border-[#2E7D32]/30 rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-[#2E7D32]">Site Settings</h3>
              {error.settings && <ErrorDisplay message={error.settings} />}
              {isLoading.settings ? <LoadingSpinner /> : (
                <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-4 max-w-lg">
                  <div className="flex flex-col"><label className="mb-1 font-medium">Site Title</label><input type="text" className="border border-[#2E7D32]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#81C784] outline-none" value={settings.siteTitle} onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })} /></div>
                  <div className="flex flex-col"><label className="mb-1 font-medium">Default Category</label><select className="border border-[#2E7D32]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#81C784] outline-none" value={settings.defaultCategory} onChange={(e) => setSettings({ ...settings, defaultCategory: e.target.value })}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                  <button type="submit" disabled={isSubmitting} className="bg-[#2E7D32] hover:bg-[#81C784] text-white py-2 px-6 rounded-lg font-medium self-start disabled:bg-gray-400">{isSubmitting ? "Saving..." : "Save Settings"}</button>
                </form>
              )}
            </section>
          )} */}
        </main>
      </div>
    </div>
  );
}