import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1E2A22",
        paper: "#F3EFE6",
        paper2: "#EAE3D2",
        brass: "#B8892B",
        brassDark: "#8F6A1F",
        forest: "#3F5D46",
        forestDark: "#2C4232",
        line: "#C9BFA8",
        muted: "#6B6455",
      },
      fontFamily: {
        tajawal: ["var(--font-tajawal)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
