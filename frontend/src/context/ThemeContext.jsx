import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "portfolioPrimaryColor";

export const PRIMARY_COLOR_GROUPS = [
  {
    label: "Default",
    colors: [
      { id: "default", label: "Default", value: "#915eff", rgb: "145 94 255" },
    ],
  },
  {
    label: "Warm",
    colors: [
      { id: "red", label: "Red", value: "#ef4444", rgb: "239 68 68" },
      { id: "orange", label: "Orange", value: "#f97316", rgb: "249 115 22" },
      { id: "yellow", label: "Yellow", value: "#eab308", rgb: "234 179 8" },
    ],
  },
  {
    label: "Cool",
    colors: [
      { id: "blue", label: "Blue", value: "#3b82f6", rgb: "59 130 246" },
      { id: "green", label: "Green", value: "#22c55e", rgb: "34 197 94" },
      { id: "purple", label: "Purple", value: "#a855f7", rgb: "168 85 247" },
    ],
  },
];

const DEFAULT_COLOR_ID = "default";
const SECONDARY_COLOR = "#22d3ee";
const ALL_COLORS = PRIMARY_COLOR_GROUPS.flatMap((group) => group.colors);

const ThemeContext = createContext(null);

function getColorById(id) {
  return ALL_COLORS.find((color) => color.id === id) || ALL_COLORS.find((color) => color.id === DEFAULT_COLOR_ID);
}

function applyTheme(color) {
  const root = document.documentElement;
  root.style.setProperty("--primary-color", color.value);
  root.style.setProperty("--primary-rgb", color.rgb);
  root.style.setProperty("--secondary-color", SECONDARY_COLOR);
  root.style.setProperty("--background-color", "#050816");
  root.style.setProperty("--surface-color", "rgba(255, 255, 255, 0.055)");
  root.style.setProperty("--text-color", "#ffffff");
  root.style.setProperty("--muted-text", "#aaaaaa");
  root.style.setProperty("--primary", color.value);
  root.style.setProperty("--secondary", SECONDARY_COLOR);
}

export function ThemeProvider({ children }) {
  const [primaryId, setPrimaryId] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_COLOR_ID;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR_ID;
  });

  const primaryColor = useMemo(() => getColorById(primaryId), [primaryId]);

  useEffect(() => {
    applyTheme(primaryColor);
    localStorage.setItem(STORAGE_KEY, primaryColor.id);
  }, [primaryColor]);

  const value = useMemo(
    () => ({
      primaryId: primaryColor.id,
      primaryColor,
      groups: PRIMARY_COLOR_GROUPS,
      setPrimaryId,
      secondaryColor: SECONDARY_COLOR,
    }),
    [primaryColor]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
