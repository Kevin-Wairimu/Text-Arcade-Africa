import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, NavLink } from "react-router-dom";
import Hero from "../components/Hero";
import API, { BACKEND_URL } from "../utils/api";
import { 
  Search, 
  X, 
  Video, 
  BookOpen, 
  MonitorPlay, 
  Users, 
  Brain, 
  Cpu, 
  Calendar, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  Archive,
  Menu,
  Home as HomeIcon,
  Info,
  Briefcase,
  Phone
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  },
};

function formatRelativeTime(date) {
  if (!date) return "Recent";
  try {
    const published = new Date(date);
    if (isNaN(published.getTime())) return "Recent";
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - published.getTime()) / 1000);
    if (diffSeconds < 60) return "just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return "Recent";
  }
}

const SkeletonCard = memo(() => (
  <div className="glass-card rounded-2xl overflow-hidden animate-pulse flex flex-col h-full min-h-[400px]">
    <div className="h-52 bg-taa-primary/10 dark:bg-white/5" />
    <div className="p-6 flex flex-col space-y-4">
      <div className="h-4 w-1/3 bg-taa-primary/20 dark:bg-white/10 rounded" />
      <div className="h-6 w-full bg-taa-primary/20 dark:bg-white/10 rounded" />
      <div className="h-20 w-full bg-taa-primary/10 dark:bg-white/5 rounded" />
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

const ArticleCard = memo(({ article, index, onReadMore }) => {
  if (!article) return null;
  
  const getCleanImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/600x400?text=No+Image";
    if (url.startsWith('data:')) return url;
    if (url.includes('/uploads/')) {
      const filename = url.split('/uploads/').pop();
      return `${BACKEND_URL}/uploads/${filename}`;
    }
    return url;
  };

  const imageUrl = getCleanImageUrl(article.image || article.images?.[0]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "Admin";
  
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeIn}
      transition={{ delay: (index % 6) * 0.1 }}
      whileHover={{ y: -8 }}
      className="glass-card group flex flex-col overflow-hidden cursor-pointer rounded-2xl transition-all duration-300 h-full shadow-lg border border-taa-primary/5 hover:border-taa-primary/20"
      onClick={() => onReadMore(article.slug || article.id)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={imageUrl}
          alt={article.title || "Article"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 bg-taa-primary text-white text-xs font-bold rounded-full shadow-lg">
            {article.category || "General"}
          </span>
          {article.videoUrl && (
            <span className="w-fit px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full shadow-lg flex items-center gap-1">
              <Video size={10} fill="currentColor" /> VIDEO
            </span>
          )}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="text-xs font-semibold text-taa-primary dark:text-taa-accent/80 mb-2 flex items-center gap-2">
          <span>{formatRelativeTime(article.publishedAt)}</span>
          {isAdmin && article.views > 0 && (
            <>
              <span className="w-1 h-1 bg-current rounded-full" />
              <span>{article.views} views</span>
            </>
          )}
        </div>
        
        <h3 className="font-bold text-xl text-taa-dark dark:text-white group-hover:text-taa-primary dark:group-hover:text-taa-accent transition-colors line-clamp-2 mb-1">
          {article.title || "Untitled Article"}
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
        
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
          {article.content?.replace(/<[^>]*>/g, '').slice(0, 150)}...
        </p>
        
        <div className="flex items-center text-taa-primary dark:text-taa-accent font-bold text-sm">
          <span className="group-hover:mr-2 transition-all">Read Full Article</span>
          <span>→</span>
        </div>
      </div>
    </motion.div>
  );
});
ArticleCard.displayName = "ArticleCard";

const CATEGORY_MAP = {
  All: { label: "All Stories", icon: BookOpen },
  "Media Review": { label: "Media Review", icon: MonitorPlay },
  "Expert Insights": { label: "Expert Insights", icon: Users },
  Reflections: { label: "Reflections", icon: Brain },
  Technology: { label: "Technology", icon: Cpu },
  Events: { label: "Events", icon: Calendar },
  Digest: { label: "Digest", icon: FileText },
  Innovation: { label: "Innovation", icon: Sparkles },
  Trends: { label: "Trends", icon: TrendingUp },
  Reports: { label: "Reports", icon: BarChart3 },
  Archives: { label: "Archives", icon: Archive }
};

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categories = useMemo(() => Object.keys(CATEGORY_MAP), []);

  const navLinks = [
    { name: "Home", to: "/", icon: HomeIcon },
    { name: "About", to: "/about", icon: Info },
    { name: "Services", to: "/services", icon: Briefcase },
    { name: "Team", to: "/team", icon: Users },
    { name: "Contact", to: "/contact", icon: Phone },
  ];

  const fetchArticles = useCallback(
    async (fresh) => {
      if (isFetching && !fresh) return;
      setIsFetching(true);
      fresh ? setIsInitialLoading(true) : setIsLoadingMore(true);
      
      try {
        const params = new URLSearchParams({
          page: fresh ? "1" : page.toString(),
          limit: limit.toString(),
        });
        const apiCat = category === "All" ? "" : category;
        if (category !== "All") params.append("category", apiCat);
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        
        const response = await API.get(`/articles?${params.toString()}`);
        const data = response.data || {};
        const newArticles = data.articles || [];
        
        setArticles((prev) => (fresh ? newArticles : [...prev, ...newArticles]));
        setTotalArticles(data.total || 0);
        if (fresh) setPage(1);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to connect to server. Please check your connection.");
      } finally {
        setIsInitialLoading(false);
        setIsLoadingMore(false);
        setIsFetching(false);
      }
    },
    [category, searchTerm, page, limit, isFetching]
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchArticles(true), 400);
    return () => clearTimeout(timer);
  }, [category, searchTerm]);

  useEffect(() => {
    if (page > 1) fetchArticles(false);
  }, [page]);

  const handleReadMore = useCallback(
    (idOrSlug) => {
      if (idOrSlug) navigate(`/article/${idOrSlug}`);
    },
    [navigate]
  );

  const heroImages = [
    "https://images.unsplash.com/photo-1653566031489-78ae0fa0872c?auto=format&fit=crop&q=80&w=1470",
    "https://plus.unsplash.com/premium_photo-1742404279460-f5ac4d0062a3?auto=format&fit=crop&q=80&w=1470",
    "https://images.unsplash.com/photo-1739302750702-e26a61113758?auto=format&fit=crop&q=80&w=1470",
  ];

  const hasMore = articles.length < totalArticles;

  return (
    <div className="bg-taa-surface dark:bg-taa-dark transition-colors duration-300 min-h-screen">
      <Hero backgroundImages={heroImages} />

      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row min-h-screen">
        {/* Sidebar Mobile Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-taa-dark/80 backdrop-blur-md z-[100] md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0f172a] border-r border-taa-primary/10 dark:border-white/10 z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          md:translate-x-0 md:sticky md:top-20 md:h-[calc(100vh-80px)] md:w-80 md:flex-shrink-0
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
        `}>
          <div className="h-full flex flex-col p-8 overflow-y-auto scrollbar-thin text-taa-dark dark:text-white">
            <div className="mb-10 flex items-center justify-between">
              <span className="text-2xl font-black text-taa-primary tracking-tighter uppercase">Categories</span>
              <button className="md:hidden p-2 text-gray-500 hover:text-taa-primary transition-colors" onClick={() => setIsSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {categories.map((cat) => {
                const Icon = CATEGORY_MAP[cat].icon;
                return (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setIsSidebarOpen(false); window.scrollTo({ top: document.getElementById('articles-view').offsetTop - 100, behavior: 'smooth' }); }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                      category === cat 
                        ? "bg-taa-primary text-white shadow-lg shadow-taa-primary/20 scale-[1.02]" 
                        : "text-gray-500 dark:text-gray-400 hover:bg-taa-primary/5 dark:hover:bg-white/5 hover:text-taa-primary dark:hover:text-taa-accent"
                    }`}
                  >
                    <Icon size={18} />
                    {CATEGORY_MAP[cat].label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-10 pt-8 border-t border-taa-primary/10">
               <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
                © {new Date().getFullYear()} Text Africa Arcade
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main id="articles-view" className="flex-1 p-6 md:p-12 pb-32">
          {/* Mobile Categories Toggle & Search */}
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex items-center justify-between md:hidden">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-3 px-6 py-3 bg-taa-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-taa-primary/20"
              >
                <Menu size={20} /> Categories
              </button>
              <span className="text-xs font-black text-taa-primary uppercase tracking-widest">{category} Feed</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-taa-primary dark:text-taa-accent font-bold uppercase tracking-widest text-sm">Discover</span>
                <h2 className="text-4xl md:text-5xl font-black text-taa-dark dark:text-white mt-2">
                  The Digital Lab
                </h2>
              </motion.div>

              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-taa-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary outline-none transition-all shadow-lg dark:shadow-none dark:border-white/10"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-taa-primary"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {isInitialLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center p-20 glass-card rounded-3xl border-red-500/20">
                <p className="text-red-500 font-bold text-xl mb-4">{error}</p>
                <button onClick={() => fetchArticles(true)} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-32">
                <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">No articles found in this category.</p>
                <button 
                  onClick={() => {setCategory("All"); setSearchTerm("");}} 
                  className="mt-4 text-taa-primary dark:text-taa-accent font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, i) => (
                  <ArticleCard
                    key={article.id || i}
                    article={article}
                    index={i}
                    onReadMore={handleReadMore}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && !isInitialLoading && (
            <div className="text-center mt-20">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoadingMore}
                className="px-10 py-4 bg-taa-primary text-white font-black rounded-2xl hover:brightness-110 hover:shadow-2xl transition-all disabled:opacity-50 active:scale-95"
              >
                {isLoadingMore ? "Loading..." : "Load More Stories"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
