import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80';

const getTeamMonogram = (name) => {
  if (!name) return 'TM';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Sport-specific dynamic gradient schemes matching screenshot
const getMatchGradient = (category = '', league = '') => {
  const norm = `${category} ${league}`.toLowerCase();
  if (norm.includes('basketball') || norm.includes('ncaa') || norm.includes('ncaab')) {
    return 'from-[#0d1e38] via-[#091527] to-[#050b14]';
  }
  if (norm.includes('cricket') || norm.includes('south africa') || norm.includes('bangladesh')) {
    return 'from-[#052b1e] via-[#041d15] to-[#020d09]';
  }
  if (norm.includes('afc') || norm.includes('champions')) {
    return 'from-[#091a3e] via-[#081533] to-[#040a1c]';
  }
  if (norm.includes('nfl') || norm.includes('american football')) {
    return 'from-[#2e0b12] via-[#1a080d] to-[#0a0407]';
  }
  if (norm.includes('motor') || norm.includes('racing') || norm.includes('supercars')) {
    return 'from-[#1c1c24] via-[#121217] to-[#08080a]';
  }
  if (norm.includes('colombia') || norm.includes('américa') || norm.includes('betplay')) {
    return 'from-[#0b203d] via-[#07152b] to-[#030914]';
  }
  return 'from-[#14141e] via-[#0e0e15] to-[#08080c]';
};

export const formatCountdown = (startsAt) => {
  if (!startsAt) return '15M';
  const startsMs = startsAt > 1e11 ? startsAt : startsAt * 1000;
  const diffMinutes = Math.round((startsMs - Date.now()) / 60000);
  if (diffMinutes <= 0) return 'LIVE';
  if (diffMinutes < 60) return `${diffMinutes}M`;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return mins > 0 ? `${hours}H ${mins}M` : `${hours}H`;
};

export const formatStartTime = (startsAt) => {
  if (!startsAt) return '11:00 AM';
  const startsMs = startsAt > 1e11 ? startsAt : startsAt * 1000;
  return new Date(startsMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const LiveMatchCard = ({
  match,
  onSelect,
  variant, // 'live' | 'upcoming'
  isFavorite = false,
  onToggleFavorite,
  className = '',
}) => {
  const navigate = useNavigate();
  const [homeBadgeError, setHomeBadgeError] = useState(false);
  const [awayBadgeError, setAwayBadgeError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  const homeTeam = match?.teams?.home || { name: 'Home Team', badge: '' };
  const awayTeam = match?.teams?.away || { name: 'Away Team', badge: '' };

  useEffect(() => {
    setHomeBadgeError(false);
  }, [homeTeam.badge]);

  useEffect(() => {
    setAwayBadgeError(false);
  }, [awayTeam.badge]);

  // Determine variant (upcoming vs live)
  const isUpcoming =
    variant === 'upcoming' ||
    match?.status === 'upcoming' ||
    (match?.starts_at && match.starts_at * 1000 > Date.now());

  const hasTeamBadges = Boolean(homeTeam.badge || awayTeam.badge || homeTeam.name);
  const categoryLabel = (
    match?.league ||
    match?.category_name ||
    match?.category ||
    match?.sport ||
    'Sports'
  ).toUpperCase();

  const titleText =
    match?.name ||
    `${homeTeam.name || 'Team 1'} vs ${awayTeam.name || 'Team 2'}`;

  const gradientClass = useMemo(
    () => getMatchGradient(match?.category_name || match?.category, match?.league),
    [match]
  );

  const countdownText = useMemo(
    () => match?.countdown || formatCountdown(match?.starts_at),
    [match]
  );

  const startTimeText = useMemo(
    () => match?.time || formatStartTime(match?.starts_at),
    [match]
  );

  const handleClick = () => {
    if (typeof onSelect === 'function') {
      onSelect(match);
    } else {
      navigate(`/live-stream/${match.id}`, { state: { stream: match } });
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (typeof onToggleFavorite === 'function') {
      onToggleFavorite(match, e);
    }
  };

  // Has action poster (e.g. motorsport car photo, tournament graphic)
  const hasActionPoster = Boolean(match?.poster && !posterError && !match?.teams?.home?.badge);

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Watch ${titleText}${!isUpcoming ? ' Live' : ''}`}
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
          bg-gradient-to-br ${gradientClass}
          border border-white/10 group-hover:border-white/30
          shadow-[0_4px_16px_rgba(0,0,0,0.6)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.85)]
          transition-all duration-300 ease-out
          group-hover:scale-[1.02]
        `}
      >
        {/* If Action Poster Exists (Motorsport, Supercars, Special events) */}
        {hasActionPoster ? (
          <img
            src={match.poster}
            alt=""
            loading="lazy"
            onError={() => setPosterError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Subtle Ambient Sports Texture/Backdrop */
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
        )}

        {/* Ambient Dark Gradients for Maximum Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40" />

        {/* ── TOP BADGES ROW ── */}
        <div className="absolute top-2 left-2 right-2 sm:top-2.5 sm:left-2.5 sm:right-2.5 flex items-center justify-between gap-1.5 z-10">
          {/* Top Left Badge */}
          {isUpcoming ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#092238]/95 border border-cyan-500/40 text-cyan-200 font-extrabold text-[9px] sm:text-[10px] tracking-wide shadow-sm">
              {countdownText}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#e50914] text-white font-black text-[9px] sm:text-[10px] tracking-wider uppercase shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}

          {/* Top Right Badge */}
          <div className="flex items-center gap-1.5">
            {isUpcoming ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-gray-200 font-bold text-[9px] sm:text-[10px] tracking-wide shadow-sm">
                {startTimeText}
              </span>
            ) : match?.viewers > 0 ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-gray-300 font-bold text-[9px]">
                <i className="fa-solid fa-users text-[8px] text-red-500" />
                <span>{match.viewers}</span>
              </span>
            ) : null}

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

        {/* ── CENTER ARENA: Team 1 vs Team 2 Matchup ── */}
        {!hasActionPoster && hasTeamBadges && (
          <div className="absolute inset-x-2 top-8 bottom-6 sm:top-9 sm:bottom-7 flex items-center justify-center gap-2 sm:gap-3 px-1">
            {/* Team 1 / Home */}
            <div className="flex flex-col items-center justify-center flex-1 min-w-0">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center p-1 transition-transform group-hover:scale-105">
                {!homeBadgeError && homeTeam.badge ? (
                  <img
                    src={homeTeam.badge}
                    alt={homeTeam.name}
                    loading="lazy"
                    onError={() => setHomeBadgeError(true)}
                    className="max-h-full max-w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  />
                ) : (
                  <span className="text-xs font-black text-white bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center border border-white/15">
                    {getTeamMonogram(homeTeam.name)}
                  </span>
                )}
              </div>
            </div>

            {/* Center VS Emblem */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-gray-300/90 bg-black/50 px-2 py-0.5 rounded-full border border-white/15 shadow-sm">
                VS
              </span>
            </div>

            {/* Team 2 / Away */}
            <div className="flex flex-col items-center justify-center flex-1 min-w-0">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center p-1 transition-transform group-hover:scale-105">
                {!awayBadgeError && awayTeam.badge ? (
                  <img
                    src={awayTeam.badge}
                    alt={awayTeam.name}
                    loading="lazy"
                    onError={() => setAwayBadgeError(true)}
                    className="max-h-full max-w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  />
                ) : (
                  <span className="text-xs font-black text-white bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center border border-white/15">
                    {getTeamMonogram(awayTeam.name)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── BOTTOM-LEFT INSIDE MEDIA BOX: CATEGORY / LEAGUE ── */}
        <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white/95 truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* ── OUTSIDE CARD FOOTER: TITLE (Matching Reference Image) ── */}
      <h3
        className="mt-1.5 px-0.5 text-xs sm:text-[13px] font-medium text-white/85 group-hover:text-white truncate transition-colors leading-snug"
        title={titleText}
      >
        {titleText}
      </h3>
    </div>
  );
};

export default React.memo(LiveMatchCard);
