import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    typeof window !== "undefined" ? localStorage.theme === "dark" : false
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="
        p-2.5
        rounded-xl
        border
        /* Light mode styling: explicit light background and contrasting border */
        bg-white
        border-slate-200
        text-slate-700
        shadow-sm
        
        /* Dark mode styling */
        dark:bg-slate-900
        dark:border-slate-800
        dark:text-slate-200
        
        /* Interactive feedback */
        hover:scale-105
        active:scale-95
        transition-all
        duration-200
        cursor-pointer
      "
      aria-label="Toggle Theme"
    >
      {dark ? (
        <Sun size={18} className="text-amber-500 animate-pulse" />
      ) : (
        <Moon size={18} className="text-indigo-600" />
      )}
    </button>
  );
}