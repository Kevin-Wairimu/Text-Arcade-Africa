// src/pages/ArticleDetails.jsx (or your equivalent file)

import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../utils/api"; // Ensure this path is correct
import { motion } from "framer-motion";

// --- A Simple Loader for Better UX ---
const ArticleLoader = () => (
    <div className="flex flex-col justify-center items-center min-h-[80vh] text-center px-4">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[#2E7D32]"></div>
        <p className="mt-4 text-lg text-[#2E7D32] font-semibold">Loading Article...</p>
    </div>
);

export default function ArticleDetails() {
    // FIX #1: Use `id` here to match the parameter from your Home page navigation.
    const { id } = useParams(); 
    
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    // --- Data Fetching Logic ---
    const fetchArticle = useCallback(async () => {
        // This check now correctly looks for `id`.
        if (!id) {
            setLoading(false);
            setError("Article identifier is missing.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // FIX #2: The API endpoint is changed to fetch by ID.
            const { data } = await API.get(`/articles/${id}`);
            
            // Assuming the response is the article object itself or nested like { article: {...} }
            const articleData = data.article || data;

            if (articleData) {
                setArticle(articleData);
            } else {
                setError("Article not found.");
            }
        } catch (err) {
            console.error("Failed to load article:", err);
            setError("Failed to load the article. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [id]); // The dependency is now correctly `id`.

    // --- Effects ---
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchArticle();
    }, [fetchArticle]);

    // --- Helper Functions (Your original functions, now fully restored and corrected) ---
    const getArticleLink = useCallback(() => {
        if (!article) return "";
        // FIX #3: Use the correct parameter `id` to build the link.
        return article.link || `${window.location.origin}/article/${article._id}`;
    }, [article]);

    const handleCopy = useCallback(() => {
        const link = getArticleLink();
        if (link) {
            navigator.clipboard.writeText(link).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            }).catch(err => console.error('Failed to copy text: ', err));
        }
    }, [getArticleLink]);
    
    // This is your original share handler, restored.
    const handleShare = useCallback(() => {
        const link = getArticleLink();
        if (!link || !article) return;

        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: "Check out this article:",
                url: link,
            }).catch((err) => console.error("Share failed:", err));
        } else {
            // Fallback for browsers that don't support navigator.share
            handleCopy();
            alert("Link copied to clipboard!");
        }
    }, [getArticleLink, article, handleCopy]);

    // --- Conditional Rendering ---
    if (loading) {
        return <ArticleLoader />;
    }

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

    // --- Main Render (Your original JSX with your share/copy section fully intact) ---
    return (
        <main className="bg-white text-taa-accent min-h-screen py-8 pt-20 md:pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto bg-green-50/50 border border-green-200 shadow-xl rounded-2xl p-6 sm:p-8"
            >
                <h1 className="text-2xl sm:text-4xl font-bold mb-3 text-[#1b5e20]">
                    {article.title}
                </h1>

                <p className="text-sm text-gray-500 mb-6">
                    By {article.author || "Text Africa Arcade"} •{" "}
                    {new Date(article.createdAt).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                    })}
                </p>

                {article.image && (
                    <img src={article.image} alt={article.title} className="w-full h-auto max-h-[450px] object-cover rounded-lg mb-8" />
                )}

                <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-line mb-8">
                    {article.content}
                </div>

                {article.sourceUrl && (
                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#2E7D32] text-white font-bold px-5 py-2 rounded-lg hover:bg-green-700 transition-colors mb-8">
                        Read Full Article →
                    </a>
                )}

                {/* YOUR ORIGINAL LINK/SHARE SECTION IS PRESERVED HERE */}
                <div className="border-t pt-6">
                    <label className="text-sm font-semibold text-gray-600 block mb-2">Share this article</label>
                    <div className="flex items-center gap-2">
                        <input type="text" readOnly value={getArticleLink()} className="flex-1 border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-[#81C784] outline-none" />
                        <button onClick={handleCopy} className="bg-[#2E7D32] text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors w-24">
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <button onClick={handleShare} className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#43A047] transition">
                            Share
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <Link to="/" className="text-[#2E7D32] font-semibold hover:underline">
                        ← Back to All Articles
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}