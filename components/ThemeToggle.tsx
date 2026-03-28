"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="p-2 w-10 h-10 flex items-center justify-center opacity-0">
      <Sun size={18} />
    </div>
  );

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-all duration-200"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-accent" />
      ) : (
        <Moon size={18} className="text-slate-700" />
      )}
    </button>
  );
}
