import React from 'react';

const Card = (props) => {
  const poster = props.img || '';

  const openWatch = () => {
    if (typeof props.sow === 'function') {
      props.sow(props.id, props.type);
    }
  };

  // Use inline styles for width/height if custom props are passed
  const customWidth = props.width;
  const customHeight = props.height;

  // Convert a standard rating to a Netflix-style "% Match"
  const matchScore = props.rating ? (props.rating * 10).toFixed(0) + '%' : null;

  return (
    <div
      className={`
        group relative flex-shrink-0 
        w-32 sm:w-36 md:w-44 lg:w-48 xl:w-56 
        aspect-[2/3] 
        bg-[#181818] rounded-md overflow-hidden cursor-pointer 
        transition-all duration-300 ease-out hover:scale-110 hover:z-30
        shadow-md hover:shadow-2xl hover:ring-2 hover:ring-white/30
      `}
      style={{
        ...(customWidth && { width: `${customWidth}px` }),
        ...(customHeight && { height: `${customHeight}px` }),
      }}
      onClick={openWatch}
      title={props.name}
    >
      {/* Poster Image with inner zoom on hover */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
        style={{
          backgroundImage: poster ? `url(${poster})` : 'none',
        }}
      />

      {/* Fallback title when no poster is available */}
      {!poster && (
        <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-white text-sm sm:text-base font-bold bg-[#141414]/90 z-0">
          <span className="line-clamp-4 drop-shadow-md">{props.name}</span>
        </div>
      )}

      {/* Hover Overlays */}
      
      {/* 1. Bottom Gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
      
      {/* 2. Center Play Icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <i className="fa-regular fa-circle-play text-4xl sm:text-5xl text-white drop-shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300 delay-75"></i>
      </div>

      {/* Default Rating Badge (Hidden on hover) */}
      {!props.hideRating && props.rating !== undefined && props.rating > 0 && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-white bg-black/60 backdrop-blur-md rounded shadow-sm opacity-100 group-hover:opacity-0 transition-opacity duration-200 z-20">
          ⭐ {props.rating?.toFixed(1)}
        </div>
      )}

      {/* Netflix-style slide-up details on hover */}
      <div className="absolute bottom-0 left-0 w-full p-2 sm:p-3 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
        <h4 className="text-white text-xs sm:text-sm font-bold truncate drop-shadow-md mb-0.5">
          {props.name}
        </h4>
        <div className="flex items-center gap-2">
          {matchScore && (
            <span className="text-[#46d369] text-[10px] sm:text-xs font-bold drop-shadow-md">
              {matchScore} Match
            </span>
          )}
          {props.type === 'tv' && (
            <span className="border border-gray-400 px-1 text-[9px] font-bold text-gray-300 rounded-sm drop-shadow-md">TV</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Card);