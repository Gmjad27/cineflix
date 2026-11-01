import React, { useState, useRef, useCallback, useEffect } from 'react';

function HeroBanner({ mediaData, currentHero, heroIndex, setHeroIndex, openWatch }) {
    const slides = mediaData && mediaData.length ? mediaData : (currentHero ? [currentHero] : []);
    const totalSlides = slides.length;

    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState(0);
    const [isMuted, setIsMuted] = useState(true);

    const containerRef = useRef(null);
    const hasMovedRef = useRef(false); // Prevents accidental button clicks while swiping

    // Reset drag offset when slide changes externally (e.g. auto-play timer)
    useEffect(() => {
        setDragOffset(0);
    }, [heroIndex]);

    const handlePointerDown = useCallback((e) => {
        // Ignore right-clicks
        if (e.button && e.button !== 0) return;

        setIsDragging(true);
        hasMovedRef.current = false;

        const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
        const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

        setDragStart({ x: clientX, y: clientY });
        setDragOffset(0);
    }, []);

    const handlePointerMove = useCallback((e) => {
        if (!isDragging) return;

        const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
        const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
        if (clientX === undefined || clientY === undefined) return;

        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;

        // Mark as moved if dragged further than 5px so we don't fire button clicks
        if (Math.abs(deltaX) > 5) {
            hasMovedRef.current = true;
        }

        // Let the browser handle vertical scrolling naturally
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
            setIsDragging(false);
            setDragOffset(0);
            return;
        }

        const maxDelta = containerRef.current ? containerRef.current.offsetWidth : window.innerWidth;
        setDragOffset(Math.max(-maxDelta, Math.min(maxDelta, deltaX)));
    }, [isDragging, dragStart]);

    const finishDrag = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        const threshold = containerRef.current ? containerRef.current.offsetWidth * 0.15 : 75;

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
    const dragTranslate = (dragOffset / (containerRef.current?.offsetWidth || window.innerWidth)) * 100;
    const translateX = baseTranslate + dragTranslate;

    if (!slides.length) return null;

    return (
        <section
            className="relative w-full h-[40vh] sm:h-[75vh] md:h-[85vh] lg:h-[95vh] overflow-hidden bg-[#141414] select-none touch-pan-y group"
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            onMouseLeave={finishDrag}
        >
            {/* Slide Track */}
            <div className="h-10 lg:h-0"></div>
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
                            className="relative  min-w-full h-full flex-shrink-0 overflow-hidden"
                            aria-hidden={!isActive}
                        >
                            {/* Background Media with Subtle Zoom Effect */}
                            <picture className="absolute inset-0 w-full h-full">
                                <source media="(min-width: 768px)" srcSet={slide.img} />
                                <img
                                    src={slide.img}
                                    alt={slide.name2 || 'Featured Title'}
                                    className={`w-full h-full object-cover object-top transition-transform duration-[10000ms] ease-out ${isActive ? 'scale-105' : 'scale-100'
                                        }`}
                                    loading={idx === 0 ? 'eager' : 'lazy'}
                                    draggable="false"
                                />
                            </picture>

                            {/* Netflix Signature Vignettes & Gradients */}
                            {/* 1. Top Navbar Shadow */}
                            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
                            {/* 2. Left Side Dark Vignette for Text Readability */}
                            <div className="absolute inset-y-0 left-0 w-full md:w-[65%] bg-gradient-to-r from-[#141414]/95 via-[#141414]/50 to-transparent pointer-events-none" />
                            {/* 3. Bottom Seamless Blend into #141414 Background */}
                            <div className="absolute inset-x-0 bottom-0 h-48 md:h-64 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent pointer-events-none" />

                            {/* Left Content Stack (Billboard Info) */}
                            <div className="absolute bottom-[14%] sm:bottom-[18%] md:bottom-[22%] left-0 w-full px-4 sm:px-8 md:px-12 lg:px-16 z-10 flex flex-col items-start max-w-full md:max-w-[60%] lg:max-w-[48%] pointer-events-none">

                                {/* Netflix "N SERIES / FILM" Badge */}
                                <div className="flex items-center gap-2 mb-2 md:mb-3">
                                    <span className="font-black text-[#E50914] text-xl sm:text-2xl md:text-3xl tracking-tighter leading-none drop-shadow-md">
                                        C
                                    </span>
                                    <span className="text-gray-300 font-bold tracking-[0.28em] text-[10px] sm:text-xs md:text-sm uppercase drop-shadow">
                                        {slide.type || 'Film'}
                                    </span>
                                </div>

                                {/* Title Logo or Fallback Text */}
                                {slide.nameImg2 ? (
                                    <img
                                        src={slide.nameImg2}
                                        alt={slide.name2}
                                        className="w-auto max-h-[65px] sm:max-h-[95px] md:max-h-[130px] lg:max-h-[150px] max-w-[75%] sm:max-w-[85%] object-contain object-left mb-3 md:mb-5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                                        draggable="false"
                                    />
                                ) : (
                                    <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none mb-3 md:mb-5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] line-clamp-2">
                                        {slide.name2}
                                    </h1>
                                )}

                                {/* Top 10 Badge + Rank */}
                                <div className="flex items-center gap-2.5 mb-3 md:mb-4">
                                    <div className="flex flex-col items-center justify-center bg-[#E50914] text-white font-black px-1.5 py-0.5 rounded-[2px] leading-none shadow-md">
                                        <span className="text-[7px] md:text-[8px] tracking-tighter">TOP</span>
                                        <span className="text-[11px] md:text-xs">10</span>
                                    </div>
                                    <span className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-white drop-shadow-md">
                                        #{idx + 1} in Movies Today
                                    </span>
                                </div>

                                {/* Synopsis (Desktop & Tablet) */}
                                <p className="hidden sm: -webkit-box sm:line-clamp-3 text-xs sm:text-sm md:text-base lg:text-lg text-white/90 font-normal leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mb-5 md:mb-6 max-w-xl">
                                    {slide.desc}
                                </p>

                                {/* Action Buttons (Play & More Info) */}
                                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto pointer-events-auto mt-1 sm:mt-0">
                                    {/* Primary Play Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleActionClick(e, slide.id)}
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 bg-white hover:bg-white/80 active:bg-white/70 text-black font-bold text-sm sm:text-base md:text-lg px-5 sm:px-7 py-0 sm:py-2.5 md:py-3 rounded-[4px] transition-colors duration-200 shadow-lg cursor-pointer"
                                    >
                                        <i className="fa-solid fa-play text-base sm:text-lg md:text-xl"></i>
                                        <span>Play</span>
                                    </button>

                                    {/* Secondary More Info Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleActionClick(e, slide.id)}
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 bg-[#6d6d6eb3] hover:bg-[#6d6d6e66] active:bg-[#6d6d6e4d] text-white font-bold text-sm sm:text-base md:text-lg px-5 sm:px-7 py-0 sm:py-2.5 md:py-3 rounded-[4px] backdrop-blur-sm transition-colors duration-200 shadow-lg cursor-pointer"
                                    >
                                        <i className="fa-solid fa-circle-info text-base sm:text-lg md:text-xl"></i>
                                        <span>More Info</span>
                                    </button>
                                </div>
                            </div>

                            {/* Right Side Controls (Mute Toggle & Maturity Rating Badge) */}
                            <div className="hidden sm:flex absolute bottom-[34%] right-0 items-center gap-3 z-20 pointer-events-auto">

                                <div className="bg-[#33333399] border-l-[3px] border-white/80 py-1.5 pl-3 pr-6 md:pr-10 text-white text-xs md:text-sm font-semibold backdrop-blur-sm">
                                    {slide.maturity || 'U/A 16+'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default React.memo(HeroBanner);