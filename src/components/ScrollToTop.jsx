import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, state } = useLocation();
  const prevWasModalRef = useRef(false);

  useEffect(() => {
    const isModalPopup = Boolean(state?.backgroundLocation);
    const wasModalPopup = prevWasModalRef.current;
    prevWasModalRef.current = isModalPopup;

    // Preserve background page scroll position when opening or closing a desktop popup modal
    if (isModalPopup || wasModalPopup) return;

    window.scrollTo(0, 0);
  }, [pathname, state]);

  return null;
}
