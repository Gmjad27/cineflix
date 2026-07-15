import { useEffect, useRef, useState } from 'react';

/**
 * Defers rendering of off-screen content until it's about to enter the
 * viewport. On pages with many rails (Home/Movie/Tv), mounting every card
 * in every rail up front is the single biggest cause of first-paint jank.
 * This lets each rail render a lightweight placeholder until it's ~400px
 * away from the viewport, then swaps in the real content permanently.
 */
export default function useInView(rootMargin = '400px 0px') {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (inView || !node) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for environments without IO support: render immediately.
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootMargin]);

  return [ref, inView];
}