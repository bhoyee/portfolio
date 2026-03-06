import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTheme } from "./ThemeProvider";
import { toast } from "@/components/ui/use-toast";
import { fetchCertifications } from "@/api/certificationsApi";
import { certifications as localCertifications } from "@/data/certifications";

const baseNavLinks = [
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Blog", href: "/Blog", external: true },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isPortfolioPage = location.pathname === '/' || location.pathname === '/Portfolio';

  const { data: certs = [] } = useQuery({
    queryKey: ["certifications"],
    queryFn: fetchCertifications,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const hasCertifications = (Array.isArray(certs) && certs.length > 0) || (localCertifications?.length ?? 0) > 0;

  const navLinks = useMemo(() => {
    const links = [...baseNavLinks];
    if (hasCertifications) {
      links.splice(1, 0, { label: "Certifications", href: "#certifications" });
    }
    return links;
  }, [hasCertifications]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    
    if (href.startsWith('#')) {
      if (isPortfolioPage) {
        // On portfolio page, just scroll
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else if (href === "#certifications") {
          toast({
            title: "Certifications",
            description: "No certifications are available at the moment. Please check back soon.",
          });
        }
      } else {
        // On other pages, navigate to portfolio with hash
        navigate(createPageUrl('Portfolio') + href);
      }
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to={createPageUrl('Portfolio')}
            className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            salisu<span className="text-emerald-600 dark:text-emerald-400">.dev</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              link.external ? (
                <Link
                  key={link.href}
                  to={createPageUrl(link.href.replace('/', ''))}
                  className="text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 font-medium"
                >
                  {link.label}
                </Link>
              ) : (
                isPortfolioPage ? (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    to={createPageUrl('Portfolio') + link.href}
                    className="text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                )
              )
            ))}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            {isPortfolioPage ? (
              <button
                onClick={() => handleNavClick("#contact")}
                className="text-sm font-medium bg-slate-900 dark:bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors"
              >
                Get in Touch
              </button>
            ) : (
              <Link
                to={createPageUrl('Portfolio') + '#contact'}
                className="text-sm font-medium bg-slate-900 dark:bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors"
              >
                Get in Touch
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-700 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-700 dark:text-slate-300"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-white dark:bg-slate-950 pt-20 px-6 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                link.external ? (
                  <Link
                    key={link.href}
                    to={createPageUrl(link.href.replace('/', ''))}
                    onClick={() => setMobileOpen(false)}
                    className="text-left text-lg font-medium text-slate-800 dark:text-slate-200 py-4 border-b border-slate-100 dark:border-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  isPortfolioPage ? (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className="text-left text-lg font-medium text-slate-800 dark:text-slate-200 py-4 border-b border-slate-100 dark:border-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.href}
                      to={createPageUrl('Portfolio') + link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-left text-lg font-medium text-slate-800 dark:text-slate-200 py-4 border-b border-slate-100 dark:border-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                )
              ))}
              {isPortfolioPage ? (
                <button
                  onClick={() => handleNavClick("#contact")}
                  className="mt-6 w-full text-center font-medium bg-slate-900 dark:bg-emerald-600 text-white py-3.5 rounded-full hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors"
                >
                  Get in Touch
                </button>
              ) : (
                <Link
                  to={createPageUrl('Portfolio') + '#contact'}
                  onClick={() => setMobileOpen(false)}
                  className="mt-6 w-full text-center font-medium bg-slate-900 dark:bg-emerald-600 text-white py-3.5 rounded-full hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors block"
                >
                  Get in Touch
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
