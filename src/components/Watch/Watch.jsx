import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card/Card';

import { useRailScroll } from '../../hooks/useRailScroll';
// ─── IMPORT fetchMoreLikeThis ───
import { fetchTMDBDetails, fetchTMDBSeasonDetails, fetchMoreLikeThis } from '../../content/tmdb.js';
import { getWatchedEpisodes, markEpisodeWatched, unmarkEpisodeWatched } from '../../utils/continueWatching';

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
  const data = Array.isArray(props.data) ? props.data : [];
  const [details, setDetails] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [activeLang, setActiveLang] = useState(null);
  const [trailerLoaded, setTrailerLoaded] = useState(false);
  const [isTrailerMuted, setIsTrailerMuted] = useState(true);
  const trailerFrameRef = useRef(null);

  // ─── ADDED: State for TMDB Recommendations ───
  const [tmdbRelated, setTmdbRelated] = useState([]);

  const effectiveEpisodes = details?.episodes || props.s || {};
  const seasonKeys = Object.keys(effectiveEpisodes);
  const effectiveSeasonKeys = props.type === 'tv' && seasonKeys.length === 0 ? ['s1'] : seasonKeys;
  const [ep, setEp] = useState(seasonKeys[0] || 's1');

  const [watchedEpisodes, setWatchedEpisodes] = useState(() => getWatchedEpisodes(props.id));
  const [hasWatchedMovie, setHasWatchedMovie] = useState(false);

  useEffect(() => {
    setWatchedEpisodes(getWatchedEpisodes(props.id));
    if (props.type === 'movie') {
      try {
        const history = JSON.parse(localStorage.getItem('continue-watching')) || [];
        const isWatched = history.some(item => String(item.tmdbId) === String(props.id));
        console.log(`Movie ID ${props.id} has been watched:`, history, isWatched);
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

  // ─── ADDED: Load TMDB Recommendations (More Like This) ───
  useEffect(() => {
    let active = true;
    const loadRelated = async () => {
      if (!props.type || !props.id) {
        if (active) setTmdbRelated([]);
        return;
      }
      try {
        // Fetch actual recommendations from TMDB API
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

  const watchedInSeason = useMemo(
    () => watchedEpisodes.filter((key) => key.startsWith(`${selectedSeason}-`)).length,
    [watchedEpisodes, selectedSeason]
  );

  const isWatched = useCallback(
    (episodeNumber) => watchedEpisodes.includes(`${selectedSeason}-${episodeNumber}`),
    [watchedEpisodes, selectedSeason]
  );

  const toggleEpisodeWatched = useCallback((episodeNumber) => {
    const key = `${selectedSeason}-${episodeNumber}`;
    setWatchedEpisodes((prev) => {
      if (prev.includes(key)) {
        unmarkEpisodeWatched(props.id, selectedSeason, episodeNumber);
        return prev.filter((k) => k !== key);
      }
      markEpisodeWatched(props.id, selectedSeason, episodeNumber);
      return [...prev, key];
    });
  }, [props.id, selectedSeason]);

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
  const shownLanguages = details?.languages?.length ? details.languages : props.language;
  const shownAgeRating = details?.ageRating || props.ua || 'TV-PG';
  const cast = details?.cast || [];
  const mood = details?.mood || [];
  const heroPoster = props.img;

  const ratingMatch = props.rating ? `${(parseFloat(props.rating / 10) * 100).toFixed(0)}% Match` : '98% Match';

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

  // ─── UPDATED: More Like This Logic ───
  const related = useMemo(() => {
    // 1. Prioritize TMDB API recommendations if available
    if (tmdbRelated.length > 0) {
      return tmdbRelated
        .filter(item => String(item.tmdbId) !== String(props.id))
        .slice(0, 18);
    }

    // 2. Fallback to local catalog filtering if TMDB returns empty (happens for obscure titles)
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
    (item) => (
      <Card
        sow={props.sow || (() => { })}
        id={item.id}
        img={item.name}
        name={item.name2}
        ry={item.releaseYear}
        ua={item.ua}
        lan={item.language?.length || 0}
        desc={item.desc}
        s={item.season}
        type={item.type}
        tid={item.tmdbId}
        add={(value) => props.add(value)}
        e={props.e}
        play={(tid) => props.play(tid)}
        onClick={() => {
          if (typeof props.sow === 'function') props.sow(item.id);
          const container = document.getElementById('watch');
          container?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    ),
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
      className="fixed inset-0 z-[100] flex justify-center items-start pt-0 sm:pt-8 overflow-y-auto bg-black/70 backdrop-blur-[2px]"
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
            0% { opacity: 0; transform: scale(0.9) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}
      </style>

      <div
        id="watch-modal"
        className="relative w-full max-w-[950px] min-h-screen sm:min-h-0 bg-[#181818] text-white sm:rounded shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden mb-0 sm:mb-8"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <button
          className="fixed top-2 right-2 z-20 w-12 h-12 text-[32px] font-thin rounded-full bg-black/60 hover:bg-black text-white/70 hover:text-white flex items-center justify-center group-hover:opacity-100 transition-all duration-300 border border-transparent hover:border-white/50 backdrop-blur-sm"
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
              style={{ backgroundImage: `url('${heroPoster}')`, opacity: trailerLoaded ? 0.3 : 1 }}>
              <p>Trailer at not Available</p>
            </div>
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

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/50 to-transparent bottom-0 h-[101%] pointer-events-none"></div>

          {props.type === 'movie' && hasWatchedMovie && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#404040] z-50">
              <div className="h-full bg-red-600 shadow-[0_0_10px_red]" style={{ width: '100%' }}></div>
            </div>
          )}

          {/* Hero Content Overlays */}
          <div className="absolute bottom-[5%] left-0 w-full px-4 sm:px-8 md:px-12 flex flex-col gap-3 sm:gap-4">
            <div className="relative flex items-end justify-start h-[60px] sm:h-[130px] w-[70%]">
              {logo ? (
                <img
                  src={logo}
                  alt={props.mname}
                  className="max-h-full max-w-[50%] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                />
              ) : (
                <h1 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl w-[100%] font-bold drop-shadow-lg leading-tight">
                  {props.mname}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 w-full flex-wrap">
              <button
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-1.5 sm:py-2 bg-white text-black font-bold rounded-[4px] text-xs sm:text-[1.1rem] hover:bg-white/80 transition"
                onClick={handlePlayNow}
              >
                <i className="fa-solid fa-play"></i>
                {playButtonText}
              </button>

              <button
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-[2px] border-white/50 bg-[#2a2a2a]/40 hover:border-white hover:bg-white/10 transition backdrop-blur-sm"
                onClick={() => props.add(props.sid, props.id, props.name2, props.mname, props.type, props.rating)}
              >
                {props.El === 'ADDED' ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-plus"></i>}
              </button>

              <div className="flex-1"></div>

              {trailerEmbedUrl && (
                <button
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-[2px] border-white/50 bg-[#2a2a2a]/40 hover:border-white text-white transition backdrop-blur-sm disabled:opacity-50"
                  onClick={() => setIsTrailerMuted(p => !p)}
                  disabled={!trailerLoaded}
                >
                  <i className={`fa-solid ${isTrailerMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Content Body ─── */}
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

            <p className="text-[13px] sm:text-[15px] text-gray-200 leading-relaxed font-normal">
              {shownDesc}
            </p>
          </div>

          <div className="space-y-3 text-[13px] sm:text-[14px] leading-snug">
            {shownCategories?.length > 0 && (
              <div>
                <span className="text-[#777777]">Genres: </span>
                <span className="text-gray-200 hover:underline cursor-pointer">
                  {shownCategories.join(', ')}
                </span>
              </div>
            )}

            {mood.length > 0 && (
              <div>
                <span className="text-[#777777]">This show is: </span>
                <span className="text-gray-200 hover:underline cursor-pointer">
                  {mood.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

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
                  className="appearance-none bg-[#242424] text-white px-3 sm:px-4 py-1.5 pr-9 sm:pr-10 text-sm sm:text-base font-medium rounded outline-none border border-gray-600 focus:border-white cursor-pointer"
                >
                  {effectiveSeasonKeys.map((key, index) => (
                    <option key={key} value={key}>Season {index + 1}</option>
                  ))}
                </select>
                <i className="fa-solid fa-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none text-sm"></i>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 mb-4 font-medium">
              <span>Season {selectedSeason}: {episodeCards.length} episode{episodeCards.length !== 1 ? 's' : ''}</span>
              <span className="border border-gray-400 px-1 py-[1px] text-[10px] font-semibold rounded-[3px] text-white leading-none flex items-center h-4">{shownAgeRating}</span>
            </div>

            <div className="flex flex-col">
              {episodeCards.map((episode, index) => {
                const episodeNumber = episode.number || index + 1;
                const airDateLabel = formatAirDate(episode.airDate);
                const isNew = isRecentlyAired(episode.airDate);
                const watched = isWatched(episodeNumber);

                return episode.runtime !== undefined && (
                  <div
                    key={episode.id || index}
                    className={`group flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 border-b cursor-pointer transition rounded-md sm:rounded-none ${watched ? 'border-[#404040]/60 hover:bg-[#2a2a2a]/60' : 'border-[#404040] hover:bg-[#2a2a2a]'}`}
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

        {/* ─── More Like This ─── */}
        <div className="sm:p-10 p-4">
          {related.length > 0 && (
            <>
              <h3 className="text-2xl font-bold text-white">More Like This</h3>
              <hr className="my-3 border-gray-600" />
              <div className="flex flex-wrap justify-between">
                <div className="flex flex-wrap justify-between gap-3">
                  {related.map((item) => renderRelatedCard(item))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Watch);