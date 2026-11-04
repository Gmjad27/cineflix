import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import RailRow from '../../components/RailRow/RailRow';
import LiveMatchCard from '../../components/Live/LiveMatchCard';
import {
  fetchLiveStreamsData,
  flattenLiveMatches,
  LIVE_TV_CHANNELS,
  formatViewerCount,
} from '../../content/liveStreams';

const LiveStreaming = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [allMatches, setAllMatches] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [streamData, setStreamData] = useState(() => location.state?.stream || null);

  // Landscape orientation lock on mobile devices
  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px) and (pointer: coarse)');
    const isMobile = mobileQuery.matches;
    const orientation = window.screen.orientation;

    if (!isMobile || !orientation?.lock) return undefined;

    orientation.lock('landscape').catch(() => { });
    return () => {
      if (orientation.unlock) {
        orientation.unlock();
      }
    };
  }, []);

  // Fetch or resolve stream details if not provided in location.state
  useEffect(() => {
    let active = true;
    const resolveStream = async () => {
      try {
        const res = await fetchLiveStreamsData();
        const matches = flattenLiveMatches(res);
        if (!active) return;
        setAllMatches(matches);

        // Find match or TV channel by ID
        const match = matches.find((m) => String(m.id) === String(streamId));
        if (match) {
          setStreamData(match);
          return;
        }

        const channel = LIVE_TV_CHANNELS.find((ch) => String(ch.id) === String(streamId));
        if (channel) {
          setStreamData({
            id: channel.id,
            name: channel.name,
            embed: channel.embed,
            category_name: channel.category,
            viewers: channel.viewers,
            sources: [{ id: channel.id, name: channel.name, embed: channel.embed, hd: 1 }],
          });
          return;
        }

        // Fallback default stream
        if (!streamData) {
          setStreamData({
            id: streamId,
            name: 'Live Stream',
            embed: `https://damitv.st/embed/?id=${streamId}`,
            status: 'live',
          });
        }
      } catch (err) {
        console.error('Failed to resolve live stream:', err);
      }
    };

    resolveStream();
    return () => {
      active = false;
    };
  }, [streamId]);

  // Reset selected source when streamId changes
  useEffect(() => {
    setSelectedSource(null);
  }, [streamId]);

  const defaultEmbed =
    streamData?.embedUrl ||
    streamData?.embed ||
    (streamId ? `https://damitv.st/embed/?id=${streamId}` : '');
  const sources = Array.isArray(streamData?.sources) ? streamData.sources : [];
  const currentEmbedUrl = selectedSource ? selectedSource.embed : defaultEmbed;

  const isMatch = Boolean(streamData?.teams?.home && streamData?.teams?.away);
  const otherMatches = useMemo(
    () => allMatches.filter((m) => String(m.id) !== String(streamId)),
    [allMatches, streamId]
  );

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col select-none">
      {/* ── Top Bar with Back Navigation & Feed Switcher ── */}
      <header className="h-12 sm:h-14 md:h-16 bg-[#121212] border-b border-white/10 px-3 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back to browse"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            <span className="hidden xs:inline">Back</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-red-600 shrink-0 shadow-[0_0_6px_#e50914]" />
            <h1 className="text-xs sm:text-sm md:text-base font-bold text-white truncate max-w-[130px] xs:max-w-[200px] sm:max-w-md md:max-w-xl">
              {streamData?.name || 'Live Sports Stream'}
            </h1>
          </div>
        </div>

        {/* Viewers & League */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          {streamData?.league && (
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 font-medium text-[11px]">
              {streamData.league}
            </span>
          )}
          {streamData?.viewers > 0 && (
            <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-300 font-semibold text-[10px] sm:text-xs">
              <i className="fa-solid fa-users text-[9px] sm:text-[10px]" />
              {formatViewerCount(streamData.viewers)}
              <span className="hidden xs:inline"> Live</span>
            </span>
          )}
        </div>
      </header>

      {/* ── Feed Selector Strip (if sources exist) ── */}
      {sources.length > 0 && (
        <nav className="bg-[#161616] border-b border-white/5 px-3 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap mr-1 flex items-center gap-1.5">
            <i className="fa-solid fa-satellite-dish text-red-500 text-[11px]" />
            Broadcast Feeds:
          </span>

          {defaultEmbed && (
            <button
              type="button"
              onClick={() => setSelectedSource(null)}
              className={`px-2.5 sm:px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${selectedSource === null
                ? 'bg-[#E50914] text-white shadow'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
            >
              <span>Main Stadium Feed</span>
              <span className="text-[10px] px-1 rounded bg-black/40 text-amber-300 font-bold">HD</span>
            </button>
          )}

          {sources.map((src, idx) => {
            const isActive = selectedSource?.id === src.id;
            return (
              <button
                key={src.id || idx}
                type="button"
                onClick={() => setSelectedSource(src)}
                className={`px-2.5 sm:px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${isActive
                  ? 'bg-[#E50914] text-white shadow'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
              >
                <i className="fa-solid fa-tv text-[10px]" />
                <span>{src.name || `Source ${idx + 1}`}</span>
                {src.hd === 1 && (
                  <span className="text-[10px] px-1 rounded bg-black/40 text-amber-300 font-bold">
                    HD
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── Main Video Player Viewport ── */}
      <main className="relative flex-1 w-full bg-black h-[30vh] sm:min-h-[50vh] md:min-h-[65vh] max-h-[82vh]">
        {currentEmbedUrl ? (
          <iframe
            src={currentEmbedUrl}
            className="absolute inset-0 w-full h-full border-none"
            allowFullScreen
            allow="accelerometer; autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope;"
            title={streamData?.name || 'Live Sports Player'}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 gap-3 p-8">
            <i className="fa-solid fa-spinner animate-spin text-3xl text-red-500" />
            <p className="text-sm font-medium">Connecting to live broadcast...</p>
          </div>
        )}
      </main>

      {/* ── Match Info & Related Streams Footer Strip ── */}
      <footer className="bg-[#121212] border-t border-white/10 p-3 sm:p-5 md:p-6 shrink-0 space-y-4">
        {isMatch && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-lg bg-[#181818] border border-white/5">
            {/* Teams Confrontation */}
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              <div className="flex items-center gap-2">
                {streamData.teams.home.badge && (
                  <img
                    src={streamData.teams.home.badge}
                    alt={streamData.teams.home.name}
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                  />
                )}
                <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[110px] sm:max-w-none">
                  {streamData.teams.home.name}
                </span>
              </div>

              <span className="text-[10px] sm:text-xs font-black text-red-500 bg-red-950/60 px-1.5 sm:px-2 py-0.5 rounded border border-red-500/30">
                VS
              </span>

              <div className="flex items-center gap-2">
                {streamData.teams.away.badge && (
                  <img
                    src={streamData.teams.away.badge}
                    alt={streamData.teams.away.name}
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                  />
                )}
                <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[110px] sm:max-w-none">
                  {streamData.teams.away.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              {streamData.league && (
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] sm:text-xs">
                  {streamData.league}
                </span>
              )}
              <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Broadcast
              </span>
            </div>
          </div>
        )}

        {/* Other Matches Rail using RailRow */}
        {otherMatches.length > 0 && (
          <div className="pt-1">
            <RailRow
              titleAlt={
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider">
                  <i className="fa-solid fa-play text-red-500 text-[10px]" />
                  <span>Switch to Other Live Matches</span>
                </div>
              }
              items={otherMatches}
              eager={true}
              renderItem={(m) => (
                <LiveMatchCard
                  match={m}
                  onSelect={() => navigate(`/live-stream/${m.id}`, { state: { stream: m } })}
                />
              )}
            />
          </div>
        )}
      </footer>
    </div>
  );
};

export default React.memo(LiveStreaming);
