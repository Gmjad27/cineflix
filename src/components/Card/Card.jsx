import React, { useState } from 'react';

const Card = React.memo(
  ({
    id,
    name,
    img,
    type = 'Movie',
    rating = 0,
    hideRating,
    width,
    height,
    onPlay,
    sow,
    rank,
  }) => {
    const [imgError, setImgError] = useState(false);

    const handleMainAction = () => {
      (onPlay || sow)?.(id, type);
    };

    const matchPct = rating > 0 ? Math.min(Math.round(rating * 10), 99) : null;

    return (
      <div
        className="group relative flex items-end cursor-pointer select-none"
        onClick={handleMainAction}
      >
        {/* Flat Lightweight Rank */}
        {rank && (
          <span
            aria-hidden="true"
            className="
              pointer-events-none absolute z-30 shrink-0 select-none
              font-black leading-[0.72] tracking-[-20px]
              text-[6.5rem] sm:text-[8rem] md:text-[9.5rem]
              text-[#0b0b0b]
              [-webkit-text-stroke:3px_#5b5b5b]
              transition-colors duration-300
              group-hover:[-webkit-text-stroke:3px_#9c9c9c]
             
            "
            style={{
              paintOrder: 'stroke fill',
              fontFamily: "'Bebas Neue', Impact, 'Arial Black', sans-serif",
            }}
          >
            {rank}
          </span>
        )}

        {/* Poster Card */}
        <div
          role="button"
          tabIndex={0}
          title={name}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleMainAction();
            }
          }}
          style={{
            width: width || undefined,
            height: height || undefined,
          }}
          className={`
            relative z-10 flex-shrink-0
            w-28 sm:w-32 md:w-40 lg:w-44 xl:w-52
            ${!height ? 'aspect-[2/3]' : ''}
            overflow-hidden rounded-[4px]
            bg-[#181818d1]
            ring-1 ring-white/10
            hover:ring-white/30
            ${rank ? 'ml-6 sm:ml-9 md:ml-12' : ''}
          `}
        >
          {/* Top Left "N" Badge */}
          <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 pointer-events-none">
            <span className="font-black text-[#E50914] text-xs sm:text-sm tracking-tighter">
              C
            </span>
            {rank && (
              <span className="bg-[#E50914] text-white text-[7px] font-black uppercase px-1 py-0.2 rounded-[1px] tracking-wider">
                TOP 10
              </span>
            )}
          </div>

          {/* Image */}
          {img && !imgError ? (
            <img
              src={img}
              alt={name || 'Poster'}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="block h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-3 text-center bg-[#141414]">
              <div className="text-2xl font-black text-[#E50914] mb-1">N</div>
              <span className="text-[11px] font-semibold text-gray-300 line-clamp-2">
                {name || 'Unknown Title'}
              </span>
            </div>
          )}

          {/* Static Match Badge */}
          {!hideRating && matchPct && (
            <div className="absolute top-1.5 right-1.5 z-20 group-hover:opacity-0">
              <span className="bg-black/90 border border-white/10 text-[#46d369] font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded">
                {matchPct}%
              </span>
            </div>
          )}

          {/* Lightweight Hover Overlay (Simple Opacity Fade Only) */}
          {/* <div
            className="
              absolute inset-0 z-30 flex flex-col justify-end p-2.5 sm:p-3
              bg-gradient-to-t from-black via-black/80 to-transparent
              opacity-0 group-hover:opacity-100
              transition-opacity duration-150
            "
          >


            
          </div> */}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;