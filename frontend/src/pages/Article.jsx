import React, { useEffect, useState } from "react";
import API from "../utils/api";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const categories = [
  "Politics",
  "Business",
  "Technology",
  "Sports",
  "Health",
  "Entertainment",
  "General",
];

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    author: "",
    category: "General",
    featured: false,
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Fetch all articles
  async function fetchArticles() {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/articles");
      const valid = Array.isArray(data.articles)
        ? data.articles.filter((a) => a && a._id)
        : [];
      setArticles(valid);
    } catch (err) {
      console.error("❌ Error fetching articles:", err);
      setError("Failed to load articles. Check your API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  // Image Upload
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, useWebWorker: true });
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, image: reader.result });
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("❌ Image upload failed:", err);
      alert("Image upload failed. Try again.");
    }
  }

  // Submit / Update
  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/articles/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Article updated successfully!");
      } else {
        await API.post("/articles", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Article published successfully!");
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
      setEditingId(null);
    } catch (err) {
      console.error("❌ Error submitting article:", err);
      setError(err.response?.data?.message || "Failed to save article.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete
  async function handleDelete(id) {
    if (!window.confirm("Delete this article?")) return;
    try {
      await API.delete(`/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchArticles();
      alert("🗑️ Article deleted!");
    } catch (err) {
      console.error("❌ Error deleting:", err);
      alert("Failed to delete article.");
    }
  }

  // Edit
  function handleEdit(article) {
    setForm({
      title: article.title || "",
      content: article.content || "",
      author: article.author || "",
      category: article.category || "General",
      featured: article.featured || false,
      image: article.image || "",
    });
    setEditingId(article._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-white py-10 px-4 sm:px-6 md:px-10">
      <motion.h2
        className="text-3xl font-bold text-center text-emerald-700 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📰 Manage Articles
      </motion.h2>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-2xl shadow-md p-6 sm:p-8 mb-10"
      >
        <h3 className="text-xl font-semibold mb-4 text-emerald-700">
          {editingId ? "✏️ Edit Article" : "🪶 Create New Article"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <textarea
          placeholder="Write article content..."
          rows={6}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
          className="w-full mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base"
        />

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-gray-700 text-sm sm:text-base"
          />
          <label className="flex items-center gap-2 text-gray-600 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured
          </label>
        </div>

        {/* Image Preview */}
        {form.image && (
          <div className="mt-4">
            <img
              src={form.image}
              alt="Preview"
              className="rounded-xl w-full sm:w-72 h-40 object-cover shadow-sm"
            />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : editingId ? "Update Article" : "Publish Article"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm({
                  title: "",
                  content: "",
                  author: "",
                  category: "General",
                  featured: false,
                  image: "",
                });
                setEditingId(null);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </motion.form>

      {/* Articles List */}
      {loading ? (
        <p className="text-center text-gray-600">Loading articles...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.length > 0 ? (
            articles.map((a, i) => (
              <motion.div
                key={a._id}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                custom={i}
                className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                {a.image && (
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 text-base sm:text-lg line-clamp-2">
                    {a.title}
                  </h4>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">
                    {a.category} • {a.views || 0} views
                  </p>
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => handleEdit(a)}
                      className="text-emerald-600 hover:text-emerald-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600">
              No articles available.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
