import React from "react";
import { ThemeProvider } from "@/components/portfolio/ThemeProvider";
import ScrollControls from "@/components/ScrollControls";

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <div className="antialiased">
      <style>{`
        :root {
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        html {
          scroll-behavior: smooth;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        body {
          font-family: var(--font-sans);
        }
        ::selection {
          background-color: rgb(16 185 129 / 0.2);
          color: rgb(15 23 42);
        }
      `}</style>
      {children}
      <ScrollControls />
      </div>
    </ThemeProvider>
  );
}
