import React, { useState, useEffect } from 'react';
import { formatViewerCount } from '../../content/liveStreams';
import { formatCountdown, formatStartTime } from './LiveMatchCard';

const DEFAULT_HERO_BG =
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=80';

const getTeamMonogram = (name) => {
  if (!name) return 'TM';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getSportGlow = (category = '', league = '') => {
  const norm = `${category} ${league}`.toLowerCase();
  if (norm.includes('cricket') || norm.includes('willow') || norm.includes('supersport')) {
    return 'bg-emerald-500/20';
  }
  if (norm.includes('football') || norm.includes('uefa') || norm.includes('premier')) {
    return 'bg-sky-500/20';
  }
  if (norm.includes('basketball') || norm.includes('nba')) {
    return 'bg-orange-500/20';
  }
  return 'bg-[#E50914]/25';
};

const LiveHeroBanner = ({
  match,
  slides = [],
  onWatch,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  isRefreshing = false,
}) => {
  // Supports either a single `match` prop or the first item of `slides`
  const featured = match || slides[0];

  const [bgError, setBgError] = useState(false);
  const [homeError, setHomeError] = useState(false);
  const [awayError, setAwayError] = useState(false);
  const [channelError, setChannelError] = useState(false);

  useEffect(() => {
    setBgError(false);
    setHomeError(false);
    setAwayError(false);
    setChannelError(false);
  }, [featured?.id, featured?.streamId]);

  if (!featured) return null;

  const isUpcoming =
    featured?.status === 'upcoming' ||
    featured?.category_name === 'upcoming-matches' ||
    (featured?.starts_at && featured.starts_at * 1000 > Date.now());

  const hasTeams = Boolean(featured?.teams?.home && featured?.teams?.away);
  const homeTeam = featured?.teams?.home || {};
  const awayTeam = featured?.teams?.away || {};
  const isChannel = Boolean(!hasTeams && (featured?.badge || featured?.streamId));

  const bgSrc =
    (!bgError && (featured.poster || featured.bg)) || DEFAULT_HERO_BG;

  const favActive = typeof isFavorite === 'function' ? isFavorite(featured) : false;

  const leagueText = (
    featured?.league ||
    featured?.network ||
    featured?.category_name ||
    featured?.category ||
    'LIVE SPORTS'
  )
    .replace(/-/g, ' ')
    .toUpperCase();

  const sportGlow = getSportGlow(featured?.category || featured?.sport, leagueText);

  return (
    <section
      aria-label="Featured live match"
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0a0a0f] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] select-none min-h-[340px] sm:min-h-[390px] md:min-h-[440px] lg:min-h-[480px] flex flex-col justify-between group"
    >
      {/* Atmospheric Backdrop Image */}
      <img
        src={bgSrc}
        alt={featured.name || 'Live Broadcast'}
        loading="eager"
        onError={() => setBgError(true)}
        className="absolute inset-0 w-full sm:h-full object-cover object-center opacity-50 md:group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Sport-Specific Ambient Glow */}
      <div
        className={`absolute -top-20 left-1/3 w-72 sm:w-96 h-72 sm:h-96 rounded-full ${sportGlow} blur-[110px] pointer-events-none`}
      />

      {/* Multi-Layer Dark Glass Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/75 to-black/45 pointer-events-none" />
      <div className="hidden md:block absolute inset-y-0 left-0 w-[75%] bg-gradient-to-r from-[#07070a]/95 via-[#07070a]/65 to-transparent pointer-events-none" />

      {/* ── TOP GLASS STATUS BAR ── */}
      <div className="relative z-10 flex items-center justify-between gap-2 px-3.5 pt-3.5 sm:px-6 sm:pt-5 lg:px-10 lg:pt-7">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {isUpcoming ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/90 backdrop-blur-md border border-cyan-500/40 text-cyan-200 font-extrabold text-[10px] sm:text-xs tracking-wider uppercase shrink-0">
              <i className="fa-regular fa-clock text-[10px]" />
              <span>{featured.countdown || formatCountdown(featured.starts_at)}</span>
              <span className="hidden xs:inline">
                • {featured.time || formatStartTime(featured.starts_at)}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E50914] text-white font-black text-[10px] sm:text-xs tracking-wider uppercase shadow-[0_0_16px_rgba(229,9,20,0.65)] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}

          <span className="px-2.5 py-1 rounded-lg bg-white/[0.08] backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-bold tracking-wider text-gray-200 uppercase truncate">
            {leagueText}
          </span>
        </div>

        {/* Right Viewer Pill */}
        {featured.viewers > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-semibold text-gray-200 shrink-0">
            <i className="fa-solid fa-eye text-[9px] text-[#E50914]" />
            <span>{formatViewerCount(featured.viewers)}</span>
            <span className="hidden sm:inline">watching</span>
          </span>
        )}
      </div>

      {/* ── BOTTOM CONTENT & GLASS ARENA STACK ── */}
      <div className="relative z-10 px-3.5 pb-5 pt-6 sm:px-6 sm:pb-8 lg:px-10 lg:pb-10">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Channel Logo Pill (if a 24/7 TV Channel is passed) */}
          {isChannel && !channelError && featured.badge && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white/[0.09] backdrop-blur-xl border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <img
                src={featured.badge}
                alt={featured.name}
                onError={() => setChannelError(true)}
                className="h-6 sm:h-8 max-w-[120px] object-contain"
              />
            </div>
          )}

          {/* Mobile-Adaptive Team Matchup Glass Board */}
          
          {/* Match Title */}
          <h1 className="text-lg sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug line-clamp-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            {featured.name}
          </h1>

          {/* Optional Show Description */}
          {!hasTeams && featured.currentShow && (
            <p className="text-xs sm:text-sm md:text-base text-gray-300 line-clamp-1 sm:line-clamp-2 max-w-xl">
              {featured.currentShow}
            </p>
          )}

          {/* Thumb-Zone Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 pt-0.5">
            <button
              type="button"
              onClick={() => typeof onWatch === 'function' && onWatch(featured)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#E50914] md:hover:bg-[#ff1420] active:scale-[0.97] text-white font-black text-xs sm:text-sm uppercase tracking-wider px-5 sm:px-7 py-3 rounded-xl shadow-[0_8px_25px_rgba(229,9,20,0.45)] transition-all cursor-pointer select-none min-h-[44px]"
            >
              <i className="fa-solid fa-play text-xs" />
              <span>{isUpcoming ? 'Preview Stream' : 'Watch Live'}</span>
            </button>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => onToggleFavorite(featured, e)}
                aria-label={favActive ? 'Remove from saved' : 'Save stream'}
                className={`inline-flex items-center justify-center gap-1.5 w-11 h-11 sm:w-auto sm:px-4 sm:py-3 rounded-xl backdrop-blur-xl border transition-all cursor-pointer select-none active:scale-95 text-xs sm:text-sm font-bold shrink-0 ${favActive
                    ? 'bg-red-600/30 text-white border-red-500 shadow-md'
                    : 'bg-white/[0.08] md:hover:bg-white/[0.16] text-gray-200 border-white/15'
                  }`}
              >
                <i
                  className={`fa-heart text-sm ${favActive ? 'fa-solid text-red-500' : 'fa-regular'
                    }`}
                />
                <span className="hidden sm:inline">{favActive ? 'Saved' : 'Save'}</span>
              </button>
            )}

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label="Sync live streams"
                className="inline-flex items-center justify-center w-11 h-11 sm:w-auto sm:px-4 sm:py-3 rounded-xl bg-white/[0.08] md:hover:bg-white/[0.16] active:scale-95 backdrop-blur-xl border border-white/15 text-gray-200 font-bold text-xs sm:text-sm transition-all cursor-pointer select-none shrink-0 disabled:opacity-60"
              >
                <i
                  className={`fa-solid fa-rotate text-sm ${isRefreshing ? 'animate-spin text-[#E50914]' : ''
                    }`}
                />
                <span className="hidden md:inline ml-2">
                  {isRefreshing ? 'Syncing' : 'Sync'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(LiveHeroBanner);