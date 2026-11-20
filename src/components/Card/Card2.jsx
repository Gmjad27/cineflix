import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * StudioCard
 * @param {string} bg - Studio image/logo URL
 * @param {string} studio - Studio name
 * @param {function} [onClick] - Optional click callback
 * @param {function} [stu] - Backward-compatible click callback
 * @param {string} [color] - Brand accent/glow color (hex, rgb, or hsl)
 */
const StudioCard = ({
  bg,
  studio = '',
  onClick,
  stu,
  color = 'rgba(59, 130, 246, 0.5)',
}) => {
  const [imageError, setImageError] = useState(false);
  const handleClick = onClick || stu;
  const path = `/studio/${encodeURIComponent(studio)}`;

  useEffect(() => {
    setImageError(false);
  }, [bg]);

  return (
    <Link
      to={path}
      aria-label={`Visit ${studio} studio`}
      onClick={() => {
        if (typeof handleClick === 'function') {
          handleClick();
        }
      }}
      style={{
        '--studio-accent': color,
      }}
      className="
        group relative flex shrink-0 items-center justify-center
        overflow-hidden cursor-pointer select-none

        /* Responsive Dimensions */
        w-36 h-20 sm:w-44 sm:h-26 md:w-52 md:h-30 lg:w-60 lg:h-32
        rounded-xl sm:rounded-2xl

        /* Base Glass / Dark Surface */
        bg-gradient-to-b from-neutral-800/80 to-neutral-900/95
        backdrop-blur-md
        border border-white/10
        shadow-md

        /* Transitions */
        transition-all duration-300 ease-out
        motion-reduce:transition-none motion-reduce:transform-none

        /* Mobile Tap Feedback (No sticky hover) */
        active:scale-[0.96] active:border-white/30

        /* Desktop-Only Hover State */
        sm:hover:z-20
        sm:hover:-translate-y-1 sm:hover:scale-[1.03]
        sm:hover:border-white/25
        sm:hover:shadow-[0_12px_32px_-4px_var(--studio-accent)]

        /* Keyboard Focus */
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
      "
    >
      {/* 1. Ambient Brand Glow (Subtle on mobile, intensified on desktop hover) */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          opacity-10 sm:opacity-0 transition-opacity duration-500 ease-out
          sm:group-hover:opacity-25
        "
        style={{
          background:
            'radial-gradient(circle at center, var(--studio-accent) 0%, transparent 72%)',
        }}
      />

      {/* 2. Desktop-Only Glass Shine / Reflection Sweep */}
      <div
        aria-hidden="true"
        className="
          hidden sm:block pointer-events-none absolute -inset-full top-0
          w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent
          opacity-0 transition-all duration-700 ease-out
          sm:group-hover:translate-x-[350%] sm:group-hover:opacity-100
        "
      />

      {/* 3. Studio Logo / Graphic */}
      {!imageError && bg ? (
        <div className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-4 md:p-5">
          <img
            src={bg}
            alt={`${studio} logo`}
            loading="lazy"
            decoding="async"
            draggable="false"
            onError={() => setImageError(true)}
            className="
              max-h-full max-w-full object-contain
              drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]
              transition-transform duration-300 ease-out
              sm:group-hover:scale-105
            "
          />
        </div>
      ) : (
        /* Fallback text if image is missing or fails to load */
        <span className="relative z-10 px-3 text-center text-xs sm:text-sm md:text-base font-semibold tracking-wide text-neutral-200 transition-colors sm:group-hover:text-white line-clamp-2">
          {studio}
        </span>
      )}
    </Link>
  );
};

export default React.memo(StudioCard);