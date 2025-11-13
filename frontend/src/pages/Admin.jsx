import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";
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

// --- Animations ---
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

// --- Constants ---
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

// --- Main Component ---
export default function Admin() {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const { user, token, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(localStorage.getItem("adminMenuOpen") || "dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isLoading, setIsLoading] = useState({ articles: true, users: true });
  const [error, setError] = useState({ articles: "", users: "" });

  // --- Auth Guard ---
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

  // --- Fetch Data ---
  useEffect(() => {
    localStorage.setItem("adminMenuOpen", menuOpen);
    if (!token) return;
    if (menuOpen === "dashboard" || menuOpen === "articles") fetchArticles();
    if (menuOpen === "dashboard" || menuOpen === "users") fetchUsers();
  }, [menuOpen, token]);

  useEffect(() => {
    if (!token) return;
    socketRef.current = io(import.meta.env.VITE_API_URL, { auth: { token } });
    socketRef.current.on("viewsUpdated", ({ articleId, views }) => {
      setArticles((prev) =>
        prev.map((a) => (a._id === articleId ? { ...a, views } : a))
      );
    });
    return () => socketRef.current.disconnect();
  }, [token]);

  // --- Utilities ---
  const apiCall = async (method, url, payload, key) => {
    try {
      const res = await API[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError((p) => ({ ...p, [key]: msg }));
      return null;
    }
  };

  const fetchArticles = async () => {
    setIsLoading((p) => ({ ...p, articles: true }));
    try {
      const data = await apiCall("get", "/articles", null, "articles");
      setArticles(Array.isArray(data.articles) ? data.articles : []);
    } finally {
      setIsLoading((p) => ({ ...p, articles: false }));
    }
  };

  const fetchUsers = async () => {
    setIsLoading((p) => ({ ...p, users: true }));
    try {
      const data = await apiCall("get", "/users", null, "users");
      const usersArray = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
        ? data.users
        : [];
      setUsers(usersArray);
    } finally {
      setIsLoading((p) => ({ ...p, users: false }));
    }
  };

  // --- Handlers ---
  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const slug = form.title.toLowerCase().replace(/\s+/g, "-");
    const payload = {
      ...form,
      author: user?.name || "Admin",
      link: form.link || `${window.location.origin}/articles/${slug}`,
    };
    try {
      await apiCall(
        editingArticle ? "put" : "post",
        editingArticle ? `/articles/${editingArticle}` : "/articles",
        payload,
        "articles"
      );
      await fetchArticles();
      setForm(initialFormState);
      setEditingArticle(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    await apiCall("delete", `/articles/${id}`, null, "articles");
    fetchArticles();
  };

  const handleSuspendToggle = async (id, suspended) => {
    await apiCall("patch", `/users/${id}/suspend`, { suspended: !suspended }, "users");
    fetchUsers();
  };

  const handleEdit = (article) => {
    setEditingArticle(article._id);
    setForm(article);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
    });
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(compressed);
  };

  const cancelEdit = () => {
    setEditingArticle(null);
    setForm(initialFormState);
  };

  const handleLogout = () => logout();

  const sidebarItems = ["dashboard", "articles", "users"];

  // --- Derived Dashboard Stats ---
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const activeUsers = users.filter((u) => !u.suspended).length;

  // --- Daily Views Aggregation ---
  const dailyViews = articles
    .filter((a) => Array.isArray(a.viewsByDate))
    .flatMap((a) => a.viewsByDate)
    .reduce((acc, entry) => {
      if (!entry?.date) return acc;
      const day = new Date(entry.date).toISOString().split("T")[0]; // Normalize date
      const existing = acc.find((d) => d.date === day);
      if (existing) existing.views += entry.views || 0;
      else acc.push({ date: day, views: entry.views || 0 });
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // --- Render ---
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#E8F5E9] text-[#2E7D32]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 md:w-64 bg-white border-r border-[#2E7D32]/30 z-50 flex flex-col transform transition-transform duration-300 md:relative ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 border-b border-[#81C784]/30">
          <h1 className="text-2xl font-bold text-center md:text-left text-[#2E7D32]">
            Admin Panel
          </h1>
        </div>
        <nav className="flex-grow px-6 py-4">
          {sidebarItems.map((key) => (
            <button
              key={key}
              onClick={() => {
                setMenuOpen(key);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center gap-3 text-left py-2 px-4 rounded-lg transition-all ${
                menuOpen === key
                  ? "bg-[#2E7D32] text-white font-semibold"
                  : "text-[#2E7D32] hover:bg-[#81C784]/20"
              }`}
            >
              <span className="capitalize">{key}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-[#81C784]/30">
          <button
            onClick={handleLogout}
            className="w-full bg-[#2E7D32] hover:bg-[#81C784] text-white py-2 rounded-lg font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* --- Mobile Header --- */}
        <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm p-4 border-b border-[#2E7D32]/30 flex justify-between items-center z-40">
          <h2 className="text-xl font-bold text-[#2E7D32]">
            {menuOpen.charAt(0).toUpperCase() + menuOpen.slice(1)}
          </h2>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#2E7D32]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>

        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
          ></div>
        )}

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* --- DASHBOARD --- */}
          {menuOpen === "dashboard" && (
            <section>
              <h3 className="text-2xl font-semibold mb-6 text-[#2E7D32]">
                Dashboard Overview
              </h3>

              {isLoading.articles || isLoading.users ? (
                <LoadingSpinner />
              ) : (
                <>
                  {/* --- Quick Stats --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                    <motion.div
                      variants={fadeIn}
                      initial="hidden"
                      animate="visible"
                      className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md"
                    >
                      <h4 className="text-sm text-[#2E7D32]/70">
                        Total Articles
                      </h4>
                      <p className="text-3xl font-bold mt-2 text-[#2E7D32]">
                        {articles.length}
                      </p>
                    </motion.div>

                    <motion.div
                      variants={fadeIn}
                      initial="hidden"
                      animate="visible"
                      className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md"
                    >
                      <h4 className="text-sm text-[#2E7D32]/70">
                        Total Users
                      </h4>
                      <p className="text-3xl font-bold mt-2 text-[#2E7D32]">
                        {users.length}
                      </p>
                    </motion.div>

                    <motion.div
                      variants={fadeIn}
                      initial="hidden"
                      animate="visible"
                      className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md"
                    >
                      <h4 className="text-sm text-[#2E7D32]/70">
                        Active Users
                      </h4>
                      <p className="text-3xl font-bold mt-2 text-green-700">
                        {activeUsers}
                      </p>
                    </motion.div>

                    <motion.div
                      variants={fadeIn}
                      initial="hidden"
                      animate="visible"
                      className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md"
                    >
                      <h4 className="text-sm text-[#2E7D32]/70">
                        Total Views
                      </h4>
                      <p className="text-3xl font-bold mt-2 text-[#2E7D32]">
                        {totalViews}
                      </p>
                    </motion.div>
                  </div>

                  {/* --- Daily Views Chart ---
                  <div className="bg-white p-6 rounded-2xl border border-[#2E7D32]/30 shadow-md">
                    <h4 className="text-lg font-semibold mb-4 text-[#2E7D32]">
                      Daily Views
                    </h4>
                    {dailyViews.length === 0 ? (
                      <p className="text-[#2E7D32]/60 italic">
                        No daily view data yet.
                      </p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={dailyViews}
                          margin={{ top: 5, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fill: "#2E7D32" }} />
                          <YAxis tick={{ fill: "#2E7D32" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#E8F5E9",
                              borderColor: "#2E7D32",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="views"
                            stroke="#2E7D32"
                            strokeWidth={2}
                            dot={{ fill: "#1B5E20" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div> */}
                </>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
