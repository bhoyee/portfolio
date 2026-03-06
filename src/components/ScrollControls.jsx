import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function ScrollControls() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollMax, setScrollMax] = useState(0);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY || 0;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      setScrollY(y);
      setScrollMax(max);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const progress = useMemo(() => {
    if (!scrollMax) return 0;
    return Math.min(1, Math.max(0, scrollY / scrollMax));
  }, [scrollY, scrollMax]);

  const isAtTop = scrollY < 20;
  const isAtBottom = scrollMax > 0 && scrollMax - scrollY < 20;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

  // Don’t show when page isn’t scrollable.
  if (scrollMax < 200) return null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        disabled={isAtTop}
        className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 backdrop-blur hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <div className="h-32 w-2 rounded-full bg-slate-200/70 dark:bg-slate-700/70 overflow-hidden border border-slate-200 dark:border-slate-700">
        <div
          className="w-full bg-emerald-500/80 dark:bg-emerald-400/80"
          style={{ height: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <button
        type="button"
        onClick={scrollToBottom}
        aria-label="Scroll to bottom"
        disabled={isAtBottom}
        className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 backdrop-blur hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        <ArrowDown className="h-5 w-5" />
      </button>
    </div>
  );
}

