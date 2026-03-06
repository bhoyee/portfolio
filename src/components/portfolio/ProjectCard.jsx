import React, { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github, FileText } from "lucide-react";
import ProjectNotesModal from "./ProjectNotesModal";

export default function ProjectCard({ project, index }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all duration-500">
        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-950">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-slate-100/50 to-transparent dark:from-slate-900 dark:via-slate-900/50 dark:to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
            {project.name}
          </h3>
          
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {project.outcome}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-500/20"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Links & Notes Toggle */}
          <div className="flex items-center gap-3 pt-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <Github className="w-4 h-4" />
                Code
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="ml-auto flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FileText className="w-4 h-4" />
              Engineering Notes
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ProjectNotesModal 
        project={project} 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </motion.div>
  );
}