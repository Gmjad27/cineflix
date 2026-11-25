import React from 'react';

// ─── Shimmer keyframe (injected once) ────────────────────────────────────
const SHIMMER_STYLE = `
@keyframes skeleton-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

// ─── Reusable shimmer block ──────────────────────────────────────────────
export function ShimmerBlock({ className = '', style }) {
  return (
    <div
      className={`
        relative overflow-hidden bg-white/[0.04] border border-white/[0.06] rounded-xl
        after:absolute after:inset-0
        after:bg-gradient-to-r after:from-transparent after:via-white/[0.08] after:to-transparent
        after:animate-[skeleton-shimmer_1.8s_ease-in-out_infinite]
        motion-reduce:after:animate-none
        ${className}
      `}
      style={style}
    />
  );
}

// ─── 1. Card Grid (Profile, ViewAll, Movies, TV grid) ────────────────────
export function CardGrid({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8 w-full px-3 sm:px-6 md:px-12">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2.5 w-full">
          <ShimmerBlock className="w-full aspect-[2/3] rounded-xl shadow-inner" />
          <ShimmerBlock className="w-3/4 h-3.5 rounded-md" />
          <ShimmerBlock className="w-1/2 h-2.5 rounded-md" />
        </div>
      ))}
    </div>
  );
}

// ─── 2. Hero Banner (Home / Movie / TV top billboard) ─────────────────────
export function BannerBlock() {
  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] md:h-[90vh] lg:h-[95vh] bg-[#07070a] overflow-hidden flex items-end">
      <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/50 to-transparent z-0" />
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-16 pb-[12%] sm:pb-[14%] flex flex-col items-start gap-3 sm:gap-4 max-w-full md:max-w-[55%]">
        <ShimmerBlock className="w-20 sm:w-24 h-5 sm:h-6 rounded-full" />
        <ShimmerBlock className="w-[85%] max-w-[420px] sm:max-w-[500px] h-10 sm:h-14 md:h-16 lg:h-20 rounded-xl" />
        <div className="flex items-center gap-3 mt-1">
          <ShimmerBlock className="w-12 h-4 rounded-md" />
          <ShimmerBlock className="w-16 h-4 rounded-md" />
          <ShimmerBlock className="w-10 h-4 rounded-md" />
        </div>
        <ShimmerBlock className="w-[90%] max-w-[560px] h-16 sm:h-20 md:h-24 rounded-xl mt-1" />
        <div className="flex gap-3 sm:gap-4 mt-3 w-full sm:w-auto">
          <ShimmerBlock className="flex-1 sm:flex-none w-28 sm:w-36 h-10 md:h-12 rounded-xl" />
          <ShimmerBlock className="flex-1 sm:flex-none w-32 sm:w-40 h-10 md:h-12 rounded-xl" />
        </div>
      </div>
    </section>
  );
}

// ─── 3. Horizontal Content Rail (Movie / TV cards) ───────────────────────
export function SectionRail({ count = 8 }) {
  return (
    <section className="mb-8 md:mb-10 w-full overflow-hidden px-3 sm:px-6 md:px-12">
      <ShimmerBlock className="w-40 sm:w-52 md:w-64 h-5 sm:h-6 md:h-7 rounded-md mb-3 md:mb-4" />
      <div className="flex gap-2.5 sm:gap-3.5 overflow-hidden py-4 -my-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-28 sm:w-32 md:w-40 lg:w-44 xl:w-52 flex flex-col gap-2"
          >
            <ShimmerBlock className="w-full aspect-[2/3] rounded-xl shadow-inner" />
            <ShimmerBlock className="w-3/4 h-3 rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 4. Studio Tiles Rail ────────────────────────────────────────────────
export function StudioRail({ count = 6 }) {
  return (
    <section className="mb-8 md:mb-10 w-full overflow-hidden px-3 sm:px-6 md:px-12">
      <ShimmerBlock className="w-32 sm:w-44 md:w-52 h-5 sm:h-6 md:h-7 rounded-md mb-3 md:mb-4" />
      <div className="flex gap-2.5 sm:gap-3.5 overflow-hidden py-4 -my-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
          >
            <ShimmerBlock className="w-full h-full rounded-2xl" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 5. Detail Modal / Watch Dialog ──────────────────────────────────────
export function DetailPage() {
  return (
    <div className="w-full max-w-[950px] mx-auto p-4 sm:p-6 md:p-8 bg-[#0e0e14] rounded-3xl border border-white/10 space-y-6">
      {/* Backdrop area */}
      <ShimmerBlock className="w-full h-[35vh] sm:h-[45vh] rounded-2xl" />

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <ShimmerBlock className="w-36 sm:w-44 md:w-52 aspect-[2/3] rounded-xl flex-shrink-0 mx-auto md:mx-0 shadow-lg" />

        <div className="flex-1 flex flex-col gap-3.5">
          <ShimmerBlock className="w-[75%] max-w-[400px] h-8 sm:h-10 md:h-12 rounded-xl" />
          <ShimmerBlock className="w-[45%] max-w-[240px] h-4 rounded-md" />

          {/* Chips */}
          <div className="flex gap-2 mt-1">
            <ShimmerBlock className="w-16 h-6 rounded-full" />
            <ShimmerBlock className="w-20 h-6 rounded-full" />
            <ShimmerBlock className="w-14 h-6 rounded-full" />
          </div>

          <ShimmerBlock className="w-full h-20 sm:h-28 rounded-xl mt-2" />

          {/* Action buttons */}
          <div className="flex gap-3 mt-2">
            <ShimmerBlock className="w-32 h-10 rounded-xl" />
            <ShimmerBlock className="w-28 h-10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 6. Live Broadcast Hero Arena ────────────────────────────────────────
export function LiveHeroSkeleton() {
  return (
    <section className="relative w-full border-b border-white/[0.08] bg-[#08080d] overflow-hidden p-4 sm:p-8 lg:p-12">
      <div className="max-w-[1600px] mx-auto space-y-5">
        {/* Top Badges */}
        <div className="flex items-center gap-2">
          <ShimmerBlock className="w-20 h-6 rounded-full" />
          <ShimmerBlock className="w-28 h-6 rounded-full" />
          <ShimmerBlock className="w-24 h-6 rounded-full" />
        </div>

        {/* 3-Column Scoreboard Arena */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6 bg-white/[0.03] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-2xl">
          {/* Home */}
          <div className="flex items-center gap-3">
            <ShimmerBlock className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl" />
            <ShimmerBlock className="w-24 sm:w-36 h-5 rounded-md" />
          </div>
          {/* VS */}
          <ShimmerBlock className="w-9 h-9 sm:w-11 sm:h-11 rounded-full" />
          {/* Away */}
          <div className="flex items-center justify-end gap-3">
            <ShimmerBlock className="w-24 sm:w-36 h-5 rounded-md" />
            <ShimmerBlock className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl" />
          </div>
        </div>

        {/* Title & Description */}
        <ShimmerBlock className="w-64 sm:w-96 h-7 rounded-lg" />

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <ShimmerBlock className="w-40 sm:w-48 h-12 rounded-xl" />
          <ShimmerBlock className="w-24 sm:w-28 h-12 rounded-xl" />
        </div>
      </div>
    </section>
  );
}

// ─── 7. Live Match Cards (Rail or Grid) ───────────────────────────────────
export function LiveMatchSkeleton({ count = 4, layout = 'rail' }) {
  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-4 md:px-0">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="w-full rounded-2xl bg-[#12121c] border border-white/10 overflow-hidden"
          >
            <ShimmerBlock className="aspect-video w-full rounded-none" />
            <div className="p-3 space-y-2">
              <ShimmerBlock className="w-3/4 h-3.5 rounded-md" />
              <div className="flex justify-between items-center pt-1">
                <ShimmerBlock className="w-1/3 h-2.5 rounded-md" />
                <ShimmerBlock className="w-12 h-4 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 overflow-hidden px-2 sm:px-4 md:px-0 py-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="shrink-0 w-[260px] xs:w-[290px] sm:w-[330px] md:w-[350px] rounded-2xl bg-[#12121c] border border-white/10 overflow-hidden"
        >
          <ShimmerBlock className="aspect-video w-full rounded-none" />
          <div className="p-3 space-y-2">
            <ShimmerBlock className="w-3/4 h-3.5 rounded-md" />
            <div className="flex justify-between items-center pt-1">
              <ShimmerBlock className="w-1/3 h-2.5 rounded-md" />
              <ShimmerBlock className="w-12 h-4 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 8. Live 24/7 Channel Cards (Rail or Grid) ───────────────────────────
export function LiveChannelSkeleton({ count = 5, layout = 'rail' }) {
  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 px-2 sm:px-4 md:px-0">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="w-full rounded-2xl bg-[#12121c] border border-white/10 overflow-hidden"
          >
            <ShimmerBlock className="aspect-[16/10] w-full rounded-none" />
            <div className="p-2.5 sm:p-3 space-y-1.5">
              <ShimmerBlock className="w-2/3 h-3.5 rounded-md" />
              <ShimmerBlock className="w-1/2 h-2.5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 sm:gap-3.5 overflow-hidden px-2 sm:px-4 md:px-0 py-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="shrink-0 w-[150px] xs:w-[180px] sm:w-[220px] md:w-[250px] rounded-2xl bg-[#12121c] border border-white/10 overflow-hidden"
        >
          <ShimmerBlock className="aspect-[16/10] w-full rounded-none" />
          <div className="p-2.5 sm:p-3 space-y-1.5">
            <ShimmerBlock className="w-2/3 h-3.5 rounded-md" />
            <ShimmerBlock className="w-1/2 h-2.5 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 9. Full LiveSection Skeleton (Header + Pills + Match Rail) ───────────
export function LiveSectionSkeleton({ count = 4, layout = 'rail' }) {
  return (
    <section className="relative flex flex-col gap-3 sm:gap-4 my-4 sm:my-6 px-2 sm:px-4 md:px-0">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <ShimmerBlock className="w-3 h-3 rounded-full" />
          <ShimmerBlock className="w-48 sm:w-64 h-6 sm:h-7 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <ShimmerBlock className="w-36 h-9 rounded-xl" />
          <ShimmerBlock className="w-9 h-9 rounded-xl" />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-hidden py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <ShimmerBlock key={i} className="w-20 sm:w-24 h-7 rounded-full shrink-0" />
        ))}
      </div>

      {/* Cards Rail or Grid */}
      <LiveMatchSkeleton count={count} layout={layout} />
    </section>
  );
}

// ─── 10. Cinema Video Player Viewport ────────────────────────────────────
export function PlayerSkeleton() {
  return (
    <div className="relative w-full aspect-video sm:h-[60vh] md:h-[70vh] bg-black rounded-none sm:rounded-2xl border border-white/10 overflow-hidden flex flex-col items-center justify-center p-6 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#E50914] animate-spin shadow-[0_0_20px_rgba(229,9,20,0.5)]" />
        <ShimmerBlock className="w-44 h-4 rounded-md" />
        <ShimmerBlock className="w-32 h-3 rounded-md" />
      </div>
    </div>
  );
}

// ─── 11. Search Results Skeleton ─────────────────────────────────────────
export function SearchSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Top Results Rail */}
      <div className="space-y-3 px-3 md:px-12">
        <ShimmerBlock className="w-48 h-6 rounded-md" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-36 sm:w-44 shrink-0 space-y-2">
              <ShimmerBlock className="w-full aspect-[2/3] rounded-xl" />
              <ShimmerBlock className="w-3/4 h-3 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="space-y-3 px-3 md:px-12">
        <ShimmerBlock className="w-36 h-6 rounded-md" />
        <CardGrid count={12} />
      </div>
    </div>
  );
}

// ─── Main Skeleton Switcher Component ─────────────────────────────────────
const Skeleton = ({ type = 'card', count = 6, layout = 'rail' }) => {
  const safeCount = Math.min(Math.max(Math.round(count) || 6, 1), 24);

  return (
    <>
      <style>{SHIMMER_STYLE}</style>

      <div role="status" aria-label="Loading content">
        <span className="sr-only">Loading…</span>
        <div aria-hidden="true">
          {type === 'card' && <CardGrid count={safeCount} />}
          {type === 'banner' && <BannerBlock />}
          {type === 'section' && <SectionRail count={safeCount} />}
          {type === 'studio' && <StudioRail count={safeCount} />}
          {type === 'detail' && <DetailPage />}
          {type === 'live-hero' && <LiveHeroSkeleton />}
          {type === 'live-match' && <LiveMatchSkeleton count={safeCount} layout={layout} />}
          {type === 'live-channel' && <LiveChannelSkeleton count={safeCount} layout={layout} />}
          {type === 'live-section' && <LiveSectionSkeleton count={safeCount} layout={layout} />}
          {type === 'player' && <PlayerSkeleton />}
          {type === 'search' && <SearchSkeleton />}
        </div>
      </div>
    </>
  );
};

export default React.memo(Skeleton);
