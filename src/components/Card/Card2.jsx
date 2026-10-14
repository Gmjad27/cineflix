import React, { useState } from 'react';
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
  color = 'rgba(59, 130, 246, 0.5)' // Default subtle blue glow
}) => {
  const [imageError, setImageError] = useState(false);
  const handleClick = onClick || stu;
  const path = `/studio/${encodeURIComponent(studio)}`;

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
        group relative flex flex-shrink-0 items-center justify-center 
        overflow-hidden cursor-pointer select-none
        
        /* Dimensions */
        w-36 h-20 sm:w-44 sm:h-28 md:w-52 md:h-32 lg:w-64 lg:h-36
        rounded-2xl

        /* Base Glass / Dark Surface */
        bg-gradient-to-b from-neutral-800/80 to-neutral-900/90
        backdrop-blur-md
        border border-white/10
        shadow-md

        /* Transitions */
        transition-all duration-300 ease-out
        motion-reduce:transition-none motion-reduce:hover:transform-none

        /* Interactive Hover & Focus State */
        hover:z-20
        hover:-translate-y-1 hover:scale-[1.03]
        hover:border-white/25
        hover:shadow-[0_12px_32px_-4px_var(--studio-accent)]

        focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
      "
    >
      {/* 1. Dynamic Ambient Background Glow on Hover */}
      <div
        className="
          pointer-events-none absolute inset-0 
          opacity-0 transition-opacity duration-500 ease-out
          group-hover:opacity-20
        "
        style={{
          background: `radial-gradient(circle at center, var(--studio-accent) 0%, transparent 70%)`
        }}
      />

      {/* 2. Glass Shine / Reflection Sweep */}
      <div
        className="
          pointer-events-none absolute -inset-full top-0 block 
          w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent 
          opacity-0 transition-all duration-700 ease-out
          group-hover:translate-x-[350%] group-hover:opacity-100
        "
      />

      {/* 3. Studio Logo / Graphic */}
      {!imageError && bg ? (
        <img
          src={bg}
          alt={`${studio} logo`}
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={() => setImageError(true)}
          className="
            relative z-10 block w-[90%] h-[99%] max-h-full max-w-full
            object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]
            transition-transform duration-300 ease-out
            group-hover:scale-105
          "
        />
      ) : (
        /* Fallback text if image is missing or fails to load */
        <span className="relative z-10 px-3 text-center text-sm font-semibold tracking-wide text-neutral-200 group-hover:text-white sm:text-base">
          {studio}
        </span>
      )}
    </Link>
  );
};

export default React.memo(StudioCard);