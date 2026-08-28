import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectCard from "./ProjectCard";

const projects = [
  {
    name: "Taskora - Multi-Tenant Delivery Platform",
    outcome: "A role-based workspace platform — boards, sprints, calendar, and reporting — built end-to-end from domain model to production, cutting a critical endpoint's response time from an unbounded hang to under 100ms.",
    techStack: ["C#", ".NET", "ASP.NET Core", "EF Core", "PostgreSQL", "React", "TypeScript"],
    image: `${import.meta.env.BASE_URL}projects/taskora.png`,
    github: "https://github.com/bhoyee/Taskora/",
    demo: "https://taskoraz.vercel.app",
    notes: {
      problem:
        "Small teams juggling delivery work usually end up split across a generic to-do app for personal tasks, spreadsheets for reporting, and a separate board tool for sprint tracking — none of which share data or reflect who's actually allowed to do what. The goal was to build one coherent workspace product — boards, sprint planning, a calendar, personal to-dos, and manager-facing reports, all backed by the same task/project data — and ship it as a real tool a team would use daily, not a demo shell, designed and built solo end to end: domain model, backend, frontend, deployment, and ongoing operations.",
      constraint: [
        "A single data model had to support several very different views (kanban board, sprint planner, calendar, analytics/reports, personal to-do list) without each feature forking its own copy of the data.",
        "Permissions needed two independent axes: per-workspace roles (Owner/Manager/Member) for normal team use, plus a separate cross-cutting Super Admin capability for platform-level operations — without either one accidentally granting the other's access.",
        "The same EF Core domain model had to run against SQLite for local development and Postgres in production without the two behaving differently at the edges.",
        "As the sole engineer, tooling normally owned by a separate platform/SRE team — deploy pipeline, database backups, cross-workspace administration — had to be built in-house rather than assumed.",
      ],
      decision: [
        "Structured the backend as a modular monolith (Domain → Application → Infrastructure → API), so sprints, reports, and the calendar all read and write the same underlying project/task model instead of duplicating logic per feature.",
        "Built role-based authorization scoped per workspace, layered under a separately-gated Super Admin path for cross-workspace admin pages (platform management, operations, backups) — two authorization models that don't leak into each other.",
        "Added a public, unauthenticated demo (four role logins, including full admin tooling) so anyone can evaluate the real product without signing up — backed by a fully isolated seed-data identity space and a nightly self-resetting job, after an early version briefly let demo seeding touch the real account's data. Rebuilt with a hard authorization guard and regression tests specifically covering that boundary.",
        "Moved outbound email (password reset, invites, task/deadline notifications) off the request path into a background dispatcher after discovering it could hang requests and leak timing information about which accounts existed.",
        "Ships continuously to production (Vercel frontend, Render API, Neon Postgres) with EF Core migrations applied automatically on deploy, gated by a backend and frontend test suite run before every change goes out.",
      ],
      resolution: [
        "A real team runs its day-to-day delivery work through Taskora — boards, sprints, calendar, personal to-dos, and reports — as its actual tool, not a showcase.",
        "Anyone can evaluate all four role perspectives live via the public demo, with the production account fully isolated from it at the data layer, verified and enforced by automated tests.",
        "Password-reset response time went from an unbounded hang to ~100ms, closing both a reliability bug and a timing-based account-enumeration leak.",
      ],
    },
  },
  {
    name: "DevOps Pipeline Orchestrator",
    outcome: "Automated CI/CD for 12 microservices, cutting deployment time from 45 minutes to under 8 minutes.",
    techStack: ["Go", "Kubernetes", "Terraform", "GitHub Actions", "Prometheus"],
    image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
    github: "https://github.com/bhoyee",
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
    github: "https://github.com/bhoyee",
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
    github: "https://github.com/bhoyee",
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
              href="https://github.com/bhoyee"
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
