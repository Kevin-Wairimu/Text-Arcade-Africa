import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://your-production-url.com";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

function formatRelativeTime(date) {
  if (!date) return "Date unavailable";
  const published = new Date(date);
  if (isNaN(published.getTime())) return "Invalid date";
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - published.getTime()) / 1000);
  if (diffSeconds < 60) return "just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  return published.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// --- Skeleton Loader ---
const SkeletonCard = memo(() => (
  <div className="bg-[#2E7D32]/10 backdrop-blur-md border border-[#2E7D32]/30 rounded-2xl shadow-md animate-pulse flex flex-col overflow-hidden">
    <div className="h-48 bg-[#2E7D32]/30 rounded-t-2xl" />
    <div className="p-5 flex flex-col flex-grow space-y-3">
      <div className="h-4 w-32 bg-[#2E7D32]/50 rounded" />
      <div className="h-6 w-full bg-[#2E7D32]/50 rounded" />
      <div className="h-4 w-full bg-[#2E7D32]/50 rounded" />
      <div className="h-4 w-3/4 bg-[#2E7D32]/50 rounded" />
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

// --- Article Card ---
const ArticleCard = memo(({ article, index, onReadMore }) => {
  const imageUrl =
    article.image || "https://via.placeholder.com/400x200?text=No+Image";
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeIn}
      className="bg-[#2E7D32]/10 backdrop-blur-md border border-[#2E7D32]/30 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
      onClick={() => onReadMore(article._id)}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onReadMore(article._id)}
    >
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={imageUrl}
          alt={article.title || "Article image"}
          className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-sm font-medium text-[#2E7D32] z-10 relative">
          {article.category || "General"} • {formatRelativeTime(article.publishedAt)}
        </div>
        <h3 className="font-semibold text-lg mt-2 text-[#2E7D32] line-clamp-2 z-10 relative">
          {article.title || "Untitled Article"}
        </h3>
        <p className="mt-2 text-sm text-gray-700 line-clamp-3 z-10 relative">
          {(article.content || "No content available...").slice(0, 120)}...
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadMore(article._id);
          }}
          className="mt-4 text-[#2E7D32]/80 hover:text-[#2E7D32] font-medium text-sm self-start transition-colors z-10 relative"
        >
          Read More
        </button>
      </div>
    </motion.div>
  );
});
ArticleCard.displayName = "ArticleCard";

const CATEGORY_MAP = {
  All: "",
  "Media Review": "Media Review",
  "Expert Insights": "Expert Insights",
  Reflections: "Reflections",
  Technology: "Technology",
  Events: "Events",
  Digest: "Digest",
  Innovation: "Innovation",
  Trends: "Trends",
  Reports:"Reports",
  Archives:"Archives"
};
const getApiCategory = (label) => CATEGORY_MAP[label] ?? label;

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;
  const [totalArticles, setTotalArticles] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const categories = useMemo(() => Object.keys(CATEGORY_MAP), []);

  const fetchArticles = useCallback(
    async (fresh) => {
      if (isFetching) return;
      setIsFetching(true);
      fresh ? setIsInitialLoading(true) : setIsLoadingMore(true);
      if (fresh) {
        setArticles([]);
        setPage(1);
      }
      setError("");
      try {
        const params = new URLSearchParams({
          page: fresh ? "1" : page.toString(),
          limit: limit.toString(),
        });
        const apiCat = getApiCategory(category);
        if (category !== "All" && apiCat) params.append("category", apiCat);
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        const { data } = await API.get(`/api/articles?${params.toString()}`);
        setArticles((prev) => (fresh ? data.articles : [...prev, ...data.articles]));
        setTotalArticles(data.total ?? 0);
      } catch {
        setError("Failed to load articles. Please try again later.");
      } finally {
        setIsInitialLoading(false);
        setIsLoadingMore(false);
        setIsFetching(false);
      }
    },
    [category, searchTerm, page, limit, isFetching]
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchArticles(true), 300);
    return () => clearTimeout(timer);
  }, [category, searchTerm]);

  useEffect(() => {
    if (page > 1) fetchArticles(false);
  }, [page]);

  const handleReadMore = useCallback(
    (id) => id && navigate(`/article/${id}`),
    [navigate]
  );

  const hasMore = articles.length < totalArticles;

  const heroImages = [
    "https://images.unsplash.com/photo-1653566031489-78ae0fa0872c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    "https://plus.unsplash.com/premium_photo-1742404279460-f5ac4d0062a3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEyfHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=500",
    "https://images.unsplash.com/photo-1739302750702-e26a61113758?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  ];

  return (
    <main className="bg-white text-[#2E7D32] min-h-screen">
      {/* ✅ Hero section now full-screen, visible, perfectly blended */}
      <Hero backgroundImages={heroImages} />

      <section id="articles" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center text-[#2E7D32]"
        >
          Latest News & Insights
        </motion.h2>

        {/* Categories + Search */}
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((label) => (
              <button
                key={label}
                onClick={() => setCategory(label)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  category === label
                    ? "bg-[#2E7D32] text-white shadow-md"
                    : "bg-[#81C784]/30 text-[#2E7D32] hover:bg-[#2E7D32]/50"
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32] placeholder-[#81C784] focus:ring-2 focus:ring-[#2E7D32] outline-none"
            />
            {(category !== "All" || searchTerm) && (
              <button
                onClick={() => {
                  setCategory("All");
                  setSearchTerm("");
                }}
                className="px-4 py-3 bg-[#81C784] rounded-lg hover:bg-[#2E7D32] text-white text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="mt-12">
          {isInitialLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: limit }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-5 rounded-xl">
              <p>{error}</p>
              <button onClick={() => fetchArticles(true)} className="mt-3 underline">
                Retry
              </button>
            </div>
          ) : articles.length === 0 ? (
            <p className="text-center text-[#2E7D32]">No articles found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, i) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  index={i}
                  onReadMore={handleReadMore}
                />
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          {isLoadingMore && (
            <p className="animate-pulse text-[#2E7D32]">Loading more...</p>
          )}
          {hasMore && !isLoadingMore && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-3 bg-[#2E7D32] text-white font-semibold rounded-lg hover:bg-[#81C784] transition-all"
            >
              Load More
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
