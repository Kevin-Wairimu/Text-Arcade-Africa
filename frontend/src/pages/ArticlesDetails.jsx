// src/pages/ArticleDetails.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../utils/api";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// --- Simple Loader ---
const ArticleLoader = () => (
  <div className="flex flex-col justify-center items-center min-h-[80vh] text-center px-4">
    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[#2E7D32]"></div>
    <p className="mt-4 text-lg text-[#2E7D32] font-semibold">Loading Article...</p>
  </div>
);

export default function ArticleDetails() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const articleRef = useRef(); // Ref for PDF capture

  // --- Fetch Article ---
  const fetchArticle = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("Article identifier is missing.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.get(`/articles/${id}`);
      const articleData = data.article || data;
      setArticle(articleData);
    } catch (err) {
      console.error("Failed to load article:", err);
      setError("Failed to load the article. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchArticle();
  }, [fetchArticle]);

  // --- Helpers ---
  const getArticleLink = useCallback(() => {
    if (!article) return "";
    return article.link || `${window.location.origin}/article/${article._id}`;
  }, [article]);

  const handleCopy = useCallback(() => {
    const link = getArticleLink();
    if (link) {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch((err) => console.error("Failed to copy text: ", err));
    }
  }, [getArticleLink]);

  const handleShare = useCallback(() => {
    const link = getArticleLink();
    if (!link || !article) return;

    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: "Check out this article:",
          url: link,
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      handleCopy();
      alert("Link copied to clipboard!");
    }
  }, [getArticleLink, article, handleCopy]);

  // --- 🆕 Download PDF Function ---
  const handleDownloadPDF = async () => {
    if (!articleRef.current) return;

    try {
      const element = articleRef.current;

      // Add a white background for better contrast in PDF
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add image and scale it to fit the page
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${article.title.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // --- Conditional Rendering ---
  if (loading) return <ArticleLoader />;
  if (error || !article) {
    return (
      <div className="text-center py-20 text-red-600 bg-white min-h-screen pt-20 md:pt-24">
        <h2 className="text-2xl font-bold">Error</h2>
        <p className="mt-2">{error || "The article could not be loaded."}</p>
        <div className="mt-6">
          <Link to="/" className="text-[#2E7D32] font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <main className="bg-white text-taa-accent min-h-screen py-8 pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-green-50/50 border border-green-200 shadow-xl rounded-2xl p-4 sm:p-6 md:p-8 w-[95%] sm:w-[90%]"
      >
        {/* 🆕 Top Buttons */}
        <div className="flex flex-wrap justify-end gap-3 mb-4">
          <button
            onClick={handleDownloadPDF}
            aria-label="Download article as PDF"
            className="flex items-center gap-2 bg-[#2E7D32] text-white px-4 sm:px-5 py-2 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
            Download PDF
          </button>
        </div>

        {/* --- Article Section --- */}
        <div ref={articleRef} className="break-words">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 text-[#1b5e20] break-words">
            {article.title}
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            By {article.author || "Text Africa Arcade"} •{" "}
            {new Date(article.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-auto max-h-[450px] object-cover rounded-lg mb-6 shadow-md"
              crossOrigin="anonymous"
            />
          )}

          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-line mb-8 text-justify">
            {article.content}
          </div>

          {article.sourceUrl && (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#2E7D32] text-white font-bold px-5 py-2 rounded-lg hover:bg-green-700 transition-colors mb-8"
            >
              Read Full Article →
            </a>
          )}
        </div>

        {/* Share Section */}
        <div className="border-t pt-6">
          <label
            htmlFor="article-link"
            className="text-sm font-semibold text-gray-600 block mb-2"
          >
            Share this article
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              id="article-link"
              type="text"
              readOnly
              value={getArticleLink()}
              className="flex-1 border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-[#81C784] outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="bg-[#2E7D32] text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-400 transition-colors w-full sm:w-auto"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleShare}
                className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#43A047] focus:ring-2 focus:ring-green-300 transition w-full sm:w-auto"
              >
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center sm:text-left">
          <Link to="/" className="text-[#2E7D32] font-semibold hover:underline">
            ← Back to All Articles
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
