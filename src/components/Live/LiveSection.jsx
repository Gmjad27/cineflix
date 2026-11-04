import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RailRow from '../RailRow/RailRow';
import LiveMatchCard from './LiveMatchCard';
import LiveTVCard from './LiveTVCard';
import {
  fetchLiveStreamsData,
  flattenLiveMatches,
  LIVE_TV_CHANNELS,
} from '../../content/liveStreams';
const LiveSection = ({
  showChannels = true,
  title = 'Live Sports & Matches',
  subtitle = 'Watch thrilling live tournaments, leagues and 24/7 sports channels',
}) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Fetch Live Data
  const loadStreams = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const response = await fetchLiveStreamsData();
      setData(response);
    } catch (err) {
      console.error('Error fetching live streams:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setIsRefreshing(false), 500);
    }
  };
  useEffect(() => {
    loadStreams();
  }, []);
  const allMatches = useMemo(() => flattenLiveMatches(data), [data]);
  // Categories
  const categories = useMemo(() => {
    const set = new Set(['all']);
    allMatches.forEach((m) => {
      if (m.category_name) set.add(m.category_name.toLowerCase());
    });
    return Array.from(set);
  }, [allMatches]);
  // Filtered matches
  const filteredMatches = useMemo(() => {
    if (selectedCategory === 'all') return allMatches;
    return allMatches.filter(
      (m) => m.category_name?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [allMatches, selectedCategory]);
  const categoryLabels = {
    all: 'All Sports',
    football: 'Football',
    cricket: 'Cricket',
    basketball: 'Basketball',
    motorsport: 'Formula 1',
    tennis: 'Tennis',
  };
  const handleOpenStream = (stream) => {
    navigate(`/live-stream/${stream.id}`, { state: { stream } });
  };
  return (
    <section className="relative z-20 flex flex-col space-y-4 my-4 sm:my-6">
      {/* ── Top Bar: Subtitle & Category Pills & Refresh ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 md:px-0">
        <div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {/* Category Pills & Refresh Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto scrollbar-none pb-1 max-w-full">
          <button
            type="button"
            onClick={() => loadStreams(true)}
            disabled={isRefreshing}
            title="Refresh Live Streams"
            aria-label="Refresh Live Streams"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-colors shrink-0"
          >
            <i className={`fa-solid fa-arrows-rotate text-[11px] ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${isActive
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                  }`}
              >
                {categoryLabels[cat] || cat.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
      {/* ── 1. Live Matches Rail (Using RailRow Component) ── */}
      {loading ? (
        <div className="flex items-center gap-3 overflow-hidden py-4 px-2 md:px-0">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex-shrink-0 w-[240px] xs:w-[260px] sm:w-[290px] md:w-[320px] aspect-video rounded-lg bg-[#202020] animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : filteredMatches.length > 0 ? (
        <RailRow
          titleAlt={
            <div className="flex items-center gap-2 text-[15px] sm:text-xl md:text-2xl font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_6px_#e50914] shrink-0" />
              <span>{title}</span>
            </div>
          }
          items={filteredMatches}
          eager={true}
          renderItem={(match) => (
            <LiveMatchCard
              key={match.id}
              match={match}
              onSelect={handleOpenStream}
            />
          )}
        />
      ) : (
        <div className="w-full py-8 text-center text-gray-400 text-xs sm:text-sm">
          No live matches available in this category right now.
        </div>
      )}
      {/* ── 2. 24/7 Live Sports TV Channels Rail (Using RailRow Component) ── */}
      {showChannels && (
        <div className="pt-2">
          <RailRow
            titleAlt={
              <div className="flex items-center gap-2 text-[15px] sm:text-xl md:text-2xl font-bold">
                <i className="fa-solid fa-satellite-dish text-red-500 text-sm sm:text-base shrink-0" />
                <span>Live TV Channels</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 ml-1">
                  24/7
                </span>
              </div>
            }
            items={LIVE_TV_CHANNELS}
            eager={true}
            renderItem={(ch) => (
              <LiveTVCard
                key={ch.id}
                channel={ch}
                onSelect={() =>
                  handleOpenStream({
                    id: ch.id,
                    name: ch.name,
                    embedUrl: ch.embed,
                    category_name: ch.category,
                    viewers: ch.viewers,
                    sources: [
                      {
                        id: ch.id,
                        name: ch.name,
                        embed: ch.embed,
                        hd: 1,
                      },
                    ],
                  })
                }
              />
            )}
          />
        </div>
      )}
    </section>
  );
};
export default React.memo(LiveSection);