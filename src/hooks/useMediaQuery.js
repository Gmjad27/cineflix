import { useEffect, useState } from 'react';

/**
 * Reactive matchMedia hook. The old pattern —
 *   const media = window.matchMedia('(max-width: 768px)')
 * — runs on every single render (forced style recalculation) and never
 * updates the component when the viewport actually crosses the breakpoint
 * (e.g. rotating a tablet, resizing a desktop window). This hook computes
 * the value once, then only re-renders when the media query actually
 * flips, via the native 'change' event.
 */
export default function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return undefined;
    const mql = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);

    setMatches(mql.matches);

    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler); // Safari < 14 fallback

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
  }, [query]);

  return matches;
}