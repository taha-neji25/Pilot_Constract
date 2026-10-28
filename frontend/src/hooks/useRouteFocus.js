import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// A single-page site does not reload when the visitor changes page, so keyboard and screen-reader users would stay
// where they were. On each page change: scroll to the top and move focus to the new page's main heading.
export function useRouteFocus() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false; // not on the first load
      return;
    }
    window.scrollTo(0, 0);
    const h1 = document.querySelector("main h1");
    if (h1) {
      h1.setAttribute("tabindex", "-1");
      h1.focus({ preventScroll: true });
    }
  }, [pathname]);
}
