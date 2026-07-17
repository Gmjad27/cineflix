import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useInView from '../../hooks/useInView';

export default function RailRow({
    title,
    items,
    renderItem,
    eager = false,
}) {
    const navigate = useNavigate();
    const [sectionRef, inView] = useInView('500px 0px');
    const trackRef = useRef(null);
    
    // Local state to manage arrow visibility
    const [isAtStart, setIsAtStart] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);

    const shouldRender = eager || inView;

    // Check scroll boundaries to show/hide arrows
    const handleNativeScroll = useCallback(() => {
        if (!trackRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
        
        setIsAtStart(scrollLeft <= 0);
        // Using -1 to account for browser sub-pixel rounding errors
        setIsAtEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 1);
    }, []);

    // Scroll programmatically when buttons are clicked
    const scrollByDirection = (direction) => {
        if (trackRef.current) {
            // Scroll by 75% of the container's visible width to leave a visual anchor
            const scrollAmount = trackRef.current.clientWidth * 0.75;
            trackRef.current.scrollBy({ 
                left: scrollAmount * direction, 
                behavior: 'smooth' 
            });
        }
    };

    // Re-check boundaries if window resizes
    useEffect(() => {
        window.addEventListener('resize', handleNativeScroll);
        return () => window.removeEventListener('resize', handleNativeScroll);
    }, [handleNativeScroll]);

    // Initial check once items are rendered
    useEffect(() => {
        if (shouldRender) {
            handleNativeScroll();
        }
    }, [shouldRender, items, handleNativeScroll]);

    // Handle View All navigation
    const handleViewAll = () => {
        if (!items || items.length === 0) return;
        
        // Serialize items and title for the MovieViewAll component
        const itemsParam = encodeURIComponent(JSON.stringify(items));
        const titleParam = encodeURIComponent(title || 'Explore All');
        
        navigate(`/viewall?title=${titleParam}&items=${itemsParam}`);
    };

    return (
        <section ref={sectionRef} className="relative flex flex-col space-y-2 md:space-y-3 mb-8 group/rail z-10 hover:z-30">
            
            {/* Title with Netflix/Hotstar 'Explore All' hover interaction */}
            {title && (
                <div className="flex items-end px-2 md:px-0">
                    <h2 
                        className="text-lg sm:text-xl md:text-2xl font-bold text-[#e5e5e5] group-hover/rail:text-white transition-colors cursor-pointer group/title flex items-center gap-3"
                        onClick={handleViewAll}
                        title={`Explore all ${title}`}
                    >
                        {title}
                        <div className="hidden sm:flex items-center text-[#54b9c5] text-[10px] md:text-xs font-bold tracking-wider opacity-0 -translate-x-4 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all duration-500 ease-out">
                            Explore All 
                            <i className="fa-solid fa-chevron-right ml-1.5 text-[10px]"></i>
                        </div>
                    </h2>
                </div>
            )}
            
            {/* Scroll Container Wrapper */}
            <div className="relative">
                
                {/* Left Arrow - Deep gradient */}
                <button
                    type="button"
                    className={`hidden md:flex absolute left-[-48px] lg:left-[-64px] top-0 bottom-0 z-40 w-12 lg:w-16 items-center justify-center bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent text-white transition-all duration-300 rounded-l-md ${
                        isAtStart ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover/rail:opacity-100 hover:bg-[#141414]/40'
                    }`}
                    aria-label={`Scroll ${title} left`}
                    onClick={() => scrollByDirection(-1)}
                >
                    <i className="fa-solid fa-chevron-left text-3xl md:text-4xl drop-shadow-lg hover:scale-125 transition-transform duration-200"></i>
                </button>

                {shouldRender ? (
                    <div
                        ref={trackRef}
                        onScroll={handleNativeScroll}
                        // Added arbitrary variants here to force the scaling origin of the first/last children
                        className="flex items-center gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory md:snap-none scroll-smooth py-10 -my-10 px-2 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&>div:first-child>div]:!origin-left [&>div:first-child>a]:!origin-left [&>div:last-child>div]:!origin-right [&>div:last-child>a]:!origin-right"
                    >
                        {items.map((item, idx) => (
                            <div className="snap-start flex-shrink-0" key={item.id ?? idx}>
                                {renderItem(item, idx)}
                            </div>
                        ))}
                    </div>
                ) : (
                    // Skeletons matching the new Card dimensions
                    <div className="flex items-center gap-2 sm:gap-3 py-10 -my-10 px-2 md:px-0 overflow-hidden" aria-hidden="true">
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="flex-shrink-0 w-32 sm:w-36 md:w-44 lg:w-48 xl:w-56 aspect-[2/3] rounded-md bg-[#2a2a2a] animate-pulse border border-[#333]"
                            />
                        ))}
                    </div>
                )}

                {/* Right Arrow - Deep gradient */}
                <button
                    type="button"
                    className={`hidden md:flex absolute right-[-48px] lg:right-[-64px] top-0 bottom-0 z-40 w-12 lg:w-16 items-center justify-center bg-gradient-to-l from-[#141414] via-[#141414]/80 to-transparent text-white transition-all duration-300 rounded-r-md ${
                        isAtEnd ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover/rail:opacity-100 hover:bg-[#141414]/40'
                    }`}
                    aria-label={`Scroll ${title} right`}
                    onClick={() => scrollByDirection(1)}
                >
                    <i className="fa-solid fa-chevron-right text-3xl md:text-4xl drop-shadow-lg hover:scale-125 transition-transform duration-200"></i>
                </button>
            </div>
        </section>
    );
}