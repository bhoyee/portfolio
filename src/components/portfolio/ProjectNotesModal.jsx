import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Lock, Lightbulb, CheckCircle2 } from "lucide-react";

export default function ProjectNotesModal({ project, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-emerald-500 to-blue-600 px-6 py-5 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{project.name}</h2>
              <p className="text-emerald-50 text-sm">Engineering Deep Dive</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-80px)] px-6 py-6 space-y-6">
            {/* Engineering Challenges */}
            <section className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">The Challenge</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {project.notes.problem}
                  </p>
                </div>
              </div>
            </section>

            {/* Constraints */}
            {project.notes.constraint && (
              <section className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Key Constraints</h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {project.notes.constraint}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Solution Approach */}
            {project.notes.decision && (
              <section className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Solution Approach</h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {project.notes.decision}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Results */}
            {project.notes.resolution && (
              <section className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Results & Impact</h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {project.notes.resolution}
                    </p>
                  </div>
                </div>
              </section>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}