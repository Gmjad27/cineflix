import React from 'react';
import { Link } from 'react-router-dom';

const Card2 = ({ bg, studio, stu, color }) => {
  const path = `/studio/${encodeURIComponent(studio)}`;

  return (
    <Link
      to={path}
      aria-label={`Visit ${studio} studio`}
      onClick={() => {
        if (typeof stu === 'function') {
          stu();
        }
      }}
      className="
        group
        relative
        flex
        flex-shrink-0
        items-center
        justify-center
        overflow-hidden
        cursor-pointer

        w-36
        h-20
        rounded-xl

        bg-gray-400
        shadow-lg

        /* Desktop hover effects only */
        sm:h-36
        sm:w-44
        md:w-52
        lg:w-64

        sm:transition-[transform,box-shadow]
        sm:duration-300
        sm:ease-out

        sm:hover:z-20
        sm:hover:scale-[1.02]
        sm:hover:shadow-[0_10px_30px_var(--studio-glow)]
      "
      style={{
        '--studio-glow': color || 'rgba(255, 255, 255, 0.4)',
      }}
    >
      <img
        src={bg}
        alt={`${studio} logo`}
        loading="lazy"
        decoding="async"
        draggable="false"
        className="
          block
          w-[90%]
          h-full
          object-contain
          object-center

          /* Only animate image on desktop */
          sm:transition-transform
          sm:duration-300
          sm:ease-out
          sm:group-hover:scale-105
        "
      />
    </Link>
  );
};

export default React.memo(Card2);