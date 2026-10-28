import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { useSeo } from "./seo/useSeo.js";
import { useRouteFocus } from "./hooks/useRouteFocus.js";
import { useLanguage } from "./i18n/LanguageContext.jsx";

export default function App() {
  useSeo();
  useRouteFocus();
  const { t } = useLanguage();
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        {t.nav.skip}
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
