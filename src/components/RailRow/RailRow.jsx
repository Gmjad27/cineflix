import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useInView from '../../hooks/useInView';

export default function RailRow({
    title,
    titleAlt,
    items = [],
    renderItem,
    eager = false,
    ranked = false,
    showViewAll = true,
}) {
    const navigate = useNavigate();
    const [sectionRef, inView] = useInView('400px 0px');
    const trackRef = useRef(null);
    const rafRef = useRef(null);

    const [isAtStart, setIsAtStart] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);
    const [activePage, setActivePage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const shouldRender = eager || inView;

    const handleNativeScroll = useCallback(() => {
        if (rafRef.current) return;

        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            const el = trackRef.current;
            if (!el) return;

            const { scrollLeft, scrollWidth, clientWidth } = el;
            const maxScroll = Math.max(0, scrollWidth - clientWidth);

            setIsAtStart(scrollLeft <= 2);
            setIsAtEnd(maxScroll <= 2 || Math.ceil(scrollLeft) >= maxScroll - 2);

            const pages = Math.max(1, Math.ceil(scrollWidth / Math.max(1, clientWidth)));
            const currentPage =
                maxScroll > 0
                    ? Math.min(pages - 1, Math.round((scrollLeft / maxScroll) * (pages - 1)))
                    : 0;

            setTotalPages(pages);
            setActivePage(currentPage);
        });
    }, []);

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const scrollByDirection = (direction) => {
        const el = trackRef.current;
        if (!el) return;

        el.scrollBy({
            left: el.clientWidth * 0.85 * direction,
            behavior: 'smooth',
        });
    };

    const scrollToPage = (pageIndex) => {
        const el = trackRef.current;
        if (!el || totalPages <= 1) return;

        const maxScroll = el.scrollWidth - el.clientWidth;
        el.scrollTo({
            left: (pageIndex / (totalPages - 1)) * maxScroll,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        if (!shouldRender) return;
        handleNativeScroll();

        window.addEventListener('resize', handleNativeScroll, { passive: true });
        return () => window.removeEventListener('resize', handleNativeScroll);
    }, [shouldRender, items.length, handleNativeScroll]);

    const handleViewAll = () => {
        if (!items || items.length === 0) return;

        const titleParam = encodeURIComponent(title || 'Explore All');
        navigate(`/viewall?title=${titleParam}`, {
            state: { title: title || 'Explore All', items },
        });
    };

    if (shouldRender && (!items || items.length === 0)) return null;

    const canExplore = showViewAll && items.length > 0;

    return (
        <section
            ref={sectionRef}
            style={{ contentVisibility: 'auto', containIntrinsicSize: '0 320px' }}
            className="relative flex flex-col space-y-3 md:space-y-4 mb-10 md:mb-12 group/rail z-10 hover:z-30"
        >
            {titleAlt && (
                <div className="px-2 md:px-0">
                    <span className="text-[17px] sm:text-xl md:text-2xl font-extrabold tracking-tight text-white/95 group-hover/rail:text-white transition-colors font-sans">
                        {titleAlt}
                    </span>
                </div>
            )}

            {/* Header */}
            {title && (
                <div className="flex items-center justify-between px-2 md:px-0 z-20 select-none">
                    <button
                        type="button"
                        onClick={canExplore ? handleViewAll : undefined}
                        disabled={!canExplore}
                        className={`flex items-center gap-3 text-left group/title focus:outline-none ${canExplore ? 'cursor-pointer' : 'cursor-default'
                            }`}
                    >
                        <span
                            className={`w-1 rounded-full transition-all duration-200 ${ranked
                                    ? 'h-6 sm:h-7 bg-gradient-to-b from-[#E50914] to-amber-500'
                                    : 'h-5 sm:h-6 bg-[#E50914] group-hover/rail:h-7'
                                }`}
                        />

                        <h2
                            title={canExplore ? `Explore all ${title}` : title}
                            className="text-[17px] sm:text-xl md:text-2xl font-extrabold tracking-tight text-white/95 group-hover/rail:text-white transition-colors font-sans"
                        >
                            {title}
                        </h2>

                        {ranked && (
                            <span className="px-2 py-0.5 rounded-md bg-[#E50914]/20 border border-[#E50914]/40 text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-400">
                                Top 10
                            </span>
                        )}

                        {canExplore && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 hover:bg-[#E50914]/25 border border-white/15 group-hover/rail:border-[#E50914]/45 text-xs font-semibold text-white/80 group-hover/rail:text-white transition-all duration-200 sm:invisible sm:opacity-0 sm:-translate-x-2 sm:group-hover/rail:visible sm:group-hover/rail:opacity-100 sm:group-hover/rail:translate-x-0">
                                <span className="text-[#E50914] group-hover/rail:text-red-300">
                                    Explore All
                                </span>
                                <i className="fa-solid fa-chevron-right text-[9px] text-white/75" />
                            </span>
                        )}
                    </button>

                    {/* Page Indicators (Hidden & uncomposited until hover) */}
                    {totalPages > 1 && (
                        <div
                            role="tablist"
                            aria-label={`${title} pages`}
                            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-900/90 border border-white/10 invisible opacity-0 group-hover/rail:visible group-hover/rail:opacity-100 transition-opacity duration-200"
                        >
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    aria-label={`Go to page ${idx + 1}`}
                                    onClick={() => scrollToPage(idx)}
                                    className={`h-1 rounded-full transition-all duration-200 cursor-pointer ${idx === activePage
                                            ? 'w-5 bg-[#E50914]'
                                            : 'w-2.5 bg-white/25 hover:bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Track & Paddles */}
            <div className="relative">
                {/* Left Paddle */}
                <button
                    type="button"
                    aria-label={`Scroll ${title} left`}
                    onClick={() => scrollByDirection(-1)}
                    className={`hidden md:flex absolute -left-3 lg:-left-5 top-0 bottom-0 z-40 w-11 lg:w-14 items-center justify-center rounded-2xl bg-neutral-950/85 hover:bg-neutral-900 border border-white/15 hover:border-[#E50914]/60 text-white shadow-xl transition-all duration-200 group/btn cursor-pointer ${isAtStart
                            ? 'invisible opacity-0 pointer-events-none'
                            : 'invisible opacity-0 group-hover/rail:visible group-hover/rail:opacity-100'
                        }`}
                >
                    <i className="fa-solid fa-chevron-left text-2xl lg:text-3xl text-white/90 group-hover/btn:text-[#E50914] group-hover/btn:scale-110 transition-transform duration-150" />
                </button>

                {shouldRender ? (
                    <div
                        ref={trackRef}
                        onScroll={handleNativeScroll}
                        className={`flex items-center overflow-x-auto snap-x snap-mandatory md:snap-none scroll-smooth py-10 -my-10 px-2 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&>div:first-child>div]:!origin-left [&>div:first-child>a]:!origin-left [&>div:last-child>div]:!origin-right [&>div:last-child>a]:!origin-right ${ranked ? 'gap-4 sm:gap-6' : 'gap-2.5 sm:gap-3.5'
                            }`}
                    >
                        {items.map((item, idx) => (
                            <div className="snap-start flex-shrink-0" key={item.id ?? idx}>
                                {renderItem(item, idx)}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Lightweight Skeleton Loader */
                    <div
                        className="flex items-center gap-2.5 sm:gap-3.5 py-10 -my-10 px-2 md:px-0 overflow-hidden"
                        aria-hidden="true"
                    >
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="flex-shrink-0 w-32 sm:w-36 md:w-44 lg:w-48 xl:w-56 aspect-[2/3] rounded-xl bg-white/[0.05] border border-white/10"
                            />
                        ))}
                    </div>
                )}

                {/* Right Paddle */}
                <button
                    type="button"
                    aria-label={`Scroll ${title} right`}
                    onClick={() => scrollByDirection(1)}
                    className={`hidden md:flex absolute -right-3 lg:-right-5 top-0 bottom-0 z-40 w-11 lg:w-14 items-center justify-center rounded-2xl bg-neutral-950/85 hover:bg-neutral-900 border border-white/15 hover:border-[#E50914]/60 text-white shadow-xl transition-all duration-200 group/btn cursor-pointer ${isAtEnd
                            ? 'invisible opacity-0 pointer-events-none'
                            : 'invisible opacity-0 group-hover/rail:visible group-hover/rail:opacity-100'
                        }`}
                >
                    <i className="fa-solid fa-chevron-right text-2xl lg:text-3xl text-white/90 group-hover/btn:text-[#E50914] group-hover/btn:scale-110 transition-transform duration-150" />
                </button>
            </div>
        </section>
    );
}