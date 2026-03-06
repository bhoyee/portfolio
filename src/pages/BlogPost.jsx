import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Calendar, Clock, Loader2, Share2, Heart, MessageCircle, Send, CheckCircle2, Facebook, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";

import Navigation from "../components/portfolio/Navigation";
import Footer from "../components/portfolio/Footer";
import { createPageUrl } from "@/utils";
import { getPostBySlug } from "@/lib/blog/content";
import { fetchPostBySlug } from "@/api/blogPostsApi";
import { addComment, getComments, getLikes, toggleLike } from "@/api/blogInteractions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function BlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || urlParams.get("id");

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [commentForm, setCommentForm] = useState({ author_name: "", author_email: "", content: "" });
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ["localBlogPost", slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        return await fetchPostBySlug(slug);
      } catch {
        return getPostBySlug(slug) || null;
      }
    },
    enabled: !!slug,
  });

  const { data: likesData } = useQuery({
    queryKey: ["likes", slug],
    queryFn: () => getLikes(slug),
    enabled: !!slug,
  });

  const { data: commentsData } = useQuery({
    queryKey: ["comments", slug],
    queryFn: () => getComments(slug),
    enabled: !!slug,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: () => toggleLike(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["likes", slug] }),
  });

  const addCommentMutation = useMutation({
    mutationFn: () => addComment(slug, commentForm),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["comments", slug] });
      setCommentForm({ author_name: "", author_email: "", content: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    },
  });

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = post?.title || "";

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      setShowShareMenu(false);
      return;
    }

    window.open(shareUrls[platform], "_blank");
    setShowShareMenu(false);
  };

  const formattedDate = post?.created_date
    ? new Date(post.created_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  if (!slug) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post not found</h1>
          <Link to={createPageUrl("Blog")} className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Couldn’t load post</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{error?.message || "An unknown error occurred."}</p>
          <Link to={createPageUrl("Blog")} className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post not found</h1>
          <Link to={createPageUrl("Blog")} className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navigation />

      <article className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to={createPageUrl("Blog")}
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {post.cover_image ? (
              <div className="relative w-full h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl">
                <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
              </div>
            ) : null}

            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {formattedDate ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formattedDate}
                    </span>
                  ) : null}
                  {post.reading_time ? (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.reading_time} min read
                    </span>
                  ) : null}
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {post.title}
                </h1>

                {post.tags?.length ? (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>

                {showShareMenu ? (
                  <div className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-10 min-w-[160px]">
                    <button
                      onClick={() => handleShare("twitter")}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm transition-colors"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Copy Link
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => toggleLikeMutation.mutate()}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  likesData?.liked
                    ? "bg-red-50 border-red-300 text-red-600 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400"
                    : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Heart className={`w-4 h-4 ${likesData?.liked ? "fill-current" : ""}`} />
                <span className="text-sm font-medium">
                  {typeof likesData?.count === "number" ? likesData.count : 0}{" "}
                  {likesData?.count === 1 ? "Like" : "Likes"}
                </span>
              </button>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                <MessageCircle className="w-4 h-4" />
                <span>{commentsData?.comments?.length || 0} Comments</span>
              </div>

              {(likesData?.source === "local" || commentsData?.source === "local") && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (local demo — connect PHP backend for shared counts)
                </span>
              )}
            </div>

            <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>,
                  code: ({ inline, children }) =>
                    inline ? (
                      <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm">{children}</code>
                    ) : (
                      <code className="block bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-4">
                        {children}
                      </code>
                    ),
                  a: ({ children, ...props }) => (
                    <a
                      {...props}
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-8">
                <MessageCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Comments ({commentsData?.comments?.length || 0})
                </h2>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addCommentMutation.mutate();
                }}
                className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-12"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Leave a comment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Input
                    required
                    placeholder="Your name"
                    value={commentForm.author_name}
                    onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })}
                    className="rounded-xl dark:bg-slate-800"
                  />
                  <Input
                    type="email"
                    placeholder="Your email (optional)"
                    value={commentForm.author_email}
                    onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })}
                    className="rounded-xl dark:bg-slate-800"
                  />
                </div>
                <Textarea
                  required
                  rows={4}
                  placeholder="Write your comment..."
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  className="rounded-xl mb-4 dark:bg-slate-800"
                />
                <Button
                  type="submit"
                  disabled={addCommentMutation.isPending || submitted}
                  className={`rounded-xl ${
                    submitted
                      ? "bg-emerald-600 hover:bg-emerald-600"
                      : "bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500"
                  }`}
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : submitted ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Comment added
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Post Comment
                    </span>
                  )}
                </Button>
              </form>

              <div className="space-y-6">
                {(commentsData?.comments || []).map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{comment.author_name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {comment.created_date
                            ? new Date(comment.created_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
