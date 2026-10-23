// Used only by the build (scripts/prerender.mjs): renders a page to HTML so that search engines and visitors
// get the content immediately, before any JavaScript runs.
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App.jsx";
import { LanguageProvider } from "./i18n/LanguageContext.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </StaticRouter>
  );
}
