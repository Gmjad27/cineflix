import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveContinueWatching } from '../../utils/continueWatching';

const SERVERS = [
  {
    id: 'server1',
    name: 'IQSmart',
    getTvUrl: (id, s, e) => `https://screenscape.me/embed?tmdb=${id}&type=tv&s=${s}&e=${e}&lan=hindi`,
    getMovieUrl: (id) => `https://screenscape.me/embed?tmdb=${id}&type=movie&lan=hindi`
  },
  {
    id: 'server2',
    name: 'IQSmart',
    getTvUrl: (id, s, e) => `https://streams.iqsmartgames.com/embed/tv/${id}/${s}/${e}?key=e11a7debaaa4f5d25b671706ffe4d2acb56efbd4`,
    getMovieUrl: (id) => `https://streams.iqsmartgames.com/embed/movie/${id}?key=e11a7debaaa4f5d25b671706ffe4d2acb56efbd4`
  },
  {
    id: 'server3',
    name: 'Nxsha',
    getTvUrl: (id, s, e) => `https://yapgrid.com/embed/tv/${id}/${s}/${e}?dub=Hindi&sub=English`,
    getMovieUrl: (id) => `https://yapgrid.com/embed/movie/${id}?dub=Hindi&sub=English`
  },
  {
    id: 'server4',
    name: 'Modiplay',
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

// SVG Icons
const Icons = {
  Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>,
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Play: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
  ChevronDown: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
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

  useEffect(() => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
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

  if (!src) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4">
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center max-w-md w-full backdrop-blur-sm">
          <p className="text-xl font-medium mb-6 text-white/90">No stream selected</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-[#e8b84b] text-black rounded-xl font-bold hover:bg-[#f3c863] transition-all duration-200 shadow-[0_0_20px_rgba(232,184,75,0.3)] hover:shadow-[0_0_25px_rgba(232,184,75,0.5)]"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#e8b84b] selection:text-black">

      {/* Cinematic Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-gradient-to-b from-black/90 to-transparent sticky top-0 z-40 transition-all">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all flex-shrink-0"
            aria-label="Back"
          >
            <Icons.Back />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-xl font-bold truncate tracking-tight text-white/95">
              {title}
            </h1>
            {streamType === 'tv' && (
              <span className="text-xs sm:text-sm text-[#e8b84b] font-medium tracking-wide">
                Season {currentSeason} • Episode {currentEpisode}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 hidden md:flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all flex-shrink-0"
          aria-label="Home"
        >
          <Icons.Home />
        </button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:px-8 pb-12 max-w-[1800px] mx-auto w-full">

        {/* Left Column: Player & Meta */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Player Container */}
          <div className="relative w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/5 ring-1 ring-white/10">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-10 gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-[#e8b84b] rounded-full animate-spin" />
                <span className="text-sm font-medium text-white/60 animate-pulse">Connecting to stream...</span>
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

          {/* Player Controls & Info */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6 bg-white/[0.02] border border-white/5 rounded-2xl p-5 backdrop-blur-sm">

            {/* Context Info */}
            <div className="flex-1 min-w-0">
              {streamType === 'tv' && activeEpisodeData ? (
                <>
                  <h2 className="text-lg sm:text-xl font-bold text-white/95 truncate">
                    {activeEpisodeData.name || `Episode ${currentEpisode}`}
                  </h2>
                  <p className="text-sm text-white/50 leading-relaxed mt-1.5 line-clamp-2 max-w-3xl">
                    {activeEpisodeData.overview || 'No description available for this episode.'}
                  </p>
                </>
              ) : (
                <div className="flex items-center h-full">
                  <h2 className="text-xl font-bold text-white/95">Playing Movie</h2>
                </div>
              )}
            </div>

            {/* Actions (Next Ep) */}
            {hasNextEpisode && (
              <button
                onClick={handleNextEpisode}
                className="group flex items-center justify-center gap-2 px-6 py-2.5 bg-[#e8b84b]/10 hover:bg-[#e8b84b]/20 border border-[#e8b84b]/30 rounded-xl text-[#e8b84b] font-medium transition-all flex-shrink-0"
              >
                <span>Next Episode</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            )}
          </div>

          {/* Server Selection */}
          <div className="mt-6">
            <span className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 block">Streaming Server</span>
            <div className="inline-flex flex-wrap gap-2 p-1.5 bg-white/5 rounded-xl border border-white/10">
              {SERVERS.map((server) => (
                <button
                  key={server.id}
                  onClick={() => setActiveServer(server)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeServer.id === server.id
                    ? 'bg-[#e8b84b] text-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {server.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Episodes Toggle */}
          {streamType === 'tv' && passedEpisodes.length > 0 && (
            <button
              onClick={() => setShowEpisodesMobile((prev) => !prev)}
              className="mt-6 flex items-center justify-between lg:hidden w-full px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-colors"
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-white/90">Season {currentSeason} Episodes</span>
                <span className="text-xs font-normal text-white/50">{passedEpisodes.length} Episodes available</span>
              </div>
              <Icons.ChevronDown className={`transition-transform duration-300 ${showEpisodesMobile ? 'rotate-180 text-[#e8b84b]' : 'text-white/40'}`} />
            </button>
          )}
        </div>

        {/* Right Column: Episodes Sidebar (TV only) */}
        {streamType === 'tv' && passedEpisodes.length > 0 && (
          <aside className={`w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${showEpisodesMobile ? 'opacity-100 max-h-[1000px] mt-4 lg:mt-0' : 'opacity-0 max-h-0 overflow-hidden lg:opacity-100 lg:max-h-full lg:overflow-visible'}`}>

            <div className="hidden lg:flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold text-white/90 tracking-wide">Episodes</h3>
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-medium text-white/70">
                Season {currentSeason}
              </span>
            </div>

            <div className="flex-1 space-y-2.5 max-h-[65vh] lg:max-h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
              {passedEpisodes.map((episode, index) => {
                const epNum = episode.number || index + 1;
                const isActive = currentEpisode === epNum;
                const airDateLabel = formatAirDate(episode.airDate);
                const isNew = isRecentlyAired(episode.airDate);

                return (
                  <div
                    key={episode.id != null ? `ep-${episode.id}` : `ep-idx-${index}`}
                    ref={isActive ? activeCardRef : null}
                    className={`group flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${isActive
                      ? 'bg-gradient-to-r from-white/10 to-transparent border-[#e8b84b]/40 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                      : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                      }`}
                    onClick={() => handleEpisodeChange(epNum)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEpisodeChange(epNum);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    {/* Thumbnail */}
                    <div className="w-28 h-20 rounded-lg bg-[#1a1a1a] flex-shrink-0 relative overflow-hidden ring-1 ring-white/10 shadow-inner">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url('${episode.image || defaultImage}')` }}
                      />

                      {isNew && !isActive && (
                        <div className="absolute top-1.5 left-1.5 bg-[#e8b84b] text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wider uppercase">
                          New
                        </div>
                      )}

                      {/* Hover / Active Overlay */}
                      <div className={`absolute inset-0 flex items-center justify-center transition-all ${isActive ? 'bg-black/50 backdrop-blur-[2px]' : 'bg-black/20 opacity-0 group-hover:opacity-100'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-[#e8b84b] text-black' : 'bg-white/20 text-white backdrop-blur-md'}`}>
                          {isActive ? <span className="animate-pulse w-2 h-2 rounded-full bg-black" /> : <Icons.Play />}
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className={`text-sm font-semibold truncate mb-1 ${isActive ? 'text-[#e8b84b]' : 'text-white/90 group-hover:text-white'}`}>
                        {epNum}. {episode.name || `Episode ${epNum}`}
                      </h4>

                      <div className="flex items-center gap-2 text-xs font-medium text-white/40 mb-1.5">
                        {episode.runtime > 0 && (
                          <span className="flex items-center gap-1">
                            {episode.runtime}m
                          </span>
                        )}
                        {episode.runtime > 0 && airDateLabel && <span className="w-1 h-1 rounded-full bg-white/20" />}
                        {airDateLabel && <span>{airDateLabel}</span>}
                      </div>

                      <p className="text-xs text-white/50 line-clamp-2 leading-relaxed hidden sm:block">
                        {episode.overview || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* Tailwind specific custom styles for scrollbar injected globally or inside your index.css ideally */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default React.memo(Stream);