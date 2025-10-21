
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import axios from "axios";

// ✅ Auto-select backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "https://65a0bb6462df.ngrok-free.app"
    : "https://text-arcade-africa.onrender.com");

// ✅ Axios instance
const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// ✅ Simplified animation config
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

// ✅ Helper to show "x minutes ago"
function formatRelativeTime(date) {
  if (!date) return "Date unavailable";
  const now = new Date();
  const published = new Date(date);
  if (isNaN(published)) return "Date unavailable";

  const diff = now - published;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);
  const weeks = Math.floor(days / 7);

  if (sec < 60) return "just now";
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return weeks < 4
    ? `${weeks} week${weeks === 1 ? "" : "s"} ago`
    : published.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ✅ Memoized Article Card component
const ArticleCard = React.memo(({ article, index, onReadMore }) => {
  const content = typeof article.content === "string" ? article.content : "";
  const title = article.title || "Untitled Article";
  const image = article.image || "https://via.placeholder.com/400x200?text=No+Image";
  const category = article.category || "General";
  const publishedAt = article.publishedAt || new Date().toISOString();

  return (
    <motion.div
      key={article._id || index}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-200 overflow-hidden flex flex-col"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-sm text-taa-accent">
          {category} • {formatRelativeTime(publishedAt)}
        </div>
        <h3 className="font-semibold text-lg mt-2 text-gray-900 line-clamp-2 flex-grow">
          {title}
        </h3>
        <p className="text-gray-600 mt-2 text-sm line-clamp-3">
          {content.slice(0, 120) || "No content available..."}
        </p>
        <button
          onClick={() => onReadMore(article._id)}
          className="mt-4 text-taa-primary hover:text-taa-accent font-medium text-sm self-start"
        >
          Read More →
        </button>
      </div>
    </motion.div>
  );
});

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [totalArticles, setTotalArticles] = useState(0);
  const [error, setError] = useState("");

  const categories = ["All", "Politics", "Business", "Technology", "Sports", "Health", "Entertainment"];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ Fetch articles with pagination
  const fetchArticles = useCallback(async (cat, search, pageNum = 1) => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (cat !== "All") params.append("category", cat);
      if (search) params.append("search", search);
      params.append("page", pageNum);
      params.append("limit", limit);

      const { data } = await API.get(`/articles?${params.toString()}`);
      console.log("✅ Articles fetched:", data);

      if (data && Array.isArray(data.articles)) {
        let filteredArticles = data.articles;
        // ✅ Client-side category filtering
        if (cat !== "All") {
          const categoryLower = cat.toLowerCase();
          filteredArticles = data.articles.filter(
            (article) => article.category?.toLowerCase() === categoryLower
          );
        }
        // ✅ Client-side search filtering
        if (search && cat === "All") {
          const searchLower = search.toLowerCase();
          filteredArticles = filteredArticles.filter(
            (article) =>
              article.title?.toLowerCase().includes(searchLower) ||
              article.category?.toLowerCase().includes(searchLower)
          );
        }
        setArticles((prev) => (pageNum === 1 ? filteredArticles : [...prev, ...filteredArticles]));
        setTotalArticles(data.total || filteredArticles.length);
      } else {
        setArticles([]);
        setError("No articles found.");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Failed to load articles. Please try again later.");
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // ✅ Re-fetch on category/search change
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchArticles(category, searchTerm, 1);
    }, 300); // Reduced debounce time
    return () => clearTimeout(delay);
  }, [category, searchTerm, fetchArticles]);

  // ✅ Fetch more articles on "Load More"
  useEffect(() => {
    if (page > 1) {
      fetchArticles(category, searchTerm, page);
    }
  }, [page, category, searchTerm, fetchArticles]);

  // ✅ UI handlers
  const handleCategoryClick = useCallback((cat) => setCategory(cat), []);
  const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleClearFilters = useCallback(() => {
    setCategory("All");
    setSearchTerm("");
  }, []);
  const handleLoadMore = useCallback(() => setPage((p) => p + 1), []);
  const handleReadMore = useCallback((id) => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else navigate(`/article/${id}`);
  }, [navigate]);

  // ✅ Memoized visible articles
  const visibleArticles = useMemo(() => {
    const safeArticles = Array.isArray(articles) ? articles : [];
    return safeArticles.slice(0, page * limit);
  }, [articles, page, limit]);

  return (
    <main className="bg-gradient-to-b from-white via-emerald-50 to-white text-gray-800 pt-20 md:pt-24 min-h-screen">
      <Hero />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-taa-dark"
        >
          {category === "All" && !searchTerm
            ? "Latest News & Insights"
            : `Results for ${category === "All" ? `"${searchTerm}"` : category}`}
        </motion.h2>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3 sm:px-5 py-1 sm:py-2 rounded-full font-medium text-sm sm:text-base border transition duration-200 ${
                category === cat
                  ? "bg-taa-accent text-white border-taa-accent"
                  : "border-gray-300 text-gray-700 hover:bg-taa-primary hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex justify-center items-center gap-4 mt-6 sm:mt-8">
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:w-2/3 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-taa-accent"
          />
          {(category !== "All" || searchTerm) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
          {isLoading && page === 1 ? (
            <p className="text-center text-gray-600 col-span-full">Loading articles...</p>
          ) : error ? (
            <p className="text-center text-red-600 col-span-full">{error}</p>
          ) : visibleArticles.length === 0 ? (
            <p className="text-center text-gray-600 col-span-full">No matching articles found.</p>
          ) : (
            visibleArticles.map((article, i) => (
              <ArticleCard
                key={article._id || i}
                article={article}
                index={i}
                onReadMore={handleReadMore}
              />
            ))
          )}
        </div>

        {/* Load More */}
        {visibleArticles.length < totalArticles && !isLoading && (
          <div className="text-center mt-10">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-taa-primary text-white rounded-lg hover:bg-taa-accent transition"
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </main>
  );
}