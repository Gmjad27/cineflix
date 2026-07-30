import React from 'react';

// ─── Shimmer keyframe (injected once) ────────────────────────────────────
const SHIMMER_STYLE = `
@keyframes skeleton-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

// ─── Reusable shimmer block ──────────────────────────────────────────────
function ShimmerBlock({ className = '', style }) {
    return (
        <div
            className={`
                relative overflow-hidden bg-[#222] rounded-md
                after:absolute after:inset-0
                after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent
                after:animate-[skeleton-shimmer_1.8s_ease-in-out_infinite]
                motion-reduce:after:animate-none
                ${className}
            `}
            style={style}
        />
    );
}

// ─── Main Skeleton Component ─────────────────────────────────────────────
const Skeleton = ({ type = 'card', count = 6 }) => {
    // Sanitize count
    const safeCount = Math.min(Math.max(Math.round(count) || 6, 1), 20);

    // Dev warning for invalid type
    if (process.env.NODE_ENV === 'development' && !['card', 'banner', 'section', 'studio', 'detail'].includes(type)) {
        console.warn(`<Skeleton> Unknown type "${type}". Falling back to "card".`);
    }

    const resolvedType = ['card', 'banner', 'section', 'studio', 'detail'].includes(type) ? type : 'card';

    return (
        <>
            {/* Inject keyframes once */}
            <style>{SHIMMER_STYLE}</style>

            <div role="status" aria-label="Loading content">
                <span className="sr-only">Loading…</span>
                <div aria-hidden="true">
                    {resolvedType === 'card' && <CardGrid count={safeCount} />}
                    {resolvedType === 'banner' && <BannerBlock />}
                    {resolvedType === 'section' && <SectionRail count={safeCount} />}
                    {resolvedType === 'studio' && <StudioRail count={safeCount} />}
                    {resolvedType === 'detail' && <DetailPage />}
                </div>
            </div>
        </>
    );
};

// ─── 1. Card Grid (Profile / Search pages) ───────────────────────────────
function CardGrid({ count }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8 w-full px-3 md:px-12">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2.5 w-full">
                    {/* Poster — matches Card aspect ratio */}
                    <ShimmerBlock className="w-full aspect-[2/3] rounded-lg" />
                    {/* Title */}
                    <ShimmerBlock className="w-3/4 h-3 rounded-sm" />
                    {/* Meta */}
                    <ShimmerBlock className="w-1/2 h-2.5 rounded-sm" />
                </div>
            ))}
        </div>
    );
}

// ─── 2. Hero Banner (Home / Movie / TV top) ──────────────────────────────
function BannerBlock() {
    return (
        <section className="relative w-full h-[70vh] sm:h-[80vh] md:h-[90vh] lg:h-[95vh] bg-[#141414] overflow-hidden flex items-end">
            {/* Gradient overlay simulation */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent z-0" />

            <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-16 pb-[12%] sm:pb-[14%] flex flex-col items-start gap-3 sm:gap-4 max-w-full md:max-w-[55%]">
                {/* Badge */}
                <ShimmerBlock className="w-20 sm:w-24 h-5 sm:h-6 rounded" />

                {/* Title */}
                <ShimmerBlock className="w-[85%] max-w-[420px] sm:max-w-[500px] h-10 sm:h-14 md:h-16 lg:h-20 rounded-lg" />

                {/* Meta row */}
                <div className="flex items-center gap-3 mt-1">
                    <ShimmerBlock className="w-12 h-4 rounded-sm" />
                    <ShimmerBlock className="w-16 h-4 rounded-sm" />
                    <ShimmerBlock className="w-10 h-4 rounded-sm" />
                </div>

                {/* Description */}
                <ShimmerBlock className="w-[90%] max-w-[560px] h-16 sm:h-20 md:h-24 rounded-lg mt-1" />

                {/* Action buttons */}
                <div className="flex gap-3 sm:gap-4 mt-3 w-full sm:w-auto">
                    <ShimmerBlock className="flex-1 sm:flex-none w-28 sm:w-36 h-10 md:h-12 rounded-md" />
                    <ShimmerBlock className="flex-1 sm:flex-none w-32 sm:w-40 h-10 md:h-12 rounded-md" />
                </div>
            </div>
        </section>
    );
}

// ─── 3. Horizontal Rail (matches redesigned Card.jsx) ────────────────────
function SectionRail({ count }) {
    return (
        <section className="mb-8 md:mb-10 w-full overflow-hidden px-3 md:px-12">
            {/* Section title */}
            <ShimmerBlock className="w-40 sm:w-52 md:w-64 h-5 sm:h-6 md:h-7 rounded-sm mb-3 md:mb-4" />

            {/* Scroll track — py-8 -my-8 matches RailRow's hover-scale room */}
            <div className="flex gap-2 sm:gap-3 overflow-hidden py-8 -my-8">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        // Exact widths from redesigned Card.jsx
                        className="flex-shrink-0 w-28 sm:w-32 md:w-40 lg:w-44 xl:w-52"
                    >
                        <ShimmerBlock className="w-full aspect-[2/3] rounded-lg" />
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── 4. Studio Rail (matches redesigned Card2.jsx) ───────────────────────
function StudioRail({ count }) {
    return (
        <section className="mb-8 md:mb-10 w-full overflow-hidden px-3 md:px-12">
            {/* Section title */}
            <ShimmerBlock className="w-32 sm:w-44 md:w-52 h-5 sm:h-6 md:h-7 rounded-sm mb-3 md:mb-4" />

            {/* Scroll track */}
            <div className="flex gap-2 sm:gap-3 overflow-hidden py-4 -my-4">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        // Exact sizes from redesigned Card2.jsx
                        className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
                    >
                        <ShimmerBlock className="w-full h-full rounded-xl" />
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── 5. Detail Page (Movie/TV info) ──────────────────────────────────────
function DetailPage() {
    return (
        <div className="w-full px-4 md:px-12 lg:px-16 py-8">
            {/* Backdrop area */}
            <ShimmerBlock className="w-full h-[40vh] sm:h-[50vh] rounded-xl mb-6" />

            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                {/* Poster */}
                <ShimmerBlock className="w-36 sm:w-44 md:w-56 aspect-[2/3] rounded-lg flex-shrink-0 mx-auto md:mx-0" />

                {/* Info column */}
                <div className="flex-1 flex flex-col gap-3 sm:gap-4">
                    <ShimmerBlock className="w-[70%] max-w-[400px] h-8 sm:h-10 md:h-12 rounded-md" />
                    <ShimmerBlock className="w-[40%] max-w-[240px] h-4 rounded-sm" />

                    {/* Genre chips */}
                    <div className="flex gap-2 mt-1">
                        <ShimmerBlock className="w-16 h-6 rounded-full" />
                        <ShimmerBlock className="w-20 h-6 rounded-full" />
                        <ShimmerBlock className="w-14 h-6 rounded-full" />
                    </div>

                    {/* Overview */}
                    <ShimmerBlock className="w-full h-24 sm:h-32 rounded-lg mt-2" />

                    {/* Cast row */}
                    <div className="flex gap-3 mt-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                                <ShimmerBlock className="w-14 h-14 sm:w-16 sm:h-16 rounded-full" />
                                <ShimmerBlock className="w-12 h-2.5 rounded-sm" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(Skeleton);