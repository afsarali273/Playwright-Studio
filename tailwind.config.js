/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#135bec",
        "primary-hover": "#0f4bc4",
        "background-light": "#f6f6f8",
        "background-dark": "#0f1117",
        "surface-dark": "#181b25",
        "surface-lighter": "#232736",
        "border-dark": "#2e3445",
        "code-bg": "#1e2029",
        "syntax-keyword": "#c678dd",
        "syntax-string": "#98c379",
        "syntax-func": "#61afef",
        "syntax-comment": "#5c6370",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"],
      },
      borderRadius: {"DEFAULT": "0.25rem", "md": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
    },
  },
  plugins: [],
}
