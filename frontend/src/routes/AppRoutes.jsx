import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Services from "../pages/Services.jsx";
import Reviews from "../pages/Reviews.jsx";
import FAQs from "../pages/FAQs.jsx";
import Gallery from "../pages/Gallery.jsx";
import Quote from "../pages/Quote.jsx";
const Auth = lazy(() => import("../pages/Auth.jsx"));
const Admin = lazy(() => import("../pages/Admin.jsx"));
import ServicePage from "../pages/ServicePage.jsx";
import { GuidePage, GuidesIndex } from "../pages/Guides.jsx";
import NotFound from "../pages/NotFound.jsx";
import { GUIDE_IDS, LANGS, SERVICE_IDS, guidePage, pathFor, servicePage } from "../seo/routes.js";

// page key (see seo/routes.js) -> component
const PAGES = {
  home: Home,
  services: Services,
  reviews: Reviews,
  faq: FAQs,
  gallery: Gallery,
  quote: Quote,
  login: () => <Auth mode="login" />,
  signup: () => <Auth mode="signup" />,
  admin: Admin,
  ...Object.fromEntries(SERVICE_IDS.map((id) => [servicePage(id), () => <ServicePage id={id} />])),
  guides: GuidesIndex,
  ...Object.fromEntries(GUIDE_IDS.map((id) => [guidePage(id), () => <GuidePage id={id} />])),
};

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* every page exists in each language: /services, /en/services, /ar/services ... */}
        {LANGS.flatMap((lang) =>
          Object.entries(PAGES).map(([page, Page]) => <Route key={`${lang}-${page}`} path={pathFor(page, lang)} element={<Page />} />)
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
