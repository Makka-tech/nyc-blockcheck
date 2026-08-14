"use client";

import Link from "next/link";
import { useEffect } from "react";

export function SiteHeader() {
  useEffect(() => {
    const saved = localStorage.getItem("nyc-blockcheck-theme");
    const dark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, []);
  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("nyc-blockcheck-theme", next ? "dark" : "light");
  }
  return (
    <header className="border-b border-slate-200 bg-paper/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="focus-ring no-underline">
          <span className="font-serif text-xl font-semibold tracking-tight">
            NYC Block<span className="text-civic">Check</span>
          </span>
          <span className="ml-2 hidden text-xs text-slate-500 sm:inline">
            Public records, clearly explained
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link className="focus-ring" href="/methodology">
            Methodology
          </Link>
          <button
            aria-label="Toggle color theme"
            className="focus-ring rounded-full border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700"
            onClick={toggleTheme}
          >
            Theme
          </button>
        </nav>
      </div>
    </header>
  );
}
