import React, { useState, useRef, useCallback, useEffect } from 'react';

function HeroBanner({ mediaData, currentHero, heroIndex, setHeroIndex, openWatch }) {
    const slides = mediaData && mediaData.length ? mediaData : (currentHero ? [currentHero] : []);
    const totalSlides = slides.length;
    const [isDragging, setIsDragging] = useState(false);

    // Store both X and Y to determine swipe direction
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState(0);
    const containerRef = useRef(null);

    // Reset dragOffset when heroIndex changes externally
    useEffect(() => {
        setDragOffset(0);
    }, [heroIndex]);

    const handlePointerDown = useCallback((e) => {
        setIsDragging(true);
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        setDragStart({ x: clientX, y: clientY });
        setDragOffset(0);

        if (containerRef.current) {
            containerRef.current.style.transition = 'none';
        }
    }, []);

    const handlePointerMove = useCallback((e) => {
        if (!isDragging) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        if (clientX === undefined || clientY === undefined) return;

        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;

        // If the user is swiping vertically more than horizontally, they are trying to scroll.
        // Cancel the drag to let the browser scroll smoothly.
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
            setIsDragging(false);
            if (containerRef.current) {
                containerRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }
            return;
        }

        const maxDelta = containerRef.current ? containerRef.current.offsetWidth : window.innerWidth;
        setDragOffset(Math.max(-maxDelta, Math.min(maxDelta, deltaX)));
    }, [isDragging, dragStart]);

    const finishDrag = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        const threshold = containerRef.current ? containerRef.current.offsetWidth * 0.2 : 80;
        if (dragOffset < -threshold && heroIndex < totalSlides - 1) {
            setHeroIndex(heroIndex + 1);
        } else if (dragOffset > threshold && heroIndex > 0) {
            setHeroIndex(heroIndex - 1);
        } else {
            setDragOffset(0);
        }

        if (containerRef.current) {
            containerRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
    }, [isDragging, dragOffset, heroIndex, totalSlides, setHeroIndex]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handlePointerMove);
            window.addEventListener('mouseup', finishDrag);
            // Changed passive to TRUE to prevent blocking the main scroll thread
            window.addEventListener('touchmove', handlePointerMove, { passive: true });
            window.addEventListener('touchend', finishDrag);
            window.addEventListener('touchcancel', finishDrag);
        } else {
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', finishDrag);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', finishDrag);
            window.removeEventListener('touchcancel', finishDrag);
        }
        return () => {
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', finishDrag);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', finishDrag);
            window.removeEventListener('touchcancel', finishDrag);
        };
    }, [isDragging, handlePointerMove, finishDrag]);

    const baseTranslate = -heroIndex * 100;
    const dragTranslate = (dragOffset / (containerRef.current?.offsetWidth || window.innerWidth)) * 100;
    const translateX = baseTranslate + dragTranslate;

    return (
        <section
            // Added 'touch-pan-y' to let the browser natively handle vertical scrolls
            className="relative w-full h-[75vh] sm:h-[85vh] md:h-[90vh] lg:h-[70vh] overflow-hidden bg-[#141414] select-none touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerLeave={finishDrag}
        >
            <div
                ref={containerRef}
                className="flex h-full w-full will-change-transform"
                style={{
                    transform: `translate3d(${translateX}%, 0, 0)`, // Promotes to hardware-accelerated GPU layer
                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
            >
                {slides.map((slide, idx) => (
                    <div
                        key={slide.id || idx}
                        className="relative min-w-full h-full flex-shrink-0"
                        aria-hidden={idx !== heroIndex}
                    >
                        <picture className="absolute inset-0">
                            <source
                                media="(min-width: 768px)"
                                srcSet={slide.img}
                            />
                            <img
                                src={slide.name}
                                alt={slide.name2}
                                className="absolute inset-0 w-full h-full object-cover object-top"
                                loading={idx === 0 ? 'eager' : 'lazy'}
                                draggable="false"
                            />
                        </picture>

                        <div className="absolute inset-0 bg-gradient-to-r from-[#252424a5] via-[#141414]/60 to-transparent w-full md:w-[70%]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />

                        <div className="absolute bottom-[12%] sm:bottom-[15%] left-0 w-full px-6 md:px-12 lg:px-16 flex flex-col items-start gap-4 z-10 max-w-[95%] md:max-w-[60%] lg:max-w-[50%]">
                            <div className="flex items-center gap-2 drop-shadow-lg mb-[-10px]">
                                <span className="flex items-center justify-center font-black text-[#E50914] text-2xl md:text-3xl tracking-tighter">
                                    N
                                </span>
                                <span className="text-gray-300 font-bold tracking-[0.2em] text-[10px] sm:text-xs uppercase">
                                    Film
                                </span>
                            </div>

                            {slide.nameImg2 ? (
                                <img
                                    src={slide.nameImg2}
                                    alt={slide.name2}
                                    className="max-w-[220px] md:max-w-[350px] lg:max-w-[450px] object-contain drop-shadow-2xl origin-left"
                                    draggable="false"
                                />
                            ) : (
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight drop-shadow-2xl text-white tracking-tight line-clamp-2">
                                    {slide.name2}
                                </h1>
                            )}

                            <div className="flex items-center gap-3 drop-shadow-md mt-1">
                                <span className="bg-[#E50914] text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded-sm tracking-wider">
                                    TOP 10
                                </span>
                                <h2 className="text-lg md:text-xl font-bold text-white shadow-black drop-shadow-md">
                                    #{idx + 1} in Trending Today
                                </h2>
                            </div>

                            <p className="hidden md:block text-sm lg:text-lg text-gray-200 drop-shadow-xl line-clamp-3 leading-relaxed font-medium mt-2">
                                {slide.desc}
                            </p>

                            <div className="mt-4 flex  gap-3 sm:gap-4 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => openWatch(slide.id)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 md:px-8 py-2.5 md:py-3 bg-white/20 text-white font-bold text-sm md:text-lg rounded-md hover:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-md ring-1 ring-white/30 shadow-lg"
                                >
                                    <i className="fa-solid fa-circle-info text-xl"></i>
                                    More Info
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative bottom-10 md:bottom-36 left-0 w-full flex justify-center gap-2 z-20">
                {slides.slice(0, 5).map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        className={`h-1.5 rounded-full transition-all duration-500 ease-out ${heroIndex % 5 === i
                            ? 'bg-white w-8 opacity-100'
                            : 'bg-white/40 hover:bg-white/70 w-2.5 opacity-50'
                            }`}
                        onClick={() => setHeroIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

export default React.memo(HeroBanner);