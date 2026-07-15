import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveContinueWatching } from '../../utils/continueWatching';

// Define your available iframe sources here dynamically
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

const Stream = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const activeCardRef = useRef(null);
  const queryParams = new URLSearchParams(location.search);

  const navState = location.state || {};
  const title = queryParams.get('title') || navState.name || 'Stream';
  const episodesString = queryParams.get('episodes');

  // Safely parse episodes
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
  const streamId = queryParams.get('tmdb') || props.tid || '';

  // Parse stream ID
  const parts = streamId.split('/');
  const streamType = parts[0] ? parts[0].toLowerCase() : '';
  const id = parts[1] || '';

  // TV state
  const [currentSeason, setCurrentSeason] = useState(
    parts[2] ? parseInt(parts[2], 10) : (Number(queryParams.get('currentSeason')) || 1)
  );
  const [currentEpisode, setCurrentEpisode] = useState(
    parts[3] ? parseInt(parts[3], 10) : 1
  );

  // Server state
  const [activeServer, setActiveServer] = useState(SERVERS[0]);

  // Video source calculated dynamically based on activeServer state
  const src = useMemo(() => {
    if (!streamType || !id) return '';
    if (streamType === 'tv') {
      return activeServer.getTvUrl(id, currentSeason, currentEpisode);
    }
    return activeServer.getMovieUrl(id);
  }, [streamType, id, currentSeason, currentEpisode, activeServer]);

  // Reset loader on src change
  useEffect(() => {
    if (src) setIsLoading(true);
  }, [src]);

  // Responsive detection
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

  // Scroll active episode into view
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

  // Keep the resume list in this (parent) origin
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

  if (!src) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <p className="text-xl mb-4">No stream selected.</p>
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
      <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white text-xl" aria-label="Back">
            ←
          </button>
          <h1 className="text-lg font-semibold truncate max-w-[200px] md:max-w-sm">{title}</h1>
          {streamType === 'tv' && (
            <span className="text-sm text-gray-400 whitespace-nowrap">
              S{currentSeason} E{currentEpisode}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-white/70 hover:text-white text-sm hidden md:block"
        >
          Home
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {/* Video player area */}
        <div className="flex-1 flex flex-col">
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
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

          {/* Dynamic Server Selection & Next Episode Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            {/* Server Selector */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400 self-center mr-2">Servers:</span>
              {SERVERS.map((server) => (
                <button
                  key={server.id}
                  onClick={() => setActiveServer(server)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeServer.id === server.id
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {server.name}
                </button>
              ))}
            </div>

            {/* Next Episode button */}
            {hasNextEpisode && (
              <button
                onClick={handleNextEpisode}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition backdrop-blur-md"
              >
                Next Episode <span className="text-xs">→</span>
              </button>
            )}
          </div>
        </div>

        {/* Episodes sidebar (TV only) */}
        {streamType === 'tv' && passedEpisodes.length > 0 && (
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Season {currentSeason}</h3>
              <span className="text-sm text-gray-400">{passedEpisodes.length} episodes</span>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {passedEpisodes.map((episode, index) => {
                const epNum = episode.number || index + 1;
                const isActive = currentEpisode === epNum;
                return (
                  <div
                    key={episode.id != null ? `ep-${episode.id}` : `ep-idx-${index}`}
                    ref={isActive ? activeCardRef : null}
                    className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-white/10 border border-white/20'
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
                      className="w-24 h-14 md:w-28 md:h-16 rounded-md bg-cover bg-center flex-shrink-0 relative"
                      style={{ backgroundImage: `url('${episode.image || defaultImage}')` }}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xl">
                          ▶
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">
                          {epNum}. {episode.name || `Episode ${epNum}`}
                        </span>
                        {episode.runtime > 0 && (
                          <span className="text-xs text-gray-400 whitespace-nowrap">{episode.runtime}m</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">
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