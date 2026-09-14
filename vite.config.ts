import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // o1js proves inside a worker that wants SharedArrayBuffer, which the
    // browser only hands to a cross-origin-isolated page. Without these two
    // headers the prover falls back to single-threaded and takes several
    // times longer, or fails outright depending on the browser.
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  // o1js ships WASM and top-level await. Pre-bundling it breaks both, and
  // the default build target is too old to emit top-level await at all.
  optimizeDeps: {
    exclude: ["o1js"],
    esbuildOptions: { target: "esnext" },
  },
  build: {
    target: "esnext",
  },
  worker: {
    format: "es",
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
