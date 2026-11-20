import React, { useState, useRef, useCallback, useEffect } from 'react';

function HeroBanner({ mediaData, currentHero, heroIndex, setHeroIndex, openWatch }) {
  const slides = mediaData && mediaData.length ? mediaData : currentHero ? [currentHero] : [];
  const totalSlides = slides.length;

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState(0);

  const containerRef = useRef(null);
  const hasMovedRef = useRef(false);

  // Reset drag offset when slide changes externally (e.g. auto-play timer)
  useEffect(() => {
    setDragOffset(0);
  }, [heroIndex]);

  const handlePointerDown = useCallback((e) => {
    if (e.button && e.button !== 0) return;

    setIsDragging(true);
    hasMovedRef.current = false;

    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

    setDragStart({ x: clientX, y: clientY });
    setDragOffset(0);
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
      if (clientX === undefined || clientY === undefined) return;

      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;

      if (Math.abs(deltaX) > 5) {
        hasMovedRef.current = true;
      }

      // Let browser handle vertical scrolling naturally
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
        setIsDragging(false);
        setDragOffset(0);
        return;
      }

      const maxDelta = containerRef.current ? containerRef.current.offsetWidth : window.innerWidth;
      setDragOffset(Math.max(-maxDelta, Math.min(maxDelta, deltaX)));
    },
    [isDragging, dragStart]
  );

  const finishDrag = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = containerRef.current ? containerRef.current.offsetWidth * 0.15 : 65;

    if (dragOffset < -threshold && heroIndex < totalSlides - 1) {
      setHeroIndex(heroIndex + 1);
    } else if (dragOffset > threshold && heroIndex > 0) {
      setHeroIndex(heroIndex - 1);
    } else {
      setDragOffset(0);
    }
  }, [isDragging, dragOffset, heroIndex, totalSlides, setHeroIndex]);

  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', finishDrag);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', finishDrag);
    window.addEventListener('touchcancel', finishDrag);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', finishDrag);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', finishDrag);
      window.removeEventListener('touchcancel', finishDrag);
    };
  }, [isDragging, handlePointerMove, finishDrag]);

  const handleActionClick = (e, id) => {
    e.stopPropagation();
    if (hasMovedRef.current) return;
    openWatch(id);
  };

  const baseTranslate = -heroIndex * 100;
  const containerWidth = containerRef.current?.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth : 1);
  const dragTranslate = (dragOffset / containerWidth) * 100;
  const translateX = baseTranslate + dragTranslate;

  if (!slides.length) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured titles"
      className="relative w-full h-[42vh] min-h-[35y0px] max-h-[560px] sm:h-[75vh] sm:max-h-none md:h-[85vh] lg:h-[94vh] overflow-hidden bg-[#141414] select-none touch-pan-y group"
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onMouseLeave={finishDrag}
    >
      {/* Slide Track */}
      <div
        ref={containerRef}
        className="flex h-full w-full will-change-transform"
        style={{
          transform: `translate3d(${translateX}%, 0, 0)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {slides.map((slide, idx) => {
          const isActive = idx === heroIndex;

          return (
            <div
              key={slide.id || idx}
              className="relative min-w-full h-full shrink-0 overflow-hidden"
              aria-hidden={!isActive}
            >
              {/* Background Media with Subtle Desktop Zoom */}
              <picture className="absolute inset-0 w-full h-full">
                <source media="(min-width: 768px)" srcSet={slide.img} />
                <img
                  src={slide.img}
                  alt={slide.name2 || 'Featured Title'}
                  className={`w-full h-full object-cover object-top transition-transform duration-[10000ms] ease-out ${
                    isActive ? 'sm:scale-105' : 'scale-100'
                  }`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  draggable="false"
                />
              </picture>

              {/* Signature Vignettes & Gradients */}
              {/* 1. Top Navbar Shadow */}
              <div className="absolute inset-x-0 top-0 h-24 sm:h-28 bg-gradient-to-b from-black/85 via-black/35 to-transparent pointer-events-none" />
              {/* 2. Left Side Dark Vignette for Text Readability */}
              <div className="absolute inset-y-0 left-0 w-full md:w-[68%] bg-gradient-to-r from-[#141414]/95 via-[#141414]/55 to-transparent pointer-events-none" />
              {/* 3. Bottom Seamless Blend into #141414 Background */}
              <div className="absolute inset-x-0 bottom-0 h-44 sm:h-52 md:h-64 bg-gradient-to-t from-[#141414] via-[#141414]/85 to-transparent pointer-events-none" />

              {/* Left Content Stack (Billboard Info) */}
              <div className="absolute bottom-[9%] sm:bottom-[16%] md:bottom-[20%] left-0 w-full px-4 sm:px-8 md:px-12 lg:px-16 z-10 flex flex-col items-start max-w-full md:max-w-[62%] lg:max-w-[50%] pointer-events-none">
                {/* Brand + Media Type Badge */}
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2 md:mb-3">
                  <span className="font-black text-[#E50914] text-lg sm:text-2xl md:text-3xl tracking-tighter leading-none drop-shadow-md">
                    C
                  </span>
                  <span className="text-gray-300 font-bold tracking-[0.25em] text-[10px] sm:text-xs md:text-sm uppercase drop-shadow">
                    {slide.type === 'tv' ? 'Series' : slide.type || 'Film'}
                  </span>
                </div>

                {/* Title Logo or Fallback Text */}
                {slide.nameImg2 ? (
                  <img
                    src={slide.nameImg2}
                    alt={slide.name2}
                    className="w-auto max-h-[56px] sm:max-h-[95px] md:max-h-[125px] lg:max-h-[145px] max-w-[78%] sm:max-w-[85%] object-contain object-left mb-2.5 sm:mb-3 md:mb-5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]"
                    draggable="false"
                  />
                ) : (
                  <h1 className="text-1xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-2.5 sm:mb-3 md:mb-5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] line-clamp-2">
                    {slide.name2}
                  </h1>
                )}

                {/* Top 10 Badge + Rank */}
                <div className="flex items-center gap-2 sm:gap-2.5 mb-3 md:mb-4">
                  <div className="flex flex-col items-center justify-center bg-[#E50914] text-white font-black px-1.5 py-0.5 rounded-[2px] leading-none shadow-md">
                    <span className="text-[6px] sm:text-[7px] md:text-[8px] tracking-tighter">
                      TOP
                    </span>
                    <span className="text-[10px] sm:text-[11px] md:text-xs">10</span>
                  </div>
                  <span className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-white drop-shadow-md">
                    #{idx + 1} in {slide.type === 'tv' ? 'Shows' : 'Movies'} Today
                  </span>
                </div>

                {/* Synopsis (Tablet & Desktop) */}
                {slide.desc && (
                  <p className="hidden sm:line-clamp-3 text-xs sm:text-sm md:text-base lg:text-lg text-white/90 font-normal leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mb-5 md:mb-6 max-w-xl">
                    {slide.desc}
                  </p>
                )}

                {/* Action Buttons (Touch-friendly, no sticky mobile hover) */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto pointer-events-auto">
                  {/* Primary Play Button */}
                  <button
                    type="button"
                    onClick={(e) => handleActionClick(e, slide.id)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white text-black font-bold text-xs sm:text-base md:text-lg px-4 sm:px-7 py-1 md:py-3 rounded-[4px] shadow-lg cursor-pointer transition-all duration-150 active:scale-[0.97] active:bg-white/80 sm:hover:bg-white/85"
                  >
                    <i className="fa-solid fa-play text-sm sm:text-lg md:text-xl" />
                    <span>Play</span>
                  </button>

                  {/* Secondary More Info Button */}
                  <button
                    type="button"
                    onClick={(e) => handleActionClick(e, slide.id)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#6d6d6e]/75 text-white font-bold text-xs sm:text-base md:text-lg px-4 sm:px-7 py-1 md:py-3 rounded-[4px] backdrop-blur-sm shadow-lg cursor-pointer transition-all duration-150 active:scale-[0.97] active:bg-[#6d6d6e]/50 sm:hover:bg-[#6d6d6e]/50"
                  >
                    <i className="fa-solid fa-circle-info text-sm sm:text-lg md:text-xl" />
                    <span>More Info</span>
                  </button>
                </div>
              </div>

              {/* Right Side Maturity Rating Badge (Tablet & Desktop) */}
              <div className="hidden sm:flex absolute bottom-[30%] md:bottom-[34%] right-0 items-center z-20 pointer-events-none">
                <div className="bg-[#333333]/70 border-l-[3px] border-white/80 py-1.5 pl-3 pr-6 md:pr-10 text-white text-xs md:text-sm font-semibold backdrop-blur-sm">
                  {slide.ua || slide.maturity || 'U/A 16+'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop-Only Previous / Next Arrows */}
      {totalSlides > 1 && (
        <>
          {heroIndex > 0 && (
            <button
              type="button"
              aria-label="Previous featured title"
              onClick={(e) => {
                e.stopPropagation();
                setHeroIndex((prev) => Math.max(0, prev - 1));
              }}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/45 text-white/80 items-center justify-center border border-white/15 opacity-0 md:group-hover:opacity-100 md:hover:bg-black/75 md:hover:text-white transition-all cursor-pointer"
            >
              <i className="fa-solid fa-chevron-left text-sm" />
            </button>
          )}
          {heroIndex < totalSlides - 1 && (
            <button
              type="button"
              aria-label="Next featured title"
              onClick={(e) => {
                e.stopPropagation();
                setHeroIndex((prev) => Math.min(totalSlides - 1, prev + 1));
              }}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/45 text-white/80 items-center justify-center border border-white/15 opacity-0 md:group-hover:opacity-100 md:hover:bg-black/75 md:hover:text-white transition-all cursor-pointer"
            >
              <i className="fa-solid fa-chevron-right text-sm" />
            </button>
          )}
        </>
      )}

      {/* Slide Progress Indicators */}
      {totalSlides > 1 && (
        <div
          role="tablist"
          aria-label="Featured slides"
          className="absolute bottom-3 sm:bottom-[10%] md:bottom-[14%] right-4 sm:right-8 md:right-12 lg:right-16 z-20 flex items-center gap-1.5"
        >
          {slides.map((slide, idx) => {
            const isActive = idx === heroIndex;
            return (
              <button
                key={slide.id || idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Slide ${idx + 1}: ${slide.name2 || 'Featured'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setHeroIndex(idx);
                }}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-5 sm:w-6 bg-[#E50914]'
                    : 'w-2 sm:w-2.5 bg-white/35 sm:hover:bg-white/60'
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export default React.memo(HeroBanner);