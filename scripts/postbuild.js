import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const indexPath = path.join(distDir, "index.html");

if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, "utf-8");

  // Vercel serves 404.html for any unmatched path — this ensures deep dynamic routes work
  fs.writeFileSync(path.join(distDir, "404.html"), indexHtml);

  // Generate physical index.html for all primary routes so Vercel returns HTTP 200
  const routes = [
    "admin",
    "dashboard",
    "dashboard/agents",
    "dashboard/companions",
    "dashboard/staking",
    "dashboard/leaderboard",
    "dashboard/alerts",
    "dashboard/profile",
    "about",
    "help",
    "accessibility",
    "contact",
    "privacy",
    "terms",
  ];

  for (const route of routes) {
    const routeDir = path.join(distDir, route);
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, "index.html"), indexHtml);
  }

  console.log(`✅ Generated SPA route fallbacks and 404.html for ${routes.length} routes.`);
} else {
  console.warn("⚠️ dist/index.html not found, skipping SPA route generation.");
}
