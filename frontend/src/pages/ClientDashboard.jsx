import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API, { BACKEND_URL } from "../utils/api";
import { 
  User, 
  BookOpen, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  ChevronRight,
  Search,
  LayoutGrid,
  List as ListIcon,
  Sparkles
} from "lucide-react";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  const name = localStorage.getItem("userName") || "Valued Client";

  const categories = [
    "All", "Media Review", "Expert Insights", "Reflections", 
    "Technology", "Events", "Digest", "Innovation", "Trends", "General",
  ];

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.get("/articles");
      setArticles(Array.isArray(data.articles) ? data.articles : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your feed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const role = localStorage.getItem("role");
    if (role === "Admin" || role === "Employee") {
      navigate("/admin");
    } else {
      fetchArticles();
    }
  }, [navigate, fetchArticles]);

  const filteredArticles = selectedCategory === "All"
    ? articles
    : articles.filter(a => a.category?.toLowerCase() === selectedCategory.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-taa-surface dark:bg-taa-dark flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-taa-primary/20 border-t-taa-primary rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-black text-taa-primary animate-pulse tracking-tight">PREPARING YOUR FEED...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-taa-surface dark:bg-taa-dark transition-colors duration-300 pb-20">
      {/* Dynamic Header */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-taa-primary opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-taa-primary/10 text-taa-primary rounded-full text-xs font-black uppercase tracking-widest mb-6">
                <Sparkles size={14} /> Personalized Feed
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-taa-dark dark:text-white tracking-tighter leading-tight">
                Welcome back, <span className="text-taa-primary">{name.split(' ')[0]}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-4 max-w-2xl text-lg">
                Your curated selection of digital transformation insights from across the continent.
              </p>
            </div>
            
            <div className="flex bg-white dark:bg-taa-dark/50 p-2 rounded-2xl shadow-xl border border-taa-primary/5">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-taa-primary text-white shadow-lg' : 'text-gray-400 hover:text-taa-primary'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-taa-primary text-white shadow-lg' : 'text-gray-400 hover:text-taa-primary'}`}
              >
                <ListIcon size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6">
        {/* Navigation & Filters */}
        <section className="mb-12 sticky top-24 z-30 py-4 bg-taa-surface/80 dark:bg-taa-dark/80 backdrop-blur-md">
          <div className="flex flex-wrap gap-3 items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-black transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-taa-primary text-white shadow-xl scale-105"
                    : "bg-white dark:bg-white/5 text-taa-dark dark:text-white/70 hover:bg-taa-primary/10 shadow-md"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {error ? (
          <div className="glass-card p-12 rounded-[2.5rem] border-red-500/20 text-center">
            <h2 className="text-2xl font-black text-red-500 mb-4">Something went wrong</h2>
            <p className="text-gray-500 mb-8">{error}</p>
            <button onClick={fetchArticles} className="btn-primary">Try Again</button>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className={viewMode === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
            <AnimatePresence mode="popLayout">
              {filteredArticles.map((article, i) => (
                <motion.div
                  layout
                  key={article._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {viewMode === 'grid' ? (
                    <div className="glass-card group h-full rounded-[2rem] overflow-hidden flex flex-col border-taa-primary/5 hover:border-taa-primary/20 transition-all duration-500 hover:-translate-y-2">
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={(article.image || article.images?.[0])?.startsWith('/uploads/') ? `${BACKEND_URL}${article.image || article.images?.[0]}` : (article.image || article.images?.[0]) || "https://via.placeholder.com/600x400"} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          alt={article.title}
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-taa-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-taa-primary mb-4 uppercase tracking-widest">
                          <Clock size={14} />
                          {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                        </div>
                        <h3 className="text-xl font-black text-taa-dark dark:text-white mb-1 line-clamp-2 leading-tight group-hover:text-taa-primary transition-colors">
                          {article.title}
                        </h3>
                        {(() => {
                          const labels = article.imageLabels || {};
                          const mainImg = article.image || article.images?.[0];
                          const label = labels[mainImg] || 
                                       Object.entries(labels).find(([key]) => key.includes(mainImg) || mainImg.includes(key))?.[1];
                          
                          return label ? (
                            <p className="text-[9px] font-black uppercase tracking-widest text-taa-primary/70 dark:text-taa-accent/70 mb-3">
                              Delegate Identity: {label}
                            </p>
                          ) : null;
                        })()}
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-3 mb-8 flex-1">
                          {article.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                        <Link 
                          to={`/article/${article._id}`}
                          className="inline-flex items-center gap-2 text-taa-primary font-black text-sm group/btn"
                        >
                          EXPLORE STORY 
                          <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card group flex flex-col sm:flex-row rounded-3xl overflow-hidden border-taa-primary/5 hover:border-taa-primary/20 transition-all">
                      <div className="sm:w-64 h-48 sm:h-auto overflow-hidden">
                        <img 
                          src={(article.image || article.images?.[0])?.startsWith('/uploads/') ? `${BACKEND_URL}${article.image || article.images?.[0]}` : (article.image || article.images?.[0]) || "https://via.placeholder.com/400x300"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt={article.title}
                        />
                      </div>
                      <div className="p-8 flex-1 flex flex-col justify-center">
                        <span className="text-[10px] font-black uppercase text-taa-primary mb-2 tracking-widest">{article.category}</span>
                        <h3 className="text-2xl font-black text-taa-dark dark:text-white mb-2 group-hover:text-taa-primary transition-colors">{article.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-2 mb-4">
                          {article.content?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                        </p>
                        <Link to={`/article/${article._id}`} className="font-black text-taa-primary text-sm flex items-center gap-1">
                          READ ARTICLE <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-40">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-taa-primary/5 text-taa-primary mb-8">
              <BookOpen size={40} />
            </div>
            <h2 className="text-3xl font-black text-taa-dark dark:text-white mb-4 tracking-tight">The Feed is Quiet</h2>
            <p className="text-gray-500 font-medium mb-10 max-w-md mx-auto">No articles match your current selection. Explore other categories or check back soon for fresh insights.</p>
            <button 
              onClick={() => setSelectedCategory("All")}
              className="btn-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
