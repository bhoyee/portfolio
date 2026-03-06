import React from "react";
import { motion } from "framer-motion";
import { GitFork, Star, ExternalLink, GitPullRequest } from "lucide-react";

const openSourceProjects = [
  {
    name: "Project Name",
    description: "A brief description of what this open source project does and what problem it solves.",
    repo: "https://github.com/bhoyee/project",
    stars: 128,
    forks: 34,
    language: "TypeScript",
    languageColor: "bg-blue-500",
    contribution: "Maintainer",
    tags: ["API", "CLI", "Developer Tools"],
  },
  {
    name: "Another OSS Project",
    description: "Description of your contribution to this project and what you built or fixed.",
    repo: "https://github.com/bhoyee/another-project",
    stars: 56,
    forks: 12,
    language: "C#",
    languageColor: "bg-purple-500",
    contribution: "Contributor",
    tags: [".NET", "Library"],
  },
  {
    name: "Open Source Tool",
    description: "A utility or tool you created or contributed to that helps the developer community.",
    repo: "https://github.com/bhoyee/oss-tool",
    stars: 210,
    forks: 47,
    language: "JavaScript",
    languageColor: "bg-yellow-400",
    contribution: "Maintainer",
    tags: ["Tooling", "Automation"],
  },
];

export default function OpenSourceSection() {
  return (
    <section id="open-source" className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-200/20 via-transparent to-transparent dark:from-emerald-900/20" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '2s' }} />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-emerald-600 dark:via-emerald-500 to-transparent" />
            <p className="text-sm font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Community
            </p>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-emerald-600 dark:via-emerald-500 to-transparent" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            Open Source
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Projects I've built or contributed to for the developer community
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openSourceProjects.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition duration-500" />

              <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{project.name}</h3>
                  </div>
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${project.languageColor}`} />
                      {project.language}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" />
                      {project.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5" />
                      {project.forks}
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    project.contribution === "Maintainer"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  }`}>
                    {project.contribution}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
