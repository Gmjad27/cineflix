import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useInView from '../../hooks/useInView';

export default function RailRow({
    title,
    titleAlt,
    items,
    renderItem,
    eager = false,
}) {
    const navigate = useNavigate();
    const [sectionRef, inView] = useInView('500px 0px');
    const trackRef = useRef(null);

    const [isAtStart, setIsAtStart] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);
    const [activePage, setActivePage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const shouldRender = eager || inView;

    const handleNativeScroll = useCallback(() => {
        if (!trackRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;

        setIsAtStart(scrollLeft <= 2);
        setIsAtEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 2);

        const pages = Math.max(1, Math.ceil(scrollWidth / clientWidth));
        const maxScroll = Math.max(1, scrollWidth - clientWidth);
        const currentPage = Math.min(
            pages - 1,
            Math.round((scrollLeft / maxScroll) * (pages - 1))
        );

        setTotalPages(pages);
        setActivePage(currentPage);
    }, []);

    const scrollByDirection = (direction) => {
        if (trackRef.current) {
            const scrollAmount = trackRef.current.clientWidth * 0.82;
            trackRef.current.scrollBy({
                left: scrollAmount * direction,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleNativeScroll);
        return () => window.removeEventListener('resize', handleNativeScroll);
    }, [handleNativeScroll]);

    useEffect(() => {
        if (shouldRender) {
            handleNativeScroll();
        }
    }, [shouldRender, items, handleNativeScroll]);

    const handleViewAll = () => {
        if (!items || items.length === 0) return;

        const itemsParam = encodeURIComponent(JSON.stringify(items));
        const titleParam = encodeURIComponent(title || 'Explore All');

        navigate(`/viewall?title=${titleParam}&items=${itemsParam}`);
    };

    return (
        <section
            ref={sectionRef}
            className="relative flex flex-col space-y-3 md:space-y-4 mb-10 group/rail z-10 hover:z-30"
        >
            {/* Optional Alt Header */}
            {titleAlt && (
                <h2 className="px-2 md:px-0 text-[15px] sm:text-xl md:text-2xl font-bold tracking-tight text-white/90 group-hover/rail:text-white transition-colors flex items-center gap-3 font-sans">
                    {titleAlt}
                </h2>
            )}

            {/* Netflix Glass Header Row */}
            {title && (
                <div
                    onClick={handleViewAll}
                    className="flex items-center justify-between px-2 md:px-0 z-10 cursor-pointer select-none"
                >
                    <div className="flex items-center gap-3 group/title">
                        {/* Netflix Signature Red Accent Bar */}
                        <span className="h-5 sm:h-6 w-1 rounded-full bg-[#E50914] shadow-[0_0_12px_rgba(229,9,20,0.85)] transition-all duration-300 group-hover/rail:h-7" />

                        <h2
                            title={`Explore all ${title}`}
                            className="text-[16px] sm:text-xl md:text-2xl font-bold tracking-tight text-white/90 group-hover/rail:text-white transition-colors font-sans drop-shadow-sm"
                        >
                            {title}
                        </h2>

                        {/* Frosted Glass Explore Pill */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-[#E50914]/20 backdrop-blur-md border border-white/10 group-hover/rail:border-[#E50914]/40 text-xs font-semibold text-white/75 group-hover/rail:text-white transition-all duration-300 sm:opacity-0 sm:-translate-x-2 sm:group-hover/rail:opacity-100 sm:group-hover/rail:translate-x-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                            <span className="text-[#E50914] group-hover/rail:text-red-400 transition-colors">
                                Explore All
                            </span>
                            <i className="fa-solid fa-chevron-right text-[9px] text-white/70 group-hover/rail:translate-x-0.5 transition-transform" />
                        </div>
                    </div>

                    {/* Netflix Segmented Glass Pagination Indicator */}
                    {totalPages > 1 && (
                        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/[0.06] opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300">
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`h-[3px] rounded-full transition-all duration-300 ${idx === activePage
                                            ? 'w-4 bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.9)]'
                                            : 'w-2.5 bg-white/25'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Scroll Container Wrapper */}
            <div className="relative">
                {/* Left Glass Paddle (Netflix Full-Height Edge Style) */}
                <button
                    type="button"
                    aria-label={`Scroll ${title} left`}
                    onClick={() => scrollByDirection(-1)}
                    className={`hidden md:flex absolute -left-3 lg:-left-5 top-0 bottom-0 z-40 w-11 lg:w-14 items-center justify-center rounded-xl bg-black/45 hover:bg-black/70 backdrop-blur-xl border border-white/10 hover:border-white/25 text-white shadow-[0_8px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300 group/btn ${isAtStart
                            ? 'opacity-0 pointer-events-none -translate-x-2'
                            : 'opacity-0 group-hover/rail:opacity-100 translate-x-0'
                        }`}
                >
                    <i className="fa-solid fa-chevron-left text-2xl lg:text-3xl text-white/85 group-hover/btn:text-[#E50914] group-hover/btn:scale-125 transition-all duration-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
                </button>

                {shouldRender ? (
                    <div
                        ref={trackRef}
                        onScroll={handleNativeScroll}
                        className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto snap-x snap-mandatory md:snap-none scroll-smooth py-10 -my-10 px-2 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&>div:first-child>div]:!origin-left [&>div:first-child>a]:!origin-left [&>div:last-child>div]:!origin-right [&>div:last-child>a]:!origin-right"
                    >
                        {items.map((item, idx) => (
                            <div className="snap-start flex-shrink-0" key={item.id ?? idx}>
                                {renderItem(item, idx)}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Frosted Glass Skeleton Loader */
                    <div
                        className="flex items-center gap-2.5 sm:gap-3.5 py-10 -my-10 px-2 md:px-0 overflow-hidden"
                        aria-hidden="true"
                    >
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="flex-shrink-0 w-32 sm:w-36 md:w-44 lg:w-48 xl:w-56 aspect-[2/3] rounded-lg bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] animate-pulse"
                            />
                        ))}
                    </div>
                )}

                {/* Right Glass Paddle (Netflix Full-Height Edge Style) */}
                <button
                    type="button"
                    aria-label={`Scroll ${title} right`}
                    onClick={() => scrollByDirection(1)}
                    className={`hidden md:flex absolute -right-3 lg:-right-5 top-0 bottom-0 z-40 w-11 lg:w-14 items-center justify-center rounded-xl bg-black/45 hover:bg-black/70 backdrop-blur-xl border border-white/10 hover:border-white/25 text-white shadow-[0_8px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300 group/btn ${isAtEnd
                            ? 'opacity-0 pointer-events-none translate-x-2'
                            : 'opacity-0 group-hover/rail:opacity-100 translate-x-0'
                        }`}
                >
                    <i className="fa-solid fa-chevron-right text-2xl lg:text-3xl text-white/85 group-hover/btn:text-[#E50914] group-hover/btn:scale-125 transition-all duration-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
                </button>
            </div>
        </section>
    );
}