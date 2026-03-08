"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with "light" — FOUC script already set the real value on <html>
  // We sync state from the DOM attribute on mount to avoid mismatch
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Light is the brand default — only switch to dark if user explicitly chose it
    try {
      const stored = localStorage.getItem("mimi-theme") as Theme | null;
      if (stored === "dark") {
        setTheme("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        // Ensure light is explicitly set (removes any system-level dark attribute)
        document.documentElement.removeAttribute("data-theme");
      }
    } catch { /* noop */ }
  }, []);

  function toggle() {
    setTheme(prev => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("mimi-theme", next); } catch { /* noop */ }
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
