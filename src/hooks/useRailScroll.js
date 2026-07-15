import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Centralizes horizontal-rail scroll bookkeeping (arrow visibility, click-
 * to-scroll, resize sync) so Home / Movie / Tv / Search don't each carry a
 * slightly different copy.
 *
 * Perf fix vs. the original per-page implementations: `onScroll` used to
 * call `setState` synchronously on *every* scroll event — on a fast trackpad
 * or momentum-scroll on mobile that's 50-100+ re-renders a second, which is
 * the main source of the "laggy" feel. Here, scroll events are coalesced
 * with requestAnimationFrame so state updates happen at most once per
 * painted frame. Resize handling is similarly rAF-batched instead of firing
 * a full rail re-measure per resize tick.
 */
export function useRailScroll(railKeys = []) {
  const trackRefs = useRef({});
  const [scrollState, setScrollState] = useState({});
  const scrollFrame = useRef({});
  const resizeFrame = useRef(null);

  const measure = useCallback((railKey) => {
    const el = trackRefs.current[railKey];
    if (!el) return;
    const atStart = el.scrollLeft <= 4;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const canScroll = el.scrollWidth > el.clientWidth + 4;
    setScrollState((prev) => {
      const existing = prev[railKey];
      if (existing && existing.atStart === atStart && existing.atEnd === atEnd && existing.canScroll === canScroll) {
        return prev;
      }
      return { ...prev, [railKey]: { atStart, atEnd, canScroll } };
    });
  }, []);

  // Use this as the onScroll handler — it's throttled to one measurement
  // per animation frame instead of firing on every scroll delta.
  const onRailScroll = useCallback((railKey) => {
    if (scrollFrame.current[railKey]) return;
    scrollFrame.current[railKey] = requestAnimationFrame(() => {
      scrollFrame.current[railKey] = null;
      measure(railKey);
    });
  }, [measure]);

  // direction: -1 for left/previous, 1 for right/next. Computes the scroll
  // distance from the track's own width so callers never need direct
  // access to the DOM node.
  const handleRailScroll = useCallback((railKey, direction) => {
    const el = trackRefs.current[railKey];
    if (!el) return;
    const offset = (el.clientWidth || 600) * 0.85 * direction;
    el.scrollBy({ left: offset, behavior: 'smooth' });
    window.setTimeout(() => measure(railKey), 350);
  }, [measure]);

  const setTrackRef = useCallback((railKey) => (node) => {
    trackRefs.current[railKey] = node;
  }, []);

  const keysSignature = railKeys.join('|');

  useEffect(() => {
    railKeys.forEach((key) => measure(key));

    const handleResize = () => {
      if (resizeFrame.current) cancelAnimationFrame(resizeFrame.current);
      resizeFrame.current = requestAnimationFrame(() => {
        railKeys.forEach((key) => measure(key));
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeFrame.current) cancelAnimationFrame(resizeFrame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysSignature, measure]);

  return { trackRefs, scrollState, setTrackRef, onRailScroll, handleRailScroll, measure };
}

export default useRailScroll;