
type ThemeVariant = {
  readonly light: Readonly<Record<string, string>>;
  readonly dark: Readonly<Record<string, string>>;
};

type ColorPaletteShape = Readonly<Record<string, ThemeVariant>>;

export const colorPalette: ColorPaletteShape = {
  // ===== BACKGROUND COLORS =====
  background: {
    light: {
      primary: "#f8fafc", // slate-50/100
      secondary: "#ffffff", // white
      tertiary: "rgba(148, 163, 184, 0.06)", // slate-200/6 with opacity
    },
    dark: {
      primary: "#09090b", // near-black
      secondary: "rgba(15, 23, 42, 0.8)", // slate-900/80
      tertiary: "rgba(2, 8, 23, 0.5)", // slate-950/50
    },
  },

  // ===== HEADING COLORS =====
  heading: {
    light: {
      primary: "#0f172a", // slate-900
      secondary: "#334155", // slate-700
      tertiary: "#64748b", // slate-500
    },
    dark: {
      primary: "#ffffff", // white
      secondary: "#e2e8f0", // slate-200
      tertiary: "#cbd5e1", // slate-300
    },
  },

  // ===== BODY TEXT COLORS =====
  text: {
    light: {
      primary: "#1e293b", // slate-800
      secondary: "#475569", // slate-600
      tertiary: "#64748b", // slate-500
      muted: "#94a3b8", // slate-400
    },
    dark: {
      primary: "#f1f5f9", // slate-100
      secondary: "#cbd5e1", // slate-300
      tertiary: "#94a3b8", // slate-400
      muted: "#64748b", // slate-500
    },
  },

  // ===== INPUT & FORM COLORS =====
  input: {
    light: {
      background: "#f1f5f9", // slate-50
      border: "#e2e8f0", // slate-200
      borderFocus: "#06b6d4", // cyan-500
      text: "#0f172a", // slate-900
      placeholder: "#94a3b8", // slate-400
    },
    dark: {
      background: "rgba(30, 41, 59, 0.6)", // slate-800/60
      border: "#1e293b", // slate-700
      borderFocus: "#06b6d4", // cyan-500
      text: "#f1f5f9", // slate-100
      placeholder: "#64748b", // slate-500
    },
  },

  // ===== BORDER COLORS =====
  border: {
    light: {
      primary: "#e2e8f0", // slate-200
      secondary: "#cbd5e1", // slate-300
      subtle: "rgba(226, 232, 240, 0.6)", // slate-200/60
    },
    dark: {
      primary: "#1e293b", // slate-700
      secondary: "#0f172a", // slate-800
      subtle: "rgba(15, 23, 42, 0.5)", // slate-800/50
    },
  },

  // ===== PRIMARY ACTIONS (Buttons) =====
  primary: {
    light: {
      background: "#06b6d4", // cyan-600
      backgroundHover: "#0891b2", // cyan-700
      text: "#ffffff",
      border: "#06b6d4",
    },
    dark: {
      background: "#06b6d4", // cyan-600
      backgroundHover: "#0891b2", // cyan-700
      text: "#ffffff",
      border: "#06b6d4",
    },
  },

  // ===== SECONDARY ACTIONS =====
  secondary: {
    light: {
      background: "#f1f5f9", // slate-50
      backgroundHover: "#e2e8f0", // slate-200
      text: "#0f172a", // slate-900
      border: "#e2e8f0", // slate-200
    },
    dark: {
      background: "rgba(30, 41, 59, 0.5)", // slate-800/50
      backgroundHover: "#1e293b", // slate-700
      text: "#f1f5f9", // slate-100
      border: "#1e293b", // slate-700
    },
  },

  // ===== STATUS & FEEDBACK COLORS =====
  success: {
    light: {
      background: "rgba(34, 197, 94, 0.1)", // green-500/10
      border: "#86efac", // green-300
      text: "#166534", // green-900
    },
    dark: {
      background: "rgba(34, 197, 94, 0.1)", // green-500/10
      border: "#22c55e", // green-500
      text: "#86efac", // green-300
    },
  },
  error: {
    light: {
      background: "#fef2f2", // red-50
      border: "#fecaca", // red-200
      text: "#dc2626", // red-600
    },
    dark: {
      background: "rgba(127, 29, 29, 0.3)", // red-950/30
      border: "#7f1d1d", // red-900/50
      text: "#fca5a5", // red-300
    },
  },
  warning: {
    light: {
      background: "rgba(234, 179, 8, 0.1)", // amber-500/10
      border: "#fde047", // amber-300
      text: "#92400e", // amber-900
    },
    dark: {
      background: "rgba(234, 179, 8, 0.1)", // amber-500/10
      border: "#eab308", // amber-500
      text: "#fde047", // amber-300
    },
  },
  info: {
    light: {
      background: "rgba(3, 102, 214, 0.1)", // blue-600/10
      border: "#93c5fd", // blue-300
      text: "#1e40af", // blue-900
    },
    dark: {
      background: "rgba(3, 102, 214, 0.1)", // blue-600/10
      border: "#3b82f6", // blue-500
      text: "#93c5fd", // blue-300
    },
  },

  // ===== ACCENT COLORS =====
  accent: {
    light: {
      cyan: "#06b6d4", // cyan-600
      indigo: "#4f46e5", // indigo-600
      purple: "#9333ea", // purple-600
      amber: "#d97706", // amber-600
    },
    dark: {
      cyan: "#06b6d4", // cyan-600
      indigo: "#6366f1", // indigo-500
      purple: "#a855f7", // purple-500
      amber: "#f59e0b", // amber-500
    },
  },

  // ===== SHADOWS =====
  shadow: {
    light: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      cyan: "0 0 20px rgba(6, 182, 212, 0.2)", // cyan glow
    },
    dark: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.6)",
      cyan: "0 0 20px rgba(6, 182, 212, 0.15)", // cyan glow
    },
  },
};

type ColorPalette = typeof colorPalette;
type ColorCategory = keyof ColorPalette;

type ThemeColors<C extends ColorCategory> =
  ColorPalette[C] extends { light: infer L; dark: infer D }
    ? L & D
    : never;

type ColorType<C extends ColorCategory> = keyof ThemeColors<C>;

export const getColor = <C extends ColorCategory>(
  isDark: boolean,
  colorCategory: C,
  colorType: ColorType<C>
): string => {
  const category = colorPalette[colorCategory];
  const themeColors = (isDark ? category.dark : category.light) as Record<string, string>;
  return themeColors[colorType as string] ?? "#000000";
};
