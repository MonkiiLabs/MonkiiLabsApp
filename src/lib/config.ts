export const API_BASE_URL =
  // Your project env provides BACKEND_URL for easy switching (prod/stage/local).
  // Prefer that, but allow older Vite-style env var names too.
  (import.meta.env.BACKEND_URL?.toString() ||
    import.meta.env.VITE_BACKEND_URL?.toString() ||
    import.meta.env.VITE_API_BASE_URL?.toString() ||
    "").replace(/\/$/, "");

