import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Skeleton from '../../components/Skeleton/Skeleton';
import { getWatchPath, navigateToWatch } from '../../utils/watchNavigation';

// Memoized Card to prevent unnecessary re-renders
const MemoizedCard = memo(Card, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.img === nextProps.img &&
    prevProps.name === nextProps.name
  );
});

const MovieViewAll = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Page State
  const [items, setItems] = useState([]);
  const [pageTitle, setPageTitle] = useState('Full Library');
  const [visibleCount, setVisibleCount] = useState(24); // Pagination: initial items to show

  // Stabilize props.data with useMemo
  const appData = useMemo(() => Array.isArray(props.data) ? props.data : [], [props.data]);

  // Combined lookup array (URL items + Global App Data)
  const combinedData = useMemo(() => {
    return [...items, ...appData];
  }, [items, appData]);

  // Parse items and title from URL
  useEffect(() => {
    const itemsParam = searchParams.get('items');
    const titleParam = searchParams.get('title');

    if (titleParam) {
      setPageTitle(titleParam);
    }

    if (itemsParam) {
      try {
        const parsedItems = JSON.parse(itemsParam);
        setItems(parsedItems);
        // Reset visibleCount when new items are loaded
        setVisibleCount(24);
      } catch (error) {
        console.error("Error parsing items from URL:", error);
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, [searchParams]);

  // ==========================================
  // Watch Page Navigation
  // ==========================================
  const openWatch = useCallback(
    (id, fallbackType) => {
      if (!id) return;
      const selected = combinedData.find((item) => String(item.id) === String(id));
      navigateToWatch(navigate, {
        itemOrId: id,
        fallbackType,
        item: selected,
        currentLocation: location,
      });
    },
    [combinedData, navigate, location]
  );

  // Redirect legacy ?watch= deep-link inside ViewAll
  useEffect(() => {
    const watchId = searchParams.get('watch');
    if (watchId) {
      navigate(getWatchPath(watchId), { replace: true });
    }
  }, [searchParams, navigate]);

  // Pagination handler
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 24, items.length));
  }, [items.length]);

  // Visible items slice
  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  return (
    <div className="min-h-screen bg-[#07070a] text-white font-sans selection:bg-[#E50914] selection:text-white pb-24">

      {/* ─── Cinematic Header ─── */}
      <header className="relative pt-24 pb-8 px-6 md:px-12 lg:px-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-transparent border-b border-white/[0.08]">
        <div className="max-w-[1600px] mx-auto flex items-center gap-5 sm:gap-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center w-12 h-12 rounded-2xl glass-mirror hover:border-white/40 transition-all duration-300 hover:-translate-x-1 shadow-glass-sm cursor-pointer"
            aria-label="Go back"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300 group-hover:text-white transition-colors"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>

          <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent hidden sm:block"></div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight drop-shadow-sm truncate">
            {pageTitle}
          </h1>
        </div>
      </header>

      {/* ─── Grid Content ─── */}
      <main className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 pt-12">
        {props.loading || (items.length === 0 && searchParams.get('items')) ? (
          <Skeleton type="card" count={24} />
        ) : visibleItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10 animate-[fadeIn_0.5s_ease-out]">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="w-full flex justify-center transition-transform duration-300 hover:scale-105 hover:z-10 will-change-transform"
                >
                  <MemoizedCard
                    sow={openWatch}
                    id={item.id}
                    img={item.name}
                    name={item.name2}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < items.length && (
              <div className="flex justify-center mt-14">
                <button
                  onClick={loadMore}
                  className="glass-btn-secondary px-8 py-3.5 text-white font-semibold rounded-2xl transition-all duration-300 shadow-glass-sm active:scale-95 cursor-pointer"
                >
                  Load More ({items.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          /* ─── Premium Glass Empty State ─── */
          <div className="glass-modal max-w-lg mx-auto p-12 rounded-3xl text-center border border-white/10 shadow-glass-md my-16 animate-[fadeIn_0.5s_ease-out]">
            <div className="w-20 h-20 glass-mirror rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-glass-sm text-gray-400">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">No titles found</h2>
            <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-8 font-light">
              There are currently no titles available in this collection. Try exploring a different category or return home.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="glass-btn-primary px-8 py-3.5 text-white font-bold rounded-2xl shadow-neon-red active:scale-95 cursor-pointer"
            >
              Explore Something Else
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MovieViewAll;