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
    "Politics",
    "Business",
    "Technology",
    "Sports",
    "Health",
    "Entertainment",
    "General",
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "Admin" || role === "Employee") {
      navigate("/admin");
      return;
    }
    fetchArticles();
  }, [navigate]);

  async function fetchArticles() {
    try {
      setLoading(true);
      setError(null);

      console.log("🌐 Fetching articles from:", API.defaults.baseURL);

      const { data } = await API.get("/articles");

      // Defensive handling: ensure data.articles exists and is an array
      const articlesArray = Array.isArray(data.articles)
        ? data.articles
        : Array.isArray(data)
        ? data
        : [];

      // Filter out invalid articles (e.g., missing required fields)
      const validArticlesArray = articlesArray.filter(
        (article) =>
          article &&
          typeof article === "object" &&
          article._id &&
          typeof article.title === "string" &&
          typeof article.content === "string" // Ensure content is a string
      );

      console.log("✅ Valid articles fetched:", validArticlesArray.length);

      setArticles(validArticlesArray);
    } catch (err) {
      console.error("❌ Failed to fetch articles:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load articles. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  const validArticles = Array.isArray(articles) ? articles : [];

  const filteredArticles =
    selectedCategory === "All"
      ? validArticles
      : validArticles.filter(
          (article) =>
            article.category?.toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  const featuredArticles = filteredArticles.slice(0, 3);
  const recentArticles = filteredArticles.slice(3, 6);

  // ===============================
  // LOADING STATE
  // ===============================
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[var(--taa-primary)] to-[var(--taa-accent)] flex items-center justify-center px-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl font-medium">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  // ===============================
  // ERROR STATE
  // ===============================
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[var(--taa-primary)] to-[var(--taa-accent)] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-[var(--taa-primary)] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition shadow-md"
            >
              Retry
            </button>
            <Link
              to="/login"
              className="bg-transparent border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition"
            >
              Log In Again
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ===============================
  // MAIN DASHBOARD
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[var(--taa-light)] to-[var(--taa-accent)] pt-20 md:pt-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--taa-dark)] mb-4">
            Welcome back, {name}! 👋
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[var(--taa-dark)]/70 max-w-2xl mx-auto">
            Stay ahead with curated news from African perspectives. Explore
            insights on digital transformation, media innovation, and more.
          </p>
        </motion.section>

        {/* CATEGORY FILTER */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--taa-dark)] mb-4">
            Filter by Category
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-[var(--taa-primary)] text-white shadow-md"
                    : "bg-white/50 text-[var(--taa-dark)]/70 hover:bg-[var(--taa-accent)]/10 hover:text-[var(--taa-primary)] border border-[var(--taa-primary)]/20"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </section>

        {/* FEATURED ARTICLES */}
        {featuredArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 sm:mb-12"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--taa-dark)] mb-4 sm:mb-6">
              Featured Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {featuredArticles.map((article) => (
                <motion.article
                  key={article._id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50"
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                  )}
                  <div className="p-4 sm:p-6">
                    <span className="inline-block bg-[var(--taa-accent)]/20 text-[var(--taa-accent)] text-xs px-2 py-1 rounded-full mb-3 font-medium">
                      {article.category || "General"}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-[var(--taa-dark)] mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-[var(--taa-dark)]/70 text-xs sm:text-sm mb-4 line-clamp-3">
                      {typeof article.content === "string"
                        ? article.content.substring(0, 150)
                        : "No content available"}
                      ...
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--taa-dark)]/50">
                      <span>By {article.author || "Anonymous"}</span>
                      <span>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Link
                      to={`/article/${article._id}`}
                      className="block mt-4 text-[var(--taa-primary)] font-medium hover:underline text-sm"
                    >
                      Read More →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>
        )}

        {/* RECENT ARTICLES */}
        {recentArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--taa-dark)] mb-4 sm:mb-6">
              Recent Updates
            </h2>
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <motion.div
                  key={article._id}
                  whileHover={{ x: 4 }}
                  className="flex gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/50"
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-20 sm:w-24 h-20 sm:h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[var(--taa-accent)]/20 text-[var(--taa-accent)] text-xs px-2 py-1 rounded-full font-medium">
                        {article.category || "General"}
                      </span>
                      <span className="text-xs text-[var(--taa-dark)]/50">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-[var(--taa-dark)] mb-1 line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-[var(--taa-dark)]/70 text-xs sm:text-sm line-clamp-2 mb-2">
                      {typeof article.content === "string"
                        ? article.content.substring(0, 100)
                        : "No content available"}
                      ...
                    </p>
                    <Link
                      to={`/article/${article._id}`}
                      className="text-[var(--taa-primary)] text-xs sm:text-sm font-medium hover:underline"
                    >
                      Read full story →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* EMPTY STATE */}
        {filteredArticles.length === 0 && (
          <motion.section
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-20"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--taa-dark)] mb-4">
              No articles yet
            </h2>
            <p className="text-sm sm:text-base text-[var(--taa-dark)]/70 mb-6">
              Try selecting a different category or check back later.
            </p>
            <Link
              to="/services"
              className="bg-[var(--taa-primary)] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-[var(--taa-dark)] transition shadow-md"
            >
              Explore Services
            </Link>
          </motion.section>
        )}
      </main>
    </div>
  );
}
