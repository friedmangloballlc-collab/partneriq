import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint}px)`;

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(query).matches
      : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setIsMobile(e.matches);
    // Use addEventListener if available (modern), fall back to addListener
    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    } else {
      // Safari < 14 fallback
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, [query]);

  return isMobile;
}
