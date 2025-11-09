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
  "Expert View",
  "Trends",
  "General",
];

// --- Main Admin Component ---
export default function Admin() {
  const navigate = useNavigate();

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
    sourceUrl: "", // ✅ Added field
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

  const apiCall = async (method, url, payload, errorKey) => {
    try {
      const response = await API[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      const message = `Failed to ${errorKey}: ${
        err.response?.data?.details || err.message
      }`;
      setError((prev) => ({ ...prev, [errorKey]: message }));
      if (err.response?.status === 401) navigate("/login");
      throw err;
    }
  };

  const fetchArticles = async () => {
    setIsLoading((p) => ({ ...p, articles: true }));
    try {
      const data = await apiCall("get", "/articles", null, "articles");
      const articlesArray = Array.isArray(data.articles) ? data.articles : [];
      setArticles(articlesArray);
      calculateStats(articlesArray);
    } finally {
      setIsLoading((p) => ({ ...p, articles: false }));
    }
  };

  const fetchUsers = async () => {
    setIsLoading((p) => ({ ...p, users: true }));
    try {
      const data = await apiCall("get", "/users", null, "users");
      setUsers(Array.isArray(data.users) ? data.users : []);
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
    } finally {
      setIsLoading((p) => ({ ...p, settings: false }));
    }
  };

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
        sourceUrl: "",
      });
      setEditingArticle(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article permanently?")) return;
    await apiCall("delete", `/articles/${id}`, null, "articles");
    await fetchArticles();
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
    } catch {
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-[#111827] via-[#0b2818] to-[#111827] text-gray-200 overflow-hidden">
      <main className="flex-1 p-6 md:p-10 w-full overflow-y-auto">
        {menuOpen === "articles" && (
          <section>
            <form
              onSubmit={handleSubmit}
              className="bg-[#0b2818]/70 border border-[#77BFA1]/30 rounded-2xl p-6 mb-8"
            >
              <h3 className="text-xl font-semibold mb-4 text-white">
                {editingArticle ? "Edit Article" : "Create New Article"}
              </h3>
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                required
                className="bg-black/20 border border-white/20 rounded-lg p-3 w-full mb-4"
              />
              <input
                type="text"
                placeholder="Source URL (link to full article)"
                value={form.sourceUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sourceUrl: e.target.value }))
                }
                className="bg-black/20 border border-white/20 rounded-lg p-3 w-full mb-4"
              />
              <textarea
                placeholder="Content..."
                rows={6}
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                required
                className="bg-black/20 border border-white/20 rounded-lg p-3 w-full mb-4"
              />
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
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <motion.div
                  key={a._id}
                  className="bg-[#0b2818]/70 border border-[#77BFA1]/30 rounded-2xl overflow-hidden p-4 flex flex-col"
                >
                  <h3 className="font-semibold text-white mb-2">{a.title}</h3>
                  <p className="text-gray-400 text-sm flex-1">{a.category}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setEditingArticle(a._id);
                          setForm({
                            title: a.title || "",
                            content: a.content || "",
                            author: a.author || "",
                            category: a.category || "General",
                            featured: a.featured || false,
                            image: a.image || "",
                            sourceUrl: a.sourceUrl || "",
                          });
                        }}
                        className="text-[#77BFA1] text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="text-red-500 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    {a.sourceUrl && (
                      <a
                        href={a.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#77BFA1] text-sm underline"
                      >
                        View Full
                      </a>
                    )}
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
