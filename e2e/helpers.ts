import { DEFAULT_THEME } from "../lib/theme";

/** "#c2410c" -> "rgb(194, 65, 12)", the form the browser reports colours in. */
export const rgb = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};

export const COLORS = DEFAULT_THEME.colors;
