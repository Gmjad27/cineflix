import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card/Card';
import RailRow from '../RailRow/RailRow';
import { ShimmerBlock } from '../Skeleton/Skeleton';

import { useRailScroll } from '../../hooks/useRailScroll';
import { fetchTMDBDetails, fetchTMDBSeasonDetails, fetchMoreLikeThis } from '../../content/tmdb.js';
import { getWatchedEpisodes, markEpisodeWatched, unmarkEpisodeWatched } from '../../utils/continueWatching';
import { useNetworkStatus } from '../../context/NetworkContext';

const getSeasonNumber = (seasonKey) => {
  const parsed = Number(String(seasonKey).replace('s', ''));
  return Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed;
};

const formatRuntime = (minutes) => {
  const totalMinutes = Number(minutes) || 0;
  if (!totalMinutes) return '';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const formatAirDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isRecentlyAired = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  if (date > now) return false;
  const diffDays = (now - date) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
};

const Watch = (props) => {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const data = Array.isArray(props.data) ? props.data : [];
  const [details, setDetails] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [activeLang, setActiveLang] = useState(null);
  const [trailerLoaded, setTrailerLoaded] = useState(false);
  const [isTrailerMuted, setIsTrailerMuted] = useState(true);
  const trailerFrameRef = useRef(null);

  // ─── ADDED: Show More / Less States ───
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isMoodExpanded, setIsMoodExpanded] = useState(false);

  // State for TMDB Recommendations
  const [tmdbRelated, setTmdbRelated] = useState([]);

  const effectiveEpisodes = details?.episodes || props.s || {};
  const seasonKeys = Object.keys(effectiveEpisodes);
  const effectiveSeasonKeys = props.type === 'tv' && seasonKeys.length === 0 ? ['s1'] : seasonKeys;
  const [ep, setEp] = useState(seasonKeys[0] || 's1');

  const [watchedEpisodes, setWatchedEpisodes] = useState(() => getWatchedEpisodes(props.id));
  const [hasWatchedMovie, setHasWatchedMovie] = useState(false);

  // Reset expand states when switching titles
  useEffect(() => {
    setIsDescExpanded(false);
    setIsMoodExpanded(false);
  }, [props.id, props.mname]);

  useEffect(() => {
    setWatchedEpisodes(getWatchedEpisodes(props.id));
    if (props.type === 'movie') {
      try {
        const history = JSON.parse(localStorage.getItem('continue-watching')) || [];
        const isWatched = history.some(item => String(item.tmdbId) === String(props.id));
        setHasWatchedMovie(isWatched);
      } catch (err) {
        console.error("Error reading continue-watching from localStorage", err);
      }
    }
  }, [props.id, props.type]);

  const isDetailsLoading = props.type && props.id && !details;

  // Load Main Details
  useEffect(() => {
    let active = true;
    const loadDetails = async () => {
      if (!props.type || !props.id) {
        if (active) setDetails(null);
        return;
      }
      try {
        const payload = await fetchTMDBDetails(props.type, props.id);
        if (active) setDetails(payload);
      } catch {
        if (active) setDetails(null);
      }
    };
    loadDetails();
    return () => { active = false; };
  }, [props.id, props.type]);

  // Load TMDB Recommendations (More Like This)
  useEffect(() => {
    let active = true;
    const loadRelated = async () => {
      if (!props.type || !props.id) {
        if (active) setTmdbRelated([]);
        return;
      }
      try {
        const results = await fetchMoreLikeThis(props.type, props.id);
        if (active) setTmdbRelated(results);
      } catch (err) {
        console.error("Error fetching TMDB related content:", err);
        if (active) setTmdbRelated([]);
      }
    };
    loadRelated();
    return () => { active = false; };
  }, [props.id, props.type]);

  // Set default active language
  useEffect(() => {
    const langs = details?.languages?.length ? details.languages : props.language;
    if (langs?.length && !activeLang) {
      setActiveLang(langs[0]);
    }
  }, [details, props.language, activeLang]);

  // Reset Season Selection
  useEffect(() => {
    setEp(effectiveSeasonKeys[0] || 's1');
  }, [props.mname, effectiveSeasonKeys.join(',')]);

  // Load Season Details (Episodes)
  useEffect(() => {
    let active = true;
    const loadSeasonDetails = async () => {
      if (props.type !== 'tv' || !props.id) {
        if (active) setSeasonDetails(null);
        return;
      }
      try {
        const payload = await fetchTMDBSeasonDetails(props.id, getSeasonNumber(ep));
        if (active) setSeasonDetails(payload);
      } catch {
        if (active) setSeasonDetails(null);
      }
    };
    loadSeasonDetails();
    return () => { active = false; };
  }, [ep, props.id, props.type]);

  const closeWatch = useCallback(() => {
    setEp(effectiveSeasonKeys[0] || 's1');
    if (typeof props.onClose === 'function') {
      props.onClose();
    }
  }, [effectiveSeasonKeys, props.onClose]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeWatch();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeWatch]);

  // Lock background scroll
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const selectedSeason = getSeasonNumber(ep);
  const episodeCount = effectiveEpisodes?.[ep] || (props.type === 'tv' ? 10 : 0);
  const shownDesc = details?.desc || props.desc;

  const episodeCards = useMemo(() => {
    if (Array.isArray(seasonDetails?.episodes) && seasonDetails.episodes.length > 0) {
      return seasonDetails.episodes;
    }
    return Array.from({ length: episodeCount }).map((_, index) => ({
      id: `${selectedSeason}-${index + 1}`,
      number: index + 1,
      name: `Episode ${index + 1}`,
      overview: shownDesc || 'Episode details are not available yet.',
      image: props.img,
      runtime: 0,
      airDate: '',
    }));
  }, [episodeCount, props.img, seasonDetails, selectedSeason, shownDesc]);

  const isWatched = useCallback(
    (episodeNumber) => watchedEpisodes.includes(`${selectedSeason}-${episodeNumber}`),
    [watchedEpisodes, selectedSeason]
  );

  const lastWatchedEp = useMemo(() => {
    if (props.type !== 'tv' || !watchedEpisodes || watchedEpisodes.length === 0) return null;
    let maxS = 1;
    let maxE = 1;
    watchedEpisodes.forEach(epKey => {
      const [s, e] = epKey.split('-').map(Number);
      if (s > maxS) {
        maxS = s;
        maxE = e;
      } else if (s === maxS && e > maxE) {
        maxE = e;
      }
    });
    return { season: maxS, episode: maxE };
  }, [watchedEpisodes, props.type]);

  const backgroundImage = details?.mbg;

  const handlePlayNow = useCallback(() => {
    let targetSeason = 1;
    let targetEpisode = 1;

    if (props.type === 'tv' && lastWatchedEp) {
      targetSeason = lastWatchedEp.season;
      targetEpisode = lastWatchedEp.episode;
    }

    const streamId = props.type === 'movie'
      ? `${props.id}`
      : `${props.id}/${targetSeason}/${targetEpisode}`;

    props.play(streamId);
    navigate(`/streaming/${streamId}`, {
      state: {
        title: props.mname,
        type: props.type,
        tmdbId: props.id,
        image: backgroundImage,
        season: props.type === 'tv' ? targetSeason : undefined,
        episode: props.type === 'tv' ? targetEpisode : undefined,
      },
    });
  }, [props.type, props.id, props.play, props.mname, backgroundImage, navigate, lastWatchedEp]);

  const seasonLabel = props.type === 'tv'
    ? details?.seasonLabel || `${effectiveSeasonKeys.length} Season${effectiveSeasonKeys.length > 1 ? 's' : ''}`
    : details?.seasonLabel || props.season;

  const year = details?.year || props.yr;
  const rating = details?.rating || props.rating || 0;
  const nextEp = details?.nextEp || "";
  const logo = details?.nameImg2;
  const trailer = details?.trailerUrl;
  const trailerEmbedUrl = useMemo(() => {
    if (!trailer) return '';
    const origin = typeof window !== 'undefined'
      ? `&origin=${encodeURIComponent(window.location.origin)}`
      : '';
    return `https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${trailer}&playsinline=1&enablejsapi=1&showinfo=0&iv_load_policy=3${origin}`;
  }, [trailer]);

  const shownCategories = details?.categories?.length ? details.categories : props.cat;
  const shownAgeRating = details?.ageRating || props.ua || 'TV-PG';
  const cast = details?.cast || [];
  const mood = details?.mood || [];
  const heroPoster = props.img;

  // Thresholds for Show More / Show Less
  const isLongDesc = Boolean(shownDesc && shownDesc.length > 160);
  const hasMoreMoods = mood.length > 3;
  const visibleMoods = isMoodExpanded ? mood : mood.slice(0, 3);

  useEffect(() => {
    setTrailerLoaded(false);
    setIsTrailerMuted(true);
  }, [trailerEmbedUrl]);

  const sendTrailerCommand = useCallback((command) => {
    const playerWindow = trailerFrameRef.current?.contentWindow;
    if (!playerWindow) return;
    playerWindow.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }), '*'
    );
  }, []);

  useEffect(() => {
    if (!trailerLoaded || !trailerEmbedUrl) return;
    sendTrailerCommand(isTrailerMuted ? 'mute' : 'unMute');
  }, [isTrailerMuted, sendTrailerCommand, trailerEmbedUrl, trailerLoaded]);

  // More Like This Logic
  const related = useMemo(() => {
    if (tmdbRelated.length > 0) {
      return tmdbRelated
        .filter(item => String(item.tmdbId) !== String(props.id))
        .slice(0, 18);
    }

    const mainCategory = props.cat?.[0] || details?.categories?.[0] || null;
    if (!mainCategory) return [];
    return data
      .filter((item) =>
        item.name2 !== props.mname &&
        Array.isArray(item.category) &&
        item.category.includes(mainCategory)
      )
      .slice(0, 18);
  }, [tmdbRelated, data, props.cat, props.mname, details?.categories, props.id]);

  const renderRelatedCard = useCallback(
    (item) => {
      const targetWatchId = item.type && item.tmdbId ? `${item.type}_${item.tmdbId}` : item.id;
      const targetTitle = item.name2 || item.title || item.name;

      return (
        <Card
          key={item.id ?? item.tmdbId}
          sow={() => {
            if (typeof props.sow === 'function') {
              props.sow(targetWatchId, targetTitle);
            }
            const container = document.getElementById('watch');
            container?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          id={item.id}
          img={item.name || item.poster_path || item.img}
          name={targetTitle}
          ry={item.releaseYear || item.release_date || item.first_air_date}
          ua={item.ua}
          lan={item.language?.length || 0}
          desc={item.desc || item.overview}
          s={item.season}
          type={item.type}
          tid={item.tmdbId}
          rating={item.rating || (item.vote_average ? item.vote_average : 0)}
          add={(value) => props.add?.(value)}
          e={props.e}
          play={(tid) => props.play?.(tid)}
        />
      );
    },
    [props]
  );

  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [props.id]);

  let playButtonText = 'Play';
  if (props.type === 'tv' && lastWatchedEp) {
    playButtonText = `Continue Watching S${lastWatchedEp.season} E${lastWatchedEp.episode}`;
  } else if (props.type === 'movie' && hasWatchedMovie) {
    playButtonText = 'Continue Watching';
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center items-start pt-0 sm:pt-8 overflow-y-auto bg-black/80 backdrop-blur-xl"
      id="watch"
      ref={containerRef}
      onClick={closeWatch}
      style={{ animation: 'overlayFade 0.3s ease-out forwards' }}
    >
      <style>
        {`
          @keyframes overlayFade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modalPop {
            0% { opacity: 0; transform: scale(0.92) translateY(15px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}
      </style>

      <div
        id="watch-modal"
        className="relative w-full max-w-[950px] min-h-screen sm:min-h-0 glass-modal text-white sm:rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.25)] overflow-hidden mb-0 sm:mb-8"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <button
          className="fixed top-4 right-4 z-30 w-11 h-11 text-base rounded-full glass-mirror text-white/80 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-glass-md"
          onClick={closeWatch}
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* ─── Hero Section ─── */}
        <div className="relative w-full aspect-video sm:h-auto overflow-hidden bg-black">
          {heroPoster ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
              style={{ backgroundImage: `url('${heroPoster}')`, opacity: trailerLoaded ? 0.3 : 1 }}
            />
          ) : (
            isDetailsLoading && (
              <div className="absolute inset-0 bg-[#242424] animate-pulse" />
            )
          )}
          {trailerEmbedUrl && (
            <iframe
              ref={trailerFrameRef}
              src={trailerEmbedUrl}
              title={`${props.mname} trailer`}
              frameBorder="0"
              allow="autoplay; encrypted-media;"
              className="pointer-events-none absolute inset-0 w-[130%] h-[200%] -top-[51%] -left-[15%] transition-opacity duration-1000"
              onLoad={() => setTrailerLoaded(true)}
            />
          )}

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-[#09090d]/60 to-transparent bottom-0 h-[101%] pointer-events-none"></div>

          {props.type === 'movie' && hasWatchedMovie && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-50">
              <div className="h-full bg-red-600 shadow-[0_0_10px_#e50914]" style={{ width: '100%' }}></div>
            </div>
          )}

          {/* Hero Content Overlays */}
          <div className="absolute bottom-[5%] left-0 w-full px-4 sm:px-8 md:px-12 flex flex-col gap-3 sm:gap-4">
            {!isOnline && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/85 border border-red-500/40 text-xs text-red-200 self-start shadow-md backdrop-blur-md">
                <i className="fa-solid fa-wifi-slash text-xs text-red-400" />
                <span>Offline: Streaming will start when reconnected</span>
              </div>
            )}
            <div className="flex items-center gap-2 sm:gap-3.5 w-full flex-wrap">
              <button
                className="glass-btn-primary flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-xs sm:text-base font-bold shadow-lg cursor-pointer"
                onClick={handlePlayNow}
              >
                <i className="fa-solid fa-play text-xs sm:text-sm"></i>
                <span>{playButtonText}</span>
              </button>

              <button
                className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full glass-mirror text-white/90 hover:text-white hover:border-white/40 transition-all hover:scale-105 shadow-glass-sm"
                onClick={() => props.add(props.sid, props.id, props.name2, props.mname, props.type, props.rating)}
                title="Add to My List"
              >
                {props.El === 'ADDED' ? <i className="fa-solid fa-check text-emerald-400"></i> : <i className="fa-solid fa-plus"></i>}
              </button>

              <div className="flex-1"></div>

              {trailerEmbedUrl && (
                <button
                  className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full glass-mirror text-white/90 hover:text-white transition-all hover:scale-105 shadow-glass-sm disabled:opacity-50"
                  onClick={() => setIsTrailerMuted(p => !p)}
                  disabled={!trailerLoaded}
                  title={isTrailerMuted ? "Unmute" : "Mute"}
                >
                  <i className={`fa-solid ${isTrailerMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Title / Logo Banner ─── */}
        <div className="relative flex justify-center h-[60px] sm:h-[130px] w-[100%]">
          {logo ? (
            <img
              src={logo}
              alt={props.mname}
              className="max-h-full sm:max-w-[80%] object-contain drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full px-4">
              <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-wider bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] leading-[1.1]">
                {props.mname}
              </h1>
            </div>
          )}
        </div>

        {/* ─── Metadata & Description Grid ─── */}
        <div className="px-4 sm:px-8 md:px-12 py-2 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-12 gap-y-5 sm:gap-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 text-[13px] sm:text-[15px] font-medium flex-wrap">
              <span className="text-[#46d369] font-bold">{(rating * 10).toFixed(0)}% Match</span>
              <span className="text-gray-300">{year}</span>
              <span className="text-gray-300">{props.type === 'tv' ? seasonLabel : formatRuntime(details?.runtime)}</span>
              <span className="border border-gray-400/70 px-1 py-[1px] text-[10px] rounded-[3px] text-gray-300 font-bold tracking-wider leading-none flex items-center h-4">HD</span>
              <span className="border border-gray-400/70 px-1 py-[1px] text-[10px] rounded-[3px] text-gray-300 italic tracking-wider leading-none flex items-center h-4">AD</span>
              <i className="fa-regular fa-message text-gray-400 text-xs ml-1"></i>
              {nextEp && (
                <p className="text-[11px] sm:text-xs font-bold tracking-widest text-[#e8b84b] uppercase flex items-center gap-2 w-full sm:w-auto">
                  <i className="fa-solid fa-bolt text-[10px]"></i>
                  New episode on : <span className="text-slate-200 tracking-normal normal-case font-medium">{formatAirDate(nextEp) || nextEp}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-[13px] sm:text-[14px]">
              <span className="border border-gray-400 px-1.5 py-[1px] text-xs font-semibold rounded-[3px] text-white bg-transparent leading-none flex items-center h-5">
                {shownAgeRating}
              </span>
              <span className="text-gray-300">{details?.languages?.join(', ') || props.language?.join(', ')}</span>
            </div>

            {/* ─── Description with Show More / Less ─── */}
            {shownDesc ? (
              <div className="space-y-1.5">
                <p
                  className={`text-[13px] sm:text-[15px] text-gray-200 leading-relaxed font-normal transition-all ${
                    !isDescExpanded && isLongDesc ? 'line-clamp-3' : ''
                  }`}
                >
                  {shownDesc}
                </p>
                {isLongDesc && (
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded((prev) => !prev)}
                    aria-expanded={isDescExpanded}
                    className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-semibold text-white/85 hover:text-white transition-colors cursor-pointer select-none"
                  >
                    <span>{isDescExpanded ? 'Show less' : 'Show more'}</span>
                    <i
                      className={`fa-solid fa-chevron-${
                        isDescExpanded ? 'up' : 'down'
                      } text-[10px]`}
                    />
                  </button>
                )}
              </div>
            ) : isDetailsLoading ? (
              <div className="space-y-2">
                <ShimmerBlock className="w-full h-4 rounded-md" />
                <ShimmerBlock className="w-5/6 h-4 rounded-md" />
                <ShimmerBlock className="w-3/4 h-4 rounded-md" />
              </div>
            ) : null}
          </div>

          {/* ─── Right Column: Genres & "This show is" with Show More / Less ─── */}
          <div className="space-y-3 text-[13px] sm:text-[14px] leading-snug">
            {shownCategories?.length > 0 ? (
              <div>
                <span className="text-[#777777]">Genres: </span>
                <span className="text-gray-200 hover:underline cursor-pointer">
                  {shownCategories.join(', ')}
                </span>
              </div>
            ) : isDetailsLoading ? (
              <div className="space-y-2">
                <ShimmerBlock className="w-32 h-4 rounded-md" />
                <ShimmerBlock className="w-40 h-4 rounded-md" />
              </div>
            ) : null}

            {mood.length > 0 && (
              <div>
                <span className="text-[#777777]">This show is: </span>
                <span className="text-gray-200">
                  {visibleMoods.join(', ')}
                </span>
                {hasMoreMoods && (
                  <button
                    type="button"
                    onClick={() => setIsMoodExpanded((prev) => !prev)}
                    aria-expanded={isMoodExpanded}
                    className="ml-1.5 inline-flex items-center gap-1 text-xs font-semibold text-white/80 hover:text-white underline-offset-2 hover:underline transition-colors cursor-pointer select-none"
                  >
                    {isMoodExpanded ? 'Show less' : `+${mood.length - 3} more`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Cast Section ─── */}
        {cast.length > 0 && (
          <div className="px-5 sm:ml-4 sm:px-8 mt-4">
            <h3 className="text-lg font-bold text-white mb-3">Cast</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent custom-scrollbar">
              {cast.slice(0, 15).map((actor, i) => (
                <div key={actor.id || i} className="flex flex-col items-center flex-shrink-0 w-20 sm:w-24 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-800 mb-1">
                    <img
                      src={actor.image || (actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/150/1a1a1a/ffffff?text=User')}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs text-gray-300 line-clamp-1">{actor.name}</span>
                  {actor.character && <span className="text-xs text-gray-500 line-clamp-1">{actor.character}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Episodes Section ─── */}
        {props.type === 'tv' && effectiveSeasonKeys.length > 0 && (
          <div className="px-4 sm:px-8 md:px-12 mt-8 sm:mt-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Episodes</h3>
              <div className="relative">
                <select
                  value={ep}
                  onChange={(e) => setEp(e.target.value)}
                  className="appearance-none bg-white/[0.06] text-white px-4 py-2 pr-10 text-sm sm:text-base font-semibold rounded-xl outline-none border border-white/15 focus:border-white/40 cursor-pointer backdrop-blur-xl shadow-glass-sm"
                >
                  {effectiveSeasonKeys.map((key, index) => (
                    <option key={key} value={key} className="bg-[#0e0e14] text-white">Season {index + 1}</option>
                  ))}
                </select>
                <i className="fa-solid fa-caret-down absolute right-3.5 top-1/2 -translate-y-1/2 text-white pointer-events-none text-xs"></i>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 mb-4 font-medium">
              <span>Season {selectedSeason}: {episodeCards.length} episode{episodeCards.length !== 1 ? 's' : ''}</span>
              <span className="border border-white/20 px-2 py-[2px] text-[10px] font-semibold rounded-md text-white bg-white/[0.05] leading-none flex items-center h-4">{shownAgeRating}</span>
            </div>

            <div className="flex flex-col gap-1">
              {episodeCards.map((episode, index) => {
                const episodeNumber = episode.number || index + 1;
                const airDateLabel = formatAirDate(episode.airDate);
                const isNew = isRecentlyAired(episode.airDate);
                const watched = isWatched(episodeNumber);

                return episode.runtime !== undefined && (
                  <div
                    key={episode.id || index}
                    className={`group flex flex-col sm:flex-row items-start sm:items-center p-3.5 sm:p-4 border-b cursor-pointer transition-all rounded-xl ${watched ? 'border-white/[0.04] hover:bg-white/[0.03]' : 'border-white/[0.08] hover:bg-white/[0.06]'}`}
                    onClick={() => {
                      markEpisodeWatched(props.id, selectedSeason, episodeNumber);
                      setWatchedEpisodes((prev) =>
                        prev.includes(`${selectedSeason}-${episodeNumber}`)
                          ? prev
                          : [...prev, `${selectedSeason}-${episodeNumber}`]
                      );

                      const streamId = `${props.type}/${props.id}/${selectedSeason}/${episodeNumber}`;
                      props.play(streamId);
                      navigate(`/streaming/${props.id}/${selectedSeason}/${episodeNumber}`, {
                        state: {
                          title: props.mname,
                          episodeName: episode.name,
                          type: props.type,
                          tmdbId: props.id,
                          image: backgroundImage || props.img,
                          season: selectedSeason,
                          episode: episodeNumber,
                        },
                      });
                    }}
                  >
                    <div className="flex items-center w-full mb-3 sm:mb-0">
                      <div className="relative w-24 sm:w-[120px] aspect-video rounded overflow-hidden flex-shrink-0 bg-gray-800 mr-3 sm:mr-4">
                        <img
                          src={episode.image || props.img}
                          alt={episode.name}
                          className={`w-full h-full object-cover transition-opacity ${watched ? 'opacity-70' : ''}`}
                        />

                        {watched && (
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#404040]">
                            <div className="h-full bg-red-600" style={{ width: '100%' }}></div>
                          </div>
                        )}

                        {isNew && !watched && (
                          <span className="absolute top-1 left-1 bg-[#ecb942] text-black text-[9px] font-bold px-1.5 py-[1px] rounded-[2px] tracking-wide">
                            NEW
                          </span>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200">
                          <i className="fa-regular fa-circle-play text-white text-2xl sm:text-3xl"></i>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center flex-1 min-w-0 pr-2">
                        <div className="flex items-start sm:items-center justify-between mb-1 gap-2">
                          <h4 className={`text-[14px] sm:text-base font-bold truncate ${watched ? 'text-gray-300' : 'text-white'}`}>
                            {`${episodeNumber}.${episode.name}` || `Episode ${episodeNumber}`}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                              {[episode.runtime > 0 ? `${episode.runtime}m` : null, airDateLabel]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </div>
                        </div>
                        <p className={`text-[12px] sm:text-[14px] line-clamp-2 leading-snug ${watched ? 'text-gray-500' : 'text-gray-400'}`}>
                          {episode.overview || 'Synopsis not available.'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── More Like This (Horizontal RailRow) ─── */}
        {related.length > 0 && (
          <div className="px-4 sm:px-8 md:px-12 mt-8 sm:mt-10 pb-8">
            <RailRow
              titleAlt="More Like This"
              items={related}
              eager={true}
              insetArrows={true}
              view="hidden"
              renderItem={(item) => renderRelatedCard(item)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Watch);