import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RailRow from '../RailRow/RailRow';
import LiveTVCard from './LiveTVCard';
import LiveMatchCard from './LiveMatchCard';
import {
  LIVE_CHANNELS,
  fetchLiveStreamsData,
  getCachedLiveMatches,
} from '../../content/liveStreams';

const CHANNEL_CATEGORIES = [
  { id: 'all', label: 'All Channels', match: () => true },
  {
    id: 'cricket',
    label: 'Cricket',
    match: (ch) =>
      ch.category?.toLowerCase().includes('cricket') ||
      ch.name?.toLowerCase().includes('cricket') ||
      ['Willow', 'Astro'].includes(ch.network),
  },
  { id: 'sony', label: 'Sony Sports', match: (ch) => ch.network === 'Sony Sports' },
  { id: 'sky', label: 'Sky Sports', match: (ch) => ch.network === 'Sky Sports' },
  { id: 'tnt', label: 'TNT Sports', match: (ch) => ch.network === 'TNT Sports' },
  { id: 'fox', label: 'Fox Sports', match: (ch) => ch.network === 'Fox Sports' },
];

const LiveSection = ({
  title = 'Live Sports & Matches',
  subtitle = 'Watch live sports matches & 24/7 channels in HD',
  defaultTab = 'matches',
  showAllLink = true,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab); // 'matches' | 'channels'
  const [matches, setMatches] = useState(() => getCachedLiveMatches());
  const [channels] = useState(LIVE_CHANNELS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch live streams from API on mount
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await fetchLiveStreamsData();
      if (Array.isArray(data.matches) && data.matches.length > 0) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error('Failed to load live sports data:', err);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh match list every 90 seconds
    const interval = setInterval(() => loadData(), 90000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Dynamically derive sport categories from actual matches
  const sportCategories = useMemo(() => {
    const set = new Set();
    matches.forEach((m) => {
      const cat = m.category_name || m.category;
      if (cat) set.add(cat.toLowerCase().trim());
    });

    const list = [{ id: 'all', label: 'All Sports' }];
    set.forEach((cat) => {
      let label = cat
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      if (cat === 'american-football') label = 'American Football';
      if (cat === 'football') label = 'Football (Soccer)';
      list.push({ id: cat, label });
    });
    return list;
  }, [matches]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return matches.filter((m) => {
      if (selectedSport !== 'all') {
        const cat = (m.category_name || m.category || '').toLowerCase();
        if (cat !== selectedSport) return false;
      }
      if (!q) return true;
      const home = (m.teams?.home?.name || '').toLowerCase();
      const away = (m.teams?.away?.name || '').toLowerCase();
      const name = (m.name || '').toLowerCase();
      const league = (m.league || '').toLowerCase();
      return home.includes(q) || away.includes(q) || name.includes(q) || league.includes(q);
    });
  }, [matches, selectedSport, searchQuery]);

  // Filter channels
  const filteredChannels = useMemo(() => {
    const activeCategory = CHANNEL_CATEGORIES.find((c) => c.id === selectedNetwork);
    const q = searchQuery.toLowerCase().trim();

    return channels.filter((ch) => {
      const matchesCategory = activeCategory ? activeCategory.match(ch) : true;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        ch.name?.toLowerCase().includes(q) ||
        ch.category?.toLowerCase().includes(q) ||
        ch.network?.toLowerCase().includes(q) ||
        String(ch.streamId ?? '').includes(q)
      );
    });
  }, [channels, selectedNetwork, searchQuery]);

  const handleOpenStream = useCallback(
    (item) => {
      navigate(`/live-stream/${item.streamId || item.id}`, {
        state: { stream: item },
      });
    },
    [navigate]
  );

  return (
    <section className="relative z-20 flex flex-col gap-3 sm:gap-4 my-4 sm:my-6">
      {/* ── Section Title & Mode Tabs Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 sm:px-4 md:px-0">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 shadow-[0_0_8px_#e50914]" />
            </span>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {title}
            </h2>
            <span className="text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 shrink-0">
              {activeTab === 'matches' ? `${filteredMatches.length} Matches` : `${filteredChannels.length} Channels`}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-400 mt-1 pl-5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Controls & Navigation Link */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          {/* Matches vs Channels Tab Switcher */}
          <div className="flex items-center bg-black/60 p-1 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'matches'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-trophy text-[11px]" />
              <span>Live Matches</span>
              <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-black/40">
                {matches.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('channels')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'channels'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-satellite-dish text-[11px]" />
              <span>24/7 Channels</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadData(true)}
            title="Refresh Live Streams"
            disabled={isRefreshing}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
          >
            <i className={`fa-solid fa-arrows-rotate text-xs ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
          </button>

          {/* View All Live Link */}
          {showAllLink && (
            <Link
              to="/live"
              className="hidden xs:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <span>Sports Hub</span>
              <i className="fa-solid fa-chevron-right text-[10px]" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Filter Pills Strip ── */}
      <div className="flex items-center gap-2 px-3 sm:px-4 md:px-0 overflow-x-auto scrollbar-none py-1">
        {activeTab === 'matches'
          ? sportCategories.map((cat) => {
              const isActive = selectedSport === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedSport(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 select-none transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-[0_2px_10px_rgba(229,9,20,0.35)]'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })
          : CHANNEL_CATEGORIES.map((cat) => {
              const isActive = selectedNetwork === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedNetwork(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 select-none transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-[0_2px_10px_rgba(229,9,20,0.35)]'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
      </div>

      {/* ── Content Rails ── */}
      {activeTab === 'matches' ? (
        filteredMatches.length > 0 ? (
          <RailRow
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
          <div className="mx-3 sm:mx-4 md:mx-0 py-8 px-4 text-center text-gray-400 bg-neutral-900/50 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
            <i className="fa-solid fa-trophy text-2xl text-gray-500 mb-2" />
            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              No live matches found in this category.
            </p>
            <button
              type="button"
              onClick={() => setSelectedSport('all')}
              className="mt-3 px-3 py-1 rounded bg-white/10 text-white text-xs hover:bg-white/20"
            >
              Show All Matches
            </button>
          </div>
        )
      ) : (
        filteredChannels.length > 0 ? (
          <RailRow
            items={filteredChannels}
            eager={true}
            renderItem={(channel) => (
              <LiveTVCard
                key={channel.id}
                channel={channel}
                onSelect={handleOpenStream}
              />
            )}
          />
        ) : (
          <div className="mx-3 sm:mx-4 md:mx-0 py-8 px-4 text-center text-gray-400 bg-neutral-900/50 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
            <i className="fa-solid fa-tv text-2xl text-gray-500 mb-2" />
            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              No live channels found in this category.
            </p>
            <button
              type="button"
              onClick={() => setSelectedNetwork('all')}
              className="mt-3 px-3 py-1 rounded bg-white/10 text-white text-xs hover:bg-white/20"
            >
              Show All Channels
            </button>
          </div>
        )
      )}
    </section>
  );
};

export default React.memo(LiveSection);
