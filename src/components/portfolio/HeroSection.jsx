import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Code2, Sparkles } from "lucide-react";

export default function HeroSection() {
  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 pt-0">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          {/* Bento-style layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side - Main intro */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Status badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/20 backdrop-blur-xl">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Available for opportunities</span>
              </div>

              {/* Main heading with typing effect style */}
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <Terminal className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">~/portfolio</span>
                </motion.div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight">
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-emerald-700 to-emerald-500 dark:from-white dark:via-emerald-200 dark:to-emerald-400 animate-gradient bg-[length:200%_auto]"
                  >
                    Salisu
                  </motion.span>
                  <br />
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="inline-block text-slate-700 dark:text-slate-300"
                  >
                    Abdulhamid
                  </motion.span>
                </h1>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="flex items-center gap-3 text-xl text-emerald-600 dark:text-emerald-400 font-mono"
                >
                  <Code2 className="w-5 h-5" />
                  <span>Full-Stack Engineer</span>
                </motion.div>
              </div>

              {/* Description */}
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl border-l-2 border-emerald-500/30 pl-6">
                Building production-grade systems that solve real problems. 
                From architecting scalable backends to crafting intuitive user experiences — 
                I turn complex challenges into elegant, maintainable code.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => scrollTo("#projects")}
                  className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-0.5"
                >
                  View My Work
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollTo("#contact")}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white px-6 py-3 rounded-lg font-semibold border border-slate-300 dark:border-white/10 transition-all backdrop-blur-xl"
                >
                  Let's Talk
                </button>
              </div>
            </motion.div>

            {/* Right side - Photo card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 space-y-6"
            >
              {/* Photo card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 animate-pulse transition duration-1000"></div>
                <motion.div 
                  whileHover={{ scale: 1.02, rotate: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl"
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69923326cd7075c113f726df/cb072ad06_boo1.png"
                      alt="Salisu Abdulhamid"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-transparent to-transparent dark:from-slate-900 dark:via-transparent dark:to-transparent opacity-60" />
                    
                    {/* Animated border on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-emerald-500"></div>
                      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-emerald-500"></div>
                    </div>
                  </div>
                  
                  {/* Info overlay */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-100 to-transparent dark:from-slate-900 dark:to-transparent backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-mono mb-2">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>Currently working on</span>
                    </div>
                    <p className="text-slate-900 dark:text-white text-sm">
                      Scalable microservices architecture & AI-powered solutions
                    </p>
                  </motion.div>
                </motion.div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group bg-slate-100 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-4 overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 }}
                      className="text-3xl font-bold text-emerald-600 dark:text-emerald-400"
                    >
                      5+
                    </motion.div>
                    <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">Years Experience</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group bg-slate-100 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-4 overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6 }}
                      className="text-3xl font-bold text-emerald-600 dark:text-emerald-400"
                    >
                      50+
                    </motion.div>
                    <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">Projects Shipped</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <button
              onClick={() => scrollTo("#projects")}
              className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex flex-col items-center gap-2"
            >
              <span className="text-xs font-mono">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-slate-400 dark:border-slate-500 rounded-full flex items-start justify-center p-2">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full"
                />
              </div>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}