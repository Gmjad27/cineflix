import React, { useState } from 'react';

const Card = React.memo(
  ({
    id,
    name,
    img,
    type,
    rating = 0,
    hideRating,
    width,
    height,
    onPlay,
    sow,
    rank,
  }) => {
    const [imgError, setImgError] = useState(false);

    const action = () => {
      (onPlay || sow)?.(id, type);
    };

    const pct = Math.round(rating * 10);

    const color =
      pct >= 70
        ? 'bg-green-500/20 text-green-400 border-green-500/50'
        : pct >= 40
          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
          : 'bg-red-500/20 text-red-400 border-red-500/50';

    return (
      <div
        className="
          group relative flex items-end cursor-pointer
          z-0 hover:z-30
          sm:transition-transform sm:duration-300 sm:hover:scale-105
        "
        onClick={action}
      >
        {/* Ranking */}
        {rank && (
          <div
            className="
              absolute bottom-0 left-0 z-20
              font-black leading-none
              text-[clamp(4rem,8vw,16rem)]
              tracking-[-20px]
              text-black
            "
            style={{
              WebkitTextStroke: '2px #dc2623',
            }}
          >
            {rank}
          </div>
        )}

        {/* Card */}
        <div
          role="button"
          tabIndex={0}
          title={name}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              action();
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
            overflow-hidden rounded-lg
            bg-gray-900
            ring-1 ring-white/10

            /* Mobile: no expensive animation */
            sm:shadow-lg
            sm:transition-shadow
            sm:duration-300
            sm:group-hover:shadow-2xl

            ${rank ? 'ml-8 sm:ml-12 md:ml-16' : ''}
          `}
        >
          {/* Image */}
          {img && !imgError ? (
            <img
              src={img}
              alt={name || 'Movie'}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="
                block
                h-full w-full
                object-cover

                /* Only animate on desktop */
                sm:transition-transform
                sm:duration-700
                sm:group-hover:scale-110
              "
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
              <svg
                className="mb-2 h-8 w-8 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>

              <span className="text-xs font-bold text-gray-400 line-clamp-2 sm:text-sm">
                {name || 'Unknown'}
              </span>
            </div>
          )}

          {/* Rating */}
          {!hideRating && rating > 0 && (
            <div
              className={`
                absolute right-1 top-1
                flex items-center justify-center
                rounded border
                bg-black/70
                ${color}
                shadow-lg
                px-1.5 py-0.5
              `}
            >
              <span className="text-[9px] font-bold tracking-tighter sm:text-[10px]">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;