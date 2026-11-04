import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatViewerCount } from '../../content/liveStreams';

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'football':
    case 'soccer':
      return 'fa-futbol';
    case 'cricket':
      return 'fa-baseball-bat-ball';
    case 'basketball':
      return 'fa-basketball';
    case 'motorsport':
    case 'formula 1':
    case 'f1':
      return 'fa-flag-checkered';
    case 'tennis':
      return 'fa-table-tennis-paddle-ball';
    default:
      return 'fa-trophy';
  }
};

const LiveMatchCard = ({ match, onSelect }) => {
  const navigate = useNavigate();
  const [homeBadgeError, setHomeBadgeError] = useState(false);
  const [awayBadgeError, setAwayBadgeError] = useState(false);

  const homeTeam = match?.teams?.home || { name: 'Home Team', badge: '' };
  const awayTeam = match?.teams?.away || { name: 'Away Team', badge: '' };

  const isLive = match?.status === 'live' || match?.always_live === 1;
  const sourcesCount = match?.sources?.length || 1;

  const handleClick = () => {
    if (typeof onSelect === 'function') {
      onSelect(match);
    } else {
      navigate(`/live-stream/${match.id}`, { state: { stream: match } });
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col flex-shrink-0 w-[240px] xs:w-[260px] sm:w-[290px] md:w-[320px] lg:w-[340px] rounded-lg overflow-hidden cursor-pointer select-none bg-[#141414] border border-white/10 hover:border-red-600 transition-colors duration-150"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Background Poster Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        <img
          src={match.poster || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'}
          alt={match.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {/* Flat gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
          {/* Static Red LIVE Badge */}
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-[9px] sm:text-[10px] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              LIVE
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded bg-blue-600 text-white font-semibold text-[9px] sm:text-[10px]">
              UPCOMING
            </div>
          )}

          {/* Viewers & Category */}
          <div className="flex items-center gap-1">
            {match.viewers > 0 && (
              <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-black/80 text-white text-[9px] sm:text-[10px] font-medium border border-white/10">
                <i className="fa-solid fa-users text-[8px] sm:text-[9px] text-red-500" />
                {formatViewerCount(match.viewers)}
              </span>
            )}
            <span className="flex items-center justify-center w-5 h-5 rounded bg-black/80 text-gray-300 border border-white/10">
              <i className={`fa-solid ${getCategoryIcon(match.category_name)} text-[8px] sm:text-[9px]`} />
            </span>
          </div>
        </div>

        {/* Teams Matchup Center Area */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 px-0.5">
          {/* Home Team */}
          <div className="flex flex-col items-center text-center flex-1 min-w-0 pr-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-black/80 border border-white/20 p-1 flex items-center justify-center shrink-0">
              {!homeBadgeError && homeTeam.badge ? (
                <img
                  src={homeTeam.badge}
                  alt={homeTeam.name}
                  onError={() => setHomeBadgeError(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <i className="fa-solid fa-shield text-gray-400 text-xs" />
              )}
            </div>
            <span className="mt-1 text-[10px] sm:text-[11px] font-semibold text-white truncate max-w-full">
              {homeTeam.name}
            </span>
          </div>

          {/* VS Center Badge */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 px-1">
            <span className="text-[8px] sm:text-[9px] font-black tracking-wider text-red-500 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-500/30">
              VS
            </span>
            <span className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5 uppercase font-medium truncate max-w-[65px] sm:max-w-[85px]">
              {match.league ? match.league.slice(0, 14) : 'Match'}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center text-center flex-1 min-w-0 pl-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-black/80 border border-white/20 p-1 flex items-center justify-center shrink-0">
              {!awayBadgeError && awayTeam.badge ? (
                <img
                  src={awayTeam.badge}
                  alt={awayTeam.name}
                  onError={() => setAwayBadgeError(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <i className="fa-solid fa-shield text-gray-400 text-xs" />
              )}
            </div>
            <span className="mt-1 text-[10px] sm:text-[11px] font-semibold text-white truncate max-w-full">
              {awayTeam.name}
            </span>
          </div>
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center z-20">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E50914] text-white font-bold text-xs shadow-md">
            <i className="fa-solid fa-play text-[10px]" />
            <span>Watch Live</span>
          </div>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-2 sm:p-2.5 bg-[#161616] flex items-center justify-between text-xs border-t border-white/5">
        <div className="flex items-center gap-1.5 text-gray-300 min-w-0">
          <i className="fa-solid fa-satellite-dish text-[10px] text-red-500 shrink-0" />
          <span className="truncate text-[10px] sm:text-[11px] text-gray-300 font-medium">
            {match.league || match.category_name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] sm:text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
            {sourcesCount} {sourcesCount === 1 ? 'Feed' : 'Feeds'}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded">
            HD
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LiveMatchCard);
