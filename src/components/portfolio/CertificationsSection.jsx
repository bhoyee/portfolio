import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { certifications } from "@/data/certifications";

export default function CertificationsSection() {
  const [expanded, setExpanded] = useState(false);
  const defaultVisible = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return 6;
    return window.matchMedia("(min-width: 768px)").matches ? 6 : 3;
  }, []);
  const [visibleCount, setVisibleCount] = useState(defaultVisible);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setVisibleCount(mql.matches ? 6 : 3);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  const shown = expanded ? certifications : certifications.slice(0, visibleCount);

  return (
    <section
      id="certifications"
      className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-950 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-200/20 via-slate-50 to-slate-50 dark:from-emerald-900/15 dark:via-slate-950 dark:to-slate-950" />

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
              Credentials
            </p>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-emerald-600 dark:via-emerald-500 to-transparent" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            Certifications
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Industry-recognized certifications and professional development.
          </p>
        </motion.div>

        {certifications.length === 0 ? (
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 mb-3">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-slate-900 dark:text-white font-semibold">No certifications added yet</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Add entries in <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900">src/data/certifications.js</code>.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shown.map((cert, index) => (
              <motion.div
                key={`${cert.name}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                whileHover={{ y: -6 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-25 blur-lg transition duration-500" />
                <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {cert.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {cert.issuer}
                        {cert.issued ? <span className="text-slate-400"> · {cert.issued}</span> : null}
                      </div>
                      {cert.credentialId ? (
                        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          Credential ID: <span className="font-mono">{cert.credentialId}</span>
                        </div>
                      ) : null}

                      {cert.verifyUrl ? (
                        <div className="mt-4">
                          <a
                            href={cert.verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200"
                          >
                            Verify <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>

            {certifications.length > visibleCount && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-5 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-emerald-500/60 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  {expanded
                    ? "Show less"
                    : `Show all certifications (${certifications.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
