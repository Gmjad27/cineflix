import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveContinueWatching } from '../../utils/continueWatching';

const SERVERS = [
  {
    id: 'server1',
    name: 'Server 1 (IQSmart)',
    getTvUrl: (id, s, e) => `https://streams.iqsmartgames.com/embed/tv/${id}/${s}/${e}?key=e11a7debaaa4f5d25b671706ffe4d2acb56efbd4`,
    getMovieUrl: (id) => `https://streams.iqsmartgames.com/embed/movie/${id}?key=e11a7debaaa4f5d25b671706ffe4d2acb56efbd4`
  },
  {
    id: 'server2',
    name: 'Server 2 (Nxsha)',
    getTvUrl: (id, s, e) => `https://web.nxsha.app/embed/tv/${id}/${s}/${e}?dub=Hindi&sub=English`,
    getMovieUrl: (id) => `https://web.nxsha.app/embed/movie/${id}?dub=Hindi&sub=English`
  },
  {
    id: 'server3',
    name: 'Server 3 (Modiplay)',
    getTvUrl: (id, s, e) => `https://rozgarlelo.modiplay.xyz/embed/tmdb/tv?id=${id}&s=${s}&e=${e}`,
    getMovieUrl: (id) => `https://rozgarlelo.modiplay.xyz/embed/tmdb/movie?id=${id}`
  }
];

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

