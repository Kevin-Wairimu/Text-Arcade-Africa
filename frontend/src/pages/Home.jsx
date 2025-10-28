import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://your-production-url.com";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

// Format date helper
function formatRelativeTime(date) {
  if (!date) return "Date unavailable";
  const now = new Date();
  const published = new Date(date);
  if (isNaN(published.getTime())) return "Invalid date";

  const diffSeconds = Math.floor((now - published) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day ago`;
  return diffWeeks < 4
    ? `${diffWeeks} week ago`
    : published.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// Article Card
const ArticleCard = React.memo(({ article, index, onReadMore }) => (
  <motion.div
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={fadeIn}
    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
  >
    <img
      src={article.image || "https://via.placeholder.com/400x200?text=No+Image"}
      alt={article.title || "Untitled Article"}
      className="w-full h-48 object-cover rounded-t-2xl"
      loading="lazy"
    />
    <div className="p-5 flex flex-col flex-grow">
      <div className="text-sm text-taa-accent">
        {article.category || "General"} • {formatRelativeTime(article.publishedAt)}
      </div>
      <h3 className="font-semibold text-lg mt-2 text-gray-900 line-clamp-2 flex-grow">
        {article.title || "Untitled Article"}
      </h3>
      <p className="text-gray-600 mt-2 text-sm line-clamp-3">
        {(article.content || "No content available...").slice(0, 120)}...
      </p>
      <button
        onClick={() => onReadMore(article._id)}
        className="mt-4 text-taa-primary hover:text-taa-accent font-medium text-sm self-start"
      >
        Read More
      </button>
    </div>
  </motion.div>
));

// ──────────────────────────────────────────────────────────────
// CATEGORY MAP: UI Label → Exact API/DB Value (Pure JavaScript)
// ──────────────────────────────────────────────────────────────
const CATEGORY_MAP = {
  All: "",
  "Media Review": "Media Review",
  "Expert Insights": "Expert Insights",
  Reflections: "Reflections",
  Technology: "Technology",
  Events: "Events",
  Digests: "Digests",
  Innovation: "Innovation",
  "Expert View": "Expert View",
  Trends: "Trends",
};

const getApiCategory = (label) => CATEGORY_MAP[label] ?? label;

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("All"); // UI label
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // UI Category List (display labels)
  const categories = [
    "All",
    "Media Review",
    "Expert Insights",
    "Reflections",
    "Technology",
    "Events",
    "Digests",
    "Innovation",
    "Expert View",
    "Trends",
  ];

  // Fetch articles with filters
  const fetchArticles = useCallback(
    async (isNewSearch) => {
      setIsLoading(true);
      if (isNewSearch) {
        setArticles([]);
        setPage(1);
      }
      setError("");

      try {
        const params = new URLSearchParams({
          page: isNewSearch ? "1" : page.toString(),
          limit: limit.toString(),
        });

        // Apply category filter
        const apiCategory = getApiCategory(category);
        if (category !== "All" && apiCategory) {
          params.append("category", encodeURIComponent(apiCategory));
        }

        // Apply search term
        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }

        const response = await API.get(`/api/articles?${params.toString()}`);
        const { data } = response;

        if (data && Array.isArray(data.articles)) {
          setArticles((prev) =>
            isNewSearch ? data.articles : [...prev, ...data.articles]
          );
          setTotalArticles(data.total || 0);
        } else {
          setArticles([]);
          setTotalArticles(0);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.code === "ERR_NETWORK") {
          setError(
            `Network Error: Cannot connect to the API. (Is the server at ${API_BASE_URL} running and CORS configured?)`
          );
        } else {
          setError("Failed to load articles. Please try again later.");
        }
        setArticles([]);
        setTotalArticles(0);
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, category, searchTerm]
  );

  // Debounced search & category change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchArticles(true);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [category, searchTerm]);

  // Load more on page change
  useEffect(() => {
    if (page > 1) {
      fetchArticles(false);
    }
  }, [page]);

  // Handlers
  const handleCategoryClick = useCallback((label) => {
    setCategory(label);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setCategory("All");
    setSearchTerm("");
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const handleReadMore = useCallback(
    (id) => {
      navigate(`/article/${id}`);
    },
    [navigate]
  );

  const hasMoreArticles = articles.length < totalArticles;

  return (
    <main className="bg-gradient-to-b from-white via-emerald-50 to-white text-gray-800 pt-20 md:pt-24 min-h-screen">
      <Hero />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center text-taa-dark"
        >
          Latest News & Insights
        </motion.h2>

        {/* Filter & Search Controls */}
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((label) => (
              <button
                key={label}
                onClick={() => handleCategoryClick(label)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                  category === label
                    ? "bg-taa-accent text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-taa-primary hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex w-full max-w-lg items-center gap-2">
            <input
              type="text"
              placeholder="Search by title or keyword..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-taa-accent focus:border-transparent outline-none transition"
            />
            {(category !== "All" || searchTerm) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="mt-12">
          {isLoading && articles.length === 0 ? (
            <p className="text-center text-gray-600">Loading articles...</p>
          ) : error ? (
            <div className="text-center text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg max-w-2xl mx-auto">
              {error}
            </div>
          ) : articles.length === 0 ? (
            <p className="text-center text-gray-600">No articles found matching your criteria.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, i) => (
                <ArticleCard
                  key={article._id || i}
                  article={article}
                  index={i}
                  onReadMore={handleReadMore}
                />
              ))}
            </div>
          )}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          {isLoading && articles.length > 0 && (
            <p className="text-gray-600">Loading more...</p>
          )}
          {hasMoreArticles && !isLoading && (
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-taa-primary text-white font-semibold rounded-lg hover:bg-taa-accent transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      </section>
    </main>
  );
}