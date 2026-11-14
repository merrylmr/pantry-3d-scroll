import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// base "./" so the build also works from a sub-path such as GitHub Pages
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
})
