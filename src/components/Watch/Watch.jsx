import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card/Card';
import RailRow from '../RailRow/RailRow';
import { useRailScroll } from '../../hooks/useRailScroll';
import { fetchTMDBDetails, fetchTMDBSeasonDetails } from '../../content/tmdb.js';

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

const Watch = (props) => {
  const navigate = useNavigate();
  const data = Array.isArray(props.data) ? props.data : [];
  const [details, setDetails] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [activeLang, setActiveLang] = useState(null);
  const [trailerLoaded, setTrailerLoaded] = useState(false);
  const [isTrailerMuted, setIsTrailerMuted] = useState(true);
  const trailerFrameRef = useRef(null);

  const effectiveEpisodes = details?.episodes || props.s || {};
  const seasonKeys = Object.keys(effectiveEpisodes);
  const effectiveSeasonKeys = props.type === 'tv' && seasonKeys.length === 0 ? ['s1'] : seasonKeys;
  const [ep, setEp] = useState(seasonKeys[0] || 's1');

  const { scrollState, setTrackRef, onRailScroll, handleRailScroll } = useRailScroll(['related']);

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

  // Set default active language
  useEffect(() => {
    const langs = details?.languages?.length ? details.languages : props.language;
    if (langs?.length && !activeLang) {
      setActiveLang(langs[0]);
    }
  }, [details, props.language]);

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
    const watch = document.getElementById('watch');
    if (watch) watch.style.display = 'none';
    if (typeof props.onClose === 'function') props.onClose();
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

  const handlePlayNow = useCallback(() => {
    const streamId = props.type === 'movie' ? `${props.type}/${props.id}` : `${props.type}/${props.id}/1/1`;
    props.play(streamId);
    const queryData = {
      title: props.mname,
      type: props.type,
      tmdbId: props.id,
      currentSeason: selectedSeason,
      defaultImage: props.img,
      episodes: JSON.stringify(episodeCards)
    };
    const queryString = new URLSearchParams(queryData).toString();
    navigate(`/stream?name=${props.mname}&tmdb=${streamId}&${queryString}`);
  }, [props.type, props.id, props.play, props.mname, selectedSeason, props.img, episodeCards, navigate]);

  const seasonLabel = props.type === 'tv'
    ? details?.seasonLabel || `${effectiveSeasonKeys.length} Season${effectiveSeasonKeys.length > 1 ? 's' : ''}`
    : details?.seasonLabel || props.season;

  const year = details?.year || props.yr;
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
  const heroPoster = details?.mbg || props.img;

  // Convert standard 0-10 rating to Netflix-style % Match
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

  const related = useMemo(() => {
    const mainCategory = props.cat?.[0];
    if (!mainCategory) return [];
    return data
      .filter((item) =>
        item.name2 !== props.mname &&
        Array.isArray(item.category) &&
        item.category.includes(mainCategory)
      )
      .slice(0, 18);
  }, [data, props.cat, props.mname]);

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
          const container = document.getElementById('watch-modal');
          container?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    ),
    [props]
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center items-start pt-0 sm:pt-8 overflow-y-auto bg-black/70 backdrop-blur-[2px]"
      id="watch"
      onClick={closeWatch} // Clicking the dark backdrop closes the modal
    >
      {/* Modal Container */}
      <div
        id="watch-modal"
        className="relative w-full max-w-[950px] min-h-screen sm:min-h-0 bg-[#181818] text-white sm:rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden animate-[fadeIn_0.2s_ease-out] mb-0 sm:mb-8"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        {/* Close Button (Inside modal as per reference image) */}
        <button
          className="absolute top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-[#181818] hover:bg-[#2a2a2a] text-white transition-colors duration-200"
          onClick={closeWatch}
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark text-xl font-light"></i>
        </button>

        {/* ─── Hero Section ─── */}
        <div className="relative w-full aspect-video sm:h-auto overflow-hidden bg-black">
          {heroPoster && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
              style={{ backgroundImage: `url('${heroPoster}')`, opacity: trailerLoaded ? 0.3 : 1 }}
            />
          )}
          {trailerEmbedUrl && (
            <iframe
              ref={trailerFrameRef}
              src={trailerEmbedUrl}   // ← now contains the extra parameters
              title={`${props.mname} trailer`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              className="pointer-events-none absolute inset-0 w-[105%] h-[300%] -top-[100%] transition-opacity duration-1000"
              onLoad={() => setTrailerLoaded(true)}
            />
          )}

          {/* Netflix-style Vignette & Heavy Bottom Fade */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/50 to-transparent bottom-0 h-[101%] pointer-events-none"></div>

          {/* Hero Content Overlays */}
          <div className="absolute bottom-[5%] left-0 w-full px-6 sm:px-12 flex flex-col gap-4">
            {logo ? (
              <img src={logo} alt={props.mname} className="w-1/2 sm:max-w-[320px] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
            ) : (
              <h1 className="text-4xl sm:text-6xl font-bold drop-shadow-lg">{props.mname}</h1>
            )}

            <div className="flex items-center gap-2 sm:gap-3 w-full">
              {/* Solid White Play Button */}
              <button
                className="flex items-center gap-2 px-6 sm:px-8 py-1.5 sm:py-2 bg-white text-black font-bold rounded-[4px] text-sm sm:text-[1.1rem] hover:bg-white/80 transition"
                onClick={handlePlayNow}
              >
                <i className="fa-solid fa-play"></i>
                Play
              </button>

              {/* Circular Outline Buttons */}
              <button
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-[2px] border-white/50 bg-[#2a2a2a]/40 hover:border-white hover:bg-white/10 transition backdrop-blur-sm"
                onClick={() => props.add(props.sid)}
              >
                {props.El === 'ADDED' ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-plus"></i>}
              </button>

              <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-[2px] border-white/50 bg-[#2a2a2a]/40 hover:border-white hover:bg-white/10 transition backdrop-blur-sm">
                <i className="fa-regular fa-thumbs-up"></i>
              </button>

              <div className="flex-1"></div>

              {trailerEmbedUrl && (
                <button
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-[2px] border-white/50 bg-[#2a2a2a]/40 hover:border-white text-white transition backdrop-blur-sm disabled:opacity-50"
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
        <div className="px-6 sm:px-12 py-2 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-12 gap-y-6">

          {/* Left Column: Metadata & Description */}
          <div className="space-y-4">

            {/* Meta Row 1 */}
            <div className="flex items-center gap-2 sm:gap-3 text-[14px] sm:text-[15px] font-medium flex-wrap">
              <span className="text-[#46d369] font-bold">{ratingMatch}</span>
              <span className="text-gray-300">{year}</span>
              <span className="text-gray-300">{props.type === 'tv' ? seasonLabel : formatRuntime(details?.runtime)}</span>
              <span className="border border-gray-400/70 px-1 py-[1px] text-[10px] rounded-[3px] text-gray-300 font-bold tracking-wider leading-none flex items-center h-4">HD</span>
              <span className="border border-gray-400/70 px-1 py-[1px] text-[10px] rounded-[3px] text-gray-300 font-bold tracking-wider leading-none flex items-center h-4">AD</span>
              <i className="fa-regular fa-message text-gray-400 text-xs ml-1"></i>
            </div>

            {/* Meta Row 2 (Rating & Badges) */}
            <div className="flex items-center gap-2 text-[14px]">
              <span className="border border-gray-400 px-1.5 py-[1px] text-xs font-semibold rounded-[3px] text-white bg-transparent leading-none flex items-center h-5">
                {shownAgeRating}
              </span>
              <span className="text-gray-300">{mood?.slice(0, 2).join(', ') || props.language}</span>
            </div>

            {/* Synopsis */}
            <p className="text-[14px] sm:text-[15px] text-gray-200 leading-relaxed font-normal">
              {shownDesc}
            </p>
          </div>

          {/* Right Column: Cast & Genres */}
          <div className="space-y-3 text-[13px] sm:text-[14px] leading-snug">
            {cast.length > 0 && (
              <div>
                <span className="text-[#777777]">Cast: </span>
                <span className="text-gray-200 hover:underline cursor-pointer">
                  {cast.slice(0, 3).map(a => a.name).join(', ')}
                </span>
                {cast.length > 3 && <span className="text-gray-200 italic hover:underline cursor-pointer">, more</span>}
              </div>
            )}

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

        {/* ─── Episodes Section ─── */}
        {props.type === 'tv' && effectiveSeasonKeys.length > 0 && (
          <div className="px-6 sm:px-12 mt-10">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Episodes</h3>
              <div className="relative">
                <select
                  value={ep}
                  onChange={(e) => setEp(e.target.value)}
                  className="appearance-none bg-[#242424] text-white px-4 py-1.5 pr-10 text-base font-medium rounded outline-none border border-gray-600 focus:border-white cursor-pointer"
                >
                  {effectiveSeasonKeys.map((key, index) => (
                    <option key={key} value={key}>Season {index + 1}</option>
                  ))}
                </select>
                <i className="fa-solid fa-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"></i>
              </div>
            </div>

            {/* Season Meta (e.g. Season 1: TV-PG language) */}
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-4 font-medium">
              <span>Season {selectedSeason}:</span>
              <span className="border border-gray-400 px-1 py-[1px] text-[10px] font-semibold rounded-[3px] text-white leading-none flex items-center h-4">{shownAgeRating}</span>
              {/* <span>language</span> */}
            </div>

            {/* Episode List */}
            <div className="flex flex-col">
              {episodeCards.map((episode, index) => (
                episode.runtime !== undefined && (
                  <div
                    key={episode.id || index}
                    className="group flex flex-col sm:flex-row items-start sm:items-center p-4 border-b border-[#404040] hover:bg-[#2a2a2a] cursor-pointer transition rounded-md sm:rounded-none"
                    onClick={() => {
                      const epNum = episode.number || index + 1;
                      const streamId = `${props.type}/${props.id}/${selectedSeason}/${epNum}`;
                      props.play(streamId);
                      navigate(`/stream?name=${props.mname}&tmdb=${streamId}`);
                    }}
                  >
                    {/* Number & Thumbnail Wrapper */}
                    <div className="flex items-center w-full sm:w-auto mb-3 sm:mb-0">
                      {/* Large Episode Number */}
                      {/* <span className="text-2xl sm:text-3xl text-gray-400 font-normal w-10 sm:w-12 text-center flex-shrink-0 group-hover:text-white transition-colors">
                        {index + 1}
                      </span> */}

                      {/* Thumbnail Image */}
                      <div className="relative w-32 sm:w-[120px] aspect-video rounded overflow-hidden flex-shrink-0 bg-gray-800 mr-4">
                        <img
                          src={episode.image || props.img}
                          alt={episode.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Play overlay on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200">
                          <i className="fa-regular fa-circle-play text-white text-3xl"></i>
                        </div>
                      </div>

                      {/* Episode Details */}
                      <div className="flex flex-col justify-center flex-1 min-w-0 pr-2">
                        <div className="flex items-start sm:items-center justify-between mb-1">
                          <h4 className="text-[15px] sm:text-base font-bold text-white truncate pr-4">
                            {episode.name || `Episode ${index + 1}`}
                          </h4>
                          {episode.runtime > 0 && <span className="text-sm text-gray-400 flex-shrink-0">{episode.runtime}m</span>}
                        </div>
                        <p className="text-[13px] sm:text-[14px] text-gray-400 line-clamp-3 sm:line-clamp-2 leading-snug">
                          {episode.overview || 'Synopsis not available.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* ─── More Like This ─── */}
        <div className="px-6 sm:px-12 mt-12 mb-12">
          {related.length > 0 && (
            <RailRow
              title="More Like This"
              railKey="related"
              items={related}
              scrollState={scrollState}
              setTrackRef={setTrackRef}
              onRailScroll={onRailScroll}
              handleRailScroll={handleRailScroll}
              eager
              renderItem={renderRelatedCard}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Watch);