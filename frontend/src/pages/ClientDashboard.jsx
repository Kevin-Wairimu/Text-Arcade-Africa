import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const name = localStorage.getItem("userName") || "Valued Client";

  const categories = [
    "All",
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

  useEffect(() => {
    window.scrollTo(0, 0);
    const role = localStorage.getItem("role");
    if (role === "Admin" || role === "Employee") {
      navigate("/admin");
    } else {
      fetchArticles();
    }
  }, [navigate]);

  async function fetchArticles() {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.get("/articles");
      const validArticles = (Array.isArray(data.articles) ? data.articles : []).filter(
        (a) => a && a._id && a.title
      );
      setArticles(validArticles);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load articles.");
    } finally {
      setLoading(false);
    }
  }

  const filteredArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter(
          (a) =>
            a.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  const featuredArticles = filteredArticles.slice(0, 3);
  const recentArticles = filteredArticles.slice(3, 9);

  // --- Loading / Error States ---
  if (loading || error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#2E7D32] via-[#1B5E20] to-[#2E7D32] flex items-center justify-center px-4">
        <div className="text-center">
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-white/30 border-t-[#E8F5E9] rounded-full mx-auto mb-4"
              />
              <p className="text-white text-xl font-medium">
                Loading your dashboard...
              </p>
            </>
          ) : (
            <div className="max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-200 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#81C784] text-[#1B5E20] px-6 py-3 rounded-lg font-semibold hover:bg-[#A5D6A7] transition shadow-md"
                >
                  Retry
                </button>
                <Link
                  to="/login"
                  className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition"
                >
                  Log In Again
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F5E9] via-white to-[#E8F5E9] pt-24 md:pt-32 text-[#2E7D32]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#2E7D32] mb-4 drop-shadow-sm">
            Welcome back, {name}! 👋
          </h1>
          <p className="text-lg text-[#33691E]/80 max-w-3xl mx-auto">
            Stay informed with insights from across Africa. Explore updates on
            digital storytelling, innovation, and transformation.
          </p>
        </motion.section>

        {/* Category Filter */}
        <section className="mb-10">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#2E7D32] text-white shadow-md"
                    : "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-[#1B5E20] mb-6">
              Featured Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <motion.article
                  key={article._id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl overflow-hidden border border-[#A5D6A7] hover:border-[#2E7D32] transition-all shadow-lg"
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <span className="inline-block bg-[#E8F5E9] text-[#2E7D32] text-xs px-2 py-1 rounded-full mb-3 font-medium">
                      {article.category || "General"}
                    </span>
                    <h3 className="text-lg font-semibold text-[#1B5E20] mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.content?.substring(0, 120)}...
                    </p>
                    <Link
                      to={`/article/${article._id}`}
                      className="font-semibold text-[#2E7D32] hover:underline"
                    >
                      Read More →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recent Articles */}
        {recentArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-[#1B5E20] mb-6">
              Recent Updates
            </h2>
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <motion.div
                  key={article._id}
                  whileHover={{ x: 5 }}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-[#A5D6A7] hover:border-[#2E7D32] transition-all"
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs px-2 py-1 rounded-full font-medium mb-2 inline-block">
                      {article.category || "General"}
                    </span>
                    <h3 className="text-base font-semibold text-[#1B5E20] mb-1 line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {article.content?.substring(0, 100)}...
                    </p>
                    <Link
                      to={`/article/${article._id}`}
                      className="text-[#2E7D32] text-sm font-semibold hover:underline"
                    >
                      Read full story →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <h2 className="text-2xl font-bold text-[#1B5E20] mb-4">
              No articles found in this category
            </h2>
            <p className="text-gray-600 mb-6">
              Try selecting another category or check back later for new content.
            </p>
            <Link
              to="/services"
              className="bg-[#2E7D32] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#81C784] transition shadow-md"
            >
              Explore Our Services
            </Link>
          </motion.section>
        )}
      </main>
    </div>
  );
}
