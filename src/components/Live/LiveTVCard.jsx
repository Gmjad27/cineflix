import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NETWORK_COLORS = {
  'Sony Sports': 'from-blue-600/30 to-indigo-900/40 border-blue-500/40',
  Willow: 'from-emerald-600/30 to-green-900/40 border-emerald-500/40',
  Astro: 'from-rose-600/30 to-red-900/40 border-rose-500/40',
  'TNT Sports': 'from-fuchsia-600/30 to-pink-900/40 border-pink-500/40',
  'Sky Sports': 'from-sky-600/30 to-blue-900/40 border-sky-500/40',
  'Fox Sports': 'from-amber-600/30 to-yellow-900/40 border-amber-500/40',
};

const LiveTVCard = ({ channel, onSelect }) => {
  const navigate = useNavigate();
  const [badgeError, setBadgeError] = useState(false);

  useEffect(() => {
    setBadgeError(false);
  }, [channel.badge]);

  const handleClick = () => {
    if (typeof onSelect === 'function') {
      onSelect(channel);
    } else {
      navigate(`/live-stream/${channel.streamId || channel.id}`, {
        state: { stream: channel },
      });
    }
  };

  const networkGradient =
    NETWORK_COLORS[channel.network] ||
    'from-neutral-800/50 to-neutral-950/60 border-white/10';

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Watch ${channel.name} Live`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative flex flex-col shrink-0 w-[168px] sm:w-[215px] md:w-[245px] lg:w-[260px] rounded-xl overflow-hidden cursor-pointer select-none bg-[#141414] border border-white/10 transition-all duration-200 active:scale-[0.97] active:border-red-500/70 sm:hover:border-red-600 sm:hover:-translate-y-1 sm:hover:shadow-lg sm:hover:shadow-red-900/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    >
      {/* Background Frame */}
      <div
        className={`relative aspect-video w-full overflow-hidden bg-gradient-to-br ${networkGradient} flex items-center justify-center p-2.5 sm:p-3`}
      >
        {channel.bg && (
          <img
            src={channel.bg}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-25 transition-all duration-300 sm:group-hover:scale-105 sm:group-hover:opacity-35"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/55 to-transparent" />

        {/* Live Indicator */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[8px] sm:text-[9px] tracking-wider uppercase shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </div>

        {/* HD Badge + Stream ID */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          {channel.streamId && (
            <span className="text-[8px] sm:text-[9px] font-semibold text-gray-300 bg-black/65 px-1.5 py-0.5 rounded border border-white/10">
              #{channel.streamId}
            </span>
          )}
          {channel.hd && (
            <span className="text-[8px] sm:text-[9px] font-black text-amber-400 bg-black/80 px-1.5 py-0.5 rounded border border-amber-400/30">
              HD
            </span>
          )}
        </div>

        {/* Channel Center Logo Plate */}
        <div className="relative z-10 w-24 h-11 sm:w-28 sm:h-14 md:w-32 md:h-16 flex items-center justify-center p-2 rounded-lg bg-black/80 backdrop-blur-sm border border-white/15 transition-colors shadow-md sm:group-hover:border-white/40">
          {/* {!badgeError && channel.badge ? (
            <img
              src={channel.badge}
              alt={channel.name}
              loading="lazy"
              onError={() => setBadgeError(true)}
              className="max-h-full max-w-full object-contain drop-shadow"
            />
          ) : ( */}
            <div className="flex flex-col items-center gap-0.5 text-center px-1">
              <i className="fa-solid fa-satellite-dish text-red-500 text-xs sm:text-sm md:text-base" />
              <span className="text-[9px] sm:text-[10px] font-black text-white truncate max-w-[84px] sm:max-w-[105px]">
                {channel.name}
              </span>
            </div>
         
        </div>

        {/* Desktop-Only Hover Action Overlay (Hidden on mobile so taps don't stick) */}
        <div className="hidden sm:flex absolute inset-0 bg-black/60 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 items-center justify-center z-20">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E50914] text-white font-bold text-xs shadow-lg transform scale-95 sm:group-hover:scale-100 transition-transform duration-200">
            <i className="fa-solid fa-play text-[10px]" />
            <span>Watch Live</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-2.5 sm:p-3 bg-[#161616] flex flex-col gap-1 border-t border-white/5">
        <div className="flex items-center justify-between gap-1.5">
          <h3 className="text-xs sm:text-sm font-bold text-white truncate transition-colors sm:group-hover:text-red-400">
            {channel.name}
          </h3>
          <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400 shrink-0">
            {channel.viewers || 'Live'}
          </span>
        </div>

        <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">
          {channel.currentShow || channel.category || '24/7 Live Broadcast'}
        </p>
      </div>
    </div>
  );
};

export default React.memo(LiveTVCard);