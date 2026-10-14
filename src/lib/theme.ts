export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export const THEME_COLORS: Record<Theme, string> = {
  light: "#f6f8ff",
  dark: "#141d2f",
};

export const applyStoredTheme = `{let t;try{t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch{}if(t!=="dark"&&t!=="light")t=matchMedia("${DARK_SCHEME_QUERY}").matches?"dark":"light";document.documentElement.dataset.theme=t;const m=document.createElement("meta");m.name="theme-color";m.content=${JSON.stringify(THEME_COLORS)}[t];document.head.append(m)}`;
