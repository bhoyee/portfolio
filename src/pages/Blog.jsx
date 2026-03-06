import React, { useState } from "react";
import { getAllPosts } from "@/lib/blog/content";
import { fetchPosts } from "@/api/blogPostsApi";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronRight, Clock, Calendar, ArrowLeft } from "lucide-react";
import Navigation from "../components/portfolio/Navigation";
import Footer from "../components/portfolio/Footer";

export default function Blog() {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const { data: posts = [], isLoading, isError, error } = useQuery({
    queryKey: ["localBlogPosts"],
    queryFn: async () => {
      try {
        return await fetchPosts();
      } catch {
        return getAllPosts();
      }
    },
  });

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = posts.slice(startIndex, startIndex + postsPerPage);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navigation />
      
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            to={createPageUrl("Portfolio")}
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
              Engineering Blog
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Technical Writings
            </h1>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
              Deep dives into system design, architecture decisions, and lessons learned from building production systems.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-800 h-96 rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="mt-16 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-900/20 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Couldn’t load blog posts</h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                {error?.message || "An unknown error occurred while fetching posts."}
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">No posts yet</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Add Markdown files in <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">src/content/blog</code>.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentPosts.map((post, index) => (
                  <BlogPostCard key={post.id} post={post} index={index} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function BlogPostCard({ post, index }) {
  const formattedDate = post.created_date
    ? new Date(post.created_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
    >
      <Link
        to={`/blog/${encodeURIComponent(post.slug)}`}
        className="group block h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-500 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 hover:shadow-2xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/30 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none" />
        
        {post.cover_image && (
          <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        )}

        <div className="relative p-6">
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            {post.reading_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.reading_time} min read
              </span>
            )}
          </div>

          <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-2">
            {post.title}
          </h3>
          
          {post.excerpt && (
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
