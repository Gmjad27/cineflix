import React, { useState, useEffect } from 'react';

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

    useEffect(() => {
      setImgError(false);
    }, [img]);

    const handleMainAction = () => {
      (onPlay || sow)?.(id, type);
    };

    const matchPct = rating > 0 ? Math.min(Math.round(rating * 10), 99) : null;
    const isDoubleDigitRank = Number(rank) >= 10;

    return (
      <div
        role="button"
        tabIndex={0}
        title={name}
        aria-label={rank ? `#${rank} ${name || 'Title'}` : name || 'Title'}
        onClick={handleMainAction}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMainAction();
          }
        }}
        className="group relative flex items-end shrink-0 cursor-pointer select-none focus-visible:outline-none"
      >
        {/* Flat Lightweight Rank Number */}
        {rank && (
          <span
            aria-hidden="true"
            className={`
              pointer-events-none absolute left-0 bottom-0 z-30 shrink-0 select-none
              font-black leading-[0.74] tabular-nums
              ${isDoubleDigitRank
                ? 'text-[5.25rem] sm:text-[6.75rem] md:text-[8.25rem] lg:text-[9.25rem] tracking-[-0.1em]'
                : 'text-[6rem] sm:text-[7.5rem] md:text-[9rem] lg:text-[10rem] tracking-[-0.06em]'
              }
              text-[#0b0b0b]
              [-webkit-text-stroke:2.5px_#5b5b5b] sm:[-webkit-text-stroke:3px_#5b5b5b]
              transition-colors duration-300
              sm:group-hover:[-webkit-text-stroke:3px_#a3a3a3]
            `}
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
          style={{
            width: width || undefined,
            height: height || undefined,
          }}
          className={`
            relative z-10 shrink-0
            w-[116px] sm:w-36 md:w-44 lg:w-48 xl:w-52
            ${!height ? 'aspect-[2/3]' : ''}
            overflow-hidden rounded-md
            bg-[#181818]
            ring-1 ring-white/10
            transition-all duration-200 ease-out
            active:scale-[0.96] active:ring-white/40
            sm:group-hover:ring-white/35 sm:group-hover:-translate-y-1 sm:group-hover:shadow-xl sm:group-hover:shadow-black/60
            group-focus-visible:ring-2 group-focus-visible:ring-red-500
            ${rank
              ? isDoubleDigitRank
                ? 'ml-8 sm:ml-11 md:ml-14 lg:ml-16'
                : 'ml-7 sm:ml-9 md:ml-12 lg:ml-14'
              : ''
            }
          `}
        >
          {/* Top-Left Brand + Match Badge */}
          <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 pointer-events-none">
            <span className="font-black text-[#E50914] text-xs sm:text-sm tracking-tighter drop-shadow">
              C
            </span>
            {!hideRating && matchPct && (
              <span className="bg-black/85 border border-white/10 text-[#46d369] font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded transition-opacity duration-150 sm:group-hover:opacity-0">
                {matchPct}%
              </span>
            )}
          </div>

          {/* Top-Right TOP 10 Ribbon */}
          {rank && (
            <div
              className="
                absolute top-0 right-2 z-20 pointer-events-none
                bg-[#E50914] text-white font-black
                px-1.5 pt-1 pb-2
                flex flex-col items-center justify-center
                leading-none shadow-md
              "
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
              }}
            >
              <span className="text-[6px] sm:text-[7px] tracking-wider uppercase">
                TOP
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-tighter">
                10
              </span>
            </div>
          )}

          {/* Poster Image */}
          {img && !imgError ? (
            <img
              src={img}
              alt={name || 'Poster'}
              loading="lazy"
              decoding="async"
              draggable="false"
              onError={() => setImgError(true)}
              className="block h-full w-full object-cover transition-transform duration-300 ease-out sm:group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-3 text-center bg-[#141414]">
              <div className="text-2xl font-black text-[#E50914] mb-1">C</div>
              <span className="text-[11px] font-semibold text-gray-300 line-clamp-2">
                {name || 'Unknown Title'}
              </span>
            </div>
          )}

          {/* Desktop-Only Hover Info Overlay (Hidden on mobile so taps don't stick) */}
          <div
            className="
              hidden sm:flex absolute inset-0 z-20 flex-col justify-end p-2.5 md:p-3
              bg-gradient-to-t from-black/95 via-black/50 to-transparent
              opacity-0 sm:group-hover:opacity-100
              transition-opacity duration-200 pointer-events-none
            "
          >
            <p className="text-xs md:text-sm font-bold text-white line-clamp-2 leading-tight mb-1">
              {name}
            </p>
            <div className="flex items-center justify-between text-[10px] font-semibold text-gray-300">
              {!hideRating && matchPct ? (
                <span className="text-[#46d369] font-bold">{matchPct}% Match</span>
              ) : (
                <span>{type}</span>
              )}
              <span className="inline-flex items-center gap-1 text-white bg-[#E50914] px-2 py-0.5 rounded-full text-[9px] font-bold">
                <i className="fa-solid fa-play text-[8px]" /> Play
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;