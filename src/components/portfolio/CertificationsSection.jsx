import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Award, ExternalLink, X } from "lucide-react";
import { fetchCertifications } from "@/api/certificationsApi";
import { certifications as localCertifications } from "@/data/certifications";

export default function CertificationsSection() {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(null);
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

  const { data: apiCerts = [], isError } = useQuery({
    queryKey: ["certifications"],
    queryFn: fetchCertifications,
    retry: 1,
  });

  const list = (apiCerts?.length ? apiCerts : localCertifications) || [];
  const shown = expanded ? list : list.slice(0, visibleCount);

  if (list.length === 0) return null;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener?.("keydown", onKeyDown);
    return () => window.removeEventListener?.("keydown", onKeyDown);
  }, []);

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

                      {cert.fileUrl ? (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setActive(cert)}
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-200"
                          >
                            View certificate <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>

            {(list.length > visibleCount) && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-5 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-emerald-500/60 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  {expanded
                    ? "Show less"
                    : `Show all certifications (${list.length})`}
                </button>
              </div>
            )}

            {isError && (
              <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Showing local demo certifications (backend not available).
              </div>
            )}
        </>
      </div>

      {active?.fileUrl ? (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Certificate preview"
        >
          <div
            className="w-full max-w-4xl bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-white truncate">
                  {active.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {active.issuer || ""}{active.issued ? ` · ${active.issued}` : ""}
                </div>
              </div>
              <button
                type="button"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200"
                onClick={() => setActive(null)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900">
              {active.fileUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  title="Certificate PDF"
                  src={active.fileUrl}
                  className="w-full h-[70vh] bg-white"
                />
              ) : (
                <div className="p-4 flex justify-center">
                  <img
                    src={active.fileUrl}
                    alt={`${active.name} certificate`}
                    className="max-h-[70vh] w-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
              <a
                className="inline-flex items-center justify-center rounded-xl border border-slate-300/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-emerald-500/60 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                href={active.fileUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
