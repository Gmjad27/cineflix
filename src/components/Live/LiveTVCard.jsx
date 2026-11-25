import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NetworkLogo from './NetworkLogos';

const getChannelTheme = (name = '', network = '') => {
  const norm = `${name} ${network}`.toLowerCase();
  if (norm.includes('espn')) {
    return {
      gradient: 'from-[#1c0d0f] via-[#120708] to-[#080304]',
      category: 'SPORTS',
      defaultViewers: 10,
    };
  }
  if (norm.includes('nfl')) {
    return {
      gradient: 'from-[#1e0a12] via-[#13050a] to-[#090204]',
      category: 'AMERICAN FOOTBALL',
      defaultViewers: 10,
    };
  }
  if (norm.includes('abc')) {
    return {
      gradient: 'from-[#181824] via-[#0e0e16] to-[#07070c]',
      category: 'GENERAL',
      defaultViewers: 5,
    };
  }
  if (norm.includes('willow')) {
    return {
      gradient: 'from-[#032a1c] via-[#021a11] to-[#010d08]',
      category: 'CRICKET',
      defaultViewers: 2,
    };
  }
  if (norm.includes('nbc')) {
    return {
      gradient: 'from-[#1c152a] via-[#100c1a] to-[#07050d]',
      category: 'GENERAL',
      defaultViewers: 3,
    };
  }
  if (norm.includes('fox footy') || norm.includes('footy')) {
    return {
      gradient: 'from-[#2e1302] via-[#1b0a01] to-[#0d0400]',
      category: 'AUSTRALIAN FOOTBALL',
      defaultViewers: 7,
    };
  }
  if (norm.includes('fox')) {
    return {
      gradient: 'from-[#281305] via-[#180a02] to-[#0c0401]',
      category: 'FOOTBALL',
      defaultViewers: 8,
    };
  }
  if (norm.includes('sky')) {
    return {
      gradient: 'from-[#071d38] via-[#041224] to-[#020912]',
      category: 'FOOTBALL',
      defaultViewers: 12,
    };
  }
  if (norm.includes('cricket') || norm.includes('supersport')) {
    return {
      gradient: 'from-[#03261a] via-[#021810] to-[#010c08]',
      category: 'CRICKET',
      defaultViewers: 15,
    };
  }
  return {
    gradient: 'from-[#141420] via-[#0d0d16] to-[#07070c]',
    category: 'SPORTS',
    defaultViewers: 6,
  };
};

const LiveTVCard = ({
  channel,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
  className = '',
}) => {
  const navigate = useNavigate();
  const [badgeError, setBadgeError] = useState(false);

  const theme = getChannelTheme(channel?.name, channel?.network);
  const categoryText = (channel?.category || theme.category || 'Sports').toUpperCase();
  const viewersCount = channel?.viewerCount || channel?.viewers || theme.defaultViewers;

  const handleClick = () => {
    if (typeof onSelect === 'function') {
      onSelect(channel);
    } else {
      navigate(`/live-stream/${channel.streamId || channel.id}`, {
        state: { stream: channel },
      });
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (typeof onToggleFavorite === 'function') {
      onToggleFavorite(channel, e);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Watch ${channel?.name || 'Channel'} Live`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`
        group relative flex flex-col shrink-0
        w-[230px] sm:w-[260px] md:w-[285px] lg:w-[300px]
        cursor-pointer select-none touch-manipulation
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-xl
        ${className}
      `}
    >
      {/* ── CARD MEDIA BOX (16:9 Aspect Ratio Container) ── */}
      <div
        className={`
          relative aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl
          bg-gradient-to-br ${theme.gradient}
          border border-white/10 group-hover:border-white/30
          shadow-[0_4px_16px_rgba(0,0,0,0.6)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.85)]
          transition-all duration-300 ease-out
          group-hover:scale-[1.02]
          flex items-center justify-center p-3
        `}
      >
        {/* Ambient Dark Gradient for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none" />

        {/* ── TOP BADGES ROW ── */}
        <div className="absolute top-2 left-2 right-2 sm:top-2.5 sm:left-2.5 sm:right-2.5 flex items-center justify-between gap-1.5 z-10">
          {/* Top Left: LIVE pill badge */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#e50914] text-white font-black text-[9px] sm:text-[10px] tracking-wider uppercase shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>

          {/* Top Right: Orange Eye / Viewers Badge */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#e65100] text-white font-bold text-[9px] sm:text-[10px] shadow-sm">
              <i className="fa-regular fa-eye text-[8px]" />
              <span>{typeof viewersCount === 'number' ? viewersCount : String(viewersCount).replace(/[^\d]/g, '') || 10}</span>
            </span>

            {/* Favorite toggle on hover/touch */}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-opacity cursor-pointer backdrop-blur-md ${
                  isFavorite ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white'
                }`}
              >
                <i className={`text-[10px] ${isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}`} />
              </button>
            )}
          </div>
        </div>

        {/* ── CENTER: Crisp Channel Logo (Iconic Brand Identity) ── */}
        <div className="relative z-10 flex items-center justify-center w-full px-4 transition-transform duration-300 group-hover:scale-110">
          {!badgeError && channel?.badge && !channel?.badge?.includes('ondemand.st/img/cards') ? (
            <img
              src={channel.badge}
              alt={channel.name}
              loading="lazy"
              onError={() => setBadgeError(true)}
              className="max-h-12 sm:max-h-14 max-w-[150px] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
            />
          ) : (
            <NetworkLogo
              name={channel?.name}
              network={channel?.network}
              className="h-10 sm:h-12 w-auto max-w-[160px]"
            />
          )}
        </div>

        {/* ── BOTTOM-LEFT INSIDE MEDIA BOX: CATEGORY ── */}
        <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white/95 truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            {categoryText}
          </span>
        </div>
      </div>

      {/* ── OUTSIDE CARD FOOTER: CHANNEL NAME (Matching Reference Image) ── */}
      <h3
        className="mt-1.5 px-0.5 text-xs sm:text-[13px] font-medium text-white/85 group-hover:text-white truncate transition-colors leading-snug"
        title={channel?.name}
      >
        {channel?.name || 'Live Channel'}
      </h3>
    </div>
  );
};

export default React.memo(LiveTVCard);
