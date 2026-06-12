/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        "primary-light": "#A78BFA",
        accent: "#3B82F6",
        background: "#020617",
        secondary: "#0F172A",
        card: "#1E293B",
        foreground: "#F8FAFC",
        "muted-foreground": "#94A3B8",
        danger: "#EF4444",
      },
      borderRadius: {
        card: "20px",
        button: "16px",
        input: "14px",
        sheet: "28px",
      },
    },
  },
  plugins: [],
};
