import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../utils/api";

// Helper function to format relative time (no changes needed here)
function formatRelativeTime(date) {
  // ... (rest of the function is fine)
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
        // CORRECTED LINE: Removed the redundant "/api" prefix.
        const { data } = await API.get(`/articles/${id}`);
        console.log("Article data:", data);
        setArticle(data);
      } catch (err) {
        console.error("Failed to load article:", err);
      }
    }

    if (id) {
      fetchArticle();
    }
  }, [id]);

  if (!article)
    return (
      <div className="text-center py-20 text-taa-accent bg-white min-h-screen pt-20 md:pt-24">
        Loading article...
      </div>
    );

  return (
    <main className="bg-white text-taa-accent min-h-screen py-8 pt-20 md:pt-24">
      <div className="max-w-3xl mx-auto bg-taa-accent/10 border border-taa-accent/20 shadow-xl rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-taa-accent">
          {article.title}
        </h1>
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
        <p className="text-taa-accent text-base sm:text-lg leading-relaxed whitespace-pre-line mb-8">
          {article.content}
        </p>
        <Link
          to="/"
          className="text-taa-accent font-semibold hover:underline text-sm sm:text-base"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}