import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import { FiShare2, FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFeatured, setShowFeatured] = useState(false);

  const name = user?.name || "Valued Client";
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const categories = [
    "All",
    "Media Review",
    "Expert Insights",
    "Reflections",
    "Technology",
    "Events",
    "Digest",
    "Innovation",
    "Trends",
    "General",
  ];

  useEffect(() => {
    fetchArticles();
    const interval = setInterval(fetchArticles, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.get("/articles");
      const valid = (data.articles || []).filter((a) => a && a._id && a.title);
      setArticles(valid);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load articles.");
    } finally {
      setLoading(false);
    }
  }

  const featuredArticles = useMemo(
    () => articles.filter((a) => a.featured === true),
    [articles]
  );

  const filtered = useMemo(() => {
    let list =
      selectedCategory === "All"
        ? articles
        : articles.filter(
            (a) =>
              a.category?.toLowerCase() === selectedCategory.toLowerCase()
          );
    if (searchTerm) {
      list = list.filter((a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortBy === "oldest") {
      list = list.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      list = list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return list;
  }, [articles, selectedCategory, searchTerm, sortBy]);

  const recentArticles = useMemo(() => filtered.slice(0, 9), [filtered]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F5E9]">
        <div className="space-y-3 w-full max-w-2xl p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-300 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#E8F5E9] text-center">
        <h2 className="text-2xl text-red-600 mb-3 font-semibold">Error Loading Articles</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={fetchArticles}
          className="bg-[#2E7D32] text-white px-6 py-2 rounded hover:bg-[#1B5E20]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F5E9] via-white to-[#E8F5E9] text-gray-900">
      <Toaster position="bottom-right" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24 md:pt-32">

        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#2E7D32] mb-4">
            {greeting}, {name}! 👋
          </h1>
          <p className="text-lg text-[#33691E]/80 max-w-3xl mx-auto">
            Stay informed with insights from across Africa — explore digital storytelling, innovation, and transformation.
          </p>
        </motion.section>

        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1 rounded-full border text-sm transition ${
                  selectedCategory === cat
                    ? "bg-[#2E7D32] text-white"
                    : "border-[#2E7D32]/40 text-[#2E7D32] hover:bg-[#2E7D32]/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-[#2E7D32]/60" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-3 py-2 border rounded-full focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-full px-3 py-2"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Featured toggle */}
        {featuredArticles.length > 0 && (
          <div className="text-center mb-10">
            <button
              onClick={() => setShowFeatured((prev) => !prev)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#2E7D32] text-white hover:bg-[#1B5E20] transition"
            >
              {showFeatured ? (
                <>
                  Hide Featured Articles <FiChevronUp />
                </>
              ) : (
                <>
                  Show Featured Articles <FiChevronDown />
                </>
              )}
            </button>
          </div>
        )}

        {/* Featured Section */}
        <AnimatePresence>
          {showFeatured && featuredArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Section title="Featured Articles" articles={featuredArticles} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Articles */}
        <Section title="All Articles" articles={recentArticles} />

        {filtered.length === 0 && (
          <div className="text-center text-[#33691E]/70 mt-20">
            <p className="text-xl mb-3">No articles match your filters.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="text-[#2E7D32] font-semibold underline hover:text-[#1B5E20]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function Section({ title, articles }) {
  if (articles.length === 0) return null;
  return (
    <section className="mb-14">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1B5E20] mb-6">{title}</h2>
      <motion.div
        layout
        className="grid gap-6 md:grid-cols-3 sm:grid-cols-2 grid-cols-1"
      >
        <AnimatePresence>
          {articles.map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

function ArticleCard({ article }) {
  const share = async () => {
    const shareData = {
      title: article.title,
      text: "Check out this article!",
      url: window.location.origin + `/articles/${article.slug || article._id}`,
    };
    try {
      await navigator.share(shareData);
    } catch {
      navigator.clipboard.writeText(shareData.url);
      toast.success("Link copied to clipboard!");
    }
  };

  const articleUrl = `/articles/${article.slug || article._id}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden transition"
    >
      <Link to={articleUrl}>
        <div className="h-48 bg-[#E8F5E9]">
          {article.image ? (
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-[#2E7D32]/60">
              No image
            </div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-[#1B5E20] mb-2">{article.title}</h3>
        <p className="text-[#33691E]/80 text-sm line-clamp-3 mb-3">
          {article.excerpt || "Read more to explore the full story."}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#2E7D32] font-medium">
            {article.category || "General"}
          </span>
          <div className="flex gap-2 items-center">
            <Link
              to={articleUrl}
              className="text-[#2E7D32] font-semibold hover:text-[#1B5E20] text-sm"
            >
              Read More
            </Link>
            <button
              onClick={share}
              className="text-[#2E7D32]/70 hover:text-[#1B5E20]"
            >
              <FiShare2 />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
