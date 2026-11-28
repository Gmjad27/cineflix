import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Card from '../../components/Card/Card';
import RailRow from '../../components/RailRow/RailRow';
import Footer from '../../components/Footer/Footer';
import Skeleton, { ShimmerBlock } from '../../components/Skeleton/Skeleton';
import OfflineScreen from '../../components/NetworkStatus/OfflineScreen';
import { fetchTMDBDetails, fetchTMDBSeasonDetails, fetchMoreLikeThis } from '../../content/tmdb.js';
import { getWatchedEpisodes, markEpisodeWatched } from '../../utils/continueWatching';
import { useNetworkStatus } from '../../context/NetworkContext';
import { getWatchPath } from '../../utils/watchNavigation';

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
  const location = useLocation();
  const { type: routeType, id: routeId, watchId: routeWatchId } = useParams();
  const { isOnline } = useNetworkStatus();
  const isModal = Boolean(props.isModal);
  const popupRef = useRef(null);

  const data = useMemo(() => (Array.isArray(props.data) ? props.data : []), [props.data]);

  // Resolve mediaType & tmdbId from either /watch/:type/:id or /watch/:watchId
  const { mediaType, tmdbId, compositeSid } = useMemo(() => {
    if (routeType && routeId) {
      const cleanType = routeType.toLowerCase();
      return {
        mediaType: cleanType,
        tmdbId: routeId,
        compositeSid: `${cleanType}_${routeId}`,
      };
    }

    if (routeWatchId) {
      const normalized = decodeURIComponent(routeWatchId).replace(':', '_');
      if (normalized.includes('_')) {
        const [parsedType, parsedId] = normalized.split('_');
        return {
          mediaType: parsedType.toLowerCase(),
          tmdbId: parsedId,
          compositeSid: `${parsedType.toLowerCase()}_${parsedId}`,
        };
      }
      // Try finding by raw id in catalog
      const matched = data.find((item) => String(item.id) === String(routeWatchId));
      if (matched) {
        return {
          mediaType: matched.type || 'movie',
          tmdbId: String(matched.tmdbId || routeWatchId),
          compositeSid: String(matched.id),
        };
      }
      return {
        mediaType: 'movie',
        tmdbId: routeWatchId,
        compositeSid: routeWatchId,
      };
    }

    return { mediaType: '', tmdbId: '', compositeSid: '' };
  }, [routeType, routeId, routeWatchId, data]);

  // Instant preview item from navigation state or global catalog
  const initialItem = useMemo(() => {
    const stateItem = location.state?.item;
    if (stateItem && (String(stateItem.tmdbId) === String(tmdbId) || String(stateItem.id) === String(compositeSid))) {
      return stateItem;
    }
    return (
      data.find(
        (item) =>
          String(item.id) === String(compositeSid) ||
          (String(item.tmdbId) === String(tmdbId) && item.type === mediaType)
      ) || null
    );
  }, [location.state, data, compositeSid, tmdbId, mediaType]);

  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [activeLang, setActiveLang] = useState(null);
  const [trailerLoaded, setTrailerLoaded] = useState(false);
  const [isTrailerMuted, setIsTrailerMuted] = useState(true);
  const trailerFrameRef = useRef(null);

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isMoodExpanded, setIsMoodExpanded] = useState(false);
  const [tmdbRelated, setTmdbRelated] = useState([]);

  const effectiveEpisodes = details?.episodes || initialItem?.episodes || {};
  const seasonKeys = Object.keys(effectiveEpisodes);
  const effectiveSeasonKeys = mediaType === 'tv' && seasonKeys.length === 0 ? ['s1'] : seasonKeys;
  const [ep, setEp] = useState(seasonKeys[0] || 's1');

  const [watchedEpisodes, setWatchedEpisodes] = useState(() => getWatchedEpisodes(tmdbId));
  const [hasWatchedMovie, setHasWatchedMovie] = useState(false);

  // Scroll to top smoothly when switching titles
  useEffect(() => {
    if (isModal) {
      popupRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsDescExpanded(false);
    setIsMoodExpanded(false);
    setDetails(null);
    setSeasonDetails(null);
    setTmdbRelated([]);
  }, [mediaType, tmdbId, isModal]);

  useEffect(() => {
    setWatchedEpisodes(getWatchedEpisodes(tmdbId));
    if (mediaType === 'movie') {
      try {
        const history = JSON.parse(localStorage.getItem('continue-watching')) || [];
        const isWatched = history.some((item) => String(item.tmdbId) === String(tmdbId));
        setHasWatchedMovie(isWatched);
      } catch (err) {
        console.error('Error reading continue-watching from localStorage', err);
      }
    } else {
      setHasWatchedMovie(false);
    }
  }, [tmdbId, mediaType]);

  // Load Main Details
  const loadDetails = useCallback(async () => {
    if (!mediaType || !tmdbId) {
      setDetails(null);
      setDetailsLoading(false);
      return;
    }
    setDetailsLoading(true);
    try {
      const payload = await fetchTMDBDetails(mediaType, tmdbId);
      setDetails(payload);
    } catch {
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  }, [mediaType, tmdbId]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!mediaType || !tmdbId) {
        if (active) {
          setDetails(null);
          setDetailsLoading(false);
        }
        return;
      }
      if (active) setDetailsLoading(true);
      try {
        const payload = await fetchTMDBDetails(mediaType, tmdbId);
        if (active) setDetails(payload);
      } catch {
        if (active) setDetails(null);
      } finally {
        if (active) setDetailsLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [mediaType, tmdbId]);

  // Load TMDB Recommendations (More Like This)
  useEffect(() => {
    let active = true;
    const loadRelated = async () => {
      if (!mediaType || !tmdbId) {
        if (active) setTmdbRelated([]);
        return;
      }
      try {
        const results = await fetchMoreLikeThis(mediaType, tmdbId);
        if (active) setTmdbRelated(results);
      } catch (err) {
        console.error('Error fetching TMDB related content:', err);
        if (active) setTmdbRelated([]);
      }
    };
    loadRelated();
    return () => {
      active = false;
    };
  }, [tmdbId, mediaType]);

  // Set default active language
  useEffect(() => {
    const langs = details?.languages?.length ? details.languages : initialItem?.language;
    if (langs?.length && !activeLang) {
      setActiveLang(langs[0]);
    }
  }, [details, initialItem?.language, activeLang]);

  // Reset Season Selection
  useEffect(() => {
    setEp(effectiveSeasonKeys[0] || 's1');
  }, [tmdbId, effectiveSeasonKeys.join(',')]);

  // Load Season Details (Episodes)
  useEffect(() => {
    let active = true;
    const loadSeasonDetails = async () => {
      if (mediaType !== 'tv' || !tmdbId) {
        if (active) setSeasonDetails(null);
        return;
      }
      try {
        const payload = await fetchTMDBSeasonDetails(tmdbId, getSeasonNumber(ep));
        if (active) setSeasonDetails(payload);
      } catch {
        if (active) setSeasonDetails(null);
      }
    };
    loadSeasonDetails();
    return () => {
      active = false;
    };
  }, [ep, tmdbId, mediaType]);

  const titleName = details?.title || initialItem?.name2 || initialItem?.title || '';
  const heroPoster = details?.mbg || initialItem?.img || initialItem?.name || '';
  const shownDesc = details?.desc || initialItem?.desc || '';

  const selectedSeason = getSeasonNumber(ep);
  const episodeCount = effectiveEpisodes?.[ep] || (mediaType === 'tv' ? 10 : 0);

  const episodeCards = useMemo(() => {
    if (Array.isArray(seasonDetails?.episodes) && seasonDetails.episodes.length > 0) {
      return seasonDetails.episodes;
    }
    return Array.from({ length: episodeCount }).map((_, index) => ({
      id: `${selectedSeason}-${index + 1}`,
      number: index + 1,
      name: `Episode ${index + 1}`,
      overview: shownDesc || 'Episode details are not available yet.',
      image: heroPoster,
      runtime: 0,
      airDate: '',
    }));
  }, [episodeCount, heroPoster, seasonDetails, selectedSeason, shownDesc]);

  const isWatched = useCallback(
    (episodeNumber) => watchedEpisodes.includes(`${selectedSeason}-${episodeNumber}`),
    [watchedEpisodes, selectedSeason]
  );

  const lastWatchedEp = useMemo(() => {
    if (mediaType !== 'tv' || !watchedEpisodes || watchedEpisodes.length === 0) return null;
    let maxS = 1;
    let maxE = 1;
    watchedEpisodes.forEach((epKey) => {
      const [s, e] = epKey.split('-').map(Number);
      if (s > maxS) {
        maxS = s;
        maxE = e;
      } else if (s === maxS && e > maxE) {
        maxE = e;
      }
    });
    return { season: maxS, episode: maxE };
  }, [watchedEpisodes, mediaType]);

  const handlePlayNow = useCallback(() => {
    let targetSeason = 1;
    let targetEpisode = 1;

    if (mediaType === 'tv' && lastWatchedEp) {
      targetSeason = lastWatchedEp.season;
      targetEpisode = lastWatchedEp.episode;
    }

    const streamId = mediaType === 'movie'
      ? `${tmdbId}`
      : `${tmdbId}/${targetSeason}/${targetEpisode}`;

    props.play?.(streamId);
    navigate(`/streaming/${streamId}`, {
      state: {
        title: titleName,
        type: mediaType,
        tmdbId,
        image: heroPoster,
        season: mediaType === 'tv' ? targetSeason : undefined,
        episode: mediaType === 'tv' ? targetEpisode : undefined,
      },
    });
  }, [mediaType, tmdbId, props, titleName, heroPoster, navigate, lastWatchedEp]);

  const seasonLabel = mediaType === 'tv'
    ? details?.seasonLabel || `${effectiveSeasonKeys.length} Season${effectiveSeasonKeys.length > 1 ? 's' : ''}`
    : details?.seasonLabel || initialItem?.season;

  const year = details?.year || initialItem?.releaseYear;
  const rating = details?.rating || initialItem?.rating || 0;
  const nextEp = details?.nextEp || '';
  const logo = details?.nameImg2;
  const trailer = details?.trailerUrl;

  const trailerEmbedUrl = useMemo(() => {
    if (!trailer) return '';
    const origin = typeof window !== 'undefined'
      ? `&origin=${encodeURIComponent(window.location.origin)}`
      : '';
    return `https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${trailer}&playsinline=1&enablejsapi=1&showinfo=0&iv_load_policy=3${origin}`;
  }, [trailer]);

  const shownCategories = details?.categories?.length ? details.categories : initialItem?.category;
  const shownAgeRating = details?.ageRating || initialItem?.ua || 'TV-PG';
  const cast = details?.cast || [];
  const mood = details?.mood || [];

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
      JSON.stringify({ event: 'command', func: command, args: [] }),
      '*'
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
        .filter((item) => String(item.tmdbId) !== String(tmdbId))
        .slice(0, 18);
    }

    const mainCategory = initialItem?.category?.[0] || details?.categories?.[0] || null;
    if (!mainCategory) return [];
    return data
      .filter(
        (item) =>
          item.name2 !== titleName &&
          Array.isArray(item.category) &&
          item.category.includes(mainCategory)
      )
      .slice(0, 18);
  }, [tmdbRelated, data, initialItem?.category, titleName, details?.categories, tmdbId]);

  const handleOpenRelated = useCallback(
    (item) => {
      navigate(getWatchPath(item, item.type), {
        replace: isModal,
        state: {
          item,
          ...(isModal && location.state?.backgroundLocation
            ? { backgroundLocation: location.state.backgroundLocation }
            : {}),
        },
      });
    },
    [navigate, isModal, location.state]
  );

  const renderRelatedCard = useCallback(
    (item) => (
      <Card
        key={item.id ?? item.tmdbId}
        sow={() => handleOpenRelated(item)}
        id={item.id}
        img={item.name || item.poster_path || item.img}
        name={item.name2 || item.title || item.name}
        ry={item.releaseYear || item.release_date || item.first_air_date}
        ua={item.ua}
        lan={item.language?.length || 0}
        desc={item.desc || item.overview}
        s={item.season}
        type={item.type}
        tid={item.tmdbId}
        rating={item.rating || item.vote_average || 0}
        add={(value) => props.add?.(value)}
        e={props.e}
        play={(tid) => props.play?.(tid)}
      />
    ),
    [handleOpenRelated, props]
  );

  const isSavedInList = useMemo(() => {
    if (!Array.isArray(props.e)) return false;
    return (
      props.e.includes(compositeSid) ||
      props.e.includes(initialItem?.id) ||
      props.e.includes(`${mediaType}:${tmdbId}`)
    );
  }, [props.e, compositeSid, initialItem?.id, mediaType, tmdbId]);

  let playButtonText = 'Play';
  if (mediaType === 'tv' && lastWatchedEp) {
    playButtonText = `Continue Watching S${lastWatchedEp.season} E${lastWatchedEp.episode}`;
  } else if (mediaType === 'movie' && hasWatchedMovie) {
    playButtonText = 'Continue Watching';
  }

  const handleGoBack = useCallback(() => {
    if (isModal && location.state?.backgroundLocation) {
      navigate(-1);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [isModal, location.state, navigate]);

  // Escape key & body scroll lock when displayed as Desktop JioHotstar Popup Modal
  useEffect(() => {
    if (!isModal) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleGoBack();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isModal, handleGoBack]);

  const isDetailsLoading = detailsLoading && !details;

  // Loading skeleton on cold direct deep-link or desktop modal open
  if (isDetailsLoading && !initialItem) {
    return (
      <div
        onClick={isModal ? handleGoBack : undefined}
        className={
          isModal
            ? 'fixed inset-0 z-[100] flex justify-center items-start pt-8 pb-8 overflow-y-auto bg-black/80 backdrop-blur-xl px-4'
            : 'min-h-screen bg-[#07070a] text-white pt-[66px] md:pt-20 pb-24 px-4'
        }
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[950px]">
          <Skeleton type="detail" />
        </div>
      </div>
    );
  }

  // Full-page offline fallback if direct navigation offline & no data
  if (!isOnline && !details && !initialItem && !detailsLoading) {
    return (
      <div className="min-h-screen bg-[#07070a] pt-[58px] md:pt-[76px] pb-24">
        <OfflineScreen
          onRetry={loadDetails}
          title="Title Unavailable Offline"
          message="Connect to the internet to load movie/series details, trailers, cast, and episodes."
        />
      </div>
    );
  }

  // Not found state
  if (!detailsLoading && !details && !initialItem) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center px-4 pt-20 pb-24">
        <div className="glass-modal max-w-md w-full p-8 rounded-3xl text-center border border-white/10 shadow-glass-lg">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4 text-[#E50914]">
            <i className="fa-solid fa-film text-2xl" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Title Not Found</h1>
          <p className="text-sm text-gray-400 mb-6">
            We couldn&apos;t find details for this movie or series.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="glass-btn-primary px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-neon-red cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="watch"
      ref={popupRef}
      onClick={isModal ? handleGoBack : undefined}
      className={
        isModal
          ? 'fixed inset-0 z-[100] flex justify-center items-start pt-8 pb-8 overflow-y-auto bg-black/80 backdrop-blur-xl px-4 text-white font-sans selection:bg-[#E50914] selection:text-white'
          : 'relative min-h-screen bg-[#07070a] text-white font-sans selection:bg-[#E50914] selection:text-white flex flex-col items-center pt-[58px] sm:pt-24 pb-20 sm:pb-8 px-0 sm:px-4 overflow-x-hidden'
      }
      style={isModal ? { animation: 'overlayFade 0.25s ease-out forwards' } : undefined}
    >
      {isModal && (
        <style>
          {`
            @keyframes overlayFade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes modalPop {
              0% { opacity: 0; transform: scale(0.94) translateY(14px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}
        </style>
      )}

      {/* Subtle Ambient Poster Glow Behind Card (Mobile / Direct Page only) */}
      {!isModal && heroPoster && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-15 blur-3xl scale-110"
          style={{ backgroundImage: `url('${heroPoster}')` }}
        />
      )}
      {!isModal && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 bg-black/75 backdrop-blur-xl"
        />
      )}

      <div
        id="watch-modal"
        onClick={isModal ? (e) => e.stopPropagation() : undefined}
        className="relative z-10 w-full max-w-[950px] min-h-screen sm:min-h-0 glass-modal text-white sm:rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.25)] overflow-hidden mb-0 sm:mb-8"
        style={isModal ? { animation: 'modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' } : undefined}
      >
        {/* Close / Back Button (Matches Original Watch Design) */}
        <button
          type="button"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-10 h-10 sm:w-11 sm:h-11 text-base rounded-full glass-mirror text-white/80 md:hover:text-white flex items-center justify-center transition-all duration-300 md:hover:scale-110 active:scale-95 shadow-glass-md cursor-pointer"
          onClick={handleGoBack}
          aria-label={isModal ? 'Close' : 'Back'}
          title={isModal ? 'Close' : 'Back'}
        >
          <i className="fa-solid fa-xmark" />
        </button>

        {/* ─── Hero Section ─── */}
        <div className="relative w-full aspect-video sm:h-auto overflow-hidden bg-black">
          {heroPoster ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
              style={{ backgroundImage: `url('${heroPoster}')`, opacity: trailerLoaded ? 0.3 : 1 }}
            />
          ) : (
            isDetailsLoading && <div className="absolute inset-0 bg-[#242424] animate-pulse" />
          )}
          {trailerEmbedUrl && (
            <iframe
              ref={trailerFrameRef}
              src={trailerEmbedUrl}
              title={`${titleName} trailer`}
              frameBorder="0"
              allow="autoplay; encrypted-media;"
              className="pointer-events-none absolute inset-0 w-[130%] h-[200%] -top-[51%] -left-[15%] transition-opacity duration-1000"
              onLoad={() => setTrailerLoaded(true)}
            />
          )}

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-[#09090d]/60 to-transparent bottom-0 h-[101%] pointer-events-none" />

          {mediaType === 'movie' && hasWatchedMovie && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-50">
              <div className="h-full bg-red-600 shadow-[0_0_10px_#e50914]" style={{ width: '100%' }} />
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
                type="button"
                className="glass-btn-primary flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-xs sm:text-base font-bold shadow-lg cursor-pointer active:scale-[0.97]"
                onClick={handlePlayNow}
              >
                <i className="fa-solid fa-play text-xs sm:text-sm" />
                <span>{playButtonText}</span>
              </button>

              <button
                type="button"
                className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full glass-mirror text-white/90 md:hover:text-white md:hover:border-white/40 transition-all md:hover:scale-105 active:scale-95 shadow-glass-sm cursor-pointer"
                onClick={() =>
                  props.add?.(
                    initialItem?.id || compositeSid,
                    tmdbId,
                    heroPoster,
                    titleName,
                    mediaType,
                    rating
                  )
                }
                title={isSavedInList ? 'Remove from My List' : 'Add to My List'}
                aria-label={isSavedInList ? 'Remove from My List' : 'Add to My List'}
              >
                {isSavedInList ? (
                  <i className="fa-solid fa-check text-emerald-400" />
                ) : (
                  <i className="fa-solid fa-plus" />
                )}
              </button>

              <div className="flex-1" />

              {trailerEmbedUrl && (
                <button
                  type="button"
                  className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full glass-mirror text-white/90 md:hover:text-white transition-all md:hover:scale-105 active:scale-95 shadow-glass-sm disabled:opacity-50 cursor-pointer"
                  onClick={() => setIsTrailerMuted((p) => !p)}
                  disabled={!trailerLoaded}
                  title={isTrailerMuted ? 'Unmute' : 'Mute'}
                  aria-label={isTrailerMuted ? 'Unmute trailer' : 'Mute trailer'}
                >
                  <i className={`fa-solid ${isTrailerMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`} />
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
              alt={titleName}
              className="max-h-full sm:max-w-[80%] object-contain drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full px-4">
              <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-wider bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] leading-[1.1]">
                {titleName}
              </h1>
            </div>
          )}
        </div>

        {/* ─── Metadata & Description Grid ─── */}
        <div className="px-4 sm:px-8 md:px-12 py-2 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-12 gap-y-5 sm:gap-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 text-[13px] sm:text-[15px] font-medium flex-wrap">
              <span className="text-[#46d369] font-bold">{(rating * 10).toFixed(0)}% Match</span>
              {year > 0 && <span className="text-gray-300">{year}</span>}
              <span className="text-gray-300">
                {mediaType === 'tv' ? seasonLabel : formatRuntime(details?.runtime)}
              </span>
              <span className="border border-gray-400/70 px-1 py-[1px] text-[10px] rounded-[3px] text-gray-300 font-bold tracking-wider leading-none flex items-center h-4">
                HD
              </span>
              <span className="border border-gray-400/70 px-1 py-[1px] text-[10px] rounded-[3px] text-gray-300 italic tracking-wider leading-none flex items-center h-4">
                AD
              </span>
              <i className="fa-regular fa-message text-gray-400 text-xs ml-1" />
              {nextEp && (
                <p className="text-[11px] sm:text-xs font-bold tracking-widest text-[#e8b84b] uppercase flex items-center gap-2 w-full sm:w-auto">
                  <i className="fa-solid fa-bolt text-[10px]" />
                  New episode on :{' '}
                  <span className="text-slate-200 tracking-normal normal-case font-medium">
                    {formatAirDate(nextEp) || nextEp}
                  </span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-[13px] sm:text-[14px]">
              <span className="border border-gray-400 px-1.5 py-[1px] text-xs font-semibold rounded-[3px] text-white bg-transparent leading-none flex items-center h-5">
                {shownAgeRating}
              </span>
              <span className="text-gray-300">
                {details?.languages?.join(', ') || initialItem?.language?.join(', ')}
              </span>
            </div>

            {/* ─── Description with Show More / Less ─── */}
            {shownDesc ? (
              <div className="space-y-1.5">
                <p
                  className={`text-[13px] sm:text-[15px] text-gray-200 leading-relaxed font-normal transition-all ${!isDescExpanded && isLongDesc ? 'line-clamp-3' : ''
                    }`}
                >
                  {shownDesc}
                </p>
                {isLongDesc && (
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded((prev) => !prev)}
                    aria-expanded={isDescExpanded}
                    className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-semibold text-white/85 md:hover:text-white transition-colors cursor-pointer select-none"
                  >
                    <span>{isDescExpanded ? 'Show less' : 'Show more'}</span>
                    <i
                      className={`fa-solid fa-chevron-${isDescExpanded ? 'up' : 'down'
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
                <span className="text-gray-200 md:hover:underline cursor-pointer">
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
                <span className="text-gray-200">{visibleMoods.join(', ')}</span>
                {hasMoreMoods && (
                  <button
                    type="button"
                    onClick={() => setIsMoodExpanded((prev) => !prev)}
                    aria-expanded={isMoodExpanded}
                    className="ml-1.5 inline-flex items-center gap-1 text-xs font-semibold text-white/80 md:hover:text-white underline-offset-2 md:hover:underline transition-colors cursor-pointer select-none"
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
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar touch-pan-x">
              {cast.slice(0, 15).map((actor, i) => (
                <div key={actor.id || i} className="flex flex-col items-center flex-shrink-0 w-20 sm:w-24 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-800 mb-1">
                    <img
                      src={
                        actor.image ||
                        (actor.profile_path
                          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                          : 'https://via.placeholder.com/150/1a1a1a/ffffff?text=User')
                      }
                      alt={actor.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs text-gray-300 line-clamp-1">{actor.name}</span>
                  {actor.character && (
                    <span className="text-xs text-gray-500 line-clamp-1">{actor.character}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Episodes Section ─── */}
        {mediaType === 'tv' && effectiveSeasonKeys.length > 0 && (
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
                    <option key={key} value={key} className="bg-[#0e0e14] text-white">
                      Season {index + 1}
                    </option>
                  ))}
                </select>
                <i className="fa-solid fa-caret-down absolute right-3.5 top-1/2 -translate-y-1/2 text-white pointer-events-none text-xs" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 mb-4 font-medium">
              <span>
                Season {selectedSeason}: {episodeCards.length} episode
                {episodeCards.length !== 1 ? 's' : ''}
              </span>
              <span className="border border-white/20 px-2 py-[2px] text-[10px] font-semibold rounded-md text-white bg-white/[0.05] leading-none flex items-center h-4">
                {shownAgeRating}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {episodeCards.map((episode, index) => {
                const episodeNumber = episode.number || index + 1;
                const airDateLabel = formatAirDate(episode.airDate);
                const isNew = isRecentlyAired(episode.airDate);
                const watched = isWatched(episodeNumber);

                return (
                  episode.runtime !== undefined && (
                    <div
                      key={episode.id || index}
                      className={`group flex flex-col sm:flex-row items-start sm:items-center p-3.5 sm:p-4 border-b cursor-pointer transition-all rounded-xl active:bg-white/[0.08] ${watched
                          ? 'border-white/[0.04] md:hover:bg-white/[0.03]'
                          : 'border-white/[0.08] md:hover:bg-white/[0.06]'
                        }`}
                      onClick={() => {
                        markEpisodeWatched(tmdbId, selectedSeason, episodeNumber);
                        setWatchedEpisodes((prev) =>
                          prev.includes(`${selectedSeason}-${episodeNumber}`)
                            ? prev
                            : [...prev, `${selectedSeason}-${episodeNumber}`]
                        );

                        const streamId = `${mediaType}/${tmdbId}/${selectedSeason}/${episodeNumber}`;
                        props.play?.(streamId);
                        navigate(`/streaming/${tmdbId}/${selectedSeason}/${episodeNumber}`, {
                          state: {
                            title: titleName,
                            episodeName: episode.name,
                            type: mediaType,
                            tmdbId,
                            image: heroPoster,
                            season: selectedSeason,
                            episode: episodeNumber,
                          },
                        });
                      }}
                    >
                      <div className="flex items-center w-full mb-3 sm:mb-0">
                        <div className="relative w-24 sm:w-[120px] aspect-video rounded overflow-hidden flex-shrink-0 bg-gray-800 mr-3 sm:mr-4">
                          <img
                            src={episode.image || heroPoster}
                            alt={episode.name}
                            className={`w-full h-full object-cover transition-opacity ${watched ? 'opacity-70' : ''
                              }`}
                          />

                          {watched && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#404040]">
                              <div className="h-full bg-red-600" style={{ width: '100%' }} />
                            </div>
                          )}

                          {isNew && !watched && (
                            <span className="absolute top-1 left-1 bg-[#ecb942] text-black text-[9px] font-bold px-1.5 py-[1px] rounded-[2px] tracking-wide">
                              NEW
                            </span>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 md:group-hover:opacity-100 transition duration-200">
                            <i className="fa-regular fa-circle-play text-white text-2xl sm:text-3xl" />
                          </div>
                        </div>

                        <div className="flex flex-col justify-center flex-1 min-w-0 pr-2">
                          <div className="flex items-start sm:items-center justify-between mb-1 gap-2">
                            <h4
                              className={`text-[14px] sm:text-base font-bold truncate ${watched ? 'text-gray-300' : 'text-white'
                                }`}
                            >
                              {`${episodeNumber}.${episode.name || `Episode ${episodeNumber}`}`}
                            </h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                                {[episode.runtime > 0 ? `${episode.runtime}m` : null, airDateLabel]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </span>
                            </div>
                          </div>
                          <p
                            className={`text-[12px] sm:text-[14px] line-clamp-2 leading-snug ${watched ? 'text-gray-500' : 'text-gray-400'
                              }`}
                          >
                            {episode.overview || 'Synopsis not available.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
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
              renderItem={(item) => renderRelatedCard(item)}
            />
          </div>
        )}
      </div>

      {/* Page Footer (Hidden when displayed as Desktop Popup Modal) */}
      {!isModal && (
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 mt-2">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default React.memo(Watch);
