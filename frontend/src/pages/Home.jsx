import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import axios from "axios";

// ✅ Backend base URL — automatically switches between local, ngrok, and production
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "https://65a0bb6462df.ngrok-free.app" // local dev via ngrok
    : "https://text-arcade-africa.onrender.com"); // production (Render)

// ✅ Axios instance
const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// ✅ Simple fade animation
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.8, ease: "easeOut" },
  }),
};

// ✅ Format time difference
function formatRelativeTime(date) {
  if (!date) return "Date unavailable";
  try {
    const now = new Date();
    const published = new Date(date);
    if (isNaN(published)) return "Date unavailable";

    const diff = now - published;
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hrs = Math.floor(min / 60);
    const days = Math.floor(hrs / 24);

    if (sec < 60) return "just now";
    if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
    const weeks = Math.floor(days / 7);
    return weeks < 4
      ? `${weeks} week${weeks === 1 ? "" : "s"} ago`
      : published.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
  } catch {
    return "Date unavailable";
  }
}

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

  const categories = [
    "All",
    "Politics",
    "Business",
    "Technology",
    "Sports",
    "Health",
    "Entertainment",
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ Fetch articles safely
  const fetchArticles = useCallback(async (currentCategory, currentSearchTerm) => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (currentCategory !== "All") params.append("category", currentCategory);
      if (currentSearchTerm) params.append("search", currentSearchTerm);

      const { data } = await API.get(`/articles?${params.toString()}`);

      console.log("✅ Articles response:", data);

      // Defensive data handling
      if (data && Array.isArray(data.articles)) {
        setArticles(data.articles);
        setTotalArticles(data.total || data.articles.length);
      } else {
        setArticles([]);
        setError("No articles found.");
      }
    } catch (err) {
      console.error("❌ Failed to load articles:", err.message, err.response?.data);
      setError(
        err.response?.data?.message ||
          "Failed to load articles. Please try again later."
      );
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Auto fetch when filters/search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchArticles(category, searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [category, searchTerm, fetchArticles]);

  // ✅ UI Handlers
  const handleCategoryClick = (cat) => setCategory(cat);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearFilters = () => {
    setCategory("All");
    setSearchTerm("");
  };
  const handleLoadMore = () => setPage((p) => p + 1);

  const handleReadMore = (id) => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else navigate(`/article/${id}`);
  };

  // ✅ Prevent crash if articles is undefined/null
  const safeArticles = Array.isArray(articles) ? articles : [];
  const visibleArticles = safeArticles.slice(0, page * limit);

  return (
    <main className="bg-gradient-to-b from-white via-emerald-50 to-white text-gray-800 pt-20 md:pt-24">
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
            : "Filtered Results"}
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
            placeholder="Search all articles..."
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
          {isLoading ? (
            <p className="text-center text-gray-600 col-span-full">Loading articles...</p>
          ) : error ? (
            <p className="text-center text-red-600 col-span-full">{error}</p>
          ) : visibleArticles.length === 0 ? (
            <p className="text-center text-gray-600 col-span-full">
              No matching articles found.
            </p>
          ) : (
            visibleArticles.map((a, i) => (
              <motion.div
                key={a._id || i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-200 overflow-hidden flex flex-col"
              >
                {a.image && (
                  <img
                    src={a.image}
                    alt={a.title || "Article image"}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="text-sm text-taa-accent">
                    {a.category || "General"} • {formatRelativeTime(a.publishedAt)}
                  </div>
                  <h3 className="font-semibold text-lg mt-2 text-gray-900 line-clamp-2 flex-grow">
                    {a.title || "Untitled Article"}
                  </h3>
                  <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                    {(typeof a.content === "string" ? a.content : "")
                      .slice(0, 120)
                      .trim() || "No content available..."}
                  </p>
                  <button
                    onClick={() => handleReadMore(a._id)}
                    className="mt-4 text-taa-primary hover:text-taa-accent font-medium text-sm self-start"
                  >
                    Read More →
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Load More Button */}
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
