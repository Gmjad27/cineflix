import React, { useRef } from 'react';

const LiveRailRow = ({
  tag = null, // 'LIVE' | 'TV' | null
  title = '',
  items = [],
  renderItem,
  className = '',
}) => {
  const trackRef = useRef(null);

  const scrollByDirection = (direction) => {
    if (!trackRef.current) return;
    const scrollAmount = trackRef.current.clientWidth * 0.75;
    trackRef.current.scrollBy({
      left: scrollAmount * direction,
      behavior: 'smooth',
    });
  };

  if (!items || items.length === 0) return null;

  const isTvTag = tag === 'TV';

  return (
    <section className={`relative flex flex-col mb-7 sm:mb-9 ${className}`}>
      {/* ── ROW HEADER (Matching Reference Image) ── */}
      <div className="flex items-center justify-between mb-3 px-1 sm:px-0">
        <div className="flex items-center select-none">
          {tag && (
            <span
              className={`${
                isTvTag ? 'text-[#ff5722]' : 'text-[#e50914]'
              } font-black text-xs sm:text-sm tracking-wider uppercase mr-1.5`}
            >
              {tag}
            </span>
          )}
          <span
            className={`${
              isTvTag ? 'text-[#ff5722]/80' : 'text-[#e50914]/80'
            } font-light text-base sm:text-lg mr-2`}
          >
            |
          </span>
          <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
            {title}
          </h2>
        </div>

        {/* ── CIRCULAR SCROLL ARROWS: ( < ) ( > ) ── */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollByDirection(-1)}
            aria-label={`Scroll ${title} left`}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 bg-black/60 hover:bg-white/15 hover:border-white/40 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer active:scale-90"
          >
            <i className="fa-solid fa-chevron-left text-[10px] sm:text-xs" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDirection(1)}
            aria-label={`Scroll ${title} right`}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 bg-black/60 hover:bg-white/15 hover:border-white/40 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer active:scale-90"
          >
            <i className="fa-solid fa-chevron-right text-[10px] sm:text-xs" />
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE CARDS TRACK ── */}
      <div
        ref={trackRef}
        className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x py-1 px-1 sm:px-0"
      >
        {items.map((item, idx) => renderItem(item, idx))}
      </div>
    </section>
  );
};

export default React.memo(LiveRailRow);
