import React, { useState } from 'react';

const Card = React.memo(({ id, name, img, type, rating = 0, hideRating, width, height, onPlay, sow, rank }) => {
  const [imgError, setImgError] = useState(false);

  // Condense play handler
  const action = () => (onPlay || sow)?.(id, type);

  // Convert 10-point rating to percentage (e.g., 8.5 -> 85%)
  const pct = Math.round(rating * 10);

  // Refined badge colors with subtle backgrounds
  const color = pct >= 70 ? 'bg-green-500/20 text-green-400 border-green-500/50'
    : pct >= 40 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      : 'bg-red-500/20 text-red-400 border-red-500/50';

  return (
    // 'group' allows us to trigger child animations based on parent hover
    <div className="group relative flex items-end cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-30"
      onClick={action}
    >

      {/* Rank Number (Netflix Top 10 style outline) */}
      {rank && (
        <div
          className="absolute tracking-[-25px] bottom-0 z-20 font-black text-[clamp(4rem,8vw,8rem)] leading-none text-black drop-shadow-lg"
          style={{ WebkitTextStroke: '2px #dc2626' }} // Tailwind's red-600
        >
          {rank}
        </div>
      )}

      {/* Main Card Container */}
      <div
        role="button"
        tabIndex={0}
        title={name}

        onKeyDown={(e) => ['Enter', ' '].includes(e.key) && action()}
        style={{ width: width || undefined, height: height || undefined }}
        className={`
          relative z-10 flex-shrink-0 w-28 sm:w-32 md:w-40 lg:w-44 xl:w-52
          ${!height ? 'aspect-[2/3]' : ''}
          overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 to-gray-950
          shadow-lg ring-1 ring-white/10 transition-all duration-300
          group-hover:ring-cyan-400  group-hover:shadow-2xl
          ${rank ? 'ml-8 sm:ml-12 md:ml-16' : ''} 
        `}
      >
        {/* Image or Fallback */}
        {img && !imgError ? (
          <img
            src={img}
            alt={name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <svg className="mb-2 h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs sm:text-sm font-bold text-gray-400 line-clamp-2">{name || 'Unknown'}</span>
          </div>
        )}

        {/* Hover Overlay with Glassmorphism Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
          <div className="translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md ring-1 ring-white/50">
              <svg className="ml-1 h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Circular Percentage Rating */}
        {!hideRating && rating > 0 && (
          <div className={`absolute right-2 top-2 flex  items-center justify-center rounded border bg-black/60 backdrop-blur-md ${color} shadow-lg`}>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-tighter">{pct}%</span>
          </div>
        )}
      </div>

    </div>
  );
});

export default Card;