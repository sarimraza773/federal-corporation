import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use BASE_PATH for GitHub Pages project sites (e.g., "/repo-name/").
// Defaults to "/" for local dev and deployments at the domain root.
const base = process.env.BASE_PATH || '/';

const allowViteDevelopmentStyles = {
  name: 'allow-vite-development-styles',
  apply: 'serve',
  transformIndexHtml(html) {
    return html.replace(
      "style-src 'self';",
      "style-src 'self' 'unsafe-inline';",
    );
  },
};

export default defineConfig({
  plugins: [react(), allowViteDevelopmentStyles],
  base,
});
