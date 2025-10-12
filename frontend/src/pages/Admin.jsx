import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Pencil, Trash2, PlusCircle } from "lucide-react";

export default function Admin() {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    author: "",
    category: "General",
    featured: false,
    image: "",
  });
  const [editingArticle, setEditingArticle] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch articles
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await axios.get("/api/articles");
      setArticles(res.data);
    } catch (error) {
      console.error("❌ Error fetching articles:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingArticle) {
        await axios.put(`/api/articles/${editingArticle._id}`, form);
      } else {
        await axios.post("/api/articles", form);
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
    } catch (error) {
      console.error("❌ Error saving article:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await axios.delete(`/api/articles/${id}`);
      fetchArticles();
    } catch (error) {
      console.error("❌ Error deleting article:", error);
    }
  };

  const handleEdit = (article) => {
    setForm(article);
    setEditingArticle(article);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🧭 Admin Dashboard
        </motion.h1>

        {/* ====== ARTICLE FORM ====== */}
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
              className="bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <input
              type="text"
              placeholder="Author"
              className="bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              required
            />
          </div>

          <textarea
            placeholder="Article Content"
            rows="5"
            className="w-full mt-4 bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          ></textarea>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <input
              type="text"
              placeholder="Category"
              className="bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <input
              type="text"
              placeholder="Image URL"
              className="bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />

            <label className="flex items-center gap-2 text-gray-200">
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
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
            >
              {loading ? "Saving..." : editingArticle ? "Update" : "Publish"}
              <PlusCircle size={18} />
            </button>

            {editingArticle && (
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
                  setEditingArticle(null);
                }}
                className="bg-gray-500/70 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.form>

        {/* ====== ARTICLES LIST ====== */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">
          🗂️ Articles ({articles.length})
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <motion.div
              key={article._id}
              className="p-5 backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl hover:shadow-xl transition"
              whileHover={{ scale: 1.02 }}
            >
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="text-lg font-semibold text-white">
                {article.title}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                By {article.author} · {article.category}
              </p>
              <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                {article.content}
              </p>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handleEdit(article)}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-500 transition"
                >
                  <Pencil size={18} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(article._id)}
                  className="flex items-center gap-2 text-red-400 hover:text-red-500 transition"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
