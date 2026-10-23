import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { useSeo } from "./seo/useSeo.js";

export default function App() {
  useSeo();
  return (
    <div className="app">
      <Navbar />
      <main>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
