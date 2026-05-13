import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sg: {
          amber: "#d97706",
          sand: "#fffbeb",
        },
      },
    },
  },
  plugins: [],
}

export default config
