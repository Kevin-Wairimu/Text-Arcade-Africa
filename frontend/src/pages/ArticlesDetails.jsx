import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../utils/api";

// Helper function to format relative time with error handling
function formatRelativeTime(date) {
  // Log raw date for debugging
  console.log("Raw date in ArticleDetails.jsx:", date);

  if (!date) {
    console.warn("Date is null or undefined");
    return "Date unavailable";
  }

  try {
    const now = new Date();
    const published = new Date(date);

    // Check if the date is valid
    if (isNaN(published.getTime())) {
      console.warn("Invalid date format:", date);
      return "Date unavailable";
    }

    const diffMs = now - published;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    }
    return published.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch (err) {
    console.error("Error formatting date:", err, "Raw date:", date);
    return "Date unavailable";
  }
}

export default function ArticleDetails() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  useEffect(() => {
    async function fetchArticle() {
      try {
        // FIX: Added the "/api" prefix to the URL
        const { data } = await API.get(`/api/articles/${id}`);
        console.log("Article data:", data); // Debug API response
        setArticle(data);
      } catch (err) {
        console.error("Failed to load article:", err);
      }
    }
    // Only fetch if an ID is present
    if (id) {
        fetchArticle();
    }
  }, [id]);

  if (!article)
    return (
      <div className="text-center py-20 text-white bg-taa-primary min-h-screen pt-20 md:pt-24">
        Loading article...
      </div>
    );

  return (
    <main className="bg-taa-primary text-white min-h-screen py-8 pt-20 md:pt-24">
      <div className="max-w-3xl mx-auto bg-white/10 border border-white/20 shadow-xl rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">{article.title}</h1>
        <p className="text-sm text-taa-accent mb-6">
          By {article.author || "Text Africa Arcade"} •{" "}
          {formatRelativeTime(article.createdAt)} (
          {article.createdAt
            ? new Date(article.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "N/A"}
          )
        </p>
        <p className="text-white/90 text-base sm:text-lg leading-relaxed whitespace-pre-line mb-8">
          {article.content}
        </p>
        <Link
          to="/"
          className="text-taa-accent font-semibold hover:underline text-sm sm:text-base"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}