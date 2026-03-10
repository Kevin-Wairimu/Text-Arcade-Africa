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
      setRelatedArticles(relatedRes.data.articles.filter(a => a._id !== currentArticle._id));
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
    return article?.link || `${window.location.origin}/article/${article?.slug || article?._id || identifier}`;
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
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden mb-12 shadow-2xl">
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
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden mb-12 shadow-2xl">
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
      <div className="relative w-full rounded-3xl overflow-hidden mb-12 shadow-2xl bg-black aspect-video">
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

  const getAbsoluteImageUrl = () => {
    const img = article.image || article.images?.[0];
    if (!img) return `${window.location.origin}/logo-icon.svg`;
    if (img.startsWith('http')) return img;
    
    return img.startsWith('/uploads/') ? `${BACKEND_URL}${img}` : `${window.location.origin}${img}`;
  };

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
  const coverImage = article.image || article.images?.[0];
  const otherImages = article.images ? article.images.filter(img => img !== coverImage) : [];

  const storyGalleryImages = otherImages.slice(0, Math.ceil(otherImages.length / 2));
  const storyDelegatesImages = otherImages.slice(Math.ceil(otherImages.length / 2));

  const formattedContent = (article.content || "")
    .replace(/\n/g, '<br/>')
    .replace(/src="\/uploads\//g, `src="${BACKEND_URL}/uploads/`)
    .replace(/<img/g, '<img class="w-full rounded-3xl my-8 shadow-xl border border-taa-primary/5"');

  const contentParts = (() => {
    // Normalize line breaks to handle different OS formats and ensure we split by paragraphs
    const normalizedContent = formattedContent.replace(/\r\n/g, '\n');
    const doubleBreaks = normalizedContent.split('<br/><br/>');
    
    if (doubleBreaks.length >= 3) {
      const oneThird = Math.floor(doubleBreaks.length / 3);
      const twoThirds = Math.floor(2 * doubleBreaks.length / 3);
      return [
        doubleBreaks.slice(0, oneThird).join('<br/><br/>'),
        doubleBreaks.slice(oneThird, twoThirds).join('<br/><br/>'),
        doubleBreaks.slice(twoThirds).join('<br/><br/>')
      ];
    }
    
    const singleBreaks = normalizedContent.split('<br/>');
    if (singleBreaks.length >= 6) {
      const oneThird = Math.floor(singleBreaks.length / 3);
      const twoThirds = Math.floor(2 * singleBreaks.length / 3);
      return [
        singleBreaks.slice(0, oneThird).join('<br/>'),
        singleBreaks.slice(oneThird, twoThirds).join('<br/>'),
        singleBreaks.slice(twoThirds).join('<br/>')
      ];
    }

    if (doubleBreaks.length === 2) {
      return [doubleBreaks[0], doubleBreaks[1], ''];
    }
    
    return [normalizedContent, '', ''];
  })();

  return (
    <main className="bg-taa-surface dark:bg-taa-dark min-h-screen pb-20 transition-colors duration-300">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-taa-primary/10">
        <motion.div 
          className="h-full bg-taa-primary shadow-[0_0_10px_#1E6B2B]"
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

      <div className="max-w-4xl mx-auto px-6 pt-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-taa-primary dark:text-taa-accent font-bold mb-8 hover:-translate-x-2 transition-transform"
        >
          <ChevronLeft size={20} /> Back to Hub
        </Link>

        <article className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] overflow-hidden shadow-2xl border border-taa-primary/5">
          {/* Header Image */}
          {(article.image || article.images?.[0]) && (
            <div className="relative h-[300px] md:h-[600px] w-full">
              <img
                src={(article.image || article.images?.[0]).startsWith('/uploads/') ? `${BACKEND_URL}${article.image || article.images?.[0]}` : (article.image || article.images?.[0])}
                alt={article.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-12 left-8 right-8 md:left-12 md:right-12">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 bg-taa-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                    {article.category || "Insight"}
                  </span>
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                    {readingTime} MIN READ
                  </span>
                </div>
                <h1 className="text-3xl md:text-6xl font-black text-white leading-[1.1] drop-shadow-2xl">
                  {article.title}
                </h1>
              </div>
            </div>
          )}

          <div className="p-8 md:p-16">
            {!(article.image || article.images?.[0]) && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-taa-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                    {article.category || "Insight"}
                  </span>
                  <span className="text-taa-primary/60 dark:text-white/40 text-[10px] font-black uppercase tracking-widest">
                    {readingTime} MIN READ
                  </span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-taa-dark dark:text-white leading-[1.1] tracking-tight">
                  {article.title}
                </h1>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-8 mb-16 pb-10 border-b border-taa-primary/10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-taa-primary text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-taa-primary/20">
                  {article.author?.[0] || "T"}
                </div>
                <div>
                  <p className="font-black text-taa-dark dark:text-white text-lg">
                    {article.author || "Text Africa Arcade"}
                  </p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    {new Date(article.createdAt).toLocaleDateString("en-US", {
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
                  className="p-4 bg-taa-primary/5 text-taa-primary dark:text-taa-accent rounded-2xl hover:bg-taa-primary hover:text-white transition-all active:scale-95 border border-taa-primary/10"
                  title="Download as PDF"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-taa-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-taa-primary/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Share2 size={18} /> SHARE STORY
                </button>
              </div>
            </div>

            {renderVideo()}

            {/* Main Article Content with Galleries interspersed */}
            <div ref={articleRef}>
              <div 
                className="prose prose-xl max-w-none dark:prose-invert prose-headings:font-black prose-p:leading-[1.8] prose-p:text-gray-700 dark:prose-p:text-gray-300 whitespace-pre-line text-justify mb-12 article-content"
                dangerouslySetInnerHTML={{ __html: contentParts[0] }}
              />

              {/* Story Gallery - Moved to first interval */}
              {storyGalleryImages.length > 0 && (
                <div className="my-16 py-12 border-y border-taa-primary/10">
                  <h3 className="text-xl font-black text-taa-dark dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={18} className="text-taa-primary" /> Story Delegates
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {storyGalleryImages.map((img, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="aspect-square rounded-2xl overflow-hidden border border-taa-primary/10 shadow-md cursor-pointer"
                        onClick={() => window.open(img.startsWith('/uploads/') ? `${BACKEND_URL}${img}` : img, '_blank')}
                      >
                        <img src={img.startsWith('/uploads/') ? `${BACKEND_URL}${img}` : img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {contentParts[1] && (
                <div 
                  className="prose prose-xl max-w-none dark:prose-invert prose-headings:font-black prose-p:leading-[1.8] prose-p:text-gray-700 dark:prose-p:text-gray-300 whitespace-pre-line text-justify mb-12 article-content"
                  dangerouslySetInnerHTML={{ __html: contentParts[1] }}
                />
              )}

              {/* Story Delegates Gallery - Moved to second interval */}
              {storyDelegatesImages.length > 0 && (
                <div className="my-16 py-12 border-y border-taa-primary/10">
                  <h3 className="text-xl font-black text-taa-dark dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={18} className="text-taa-primary" /> Story Delegates
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {storyDelegatesImages.map((img, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="aspect-square rounded-2xl overflow-hidden border border-taa-primary/10 shadow-md cursor-pointer"
                        onClick={() => window.open(img.startsWith('/uploads/') ? `${BACKEND_URL}${img}` : img, '_blank')}
                      >
                        <img src={img.startsWith('/uploads/') ? `${BACKEND_URL}${img}` : img} className="w-full h-full object-cover" alt={`Delegate ${i}`} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {contentParts[2] && (
                <div 
                  className="prose prose-xl max-w-none dark:prose-invert prose-headings:font-black prose-p:leading-[1.8] prose-p:text-gray-700 dark:prose-p:text-gray-300 whitespace-pre-line text-justify mb-20 article-content"
                  dangerouslySetInnerHTML={{ __html: contentParts[2] }}
                />
              )}
            </div>

            {article.sourceUrl && (
              <div className="mb-20 pt-10 border-t border-taa-primary/5">
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 bg-taa-dark dark:bg-taa-primary text-white font-black px-10 py-5 rounded-2xl hover:brightness-110 shadow-2xl transition-all"
                >
                  Explore Original Source <ChevronRight size={20} />
                </a>
              </div>
            )}

            {/* Re-designed Sharing Section */}
            {/* <div className="bg-taa-primary/5 dark:bg-white/5 rounded-[2rem] p-10 border border-taa-primary/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-taa-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-10">
                <h4 className="text-2xl font-black text-taa-dark dark:text-white mb-2">Did you find this insightful?</h4>
                <p className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-8 uppercase tracking-widest">Help spread the word to your network</p>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      readOnly
                      value={getArticleLink()}
                      className="w-full bg-white dark:bg-taa-dark border-2 border-transparent focus:border-taa-primary rounded-2xl p-5 text-sm font-black text-gray-400 outline-none shadow-inner transition-all"
                    />
                    <button 
                      onClick={handleCopy}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-taa-primary hover:bg-taa-primary/10 rounded-xl transition-all"
                    >
                      {copied ? <Check size={22} className="text-green-500" /> : <Copy size={22} />}
                    </button>
                  </div>
                </div>
              </div>
            </div> */}
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
                  key={rel._id} 
                  to={`/article/${rel.slug || rel._id}`}
                  className="glass-card group p-6 rounded-[2rem] border border-taa-primary/5 hover:border-taa-primary/20 transition-all"
                >
                  <div className="aspect-video rounded-2xl overflow-hidden mb-6">
                    <img src={(rel.image || rel.images?.[0])?.startsWith('/uploads/') ? `${BACKEND_URL}${rel.image || rel.images?.[0]}` : (rel.image || rel.images?.[0])} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={rel.title} />
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
