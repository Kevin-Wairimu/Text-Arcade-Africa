// src/pages/Home.jsx
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../utils/api";
import Hero from "../components/Hero";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

// Skeleton loader
const SkeletonCard = memo(() => (
  <div className="bg-[#2E7D32]/10 border border-[#2E7D32]/30 rounded-2xl shadow-md animate-pulse flex flex-col overflow-hidden">
    <div className="h-48 bg-[#2E7D32]/30" />
    <div className="p-5 space-y-3">
      <div className="h-4 w-32 bg-[#2E7D32]/50 rounded" />
      <div className="h-6 w-full bg-[#2E7D32]/50 rounded" />
      <div className="h-4 w-3/4 bg-[#2E7D32]/50 rounded" />
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

// Article card
const ArticleCard = memo(({ article, index, onReadMore }) => {
  const imageUrl = article.image || "https://via.placeholder.com/400x200?text=No+Image";
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeIn}
      className="bg-[#2E7D32]/10 border border-[#2E7D32]/30 rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col overflow-hidden cursor-pointer"
      onClick={() => onReadMore(article._id)}
      role="article"
      tabIndex={0}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={article.title || "Article image"}
          className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-sm font-medium text-[#2E7D32]">
          {article.category || "General"} • {new Date(article.publishedAt).toLocaleDateString()}
        </div>
        <h3 className="font-semibold text-lg mt-2 text-[#2E7D32] line-clamp-2">{article.title}</h3>
        <p className="mt-2 text-sm text-gray-700 line-clamp-3">
          {(article.content || "").slice(0, 120)}...
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadMore(article._id);
          }}
          className="mt-4 text-[#2E7D32] hover:underline text-sm font-medium"
        >
          Read More →
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
  Reports: "Reports",
  Archives: "Archives",
};

const getApiCategory = (label) => CATEGORY_MAP[label] ?? label;

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const limit = 6;
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const categories = useMemo(() => Object.keys(CATEGORY_MAP), []);

  // Sync filters & pagination to URL
  useEffect(() => {
    const params = {};
    if (category !== "All") params.category = category;
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [category, searchTerm, page]);

  const fetchArticles = useCallback(
    async (fresh = false) => {
      try {
        if (fresh) {
          setIsLoading(true);
          setPage(1);
          setArticles([]);
        } else {
          setIsLoadingMore(true);
        }

        const params = new URLSearchParams({
          page: fresh ? "1" : page.toString(),
          limit: limit.toString(),
        });

        if (category !== "All") params.append("category", getApiCategory(category));
        if (searchTerm.trim()) params.append("search", searchTerm.trim());

        const { data } = await API.get(`/articles?${params.toString()}`);
        setArticles((prev) => (fresh ? data.articles : [...prev, ...data.articles]));
        setTotalArticles(data.total || 0);
      } catch (err) {
        console.error(err);
        setError("Failed to load articles. Please try again.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [category, searchTerm, page]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles(true);
    }, 300);
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
    "https://images.unsplash.com/photo-1653566031489-78ae0fa0872c?auto=format&fit=crop&q=80&w=1170",
    "https://plus.unsplash.com/premium_photo-1742404279460-f5ac4d0062a3?auto=format&fit=crop&q=60&w=500",
    "https://images.unsplash.com/photo-1739302750702-e26a61113758?auto=format&fit=crop&q=80&w=1170",
  ];

  return (
    <main className="bg-white text-[#2E7D32] min-h-screen">
      <Hero backgroundImages={heroImages} />

      <section id="articles" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          className="text-3xl md:text-4xl font-bold text-center text-[#2E7D32]"
        >
          Latest News & Insights
        </motion.h2>

        {/* Filters */}
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((label) => (
              <button
                key={label}
                onClick={() => {
                  setCategory(label);
                  setPage(1);
                }}
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full p-3 rounded-lg border border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32] placeholder-[#81C784] focus:ring-2 focus:ring-[#2E7D32] outline-none"
            />
            {(category !== "All" || searchTerm) && (
              <button
                onClick={() => {
                  setCategory("All");
                  setSearchTerm("");
                  setPage(1);
                }}
                className="px-4 py-3 bg-[#81C784] rounded-lg hover:bg-[#2E7D32] text-white text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Articles */}
        <div className="mt-12">
          {isLoading ? (
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

        <div className="text-center mt-12">
          {isLoadingMore && <p className="animate-pulse text-[#2E7D32]">Loading more...</p>}
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
