import React from 'react';

const Skeleton = ({ type = 'card', count = 6 }) => {
    // 1. Grid of Cards (Used in Profile and Search pages)
    if (type === 'card') {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10 w-full">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3 w-full">
                        {/* Poster Image */}
                        <div className="w-full aspect-[2/3] bg-[#2a2a2a] rounded-md animate-pulse"></div>
                        {/* Title Line */}
                        <div className="w-3/4 h-3 bg-[#2a2a2a] rounded-sm animate-pulse"></div>
                        {/* Meta/Rating Line */}
                        <div className="w-1/2 h-3 bg-[#2a2a2a] rounded-sm animate-pulse"></div>
                    </div>
                ))}
            </div>
        );
    }

    // 2. Hero Banner (Used at the top of Home, Movie, and Tv pages)
    if (type === 'banner') {
        return (
            <section className="relative w-full h-[75vh] sm:h-[85vh] md:h-[90vh] lg:h-[100vh] bg-[#141414] overflow-hidden flex items-end">
                {/* Gradient Overlay Simulation */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent bottom-0 h-full z-0"></div>
                
                <div className="relative z-10 w-full px-6 md:px-12 lg:px-16 pb-[10%] sm:pb-[15%] flex flex-col items-start gap-4 max-w-[90%] md:max-w-[50%]">
                    {/* Badge */}
                    <div className="w-24 h-6 bg-[#2a2a2a] rounded-sm animate-pulse"></div>
                    
                    {/* Large Title */}
                    <div className="w-full max-w-[400px] sm:max-w-[500px] h-12 md:h-16 lg:h-20 bg-[#2a2a2a] rounded-md animate-pulse"></div>
                    
                    {/* Meta Info (Year, Rating, etc.) */}
                    <div className="w-48 h-4 sm:h-5 bg-[#2a2a2a] rounded-sm animate-pulse mt-2"></div>
                    
                    {/* Description Paragraph */}
                    <div className="w-full max-w-[600px] h-20 sm:h-24 bg-[#2a2a2a] rounded-md animate-pulse mt-2"></div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 sm:gap-4 mt-4 w-full sm:w-auto">
                        <div className="flex-1 sm:flex-none w-32 sm:w-36 h-10 md:h-12 bg-[#2a2a2a] rounded animate-pulse"></div>
                        <div className="flex-1 sm:flex-none w-36 sm:w-40 h-10 md:h-12 bg-[#2a2a2a] rounded animate-pulse"></div>
                    </div>
                </div>
            </section>
        );
    }

    // 3. Horizontal Rail Row (Used in Home, Movie, Tv content rails)
    if (type === 'section') {
        return (
            <section className="mb-10 sm:mb-14 w-full overflow-hidden">
                {/* Section Title */}
                <div className="w-48 sm:w-64 h-6 sm:h-8 bg-[#2a2a2a] rounded-sm animate-pulse mb-4 sm:mb-6"></div>
                
                {/* Horizontal Scroll Track */}
                <div className="flex gap-3 sm:gap-4 overflow-hidden">
                    {Array.from({ length: count }).map((_, i) => (
                        <div 
                            key={i} 
                            // Exact width classes matching your Card.jsx component to prevent layout jumps
                            className="flex-shrink-0 w-32 sm:w-36 md:w-44 lg:w-48 xl:w-56"
                        >
                            <div className="w-full aspect-[2/3] bg-[#2a2a2a] rounded-md animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return null;
};

export default Skeleton;