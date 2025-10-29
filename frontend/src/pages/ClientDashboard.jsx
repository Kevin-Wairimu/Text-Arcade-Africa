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
    "All", "Media Review", "Expert Insights", "Reflections", "Technology",
    "Events", "Digest", "Innovation", "Expert View", "Trends", "General",
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

  const filteredArticles = selectedCategory === "All"
    ? articles
    : articles.filter(a => a.category?.toLowerCase() === selectedCategory.toLowerCase());

  const featuredArticles = filteredArticles.slice(0, 3);
  const recentArticles = filteredArticles.slice(3, 9);

  if (loading || error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#111827] via-[#0b2818] to-[#111827] flex items-center justify-center px-4">
        <div className="text-center">
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-white/20 border-t-[#77BFA1] rounded-full mx-auto mb-4"
              />
              <p className="text-white text-xl font-medium">Loading dashboard...</p>
            </>
          ) : (
            <div className="max-w-md bg-[#111827]/60 backdrop-blur-lg rounded-2xl p-8 border border-[#77BFA1]/20">
              <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#1E6B2B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#77BFA1] transition shadow-md"
                >
                  Retry
                </button>
                <Link
                  to="/login"
                  className="bg-transparent border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition"
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
    <div className="min-h-screen bg-gradient-to-b from-[#111827] via-[#0b2818] to-[#111827] pt-24 md:pt-32 text-gray-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#77BFA1] mb-4">
            Welcome back, {name}! 👋
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Stay ahead with curated news from African perspectives. Explore insights on digital transformation, media innovation, and more.
          </p>
        </motion.section>

        {/* CATEGORY FILTER */}
        <section className="mb-10">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-[#77BFA1] text-black shadow-lg"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </section>

        {/* FEATURED ARTICLES */}
        {featuredArticles.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Featured Stories</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <motion.article
                  key={article._id}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-[#111827]/60 backdrop-blur-lg rounded-2xl overflow-hidden border border-[#1E6B2B]/50 hover:border-[#77BFA1]/60 transition-colors duration-300 shadow-lg"
                >
                  {article.image && <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />}
                  <div className="p-6">
                    <span className="inline-block bg-[#77BFA1]/10 text-[#77BFA1] text-xs px-2 py-1 rounded-full mb-3 font-medium">
                      {article.category || "General"}
                    </span>
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{article.content?.substring(0, 120)}...</p>
                    <Link to={`/article/${article._id}`} className="font-semibold text-[#77BFA1] hover:underline">Read More →</Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>
        )}

        {/* RECENT ARTICLES */}
        {recentArticles.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-3xl font-bold text-white mb-6">Recent Updates</h2>
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <motion.div
                  key={article._id}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  className="flex gap-4 p-4 bg-[#111827]/60 backdrop-blur-lg rounded-2xl border border-[#1E6B2B]/50 hover:border-[#77BFA1]/60 transition-colors duration-300"
                >
                  {article.image && <img src={article.image} alt={article.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />}
                  <div className="flex-1">
                    <span className="bg-[#77BFA1]/10 text-[#77BFA1] text-xs px-2 py-1 rounded-full font-medium mb-2 inline-block">
                      {article.category || "General"}
                    </span>
                    <h3 className="text-base font-semibold text-white mb-1 line-clamp-1">{article.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">{article.content?.substring(0, 100)}...</p>
                    <Link to={`/article/${article._id}`} className="text-[#77BFA1] text-sm font-semibold hover:underline">Read full story →</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* EMPTY STATE */}
        {filteredArticles.length === 0 && (
          <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">No articles found in this category</h2>
            <p className="text-gray-400 mb-6">Try selecting a different one or check back later for new content.</p>
            <Link
              to="/services"
              className="bg-[#1E6B2B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#77BFA1] transition shadow-md"
            >
              Explore Our Services
            </Link>
          </motion.section>
        )}
      </main>
    </div>
  );
}
