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
import NotFound from "../pages/NotFound.jsx";

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/avis" element={<Reviews />} />
      <Route path="/faq" element={<FAQs />} />
      <Route path="/galerie" element={<Gallery />} />
      <Route path="/devis" element={<Quote />} />
      <Route path="/connexion" element={<Auth mode="login" />} />
      <Route path="/inscription" element={<Auth mode="signup" />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}
