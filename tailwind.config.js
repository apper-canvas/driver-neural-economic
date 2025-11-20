/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        secondary: {
          DEFAULT: "#475569",
          50: "#f8fafc",
          100: "#f1f5f9",
          400: "#94a3b8",
          500: "#475569",
          600: "#334155",
        },
        accent: {
          DEFAULT: "#f59e0b",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
        },
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
}