import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LiveTVCard = ({ channel, onSelect }) => {
  const navigate = useNavigate();
  const [badgeError, setBadgeError] = useState(false);

  const handleClick = () => {
    if (typeof onSelect === 'function') {
      onSelect(channel);
    } else {
      navigate(`/live-stream/${channel.id}`, { state: { stream: channel } });
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative flex flex-col flex-shrink-0 w-[170px] xs:w-[190px] sm:w-[220px] md:w-[240px] rounded-lg overflow-hidden cursor-pointer select-none bg-[#141414] border border-white/10 hover:border-red-600 transition-colors duration-150"
    >
      {/* Background Frame */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900 flex items-center justify-center p-2.5 sm:p-3">
        {channel.bg && (
          <img
            src={channel.bg}
            alt={channel.name}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />

        {/* Live Indicator */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600 text-white font-extrabold text-[8px] sm:text-[9px] tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          LIVE TV
        </div>

        {/* HD Badge */}
        {channel.hd && (
          <div className="absolute top-2 right-2 z-10 text-[8px] sm:text-[9px] font-black text-amber-400 bg-black/80 px-1 py-0.5 rounded border border-amber-400/20">
            HD
          </div>
        )}

        {/* Channel Center Logo Plate */}
        <div className="relative z-10 w-16 h-11 sm:w-20 sm:h-13 md:w-24 md:h-15 flex items-center justify-center p-1 rounded-md bg-black/80 border border-white/10 group-hover:border-white/30 transition-colors">
          {!badgeError && channel.badge ? (
            <img
              src={channel.badge}
              alt={channel.name}
              onError={() => setBadgeError(true)}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-0.5 text-center">
              <i className="fa-solid fa-tv text-red-500 text-sm sm:text-base" />
              <span className="text-[8px] sm:text-[9px] font-bold text-white truncate max-w-[65px]">
                {channel.name}
              </span>
            </div>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E50914] text-white font-bold text-[11px] shadow-md">
            <i className="fa-solid fa-play text-[9px]" />
            <span>Watch Live</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-2 sm:p-2.5 bg-[#161616] flex flex-col gap-0.5 border-t border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] sm:text-xs font-bold text-white truncate group-hover:text-red-500 transition-colors">
            {channel.name}
          </h3>
          <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400">
            {channel.viewers || 'Live'}
          </span>
        </div>

        <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">
          {channel.currentShow || channel.category || '24/7 Broadcast'}
        </p>
      </div>
    </div>
  );
};

export default React.memo(LiveTVCard);
