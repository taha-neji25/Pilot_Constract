// GitHub Pages has no server-side routing: a refresh on /devis would 404. Pages serves 404.html for unknown
// paths, so a copy of index.html there lets React Router render the right page (also .nojekyll + CNAME are in public/).
import fs from "node:fs";

fs.copyFileSync("dist/index.html", "dist/404.html");
console.log("dist/404.html written (SPA fallback for GitHub Pages)");
