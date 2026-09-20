"use client";

import React, { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { applyTheme, isDarkActive } from "@/lib/theme";

const subscribe = () => () => {};

export interface ThemeToggleProps {
  /** Overrides the default pill styling, to match whichever header mounts it. */
  className?: string;
  /** Renders a text label alongside the icon, for list/sidebar row layouts. */
  showLabel?: boolean;
}

/**
 * Light/dark switch. The theme is read from the <html> class rather than prop or
 * context state, so the icon always reflects what the pre-paint script applied.
 */
export default function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  // False during SSR and the first client render, matching the server markup;
  // the real value is read in the effect below, after hydration.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(isDarkActive());
  }, []);

  const handleToggle = useCallback(() => {
    const next = !isDarkActive();
    applyTheme(next);
    setIsDark(next);
  }, []);

  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      title={label}
      aria-pressed={mounted ? isDark : undefined}
      className={
        className ??
        "relative flex h-9 w-9 items-center justify-center text-[#6B7280] hover:text-[#124734] transition-colors duration-200 bg-white/60 hover:bg-white rounded-full border border-gray-200/50 cursor-pointer"
      }
    >
      {/* Rendered only after mount: the server cannot know the active theme, and
          guessing would produce a hydration mismatch on the icon. The button is
          fixed-size so the icon appearing does not shift the header. */}
      {mounted && (isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
      {/* Names the mode being switched to, matching the icon. */}
      {showLabel && mounted && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
    </motion.button>
  );
}
