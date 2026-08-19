import React, { useState } from 'react';

const Card = React.memo(({ id, name, img, type, rating = 0, hideRating, width, height, onPlay, sow, rank }) => {
  const [imgError, setImgError] = useState(false);

  // Condense play handler
  const action = () => (onPlay || sow)?.(id, type);

  // Convert 10-point rating to percentage (e.g., 8.5 -> 85%)
  const pct = Math.round(rating * 10);
  const color = pct >= 70 ? 'border-green-500 text-green-400'
    : pct >= 40 ? 'border-yellow-500 text-yellow-400'
      : 'border-red-500 text-red-400';

  // Base card content
  const cardContent = (
    <div
      role="button"
      tabIndex={0}
      title={name}
      onClick={action}
      onKeyDown={(e) => ['Enter', ' '].includes(e.key) && action()}
      style={{ width: width || undefined, height: height || undefined }}
      className={`relative flex-shrink-0 w-28 sm:w-32 md:w-40 lg:w-44 xl:w-52 ${!height ? 'aspect-[2/3]' : ''} overflow-hidden bg-gray-900 cursor-pointer transition-all hover:scale-105 hover:z-30 hover:shadow-2xl focus:ring-2 rounded focus:ring-cyan-400`}
    >
      {/* Image or Fallback */}
      {img && !imgError ? (
        <img src={img} alt={name} loading="lazy" onError={() => setImgError(true)} className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center h-full p-2 text-center text-sm text-gray-500 font-bold">{name || 'N/A'}</div>
      )}

      {/* Circular Percentage Rating */}
      {!hideRating && rating > 0 && (
        <div className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full border-2 bg-black/80 backdrop-blur-sm transition-opacity ${color}`}>
          <span className="text-[10px] font-bold">{pct}%</span>
        </div>
      )}
    </div>
  );

  // If it's a Top 10 item, wrap it with the ranking number styling
  if (rank) {
    return (
      <div className="relative flex items-center justify-end pl-10 sm:pl-12 md:pl-20 py-2 sm:py-4 group">
        <div
          className="absolute left-0 bottom-[2%]  md:bottom-[5%] text-[100px] sm:text-[120px] md:text-[200px] lg:text-[230px] font-black leading-none text-[#211f1f7c] select-none tracking-tighter drop-shadow-2xl transition-transform duration-300 origin-bottom-left"
          style={{
            WebkitTextStroke: '4px #595959',
            textShadow: '0px 10px 20px rgba(0,0,0,0.8)'
          }}
        >
          {rank}
        </div>

        <div className="relative z-10 w-full ml-4 md:ml-8 transform transition-transform duration-300 ">
          {cardContent}
        </div>
      </div>
    );
  }

  // Default render for non-ranked items
  return cardContent;
});

export default Card;