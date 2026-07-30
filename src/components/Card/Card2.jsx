import React from 'react';
import { Link } from 'react-router-dom';

const Card2 = ({ bg, studio, stu, color }) => {
  // Update the path to match the "/studio/:id" route
  // e.g., if studio is "marvel", this becomes "/studio/marvel"
  const path = `/studio/${encodeURIComponent(studio)}`;

  return (
    <Link
      to={path}
      aria-label={`Visit ${studio} studio`}
      onClick={() => {
        if (typeof stu === "function") stu();
      }}
      className="group flex flex-shrink-0 w-36 h-20 items-center justify-center sm:h-36 sm:w-44 md:w-52 lg:w-64 rounded-xl transition-all duration-300 ease-out hover:scale-105 hover:z-20 outline outline-[3px] outline-offset-[-3px] outline-[#2a2a2a] hover:outline-white/80 cursor-pointer shadow-lg hover:shadow-[0_10px_30px_var(--studio-glow)] overflow-hidden"
      style={{
        '--studio-glow': color || 'rgba(255, 255, 255, 0.4)'
      }}
    >
      <div 
        className="w-[90%] h-64 inset-1 bg-contain bg-center bg-no-repeat ease-in-out"
        style={{ backgroundImage: `url('${bg}')` }}
      />
    </Link>
  );
};

export default React.memo(Card2);