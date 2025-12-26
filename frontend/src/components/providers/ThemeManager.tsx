"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { aiSettingsAtom } from "../../atom";

export default function ThemeManager() {
  const [settings] = useAtom(aiSettingsAtom);

  useEffect(() => {
    const root = document.documentElement;
    
    // Define the raw color values for the themes
    const themes: Record<string, string> = {
      blue: "#3b82f6",    // blue-500
      purple: "#a855f7",  // purple-500
      emerald: "#10b981", // emerald-500
      orange: "#f97316",  // orange-500
    };

    const color = themes[settings.theme] || themes.blue;
    
    // Inject the variable globally
    root.style.setProperty("--accent-color", color);
    
  }, [settings.theme]);

  return null;
}