const Stream = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const activeCardRef = useRef(null);
  const queryParams = new URLSearchParams(location.search);

  const navState = location.state || {};
  const title = queryParams.get('title') || navState.name || 'Stream';
  const episodesString = queryParams.get('episodes');

  const passedEpisodes = useMemo(() => {
    if (!episodesString) return props.episodes || [];
    try {
      const parsed = JSON.parse(episodesString);
      return Array.isArray(parsed) ? parsed : (props.episodes || []);
    } catch (err) {
      console.warn('Stream: failed to parse episodes param, falling back.', err);
      return props.episodes || [];
    }
  }, [episodesString, props.episodes]);

  const defaultImage = queryParams.get('defaultImage') || props.img || '';
  // console.log(defaultImage, 'defaultImage');
  const streamId = queryParams.get('tmdb') || props.tid || '';

  const parts = streamId.split('/');
  const streamType = parts[0] ? parts[0].toLowerCase() : '';
  const id = parts[1] || '';

  const [currentSeason, setCurrentSeason] = useState(
    parts[2] ? parseInt(parts[2], 10) : (Number(queryParams.get('currentSeason')) || 1)
  );
  const [currentEpisode, setCurrentEpisode] = useState(
    parts[3] ? parseInt(parts[3], 10) : 1
  );

  const [activeServer, setActiveServer] = useState(SERVERS[0]);
  const [showEpisodesMobile, setShowEpisodesMobile] = useState(false);

  const src = useMemo(() => {
    if (!streamType || !id) return '';
    if (streamType === 'tv') {
      return activeServer.getTvUrl(id, currentSeason, currentEpisode);
    }
    return activeServer.getMovieUrl(id);
  }, [streamType, id, currentSeason, currentEpisode, activeServer]);

  useEffect(() => {
    if (src) setIsLoading(true);
  }, [src]);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsDesktop(window.innerWidth >= 992), 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentEpisode]);

  const handleEpisodeChange = (episodeNum) => {
    if (episodeNum === currentEpisode) return;
    setCurrentEpisode(episodeNum);
  };

  const hasNextEpisode = streamType === 'tv' && currentEpisode < passedEpisodes.length;
  const handleNextEpisode = () => {
    if (hasNextEpisode) handleEpisodeChange(currentEpisode + 1);
  };

  useEffect(() => {
    if (!streamType || !id) return;
    saveContinueWatching({
      tmdbId: id,
      type: streamType,
      title,
      image: defaultImage,
      season: streamType === 'tv' ? currentSeason : null,
      episode: streamType === 'tv' ? currentEpisode : null,
      episodes: passedEpisodes,
      streamId: streamType === 'tv'
        ? `${streamType}/${id}/${currentSeason}/${currentEpisode}`
        : `${streamType}/${id}`,
    });
  }, [streamType, id, title, defaultImage, currentSeason, currentEpisode, passedEpisodes]);

  const activeEpisodeData = passedEpisodes.find(
    (episode, index) => (episode.number || index + 1) === currentEpisode
  );
 console.log(defaultImage, 'defaultImage');
  if (!src) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <p className="text-lg sm:text-xl mb-4 text-center">No stream selected.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition"
        >
          Browse Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-3 sm:px-4 md:px-8 py-2.5 sm:py-3 bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white text-lg sm:text-xl flex-shrink-0" aria-label="Back">
            ←
          </button>
          <h1 className="text-sm sm:text-lg font-semibold truncate max-w-[140px] sm:max-w-[200px] md:max-w-sm">{title}</h1>
          {streamType === 'tv' && (
            <span className="text-xs sm:text-sm text-[#e8b84b] font-semibold whitespace-nowrap flex-shrink-0">
              S{currentSeason} E{currentEpisode}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-white/70 hover:text-white text-sm hidden md:block flex-shrink-0"
        >
          Home
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 p-3 sm:p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {/* Video player area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="relative w-full aspect-video bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                <div className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-white/20 border-t-[#e8b84b] rounded-full animate-spin" />
              </div>
            )}
            <iframe
              src={src}
              className="w-full h-full border-none"
              allowFullScreen
              allow="accelerometer; autoplay; encrypted-media; gyroscope;"
              title="Stream Player"
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {/* Now playing line (mobile-friendly episode context) */}
          {streamType === 'tv' && activeEpisodeData && (
            <div className="mt-3 sm:hidden">
              <p className="text-sm font-semibold truncate">{activeEpisodeData.name || `Episode ${currentEpisode}`}</p>
              <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{activeEpisodeData.overview || 'No description available.'}</p>
            </div>
          )}

          {/* Server Selection & Next Episode Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs sm:text-sm text-gray-400 self-center mr-1 sm:mr-2">Servers:</span>
              {SERVERS.map((server) => (
                <button
                  key={server.id}
                  onClick={() => setActiveServer(server)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    activeServer.id === server.id
                      ? 'bg-[#e8b84b] text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {server.name}
                </button>
              ))}
            </div>

            {hasNextEpisode && (
              <button
                onClick={handleNextEpisode}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs sm:text-sm transition backdrop-blur-md"
              >
                Next Episode <span className="text-xs">→</span>
              </button>
            )}
          </div>

          {/* Toggle episodes list on mobile */}
          {streamType === 'tv' && passedEpisodes.length > 0 && (
            <button
              onClick={() => setShowEpisodesMobile((prev) => !prev)}
              className="mt-4 flex items-center justify-between lg:hidden px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition"
            >
              <span>Episodes · Season {currentSeason}</span>
              <span className={`transition-transform ${showEpisodesMobile ? 'rotate-180' : ''}`}>⌄</span>
            </button>
          )}
        </div>

        {/* Episodes sidebar (TV only) */}
        {streamType === 'tv' && passedEpisodes.length > 0 && (
          <aside className={`w-full mb-28 lg:w-80 xl:w-96 flex-shrink-0 ${showEpisodesMobile ? 'block' : 'hidden'} lg:block`}>
            <div className="hidden lg:flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Season {currentSeason}</h3>
              <span className="text-sm text-gray-400">{passedEpisodes.length} episodes</span>
            </div>
            <div className="space-y-2 max-h-[60vh] lg:max-h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {passedEpisodes.map((episode, index) => {
                const epNum = episode.number || index + 1;
                const isActive = currentEpisode === epNum;
                const airDateLabel = formatAirDate(episode.airDate);
                const isNew = isRecentlyAired(episode.airDate);
                return (
                  <div
                    key={episode.id != null ? `ep-${episode.id}` : `ep-idx-${index}`}
                    ref={isActive ? activeCardRef : null}
                    className={`flex gap-3 p-2.5 sm:p-3 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-white/10 border border-[#e8b84b]/60'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                    onClick={() => handleEpisodeChange(epNum)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleEpisodeChange(epNum);
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <div
                      className="w-20 h-12 sm:w-28 sm:h-16 rounded-md bg-cover bg-center flex-shrink-0 relative overflow-hidden"
                      style={{ backgroundImage: `url('${episode.image || defaultImage}')` }}
                    >
                      {isNew && !isActive && (
                        <span className="absolute top-1 left-1 bg-[#e8b84b] text-black text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-[1px] rounded-[2px] tracking-wide">
                          NEW
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-lg sm:text-xl">
                          ▶
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-semibold truncate ${isActive ? 'text-[#e8b84b]' : ''}`}>
                          {epNum}. {episode.name || `Episode ${epNum}`}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">
                        {[episode.runtime > 0 ? `${episode.runtime}m` : null, airDateLabel].filter(Boolean).join(' · ')}
                      </span>
                      <p className="hidden sm:block text-xs text-gray-400 line-clamp-2 mt-1">
                        {episode.overview || 'No description available.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default React.memo(Stream);