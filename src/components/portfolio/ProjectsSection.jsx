import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectCard from "./ProjectCard";

const projects = [
  {
    name: "FinTrack API Platform",
    outcome: "Reduced financial data processing latency by 60% for a fintech client handling 50K+ daily transactions.",
    techStack: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "AWS"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    github: "https://github.com/salisu",
    demo: "#",
    notes: {
      problem: "Legacy monolithic system couldn't handle peak transaction loads, causing 2-3s response times.",
      constraint: "Zero-downtime migration required — the system processed live financial data 24/7.",
      decision: "Adopted event-driven architecture with Redis queues, decomposed into microservices with FastAPI.",
      resolution: "Achieved p99 latency under 200ms. Implemented blue-green deployment for seamless cutover.",
    },
  },
  {
    name: "DevOps Pipeline Orchestrator",
    outcome: "Automated CI/CD for 12 microservices, cutting deployment time from 45 minutes to under 8 minutes.",
    techStack: ["Go", "Kubernetes", "Terraform", "GitHub Actions", "Prometheus"],
    image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
    github: "https://github.com/salisu",
    demo: null,
    notes: {
      problem: "Manual deployments across multiple services led to configuration drift and frequent rollback scenarios.",
      constraint: "Team of 4 engineers managing infrastructure alongside feature development — minimal ops bandwidth.",
      decision: "Built a custom orchestration layer in Go that standardized deployment configs across all services.",
      resolution: "Reduced deployment failures by 90%. Infrastructure-as-code eliminated configuration drift entirely.",
    },
  },
  {
    name: "AI Document Classifier",
    outcome: "Automated classification of 10K+ legal documents monthly with 97% accuracy, saving 120 analyst hours/week.",
    techStack: ["Python", "TensorFlow", "spaCy", "React", "PostgreSQL", "GCP"],
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80",
    github: "https://github.com/salisu",
    demo: "#",
    notes: {
      problem: "Legal team manually categorized incoming documents — a bottleneck that delayed case processing by days.",
      constraint: "Model had to run on-premise due to data sensitivity, with limited GPU resources available.",
      decision: "Fine-tuned a distilled BERT model with domain-specific legal corpus, optimized for CPU inference.",
      resolution: "Deployed with a React dashboard for human-in-the-loop verification. False positive rate under 3%.",
    },
  },
  {
    name: "Real-Time Analytics Dashboard",
    outcome: "Delivered sub-second analytics for a SaaS platform serving 200+ enterprise accounts.",
    techStack: ["TypeScript", "Next.js", "ClickHouse", "WebSocket", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    github: "https://github.com/salisu",
    demo: "#",
    notes: {
      problem: "Existing Elasticsearch-based dashboard had 10-15s query times on aggregated data views.",
      constraint: "Had to support real-time streaming while maintaining historical query performance on 2TB+ datasets.",
      decision: "Migrated analytical workloads to ClickHouse with materialized views for common aggregation patterns.",
      resolution: "Dashboard loads in under 800ms. WebSocket layer streams live updates without polling overhead.",
    },
  },
];

export default function ProjectsSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 2;
  
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  return (
    <section id="projects" className="py-24 sm:py-32 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-emerald-600 dark:from-emerald-500 to-transparent" />
            <p className="text-sm font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Selected Work
            </p>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            End-to-end engineering — from architecture decisions to production deployment.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {currentProjects.map((project, index) => (
            <ProjectCard key={project.name} project={project} index={index} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 hover:border-emerald-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === page
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950"
                      : "border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 hover:border-emerald-500/50"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 hover:border-emerald-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <a
              href="https://github.com/salisu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium hover:border-emerald-500 hover:bg-slate-200 dark:hover:bg-white/5 transition-all backdrop-blur-xl"
            >
              View All Projects on GitHub
            </a>
          </div>
        )}
      </div>
    </section>
  );
}