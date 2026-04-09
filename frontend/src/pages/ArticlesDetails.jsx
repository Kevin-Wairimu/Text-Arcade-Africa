import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import API, { BACKEND_URL } from "../utils/api";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  PlayCircle,
  Sparkles,
  Image as ImageIcon
} from "lucide-react";

const ArticleLoader = () => (
  <div className="flex flex-col justify-center items-center min-h-[80vh] text-center px-4">
    <div className="w-16 h-16 border-4 border-taa-primary/20 border-t-taa-primary rounded-full animate-spin"></div>
    <p className="mt-6 text-xl text-taa-primary font-bold animate-pulse">Fetching Story...</p>
  </div>
);

export default function ArticleDetails() {
  const { id, slug } = useParams();
  const identifier = id || slug;
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const articleRef = useRef();

  // Scroll Progress Logic
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.pageYOffset;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchArticle = useCallback(async () => {
    if (!identifier) {
      setLoading(false);
      setError("Article not found.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.get(`/articles/${identifier}`);
      const currentArticle = data.article || data;
      setArticle(currentArticle);

      // Fetch related articles (same category)
      const relatedRes = await API.get(`/articles?category=${currentArticle.category}&limit=3`);
      setRelatedArticles(relatedRes.data.articles.filter(a => a.id !== currentArticle.id));
    } catch (err) {
      setError("Failed to load the article. It might have been moved or deleted.");
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchArticle();
  }, [fetchArticle]);

  const readingTime = useMemo(() => {
    if (!article?.content) return 0;
    const wordsPerMinute = 200;
    const words = article.content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }, [article]);

  const getArticleLink = useCallback(() => {
    return article?.link || `${window.location.origin}/article/${article?.slug || article?.id || identifier}`;
  }, [article, identifier]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(getArticleLink()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [getArticleLink]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: getArticleLink(),
      }).catch(() => {});
    } else {
      handleCopy();
    }
  }, [getArticleLink, article, handleCopy]);

  const handleDownloadPDF = async () => {
    if (!articleRef.current) return;
    const btn = document.getElementById('pdf-btn');
    btn.innerText = "Generating...";
    btn.disabled = true;

    try {
      const canvas = await html2canvas(articleRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${article.title.substring(0, 30).replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      alert("PDF generation failed. Please try again.");
    } finally {
      btn.innerText = "Download PDF";
      btn.disabled = false;
    }
  };

  const renderVideo = () => {
    if (!article?.videoUrl) return null;

    // Check if it's a YouTube URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = article.videoUrl.match(youtubeRegex);

    if (youtubeMatch) {
      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-2 shadow-xl">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // Check if it's a Vimeo URL
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
    const vimeoMatch = article.videoUrl.match(vimeoRegex);

    if (vimeoMatch) {
      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-2 shadow-xl">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
            title="Vimeo video player"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // Local or direct video URL
    const videoSrc = article.videoUrl.startsWith('/uploads/') 
      ? `${BACKEND_URL}${article.videoUrl}`
      : article.videoUrl;

    return (
      <div className="relative w-full rounded-2xl overflow-hidden mb-2 shadow-xl bg-black aspect-video">
        <video 
          key={videoSrc}
          controls 
          playsInline
          preload="auto"
          className="w-full h-full object-contain"
          poster={article.image || article.images?.[0]}
          onContextMenu={(e) => e.preventDefault()}
        >
          <source src={videoSrc} type="video/mp4" />
          <source src={videoSrc} type="video/webm" />
          <source src={videoSrc} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  const getCleanImageUrl = useCallback((url) => {
    if (!url) return "";
    if (url.startsWith('data:')) return url;
    if (url.includes('/uploads/')) {
      const filename = url.split('/uploads/').pop();
      return `${BACKEND_URL}/uploads/${filename}`;
    }
    return url;
  }, []);

  const getAbsoluteImageUrl = useCallback(() => {
    const img = article?.image || article?.images?.[0];
    if (!img) return `${window.location.origin}/logo-icon.svg`;
    return getCleanImageUrl(img);
  }, [article, getCleanImageUrl]);

  if (loading) return <ArticleLoader />;
  
  if (error || !article) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center px-6">
        <div className="glass-card p-12 rounded-3xl border-red-500/20">
          <h2 className="text-3xl font-black text-red-500 mb-4">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">{error}</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ChevronLeft size={20} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Derived calculations - safe to perform now that article is guaranteed to exist
  const isVintage = article.slug === "safaricom-sale-forget-spin-doctors-ruto-needs-truth-doctors";
  const coverImage = article.image || article.images?.[0];
  const otherImages = article.images ? article.images.filter(img => img !== coverImage) : [];

  const formattedContent = (article.content || "")
    .replace(/my-12/g, 'my-6') // Fix existing large margins in saved HTML
    .split(/\n\s*\n/) // Split by double newlines
    .map(para => {
      // If it's already a figure or other HTML block, don't wrap in <p>
      if (para.trim().startsWith('<figure') || para.trim().startsWith('<div')) {
        return para;
      }
      return `<p>${para.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('')
    .replace(/src="([^"]*\/uploads\/[^"]*)"/g, (match, p1) => {
      const filename = p1.split('/uploads/').pop();
      return `src="${BACKEND_URL}/uploads/${filename}"`;
    })
    .replace(/<img/g, `<img crossOrigin="anonymous" className="w-full rounded-${isVintage ? 'none' : '3xl'} my-4 shadow-lg border border-taa-primary/5"`);


  const contentParts = (() => {
    // Normalize line breaks to handle different OS formats and ensure we split by paragraphs
    const normalizedContent = formattedContent;
    const pTags = normalizedContent.split('</p>');
    
    if (pTags.length >= 4) {
      const midpoint = Math.floor(pTags.length / 2);
      return [
        pTags.slice(0, midpoint).join('</p>') + '</p>',
        pTags.slice(midpoint).join('</p>')
      ];
    }

    return [normalizedContent, ''];
  })();

  return (
    <main className={`${isVintage ? 'bg-[#fdfbf7]' : 'bg-taa-surface dark:bg-taa-dark'} min-h-screen pb-20 transition-colors duration-300`}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-taa-primary/10">
        <motion.div 
          className={`h-full ${isVintage ? 'bg-black' : 'bg-taa-primary'} shadow-[0_0_10px_#1E6B2B]`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Helmet>
        <title>{article.title} | Text Africa Arcade</title>
        <meta name="description" content={(article.content || "").substring(0, 160)} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={(article.content || "").substring(0, 160)} />
        <meta property="og:image" content={getAbsoluteImageUrl()} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={getAbsoluteImageUrl()} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link 
          to="/" 
          className={`inline-flex items-center gap-2 ${isVintage ? 'text-black font-serif border-b border-black' : 'text-taa-primary dark:text-taa-accent font-bold'} mb-4 hover:-translate-x-2 transition-transform`}
        >
          <ChevronLeft size={20} /> {isVintage ? 'Back to Publications' : 'Back to Hub'}
        </Link>

        <article className={`${isVintage ? 'bg-[#f4ecd8] border-2 border-black/20 shadow-[20px_20px_0px_rgba(0,0,0,0.05)] rounded-none' : 'bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl border border-taa-primary/5'} overflow-hidden`}>
          {/* Header Image */}
          {(article.image || article.images?.[0]) && (
            <div className={`relative ${isVintage ? 'h-[400px] grayscale' : 'h-[250px] md:h-[500px]'} w-full`}>
              <img
                src={getCleanImageUrl(article.image || article.images?.[0])}
                alt={article.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              {!isVintage && <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />}
              {isVintage && <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />}
              <div className="absolute bottom-12 left-8 right-8 md:left-12 md:right-12">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`${isVintage ? 'bg-black text-white px-3 py-1 font-serif italic' : 'px-4 py-1.5 bg-taa-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full'}`}>
                    {article.category || "Insight"}
                  </span>
                  <span className={`${isVintage ? 'text-black/80 font-serif italic' : 'text-white/60 text-[10px] font-black uppercase tracking-widest'}`}>
                    {readingTime} MIN READ
                  </span>
                </div>
                <h1 className={`${isVintage ? 'text-3xl sm:text-4xl md:text-6xl font-serif font-black text-black leading-tight border-l-4 border-black pl-4 sm:pl-6' : 'text-2xl sm:text-3xl md:text-6xl font-black text-white leading-[1.15] drop-shadow-2xl'}`}>
                  {article.title}
                </h1>
                {(() => {
                  const labels = article.imageLabels || {};
                  const mainImg = article.image || article.images?.[0];
                  const label = labels[mainImg] || 
                               Object.entries(labels).find(([key]) => key.includes(mainImg) || mainImg.includes(key))?.[1];
                  
                  return label ? (
                    <p className={`mt-4 text-[10px] font-black uppercase tracking-[0.3em] ${isVintage ? 'text-black/60 font-serif italic' : 'text-white/70'}`}>
                      Delegate Identity: {label}
                    </p>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          <div className={`${isVintage ? 'p-10 md:p-20' : 'p-4 md:p-8'}`}>
            {/* ... rest of title/author section ... */}
            <div className={`flex flex-wrap items-center justify-between gap-8 mb-1 pb-4 border-b ${isVintage ? 'border-black/20' : 'border-taa-primary/10'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 ${isVintage ? 'bg-black rounded-none' : 'rounded-2xl bg-taa-primary'} text-white flex items-center justify-center font-black text-2xl shadow-lg`}>
                  {article.author?.[0] || "T"}
                </div>
                <div>
                  <p className={`font-black ${isVintage ? 'text-black font-serif italic text-xl' : 'text-taa-dark dark:text-white text-lg'}`}>
                    {article.author || "Text Africa Arcade"}
                  </p>
                  <p className={`text-xs ${isVintage ? 'text-black/60 font-serif italic' : 'text-gray-500 font-bold uppercase tracking-widest'}`}>
                    {new Date(article.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })} • {article.views || 0} views
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="pdf-btn"
                  onClick={handleDownloadPDF}
                  className={`p-4 ${isVintage ? 'bg-black/5 text-black hover:bg-black hover:text-white rounded-none border border-black' : 'bg-taa-primary/5 text-taa-primary dark:text-taa-accent rounded-2xl hover:bg-taa-primary hover:text-white border border-taa-primary/10'} transition-all active:scale-95`}
                  title="Download as PDF"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={handleShare}
                  className={`flex items-center gap-2 ${isVintage ? 'bg-black text-white rounded-none px-8 py-4 font-serif italic' : 'bg-taa-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-taa-primary/20'} text-sm hover:brightness-110 active:scale-95 transition-all`}
                >
                  <Share2 size={18} /> SHARE STORY
                </button>
              </div>
            </div>

            {renderVideo()}

            {/* Main Article Content with combined gallery */}
            <div ref={articleRef} className={isVintage ? "font-serif text-black leading-relaxed" : ""}>
              <div 
                className={`${isVintage ? 'prose-xl text-black' : 'prose prose-base max-w-none dark:prose-invert prose-headings:font-black prose-p:leading-relaxed prose-p:mb-8 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-img:my-4 prose-figure:my-6'} whitespace-normal text-justify mb-0 article-content`}
                dangerouslySetInnerHTML={{ __html: contentParts[0] }}
              />

              {contentParts[1] && (
                <div 
                  className={`${isVintage ? 'prose-xl text-black' : 'prose prose-base max-w-none dark:prose-invert prose-headings:font-black prose-p:leading-relaxed prose-p:mb-8 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-img:my-4 prose-figure:my-6'} whitespace-normal text-justify mb-0 article-content`}
                  dangerouslySetInnerHTML={{ __html: contentParts[1] }}
                />
              )}
            </div>

            {article.sourceUrl && (
              <div className={`mb-20 pt-10 border-t ${isVintage ? 'border-black/20' : 'border-taa-primary/5'}`}>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-4 ${isVintage ? 'bg-black rounded-none font-serif italic' : 'bg-taa-dark dark:bg-taa-primary rounded-2xl font-black'} text-white px-10 py-5 hover:brightness-110 shadow-2xl transition-all`}
                >
                  Explore Original Source <ChevronRight size={20} />
                </a>
              </div>
            )}
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="mt-32">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-black text-taa-dark dark:text-white">More from {article.category}</h3>
              <Link to="/" className="text-taa-primary dark:text-taa-accent font-black text-sm uppercase tracking-widest hover:underline">View All</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedArticles.map((rel) => (
                <Link 
                  key={rel.id} 
                  to={`/article/${rel.slug || rel.id}`}
                  className="glass-card group p-6 rounded-[2rem] border border-taa-primary/5 hover:border-taa-primary/20 transition-all"
                >
                  <div className="aspect-video rounded-2xl overflow-hidden mb-6">
                    <img 
                      src={getCleanImageUrl(rel.image || rel.images?.[0])} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt={rel.title} 
                      crossOrigin="anonymous"
                    />
                  </div>
                  <h4 className="font-black text-xl text-taa-dark dark:text-white line-clamp-2 group-hover:text-taa-primary transition-colors">{rel.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
